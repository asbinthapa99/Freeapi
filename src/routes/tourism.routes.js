const express = require('express');
const router = express.Router();
const tourismController = require('../controllers/tourism.controller');
const validate = require('../middleware/validation.middleware');
const {
  tourismAltitudeValidation,
  tourismItineraryValidation,
  tourismPermitStatusValidation,
  tourismPermitValidation,
  tourismTeahouseValidation
} = require('../validators/api.validators');

router.get('/treks/routes', tourismController.getRoutes);
router.post('/permits/apply', validate(tourismPermitValidation), tourismController.applyPermit);
router.get('/permits/:permit_id/status', validate(tourismPermitStatusValidation), tourismController.getPermitStatus);
router.post('/itinerary/generate', validate(tourismItineraryValidation), tourismController.generateItinerary);
router.get('/teahouses/availability', validate(tourismTeahouseValidation), tourismController.getTeahouses);
router.post('/health/altitude-risk', validate(tourismAltitudeValidation), tourismController.getAltitudeRisk);

module.exports = router;
