const express = require('express');
const router = express.Router();
const govController = require('../controllers/gov.controller');
const { requireAuth, requirePermission } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const {
  govDocumentValidation
} = require('../validators/api.validators');

router.get('/applications/status/:tracking_id', govController.getStatus);
router.post('/documents/verify', requireAuth, requirePermission('documents:verify'), validate(govDocumentValidation), govController.verifyDocument);
router.get('/holidays/:year', govController.getHolidays);
router.get('/holidays', govController.getPublicHolidays);
router.get('/offices/ward', govController.getOffices);
router.get('/tax/vehicle-rates', govController.getVehicleTax);

module.exports = router;
