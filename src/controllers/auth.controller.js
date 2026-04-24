const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const configuredEmail = process.env.ADMIN_EMAIL;
    const configuredPassword = process.env.ADMIN_PASSWORD;
    const configuredHash = process.env.ADMIN_PASSWORD_HASH;

    if (!configuredEmail || (!configuredPassword && !configuredHash) || !process.env.JWT_SECRET) {
      return res.status(503).json({
        error: {
          code: 'AUTH_CONFIGURATION_MISSING',
          message: 'Set ADMIN_EMAIL, ADMIN_PASSWORD or ADMIN_PASSWORD_HASH, and JWT_SECRET before using auth.',
          status: 503
        }
      });
    }

    const emailMatches = email.toLowerCase() === configuredEmail.toLowerCase();
    const passwordMatches = configuredHash
      ? await bcrypt.compare(password, configuredHash)
      : password === configuredPassword;

    if (!emailMatches || !passwordMatches) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email or password is incorrect.',
          status: 401
        }
      });
    }

    const token = jwt.sign(
      { email: configuredEmail, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
    );

    return res.json({
      status: 'success',
      data: {
        token,
        token_type: 'Bearer',
        expires_in: process.env.JWT_EXPIRES_IN || '12h',
        user: {
          email: configuredEmail,
          role: 'admin'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
