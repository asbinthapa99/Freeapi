const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transport.controller');
const validate = require('../middleware/validation.middleware');
const {
  transportBookingValidation,
  transportBusValidation,
  transportFareValidation,
  transportTripValidation
} = require('../validators/api.validators');

router.get('/routes/search', transportController.searchRoutes);
router.get('/fares/calculate', validate(transportFareValidation), transportController.calculateFare);
router.post('/fares/calculate', validate(transportFareValidation), transportController.calculateFare);
router.get('/routes/intercity', transportController.getIntercityRoutes);
router.get('/buses/:bus_id/location', validate(transportBusValidation), transportController.getBusLocation);
router.post('/tickets/book', validate(transportBookingValidation), transportController.bookTicket);
router.get('/seats/:trip_id', validate(transportTripValidation), transportController.getSeats);

module.exports = router;
