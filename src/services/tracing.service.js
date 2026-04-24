const crypto = require('crypto');

const randomHex = (bytes) => crypto.randomBytes(bytes).toString('hex');

const createTraceContext = () => ({
  traceId: randomHex(16),
  spanId: randomHex(8)
});

const buildTraceparent = ({ traceId, spanId }) => `00-${traceId}-${spanId}-01`;

module.exports = {
  buildTraceparent,
  createTraceContext
};
