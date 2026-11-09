import { Router } from 'express';
import {
  listStudents,
  getStudentDetail,
  listAuditLogs,
  exportCsvReport,
  getSiteSettings,
  updateSiteSetting,
  listRegistrationApplications,
  approveRegistrationApplication,
  rejectRegistrationApplication,
  listEmailLogs,
  getEmailLogById,
  resendEmail,
} from '../controllers/admin.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRole('admin', 'super_admin'));

// Member Registration Applications
router.get('/applications', listRegistrationApplications);
router.post('/applications/:id/approve', approveRegistrationApplication);
router.post('/applications/:id/reject', rejectRegistrationApplication);

// Students directory & profile
router.get('/students', listStudents);
router.get('/students/:id', getStudentDetail);

// Append-only Audit logs
router.get('/audit-logs', listAuditLogs);

// System Email Delivery Logs
router.get('/email-logs', listEmailLogs);
router.get('/email-logs/:id', getEmailLogById);
router.post('/email-logs/:id/resend', resendEmail);

// CSV Export reports
router.get('/reports/export-csv', exportCsvReport);

// Site Settings
router.get('/settings', getSiteSettings);
router.put('/settings', updateSiteSetting);

export default router;

