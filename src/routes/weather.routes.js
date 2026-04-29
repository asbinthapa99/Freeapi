const express = require('express');
const router = express.Router();
const c = require('../controllers/weather.controller');

router.get('/', c.getAllCities);
router.get('/cities', c.listCities);
router.get('/city/:city', c.getCity);

module.exports = router;
