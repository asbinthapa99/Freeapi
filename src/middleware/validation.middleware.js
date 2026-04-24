const { validationResult } = require('express-validator');

const validate = (validations) => [
  ...validations,
  (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed.',
        status: 400,
        details: errors.array().map((error) => ({
          field: error.path,
          message: error.msg
        }))
      }
    });
  }
];

module.exports = validate;
