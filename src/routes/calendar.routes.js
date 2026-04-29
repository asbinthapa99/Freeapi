const express = require('express');
const router = express.Router();
const c = require('../controllers/calendar.controller');

router.get('/today', c.getToday);
router.get('/convert/ad-to-bs', c.convertADtoBS);
router.get('/convert/bs-to-ad', c.convertBStoAD);
router.get('/holidays', c.getHolidays);
router.get('/months', c.getMonthNames);

module.exports = router;
