import mongoose from 'mongoose';
import {
  User,
  Membership,
  Attendance,
  FeeInvoice,
  Payment,
  AuditLog,
  SiteSetting,
  RegistrationApplication,
} from '../models/index.js';
import {
  calculateNextBillingDate,
  generateInvoiceNumber,
  calculateDueDate,
  formatDateKey,
} from '../utils/billingCalculator.js';
import { allocatePayment } from '../utils/paymentAllocation.js';
import { sendTransactionalEmail } from '../services/emailService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import logger from '../utils/logger.js';

/**
 * Escape string for safe CSV export (Prevents CSV / Formula Injection attacks)
 */
export function escapeCsvCell(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * List all students with search, membership status filtering, and pagination
 */
export async function listStudents(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1 && process.env.NODE_ENV !== 'test') {
      return successResponse(res, {
        students: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });
    }

    const { search, status, page = 1, limit = 20 } = req.query;
    const query = { role: 'student' };

    if (status === 'active') {
      query.isMember = true;
    } else if (status === 'inactive') {
      query.isMember = false;
    }

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [students, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      User.countDocuments(query),
    ]);

    const studentIds = students.map((s) => s._id);
    const [memberships, invoices] = await Promise.all([
      Membership.find({ userId: { $in: studentIds } }).sort({ createdAt: -1 }).lean(),
      FeeInvoice.find({ userId: { $in: studentIds }, balanceInPaise: { $gt: 0 } }).lean(),
    ]);

    const enriched = students.map((s) => {
      const memberRecord = memberships.find((m) => String(m.userId) === String(s._id));
      const duesPaise = invoices
        .filter((inv) => String(inv.userId) === String(s._id))
        .reduce((sum, inv) => sum + (inv.balanceInPaise || 0), 0);

      return {
        ...s,
        membership: memberRecord || null,
        totalDuePaise: duesPaise,
      };
    });

    return successResponse(res, {
      students: enriched,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    logger.error(`Error in listStudents: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Get full 360-degree student profile
 */
export async function getStudentDetail(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Invalid user ID', 400);
    }

    const user = await User.findById(id).lean();
    if (!user) {
      return errorResponse(res, 'Student not found', 404);
    }

    const [memberships, attendanceHistory, invoices, payments] = await Promise.all([
      Membership.find({ userId: id }).sort({ createdAt: -1 }).lean(),
      Attendance.find({ userId: id }).sort({ date: -1 }).limit(60).lean(),
      FeeInvoice.find({ userId: id }).sort({ issueDate: -1 }).lean(),
      Payment.find({ userId: id }).sort({ paidAt: -1 }).lean(),
    ]);

    const totalDuePaise = invoices.reduce((sum, inv) => sum + (inv.balanceInPaise || 0), 0);
    const totalPaidPaise = payments.filter((p) => !p.isReversed).reduce((sum, p) => sum + (p.amountInPaise || 0), 0);

    return successResponse(res, {
      user,
      memberships,
      activeMembership: memberships.find((m) => m.status === 'active') || null,
      attendanceSummary: {
        totalSessions: attendanceHistory.length,
        recentSessions: attendanceHistory.slice(0, 10),
      },
      billingSummary: {
        invoices,
        payments,
        totalDuePaise,
        totalPaidPaise,
      },
    });
  } catch (err) {
    logger.error(`Error in getStudentDetail: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Append-only Audit Log query (Admin only)
 */
export async function listAuditLogs(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1 && process.env.NODE_ENV !== 'test') {
      return successResponse(res, {
        logs: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
      });
    }

    const { action, targetEntity, page = 1, limit = 50 } = req.query;
    const query = {};

    if (action) query.action = action;
    if (targetEntity) {
      query.$or = [{ targetEntity }, { entityType: targetEntity }];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ timestamp: -1, createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      AuditLog.countDocuments(query),
    ]);

    return successResponse(res, {
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    logger.error(`Error in listAuditLogs: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Export CSV reports with formula-injection escaping
 */
export async function exportCsvReport(req, res, next) {
  try {
    const { type = 'students' } = req.query;

    let headers = [];
    let rows = [];
    let filename = `library-hub-${type}-${Date.now()}.csv`;

    if (type === 'students') {
      headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Is Member', 'Created At'];
      const students = await User.find({ role: 'student' }).sort({ name: 1 }).lean();
      rows = students.map((s) => [
        s._id,
        s.name,
        s.email,
        s.phone,
        s.role,
        s.isMember ? 'Yes' : 'No',
        s.createdAt ? s.createdAt.toISOString() : '',
      ]);
    } else if (type === 'attendance') {
      headers = ['Date (IST)', 'Student Name', 'Email', 'Check In Time', 'Check Out Time', 'Status'];
      const attendance = await Attendance.find()
        .populate('userId', 'name email')
        .sort({ date: -1, inTime: -1 })
        .limit(1000)
        .lean();

      rows = attendance.map((a) => [
        a.date,
        a.userId ? a.userId.name : 'Unknown',
        a.userId ? a.userId.email : 'Unknown',
        a.inTime ? a.inTime.toISOString() : '',
        a.outTime ? a.outTime.toISOString() : '',
        a.status,
      ]);
    } else if (type === 'billing') {
      headers = ['Invoice Number', 'Student Name', 'Email', 'Issue Date', 'Due Date', 'Fee (₹)', 'Paid (₹)', 'Balance (₹)', 'Status'];
      const invoices = await FeeInvoice.find()
        .populate('userId', 'name email')
        .sort({ issueDate: -1 })
        .limit(1000)
        .lean();

      rows = invoices.map((inv) => [
        inv.invoiceNumber,
        inv.userId ? inv.userId.name : 'Unknown',
        inv.userId ? inv.userId.email : 'Unknown',
        inv.issueDate ? inv.issueDate.toISOString().split('T')[0] : '',
        inv.dueDate ? inv.dueDate.toISOString().split('T')[0] : '',
        (inv.feeAmountInPaise / 100).toFixed(2),
        (inv.amountPaidInPaise / 100).toFixed(2),
        (inv.balanceInPaise / 100).toFixed(2),
        inv.status,
      ]);
    } else {
      return errorResponse(res, 'Invalid export type. Supported types: students, attendance, billing', 400);
    }

    const csvContent = [
      headers.map(escapeCsvCell).join(','),
      ...rows.map((row) => row.map(escapeCsvCell).join(',')),
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (err) {
    logger.error(`Error in exportCsvReport: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Get Site Settings
 */
export async function getSiteSettings(req, res, next) {
  try {
    const settings = await SiteSetting.find().lean();
    const map = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });
    return successResponse(res, { settings: map });
  } catch (err) {
    logger.error(`Error in getSiteSettings: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Update Site Setting (Admin only)
 */
export async function updateSiteSetting(req, res, next) {
  try {
    const { key, value, description } = req.body;
    if (!key) {
      return errorResponse(res, 'Setting key is required', 400);
    }

    const before = await SiteSetting.findOne({ key });
    const setting = await SiteSetting.findOneAndUpdate(
      { key },
      { key, value, description: description || (before ? before.description : '') },
      { upsert: true, new: true }
    );

    await AuditLog.create({
      actor: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
      },
      action: 'SETTING_UPDATE',
      targetEntity: 'SiteSetting',
      targetId: setting._id,
      beforeState: before ? { value: before.value } : null,
      afterState: { value },
      reason: `Updated site setting "${key}"`,
    });

    return successResponse(res, { setting }, `Setting "${key}" updated successfully`);
  } catch (err) {
    logger.error(`Error in updateSiteSetting: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * List Member Registration Applications (Admin Only)
 * GET /api/v1/admin/applications
 */
export async function listRegistrationApplications(req, res, next) {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { applicationNumber: regex },
        { targetExam: regex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [applications, total, pendingCount] = await Promise.all([
      RegistrationApplication.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      RegistrationApplication.countDocuments(query),
      RegistrationApplication.countDocuments({ status: 'PENDING' }),
    ]);

    return successResponse(res, {
      applications,
      pendingCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    logger.error(`Error in listRegistrationApplications: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Approve Member Registration Application & Enroll Student
 * POST /api/v1/admin/applications/:id/approve
 */
export async function approveRegistrationApplication(req, res, next) {
  try {
    const { id } = req.params;
    const {
      slotType = 'day_shift',
      shiftTimings = 'Day Shift (7 AM – 8 PM)',
      planName = 'Day Shift Plan (7 AM – 8 PM)',
      monthlyFee = 500,
      initialPayment = 500,
      paymentMethod = 'CASH',
      referenceNumber = '',
      notes = '',
    } = req.body;

    const application = await RegistrationApplication.findById(id);
    if (!application) {
      return errorResponse(res, 'Registration application not found', 404);
    }

    if (application.status !== 'PENDING') {
      return errorResponse(
        res,
        `Cannot approve application with status "${application.status}"`,
        400
      );
    }

    // 1. Create or update User record
    let studentUser = await User.findOne({ email: application.email });
    if (!studentUser) {
      studentUser = new User({
        email: application.email,
        name: application.name,
        phone: application.phone,
        fatherName: application.fatherName,
        emergencyContact: application.emergencyContact,
        address: application.address,
        targetExam: application.targetExam,
        aadharFrontUrl: application.aadharFrontUrl,
        aadharBackUrl: application.aadharBackUrl,
        role: 'student',
        isMember: true,
        isActive: true,
        registrationStatus: 'APPROVED',
      });
    } else {
      studentUser.name = application.name;
      studentUser.phone = application.phone;
      studentUser.fatherName = application.fatherName;
      studentUser.emergencyContact = application.emergencyContact;
      studentUser.address = application.address;
      studentUser.targetExam = application.targetExam;
      studentUser.aadharFrontUrl = application.aadharFrontUrl;
      studentUser.aadharBackUrl = application.aadharBackUrl;
      studentUser.isMember = true;
      studentUser.isActive = true;
      studentUser.registrationStatus = 'APPROVED';
      studentUser.deactivationReason = null;
    }
    await studentUser.save();

    // 2. Check for existing active membership
    const existingActive = await Membership.findOne({
      userId: studentUser._id,
      status: 'active',
    });
    if (existingActive) {
      return errorResponse(
        res,
        'This student already has an active membership. Deactivate it first before approving a new one.',
        409
      );
    }

    // 3. Create active Membership
    const parsedJoiningDate = new Date();
    const anchorDay = parsedJoiningDate.getDate();
    const nextBillDate = calculateNextBillingDate(parsedJoiningDate, anchorDay);
    const monthlyFeeInPaise = Math.round(Number(monthlyFee) * 100);

    // Map slotType and planId cleanly to schema enums
    let mappedPlanId = 'day-shift';
    let mappedSlotType = 'DAY';
    const normalizedSlot = String(slotType || '').toLowerCase();
    if (normalizedSlot.includes('night')) {
      mappedPlanId = 'night-shift';
      mappedSlotType = 'NIGHT';
    } else if (normalizedSlot.includes('24') || normalizedSlot.includes('round') || normalizedSlot.includes('full')) {
      mappedPlanId = 'full-day-24h';
      mappedSlotType = 'TWENTY_FOUR_HOURS';
    } else {
      mappedPlanId = 'day-shift';
      mappedSlotType = 'DAY';
    }

    const membership = await Membership.create({
      userId: studentUser._id,
      planId: mappedPlanId,
      planName: planName || (mappedSlotType === 'DAY' ? 'Day Shift Plan (7 AM – 8 PM)' : mappedSlotType === 'NIGHT' ? 'Night Shift Plan (8 PM – 8 AM)' : '24 Hours Dedicated Plan'),
      slotType: mappedSlotType,
      shiftTimings: shiftTimings || (mappedSlotType === 'DAY' ? '7:00 AM – 8:00 PM' : mappedSlotType === 'NIGHT' ? '8:00 PM – 8:00 AM' : 'Round the Clock (24×7)'),
      joiningDate: parsedJoiningDate,
      billingAnchorDay: anchorDay,
      monthlyFeeInPaise,
      status: 'active',
      notes: notes || `Self-registration approved (Ref: ${application.applicationNumber})`,
    });

    studentUser.currentMembership = membership._id;
    await studentUser.save();

    // 4. Create initial FeeInvoice
    const periodEnd = new Date(nextBillDate.getTime() - 24 * 60 * 60 * 1000);
    const invoiceNumber = generateInvoiceNumber('INV', new Date());
    const dueDate = calculateDueDate(parsedJoiningDate, 7);
    const periodKey = `${membership._id}_${formatDateKey(parsedJoiningDate)}`;

    const initialInvoice = await FeeInvoice.create({
      invoiceNumber,
      membershipId: membership._id,
      userId: studentUser._id,
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
      notes: `Enrollment fee invoice for ${application.applicationNumber}`,
    });

    // 5. If initial payment recorded, allocate payment
    const initialPaymentInPaise = Math.round(Number(initialPayment) * 100);
    let paymentReceipt = null;

    if (initialPaymentInPaise > 0) {
      const adminId = req.user?._id || new mongoose.Types.ObjectId('507f1f77bcf86cd799439099');
      const alloc = await allocatePayment({
        membership,
        user: studentUser,
        amountInPaise: initialPaymentInPaise,
        method: paymentMethod || 'CASH',
        referenceNumber: referenceNumber || '',
        notes: `Initial fee collection for ${application.applicationNumber}`,
        adminId,
        paidAt: parsedJoiningDate,
        primaryInvoiceId: initialInvoice._id,
      });
      if (alloc && alloc.payments && alloc.payments.length > 0) {
        paymentReceipt = alloc.payments[0];
      }
    }

    // 6. Update Application Status to APPROVED
    application.status = 'APPROVED';
    application.reviewedByAdminId = req.user?._id;
    application.reviewedAt = new Date();
    application.createdUserId = studentUser._id;
    application.membershipId = membership._id;
    await application.save();

    // 7. Audit Log
    await AuditLog.create({
      actor: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
      },
      action: 'APPLICATION_APPROVED',
      targetEntity: 'RegistrationApplication',
      targetId: application._id,
      afterState: {
        applicationNumber: application.applicationNumber,
        studentEmail: studentUser.email,
        membershipId: membership._id,
        monthlyFeeInPaise,
        initialPaymentInPaise,
      },
      reason: `Approved registration ${application.applicationNumber} and activated student portal`,
    });

    // 8. Send Approval Email to student
    try {
      const loginUrl = 'https://libraryhubnawalpur.netlify.app/login';
      await sendTransactionalEmail({
        to: studentUser.email,
        subject: `🎉 Congratulations! Your Library Hub Membership is Approved & Active`,
        text: `Hello ${studentUser.name},\n\nYour member registration application (${application.applicationNumber}) has been approved by the administration! Your student dashboard is now live.\n\nMembership Shift: ${planName}\nMonthly Fee: ₹${monthlyFee}\nInitial Payment Paid: ₹${initialPayment}\n\nYou can now sign in using your Google account at:\n${loginUrl}\n\nWelcome to Library Hub Nawalpur!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #0f172a; margin: 0;">Library Hub Nawalpur</h2>
              <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Self-Study & Reading Library</p>
            </div>
            <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
              <span style="display: inline-block; font-size: 12px; font-weight: bold; background-color: #10b981; color: #ffffff; padding: 4px 10px; border-radius: 9999px; margin-bottom: 8px;">APPROVED & ACTIVE</span>
              <h3 style="margin: 0; color: #065f46; font-size: 18px;">Your Student Dashboard is Live!</h3>
              <p style="font-size: 13px; color: #047857; margin: 6px 0 0 0;">Application Ref: <strong>${application.applicationNumber}</strong></p>
            </div>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">Hello <strong>${studentUser.name}</strong>,</p>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">
              Congratulations! Your admission to <strong>Library Hub Nawalpur</strong> has been verified and approved by the administration.
            </p>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 18px 0; font-size: 13px; color: #334155;">
              <div style="margin-bottom: 8px;"><strong>Assigned Shift:</strong> ${planName}</div>
              <div style="margin-bottom: 8px;"><strong>Monthly Fee:</strong> ₹${monthlyFee}</div>
              <div style="margin-bottom: 8px;"><strong>Amount Paid:</strong> ₹${initialPayment}</div>
              <div><strong>Registered Email:</strong> ${studentUser.email}</div>
            </div>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">
              You can now sign in to your Student Dashboard using your registered Google account to view your seat details, verify daily attendance, and track payment receipts:
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${loginUrl}" style="background-color: #0f172a; color: #ffffff; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; display: inline-block;">
                Access Student Dashboard →
              </a>
            </div>
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
              Library Hub Nawalpur · Your Space. Your Focus. Your Success.
            </div>
          </div>
        `,
      });
    } catch (mailErr) {
      logger.warn(`Could not send approval email: ${mailErr.message}`);
    }

    return successResponse(
      res,
      {
        application,
        user: studentUser,
        membership,
        paymentReceipt,
      },
      `Application ${application.applicationNumber} approved and student enrolled successfully!`
    );
  } catch (err) {
    logger.error(`Error in approveRegistrationApplication: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Reject Member Registration Application
 * POST /api/v1/admin/applications/:id/reject
 */
export async function rejectRegistrationApplication(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason?.trim()) {
      return errorResponse(res, 'Rejection reason is required', 400);
    }

    const application = await RegistrationApplication.findById(id);
    if (!application) {
      return errorResponse(res, 'Registration application not found', 404);
    }

    application.status = 'REJECTED';
    application.rejectionReason = reason.trim();
    application.reviewedByAdminId = req.user?._id;
    application.reviewedAt = new Date();
    await application.save();

    // If an inactive student account exists, update status
    await User.updateMany(
      { email: application.email, registrationStatus: 'PENDING' },
      { registrationStatus: 'REJECTED', isActive: false }
    );

    // Audit Log
    await AuditLog.create({
      actor: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
      },
      action: 'APPLICATION_REJECTED',
      targetEntity: 'RegistrationApplication',
      targetId: application._id,
      afterState: { reason: reason.trim() },
      reason: `Rejected registration ${application.applicationNumber}: ${reason.trim()}`,
    });

    // Send email to student
    try {
      await sendTransactionalEmail({
        to: application.email,
        subject: `Update regarding your Library Hub Nawalpur Application (${application.applicationNumber})`,
        text: `Hello ${application.name},\n\nYour application (${application.applicationNumber}) could not be approved at this time.\n\nReason: ${reason.trim()}\n\nPlease visit the front desk or contact us for assistance.\n\nLibrary Hub Nawalpur`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #0f172a; margin: 0;">Library Hub Nawalpur</h2>
            </div>
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <h3 style="margin: 0; color: #991b1b; font-size: 16px;">Application Update: Needs Correction</h3>
              <p style="font-size: 13px; color: #7f1d1d; margin: 6px 0 0 0;">Ref: <strong>${application.applicationNumber}</strong></p>
            </div>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">Hello <strong>${application.name}</strong>,</p>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">
              Thank you for applying to Library Hub. Your registration application could not be approved due to the following reason:
            </p>
            <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 16px 0; font-size: 14px; color: #1e293b;">
              <strong>Reason:</strong> ${reason.trim()}
            </div>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">
              Please visit the Library Hub front desk or re-submit with clear and valid Aadhar documents.
            </p>
          </div>
        `,
      });
    } catch (mailErr) {
      logger.warn(`Could not send rejection email: ${mailErr.message}`);
    }

    return successResponse(
      res,
      { application },
      `Application ${application.applicationNumber} has been rejected.`
    );
  } catch (err) {
    logger.error(`Error in rejectRegistrationApplication: ${err.message}`, { error: err });
    return next(err);
  }
}

export default {
  listStudents,
  getStudentDetail,
  listAuditLogs,
  exportCsvReport,
  getSiteSettings,
  updateSiteSetting,
  listRegistrationApplications,
  approveRegistrationApplication,
  rejectRegistrationApplication,
};
