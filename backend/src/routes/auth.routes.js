import { Router } from 'express';
import { z } from 'zod';
import {
  studentGoogleLogin,
  adminLogin,
  getCurrentUser,
  updateStudentProfile,
  logout,
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

// Validation schemas
const googleAuthSchema = z.object({
  body: z.object({
    idToken: z.string().min(1, 'Google ID Token is required'),
    targetExam: z.string().optional(),
    phone: z.string().optional(),
  }),
});

const adminLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email address is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const profileUpdateSchema = z.object({
  body: z.object({
    phone: z.string().max(20).optional(),
    targetExam: z.string().max(100).optional(),
  }),
});

// Student Google Sign-In
router.post('/google', validate(googleAuthSchema), studentGoogleLogin);

// Admin Login (Rate-Limited to prevent brute-force attacks)
router.post('/admin/login', authLimiter, validate(adminLoginSchema), adminLogin);

// Current Session Info
router.get('/me', authenticateToken, getCurrentUser);

// Update Profile
router.put('/profile', authenticateToken, validate(profileUpdateSchema), updateStudentProfile);

// Logout
router.post('/logout', logout);

export default router;

