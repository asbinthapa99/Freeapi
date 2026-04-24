const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validation.middleware');
const {
  authLoginValidation
} = require('../validators/api.validators');

const router = express.Router();

router.post('/login', validate(authLoginValidation), authController.login);

module.exports = router;
