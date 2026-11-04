import mongoose from 'mongoose';
import {
  User,
  Membership,
  Attendance,
  FeeInvoice,
  Payment,
  AuditLog,
  SiteSetting,
} from '../models/index.js';
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

export default {
  listStudents,
  getStudentDetail,
  listAuditLogs,
  exportCsvReport,
  getSiteSettings,
  updateSiteSetting,
};
