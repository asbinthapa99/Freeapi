const logger = require('../services/logger.service');

const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    code: err.code || 'INTERNAL_ERROR',
    status: err.statusCode || 500,
    path: req.originalUrl,
    method: req.method,
    stack: err.stack
  });

  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_ERROR';

  res.status(status).json({
    error: {
      code,
      message,
      status,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;
