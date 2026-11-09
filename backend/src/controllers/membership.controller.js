import mongoose from 'mongoose';
import { Membership, User, FeeInvoice, AuditLog, Payment } from '../models/index.js';
import {
  calculateNextBillingDate,
  generateInvoiceNumber,
  generateReceiptNumber,
  calculateDueDate,
  formatDateKey,
} from '../utils/billingCalculator.js';
import { allocatePayment } from '../utils/paymentAllocation.js';
import { uploadToImageKit } from '../services/imagekit.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import logger from '../utils/logger.js';

/**
 * List all memberships with filtering, search, and pagination (Admin only)
 */
export async function listMemberships(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1 && process.env.NODE_ENV !== 'test') {
      return successResponse(res, {
        memberships: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });
    }

    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      const matchingUsers = await User.find({
        $or: [{ name: regex }, { email: regex }, { phone: regex }],
      }).select('_id');
      const userIds = matchingUsers.map((u) => u._id);
      query.userId = { $in: userIds };
    }

    const [memberships, total] = await Promise.all([
      Membership.find(query)
        .populate(
          'userId',
          'name email phone picture isMember fatherName emergencyContact address targetExam aadharFrontUrl aadharBackUrl'
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Membership.countDocuments(query),
    ]);

    // Enrich memberships with billing status & advance payment tracking
    const membershipIds = memberships.map((m) => m._id);
    const allInvoices = await FeeInvoice.find({ membershipId: { $in: membershipIds } })
      .sort({ billingPeriodEnd: -1 })
      .lean();

    const now = new Date();
    const enrichedMemberships = memberships.map((m) => {
      const memberInvoices = allInvoices.filter((inv) => String(inv.membershipId) === String(m._id));
      const unpaidInvoices = memberInvoices.filter((inv) => (inv.balanceInPaise || 0) > 0);
      const totalDuePaise = unpaidInvoices.reduce((sum, inv) => sum + (inv.balanceInPaise || 0), 0);

      const paidInvoices = memberInvoices.filter((inv) => inv.status === 'paid');
      const latestPaidInvoice = paidInvoices[0] || null;

      let isAdvancePaid = false;
      let paidUntil = null;

      if (latestPaidInvoice) {
        paidUntil = latestPaidInvoice.billingPeriodEnd;
        const periodStart = new Date(latestPaidInvoice.billingPeriodStart);
        const periodEnd = new Date(paidUntil);
        // If billing period starts after today or extends well into the next month, or marked as advance in notes
        if (
          periodStart > now ||
          periodEnd.getTime() > now.getTime() + 25 * 24 * 60 * 60 * 1000 ||
          (latestPaidInvoice.notes && latestPaidInvoice.notes.toLowerCase().includes('advance'))
        ) {
          isAdvancePaid = true;
        }
      }

      return {
        ...m,
        billingSummary: {
          totalDuePaise,
          unpaidCount: unpaidInvoices.length,
          paidUntil,
          isAdvancePaid,
          latestInvoice: memberInvoices[0] || null,
        },
      };
    });

    return successResponse(res, {
      memberships: enrichedMemberships,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    logger.error(`Error in listMemberships: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Get membership details by ID
 */
export async function getMembershipById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Invalid membership ID', 400);
    }

    const membership = await Membership.findById(id).populate('userId').lean();
    if (!membership) {
      return errorResponse(res, 'Membership not found', 404);
    }

    if (req.user.role === 'student' && String(membership.userId._id) !== String(req.user._id)) {
      return errorResponse(res, 'Access denied', 403);
    }

    const invoices = await FeeInvoice.find({ membershipId: id }).sort({ billingPeriodStart: -1 }).lean();
    const totalDuesInPaise = invoices.reduce((sum, inv) => sum + (inv.balanceInPaise || 0), 0);

    return successResponse(res, {
      membership,
      invoices,
      totalDuesInPaise,
    });
  } catch (err) {
    logger.error(`Error in getMembershipById: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Create/Register a new member
 */
export async function createMembership(req, res, next) {
  try {
    const {
      userId,
      email,
      name,
      phone,
      joiningDate,
      monthlyFeeInPaise,
      planId = 'day-shift',
      planName = 'Day Shift Plan (7:00 AM – 8:00 PM)',
      slotType = 'DAY',
      shiftTimings = '7:00 AM - 8:00 PM',
      notes = '',
      initialPaymentInPaise = 0,
      paymentMethod = 'CASH',
      referenceNumber = '',
      fatherName = '',
      emergencyContact = '',
      address = '',
      targetExam = '',
      aadharFront = '',
      aadharBack = '',
      photo = '',
      studentPhoto = '',
    } = req.body;

    if (!monthlyFeeInPaise || monthlyFeeInPaise <= 0) {
      return errorResponse(res, 'Monthly fee must be a positive integer in paise (e.g. 50000 for ₹500)', 400);
    }

    const parsedJoiningDate = joiningDate ? new Date(joiningDate) : new Date();
    if (isNaN(parsedJoiningDate.getTime())) {
      return errorResponse(res, 'Invalid joining date format', 400);
    }

    let targetUser = null;
    if (userId) {
      targetUser = await User.findById(userId);
    } else if (email) {
      targetUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (!targetUser) {
        targetUser = await User.create({
          name: name || email.split('@')[0],
          email: email.toLowerCase().trim(),
          phone: phone || '',
          fatherName: fatherName || '',
          emergencyContact: emergencyContact || '',
          address: address || '',
          targetExam: targetExam || '',
          role: 'student',
          isMember: true,
          isActive: true,
          registrationStatus: 'APPROVED',
        });
      }
    }

    if (!targetUser) {
      return errorResponse(res, 'User ID or valid email is required to assign membership', 400);
    }

    // Process Aadhar and Student Photo uploads to ImageKit if provided
    try {
      const safePrefix = targetUser.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_');
      const ts = Date.now();
      const rawPhoto = photo || studentPhoto;
      if (rawPhoto) {
        const photoRes = await uploadToImageKit(
          rawPhoto,
          `desk_photo_${safePrefix}_${ts}.jpg`,
          '/libraryhub/photos'
        );
        targetUser.picture = photoRes.url;
      }
      if (aadharFront && !targetUser.aadharFrontUrl) {
        const frontRes = await uploadToImageKit(
          aadharFront,
          `desk_aadhar_front_${safePrefix}_${ts}.jpg`,
          '/libraryhub/aadhar'
        );
        targetUser.aadharFrontUrl = frontRes.url;
      }
      if (aadharBack && !targetUser.aadharBackUrl) {
        const backRes = await uploadToImageKit(
          aadharBack,
          `desk_aadhar_back_${safePrefix}_${ts}.jpg`,
          '/libraryhub/aadhar'
        );
        targetUser.aadharBackUrl = backRes.url;
      }
    } catch (uploadErr) {
      logger.warn(`Could not upload desk documents to ImageKit: ${uploadErr.message}`);
    }

    if (fatherName) targetUser.fatherName = fatherName;
    if (emergencyContact) targetUser.emergencyContact = emergencyContact;
    if (address) targetUser.address = address;
    if (targetExam) targetUser.targetExam = targetExam;
    targetUser.registrationStatus = 'APPROVED';
    targetUser.isActive = true;

    const existingActive = await Membership.findOne({ userId: targetUser._id, status: 'active' });
    if (existingActive) {
      return errorResponse(res, 'This user already has an active membership. Deactivate it first before creating a new one.', 409);
    }

    const anchorDay = parsedJoiningDate.getDate();
    const nextBillDate = calculateNextBillingDate(parsedJoiningDate, anchorDay);

    const membership = await Membership.create({
      userId: targetUser._id,
      planId,
      planName,
      slotType,
      shiftTimings,
      joiningDate: parsedJoiningDate,
      billingAnchorDay: anchorDay,
      monthlyFeeInPaise,
      status: 'active',
      notes,
    });

    targetUser.isMember = true;
    targetUser.currentMembership = membership._id;
    await targetUser.save();

    // Create the first billing cycle invoice
    const periodEnd = new Date(nextBillDate.getTime() - 24 * 60 * 60 * 1000);
    const invoiceNumber = generateInvoiceNumber('INV', new Date());
    const dueDate = calculateDueDate(parsedJoiningDate, 7);
    const periodKey = `${membership._id}_${formatDateKey(parsedJoiningDate)}`;

    const initialInvoice = await FeeInvoice.create({
      invoiceNumber,
      membershipId: membership._id,
      userId: targetUser._id,
      periodKey,
      billingPeriodStart: parsedJoiningDate,
      billingPeriodEnd: periodEnd,
      issueDate: parsedJoiningDate,
      dueDate,
      feeAmountInPaise: monthlyFeeInPaise,
      adjustmentsInPaise: 0,
      amountPaidInPaise: 0,
      balanceInPaise: monthlyFeeInPaise,
      status: 'unpaid',
      notes: 'Initial enrollment billing cycle invoice',
    });

    let allocation = null;
    const initialPayPaise = parseInt(initialPaymentInPaise, 10);
    const adminId = (req.user && req.user._id)
      ? req.user._id
      : (req.user && req.user.id && mongoose.Types.ObjectId.isValid(req.user.id))
        ? new mongoose.Types.ObjectId(req.user.id)
        : new mongoose.Types.ObjectId('507f1f77bcf86cd799439099');

    if (!isNaN(initialPayPaise) && initialPayPaise > 0) {
      allocation = await allocatePayment({
        membership,
        user: targetUser,
        amountInPaise: initialPayPaise,
        method: paymentMethod,
        referenceNumber,
        notes: notes ? `${notes} (Enrollment Fee Payment)` : 'Enrollment fee payment',
        adminId,
        paidAt: parsedJoiningDate,
        primaryInvoiceId: initialInvoice._id,
      });
    }

    await AuditLog.create({
      actor: {
        id: req.user?._id || adminId,
        email: req.user?.email || 'admin@libraryhub.in',
        role: req.user?.role || 'admin',
      },
      action: 'MEMBERSHIP_CREATE',
      targetEntity: 'Membership',
      targetId: membership._id,
      beforeState: null,
      afterState: {
        membershipId: membership._id,
        userId: targetUser._id,
        planName: membership.planName,
        monthlyFeeInPaise: membership.monthlyFeeInPaise,
        initialPaymentInPaise: initialPayPaise || 0,
        joiningDate: membership.joiningDate,
      },
      reason: initialPayPaise > 0
        ? `New member enrollment with initial payment ₹${initialPayPaise / 100}`
        : 'New member enrollment',
    });

    logger.info(`New membership created for user ${targetUser.email} (ID: ${membership._id})`);

    return successResponse(
      res,
      {
        membership,
        initialInvoice,
        allocation,
      },
      'Membership created and enrolled successfully',
      201
    );
  } catch (err) {
    logger.error(`Error in createMembership: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Immediate Deactivation of Membership (Admin only)
 * Blocks attendance immediately, stops future invoices, preserves historical dues!
 */
export async function deactivateMembership(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return errorResponse(res, 'Deactivation reason is mandatory', 400);
    }

    const membership = await Membership.findById(id);
    if (!membership) {
      return errorResponse(res, 'Membership not found', 404);
    }

    if (membership.status === 'inactive') {
      return errorResponse(res, 'Membership is already inactive', 400);
    }

    const beforeState = {
      status: membership.status,
      effectiveDeactivationDate: membership.effectiveDeactivationDate,
    };

    membership.status = 'inactive';
    membership.effectiveDeactivationDate = new Date();
    membership.deactivationReason = reason.trim();
    membership.deactivatedBy = req.user._id;
    await membership.save();

    await User.findByIdAndUpdate(membership.userId, {
      isMember: false,
      isActive: false,
      deactivationReason: reason.trim(),
    });

    await AuditLog.create({
      actor: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
      },
      action: 'MEMBERSHIP_DEACTIVATE',
      targetEntity: 'Membership',
      targetId: membership._id,
      beforeState,
      afterState: {
        status: 'inactive',
        effectiveDeactivationDate: membership.effectiveDeactivationDate,
        deactivationReason: membership.deactivationReason,
      },
      reason: reason.trim(),
    });

    logger.info(`Membership ${membership._id} deactivated immediately. Reason: ${reason}`);

    return successResponse(res, { membership }, 'Membership deactivated immediately');
  } catch (err) {
    logger.error(`Error in deactivateMembership: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Reactivate Membership (Admin only)
 */
export async function reactivateMembership(req, res, next) {
  try {
    const { id } = req.params;
    const { effectiveDate, reason } = req.body || {};

    const membership = await Membership.findById(id);
    if (!membership) {
      return errorResponse(res, 'Membership not found', 404);
    }

    if (membership.status === 'active') {
      return errorResponse(res, 'Membership is already active', 400);
    }

    const parsedEffectiveDate = effectiveDate ? new Date(effectiveDate) : new Date();
    const anchorDay = parsedEffectiveDate.getDate();

    const beforeState = {
      status: membership.status,
      effectiveDeactivationDate: membership.effectiveDeactivationDate,
    };

    const adminId = (req.user && req.user._id)
      ? req.user._id
      : (req.user && req.user.id && mongoose.Types.ObjectId.isValid(req.user.id))
        ? new mongoose.Types.ObjectId(req.user.id)
        : new mongoose.Types.ObjectId('507f1f77bcf86cd799439099');

    membership.status = 'active';
    membership.reactivatedAt = new Date();
    membership.reactivatedByAdminId = adminId;
    membership.billingAnchorDay = anchorDay;
    membership.effectiveDeactivationDate = null;
    membership.deactivationReason = null;
    membership.deactivatedByAdminId = null;
    await membership.save();

    await User.findByIdAndUpdate(membership.userId, {
      isMember: true,
      isActive: true,
      deactivationReason: null,
      currentMembership: membership._id,
    });

    await AuditLog.create({
      actor: {
        id: adminId,
        email: req.user?.email || 'admin@libraryhub.in',
        role: req.user?.role || 'admin',
      },
      action: 'MEMBERSHIP_REACTIVATE',
      targetEntity: 'Membership',
      targetId: membership._id,
      beforeState,
      afterState: {
        status: 'active',
        reactivatedAt: membership.reactivatedAt,
        billingAnchorDay: anchorDay,
      },
      reason: reason || 'Reactivated by admin with 1-click restore',
    });

    logger.info(`Membership ${membership._id} reactivated.`);

    return successResponse(res, { membership }, 'Membership reactivated successfully');
  } catch (err) {
    logger.error(`Error in reactivateMembership: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Update Membership shift, timings, plan, and/or monthly fee (Admin only)
 */
export async function updateMembership(req, res, next) {
  try {
    const { id } = req.params;
    const {
      planId,
      planName,
      slotType,
      shiftTimings,
      monthlyFeeInPaise,
      updateCurrentUnpaidInvoice = true,
      reason,
      feeAction = 'NO_CHANGE', // 'NO_CHANGE' | 'MARK_UNPAID' | 'MARK_PAID' | 'SET_AMOUNT'
      paidAmountInRupees,
      paymentMethod = 'CASH',
      feeNotes,
    } = req.body;

    const membership = await Membership.findById(id);
    if (!membership) {
      return errorResponse(res, 'Membership not found', 404);
    }

    const beforeState = {
      planId: membership.planId,
      planName: membership.planName,
      slotType: membership.slotType,
      shiftTimings: membership.shiftTimings,
      monthlyFeeInPaise: membership.monthlyFeeInPaise,
    };

    if (planId) {
      membership.planId = planId;
    }
    if (planName) {
      membership.planName = planName;
    }
    if (slotType) {
      membership.slotType = slotType;
    }
    if (shiftTimings !== undefined) {
      membership.shiftTimings = shiftTimings;
    }
    if (monthlyFeeInPaise !== undefined) {
      const parsedFee = parseInt(monthlyFeeInPaise, 10);
      if (isNaN(parsedFee) || parsedFee < 0) {
        return errorResponse(res, 'Monthly fee must be a non-negative number in paise', 400);
      }
      membership.monthlyFeeInPaise = parsedFee;
    }

    await membership.save();

    const currentFeePaise = membership.monthlyFeeInPaise;
    const adminId = (req.user && req.user._id)
      ? req.user._id
      : (req.user && req.user.id && mongoose.Types.ObjectId.isValid(req.user.id))
        ? new mongoose.Types.ObjectId(req.user.id)
        : new mongoose.Types.ObjectId('507f1f77bcf86cd799439099');

    let updatedInvoice = null;

    // Fetch the latest cycle invoice for this membership
    let latestInvoice = await FeeInvoice.findOne({
      membershipId: membership._id,
    }).sort({ billingPeriodEnd: -1 });

    // Auto-create initial cycle invoice if missing and fee adjustment is requested
    if (!latestInvoice && (feeAction === 'MARK_UNPAID' || feeAction === 'MARK_PAID' || feeAction === 'SET_AMOUNT')) {
      const joinDate = membership.joiningDate || new Date();
      const anchorDay = membership.billingAnchorDay || joinDate.getDate();
      const nextBillDate = calculateNextBillingDate(joinDate, anchorDay);
      const periodEnd = new Date(nextBillDate.getTime() - 24 * 60 * 60 * 1000);
      const invoiceNumber = generateInvoiceNumber('INV', new Date());
      const dueDate = calculateDueDate(joinDate, 7);
      const periodKey = `${membership._id}_${formatDateKey(joinDate)}`;

      latestInvoice = await FeeInvoice.create({
        invoiceNumber,
        membershipId: membership._id,
        userId: membership.userId,
        periodKey,
        billingPeriodStart: joinDate,
        billingPeriodEnd: periodEnd,
        issueDate: joinDate,
        dueDate,
        feeAmountInPaise: currentFeePaise,
        adjustmentsInPaise: 0,
        amountPaidInPaise: 0,
        balanceInPaise: currentFeePaise,
        status: 'unpaid',
        notes: `Billing cycle invoice for ${membership._id}`,
      });
    }

    // --- FEE ADJUSTMENT ACTIONS ---
    if (feeAction === 'MARK_UNPAID' && latestInvoice) {
      // 1. Reverse any active payments associated with this invoice
      const activePayments = await Payment.find({
        invoiceId: latestInvoice._id,
        isReversed: false,
      });

      for (const p of activePayments) {
        p.isReversed = true;
        p.reversalReason = feeNotes || reason || 'Admin correction: Marked fee as unpaid/pending';
        p.reversedByAdminId = adminId;
        p.reversedAt = new Date();
        await p.save();
      }

      // 2. Reset invoice to completely unpaid
      latestInvoice.feeAmountInPaise = currentFeePaise;
      latestInvoice.amountPaidInPaise = 0;
      latestInvoice.balanceInPaise = currentFeePaise;
      latestInvoice.status = 'unpaid';
      latestInvoice.notes = (latestInvoice.notes ? `${latestInvoice.notes} | ` : '') + (feeNotes || 'Fee marked as Unpaid/Pending by admin');
      await latestInvoice.save();
      updatedInvoice = latestInvoice;

      await AuditLog.create({
        actor: { id: adminId, email: req.user?.email || 'admin@libraryhub.in', role: req.user?.role || 'admin' },
        action: 'FEE_STATUS_RESET_UNPAID',
        targetEntity: 'FeeInvoice',
        targetId: latestInvoice._id,
        afterState: {
          status: 'unpaid',
          amountPaidInPaise: 0,
          balanceInPaise: currentFeePaise,
          reversedPaymentsCount: activePayments.length,
        },
        reason: feeNotes || reason || 'Fee reset to Unpaid by admin correction',
      });
    } else if (feeAction === 'MARK_PAID' && latestInvoice) {
      // 1. Determine amount required to clear balance
      latestInvoice.feeAmountInPaise = currentFeePaise;
      const balanceToPay = Math.max(0, currentFeePaise - (latestInvoice.amountPaidInPaise || 0));

      if (balanceToPay > 0) {
        const receiptNumber = generateReceiptNumber('RCP', new Date());
        await Payment.create({
          paymentNumber: receiptNumber,
          invoiceId: latestInvoice._id,
          membershipId: membership._id,
          userId: membership.userId,
          amountInPaise: balanceToPay,
          method: paymentMethod || 'CASH',
          notes: feeNotes || reason || 'Marked fully paid via membership edit',
          recordedByAdminId: adminId,
          recordedBy: adminId,
        });
      }

      latestInvoice.amountPaidInPaise = currentFeePaise;
      latestInvoice.balanceInPaise = 0;
      latestInvoice.status = 'paid';
      latestInvoice.notes = (latestInvoice.notes ? `${latestInvoice.notes} | ` : '') + (feeNotes || 'Fee marked fully paid by admin');
      await latestInvoice.save();
      updatedInvoice = latestInvoice;

      await AuditLog.create({
        actor: { id: adminId, email: req.user?.email || 'admin@libraryhub.in', role: req.user?.role || 'admin' },
        action: 'FEE_STATUS_MARKED_PAID',
        targetEntity: 'FeeInvoice',
        targetId: latestInvoice._id,
        afterState: { status: 'paid', amountPaidInPaise: currentFeePaise, balanceInPaise: 0 },
        reason: feeNotes || reason || 'Fee marked fully paid by admin',
      });
    } else if (feeAction === 'SET_AMOUNT' && latestInvoice) {
      const targetPaidPaise = Math.max(0, Math.round(Number(paidAmountInRupees || 0) * 100));

      // Reverse existing active payments for this invoice to prevent double counting
      const activePayments = await Payment.find({ invoiceId: latestInvoice._id, isReversed: false });
      for (const p of activePayments) {
        p.isReversed = true;
        p.reversalReason = feeNotes || reason || 'Payment reset for custom fee adjustment';
        p.reversedByAdminId = adminId;
        p.reversedAt = new Date();
        await p.save();
      }

      // Record new payment if targetPaidPaise > 0
      if (targetPaidPaise > 0) {
        const receiptNumber = generateReceiptNumber('RCP', new Date());
        await Payment.create({
          paymentNumber: receiptNumber,
          invoiceId: latestInvoice._id,
          membershipId: membership._id,
          userId: membership.userId,
          amountInPaise: targetPaidPaise,
          method: paymentMethod || 'CASH',
          notes: feeNotes || reason || `Custom fee collected: ₹${targetPaidPaise / 100}`,
          recordedByAdminId: adminId,
          recordedBy: adminId,
        });
      }

      latestInvoice.feeAmountInPaise = currentFeePaise;
      latestInvoice.amountPaidInPaise = targetPaidPaise;
      const newBal = Math.max(0, currentFeePaise - targetPaidPaise);
      latestInvoice.balanceInPaise = newBal;
      latestInvoice.status = newBal === 0 ? 'paid' : (targetPaidPaise > 0 ? 'partially_paid' : 'unpaid');
      latestInvoice.notes = (latestInvoice.notes ? `${latestInvoice.notes} | ` : '') + (feeNotes || `Fee adjusted to ₹${targetPaidPaise / 100} paid`);
      await latestInvoice.save();
      updatedInvoice = latestInvoice;

      await AuditLog.create({
        actor: { id: adminId, email: req.user?.email || 'admin@libraryhub.in', role: req.user?.role || 'admin' },
        action: 'FEE_STATUS_CUSTOM_ADJUSTED',
        targetEntity: 'FeeInvoice',
        targetId: latestInvoice._id,
        afterState: { status: latestInvoice.status, amountPaidInPaise: targetPaidPaise, balanceInPaise: newBal },
        reason: feeNotes || reason || `Custom fee adjusted to ₹${targetPaidPaise / 100}`,
      });
    } else if (updateCurrentUnpaidInvoice && monthlyFeeInPaise !== undefined) {
      // Standard behavior when feeAction is NO_CHANGE: update unpaid invoice if fee changed
      const unpaidInvoice = await FeeInvoice.findOne({
        membershipId: membership._id,
        status: { $in: ['unpaid', 'partially_paid'] },
      }).sort({ billingPeriodEnd: -1 });

      if (unpaidInvoice) {
        unpaidInvoice.feeAmountInPaise = currentFeePaise;
        const newBalance = Math.max(0, currentFeePaise - (unpaidInvoice.amountPaidInPaise || 0));
        unpaidInvoice.balanceInPaise = newBalance;
        unpaidInvoice.status = newBalance === 0 ? 'paid' : (unpaidInvoice.amountPaidInPaise > 0 ? 'partially_paid' : 'unpaid');
        await unpaidInvoice.save();
        updatedInvoice = unpaidInvoice;
      }
    }

    await AuditLog.create({
      actor: {
        id: adminId,
        email: req.user?.email || 'admin@libraryhub.in',
        role: req.user?.role || 'admin',
      },
      action: 'MEMBERSHIP_UPDATE',
      targetEntity: 'Membership',
      targetId: membership._id,
      beforeState,
      afterState: {
        planId: membership.planId,
        planName: membership.planName,
        slotType: membership.slotType,
        shiftTimings: membership.shiftTimings,
        monthlyFeeInPaise: membership.monthlyFeeInPaise,
        updatedInvoiceId: updatedInvoice?._id || null,
      },
      reason: reason || 'Membership shift and/or fee updated by admin',
    });

    logger.info(`Membership ${membership._id} updated by admin. New Plan: ${membership.planName}, Fee: ₹${membership.monthlyFeeInPaise / 100}`);

    return successResponse(res, { membership, updatedInvoice }, 'Membership updated successfully');
  } catch (err) {
    logger.error(`Error in updateMembership: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Update future monthly fee (Admin only)
 */
export async function updateMonthlyFee(req, res, next) {
  try {
    const { id } = req.params;
    const { monthlyFeeInPaise, reason } = req.body;

    if (!monthlyFeeInPaise || monthlyFeeInPaise <= 0) {
      return errorResponse(res, 'Monthly fee must be a positive integer in paise', 400);
    }

    const membership = await Membership.findById(id);
    if (!membership) {
      return errorResponse(res, 'Membership not found', 404);
    }

    const beforeFee = membership.monthlyFeeInPaise;
    membership.monthlyFeeInPaise = monthlyFeeInPaise;
    await membership.save();

    await AuditLog.create({
      actor: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
      },
      action: 'MEMBERSHIP_FEE_UPDATE',
      targetEntity: 'Membership',
      targetId: membership._id,
      beforeState: { monthlyFeeInPaise: beforeFee },
      afterState: { monthlyFeeInPaise },
      reason: reason || 'Monthly fee updated',
    });

    logger.info(`Membership ${membership._id} fee updated from ₹${beforeFee / 100} to ₹${monthlyFeeInPaise / 100}`);

    return successResponse(res, { membership }, 'Monthly fee updated successfully for future cycles');
  } catch (err) {
    logger.error(`Error in updateMonthlyFee: ${err.message}`, { error: err });
    return next(err);
  }
}

export default {
  listMemberships,
  getMembershipById,
  createMembership,
  deactivateMembership,
  reactivateMembership,
  updateMembership,
  updateMonthlyFee,
};
