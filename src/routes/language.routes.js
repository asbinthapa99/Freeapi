const express = require('express');
const router = express.Router();
const languageController = require('../controllers/language.controller');
const validate = require('../middleware/validation.middleware');
const {
  languageDetectValidation,
  languageTextBodyValidation,
  languageTranslateValidation,
  languageTransliterateValidation
} = require('../validators/api.validators');

// @route   POST /api/v1/language/translate
router.post('/translate', validate(languageTranslateValidation), languageController.translate);

// @route   POST /api/v1/language/transliterate
router.post('/transliterate', validate(languageTransliterateValidation), languageController.transliterate);

// @route   POST /api/v1/language/sentiment
router.post('/sentiment', validate(languageTextBodyValidation), languageController.sentiment);

// @route   POST /api/v1/language/ner
router.post('/ner', validate(languageTextBodyValidation), languageController.ner);

// @route   GET /api/v1/language/detect
router.get('/detect', validate(languageDetectValidation), languageController.detect);

module.exports = router;
