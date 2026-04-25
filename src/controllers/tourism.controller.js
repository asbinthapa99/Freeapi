// YatraTech API Controller - Tourism
const { v4: uuidv4 } = require('uuid');
const tourismData = require('../data/tourismData');
const { appendRecord, findRecordByField } = require('../services/persistence.service');
const { getDataset } = require('../services/catalog.service');
const liveApi = require('../services/liveApi.service');

exports.getTrekkingRoutes = async (req, res, next) => {
  try {
    const { region, difficulty } = req.query;
    const liveTreks = await liveApi.fetchTourismRoutes({ region, limit: 75 });
    if (!liveTreks && liveApi.isStrictLiveMode()) {
      return res.status(503).json({
        error: {
          code: 'UPSTREAM_TOURISM_ROUTES_UNAVAILABLE',
          message: 'Live OpenStreetMap tourism route data is currently unavailable.',
          status: 503
        }
      });
    }

    let treks = liveTreks || await getDataset('tourism_treks', tourismData.treks);
    if (!liveTreks && region) treks = treks.filter(t => t.region.toLowerCase() === region.toLowerCase());
    if (!liveTreks && difficulty) treks = treks.filter(t => t.difficulty.toLowerCase() === difficulty.toLowerCase());
    res.json({ status: 'success', source: liveTreks ? 'OpenStreetMap' : 'catalog', data: { count: treks.length, treks } });
  } catch (error) { next(error); }
};

exports.getTeahouses = async (req, res, next) => {
  try {
    const { location, max_price } = req.query;
    const liveTeahouses = await liveApi.fetchTourismPlaces({ location, limit: 75 });
    if (!liveTeahouses && liveApi.isStrictLiveMode()) {
      return res.status(503).json({
        error: {
          code: 'UPSTREAM_TOURISM_PLACES_UNAVAILABLE',
          message: 'Live OpenStreetMap lodging data is currently unavailable.',
          status: 503
        }
      });
    }

    let teahouses = liveTeahouses || await getDataset('tourism_teahouses', tourismData.teahouses);
    if (!liveTeahouses && location) teahouses = teahouses.filter(t => t.location.toLowerCase() === location.toLowerCase());
    if (!liveTeahouses && max_price) teahouses = teahouses.filter(t => t.price_per_night_npr <= Number(max_price));
    res.json({ status: 'success', source: liveTeahouses ? 'OpenStreetMap' : 'catalog', data: { count: teahouses.length, teahouses } });
  } catch (error) { next(error); }
};

exports.calculateAltitudeRisk = async (req, res, next) => {
  try {
    const { start_alt, end_alt } = req.body;
    if (start_alt === undefined || end_alt === undefined) {
      return res.status(400).json({ error: { code: 'MISSING_ALTITUDE', message: 'Provide start_alt and end_alt in meters.', status: 400 } });
    }
    
    const max_alt = Math.max(start_alt, end_alt);
    const gain = end_alt - start_alt;
    
    const altitudeRiskTable = await getDataset('tourism_altitude_risk', tourismData.altitudeRiskTable);
    let riskLevel = altitudeRiskTable.find(r => max_alt >= r.min_alt && max_alt < r.max_alt);
    if (!riskLevel) riskLevel = { risk: 'UNKNOWN', advice: 'Consult a professional guide.' };
    
    let specific_advice = riskLevel.advice;
    if (gain > 1000) specific_advice += ' Warning: Rapid elevation gain detected. High risk of AMS.';

    res.json({ status: 'success', data: { start_alt, end_alt, altitude_gain: gain, max_altitude: max_alt, risk_level: riskLevel.risk, advice: specific_advice } });
  } catch (error) { next(error); }
};

exports.applyPermit = async (req, res, next) => {
  try {
    const { trek_id, passport_number, nationality } = req.body;
    if (!trek_id || !passport_number || !nationality) {
      return res.status(400).json({ error: { code: 'MISSING_DATA', message: 'Provide trek_id, passport_number, and nationality.', status: 400 } });
    }
    
    const treks = await getDataset('tourism_treks', tourismData.treks);
    const trek = treks.find(t => t.id === trek_id);
    if (!trek) return res.status(404).json({ error: { code: 'TREK_NOT_FOUND', message: `Trek ID ${trek_id} not found.`, status: 404 } });
    
    let cost = trek.permit_cost_npr;
    if (nationality.toLowerCase() === 'saarc') cost = cost / 2; // SAARC discount
    if (nationality.toLowerCase() === 'nepali') cost = 0; // Free for locals

    const permit = {
      permit_id: `PRMT-${uuidv4().slice(0, 8).toUpperCase()}`,
      trek_id: trek.id,
      trek: trek.name,
      passport_number,
      nationality,
      fee_npr: cost,
      status: 'PENDING_PAYMENT',
      created_at: new Date().toISOString()
    };

    await appendRecord('permits', permit);
    res.status(201).json({ status: 'success', data: permit });
  } catch (error) { next(error); }
};

exports.getRoutes = exports.getTrekkingRoutes;
exports.getAltitudeRisk = exports.calculateAltitudeRisk;

exports.getPermitStatus = async (req, res, next) => {
  try {
    const { permit_id } = req.params;
    const permit = await findRecordByField('permits', 'permit_id', permit_id);
    if (!permit) {
      return res.status(404).json({ error: { code: 'PERMIT_NOT_FOUND', message: `Permit ID ${permit_id} not found.`, status: 404 } });
    }

    res.json({ status: 'success', data: permit });
  } catch (error) { next(error); }
};

exports.generateItinerary = async (req, res, next) => {
  try {
    const { trek_id } = req.body;
    if (!trek_id) {
      return res.status(400).json({ error: { code: 'MISSING_TREK_ID', message: 'Provide trek_id.', status: 400 } });
    }

    const treks = await getDataset('tourism_treks', tourismData.treks);
    const trek = treks.find((item) => item.id === trek_id);
    if (!trek) {
      return res.status(404).json({ error: { code: 'TREK_NOT_FOUND', message: `Trek ID ${trek_id} not found.`, status: 404 } });
    }

    res.json({
      status: 'success',
      data: {
        trek_id: trek.id,
        trek_name: trek.name,
        duration_days: trek.duration_days,
        max_altitude_m: trek.max_alt_m,
        itinerary: trek.daily_schedule
      }
    });
  } catch (error) { next(error); }
};
