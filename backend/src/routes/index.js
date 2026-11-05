import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import membershipRoutes from './membership.routes.js';
import billingRoutes from './billing.routes.js';
import attendanceRoutes from './attendance.routes.js';
import emailRoutes from './email.routes.js';
import adminRoutes from './admin.routes.js';
import jobsRoutes from './jobs.routes.js';

const router = Router();

// Phase 01: Health Check endpoints
router.use('/health', healthRoutes);

// Phase 03: Authentication & User endpoints
router.use('/auth', authRoutes);

// Phase 04: Dashboard endpoints
router.use('/dashboard', dashboardRoutes);

// Phase 05: Membership Lifecycle endpoints
router.use('/memberships', membershipRoutes);

// Phase 06: Fees, Invoices & Manual Payments endpoints
router.use('/billing', billingRoutes);

// Phase 07: Attendance & Daily Code endpoints
router.use('/attendance', attendanceRoutes);

// Phase 08: Email & Bulk Campaigns endpoints
router.use('/email', emailRoutes);

// Phase 09: Admin Operations, Reports & Audit endpoints
router.use('/admin', adminRoutes);

// Serverless / Scheduled Background Jobs endpoints
router.use('/jobs', jobsRoutes);

export default router;
