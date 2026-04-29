const express = require('express');
const router = express.Router();
const c = require('../controllers/festivals.controller');

router.get('/', c.getAll);
router.get('/upcoming', c.getUpcoming);
router.get('/types', c.getTypes);

module.exports = router;
