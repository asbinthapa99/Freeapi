const { MongoClient } = require('mongodb');
const logger = require('./logger.service');

let connectPromise = null;
let clientInstance = null;
let dbInstance = null;

const isMongoConfigured = () => Boolean(process.env.MONGO_URI);

const isMongoConnected = () => Boolean(clientInstance && dbInstance);

const getMongoDb = () => dbInstance;

const connectDatabase = async () => {
  if (!isMongoConfigured()) {
    logger.info({
      message: 'MongoDB not configured. Using file-based fallback persistence.'
    });
    return false;
  }

  if (isMongoConnected()) {
    return true;
  }

  if (connectPromise) {
    return connectPromise;
  }

  const client = new MongoClient(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000
  });

  connectPromise = client.connect().then(async () => {
    const dbName = process.env.MONGO_DB_NAME || undefined;
    const db = dbName ? client.db(dbName) : client.db();

    await client.db('admin').command({ ping: 1 });

    clientInstance = client;
    dbInstance = db;

    logger.info({
      message: 'MongoDB connected',
      database: db.databaseName
    });
    return true;
  }).catch((error) => {
    connectPromise = null;
    clientInstance = null;
    dbInstance = null;
    logger.error({
      message: 'MongoDB connection failed',
      error: error.message
    });

    if (process.env.MONGO_REQUIRED === 'true' || process.env.NODE_ENV === 'production') {
      throw error;
    }

    return false;
  });

  return connectPromise;
};

module.exports = {
  connectDatabase,
  getMongoDb,
  isMongoConfigured,
  isMongoConnected
};
