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
  EmailDeliveryLog,
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
      joiningDate,
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
        picture: application.photoUrl || null,
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
      if (application.photoUrl) studentUser.picture = application.photoUrl;
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
    let parsedJoiningDate = new Date();
    if (joiningDate) {
      if (typeof joiningDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(joiningDate)) {
        const [y, m, d] = joiningDate.split('-').map(Number);
        parsedJoiningDate = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
      } else {
        const d = new Date(joiningDate);
        if (!isNaN(d.getTime())) {
          parsedJoiningDate = d;
        }
      }
    }
    const anchorDay = parsedJoiningDate.getUTCDate ? parsedJoiningDate.getUTCDate() : parsedJoiningDate.getDate();
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
    application.joiningDate = parsedJoiningDate;
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

    // 8. Send Enriched Approval Email to student with Complete Access & Attendance Guide
    try {
      const loginUrl = 'https://libraryhubnawalpur.netlify.app/login';
      const formattedJoiningDate = parsedJoiningDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      await sendTransactionalEmail({
        to: studentUser.email,
        recipientName: studentUser.name,
        userId: studentUser._id,
        emailType: 'ADMISSION_APPROVED',
        subject: `🎉 Congratulations! Your Library Hub Membership is Approved & Enrolled`,
        text: `Hello ${studentUser.name},\n\nCongratulations! Your admission application (${application.applicationNumber}) has been verified and approved by the administration. You are now officially enrolled at Library Hub Nawalpur!\n\nMEMBERSHIP DETAILS:\n- Shift & Plan: ${planName}\n- Joining Date: ${formattedJoiningDate}\n- Monthly Fee: ₹${monthlyFee}\n- Initial Payment: ₹${initialPayment}\n- Registered Email: ${studentUser.email}\n\nHOW TO ACCESS YOUR DASHBOARD:\n1. Open ${loginUrl}\n2. Click "Sign in with Google" using your registered email: ${studentUser.email}\n3. Your student portal will open with your shift details and fee receipts.\n\nHOW TO MARK DAILY ATTENDANCE (CHECK-IN & CHECK-OUT):\n1. Daily Desk Code: Every morning at the library front desk, a daily attendance code is provided.\n2. Check-In: When you arrive at the library, open your dashboard and enter the Daily Code to mark your Check-In time.\n3. Check-Out: When leaving the library after your study session, remember to click Check-Out on your dashboard to accurately record your study hours.\n\nLIBRARY RULES & ETIQUETTE:\n- Maintain complete pin-drop silence in the study hall.\n- Always use headphones/earphones for video lectures.\n- Keep your study desk clean and orderly.\n\nWelcome to Library Hub Nawalpur!\nLocation: Opposite Kali Mandir, Main Road Nawalpur, Salempur, Deoria (UP)\nEmail: libraryhubnawalpur@gmail.com`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #0f172a;">
            
            {/* Header */}
            <div style="text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
              <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">LIBRARY HUB</h1>
              <p style="color: #d97706; font-size: 13px; font-weight: bold; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">NAWALPUR · SELF-STUDY & READING LIBRARY</p>
            </div>

            {/* Approved Banner */}
            <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
              <span style="display: inline-block; font-size: 11px; font-weight: 800; background-color: #059669; color: #ffffff; padding: 4px 12px; border-radius: 9999px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                ✓ ADMISSION APPROVED & ENROLLED
              </span>
              <h2 style="margin: 4px 0 0 0; color: #065f46; font-size: 20px; font-weight: 800;">
                Congratulations, ${studentUser.name}!
              </h2>
              <p style="font-size: 13px; color: #047857; margin: 6px 0 0 0;">
                Application Ref: <strong>${application.applicationNumber}</strong>
              </p>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 16px;">
              Your documents have been verified and your admission to <strong>Library Hub Nawalpur</strong> is now officially approved. Your student account and membership portal are active.
            </p>

            {/* Membership Details Card */}
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                📋 Your Membership Summary
              </h3>
              <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #64748b; width: 40%;">Assigned Shift & Plan:</td>
                  <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${planName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Shift Timings:</td>
                  <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${shiftTimings || 'As per shift schedule'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Joining / Start Date:</td>
                  <td style="padding: 6px 0; font-weight: 700; color: #d97706;">${formattedJoiningDate}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Monthly Fee:</td>
                  <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">₹${monthlyFee}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Initial Fee Paid:</td>
                  <td style="padding: 6px 0; font-weight: 700; color: #059669;">₹${initialPayment}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Registered Gmail:</td>
                  <td style="padding: 6px 0; font-weight: 600; color: #0284c7; word-break: break-all;">${studentUser.email}</td>
                </tr>
              </table>
            </div>

            {/* Step 1: Dashboard Access */}
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 800; color: #166534; display: flex; align-items: center;">
                🔑 Step 1: Dashboard Access Kaise Karein
              </h3>
              <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #15803d; line-height: 1.6;">
                <li style="margin-bottom: 6px;">Neeche diye gaye <strong>"Access Student Dashboard"</strong> button par click karein.</li>
                <li style="margin-bottom: 6px;"><strong>"Sign in with Google"</strong> choose karein aur wahi Gmail address (<strong>${studentUser.email}</strong>) select karein jisse aapne register kiya tha.</li>
                <li>Login karte hi aapka personalized dashboard open ho jayega jisme aap apna seat shift, monthly fees receipt, aur live attendance status dekh sakte hain.</li>
              </ol>
            </div>

            {/* Step 2: Daily Attendance Guide */}
            <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 800; color: #92400e;">
                ⏱️ Step 2: Daily Attendance Kaise Mark Karein (Check-In & Check-Out)
              </h3>
              <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #854d0e; line-height: 1.6;">
                <li style="margin-bottom: 8px;">
                  <strong>Daily OTP / Desk Code:</strong> Har din library front desk par ek Daily Attendance Code generate hota hai.
                </li>
                <li style="margin-bottom: 8px;">
                  <strong>Check-In:</strong> Library pahunchte hi apne phone me student dashboard open karein, <strong>"Mark Check-In"</strong> par click karein aur desk par diya gaya Daily Code enter karein. Isse aapka arrival time record ho jayega.
                </li>
                <li style="margin-bottom: 8px;">
                  <strong>Check-Out:</strong> Library se padhai poori karke nikalte waqt dashboard me <strong>"Check-Out"</strong> button dabana na bhoolein. Isse aapke kul study hours (padhai ke ghante) bilkul accurate record honge.
                </li>
                <li>
                  <strong>Regular Streak:</strong> Dashboard me aap apna monthly attendance chart aur study streaks dekh kar apna target maintain kar sakte hain.
                </li>
              </ol>
            </div>

            {/* Library Rules */}
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase;">
                📖 Library Rules & Etiquette
              </h3>
              <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #475569; line-height: 1.6;">
                <li>Reading hall me shanti (pin-drop silence) banaye rakhein. Mobile phones ko silent mode par rakhein.</li>
                <li>Video lectures ya audio classes dekhne ke liye earphones / headphones ka prayog anivarya hai.</li>
                <li>Apni designated desk aur library premises ko saaf-suthra rakhein.</li>
              </ul>
            </div>

            {/* CTA Button */}
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" style="background-color: #0f172a; color: #ffffff; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);">
                Open Student Dashboard →
              </a>
            </div>

            {/* Footer */}
            <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
              <strong style="color: #64748b;">Library Hub Nawalpur</strong><br />
              Main Road, Nawalpur Opposite Kali Mandir, Salempur, Deoria - 274509, Uttar Pradesh<br />
              Support: <a href="mailto:libraryhubnawalpur@gmail.com" style="color: #d97706; text-decoration: none;">libraryhubnawalpur@gmail.com</a>
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
        recipientName: application.name,
        emailType: 'ADMISSION_REJECTED',
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

/**
 * List all emails sent by the website / system (Email Delivery Logs)
 */
export async function listEmailLogs(req, res, next) {
  try {
    const {
      page = 1,
      limit = 25,
      search = '',
      status = 'ALL',
      emailType = 'ALL',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (status && status !== 'ALL') {
      filter.status = status.toUpperCase();
    }

    if (emailType && emailType !== 'ALL') {
      filter.emailType = emailType.toUpperCase();
    }

    if (search && search.trim()) {
      const q = search.trim();
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      filter.$or = [
        { recipientEmail: searchRegex },
        { recipientName: searchRegex },
        { subject: searchRegex },
      ];
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [logs, totalFiltered, totalAll, sentCount, failedCount, todayCount] = await Promise.all([
      EmailDeliveryLog.find(filter)
        .populate('userId', 'name email phone picture')
        .sort({ sentAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      EmailDeliveryLog.countDocuments(filter),
      EmailDeliveryLog.countDocuments(),
      EmailDeliveryLog.countDocuments({ status: 'SENT' }),
      EmailDeliveryLog.countDocuments({ status: 'FAILED' }),
      EmailDeliveryLog.countDocuments({ sentAt: { $gte: todayStart } }),
    ]);

    return successResponse(res, {
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalFiltered,
        totalPages: Math.ceil(totalFiltered / limitNum),
      },
      stats: {
        total: totalAll,
        sent: sentCount,
        failed: failedCount,
        today: todayCount,
      },
    });
  } catch (err) {
    logger.error(`Error in listEmailLogs: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Get single Email Delivery Log with complete rendered HTML body
 */
export async function getEmailLogById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Invalid Email Log ID', 400);
    }

    const log = await EmailDeliveryLog.findById(id)
      .populate('userId', 'name email phone picture')
      .lean();

    if (!log) {
      return errorResponse(res, 'Email delivery log not found', 404);
    }

    return successResponse(res, { log });
  } catch (err) {
    logger.error(`Error in getEmailLogById: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Resend an email from the log (e.g. if it previously failed or student requested)
 */
export async function resendEmail(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Invalid Email Log ID', 400);
    }

    const log = await EmailDeliveryLog.findById(id);
    if (!log) {
      return errorResponse(res, 'Email delivery log not found', 404);
    }

    const result = await sendTransactionalEmail({
      to: log.recipientEmail,
      recipientName: log.recipientName,
      userId: log.userId,
      emailType: log.emailType,
      subject: log.subject,
      html: log.htmlContent,
      text: log.textContent,
      metadata: { ...log.metadata, resentFromLogId: log._id },
    });

    await AuditLog.create({
      actor: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
      },
      action: 'EMAIL_RESENT',
      targetEntity: 'EmailDeliveryLog',
      targetId: log._id,
      beforeState: { status: log.status, error: log.error },
      afterState: { success: result.success, messageId: result.messageId, error: result.error },
      reason: `Admin triggered resend of email "${log.subject}" to ${log.recipientEmail}`,
    });

    if (result.success) {
      return successResponse(res, { messageId: result.messageId }, `Email resent successfully to ${log.recipientEmail}!`);
    } else {
      return errorResponse(res, `Failed to resend email: ${result.error}`, 500);
    }
  } catch (err) {
    logger.error(`Error in resendEmail: ${err.message}`, { error: err });
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
  listEmailLogs,
  getEmailLogById,
  resendEmail,
};
