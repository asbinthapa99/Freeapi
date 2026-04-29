const liveApi = require('../services/liveApi.service');

// Last known NOC prices (updated manually when NOC announces changes)
const fallbackPrices = {
  petrol_per_litre: 178,
  diesel_per_litre: 163,
  kerosene_per_litre: 163,
  aviation_fuel_per_litre: 215,
  lpg_per_cylinder_14_2kg: 1850,
  currency: 'NPR',
  source: 'Nepal Oil Corporation',
  source_url: 'https://noc.org.np/',
  note: 'Static fallback — verify current prices at https://noc.org.np/',
};

const priceHistory = [
  { date: '2025-07-01', petrol: 178, diesel: 163, kerosene: 163 },
  { date: '2025-01-15', petrol: 183, diesel: 168, kerosene: 168 },
  { date: '2024-09-01', petrol: 191, diesel: 176, kerosene: 176 },
  { date: '2024-06-01', petrol: 196, diesel: 181, kerosene: 181 },
  { date: '2024-01-01', petrol: 203, diesel: 188, kerosene: 188 },
];

exports.getPrices = async (req, res, next) => {
  try {
    const live = await liveApi.fetchFuelPrices();
    if (live && (live.petrol_per_litre || live.diesel_per_litre)) {
      return res.json({ status: 'success', source: 'Nepal Oil Corporation (Live)', data: live });
    }
    if (liveApi.isStrictLiveMode()) {
      return res.status(503).json({ error: { code: 'FUEL_DATA_UNAVAILABLE', message: 'Live NOC fuel price data unavailable.', status: 503 } });
    }
    res.json({ status: 'success', source: 'fallback (last known NOC prices)', data: fallbackPrices });
  } catch (e) { next(e); }
};

exports.getPriceHistory = async (req, res, next) => {
  try {
    res.json({
      status: 'success', source: 'static (NOC historical)',
      data: { currency: 'NPR', unit: 'per litre', history: priceHistory },
    });
  } catch (e) { next(e); }
};
