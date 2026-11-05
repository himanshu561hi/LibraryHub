import cron from 'node-cron';
import { runAutoCheckOut } from './attendanceJob.js';
import logger from '../utils/logger.js';

let cronTask = null;

/**
 * Initializes background cron jobs for Library Hub.
 * Schedules Auto Check-Out at 11:59 PM (23:59 IST) every day.
 */
export function startCronJobs() {
  if (cronTask) {
    return cronTask;
  }

  // 11:59 PM (23:59) IST every night
  cronTask = cron.schedule(
    '59 23 * * *',
    async () => {
      logger.info('⏰ Executing scheduled daily auto check-out job (11:59 PM IST)...');
      await runAutoCheckOut();
    },
    {
      timezone: 'Asia/Kolkata',
    }
  );

  logger.info('Background Cron Scheduler initialized (Daily 11:59 PM IST Auto Check-Out active).');
  return cronTask;
}

export function stopCronJobs() {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
    logger.info('Background Cron Scheduler stopped.');
  }
}

export default {
  startCronJobs,
  stopCronJobs,
};

