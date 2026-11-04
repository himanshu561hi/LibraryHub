import { Router } from 'express';
import {
  previewCampaignTemplate,
  estimateAudience,
  createAndSendCampaign,
  listCampaigns,
  getCampaignById,
} from '../controllers/email.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';

const router = Router();

// Admin-only email routes
router.use(authenticateToken);
router.use(requireRole('admin', 'super_admin'));

router.post('/preview', previewCampaignTemplate);
router.post('/estimate', estimateAudience);
router.post('/campaigns', createAndSendCampaign);
router.get('/campaigns', listCampaigns);
router.get('/campaigns/:id', getCampaignById);

export default router;

