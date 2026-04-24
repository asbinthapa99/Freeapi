const jwt = require('jsonwebtoken');
const { hasPermission } = require('../config/rbac');
const { findUserById, sanitizeUser } = require('../services/auth.service');

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Bearer token is required.',
        status: 401
      }
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      error: {
        code: 'AUTH_NOT_CONFIGURED',
        message: 'JWT_SECRET is not configured.',
        status: 500
      }
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.token_type && payload.token_type !== 'access') {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Access token is required.',
          status: 401
        }
      });
    }

    const storedUser = await findUserById(payload.sub);
    if (!storedUser || storedUser.status !== 'ACTIVE') {
      return res.status(401).json({
        error: {
          code: 'USER_INACTIVE',
          message: 'User account is inactive.',
          status: 401
        }
      });
    }

    req.user = sanitizeUser(storedUser);
    return next();
  } catch (error) {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token is invalid or expired.',
        status: 401
      }
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || !hasPermission(req.user, 'users:write')) {
    return res.status(403).json({
      error: {
        code: 'ADMIN_REQUIRED',
        message: 'Admin access is required.',
        status: 403
      }
    });
  }

  return next();
};

const requirePermission = (permission) => (req, res, next) => {
  if (!req.user || !hasPermission(req.user, permission)) {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: `Permission ${permission} is required.`,
        status: 403
      }
    });
  }

  return next();
};

module.exports = {
  requireAuth,
  requireAdmin,
  requirePermission
};
