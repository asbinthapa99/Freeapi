const express = require('express');
const router = express.Router();
const energyController = require('../controllers/energy.controller');
router.get('/outages', energyController.getOutages);
router.get('/hydro', energyController.getHydro);
router.get('/tariff', energyController.getTariff);
router.get('/summary', energyController.getSummary);
module.exports = router;
