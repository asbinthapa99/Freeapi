const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
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
    req.user = jwt.verify(token, process.env.JWT_SECRET);
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
  if (!req.user || req.user.role !== 'admin') {
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

module.exports = {
  requireAuth,
  requireAdmin
};
