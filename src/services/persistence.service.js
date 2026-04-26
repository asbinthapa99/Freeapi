const fs = require('fs/promises');
const path = require('path');
const { getMongoDb, isMongoConnected } = require('./db.service');

const STORAGE_DIR = process.env.PERSISTENCE_DIR || path.join(process.cwd(), '.runtime-store');
const writeQueues = new Map();
const fileFallbackCollections = new Set();

const shouldUseFileFallback = () => (
  process.env.NODE_ENV !== 'production' || process.env.MONGO_REQUIRED !== 'true'
);

const createPersistenceError = (collection, operation, error) => {
  const persistenceError = new Error(`MongoDB ${operation} failed for ${collection}.`);
  persistenceError.status = 503;
  persistenceError.code = 'PERSISTENCE_UNAVAILABLE';
  persistenceError.cause = error;
  return persistenceError;
};

const COLLECTION_CONFIG = {
  catalog_datasets: { idField: 'dataset_key' },
  jobs: { idField: 'job_id' },
  payments: { idField: 'payment_id' },
  permits: { idField: 'permit_id' },
  refresh_tokens: { idField: 'token_id' },
  subscriptions: { idField: 'subscription_id' },
  tickets: { idField: 'ticket_id' },
  users: { idField: 'user_id' }
};

const sanitizeMongoDocument = (document = {}) => {
  if (!document) {
    return null;
  }

  const { _id, ...rest } = document;
  return rest;
};

const getMongoCollection = (collection) => {
  const db = getMongoDb();
  if (!db) {
    return null;
  }

  const mongoCollection = db.collection(collection);
  const config = COLLECTION_CONFIG[collection];
  if (config && config.idField) {
    mongoCollection.createIndex({ [config.idField]: 1 }, { unique: true }).catch(() => {});
  }

  return mongoCollection;
};

const getCollectionPath = (collection) => path.join(STORAGE_DIR, `${collection}.json`);

const ensureCollectionFile = async (collection) => {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
  const filePath = getCollectionPath(collection);

  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, '[]', 'utf8');
  }

  return filePath;
};

const readFileCollection = async (collection) => {
  const filePath = await ensureCollectionFile(collection);
  const raw = await fs.readFile(filePath, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeFileCollection = async (collection, records) => {
  const filePath = await ensureCollectionFile(collection);
  await fs.writeFile(filePath, JSON.stringify(records, null, 2), 'utf8');
  return records;
};

const enqueueWrite = async (collection, handler) => {
  const previous = writeQueues.get(collection) || Promise.resolve();
  const next = previous.then(handler, handler);
  writeQueues.set(collection, next.catch(() => {}));
  return next;
};

const readCollection = async (collection) => {
  if (fileFallbackCollections.has(collection)) {
    return readFileCollection(collection);
  }

  if (isMongoConnected()) {
    const mongoCollection = getMongoCollection(collection);
    if (mongoCollection) {
      try {
        const records = await mongoCollection.find({}).toArray();
        return records.map((record) => sanitizeMongoDocument(record));
      } catch (error) {
        if (!shouldUseFileFallback()) {
          throw createPersistenceError(collection, 'read', error);
        }
        fileFallbackCollections.add(collection);
      }
    }
  }

  if (!shouldUseFileFallback()) {
    throw createPersistenceError(collection, 'read', new Error('MongoDB is not connected.'));
  }

  return readFileCollection(collection);
};

const writeCollection = async (collection, records) => enqueueWrite(collection, async () => {
  if (isMongoConnected()) {
    const mongoCollection = getMongoCollection(collection);
    if (mongoCollection) {
      const config = COLLECTION_CONFIG[collection];
      try {
        if (records.length === 0) {
          await mongoCollection.deleteMany({});
        } else if (config && config.idField) {
          const operations = records.map((record) => ({
            replaceOne: {
              filter: { [config.idField]: record[config.idField] },
              replacement: record,
              upsert: true
            }
          }));
          await mongoCollection.bulkWrite(operations, { ordered: false });
        } else {
          await mongoCollection.deleteMany({});
          await mongoCollection.insertMany(records, { ordered: false });
        }
        return records;
      } catch (error) {
        if (!shouldUseFileFallback()) {
          throw createPersistenceError(collection, 'write', error);
        }
        fileFallbackCollections.add(collection);
      }
    }
  }

  if (!shouldUseFileFallback()) {
    throw createPersistenceError(collection, 'write', new Error('MongoDB is not connected.'));
  }

  fileFallbackCollections.add(collection);
  return writeFileCollection(collection, records);
});

const appendRecord = async (collection, record) => {
  if (isMongoConnected()) {
    const mongoCollection = getMongoCollection(collection);
    if (mongoCollection) {
      try {
        await mongoCollection.insertOne({ ...record });
        return record;
      } catch (error) {
        if (!shouldUseFileFallback()) {
          throw createPersistenceError(collection, 'append', error);
        }
        fileFallbackCollections.add(collection);
      }
    }
  }

  if (!shouldUseFileFallback()) {
    throw createPersistenceError(collection, 'append', new Error('MongoDB is not connected.'));
  }

  fileFallbackCollections.add(collection);
  const records = await readFileCollection(collection);
  records.push(record);
  await writeFileCollection(collection, records);
  return record;
};

const findRecordByField = async (collection, field, value) => {
  if (fileFallbackCollections.has(collection)) {
    const records = await readFileCollection(collection);
    return records.find((record) => record[field] === value) || null;
  }

  if (isMongoConnected()) {
    const mongoCollection = getMongoCollection(collection);
    if (mongoCollection) {
      try {
        const record = await mongoCollection.findOne({ [field]: value });
        if (record || !shouldUseFileFallback()) {
          return sanitizeMongoDocument(record);
        }
      } catch (error) {
        if (!shouldUseFileFallback()) {
          throw createPersistenceError(collection, 'lookup', error);
        }
        fileFallbackCollections.add(collection);
      }
    }
  }

  if (!shouldUseFileFallback()) {
    throw createPersistenceError(collection, 'lookup', new Error('MongoDB is not connected.'));
  }

  fileFallbackCollections.add(collection);
  const records = await readFileCollection(collection);
  return records.find((record) => record[field] === value) || null;
};

module.exports = {
  appendRecord,
  findRecordByField,
  readCollection,
  writeCollection
};
