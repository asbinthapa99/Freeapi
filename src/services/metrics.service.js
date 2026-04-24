const metricsState = {
  startedAt: Date.now(),
  requestsTotal: 0,
  requestsByRoute: new Map(),
  requestsByStatus: new Map(),
  requestDurationsMs: [],
  errorsTotal: 0
};

const incrementMapValue = (map, key) => {
  map.set(key, (map.get(key) || 0) + 1);
};

const observeRequest = ({ method, route, statusCode, durationMs }) => {
  metricsState.requestsTotal += 1;
  incrementMapValue(metricsState.requestsByRoute, `${method} ${route || 'unmatched'}`);
  incrementMapValue(metricsState.requestsByStatus, String(statusCode));
  metricsState.requestDurationsMs.push(durationMs);

  if (metricsState.requestDurationsMs.length > 1000) {
    metricsState.requestDurationsMs.shift();
  }

  if (statusCode >= 500) {
    metricsState.errorsTotal += 1;
  }
};

const renderPrometheusMetrics = () => {
  const lines = [
    '# HELP app_uptime_seconds Process uptime in seconds',
    '# TYPE app_uptime_seconds gauge',
    `app_uptime_seconds ${Math.floor((Date.now() - metricsState.startedAt) / 1000)}`,
    '# HELP http_requests_total Total HTTP requests',
    '# TYPE http_requests_total counter',
    `http_requests_total ${metricsState.requestsTotal}`,
    '# HELP http_errors_total Total HTTP 5xx responses',
    '# TYPE http_errors_total counter',
    `http_errors_total ${metricsState.errorsTotal}`
  ];

  metricsState.requestsByRoute.forEach((value, key) => {
    lines.push(`http_requests_by_route_total{route="${key.replace(/"/g, '\\"')}"} ${value}`);
  });

  metricsState.requestsByStatus.forEach((value, key) => {
    lines.push(`http_requests_by_status_total{status="${key}"} ${value}`);
  });

  if (metricsState.requestDurationsMs.length > 0) {
    const sum = metricsState.requestDurationsMs.reduce((acc, value) => acc + value, 0);
    const avg = Number((sum / metricsState.requestDurationsMs.length).toFixed(2));
    lines.push('# HELP http_request_duration_average_ms Average request duration',
      '# TYPE http_request_duration_average_ms gauge',
      `http_request_duration_average_ms ${avg}`);
  }

  return `${lines.join('\n')}\n`;
};

module.exports = {
  observeRequest,
  renderPrometheusMetrics
};
