const fs = require('fs/promises');
const path = require('path');
const { getMongoDb, isMongoConnected } = require('./db.service');

const STORAGE_DIR = process.env.PERSISTENCE_DIR || path.join(process.cwd(), '.runtime-store');
const writeQueues = new Map();

const COLLECTION_CONFIG = {
  jobs: { idField: 'job_id' },
  payments: { idField: 'payment_id' },
  permits: { idField: 'permit_id' },
  subscriptions: { idField: 'subscription_id' },
  tickets: { idField: 'ticket_id' }
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
  if (isMongoConnected()) {
    const mongoCollection = getMongoCollection(collection);
    if (mongoCollection) {
      try {
        const records = await mongoCollection.find({}).toArray();
        return records.map((record) => sanitizeMongoDocument(record));
      } catch {
        // Atlas SQL read-only endpoint — fall through to file
      }
    }
  }

  return readFileCollection(collection);
};

const writeCollection = async (collection, records) => enqueueWrite(collection, async () => {
  if (isMongoConnected()) {
    const mongoCollection = getMongoCollection(collection);
    if (mongoCollection && records.length > 0) {
      const config = COLLECTION_CONFIG[collection];
      try {
        if (config && config.idField) {
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
      } catch {
        // Fall through to file fallback
      }
    }
  }

  return writeFileCollection(collection, records);
});

const appendRecord = async (collection, record) => {
  if (isMongoConnected()) {
    const mongoCollection = getMongoCollection(collection);
    if (mongoCollection) {
      try {
        await mongoCollection.insertOne({ ...record });
        return record;
      } catch {
        // Fall through to file fallback
      }
    }
  }

  const records = await readFileCollection(collection);
  records.push(record);
  await writeFileCollection(collection, records);
  return record;
};

const findRecordByField = async (collection, field, value) => {
  if (isMongoConnected()) {
    const mongoCollection = getMongoCollection(collection);
    if (mongoCollection) {
      try {
        const record = await mongoCollection.findOne({ [field]: value });
        return sanitizeMongoDocument(record);
      } catch {
        // Fall through to file fallback
      }
    }
  }

  const records = await readFileCollection(collection);
  return records.find((record) => record[field] === value) || null;
};

module.exports = {
  appendRecord,
  findRecordByField,
  readCollection,
  writeCollection
};
