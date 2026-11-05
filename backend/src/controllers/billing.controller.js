import mongoose from 'mongoose';
import { FeeInvoice, Payment, Membership, User, AuditLog } from '../models/index.js';
import {
  generateInvoiceNumber,
  generateReceiptNumber,
  calculateNextBillingDate,
  calculateDueDate,
  formatDateKey,
} from '../utils/billingCalculator.js';
import { allocatePayment } from '../utils/paymentAllocation.js';
import { sendPaymentReceiptEmail, sendFeeReminderEmail } from '../services/emailService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import logger from '../utils/logger.js';

/**
 * List invoices with filtering by status, user, and date range
 */
export async function listInvoices(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1 && process.env.NODE_ENV !== 'test') {
      return successResponse(res, {
        invoices: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });
    }

    const { status, userId, page = 1, limit = 20 } = req.query;
    const query = {};

    if (req.user.role === 'student') {
      query.userId = req.user._id;
    } else if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = userId;
    }

    if (status) {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [invoices, total] = await Promise.all([
      FeeInvoice.find(query)
        .populate('userId', 'name email phone picture')
        .populate('membershipId', 'planName status billingAnchorDay')
        .sort({ issueDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      FeeInvoice.countDocuments(query),
    ]);

    return successResponse(res, {
      invoices,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    logger.error(`Error in listInvoices: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Get invoice details along with recorded payments
 */
export async function getInvoiceById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Invalid invoice ID', 400);
    }

    const invoice = await FeeInvoice.findById(id)
      .populate('userId', 'name email phone picture')
      .populate('membershipId')
      .lean();

    if (!invoice) {
      return errorResponse(res, 'Invoice not found', 404);
    }

    if (req.user.role === 'student' && String(invoice.userId._id) !== String(req.user._id)) {
      return errorResponse(res, 'Access denied', 403);
    }

    const payments = await Payment.find({ invoiceId: id }).sort({ paidAt: -1 }).lean();

    return successResponse(res, {
      invoice,
      payments,
    });
  } catch (err) {
    logger.error(`Error in getInvoiceById: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Record a manual payment against an invoice (Admin only)
 */
export async function recordPayment(req, res, next) {
  try {
    const {
      invoiceId,
      amountInPaise,
      method = 'CASH',
      paidAt,
      referenceNumber,
      notes,
    } = req.body;

    if (!invoiceId || !mongoose.Types.ObjectId.isValid(invoiceId)) {
      return errorResponse(res, 'Valid invoice ID is required', 400);
    }

    const parsedAmount = parseInt(amountInPaise, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return errorResponse(res, 'Payment amount must be a positive integer in paise (e.g. 60000 for ₹600)', 400);
    }

    const invoice = await FeeInvoice.findById(invoiceId).populate('userId');
    if (!invoice) {
      return errorResponse(res, 'Invoice not found', 404);
    }

    if (invoice.balanceInPaise <= 0 || invoice.status === 'paid') {
      return errorResponse(res, 'This invoice is already fully paid', 400);
    }

    const membership = await Membership.findById(invoice.membershipId);
    if (!membership) {
      return errorResponse(res, 'Associated membership not found', 404);
    }

    const effectivePaidAt = paidAt ? new Date(paidAt) : new Date();
    const adminId = (req.user && req.user._id)
      ? req.user._id
      : (req.user && req.user.id && mongoose.Types.ObjectId.isValid(req.user.id))
        ? new mongoose.Types.ObjectId(req.user.id)
        : new mongoose.Types.ObjectId('507f1f77bcf86cd799439099');

    const allocation = await allocatePayment({
      membership,
      user: invoice.userId,
      amountInPaise: parsedAmount,
      method,
      referenceNumber,
      notes,
      adminId,
      paidAt: effectivePaidAt,
      primaryInvoiceId: invoice._id,
    });

    const primaryPayment = allocation.payments[0] || null;
    const latestInvoiceState = await FeeInvoice.findById(invoice._id);

    await AuditLog.create({
      actor: {
        id: adminId,
        email: req.user?.email || 'admin@libraryhub.in',
        role: req.user?.role || 'admin',
      },
      action: 'PAYMENT_RECORD',
      targetEntity: 'Payment',
      targetId: primaryPayment ? primaryPayment._id : invoice._id,
      beforeState: { balanceInPaise: invoice.balanceInPaise, status: invoice.status },
      afterState: {
        amountInPaise: parsedAmount,
        paymentsCreated: allocation.payments.length,
        invoicesAffected: allocation.invoices.length,
        latestInvoiceStatus: latestInvoiceState?.status,
        latestInvoiceBalance: latestInvoiceState?.balanceInPaise,
      },
      reason: notes || `Payment recorded via ${method.toUpperCase()} across ${allocation.payments.length} cycle(s)`,
    });

    if (primaryPayment) {
      sendPaymentReceiptEmail({
        user: invoice.userId,
        payment: {
          receiptNumber: primaryPayment.paymentNumber,
          amountPaise: parsedAmount,
          paymentMethod: method,
        },
        invoice: {
          balancePaise: latestInvoiceState?.balanceInPaise || 0,
        },
      }).catch((e) => logger.error(`Email error on payment receipt: ${e.message}`));
    }

    logger.info(`Payment recorded: ₹${parsedAmount / 100} for user ${invoice.userId.email} across ${allocation.payments.length} cycle(s)`);

    return successResponse(
      res,
      {
        payment: primaryPayment,
        payments: allocation.payments,
        invoices: allocation.invoices,
        invoice: {
          id: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          amountPaidInPaise: latestInvoiceState?.amountPaidInPaise || invoice.amountPaidInPaise,
          balanceInPaise: latestInvoiceState?.balanceInPaise || 0,
          status: latestInvoiceState?.status || 'paid',
        },
      },
      allocation.payments.length > 1
        ? `Payment of ₹${parsedAmount / 100} recorded successfully across ${allocation.payments.length} cycles (including next month's advance)!`
        : 'Payment recorded successfully',
      201
    );
  } catch (err) {
    logger.error(`Error in recordPayment: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * List all payments
 */
export async function listPayments(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1 && process.env.NODE_ENV !== 'test') {
      return successResponse(res, {
        payments: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });
    }

    const { method, startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = {};

    if (req.user.role === 'student') {
      query.userId = req.user._id;
    }

    if (method) {
      query.method = method.toUpperCase();
    }

    if (startDate || endDate) {
      query.paidAt = {};
      if (startDate) query.paidAt.$gte = new Date(startDate);
      if (endDate) query.paidAt.$lte = new Date(endDate);
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('userId', 'name email phone picture')
        .populate('invoiceId', 'invoiceNumber billingPeriodStart billingPeriodEnd')
        .populate('recordedBy', 'name email')
        .sort({ paidAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Payment.countDocuments(query),
    ]);

    return successResponse(res, {
      payments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    logger.error(`Error in listPayments: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Reverse a recorded payment with mandatory audit reason (Admin only)
 */
export async function reversePayment(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return errorResponse(res, 'Reversal reason is mandatory', 400);
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      return errorResponse(res, 'Payment not found', 404);
    }

    if (payment.isReversed) {
      return errorResponse(res, 'Payment has already been reversed', 400);
    }

    const invoice = payment.invoiceId ? await FeeInvoice.findById(payment.invoiceId) : null;
    if (invoice) {
      invoice.amountPaidInPaise = Math.max(0, invoice.amountPaidInPaise - payment.amountInPaise);
      invoice.balanceInPaise = invoice.balanceInPaise + payment.amountInPaise;
      invoice.status = invoice.amountPaidInPaise === 0 ? 'unpaid' : 'partially_paid';
      await invoice.save();
    }

    const adminId = (req.user && req.user._id)
      ? req.user._id
      : (req.user && req.user.id && mongoose.Types.ObjectId.isValid(req.user.id))
        ? new mongoose.Types.ObjectId(req.user.id)
        : new mongoose.Types.ObjectId('507f1f77bcf86cd799439099');

    payment.isReversed = true;
    payment.reversalReason = reason.trim();
    payment.reversedByAdminId = adminId;
    payment.reversedAt = new Date();
    await payment.save();

    await AuditLog.create({
      actor: {
        id: req.user?._id || adminId,
        email: req.user?.email || 'admin@libraryhub.in',
        role: req.user?.role || 'admin',
      },
      action: 'PAYMENT_REVERSE',
      targetEntity: 'Payment',
      targetId: payment._id,
      beforeState: { isReversed: false, amountInPaise: payment.amountInPaise },
      afterState: { isReversed: true, reversalReason: reason.trim() },
      reason: reason.trim(),
    });

    logger.info(`Payment ${payment.paymentNumber} reversed. Reason: ${reason}`);

    return successResponse(res, { payment, invoice }, 'Payment reversed successfully');
  } catch (err) {
    logger.error(`Error in reversePayment: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Get outstanding dues list across students (Admin only)
 */
export async function getOutstandingDues(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1 && process.env.NODE_ENV !== 'test') {
      return successResponse(res, {
        duesByUser: [],
        totalSystemOutstandingPaise: 0,
        studentCountWithDues: 0,
      });
    }

    // Fetch active memberships so dues strictly include currently active students
    const activeMemberships = await Membership.find({ status: 'active' }).select('userId').lean();
    const activeUserIds = activeMemberships.map((m) => m.userId);

    const duesByUser = await FeeInvoice.aggregate([
      {
        $match: {
          userId: { $in: activeUserIds },
          balanceInPaise: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: '$userId',
          totalDuePaise: { $sum: '$balanceInPaise' },
          unpaidInvoiceCount: { $sum: 1 },
          oldestInvoiceDate: { $min: '$issueDate' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'memberships',
          let: { uId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$uId'] },
                    { $eq: ['$status', 'active'] },
                  ],
                },
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
          ],
          as: 'membership',
        },
      },
      {
        $project: {
          _id: 1,
          totalDuePaise: 1,
          unpaidInvoiceCount: 1,
          oldestInvoiceDate: 1,
          'user.name': 1,
          'user.email': 1,
          'user.phone': 1,
          'user.isMember': 1,
          membershipStatus: { $arrayElemAt: ['$membership.status', 0] },
          membershipPlan: { $arrayElemAt: ['$membership.planName', 0] },
        },
      },
      { $sort: { totalDuePaise: -1 } },
    ]);

    const totalSystemOutstandingPaise = duesByUser.reduce((sum, item) => sum + item.totalDuePaise, 0);

    return successResponse(res, {
      duesByUser,
      totalSystemOutstandingPaise,
      studentCountWithDues: duesByUser.length,
    });
  } catch (err) {
    logger.error(`Error in getOutstandingDues: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Idempotent Billing Cycle Generator Job
 */
export async function runBillingCycleJob() {
  const today = new Date();
  const activeMemberships = await Membership.find({
    status: 'active',
  });

  let generatedCount = 0;

  for (const m of activeMemberships) {
    const latestInv = await FeeInvoice.findOne({ membershipId: m._id }).sort({ billingPeriodEnd: -1 });
    let cycleStart;
    if (latestInv && latestInv.billingPeriodEnd) {
      cycleStart = new Date(latestInv.billingPeriodEnd.getTime() + 24 * 60 * 60 * 1000);
    } else {
      cycleStart = calculateNextBillingDate(m.joiningDate, m.billingAnchorDay);
    }

    if (cycleStart <= today) {
      const followingBill = calculateNextBillingDate(cycleStart, m.billingAnchorDay);
      const periodEnd = new Date(followingBill.getTime() - 24 * 60 * 60 * 1000);
      const periodKey = `${m._id}_${formatDateKey(cycleStart)}`;

      const existing = await FeeInvoice.findOne({ periodKey });

      if (!existing) {
        const invoiceNumber = generateInvoiceNumber('INV', cycleStart);
        const dueDate = calculateDueDate(cycleStart, 7);

        await FeeInvoice.create({
          invoiceNumber,
          membershipId: m._id,
          userId: m.userId,
          periodKey,
          billingPeriodStart: cycleStart,
          billingPeriodEnd: periodEnd,
          issueDate: cycleStart,
          dueDate,
          feeAmountInPaise: m.monthlyFeeInPaise,
          adjustmentsInPaise: 0,
          amountPaidInPaise: 0,
          balanceInPaise: m.monthlyFeeInPaise,
          status: 'unpaid',
        });

        generatedCount++;
      }
    }
  }

  logger.info(`Billing cycle job completed. Invoices generated: ${generatedCount}`);
  return { generatedCount };
}

/**
 * Admin 1-Click Fee Reminder Email
 * Remind a specific student or broadcast to all active students with pending dues.
 */
export async function sendFeeReminder(req, res, next) {
  try {
    const { userId, sendToAll } = req.body;

    if (sendToAll) {
      const activeMemberships = await Membership.find({ status: 'active' }).select('_id userId planName').lean();
      const activeUserIds = activeMemberships.map((m) => m.userId);

      const unpaidInvoices = await FeeInvoice.find({
        userId: { $in: activeUserIds },
        status: { $in: ['unpaid', 'partially_paid', 'overdue'] },
      }).populate('userId', 'name email').sort({ dueDate: 1 }).lean();

      const userDuesMap = new Map();
      unpaidInvoices.forEach((inv) => {
        if (!inv.userId || !inv.userId.email) return;
        const uid = String(inv.userId._id);
        if (!userDuesMap.has(uid)) {
          const m = activeMemberships.find((mb) => String(mb.userId) === uid);
          userDuesMap.set(uid, {
            user: inv.userId,
            planName: m?.planName || 'Library Membership',
            totalDuePaise: 0,
            earliestDueDate: inv.dueDate,
            latestInvoiceNum: inv.invoiceNumber,
          });
        }
        const entry = userDuesMap.get(uid);
        entry.totalDuePaise += (inv.balanceInPaise || 0);
      });

      let sentCount = 0;
      for (const entry of userDuesMap.values()) {
        if (entry.totalDuePaise > 0) {
          const amountRupees = (entry.totalDuePaise / 100).toLocaleString('en-IN');
          const dueDateStr = entry.earliestDueDate
            ? new Date(entry.earliestDueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
            : undefined;

          await sendFeeReminderEmail({
            user: entry.user,
            amountRupees,
            planName: entry.planName,
            dueDateStr,
            invoiceNumber: entry.latestInvoiceNum,
          });
          sentCount++;
        }
      }

      const adminId = req.user?._id || new mongoose.Types.ObjectId('507f1f77bcf86cd799439099');
      await AuditLog.create({
        actor: {
          id: adminId,
          email: req.user?.email || 'admin@libraryhub.in',
          role: req.user?.role || 'admin',
        },
        action: 'FEE_REMINDER_BROADCAST',
        targetEntity: 'FeeInvoice',
        reason: `Fee reminder email broadcast sent to ${sentCount} active students with pending dues`,
      });

      return successResponse(
        res,
        { sentCount },
        `Fee reminder email successfully sent to ${sentCount} student(s) with pending dues.`
      );
    }

    if (!userId) {
      return errorResponse(res, 'Student User ID is required to send fee reminder', 400);
    }

    const student = await User.findById(userId);
    if (!student) {
      return errorResponse(res, 'Student not found', 404);
    }

    const membership = await Membership.findOne({ userId: student._id, status: 'active' }).lean();
    const unpaidInvoices = await FeeInvoice.find({
      userId: student._id,
      status: { $in: ['unpaid', 'partially_paid', 'overdue'] },
    }).sort({ dueDate: 1 }).lean();

    const totalDuePaise = unpaidInvoices.reduce((sum, inv) => sum + (inv.balanceInPaise || 0), 0);
    if (totalDuePaise <= 0) {
      return errorResponse(res, `Student "${student.name}" has no pending dues!`, 400);
    }

    const amountRupees = (totalDuePaise / 100).toLocaleString('en-IN');
    const earliestDue = unpaidInvoices[0]?.dueDate;
    const dueDateStr = earliestDue
      ? new Date(earliestDue).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
      : undefined;

    const emailResult = await sendFeeReminderEmail({
      user: student,
      amountRupees,
      planName: membership?.planName || 'Library Membership',
      dueDateStr,
      invoiceNumber: unpaidInvoices[0]?.invoiceNumber,
    });

    const adminId = req.user?._id || new mongoose.Types.ObjectId('507f1f77bcf86cd799439099');
    await AuditLog.create({
      actor: {
        id: adminId,
        email: req.user?.email || 'admin@libraryhub.in',
        role: req.user?.role || 'admin',
      },
      action: 'FEE_REMINDER_SENT',
      targetEntity: 'User',
      targetId: student._id,
      reason: `1-click fee reminder sent for ₹${amountRupees} pending dues`,
    });

    return successResponse(
      res,
      { student: { id: student._id, name: student.name, email: student.email }, totalDuePaise, emailResult },
      `Fee reminder email sent successfully to ${student.name} (${student.email}) for ₹${amountRupees}!`
    );
  } catch (err) {
    logger.error(`Error in sendFeeReminder: ${err.message}`, { error: err });
    return next(err);
  }
}

export default {
  listInvoices,
  getInvoiceById,
  recordPayment,
  listPayments,
  reversePayment,
  getOutstandingDues,
  sendFeeReminder,
  runBillingCycleJob,
};
