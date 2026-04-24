const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health.controller');
const { requireAuth, requirePermission } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const {
  healthFirstAidValidation,
  healthSyncValidation,
  healthTriageValidation
} = require('../validators/api.validators');

router.post('/triage/analyze', validate(healthTriageValidation), healthController.analyzeTriage);
router.get('/facilities/nearby', healthController.getNearbyFacilities);
router.get('/first-aid/:condition', validate(healthFirstAidValidation), healthController.getFirstAid);
router.post('/sync/offline-records', requireAuth, requirePermission('health:sync'), validate(healthSyncValidation), healthController.syncRecords);
router.get('/diseases/outbreaks', healthController.getOutbreaks);

module.exports = router;
