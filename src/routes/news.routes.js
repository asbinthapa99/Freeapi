const express = require('express');
const router = express.Router();
const newsController = require('../controllers/news.controller');
router.get('/headlines', newsController.getHeadlines);
router.get('/feeds', newsController.getRssFeeds);
router.get('/source/:source', newsController.getBySource);
module.exports = router;
