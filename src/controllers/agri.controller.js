// KrishiData API Controller - Agriculture
const kalimatiPrices = require('../data/kalimatiPrices');
const { getDataset } = require('../services/catalog.service');

exports.getPrices = async (req, res, next) => {
  try {
    const { date, commodity } = req.query;
    let prices = await getDataset('agri_kalimati_prices', kalimatiPrices);
    
    if (commodity) {
      prices = prices.filter(p => p.commodity.toLowerCase().includes(commodity.toLowerCase()) || 
                                  (p.commodity_ne && p.commodity_ne.includes(commodity)));
    }
    
    res.json({ status: 'success', data: { source: 'Kalimati Market', date: date || new Date().toISOString().split('T')[0], count: prices.length, prices } });
  } catch (error) { next(error); }
};

exports.analyzeDisease = async (req, res, next) => {
  try {
    const { crop, symptoms } = req.body;
    if (!crop || !symptoms) return res.status(400).json({ error: { code: 'MISSING_PARAMS', message: 'Provide crop and symptoms.', status: 400 } });
    
    const cropLower = crop.toLowerCase();
    const symptomsStr = symptoms.join(' ').toLowerCase();
    
    let diagnosis = 'Unknown';
    let remedy = 'Consult local agricultural extension office.';
    
    if (cropLower === 'tomato' && symptomsStr.includes('black spots')) {
      diagnosis = 'Late Blight';
      remedy = 'Apply copper-based fungicides. Ensure proper spacing for airflow.';
    } else if (cropLower === 'rice' && symptomsStr.includes('yellow leaves')) {
      diagnosis = 'Nitrogen Deficiency';
      remedy = 'Apply Urea top dressing.';
    } else if (cropLower === 'potato' && symptomsStr.includes('rotting')) {
      diagnosis = 'Bacterial Wilt';
      remedy = 'Destroy infected plants. Use disease-free seeds next season.';
    }
    
    res.json({ status: 'success', data: { crop, symptoms, diagnosis, remedy_suggestion: remedy } });
  } catch (error) { next(error); }
};

exports.getWeather = async (req, res, next) => {
  try {
    const liveApi = require('../services/liveApi.service');
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: { code: 'MISSING_COORDS', message: 'Provide lat and lon.', status: 400 } });
    
    const liveWeather = await liveApi.fetchWeather(lat, lon);
    if (liveWeather) {
      return res.json({ status: 'success', source: 'OpenWeatherMap', data: liveWeather });
    }
    
    res.json({ status: 'success', source: 'cached', data: { lat, lon, condition: 'Clear', temp_c: 24, humidity: 60 } });
  } catch (error) { next(error); }
};

exports.recommendFertilizer = async (req, res, next) => {
  try {
    const { crop, soil_type } = req.body;
    if (!crop) return res.status(400).json({ error: { code: 'MISSING_CROP', message: 'Provide crop name.', status: 400 } });
    
    res.json({ status: 'success', data: { crop, soil_type: soil_type || 'Unknown', recommendation: 'Apply 50kg Urea and 30kg DAP per hectare based on standard Nepal agricultural guidelines.' } });
  } catch (error) { next(error); }
};

exports.getCropCalendar = async (req, res, next) => {
  try {
    res.json({ status: 'success', data: { 
      season: 'Monsoon', 
      recommended_crops: ['Paddy', 'Maize', 'Millet'],
      sowing_period: 'Ashadh - Shrawan'
    }});
  } catch (error) { next(error); }
};
