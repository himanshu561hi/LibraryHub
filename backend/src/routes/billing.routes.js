import { Router } from 'express';
import {
  listInvoices,
  getInvoiceById,
  recordPayment,
  listPayments,
  reversePayment,
  getOutstandingDues,
  sendFeeReminder,
  runBillingCycleJob,
} from '../controllers/billing.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
import { successResponse } from '../utils/response.js';

const router = Router();

router.use(authenticateToken);

// Invoices
router.get('/invoices', listInvoices);
router.get('/invoices/:id', getInvoiceById);

// Trigger billing cycle generator manually (Admin only)
router.post('/invoices/generate-cycle', requireRole('admin', 'super_admin'), async (req, res, next) => {
  try {
    const result = await runBillingCycleJob();
    return successResponse(res, result, `Generated ${result.generatedCount} invoices for current billing cycle`);
  } catch (err) {
    return next(err);
  }
});

// Payments
router.post('/payments', requireRole('admin', 'super_admin'), recordPayment);
router.get('/payments', listPayments);
router.post('/payments/:id/reverse', requireRole('admin', 'super_admin'), reversePayment);
router.patch('/payments/:id/reverse', requireRole('admin', 'super_admin'), reversePayment);

// Dues overview & 1-Click Reminder (Admin only)
router.get('/dues', requireRole('admin', 'super_admin'), getOutstandingDues);
router.post('/dues/remind', requireRole('admin', 'super_admin'), sendFeeReminder);

export default router;

