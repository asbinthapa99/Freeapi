const express = require('express');
const router = express.Router();
const nepseController = require('../controllers/nepse.controller');
router.get('/live', nepseController.getLiveIndices);
router.get('/top-gainers', nepseController.getTopGainers);
router.get('/top-losers', nepseController.getTopLosers);
router.get('/market-status', nepseController.getMarketStatus);
router.get('/brokers', nepseController.getBrokers);
module.exports = router;
