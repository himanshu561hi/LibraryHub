import { Router } from 'express';
import {
  getStudentDashboard,
  getAdminDashboardSummary,
  getAdminDailyCode,
} from '../controllers/dashboard.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';

const router = Router();

// Student Dashboard Summary
router.get('/student', authenticateToken, requireRole('student'), getStudentDashboard);

// Admin Dashboard Summary Metrics
router.get('/admin/summary', authenticateToken, requireRole('admin', 'super_admin'), getAdminDashboardSummary);

// Admin Current Daily Code Display
router.get('/admin/daily-code', authenticateToken, requireRole('admin', 'super_admin'), getAdminDailyCode);

export default router;

