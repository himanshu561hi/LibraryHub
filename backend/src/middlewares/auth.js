import mongoose from 'mongoose';
import { verifyToken } from '../utils/token.js';
import { errorResponse } from '../utils/response.js';
import config from '../config/index.js';
import { User, Admin, Membership } from '../models/index.js';

export const authenticateToken = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies[config.jwt.cookieName]) {
      // 2. Check HttpOnly cookie
      token = req.cookies[config.jwt.cookieName];
    }

    if (!token) {
      return errorResponse(res, 'Authentication required. Please sign in.', 401, 'UNAUTHORIZED');
    }

    const decoded = verifyToken(token);

    const isDbAvailable = config.env === 'test' || mongoose.connection.readyState === 1;

    if (decoded.role === 'admin' || decoded.role === 'super_admin') {
      let admin = null;
      if (isDbAvailable) {
        admin = await Admin.findById(decoded.id);
      }

      if (!admin && config.env === 'development') {
        req.user = {
          _id: decoded.id || '507f1f77bcf86cd799439099',
          id: decoded.id || '507f1f77bcf86cd799439099',
          name: 'Library Hub Admin',
          email: decoded.email || 'admin@libraryhub.in',
          role: decoded.role || 'super_admin',
          isAdmin: true,
        };
        return next();
      }

      if (!admin || !admin.isActive) {
        return errorResponse(res, 'Admin account is inactive or not found.', 403, 'FORBIDDEN');
      }

      req.user = {
        _id: admin._id,
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isAdmin: true,
      };
    } else {
      let user = null;
      if (isDbAvailable) {
        user = await User.findById(decoded.id);
      }

      if (!user && config.env === 'development' && !isDbAvailable) {
        req.user = {
          _id: decoded.id || '507f1f77bcf86cd799439011',
          id: decoded.id || '507f1f77bcf86cd799439011',
          name: decoded.name || 'Demo Student',
          email: decoded.email || 'student@libraryhub.in',
          phone: '9876543210',
          picture: null,
          role: 'student',
          isMember: true,
          membership: { status: 'active', planName: 'Full Day Pass' },
          isAdmin: false,
        };
        return next();
      }

      if (!user) {
        return errorResponse(res, 'User account not found.', 401, 'USER_NOT_FOUND');
      }

      // Populate current active membership if present
      let activeMembership = null;
      if (user.currentMembership && isDbAvailable) {
        activeMembership = await Membership.findById(user.currentMembership);
      }

      req.user = {
        _id: user._id,
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        picture: user.picture,
        role: user.role || 'student',
        isMember: activeMembership ? activeMembership.status === 'active' : Boolean(user.isMember),
        membership: activeMembership || null,
        isAdmin: false,
      };
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Session expired. Please sign in again.', 401, 'TOKEN_EXPIRED');
    }
    return errorResponse(res, 'Invalid authentication token.', 401, 'INVALID_TOKEN');
  }
};

/**
 * Enforces Role-Based Access Control (RBAC).
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', 401, 'UNAUTHORIZED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        'Access denied: You do not have permission to perform this action.',
        403,
        'FORBIDDEN'
      );
    }

    next();
  };
};

/**
 * Enforces that student has an active membership.
 * Inactive users can access their historical data, but cannot mark attendance or access member actions.
 */
export const requireActiveMembership = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required.', 401, 'UNAUTHORIZED');
  }

  // Admins always bypass membership requirement
  if (req.user.isAdmin) {
    return next();
  }

  if (!req.user.isMember || !req.user.membership || req.user.membership.status !== 'active') {
    return errorResponse(
      res,
      'Active membership required. Your membership is currently inactive or expired.',
      403,
      'MEMBERSHIP_INACTIVE'
    );
  }

  next();
};

export default { authenticateToken, requireRole, requireActiveMembership };

