import mongoose from 'mongoose';
import { Membership, User, FeeInvoice, AuditLog } from '../models/index.js';
import { calculateNextBillingDate, generateInvoiceNumber, calculateDueDate, formatDateKey } from '../utils/billingCalculator.js';
import { allocatePayment } from '../utils/paymentAllocation.js';
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
        .populate('userId', 'name email phone picture isMember')
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
          role: 'student',
          isMember: true,
        });
      }
    }

    if (!targetUser) {
      return errorResponse(res, 'User ID or valid email is required to assign membership', 400);
    }

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

    // If admin requested updating the current unpaid invoice and fee has changed
    let updatedInvoice = null;
    if (updateCurrentUnpaidInvoice && monthlyFeeInPaise !== undefined) {
      const newFeePaise = parseInt(monthlyFeeInPaise, 10);
      const latestInvoice = await FeeInvoice.findOne({
        membershipId: membership._id,
        status: { $in: ['unpaid', 'partially_paid'] },
      }).sort({ billingPeriodEnd: -1 });

      if (latestInvoice) {
        latestInvoice.feeAmountInPaise = newFeePaise;
        const newBalance = Math.max(0, newFeePaise - (latestInvoice.amountPaidInPaise || 0));
        latestInvoice.balanceInPaise = newBalance;
        latestInvoice.status = newBalance === 0 ? 'paid' : (latestInvoice.amountPaidInPaise > 0 ? 'partially_paid' : 'unpaid');
        await latestInvoice.save();
        updatedInvoice = latestInvoice;
      }
    }

    const adminId = (req.user && req.user._id)
      ? req.user._id
      : (req.user && req.user.id && mongoose.Types.ObjectId.isValid(req.user.id))
        ? new mongoose.Types.ObjectId(req.user.id)
        : new mongoose.Types.ObjectId('507f1f77bcf86cd799439099');

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
