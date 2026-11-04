import { Router } from 'express';
import {
  markCheckIn,
  markCheckOut,
  getTodayStatus,
  getMyHistory,
  getAdminLiveAttendance,
  adminCorrectAttendance,
} from '../controllers/attendance.controller.js';
import { authenticateToken, requireRole, requireActiveMembership } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateToken);

// Student Attendance Actions (Requires Active Membership)
router.post('/check-in', requireRole('student'), requireActiveMembership, markCheckIn);
router.post('/check-out', requireRole('student'), requireActiveMembership, markCheckOut);
router.get('/today', requireRole('student'), getTodayStatus);
router.get('/history', requireRole('student'), getMyHistory);

// Admin Attendance Operations
router.get('/admin/live', requireRole('admin', 'super_admin'), getAdminLiveAttendance);
router.post('/admin/:id/correct', requireRole('admin', 'super_admin'), adminCorrectAttendance);

export default router;

