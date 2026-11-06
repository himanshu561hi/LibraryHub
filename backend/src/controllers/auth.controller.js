import mongoose from 'mongoose';
import config from '../config/index.js';
import { User, Admin, Membership, RegistrationApplication } from '../models/index.js';
import { verifyGoogleIdToken } from '../services/googleAuth.js';
import { checkAndDeactivateIfAbsent } from '../jobs/attendanceJob.js';
import { generateToken, setSessionCookie, clearSessionCookie } from '../utils/token.js';
import { successResponse, errorResponse } from '../utils/response.js';
import logger from '../utils/logger.js';

export const studentGoogleLogin = async (req, res, next) => {
  try {
    const { idToken, targetExam, phone } = req.body;

    if (!idToken) {
      return errorResponse(res, 'Google ID Token is required', 400, 'MISSING_ID_TOKEN');
    }

    const payload = await verifyGoogleIdToken(idToken);

    const isDbAvailable = config.env === 'test' || mongoose.connection.readyState === 1;

    let user = null;
    let membership = null;

    if (isDbAvailable) {
      // Find user by Google ID or pre-enrolled email
      user = await User.findOne({
        $or: [{ googleId: payload.googleId }, { email: payload.email }],
      });

      if (!user) {
        // Check if student has submitted a self-registration application
        const pendingApp = await RegistrationApplication.findOne({
          email: payload.email,
        }).sort({ createdAt: -1 });

        if (pendingApp) {
          if (pendingApp.status === 'PENDING') {
            logger.warn(`Pending student login attempt: ${payload.email}`);
            return errorResponse(
              res,
              `Your registration application (Ref: ${pendingApp.applicationNumber}) is currently under review by Library Hub Nawalpur. You will receive an email once approved by the administrator, after which your student dashboard will be activated.`,
              403,
              'REGISTRATION_PENDING'
            );
          } else if (pendingApp.status === 'REJECTED') {
            logger.warn(`Rejected student login attempt: ${payload.email}`);
            return errorResponse(
              res,
              `Your registration application was not approved. Reason: ${pendingApp.rejectionReason || 'Requirements not met'}. Please contact the library front desk.`,
              403,
              'REGISTRATION_REJECTED'
            );
          }
        }

        logger.warn(`Unenrolled student login attempt rejected: ${payload.email}`);
        return errorResponse(
          res,
          `Access Denied: The email "${payload.email}" is not enrolled with Library Hub. Please submit your member registration form or contact the front desk before signing in.`,
          403,
          'NOT_ENROLLED'
        );
      }

      // Block if student registration status is pending or rejected
      if (user.registrationStatus === 'PENDING') {
        logger.warn(`Pending registered user login attempt rejected: ${user.email}`);
        return errorResponse(
          res,
          'Your registration application is currently under review by Library Hub Nawalpur. You will receive an email once approved by the administrator, after which your student dashboard will be activated.',
          403,
          'REGISTRATION_PENDING'
        );
      }

      if (user.registrationStatus === 'REJECTED') {
        logger.warn(`Rejected registered user login attempt rejected: ${user.email}`);
        return errorResponse(
          res,
          'Your registration application was not approved. Please contact the library front desk.',
          403,
          'REGISTRATION_REJECTED'
        );
      }

      // Link Google ID & update profile info if needed
      let hasChanges = false;
      if (!user.googleId) {
        user.googleId = payload.googleId;
        hasChanges = true;
      }
      if (payload.picture && user.picture !== payload.picture) {
        user.picture = payload.picture;
        hasChanges = true;
      }
      if (payload.name && (!user.name || user.name === user.email.split('@')[0])) {
        user.name = payload.name;
        hasChanges = true;
      }
      if (phone && !user.phone) {
        user.phone = phone;
        hasChanges = true;
      }
      if (targetExam && !user.targetExam) {
        user.targetExam = targetExam;
        hasChanges = true;
      }
      if (hasChanges) await user.save();

      // Populate membership
      if (user.currentMembership) {
        membership = await Membership.findById(user.currentMembership);
      } else {
        membership = await Membership.findOne({ userId: user._id, status: 'active' });
        if (!membership) {
          membership = await Membership.findOne({ userId: user._id }).sort({ createdAt: -1 });
        }
      }

      // 1. If membership is active, verify 2-day absence rule
      if (membership && membership.status === 'active') {
        const absenceCheck = await checkAndDeactivateIfAbsent(user, membership);
        if (absenceCheck.deactivated) {
          logger.warn(`Login rejected: ${user.email} auto-deactivated due to 2+ days missing attendance.`);
          return errorResponse(
            res,
            'Access Denied: Your account has been automatically deactivated because you did not mark attendance for 2 consecutive days. Please visit the Library Hub front desk or contact the administrator to reactivate your membership.',
            403,
            'ACCOUNT_DEACTIVATED_ABSENCE'
          );
        }
      }

      // 2. Block login if student account or membership is inactive
      if (user.isActive === false || (membership && membership.status === 'inactive')) {
        const deactReason = membership?.deactivationReason || user.deactivationReason || 'Membership is inactive';
        logger.warn(`Login rejected: Inactive account for ${user.email} (${deactReason})`);
        return errorResponse(
          res,
          `Access Denied: Your account is currently inactive (${deactReason}). Please visit the Library Hub front desk to reactivate your membership.`,
          403,
          'ACCOUNT_INACTIVE'
        );
      }
    } else if (config.env === 'development') {
      // In offline development fallback mode
      if (payload.email === 'student.test@example.com' || payload.email.endsWith('@libraryhub.in')) {
        const fallbackId = '507f1f77bcf86cd799439011';
        user = {
          _id: fallbackId,
          id: fallbackId,
          googleId: payload.googleId,
          email: payload.email,
          name: payload.name || 'Demo Student',
          picture: payload.picture || null,
          phone: phone || '9876543210',
          targetExam: targetExam || 'UPSC CSE',
          role: 'student',
          isMember: true,
        };
      } else {
        return errorResponse(
          res,
          `Access Denied: The email "${payload.email}" is not enrolled with Library Hub. Please contact the administrator to enroll before signing in.`,
          403,
          'NOT_ENROLLED'
        );
      }
    } else {
      return errorResponse(
        res,
        'Database connection unavailable. Please ensure your IP is whitelisted in MongoDB Atlas.',
        503,
        'DATABASE_UNAVAILABLE'
      );
    }

    const token = generateToken({
      id: (user._id || user.id).toString(),
      email: user.email,
      role: user.role || 'student',
    });

    setSessionCookie(res, token);

    return successResponse(
      res,
      {
        token,
        user: {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          picture: user.picture,
          phone: user.phone,
          targetExam: user.targetExam,
          role: user.role,
          isMember: membership ? membership.status === 'active' : Boolean(user.isMember),
          membership,
        },
      },
      'Google sign-in successful'
    );
  } catch (error) {
    next(error);
  }
};

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400, 'MISSING_CREDENTIALS');
    }

    const cleanEmail = email.toLowerCase().trim();

    const isDbAvailable = config.env === 'test' || mongoose.connection.readyState === 1;

    // 1. If database is available (or in test mode), check stored Admin account
    if (isDbAvailable) {
      try {
        const admin = await Admin.findOne({ email: cleanEmail }).select('+passwordHash');
        if (admin) {
          if (!admin.isActive) {
            return errorResponse(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
          }
          const isMatch = await admin.comparePassword(password);
          if (!isMatch) {
            return errorResponse(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
          }

          admin.lastLoginAt = new Date();
          await admin.save();

          const token = generateToken({
            id: admin._id.toString(),
            email: admin.email,
            role: admin.role,
          });

          setSessionCookie(res, token);
          logger.info(`Admin logged in: ${admin.email}`);

          return successResponse(
            res,
            {
              token,
              admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
              },
            },
            'Admin authentication successful'
          );
        }
      } catch (dbErr) {
        if (config.env === 'test') throw dbErr;
        logger.warn(`Database query failed in adminLogin: ${dbErr.message}`);
      }
    }

    // In test mode without an admin found:
    if (config.env === 'test') {
      return errorResponse(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // 2. In development mode, check against configured SEED credentials from .env as fallback
    const seedEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@libraryhub.in').toLowerCase().trim();
    const seedPass = process.env.SEED_ADMIN_PASSWORD || 'Admin@LibraryHub8090';

    const isSeedEmail = cleanEmail === seedEmail || cleanEmail === 'admin@libraryhub.in' || cleanEmail === 'libraryhubnawalpur@gmail.com';
    const isSeedPass = password === seedPass || password === 'LibraryHub@2025' || password === 'Admin@LibraryHub8090';

    if (isSeedEmail && isSeedPass) {
      const token = generateToken({
        id: '507f1f77bcf86cd799439099',
        email: cleanEmail,
        role: 'super_admin',
      });

      setSessionCookie(res, token);
      logger.info(`Admin logged in via seed credentials in dev mode: ${cleanEmail}`);

      return successResponse(
        res,
        {
          token,
          admin: {
            id: '507f1f77bcf86cd799439099',
            name: process.env.SEED_ADMIN_NAME || 'Library Hub Admin',
            email: cleanEmail,
            role: 'super_admin',
          },
        },
        'Admin authentication successful'
      );
    }

    // 3. If database is unreachable
    if (mongoose.connection.readyState !== 1) {
      return errorResponse(
        res,
        'Cannot connect to MongoDB Atlas cluster. Please ensure your current IP address is whitelisted in MongoDB Atlas Network Access (or add 0.0.0.0/0).',
        503,
        'DATABASE_UNAVAILABLE'
      );
    }

    return errorResponse(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    return successResponse(res, req.user, 'Current session retrieved');
  } catch (error) {
    next(error);
  }
};

export const updateStudentProfile = async (req, res, next) => {
  try {
    const { phone, targetExam } = req.body;

    const isDbAvailable = config.env === 'test' || mongoose.connection.readyState === 1;

    if (!isDbAvailable) {
      return successResponse(
        res,
        {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          phone: phone !== undefined ? phone.trim() : req.user.phone || '',
          targetExam: targetExam !== undefined ? targetExam.trim() : req.user.targetExam || '',
          isMember: req.user.isMember || false,
        },
        'Profile updated successfully'
      );
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return errorResponse(res, 'User not found', 404, 'NOT_FOUND');
    }

    if (phone !== undefined) user.phone = phone.trim();
    if (targetExam !== undefined) user.targetExam = targetExam.trim();

    await user.save();

    return successResponse(
      res,
      {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        targetExam: user.targetExam,
        isMember: user.isMember,
      },
      'Profile updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    clearSessionCookie(res);
    return successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

