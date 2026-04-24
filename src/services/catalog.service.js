const NodeCache = require('node-cache');
const { readCollection } = require('./persistence.service');

const catalogCache = new NodeCache({ stdTTL: Number(process.env.CATALOG_CACHE_TTL_SECONDS) || 60 });

const cloneFallback = (fallbackValue) => JSON.parse(JSON.stringify(fallbackValue));

const getDataset = async (datasetKey, fallbackValue) => {
  const cached = catalogCache.get(datasetKey);
  if (cached !== undefined) {
    return cached;
  }

  const records = await readCollection('catalog_datasets');
  const dataset = records.find((item) => item.dataset_key === datasetKey);
  const value = dataset ? dataset.payload : cloneFallback(fallbackValue);
  catalogCache.set(datasetKey, value);
  return value;
};

const clearCatalogCache = () => {
  catalogCache.flushAll();
};

module.exports = {
  clearCatalogCache,
  getDataset
};
