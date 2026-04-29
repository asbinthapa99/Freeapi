const express = require('express');
const router = express.Router();
const c = require('../controllers/cricket.controller');

router.get('/fixtures', c.getFixtures);
router.get('/results', c.getResults);
router.get('/squad', c.getSquad);
router.get('/stats', c.getStats);

module.exports = router;
