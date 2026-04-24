const express = require('express');
const router = express.Router();
const disasterController = require('../controllers/disaster.controller');
const validate = require('../middleware/validation.middleware');
const {
  disasterSubscriptionValidation
} = require('../validators/api.validators');

router.get('/alerts/active', disasterController.getActiveAlerts);
router.get('/rivers/levels', disasterController.getRiverLevels);
router.post('/subscriptions/register', validate(disasterSubscriptionValidation), disasterController.registerSub);
router.get('/landslide-risk', disasterController.getLandslideRisk);
router.get('/earthquakes/recent', disasterController.getRecentEarthquakes);

module.exports = router;
