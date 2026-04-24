const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/error.middleware');
const logger = require('./services/logger.service');
const { requestContext } = require('./middleware/observability.middleware');
const { renderPrometheusMetrics } = require('./services/metrics.service');
const openApiDocument = require('./docs/openapi');
const { requireAuth, requirePermission } = require('./middleware/auth.middleware');

const path = require('path');

const app = express();

app.set('trust proxy', process.env.TRUST_PROXY === 'true');

// Landing page
app.use(express.static(path.join(__dirname, '..', 'landing')));

// Middleware
app.use(requestContext);
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((item) => item.trim()) : '*'
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: Number(process.env.API_RATE_LIMIT_WINDOW_MS) || 900000,
  max: Number(process.env.API_RATE_LIMIT_MAX) || 100,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again after 15 minutes.',
      status: 429
    }
  }
});
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  const { isMongoConnected, isMongoConfigured } = require('./services/db.service');
  const mongoStatus = isMongoConfigured()
    ? (isMongoConnected() ? 'connected' : 'disconnected')
    : 'not_configured';
  res.status(200).json({
    status: 'success',
    message: 'Nepal API Ecosystem is healthy',
    mongodb: mongoStatus,
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.get('/ready', (req, res) => {
  const { isMongoConnected, isMongoConfigured } = require('./services/db.service');
  const mongoReady = !isMongoConfigured() || isMongoConnected();
  const statusCode = mongoReady ? 200 : 503;

  res.status(statusCode).json({
    status: mongoReady ? 'ready' : 'degraded',
    mongodb: mongoReady ? 'ready' : 'unavailable',
    timestamp: new Date().toISOString()
  });
});

app.get('/metrics', requireAuth, requirePermission('metrics:read'), (req, res) => {
  res.type('text/plain').send(renderPrometheusMetrics());
});

app.get('/docs/openapi.json', (req, res) => {
  res.json(openApiDocument);
});

app.get('/docs', (req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Nepal API Ecosystem Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/docs/openapi.json',
        dom_id: '#swagger-ui'
      });
    </script>
  </body>
</html>`);
});

// Setup routers
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/language', require('./routes/language.routes'));
app.use('/api/v1/agri', require('./routes/agri.routes'));
app.use('/api/v1/disaster', require('./routes/disaster.routes'));
app.use('/api/v1/tourism', require('./routes/tourism.routes'));
app.use('/api/v1/finance', require('./routes/finance.routes'));
app.use('/api/v1/education', require('./routes/education.routes'));
app.use('/api/v1/health', require('./routes/health.routes'));
app.use('/api/v1/gov', require('./routes/gov.routes'));
app.use('/api/v1/jobs', require('./routes/jobs.routes'));
app.use('/api/v1/transport', require('./routes/transport.routes'));

// Global Error Handler
// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.url}`,
      status: 404
    }
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
