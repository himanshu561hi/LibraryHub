import mongoose from 'mongoose';
import { Attendance, User, Membership, AuditLog, DailyAttendanceCode } from '../models/index.js';
import { getKolkataDateKey, verifyDailyCode } from '../utils/attendanceCode.js';
import { sendAttendanceInEmail, sendAttendanceOutEmail } from '../services/emailService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import logger from '../utils/logger.js';

/**
 * Mark Attendance Check IN (Student)
 */
export async function markCheckIn(req, res, next) {
  try {
    const { code } = req.body;
    const userId = req.user._id;

    if (!code || !code.trim()) {
      return errorResponse(res, 'Today\'s 6-character daily attendance code is required', 400);
    }

    const isValid = await verifyDailyCode(code);
    if (!isValid) {
      return errorResponse(res, 'Invalid or expired daily attendance code. Please check the notice board or ask the front desk.', 401);
    }

    const dateKey = getKolkataDateKey();

    let attendance = await Attendance.findOne({ userId, date: dateKey });
    if (attendance && attendance.inTime) {
      const timeStr = attendance.inTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
      return errorResponse(res, `You have already checked in today at ${timeStr} (IST). Duplicate check-in is not permitted.`, 409);
    }

    const now = new Date();

    if (!attendance) {
      attendance = await Attendance.create({
        userId,
        date: dateKey,
        inTime: now,
        status: 'IN',
        codeDateUsed: dateKey,
      });
    } else {
      attendance.inTime = now;
      attendance.status = 'IN';
      attendance.codeDateUsed = dateKey;
      await attendance.save();
    }

    const user = (await User.findById(userId)) || req.user;
    const timeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });

    sendAttendanceInEmail({
      user,
      timeStr,
      dateStr: dateKey,
    })
      .then(() => {
        Attendance.findByIdAndUpdate(attendance._id, { inConfirmedByEmail: true }).exec();
      })
      .catch((e) => logger.error(`Email delivery failure on check-in: ${e.message}`));

    logger.info(`Attendance CHECK-IN recorded for ${user?.email || 'student'} on ${dateKey} at ${timeStr}`);

    return successResponse(
      res,
      {
        attendance: {
          id: attendance._id,
          date: attendance.date,
          inTime: attendance.inTime,
          status: attendance.status,
        },
      },
      `Check-in recorded at ${timeStr} (IST). Welcome to Library Hub!`
    );
  } catch (err) {
    logger.error(`Error in markCheckIn: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Mark Attendance Check OUT (Student)
 */
export async function markCheckOut(req, res, next) {
  try {
    const { code } = req.body;
    const userId = req.user._id;

    if (!code || !code.trim()) {
      return errorResponse(res, 'Today\'s 6-character daily attendance code is required', 400);
    }

    const isValid = await verifyDailyCode(code);
    if (!isValid) {
      return errorResponse(res, 'Invalid or expired daily attendance code. Please check the notice board or ask the front desk.', 401);
    }

    const dateKey = getKolkataDateKey();
    const attendance = await Attendance.findOne({ userId, date: dateKey });

    if (!attendance || !attendance.inTime) {
      return errorResponse(res, 'You have not checked in for today yet. You must check in before checking out.', 400);
    }

    if (attendance.outTime) {
      const timeStr = attendance.outTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
      return errorResponse(res, `You have already checked out today at ${timeStr} (IST).`, 409);
    }

    const now = new Date();
    const durationMinutes = Math.max(1, Math.round((now.getTime() - attendance.inTime.getTime()) / 60000));

    attendance.outTime = now;
    attendance.status = 'COMPLETED';
    await attendance.save();

    const user = (await User.findById(userId)) || req.user;
    const timeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });

    sendAttendanceOutEmail({
      user,
      timeStr,
      dateStr: dateKey,
      durationMinutes,
    })
      .then(() => {
        Attendance.findByIdAndUpdate(attendance._id, { outConfirmedByEmail: true }).exec();
      })
      .catch((e) => logger.error(`Email delivery failure on check-out: ${e.message}`));

    logger.info(`Attendance CHECK-OUT recorded for ${user?.email || 'student'} on ${dateKey}. Duration: ${durationMinutes} mins`);

    return successResponse(
      res,
      {
        attendance: {
          id: attendance._id,
          date: attendance.date,
          inTime: attendance.inTime,
          outTime: attendance.outTime,
          durationMinutes,
          status: attendance.status,
        },
      },
      `Check-out recorded at ${timeStr} (IST). Have a wonderful day!`
    );
  } catch (err) {
    logger.error(`Error in markCheckOut: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Get student's status for today
 */
export async function getTodayStatus(req, res, next) {
  try {
    const userId = req.user._id;
    const dateKey = getKolkataDateKey();

    if (mongoose.connection.readyState !== 1 && process.env.NODE_ENV !== 'test') {
      return successResponse(res, {
        date: dateKey,
        hasCheckedIn: false,
        hasCheckedOut: false,
        inTime: null,
        outTime: null,
        durationMinutes: 0,
        status: 'NOT_MARKED',
      });
    }

    const attendance = await Attendance.findOne({ userId, date: dateKey }).lean();

    const hasCheckedIn = Boolean(attendance && attendance.inTime);
    const hasCheckedOut = Boolean(attendance && attendance.outTime);
    let durationMinutes = 0;
    if (hasCheckedIn && hasCheckedOut) {
      durationMinutes = Math.round((new Date(attendance.outTime).getTime() - new Date(attendance.inTime).getTime()) / 60000);
    } else if (hasCheckedIn) {
      durationMinutes = Math.round((Date.now() - new Date(attendance.inTime).getTime()) / 60000);
    }

    return successResponse(res, {
      date: dateKey,
      hasCheckedIn,
      hasCheckedOut,
      inTime: attendance ? attendance.inTime : null,
      outTime: attendance ? attendance.outTime : null,
      durationMinutes,
      status: attendance ? attendance.status : 'NOT_MARKED',
    });
  } catch (err) {
    logger.error(`Error in getTodayStatus: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Get student's personal attendance history
 */
export async function getMyHistory(req, res, next) {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 30 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    if (mongoose.connection.readyState !== 1 && process.env.NODE_ENV !== 'test') {
      return successResponse(res, {
        history: [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: 0,
          totalPages: 0,
        },
      });
    }

    const [history, total] = await Promise.all([
      Attendance.find({ userId })
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Attendance.countDocuments({ userId }),
    ]);

    return successResponse(res, {
      history,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    logger.error(`Error in getMyHistory: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Admin: Live Attendance Monitor for today
 */
export async function getAdminLiveAttendance(req, res, next) {
  try {
    const dateKey = req.query.date || getKolkataDateKey();

    if (mongoose.connection.readyState !== 1 && process.env.NODE_ENV !== 'test') {
      return successResponse(res, {
        date: dateKey,
        totalActiveMembers: 0,
        totalMarkedToday: 0,
        currentlyPresentCount: 0,
        completedCount: 0,
        absentCount: 0,
        currentlyPresent: [],
        completedSessions: [],
        allRecords: [],
      });
    }

    const [activeMemberships, records] = await Promise.all([
      Membership.find({ status: 'active' })
        .populate('userId', 'name email phone picture isMember')
        .lean(),
      Attendance.find({ date: dateKey })
        .populate('userId', 'name email phone picture isMember')
        .sort({ inTime: -1 })
        .lean(),
    ]);

    const attendanceMap = new Map();
    records.forEach((r) => {
      const uId = r.userId?._id ? String(r.userId._id) : String(r.userId);
      attendanceMap.set(uId, r);
    });

    const roster = [];
    const processedUserIds = new Set();

    activeMemberships.forEach((m) => {
      if (!m.userId) return;
      const uId = String(m.userId._id || m.userId);
      processedUserIds.add(uId);
      const att = attendanceMap.get(uId);

      if (att) {
        roster.push({
          _id: att._id,
          userId: m.userId,
          membershipId: m._id,
          planName: m.planName,
          shiftTimings: m.shiftTimings,
          inTime: att.inTime,
          outTime: att.outTime,
          durationMinutes: att.durationMinutes,
          isPresent: true,
          status: att.status,
          date: dateKey,
        });
      } else {
        roster.push({
          _id: `absent_${m._id}`,
          userId: m.userId,
          membershipId: m._id,
          planName: m.planName,
          shiftTimings: m.shiftTimings,
          inTime: null,
          outTime: null,
          durationMinutes: 0,
          isPresent: false,
          status: 'ABSENT',
          date: dateKey,
        });
      }
    });

    records.forEach((r) => {
      const uId = r.userId?._id ? String(r.userId._id) : String(r.userId);
      if (!processedUserIds.has(uId)) {
        processedUserIds.add(uId);
        roster.push({
          _id: r._id,
          userId: r.userId,
          inTime: r.inTime,
          outTime: r.outTime,
          durationMinutes: r.durationMinutes,
          isPresent: true,
          status: r.status,
          date: dateKey,
        });
      }
    });

    const currentlyPresent = records.filter((r) => r.inTime && !r.outTime);
    const completedSessions = records.filter((r) => r.outTime);
    const presentCount = records.length;
    const absentCount = Math.max(0, activeMemberships.length - presentCount);

    return successResponse(res, {
      date: dateKey,
      totalActiveMembers: activeMemberships.length,
      totalMarkedToday: presentCount,
      currentlyPresentCount: currentlyPresent.length,
      completedCount: completedSessions.length,
      absentCount,
      currentlyPresent,
      completedSessions,
      allRecords: roster,
    });
  } catch (err) {
    logger.error(`Error in getAdminLiveAttendance: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Admin: Manual Attendance Correction with reason and audit log
 */
export async function adminCorrectAttendance(req, res, next) {
  try {
    const { id } = req.params;
    const { inTime, outTime, status, reason } = req.body;

    if (!reason || !reason.trim()) {
      return errorResponse(res, 'Correction reason is mandatory', 400);
    }

    const attendance = await Attendance.findById(id).populate('userId');
    if (!attendance) {
      return errorResponse(res, 'Attendance record not found', 404);
    }

    const beforeState = {
      inTime: attendance.inTime,
      outTime: attendance.outTime,
      status: attendance.status,
    };

    if (inTime) attendance.inTime = new Date(inTime);
    if (outTime) attendance.outTime = new Date(outTime);
    if (status) attendance.status = status;

    attendance.manualCorrections.push({
      correctedBy: req.user.email,
      correctedAt: new Date(),
      reason: reason.trim(),
      previousInTime: beforeState.inTime,
      previousOutTime: beforeState.outTime,
      newInTime: attendance.inTime,
      newOutTime: attendance.outTime,
    });

    await attendance.save();

    await AuditLog.create({
      actor: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
      },
      action: 'ATTENDANCE_CORRECT',
      targetEntity: 'Attendance',
      targetId: attendance._id,
      beforeState,
      afterState: {
        inTime: attendance.inTime,
        outTime: attendance.outTime,
        status: attendance.status,
      },
      reason: reason.trim(),
    });

    logger.info(`Attendance ${attendance._id} manually corrected by ${req.user.email}. Reason: ${reason}`);

    return successResponse(res, { attendance }, 'Attendance record corrected successfully');
  } catch (err) {
    logger.error(`Error in adminCorrectAttendance: ${err.message}`, { error: err });
    return next(err);
  }
}

export default {
  markCheckIn,
  markCheckOut,
  getTodayStatus,
  getMyHistory,
  getAdminLiveAttendance,
  adminCorrectAttendance,
};
