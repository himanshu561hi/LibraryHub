import { Router } from 'express';
import {
  listMemberships,
  getMembershipById,
  createMembership,
  deactivateMembership,
  reactivateMembership,
  updateMembership,
  updateMonthlyFee,
} from '../controllers/membership.controller.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';

const router = Router();

// All membership endpoints require authentication
router.use(authenticateToken);

// List memberships (Admin only)
router.get('/', requireRole('admin', 'super_admin'), listMemberships);

// Create new membership (Admin only)
router.post('/', requireRole('admin', 'super_admin'), createMembership);

// Get membership details by ID (Student can view own; Admin can view all)
router.get('/:id', getMembershipById);

// Immediate deactivation (Admin only)
router.patch('/:id/deactivate', requireRole('admin', 'super_admin'), deactivateMembership);

// Reactivation (Admin only)
router.patch('/:id/reactivate', requireRole('admin', 'super_admin'), reactivateMembership);

// Update membership plan, shift timings, and/or monthly fee (Admin only)
router.put('/:id', requireRole('admin', 'super_admin'), updateMembership);
router.patch('/:id', requireRole('admin', 'super_admin'), updateMembership);

// Update future fee (Admin only)
router.patch('/:id/fee', requireRole('admin', 'super_admin'), updateMonthlyFee);

export default router;

