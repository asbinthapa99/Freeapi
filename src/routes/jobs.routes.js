const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobs.controller');
const { requireAuth, requirePermission } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const {
  jobsDemandValidation,
  jobsMatchValidation,
  jobsParseValidation,
  jobsPostValidation
} = require('../validators/api.validators');

router.post('/resume/parse', validate(jobsParseValidation), jobsController.parseResume);
router.post('/match', validate(jobsMatchValidation), jobsController.matchJob);
router.get('/search', jobsController.searchJobs);
router.get('/foreign-demands/verify/:lt_number', validate(jobsDemandValidation), jobsController.verifyDemand);
router.get('/categories', jobsController.getCategories);
router.post('/post', requireAuth, requirePermission('jobs:write'), validate(jobsPostValidation), jobsController.postJob);

module.exports = router;
