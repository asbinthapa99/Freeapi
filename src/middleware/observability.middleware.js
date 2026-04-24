const logger = require('../services/logger.service');
const { observeRequest } = require('../services/metrics.service');
const { buildTraceparent, createTraceContext } = require('../services/tracing.service');

const requestContext = (req, res, next) => {
  const context = createTraceContext();
  const startedAt = process.hrtime.bigint();

  req.requestId = req.headers['x-request-id'] || context.traceId;
  req.trace = {
    ...context,
    traceparent: buildTraceparent(context)
  };

  res.setHeader('X-Request-Id', req.requestId);
  res.setHeader('traceparent', req.trace.traceparent);

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1000000;
    observeRequest({
      method: req.method,
      route: req.route ? req.baseUrl + req.route.path : req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2))
    });

    logger.info({
      message: 'Request completed',
      request_id: req.requestId,
      trace_id: req.trace.traceId,
      method: req.method,
      path: req.originalUrl,
      status_code: res.statusCode,
      duration_ms: Number(durationMs.toFixed(2))
    });
  });

  next();
};

module.exports = {
  requestContext
};
