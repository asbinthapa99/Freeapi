const express = require('express');
const router = express.Router();
const entController = require('../controllers/ent.controller');
router.get('/movies', entController.getMovies);
router.get('/events', entController.getEvents);
router.get('/cinemas', entController.getCinemas);
module.exports = router;
