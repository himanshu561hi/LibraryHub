import { Router } from 'express';
import { runAutoCheckOut } from '../jobs/attendanceJob.js';
import { successResponse, errorResponse } from '../utils/response.js';
import logger from '../utils/logger.js';

const router = Router();

/**
 * GET /api/v1/jobs/auto-checkout
 * Automated Nightly 11:59 PM IST attendance check-out.
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

    logger.info('Executing scheduled Nightly 11:59 PM auto check-out job (Vercel Serverless / Cron)...');
    const result = await runAutoCheckOut();

    return successResponse(
      res,
      {
        ...result,
        executedAt: new Date().toISOString(),
        source: isVercelCron ? 'vercel-cron' : 'api-trigger',
      },
      `Auto check-out job completed: ${result.closedSessionsCount} session(s) closed.`
    );
  } catch (err) {
    logger.error(`Error in /jobs/auto-checkout: ${err.message}`, { error: err });
    return next(err);
  }
});

export default router;

