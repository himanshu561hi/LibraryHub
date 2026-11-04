import { Router } from 'express';
import {
  listStudents,
  getStudentDetail,
  listAuditLogs,
  exportCsvReport,
  getSiteSettings,
  updateSiteSetting,
} from '../controllers/admin.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRole('admin', 'super_admin'));

// Students directory & profile
router.get('/students', listStudents);
router.get('/students/:id', getStudentDetail);

// Append-only Audit logs
router.get('/audit-logs', listAuditLogs);

// CSV Export reports
router.get('/reports/export-csv', exportCsvReport);

// Site Settings
router.get('/settings', getSiteSettings);
router.put('/settings', updateSiteSetting);

export default router;

