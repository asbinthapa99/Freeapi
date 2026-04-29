const liveApi = require('../services/liveApi.service');

const fallbackRates = {
  fine_gold_per_tola_npr: 148000,
  tejabilo_gold_per_tola_npr: 147500,
  silver_per_tola_npr: 1750,
  unit: 'tola (11.664g)',
  source: 'FENEGOSIDA',
  source_url: 'https://www.fenegosida.org.np/',
  note: 'Static fallback — check https://www.fenegosida.org.np/ for today\'s rate',
};

const rateHistory = [
  { date: '2026-04-28', fine_gold_per_tola: 148000, tejabilo_per_tola: 147500, silver_per_tola: 1750 },
  { date: '2026-04-27', fine_gold_per_tola: 147500, tejabilo_per_tola: 147000, silver_per_tola: 1745 },
  { date: '2026-04-25', fine_gold_per_tola: 146800, tejabilo_per_tola: 146300, silver_per_tola: 1740 },
  { date: '2026-04-24', fine_gold_per_tola: 145500, tejabilo_per_tola: 145000, silver_per_tola: 1730 },
  { date: '2026-04-23', fine_gold_per_tola: 144200, tejabilo_per_tola: 143700, silver_per_tola: 1720 },
];

exports.getRates = async (req, res, next) => {
  try {
    const live = await liveApi.fetchGoldRates();
    if (live && live.fine_gold_per_tola_npr) {
      return res.json({ status: 'success', source: 'FENEGOSIDA (Live)', data: live });
    }
    if (liveApi.isStrictLiveMode()) {
      return res.status(503).json({ error: { code: 'GOLD_DATA_UNAVAILABLE', message: 'Live FENEGOSIDA gold rate unavailable.', status: 503 } });
    }
    res.json({ status: 'success', source: 'fallback (FENEGOSIDA last known)', data: { ...fallbackRates, date: new Date().toISOString().split('T')[0] } });
  } catch (e) { next(e); }
};

exports.getRateHistory = async (req, res, next) => {
  try {
    res.json({
      status: 'success', source: 'static (FENEGOSIDA historical)',
      data: { currency: 'NPR', unit: 'tola (11.664g)', history: rateHistory },
    });
  } catch (e) { next(e); }
};

exports.getConverter = async (req, res, next) => {
  try {
    const { weight_grams, karat = 24 } = req.query;
    if (!weight_grams || isNaN(weight_grams)) {
      return res.status(400).json({ error: { code: 'MISSING_WEIGHT', message: 'Provide weight_grams as a number.', status: 400 } });
    }
    const live = await liveApi.fetchGoldRates();
    const ratePerTola = (live && live.fine_gold_per_tola_npr) ? live.fine_gold_per_tola_npr : fallbackRates.fine_gold_per_tola_npr;
    const tolaWeight = 11.664;
    const purityFactor = Number(karat) / 24;
    const valueNPR = (Number(weight_grams) / tolaWeight) * ratePerTola * purityFactor;
    res.json({
      status: 'success',
      data: {
        weight_grams: Number(weight_grams),
        karat: Number(karat),
        rate_per_tola_npr: ratePerTola,
        estimated_value_npr: Math.round(valueNPR),
        note: 'Estimate only — actual value depends on making charges and purity verification.',
      },
    });
  } catch (e) { next(e); }
};
