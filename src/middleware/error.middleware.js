const logger = require('../services/logger.service');
const { sendAlert } = require('../services/alerting.service');

const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_ERROR';

  logger.error({
    message,
    code,
    status,
    path: req.originalUrl,
    method: req.method,
    request_id: req.requestId,
    trace_id: req.trace && req.trace.traceId,
    stack: err.stack
  });

  if (status >= 500) {
    sendAlert({
      service: 'nepal-api-ecosystem',
      status,
      code,
      message,
      path: req.originalUrl,
      method: req.method,
      request_id: req.requestId,
      trace_id: req.trace && req.trace.traceId,
      timestamp: new Date().toISOString()
    }).catch(() => {});
  }

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
