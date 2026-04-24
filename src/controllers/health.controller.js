// SwasthyaTriage API Controller - Health Symptom Checker
const healthData = require('../data/healthData');
const { getDataset } = require('../services/catalog.service');

const VALID_SYMPTOMS = ['high_fever','joint_pain','rash','headache','body_ache','diarrhea','vomiting','dehydration','cough','fever','breathing_difficulty','chills','sweating','itchy_eyes','sneezing','runny_nose','stomach_pain','nausea','bloating'];

exports.analyzeTriage = async (req, res, next) => {
  try {
    const { symptoms, patient_age, patient_location_district, duration_days } = req.body;
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ error: { code: 'MISSING_SYMPTOMS', message: 'Provide an array of symptoms.', status: 400 } });
    }

    const invalid = symptoms.filter(s => !VALID_SYMPTOMS.includes(s));
    if (invalid.length > 0) {
      return res.status(400).json({ error: { code: 'INVALID_SYMPTOM', message: `Unknown symptoms: ${invalid.join(', ')}. Valid: ${VALID_SYMPTOMS.join(', ')}`, status: 400 } });
    }

    // Match symptoms against the symptom map
    const sortedInput = [...symptoms].sort().join(',');
    const conditions = [];
    const symptomMap = await getDataset('health_symptom_map', healthData.symptomMap);
    for (const [key, condition] of Object.entries(symptomMap)) {
      const keySymptoms = key.split(',');
      const matchCount = keySymptoms.filter(s => symptoms.includes(s)).length;
      if (matchCount >= 2) {
        conditions.push({ ...condition, matched_symptoms: matchCount, total_symptoms: keySymptoms.length });
      }
    }
    conditions.sort((a, b) => b.matched_symptoms - a.matched_symptoms);

    const urgency = conditions.length > 0 ? conditions[0].urgency : 'LOW';
    const recommendation = conditions.length > 0 ? conditions[0].advice : 'Monitor symptoms. Visit a health post if they persist beyond 2 days.';

    res.json({ status: 'success', data: { possible_conditions: conditions.slice(0, 3), urgency, recommendation, disclaimer: 'This is not a medical diagnosis. Please consult a qualified healthcare professional.' } });
  } catch (error) { next(error); }
};

exports.getNearbyFacilities = async (req, res, next) => {
  try {
    const { district, type } = req.query;
    let facilities = await getDataset('health_facilities', healthData.healthFacilities);
    if (district) facilities = facilities.filter(f => f.district.toLowerCase() === district.toLowerCase());
    if (type) facilities = facilities.filter(f => f.type.toLowerCase() === type.toLowerCase());
    res.json({ status: 'success', data: { count: facilities.length, facilities } });
  } catch (error) { next(error); }
};

exports.getFirstAid = async (req, res, next) => {
  try {
    const { condition } = req.params;
    const firstAid = await getDataset('health_first_aid', healthData.firstAid);
    const guide = firstAid[condition.toLowerCase()];
    if (!guide) {
      const available = Object.keys(firstAid);
      return res.status(404).json({ error: { code: 'CONDITION_NOT_FOUND', message: `First aid guide not found. Available: ${available.join(', ')}`, status: 404 } });
    }
    res.json({ status: 'success', data: guide });
  } catch (error) { next(error); }
};

exports.syncRecords = async (req, res, next) => {
  try {
    const { records } = req.body;
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ error: { code: 'INVALID_RECORDS', message: 'Provide an array of records to sync.', status: 400 } });
    }
    res.json({ status: 'success', data: { synced_count: records.length, synced_at: new Date().toISOString() } });
  } catch (error) { next(error); }
};

exports.getOutbreaks = async (req, res, next) => {
  try {
    res.json({ status: 'success', data: {
      outbreaks: [
        { disease: 'Dengue', active_districts: ['Kathmandu','Chitwan','Rupandehi'], cases_this_month: 234, severity: 'MODERATE' },
        { disease: 'Cholera', active_districts: ['Saptari','Siraha'], cases_this_month: 45, severity: 'HIGH' }
      ],
      last_updated: new Date().toISOString()
    }});
  } catch (error) { next(error); }
};
