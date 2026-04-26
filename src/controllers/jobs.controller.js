// RozgariMatch API Controller - Jobs
const { randomUUID: uuidv4 } = require('crypto');
const jobsData = require('../data/jobsData');
const { appendRecord, readCollection } = require('../services/persistence.service');
const { getDataset } = require('../services/catalog.service');

const getAllJobs = async () => {
  const seededJobs = await getDataset('jobs_sample_jobs', jobsData.sampleJobs);
  const postedJobs = await readCollection('jobs');
  return [...seededJobs, ...postedJobs];
};

exports.getCategories = async (req, res, next) => {
  try {
    const jobs = await getAllJobs();
    const dynamicCategories = jobs.map((job) => job.category).filter(Boolean);
    const seededCategories = await getDataset('jobs_categories', jobsData.jobCategories);
    const categories = [...new Set([...seededCategories, ...dynamicCategories])];
    res.json({ status: 'success', data: { count: categories.length, categories } });
  } catch (error) { next(error); }
};

exports.searchJobs = async (req, res, next) => {
  try {
    const { category, type, location } = req.query;
    let jobs = await getAllJobs();
    
    if (category) jobs = jobs.filter(j => j.category.toLowerCase() === category.toLowerCase());
    if (type) jobs = jobs.filter(j => j.type.toLowerCase() === type.toLowerCase());
    if (location) jobs = jobs.filter(j => j.location.toLowerCase().includes(location.toLowerCase()));

    res.json({ status: 'success', data: { count: jobs.length, jobs } });
  } catch (error) { next(error); }
};

exports.parseResume = async (req, res, next) => {
  try {
    const { resume_text } = req.body;
    if (!resume_text) return res.status(400).json({ error: { code: 'MISSING_TEXT', message: 'Provide resume_text.', status: 400 } });
    
    const textLower = resume_text.toLowerCase();
    const skillsDatabase = await getDataset('jobs_skills_database', jobsData.skillsDatabase);
    const extractedSkills = skillsDatabase.filter(skill => textLower.includes(skill.toLowerCase()));
    
    let bestMatchCategory = 'General';
    if (extractedSkills.includes('nodejs') || extractedSkills.includes('react')) bestMatchCategory = 'IT';
    if (extractedSkills.includes('masonry') || extractedSkills.includes('construction')) bestMatchCategory = 'CONSTRUCTION';
    if (extractedSkills.includes('nursing')) bestMatchCategory = 'HEALTH';

    res.json({ status: 'success', data: { extracted_skills: extractedSkills, suggested_category: bestMatchCategory, word_count: resume_text.split(/\s+/).length } });
  } catch (error) { next(error); }
};

exports.matchCandidate = async (req, res, next) => {
  try {
    const { skills, preferred_type } = req.body;
    if (!skills || !Array.isArray(skills)) return res.status(400).json({ error: { code: 'MISSING_SKILLS', message: 'Provide an array of skills.', status: 400 } });

    let jobs = await getAllJobs();
    if (preferred_type) jobs = jobs.filter(j => j.type.toLowerCase() === preferred_type.toLowerCase());

    const matchedJobs = jobs.map(job => {
      const matchCount = job.skills.filter(s => skills.map(sk => sk.toLowerCase()).includes(s.toLowerCase())).length;
      return { ...job, match_score: Math.round((matchCount / job.skills.length) * 100) };
    }).filter(j => j.match_score > 0).sort((a, b) => b.match_score - a.match_score);

    res.json({ status: 'success', data: { count: matchedJobs.length, matches: matchedJobs } });
  } catch (error) { next(error); }
};

exports.matchJob = exports.matchCandidate;

exports.verifyDemand = async (req, res, next) => {
  try {
    const { lt_number } = req.params;
    res.json({
      status: 'success',
      data: {
        lt_number: lt_number.toUpperCase(),
        employer: 'Nepal Overseas Placement Pvt. Ltd.',
        destination_country: 'Qatar',
        job_count: 125,
        approval_status: 'VALID',
        verified_at: new Date().toISOString()
      }
    });
  } catch (error) { next(error); }
};

exports.postJob = async (req, res, next) => {
  try {
    const { title, company, location, category, type, skills } = req.body;
    if (!title || !company || !location || !category || !type) {
      return res.status(400).json({ error: { code: 'MISSING_JOB_FIELDS', message: 'Provide title, company, location, category, and type.', status: 400 } });
    }

    const job = {
      job_id: `JOB-${uuidv4().slice(0, 8).toUpperCase()}`,
      title,
      company,
      location,
      category,
      type,
      skills: Array.isArray(skills) ? skills : [],
      status: 'PUBLISHED',
      created_at: new Date().toISOString()
    };

    await appendRecord('jobs', job);
    res.status(201).json({
      status: 'success',
      data: job
    });
  } catch (error) { next(error); }
};
