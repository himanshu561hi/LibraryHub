import { Router } from 'express';
import { runAutoCheckOut, runAutoInactivateAbsentStudents } from '../jobs/attendanceJob.js';
import { successResponse, errorResponse } from '../utils/response.js';
import logger from '../utils/logger.js';

const router = Router();

/**
 * GET /api/v1/jobs/auto-checkout
 * Automated Nightly 11:59 PM IST attendance check-out & 2-day absence auto-inactivation.
 * Triggered by Vercel Cron (schedule: 29 18 * * *) or internal scheduler.
 */
router.get('/auto-checkout', async (req, res, next) => {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization;
    const isVercelCron = req.headers['x-vercel-cron'] === '1';

    // If a CRON_SECRET is configured, enforce authentication unless coming from trusted Vercel Cron header
    if (cronSecret && !isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized invocation attempt on /api/v1/jobs/auto-checkout');
      return errorResponse(res, 'Unauthorized cron invocation', 401, 'UNAUTHORIZED');
    }

    logger.info('Executing scheduled Nightly 11:59 PM auto check-out & absence inactivate job...');
    const checkOutResult = await runAutoCheckOut();
    const inactivateResult = await runAutoInactivateAbsentStudents();

    return successResponse(
      res,
      {
        ...checkOutResult,
        ...inactivateResult,
        executedAt: new Date().toISOString(),
        source: isVercelCron ? 'vercel-cron' : 'api-trigger',
      },
      `Jobs completed: ${checkOutResult.autoCheckedOutCount || 0} session(s) closed, ${inactivateResult.deactivatedCount || 0} absent member(s) deactivated.`
    );
  } catch (err) {
    logger.error(`Error in /jobs/auto-checkout: ${err.message}`, { error: err });
    return next(err);
  }
});

/**
 * GET /api/v1/jobs/auto-inactivate
 * Manual or dedicated cron trigger to scan and inactivate students who missed 2 consecutive days.
 */
router.get('/auto-inactivate', async (req, res, next) => {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization;
    const isVercelCron = req.headers['x-vercel-cron'] === '1';

    if (cronSecret && !isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
      return errorResponse(res, 'Unauthorized cron invocation', 401, 'UNAUTHORIZED');
    }

    const result = await runAutoInactivateAbsentStudents();
    return successResponse(
      res,
      {
        ...result,
        executedAt: new Date().toISOString(),
      },
      `Absence scan completed: ${result.deactivatedCount || 0} student(s) deactivated due to 2+ days missing attendance.`
    );
  } catch (err) {
    logger.error(`Error in /jobs/auto-inactivate: ${err.message}`, { error: err });
    return next(err);
  }
});

export default router;

