const express = require('express');
const router = express.Router();
const educationController = require('../controllers/education.controller');
const validate = require('../middleware/validation.middleware');
const {
  educationEssayValidation,
  educationObjectiveValidation,
  educationTutorValidation
} = require('../validators/api.validators');

router.post('/tutor/ask', validate(educationTutorValidation), educationController.askTutor);
router.get('/syllabus/topics', educationController.getSyllabusTopics);
router.get('/syllabus/:grade', educationController.getSyllabus);
router.get('/past-papers/:subject/:year', educationController.getPastPapers);
router.get('/past-papers', educationController.getPastPapers);
router.post('/grade/objective', validate(educationObjectiveValidation), educationController.gradeObjective);
router.post('/grade/essay', validate(educationEssayValidation), educationController.gradeEssay);

module.exports = router;
