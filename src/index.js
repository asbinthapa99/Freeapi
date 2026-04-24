require('dotenv').config();
const app = require('./app');
const logger = require('./services/logger.service');
const { connectDatabase } = require('./services/db.service');
const { seedMongoDatabase } = require('./services/mongoSeed.service');

const PORT = process.env.PORT || 3000;

const bootstrap = async () => {
  try {
    const mongoConnected = await connectDatabase();
    if (mongoConnected) {
      await seedMongoDatabase().catch((err) => {
        logger.warn({ message: 'MongoDB seed skipped', reason: err.message });
      });
    }

    app.listen(PORT, () => {
      logger.info({
        message: 'Nepal API Ecosystem started',
        port: PORT,
        environment: process.env.NODE_ENV || 'development'
      });
    });
  } catch (error) {
    logger.error({
      message: 'Application startup failed',
      error: error.message
    });
    process.exit(1);
  }
};

bootstrap();
