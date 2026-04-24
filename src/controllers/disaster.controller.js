// NepalAlert API Controller - Disaster & Weather Alerts
const { v4: uuidv4 } = require('uuid');
const govDisasterData = require('../data/govDisasterData');
const liveApi = require('../services/liveApi.service');
const { appendRecord } = require('../services/persistence.service');

exports.getActiveAlerts = async (req, res, next) => {
  try {
    const { district, severity } = req.query;
    let alerts = govDisasterData.activeAlerts;
    if (district) alerts = alerts.filter(a => a.district.toLowerCase() === district.toLowerCase());
    if (severity) alerts = alerts.filter(a => a.severity === severity.toUpperCase());
    res.json({ status: 'success', data: { count: alerts.length, alerts } });
  } catch (error) { next(error); }
};

exports.getRiverLevels = async (req, res, next) => {
  try {
    const { river, station } = req.query;
    let stations = govDisasterData.riverStations;
    if (river) stations = stations.filter(s => s.river.toLowerCase() === river.toLowerCase());
    if (station) stations = stations.filter(s => s.station.toLowerCase() === station.toLowerCase());
    if (stations.length === 0) {
      return res.status(404).json({ error: { code: 'STATION_NOT_FOUND', message: `No monitoring station found for query.`, status: 404 } });
    }
    res.json({ status: 'success', data: { count: stations.length, stations, last_updated: new Date().toISOString() } });
  } catch (error) { next(error); }
};

exports.registerSub = async (req, res, next) => {
  try {
    const { phone, district, alert_types } = req.body;
    if (!phone) return res.status(400).json({ error: { code: 'MISSING_PHONE', message: 'Phone number is required for SMS alerts.', status: 400 } });
    if (!district) return res.status(400).json({ error: { code: 'MISSING_DISTRICT', message: 'District is required.', status: 400 } });
    const subscription = {
      subscription_id: `SUB-${uuidv4().slice(0, 8).toUpperCase()}`,
      phone,
      district,
      alert_types: alert_types || ['ALL'],
      message: 'You will receive SMS alerts for your district.',
      created_at: new Date().toISOString()
    };

    await appendRecord('subscriptions', subscription);
    res.status(201).json({ status: 'success', data: subscription });
  } catch (error) { next(error); }
};

exports.getLandslideRisk = async (req, res, next) => {
  try {
    const { district } = req.query;
    let zones = govDisasterData.landslideZones;
    if (district) zones = zones.filter(z => z.district.toLowerCase() === district.toLowerCase());
    res.json({ status: 'success', data: { count: zones.length, zones } });
  } catch (error) { next(error); }
};

exports.getRecentEarthquakes = async (req, res, next) => {
  try {
    const liveData = await liveApi.fetchEarthquakes();
    if (liveData) {
      return res.json({ status: 'success', source: 'USGS Live API', data: { count: liveData.length, earthquakes: liveData } });
    }
    res.json({ status: 'success', source: 'cached', data: { count: 0, earthquakes: [], note: 'USGS API unreachable. Showing cached data.' } });
  } catch (error) { next(error); }
};
