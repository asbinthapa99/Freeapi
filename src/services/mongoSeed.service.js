const jobsData = require('../data/jobsData');
const tourismData = require('../data/tourismData');
const transportData = require('../data/transportData');
const logger = require('./logger.service');
const { getMongoDb, isMongoConnected } = require('./db.service');

const upsertManyByField = async (collectionName, records, idField) => {
  const db = getMongoDb();
  const collection = db.collection(collectionName);

  if (!Array.isArray(records) || records.length === 0) {
    return 0;
  }

  await collection.createIndex({ [idField]: 1 }, { unique: true }).catch(() => {});

  const operations = records
    .filter((record) => record[idField] !== undefined)
    .map((record) => ({
      updateOne: {
        filter: { [idField]: record[idField] },
        update: {
          $setOnInsert: record
        },
        upsert: true
      }
    }));

  if (operations.length === 0) {
    return 0;
  }

  const result = await collection.bulkWrite(operations, { ordered: false });
  return result.upsertedCount || 0;
};

const seedMongoDatabase = async () => {
  if (!isMongoConnected()) {
    return false;
  }

  const db = getMongoDb();
  const metadataCollection = db.collection('seed_metadata');
  const existingSeed = await metadataCollection.findOne({ key: 'initial_seed_v1' });

  if (existingSeed) {
    logger.info({
      message: 'MongoDB seed already present',
      database: db.databaseName
    });
    return false;
  }

  const insertedJobs = await upsertManyByField('jobs_catalog', jobsData.sampleJobs, 'id');
  const insertedCategories = await upsertManyByField('job_categories', jobsData.jobCategories, 'id');
  const insertedTreks = await upsertManyByField('tourism_treks', tourismData.treks, 'id');
  const teahouses = tourismData.teahouses.map((teahouse, index) => ({
    teahouse_id: `TEAHOUSE-${index + 1}`,
    ...teahouse
  }));
  const insertedTeahouses = await upsertManyByField('tourism_teahouses', teahouses, 'teahouse_id');
  const insertedRoutes = await upsertManyByField('transport_routes_catalog', transportData.routes, 'id');
  const insertedIntercityRoutes = await upsertManyByField('transport_intercity_routes', transportData.intercityRoutes, 'id');

  await metadataCollection.updateOne(
    { key: 'initial_seed_v1' },
    {
      $setOnInsert: {
        key: 'initial_seed_v1',
        created_at: new Date().toISOString(),
        collections_seeded: [
          'jobs_catalog',
          'job_categories',
          'tourism_treks',
          'tourism_teahouses',
          'transport_routes_catalog',
          'transport_intercity_routes'
        ]
      }
    },
    { upsert: true }
  );

  logger.info({
    message: 'MongoDB initial seed completed',
    database: db.databaseName,
    inserted: {
      jobs_catalog: insertedJobs,
      job_categories: insertedCategories,
      tourism_treks: insertedTreks,
      tourism_teahouses: insertedTeahouses,
      transport_routes_catalog: insertedRoutes,
      transport_intercity_routes: insertedIntercityRoutes
    }
  });

  return true;
};

module.exports = {
  seedMongoDatabase
};
