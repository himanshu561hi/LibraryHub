import crypto from 'crypto';
import mongoose from 'mongoose';
import { DailyAttendanceCode } from '../models/index.js';
import { formatDateKey } from './billingCalculator.js';
import logger from '../utils/logger.js';

/**
 * Get current date key in Asia/Kolkata timezone (YYYY-MM-DD)
 */
export function getKolkataDateKey(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

/**
 * Generate a 6-character alphanumeric uppercase code
 */
export function generateRandomCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

/**
 * Retrieve or generate today's active code in Asia/Kolkata timezone
 */
export async function getOrCreateTodayCodeRecord() {
  const dateKey = getKolkataDateKey();

  if (mongoose.connection.readyState !== 1) {
    return {
      date: dateKey,
      isActive: true,
      verifyCode: (code) => code && code.trim().length === 6,
    };
  }

  let record = await DailyAttendanceCode.findOne({ date: dateKey, isActive: true }).select('+codeHash');

  if (!record) {
    const rawCode = generateRandomCode();
    const tomorrowMidnight = new Date();
    tomorrowMidnight.setUTCDate(tomorrowMidnight.getUTCDate() + 1);
    tomorrowMidnight.setUTCHours(0, 0, 0, 0);

    // Deactivate previous active codes
    await DailyAttendanceCode.updateMany({ date: { $ne: dateKey } }, { isActive: false });

    record = await DailyAttendanceCode.createHashedCode(dateKey, rawCode, tomorrowMidnight);
    logger.info(`Generated new Daily Attendance Code for ${dateKey}`);
  }

  return record;
}

/**
 * Verify whether an input code matches today's active code
 */
export async function verifyDailyCode(inputCode) {
  if (!inputCode || typeof inputCode !== 'string') {
    return false;
  }
  const activeRecord = await getOrCreateTodayCodeRecord();
  // Check against the hashed code
  return activeRecord.verifyCode(inputCode);
}

export default {
  getKolkataDateKey,
  generateRandomCode,
  getOrCreateTodayCodeRecord,
  verifyDailyCode,
};
