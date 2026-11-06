import { Router } from 'express';
import { SiteSetting } from '../models/index.js';
import {
  submitRegistration,
  getApplicationStatus,
} from '../controllers/registration.controller.js';
import { successResponse } from '../utils/response.js';
import logger from '../utils/logger.js';

const router = Router();

/**
 * POST /api/v1/public/register
 * Public member self-registration with ImageKit Aadhar front & back upload.
 */
router.post('/register', submitRegistration);

/**
 * GET /api/v1/public/application-status/:query
 * Check registration application status by email or application number.
 */
router.get('/application-status/:query', getApplicationStatus);

/**
 * GET /api/v1/public/announcements
 * Retrieve active entry popup and top notification banner settings (Public, no auth needed).
 */
router.get('/announcements', async (req, res, next) => {
  try {
    const settings = await SiteSetting.find({
      key: { $in: ['entry_popup', 'top_announcement_bar'] },
    }).lean();

    const map = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });

    const defaultPopup = {
      enabled: false,
      imageUrl: '',
      title: '',
      actionUrl: '',
    };

    const defaultTopBanner = {
      enabled: false,
      text: '',
      linkText: '',
      linkUrl: '',
    };

    return successResponse(
      res,
      {
        popup: map.entry_popup || defaultPopup,
        topBanner: map.top_announcement_bar || defaultTopBanner,
      },
      'Public announcements retrieved successfully'
    );
  } catch (err) {
    logger.error(`Error in /public/announcements: ${err.message}`, { error: err });
    return next(err);
  }
});

export default router;

