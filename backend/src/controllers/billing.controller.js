import mongoose from 'mongoose';
import { FeeInvoice, Payment, Membership, User, AuditLog } from '../models/index.js';
import {
  generateInvoiceNumber,
  generateReceiptNumber,
  calculateNextBillingDate,
  calculateDueDate,
  formatDateKey,
} from '../utils/billingCalculator.js';
import { sendPaymentReceiptEmail } from '../services/emailService.js';
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

    if (parsedAmount > invoice.balanceInPaise) {
      return errorResponse(
        res,
        `Payment amount (₹${parsedAmount / 100}) cannot exceed remaining balance (₹${invoice.balanceInPaise / 100})`,
        400
      );
    }

    const paymentNumber = generateReceiptNumber('RCP', new Date());
    const effectivePaidAt = paidAt ? new Date(paidAt) : new Date();
    const adminId = (req.user && req.user._id)
      ? req.user._id
      : (req.user && req.user.id && mongoose.Types.ObjectId.isValid(req.user.id))
        ? new mongoose.Types.ObjectId(req.user.id)
        : new mongoose.Types.ObjectId('507f1f77bcf86cd799439099');

    const payment = await Payment.create({
      paymentNumber,
      invoiceId: invoice._id,
      membershipId: invoice.membershipId,
      userId: invoice.userId._id,
      amountInPaise: parsedAmount,
      paidAt: effectivePaidAt,
      method: method.toUpperCase(),
      referenceNumber: referenceNumber ? referenceNumber.trim() : '',
      recordedByAdminId: adminId,
      recordedBy: adminId,
      notes: notes ? notes.trim() : '',
      isReversed: false,
    });

    const newAmountPaid = invoice.amountPaidInPaise + parsedAmount;
    const newBalance = invoice.balanceInPaise - parsedAmount;
    const newStatus = newBalance === 0 ? 'paid' : 'partially_paid';

    const beforeState = {
      amountPaidInPaise: invoice.amountPaidInPaise,
      balanceInPaise: invoice.balanceInPaise,
      status: invoice.status,
    };

    invoice.amountPaidInPaise = newAmountPaid;
    invoice.balanceInPaise = newBalance;
    invoice.status = newStatus;
    await invoice.save();

    await AuditLog.create({
      actor: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
      },
      action: 'PAYMENT_RECORD',
      targetEntity: 'Payment',
      targetId: payment._id,
      beforeState,
      afterState: {
        paymentId: payment._id,
        paymentNumber,
        amountInPaise: parsedAmount,
        invoiceBalanceInPaise: newBalance,
        status: newStatus,
      },
      reason: notes || `Payment recorded via ${method.toUpperCase()}`,
    });

    sendPaymentReceiptEmail({
      user: invoice.userId,
      payment: {
        receiptNumber: paymentNumber,
        amountPaise: parsedAmount,
        paymentMethod: method,
      },
      invoice: {
        balancePaise: newBalance,
      },
    }).catch((e) => logger.error(`Email error on payment receipt: ${e.message}`));

    logger.info(`Payment recorded: ₹${parsedAmount / 100} for invoice ${invoice.invoiceNumber} (Receipt: ${paymentNumber})`);

    return successResponse(
      res,
      {
        payment,
        invoice: {
          id: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          amountPaidInPaise: invoice.amountPaidInPaise,
          balanceInPaise: invoice.balanceInPaise,
          status: invoice.status,
        },
      },
      'Payment recorded successfully',
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

    const invoice = await FeeInvoice.findById(payment.invoiceId);
    if (!invoice) {
      return errorResponse(res, 'Associated invoice not found', 404);
    }

    invoice.amountPaidInPaise = Math.max(0, invoice.amountPaidInPaise - payment.amountInPaise);
    invoice.balanceInPaise = invoice.balanceInPaise + payment.amountInPaise;
    invoice.status = invoice.amountPaidInPaise === 0 ? 'unpaid' : 'partially_paid';
    await invoice.save();

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
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
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

    const duesByUser = await FeeInvoice.aggregate([
      { $match: { balanceInPaise: { $gt: 0 } } },
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
            { $match: { $expr: { $eq: ['$userId', '$$uId'] } } },
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
    const nextBill = calculateNextBillingDate(m.joiningDate, m.billingAnchorDay);
    if (nextBill <= today) {
      const cycleStart = nextBill;
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

export default {
  listInvoices,
  getInvoiceById,
  recordPayment,
  listPayments,
  reversePayment,
  getOutstandingDues,
  runBillingCycleJob,
};
