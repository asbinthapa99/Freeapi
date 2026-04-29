const express = require('express');
const router = express.Router();
const c = require('../controllers/gold.controller');

router.get('/rates', c.getRates);
router.get('/history', c.getRateHistory);
router.get('/convert', c.getConverter);

module.exports = router;
