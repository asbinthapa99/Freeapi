const jobsData = require('../data/jobsData');
const tourismData = require('../data/tourismData');
const transportData = require('../data/transportData');
const healthData = require('../data/healthData');
const educationData = require('../data/educationData');
const languageData = require('../data/languageData');
const govDisasterData = require('../data/govDisasterData');
const holidays = require('../data/holidays');
const kalimatiPrices = require('../data/kalimatiPrices');
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
  const existingSeed = await metadataCollection.findOne({ key: 'initial_seed_v2' });

  if (existingSeed) {
    logger.info({
      message: 'MongoDB seed already present',
      database: db.databaseName
    });
    return false;
  }

  const insertedJobs = await upsertManyByField('jobs_catalog', jobsData.sampleJobs, 'id');
  const categories = jobsData.jobCategories.map((category, index) => ({
    id: `CATEGORY-${index + 1}`,
    name: category
  }));
  const insertedCategories = await upsertManyByField('job_categories', categories, 'id');
  const insertedTreks = await upsertManyByField('tourism_treks', tourismData.treks, 'id');
  const teahouses = tourismData.teahouses.map((teahouse, index) => ({
    teahouse_id: `TEAHOUSE-${index + 1}`,
    ...teahouse
  }));
  const insertedTeahouses = await upsertManyByField('tourism_teahouses', teahouses, 'teahouse_id');
  const insertedRoutes = await upsertManyByField('transport_routes_catalog', transportData.routes, 'id');
  const insertedIntercityRoutes = await upsertManyByField('transport_intercity_routes', transportData.intercityRoutes, 'id');
  const catalogDatasets = [
    { dataset_key: 'agri_kalimati_prices', payload: kalimatiPrices },
    { dataset_key: 'disaster_active_alerts', payload: govDisasterData.activeAlerts },
    { dataset_key: 'disaster_river_stations', payload: govDisasterData.riverStations },
    { dataset_key: 'disaster_landslide_zones', payload: govDisasterData.landslideZones },
    { dataset_key: 'education_subjects', payload: educationData.subjects },
    { dataset_key: 'education_past_papers', payload: educationData.pastPapers },
    { dataset_key: 'education_qa_bank', payload: educationData.qaBank },
    { dataset_key: 'finance_bank_branches', payload: [
      { bank: 'Nabil Bank', district: 'Kathmandu', branch: 'Putalisadak', phone: '01-4422334' },
      { bank: 'Global IME Bank', district: 'Pokhara', branch: 'Lakeside', phone: '061-451122' },
      { bank: 'NIC Asia', district: 'Chitwan', branch: 'Bharatpur', phone: '056-590221' },
      { bank: 'Kumari Bank', district: 'Biratnagar', branch: 'Main Road', phone: '021-536200' },
      { bank: 'Agricultural Development Bank', district: 'Dhading', branch: 'Dhadingbesi', phone: '010-520124' },
      { bank: 'Nabil Bank', district: 'Dhading', branch: 'Dhadingbesi', phone: '010-521457' },
      { bank: 'Global IME Bank', district: 'Dhading', branch: 'Galchi', phone: '010-403126' }
    ] },
    { dataset_key: 'gov_applications', payload: govDisasterData.govApplications },
    { dataset_key: 'gov_ward_offices', payload: govDisasterData.wardOffices },
    { dataset_key: 'gov_holidays', payload: holidays },
    { dataset_key: 'health_symptom_map', payload: healthData.symptomMap },
    { dataset_key: 'health_facilities', payload: healthData.healthFacilities },
    { dataset_key: 'health_first_aid', payload: healthData.firstAid },
    { dataset_key: 'jobs_sample_jobs', payload: jobsData.sampleJobs },
    { dataset_key: 'jobs_categories', payload: jobsData.jobCategories },
    { dataset_key: 'jobs_skills_database', payload: jobsData.skillsDatabase },
    { dataset_key: 'language_translations', payload: languageData.translations },
    { dataset_key: 'language_transliteration_map', payload: languageData.transliterationMap },
    { dataset_key: 'language_positive_words', payload: languageData.positiveWords },
    { dataset_key: 'language_negative_words', payload: languageData.negativeWords },
    { dataset_key: 'language_nepali_entities', payload: languageData.nepaliEntities },
    { dataset_key: 'tourism_treks', payload: tourismData.treks },
    { dataset_key: 'tourism_teahouses', payload: tourismData.teahouses },
    { dataset_key: 'tourism_altitude_risk', payload: tourismData.altitudeRiskTable },
    { dataset_key: 'transport_routes', payload: transportData.routes },
    { dataset_key: 'transport_intercity_routes', payload: transportData.intercityRoutes },
    { dataset_key: 'transport_fare_rules', payload: transportData.fareRules }
  ];
  const insertedCatalogDatasets = await upsertManyByField('catalog_datasets', catalogDatasets, 'dataset_key');

  await metadataCollection.updateOne(
    { key: 'initial_seed_v2' },
    {
      $setOnInsert: {
        key: 'initial_seed_v2',
        created_at: new Date().toISOString(),
        collections_seeded: [
          'jobs_catalog',
          'job_categories',
          'tourism_treks',
          'tourism_teahouses',
          'transport_routes_catalog',
          'transport_intercity_routes',
          'catalog_datasets'
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
      transport_intercity_routes: insertedIntercityRoutes,
      catalog_datasets: insertedCatalogDatasets
    }
  });

  return true;
};

module.exports = {
  seedMongoDatabase
};
