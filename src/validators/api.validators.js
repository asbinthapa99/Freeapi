const { body, param, query } = require('express-validator');

const optionalTrimmedString = (field) => query(field).optional().isString().trim();

const authLoginValidation = [
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
];

const authRegisterValidation = [
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
  body('full_name').isString().trim().notEmpty().withMessage('full_name is required.'),
  body('roles').optional().isArray().withMessage('roles must be an array.'),
  body('permissions').optional().isArray().withMessage('permissions must be an array.')
];

const authRefreshValidation = [
  body('refresh_token').isString().trim().notEmpty().withMessage('refresh_token is required.')
];

const authUpdateUserValidation = [
  param('user_id').isString().trim().notEmpty().withMessage('user_id is required.'),
  body('email').optional().isEmail().withMessage('Valid email is required.'),
  body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
  body('full_name').optional().isString().trim().notEmpty().withMessage('full_name must be a non-empty string.'),
  body('roles').optional().isArray().withMessage('roles must be an array.'),
  body('permissions').optional().isArray().withMessage('permissions must be an array.'),
  body('status').optional().isIn(['ACTIVE', 'DISABLED']).withMessage('status must be ACTIVE or DISABLED.')
];

const authUserIdValidation = [
  param('user_id').isString().trim().notEmpty().withMessage('user_id is required.')
];

const agriDiseaseValidation = [
  body('crop').isString().trim().notEmpty().withMessage('crop is required.'),
  body('symptoms').isArray({ min: 1 }).withMessage('symptoms must be a non-empty array.')
];

const agriWeatherValidation = [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('lat must be a valid latitude.'),
  query('lon').isFloat({ min: -180, max: 180 }).withMessage('lon must be a valid longitude.')
];

const agriFertilizerValidation = [
  body('crop').isString().trim().notEmpty().withMessage('crop is required.'),
  body('soil_type').optional().isString().trim()
];

const disasterSubscriptionValidation = [
  body('phone').isString().trim().notEmpty().withMessage('phone is required.'),
  body('district').isString().trim().notEmpty().withMessage('district is required.'),
  body('alert_types').optional().isArray().withMessage('alert_types must be an array.')
];

const educationTutorValidation = [
  body('question').isString().trim().notEmpty().withMessage('question is required.'),
  body('grade_level').optional().isString().trim()
];

const educationObjectiveValidation = [
  body('answers').isArray({ min: 1 }).withMessage('answers must be a non-empty array.'),
  body('answer_key').isArray({ min: 1 }).withMessage('answer_key must be a non-empty array.')
];

const educationEssayValidation = [
  body('essay').isString().trim().notEmpty().withMessage('essay is required.')
];

const financeRemittanceValidation = [
  body('amount').isFloat({ gt: 0 }).withMessage('amount must be greater than 0.'),
  body('from_currency').isLength({ min: 3, max: 3 }).withMessage('from_currency must be a 3-letter code.'),
  body('to_currency').isLength({ min: 3, max: 3 }).withMessage('to_currency must be a 3-letter code.')
];

const financePaymentValidation = [
  body('amount').isFloat({ gt: 0 }).withMessage('amount must be greater than 0.'),
  body('channel').isString().trim().notEmpty().withMessage('channel is required.'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('currency must be a 3-letter code.'),
  body('reference').optional().isString().trim()
];

const financeBudgetValidation = [
  body('entries').isArray({ min: 1 }).withMessage('entries must be a non-empty array.'),
  body('entries.*.description').isString().trim().notEmpty().withMessage('Each entry description is required.'),
  body('entries.*.amount').isFloat().withMessage('Each entry amount must be numeric.')
];

const govDocumentValidation = [
  body('document_number').isString().trim().notEmpty().withMessage('document_number is required.'),
  body('document_type').isString().trim().notEmpty().withMessage('document_type is required.'),
  body('holder_name').optional().isString().trim()
];

const healthTriageValidation = [
  body('symptoms').isArray({ min: 1 }).withMessage('symptoms must be a non-empty array.'),
  body('patient_age').optional().isInt({ min: 0 }).withMessage('patient_age must be a valid age.'),
  body('duration_days').optional().isInt({ min: 0 }).withMessage('duration_days must be a non-negative integer.')
];

const healthSyncValidation = [
  body('records').isArray({ min: 1 }).withMessage('records must be a non-empty array.')
];

const jobsParseValidation = [
  body('resume_text').isString().trim().notEmpty().withMessage('resume_text is required.')
];

const jobsMatchValidation = [
  body('skills').isArray({ min: 1 }).withMessage('skills must be a non-empty array.'),
  body('preferred_type').optional().isString().trim()
];

const jobsPostValidation = [
  body('title').isString().trim().notEmpty().withMessage('title is required.'),
  body('company').isString().trim().notEmpty().withMessage('company is required.'),
  body('location').isString().trim().notEmpty().withMessage('location is required.'),
  body('category').isString().trim().notEmpty().withMessage('category is required.'),
  body('type').isString().trim().notEmpty().withMessage('type is required.'),
  body('skills').optional().isArray().withMessage('skills must be an array.')
];

const tourismPermitValidation = [
  body('trek_id').isString().trim().notEmpty().withMessage('trek_id is required.'),
  body('passport_number').isString().trim().notEmpty().withMessage('passport_number is required.'),
  body('nationality').isString().trim().notEmpty().withMessage('nationality is required.')
];

const tourismItineraryValidation = [
  body('trek_id').isString().trim().notEmpty().withMessage('trek_id is required.')
];

const tourismAltitudeValidation = [
  body('start_alt').isFloat({ min: 0 }).withMessage('start_alt must be a valid altitude.'),
  body('end_alt').isFloat({ min: 0 }).withMessage('end_alt must be a valid altitude.')
];

const tourismTeahouseValidation = [
  optionalTrimmedString('location'),
  query('max_price').optional().isFloat({ min: 0 }).withMessage('max_price must be numeric.')
];

const transportFareValidation = [
  query('distance_km').optional().isFloat({ gt: 0 }).withMessage('distance_km must be greater than 0.'),
  query('vehicle_type').optional().isString().trim(),
  body('distance_km').optional().isFloat({ gt: 0 }).withMessage('distance_km must be greater than 0.'),
  body('vehicle_type').optional().isString().trim()
];

const transportBookingValidation = [
  body('route_id').isString().trim().notEmpty().withMessage('route_id is required.'),
  body('passenger_name').isString().trim().notEmpty().withMessage('passenger_name is required.'),
  body('date').isISO8601().withMessage('date must be a valid ISO-8601 date string.')
];

const languageTranslateValidation = [
  body('text').isString().trim().notEmpty().withMessage('text is required.'),
  body('source_lang').isString().trim().notEmpty().withMessage('source_lang is required.'),
  body('target_lang').isString().trim().notEmpty().withMessage('target_lang is required.')
];

const languageTransliterateValidation = [
  body('text').isString().trim().notEmpty().withMessage('text is required.'),
  body('source_lang').isString().trim().notEmpty().withMessage('source_lang is required.'),
  body('target_lang').isString().trim().notEmpty().withMessage('target_lang is required.')
];

const languageTextBodyValidation = [
  body('text').isString().trim().notEmpty().withMessage('text is required.')
];

const languageDetectValidation = [
  query('text').isString().trim().notEmpty().withMessage('text query parameter is required.')
];

const financeTrackingValidation = [
  param('tracking_code').isString().trim().notEmpty().withMessage('tracking_code is required.')
];

const tourismPermitStatusValidation = [
  param('permit_id').isString().trim().notEmpty().withMessage('permit_id is required.')
];

const jobsDemandValidation = [
  param('lt_number').isString().trim().notEmpty().withMessage('lt_number is required.')
];

const transportBusValidation = [
  param('bus_id').isString().trim().notEmpty().withMessage('bus_id is required.')
];

const transportTripValidation = [
  param('trip_id').isString().trim().notEmpty().withMessage('trip_id is required.')
];

const healthFirstAidValidation = [
  param('condition').isString().trim().notEmpty().withMessage('condition is required.')
];

module.exports = {
  agriDiseaseValidation,
  agriFertilizerValidation,
  agriWeatherValidation,
  authLoginValidation,
  authRefreshValidation,
  authRegisterValidation,
  authUpdateUserValidation,
  authUserIdValidation,
  disasterSubscriptionValidation,
  educationEssayValidation,
  educationObjectiveValidation,
  educationTutorValidation,
  financeBudgetValidation,
  financePaymentValidation,
  financeRemittanceValidation,
  financeTrackingValidation,
  govDocumentValidation,
  healthFirstAidValidation,
  healthSyncValidation,
  healthTriageValidation,
  jobsDemandValidation,
  jobsMatchValidation,
  jobsParseValidation,
  jobsPostValidation,
  languageDetectValidation,
  languageTextBodyValidation,
  languageTranslateValidation,
  languageTransliterateValidation,
  tourismAltitudeValidation,
  tourismItineraryValidation,
  tourismPermitStatusValidation,
  tourismPermitValidation,
  tourismTeahouseValidation,
  transportBookingValidation,
  transportBusValidation,
  transportFareValidation,
  transportTripValidation
};
