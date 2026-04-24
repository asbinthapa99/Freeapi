// Shikshya AI API Controller - Education
const educationData = require('../data/educationData');
const { getDataset } = require('../services/catalog.service');

exports.getSyllabus = async (req, res, next) => {
  try {
    const { grade } = req.params;
    const subjectsData = await getDataset('education_subjects', educationData.subjects);
    const subjects = subjectsData[grade.toUpperCase()];
    if (!subjects) {
      return res.status(404).json({ error: { code: 'GRADE_NOT_FOUND', message: `Grade ${grade} not found. Available: ${Object.keys(educationData.subjects).join(', ')}`, status: 404 } });
    }
    res.json({ status: 'success', data: { grade: grade.toUpperCase(), subjects } });
  } catch (error) { next(error); }
};

exports.getPastPapers = async (req, res, next) => {
  try {
    const subject = req.params.subject || req.query.subject;
    const year = req.params.year ? Number(req.params.year) : undefined;
    const { grade } = req.query;
    let papers = await getDataset('education_past_papers', educationData.pastPapers);
    if (subject) papers = papers.filter(p => p.subject.toLowerCase() === subject.toLowerCase());
    if (grade) papers = papers.filter(p => p.grade.toLowerCase() === grade.toLowerCase());
    if (year) papers = papers.filter(p => p.year === year);
    res.json({ status: 'success', data: { count: papers.length, papers } });
  } catch (error) { next(error); }
};

exports.askTutor = async (req, res, next) => {
  try {
    const { question, grade_level } = req.body;
    if (!question) return res.status(400).json({ error: { code: 'MISSING_QUESTION', message: 'Provide a question.', status: 400 } });
    
    const qLower = question.toLowerCase();
    let bestMatch = null;
    const qaBank = await getDataset('education_qa_bank', educationData.qaBank);
    
    // Simple keyword matching for Q&A bank
    for (const [key, qa] of Object.entries(qaBank)) {
      if (qLower.includes(key) && (!grade_level || qa.grade === grade_level.toUpperCase())) {
        bestMatch = qa;
        break;
      }
    }
    
    if (bestMatch) {
      res.json({ status: 'success', data: { question, answer: bestMatch.answer, topics: bestMatch.topics, confidence: 0.95 } });
    } else {
      res.json({ status: 'success', data: { question, answer: "I'm a simulated tutor. I couldn't find an exact match in my database for your question, but try asking about Newton, Photosynthesis, Gravity, or Nepal's History.", confidence: 0.1 } });
    }
  } catch (error) { next(error); }
};

exports.gradeObjective = async (req, res, next) => {
  try {
    const { answers, answer_key } = req.body;
    if (!Array.isArray(answers) || !Array.isArray(answer_key) || answers.length !== answer_key.length) {
      return res.status(400).json({ error: { code: 'INVALID_OBJECTIVE_PAYLOAD', message: 'Provide answers and answer_key arrays of the same length.', status: 400 } });
    }

    const correct = answers.filter((answer, index) => String(answer).trim().toUpperCase() === String(answer_key[index]).trim().toUpperCase()).length;
    const scorePercent = Number(((correct / answer_key.length) * 100).toFixed(2));

    res.json({ status: 'success', data: { total_questions: answer_key.length, correct, score_percent: scorePercent } });
  } catch (error) { next(error); }
};

exports.gradeEssay = async (req, res, next) => {
  try {
    const { essay } = req.body;
    if (!essay) {
      return res.status(400).json({ error: { code: 'MISSING_ESSAY', message: 'Provide essay text.', status: 400 } });
    }

    const wordCount = essay.trim().split(/\s+/).length;
    const score = Math.min(10, Math.max(3, Math.round(wordCount / 40)));
    const feedback = wordCount < 80
      ? 'Answer is too short. Add more explanation, examples, and structure.'
      : 'Answer has acceptable detail. Improve clarity with better structure and key points.';

    res.json({ status: 'success', data: { word_count: wordCount, score_out_of_10: score, feedback } });
  } catch (error) { next(error); }
};

exports.getSyllabusTopics = async (req, res, next) => {
  try {
    const { grade = 'SEE' } = req.query;
    req.params.grade = grade;
    return exports.getSyllabus(req, res, next);
  } catch (error) { next(error); }
};
