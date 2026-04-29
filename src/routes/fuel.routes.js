const express = require('express');
const router = express.Router();
const c = require('../controllers/fuel.controller');

router.get('/prices', c.getPrices);
router.get('/history', c.getPriceHistory);

module.exports = router;
