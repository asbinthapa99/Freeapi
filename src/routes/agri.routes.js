const express = require('express');
const router = express.Router();
const agriController = require('../controllers/agri.controller');
const validate = require('../middleware/validation.middleware');
const {
  agriDiseaseValidation,
  agriFertilizerValidation,
  agriWeatherValidation
} = require('../validators/api.validators');

router.get('/prices/kalimati', agriController.getPrices);
router.post('/disease/analyze', validate(agriDiseaseValidation), agriController.analyzeDisease);
router.get('/weather/forecast', validate(agriWeatherValidation), agriController.getWeather);
router.post('/fertilizer/recommend', validate(agriFertilizerValidation), agriController.recommendFertilizer);
router.get('/crops/calendar', agriController.getCropCalendar);

module.exports = router;
