import { Attendance } from '../models/index.js';
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

export default {
  runAutoCheckOut,
};
