import { Attendance, Membership, User, AuditLog } from '../models/index.js';
import { getKolkataDateKey } from '../utils/attendanceCode.js';
import logger from '../utils/logger.js';

/**
 * Auto Check-Out Job:
 * Automatically marks check-out at 11:59:59 PM (IST) for any student who forgot to check out.
 * Ensures the student has a completed record and can start a fresh check-in session the next day.
 */
export async function runAutoCheckOut(targetDateKey = null) {
  try {
    const todayKey = getKolkataDateKey();
    const query = {
      status: 'IN',
      outTime: null,
    };

    if (targetDateKey) {
      query.date = targetDateKey;
    } else {
      // Closes today's unclosed sessions as well as any prior unclosed sessions
      query.date = { $lte: todayKey };
    }

    const openSessions = await Attendance.find(query);
    if (!openSessions || openSessions.length === 0) {
      return { autoCheckedOutCount: 0 };
    }

    let closedCount = 0;
    for (const record of openSessions) {
      try {
        // Construct 23:59:59 IST for that specific date (IST is UTC +5:30 -> 18:29:59.999 UTC)
        const [year, month, day] = record.date.split('-').map(Number);
        const endOfDayUtc = new Date(Date.UTC(year, month - 1, day, 18, 29, 59, 999));

        record.outTime = endOfDayUtc;
        record.status = 'COMPLETED';
        record.autoCheckedOut = true;
        await record.save();
        closedCount++;
      } catch (saveErr) {
        logger.error(`Failed to auto check-out record ${record._id}: ${saveErr.message}`);
      }
    }

    logger.info(`Auto check-out job finished: ${closedCount} open session(s) automatically checked out at 11:59 PM IST.`);
    return { autoCheckedOutCount: closedCount };
  } catch (err) {
    logger.error(`Error in runAutoCheckOut: ${err.message}`, { error: err });
    return { autoCheckedOutCount: 0, error: err.message };
  }
}

/**
 * Check if a student member has missed attendance for 2 or more consecutive days.
 * If absent for >= 2 days, immediately marks their membership as inactive,
 * sets user.isMember = false and user.isActive = false, and logs an AuditLog entry.
 *
 * @param {Object} user - User document or populated user
 * @param {Object} membership - Membership document
 * @returns {Promise<{ deactivated: boolean, daysAbsent: number, reason: string | null }>}
 */
export async function checkAndDeactivateIfAbsent(user, membership) {
  try {
    if (!membership || membership.status !== 'active') {
      return { deactivated: false, daysAbsent: 0, reason: null };
    }

    const todayKey = getKolkataDateKey(); // 'YYYY-MM-DD' in Asia/Kolkata

    // Determine baseline date of student's current active cycle:
    // If student was reactivated by admin, their active cycle starts on reactivatedAt.
    // If student never had reactivation, baseline is their joiningDate or creation date.
    let baselineDateKey = null;
    if (membership.reactivatedAt) {
      baselineDateKey = getKolkataDateKey(new Date(membership.reactivatedAt));
    } else if (membership.joiningDate) {
      baselineDateKey = getKolkataDateKey(new Date(membership.joiningDate));
    } else {
      baselineDateKey = getKolkataDateKey(new Date(membership.createdAt || Date.now()));
    }

    // If joining date or reactivation date is in the future, the student cannot be marked absent
    if (baselineDateKey > todayKey) {
      return { deactivated: false, daysAbsent: 0, reason: null };
    }

    // Find the latest attendance record for this user
    const lastAttendance = await Attendance.findOne({ userId: user._id || user.id })
      .sort({ date: -1 })
      .lean();

    let lastActiveDateKey = baselineDateKey;

    if (lastAttendance && lastAttendance.date) {
      // Only count attendance if it occurred on or after the baseline date (reactivation/joining)
      if (lastAttendance.date >= baselineDateKey) {
        lastActiveDateKey = lastAttendance.date;
      }
    }

    // If student's last active date is today or later, days absent is 0
    if (lastActiveDateKey >= todayKey) {
      return { deactivated: false, daysAbsent: 0, reason: null };
    }

    // Calculate calendar days difference in Asia/Kolkata
    const [y1, m1, d1] = lastActiveDateKey.split('-').map(Number);
    const [y2, m2, d2] = todayKey.split('-').map(Number);
    const date1Utc = Date.UTC(y1, m1 - 1, d1);
    const date2Utc = Date.UTC(y2, m2 - 1, d2);
    const daysAbsent = Math.max(0, Math.floor((date2Utc - date1Utc) / (24 * 60 * 60 * 1000)));

    // Rule: Missing attendance for 2 consecutive days triggers auto-deactivation
    if (daysAbsent >= 2) {
      const reason = `Auto-deactivated: No attendance marked for ${daysAbsent} consecutive days (last active: ${lastActiveDateKey})`;

      membership.status = 'inactive';
      membership.effectiveDeactivationDate = new Date();
      membership.deactivationReason = reason;
      await membership.save();

      await User.findByIdAndUpdate(user._id || user.id, {
        isMember: false,
        isActive: false,
        deactivationReason: reason,
      });

      // Audit Log for traceability
      try {
        await AuditLog.create({
          actor: {
            id: null,
            email: 'system@libraryhub.in',
            role: 'system',
          },
          action: 'AUTO_DEACTIVATE_ABSENCE',
          targetEntity: 'Membership',
          targetId: membership._id,
          beforeState: { status: 'active' },
          afterState: { status: 'inactive', effectiveDeactivationDate: membership.effectiveDeactivationDate },
          reason,
        });
      } catch (auditErr) {
        // Suppress audit log error in non-critical scenarios
      }

      logger.warn(`Student ${user.email || user._id} automatically DEACTIVATED due to ${daysAbsent} days of missing attendance.`);
      return { deactivated: true, daysAbsent, reason };
    }

    return { deactivated: false, daysAbsent, reason: null };
  } catch (err) {
    logger.error(`Error in checkAndDeactivateIfAbsent for user ${user._id || user.id}: ${err.message}`);
    return { deactivated: false, daysAbsent: 0, error: err.message };
  }
}

/**
 * Auto-Inactivate Absent Students Job:
 * Scans all currently active memberships and deactivates any student
 * who hasn't marked attendance for 2 consecutive days.
 */
export async function runAutoInactivateAbsentStudents() {
  try {
    const activeMemberships = await Membership.find({ status: 'active' }).populate('userId');
    if (!activeMemberships || activeMemberships.length === 0) {
      return { deactivatedCount: 0 };
    }

    let deactivatedCount = 0;
    for (const membership of activeMemberships) {
      if (!membership.userId) continue;
      const result = await checkAndDeactivateIfAbsent(membership.userId, membership);
      if (result.deactivated) {
        deactivatedCount++;
      }
    }

    logger.info(`Auto-inactivation job completed: ${deactivatedCount} student(s) deactivated due to 2+ days missing attendance.`);
    return { deactivatedCount };
  } catch (err) {
    logger.error(`Error in runAutoInactivateAbsentStudents: ${err.message}`, { error: err });
    return { deactivatedCount: 0, error: err.message };
  }
}

export default {
  runAutoCheckOut,
  checkAndDeactivateIfAbsent,
  runAutoInactivateAbsentStudents,
};

