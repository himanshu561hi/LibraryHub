import mongoose from 'mongoose';
import { User, Membership, Attendance, DailyAttendanceCode, FeeInvoice, Payment } from '../models/index.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { formatDateKey } from '../utils/billingCalculator.js';
import { getKolkataDateKey } from '../utils/attendanceCode.js';
import crypto from 'crypto';

/**
 * Returns student dashboard overview data: membership status, today's attendance, recent logs, fee balances.
 */
export const getStudentDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const todayKey = getKolkataDateKey(new Date());

    if (mongoose.connection.readyState !== 1) {
      return successResponse(
        res,
        {
          user: {
            id: userId,
            name: req.user.name || 'Student',
            email: req.user.email || 'student@libraryhub.in',
            phone: '',
            picture: null,
            targetExam: '',
            isMember: false,
          },
          membership: null,
          todayAttendance: null,
          recentAttendance: [],
          financials: {
            totalDuesInPaise: 0,
            isAdvancePaid: false,
            advanceAmountInPaise: 0,
            advanceCyclesCount: 0,
            paidUntil: null,
            invoices: [],
            payments: [],
          },
        },
        'Student dashboard retrieved (Zero baseline)'
      );
    }

    // 1. User & Membership
    const user = await User.findById(userId);
    let membership = null;
    if (user?.currentMembership) {
      membership = await Membership.findById(user.currentMembership);
    }

    // 2. Today's Attendance
    const todayAttendance = await Attendance.findOne({ userId, date: todayKey });

    // 3. Recent Attendance (Last 10 records)
    const recentAttendance = await Attendance.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(10);

    // 4. Invoices & Payments
    const invoices = await FeeInvoice.find({ userId }).sort({ billingPeriodStart: -1 }).limit(12);
    const payments = await Payment.find({ userId, isReversed: false }).sort({ paidAt: -1 }).limit(12);

    const totalDuesInPaise = invoices
      .filter((inv) => inv.status !== 'paid' && inv.status !== 'void')
      .reduce((acc, curr) => acc + (curr.balanceInPaise || 0), 0);

    const now = new Date();
    const paidInvoices = invoices.filter((inv) => inv.status === 'paid');
    const latestPaidInvoice = paidInvoices[0] || null;
    let isAdvancePaid = false;
    let paidUntil = null;
    let advanceAmountInPaise = 0;
    let advanceCyclesCount = 0;

    // Advance invoices are any invoice whose billing period starts in the future,
    // or marked with advance notes, or extends significantly beyond current billing window
    const advanceInvoices = invoices.filter((inv) => {
      const periodStart = new Date(inv.billingPeriodStart);
      const periodEnd = new Date(inv.billingPeriodEnd);
      const isFuture = periodStart > now || periodEnd.getTime() > now.getTime() + 25 * 24 * 60 * 60 * 1000;
      const hasAdvanceNote = inv.notes && inv.notes.toLowerCase().includes('advance');
      return (isFuture || hasAdvanceNote) && (inv.amountPaidInPaise || 0) > 0;
    });

    if (advanceInvoices.length > 0) {
      isAdvancePaid = true;
      advanceAmountInPaise = advanceInvoices.reduce((sum, inv) => sum + (inv.amountPaidInPaise || 0), 0);
      advanceCyclesCount = advanceInvoices.length;
    }

    // Also check payments explicitly allocated to Advance
    const advancePayments = payments.filter((p) => p.notes && p.notes.toLowerCase().includes('advance'));
    const advancePaymentSum = advancePayments.reduce((sum, p) => sum + (p.amountInPaise || 0), 0);
    if (advancePaymentSum > advanceAmountInPaise) {
      advanceAmountInPaise = advancePaymentSum;
      isAdvancePaid = true;
    }

    if (latestPaidInvoice) {
      paidUntil = latestPaidInvoice.billingPeriodEnd;
      const periodStart = new Date(latestPaidInvoice.billingPeriodStart);
      const periodEnd = new Date(paidUntil);
      if (
        periodStart > now ||
        periodEnd.getTime() > now.getTime() + 25 * 24 * 60 * 60 * 1000 ||
        (latestPaidInvoice.notes && latestPaidInvoice.notes.toLowerCase().includes('advance'))
      ) {
        isAdvancePaid = true;
      }
    }

    return successResponse(
      res,
      {
        user: {
          id: user?._id || userId,
          name: user?.name || req.user.name,
          email: user?.email || req.user.email,
          phone: user?.phone || '',
          picture: user?.picture || null,
          targetExam: user?.targetExam || '',
          isMember: membership ? membership.status === 'active' : Boolean(user?.isMember),
        },
        membership,
        todayAttendance: todayAttendance
          ? {
              status: todayAttendance.status,
              inTime: todayAttendance.inTime,
              outTime: todayAttendance.outTime,
              date: todayAttendance.date,
            }
          : null,
        recentAttendance,
        financials: {
          totalDuesInPaise,
          isAdvancePaid,
          advanceAmountInPaise,
          advanceCyclesCount,
          paidUntil,
          invoices,
          payments,
        },
      },
      'Student dashboard retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Returns admin dashboard overview summary metrics.
 */
export const getAdminDashboardSummary = async (req, res, next) => {
  try {
    const todayKey = getKolkataDateKey(new Date());

    if (mongoose.connection.readyState !== 1) {
      return successResponse(
        res,
        {
          members: {
            active: 0,
            inactive: 0,
            totalRegistered: 0,
          },
          attendanceToday: {
            present: 0,
            currentlyIn: 0,
            completed: 0,
          },
          finances: {
            totalDuesInPaise: 0,
            todayCollectionsInPaise: 0,
          },
        },
        'Admin dashboard summary retrieved (Zero baseline)'
      );
    }

    const activeMembersCount = await Membership.countDocuments({ status: 'active' });
    const inactiveMembersCount = await Membership.countDocuments({ status: { $in: ['inactive', 'suspended'] } });
    const totalStudentsCount = await User.countDocuments({ role: 'student' });

    const presentTodayCount = await Attendance.countDocuments({ date: todayKey });
    const currentlyCheckedInCount = await Attendance.countDocuments({ date: todayKey, status: 'IN' });

    const activeMemberships = await Membership.find({ status: 'active' }).select('_id').lean();
    const activeMembershipIds = activeMemberships.map((m) => m._id);

    const activeUnpaidInvoices = await FeeInvoice.find({
      membershipId: { $in: activeMembershipIds },
      status: { $in: ['unpaid', 'partially_paid', 'overdue'] },
    });
    const totalDuesInPaise = activeUnpaidInvoices.reduce((sum, inv) => sum + (inv.balanceInPaise || 0), 0);

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayPayments = await Payment.find({
      paidAt: { $gte: todayStart },
      isReversed: false,
    });
    const todayCollectionsInPaise = todayPayments.reduce((sum, p) => sum + p.amountInPaise, 0);

    return successResponse(
      res,
      {
        members: {
          active: activeMembersCount,
          inactive: inactiveMembersCount,
          totalRegistered: totalStudentsCount,
        },
        attendanceToday: {
          present: presentTodayCount,
          currentlyIn: currentlyCheckedInCount,
          completed: presentTodayCount - currentlyCheckedInCount,
        },
        finances: {
          totalDuesInPaise,
          todayCollectionsInPaise,
        },
      },
      'Admin dashboard summary retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Returns or generates today's active daily attendance code for admin console display.
 */
export const getAdminDailyCode = async (req, res, next) => {
  try {
    const todayKey = formatDateKey(new Date());

    if (mongoose.connection.readyState !== 1) {
      return successResponse(
        res,
        {
          date: todayKey,
          code: 'LH' + todayKey.replace(/-/g, '').slice(-4),
          expiresAt: new Date(Date.now() + 86400000),
          isActive: true,
        },
        'Current daily attendance code retrieved (Offline mode)'
      );
    }

    let codeDoc = await DailyAttendanceCode.findOne({ date: todayKey, isActive: true });

    if (!codeDoc) {
      const generatedCode = crypto.randomBytes(3).toString('hex').toUpperCase();
      const tomorrowMidnight = new Date();
      tomorrowMidnight.setUTCDate(tomorrowMidnight.getUTCDate() + 1);
      tomorrowMidnight.setUTCHours(0, 0, 0, 0);

      codeDoc = await DailyAttendanceCode.createHashedCode(todayKey, generatedCode, tomorrowMidnight);
    }

    return successResponse(
      res,
      {
        date: codeDoc.date,
        code: codeDoc.displayCode,
        expiresAt: codeDoc.expiresAt,
        isActive: codeDoc.isActive,
      },
      'Current daily attendance code retrieved'
    );
  } catch (error) {
    next(error);
  }
};
