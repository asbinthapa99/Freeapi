// BhasaAI API Controller - Nepali Language NLP
const langData = require('../data/languageData');
const { getDataset } = require('../services/catalog.service');

exports.translate = async (req, res, next) => {
  try {
    const { text, source_lang, target_lang } = req.body;
    const supported = ['en', 'ne', 'ro_ne'];
    if (!text) return res.status(400).json({ error: { code: 'MISSING_TEXT', message: 'Text field is required.', status: 400 } });
    if (!source_lang || !supported.includes(source_lang)) return res.status(400).json({ error: { code: 'INVALID_LANGUAGE_CODE', message: `source_lang must be one of: ${supported.join(', ')}`, status: 400 } });
    if (!target_lang || !supported.includes(target_lang)) return res.status(400).json({ error: { code: 'INVALID_LANGUAGE_CODE', message: `target_lang must be one of: ${supported.join(', ')}`, status: 400 } });

    let translated;
    const translations = await getDataset('language_translations', langData.translations);
    if (source_lang === 'en' && target_lang === 'ne') {
      const key = text.toLowerCase().trim();
      translated = translations[key];
      if (!translated) {
        // Word-by-word fallback
        const words = key.split(' ');
        const parts = words.map(w => translations[w] || w);
        translated = parts.join(' ');
      }
    } else if (source_lang === 'ne' && target_lang === 'en') {
      // Reverse lookup
      const reverseMap = {};
      Object.entries(translations).forEach(([en, ne]) => { reverseMap[ne] = en; });
      translated = reverseMap[text.trim()] || `[Translation: ${text}]`;
    } else {
      translated = `[${source_lang} → ${target_lang}]: ${text}`;
    }

    res.json({ status: 'success', data: { original_text: text, translated_text: translated, source_lang, target_lang, char_count: text.length } });
  } catch (error) { next(error); }
};

exports.transliterate = async (req, res, next) => {
  try {
    const { text, source_lang, target_lang } = req.body;
    if (!text) return res.status(400).json({ error: { code: 'MISSING_TEXT', message: 'Text field is required.', status: 400 } });
    if (source_lang !== 'ro_ne' || target_lang !== 'ne') {
      return res.status(400).json({ error: { code: 'INVALID_LANGUAGE_CODE', message: 'Transliteration supports ro_ne → ne only.', status: 400 } });
    }

    const transliterationMap = await getDataset('language_transliteration_map', langData.transliterationMap);
    const words = text.toLowerCase().trim().split(/\s+/);
    const result = words.map(w => transliterationMap[w] || w).join(' ');

    res.json({ status: 'success', data: { original_text: text, transliterated_text: result, word_count: words.length } });
  } catch (error) { next(error); }
};

exports.sentiment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: { code: 'MISSING_TEXT', message: 'Text field is required.', status: 400 } });

    let posCount = 0, negCount = 0;
    const positiveWords = await getDataset('language_positive_words', langData.positiveWords);
    const negativeWords = await getDataset('language_negative_words', langData.negativeWords);
    positiveWords.forEach(w => { if (text.includes(w)) posCount++; });
    negativeWords.forEach(w => { if (text.includes(w)) negCount++; });

    let sentiment = 'NEUTRAL', score = 0.5;
    if (posCount > negCount) { sentiment = 'POSITIVE'; score = Math.min(0.5 + posCount * 0.15, 1.0); }
    else if (negCount > posCount) { sentiment = 'NEGATIVE'; score = Math.max(0.5 - negCount * 0.15, 0.0); }

    res.json({ status: 'success', data: { text, sentiment, score: parseFloat(score.toFixed(2)), positive_matches: posCount, negative_matches: negCount } });
  } catch (error) { next(error); }
};

exports.ner = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: { code: 'MISSING_TEXT', message: 'Text field is required.', status: 400 } });

    const entities = [];
    const nepaliEntities = await getDataset('language_nepali_entities', langData.nepaliEntities);
    nepaliEntities.locations.forEach(loc => { if (text.includes(loc)) entities.push({ word: loc, type: 'LOCATION' }); });
    nepaliEntities.persons.forEach(p => { if (text.includes(p)) entities.push({ word: p, type: 'PERSON' }); });
    nepaliEntities.organizations.forEach(o => { if (text.includes(o)) entities.push({ word: o, type: 'ORGANIZATION' }); });

    // English NER fallback
    const enLocations = ['Kathmandu','Pokhara','Bhaktapur','Lalitpur','Chitwan','Lumbini','Everest','Janakpur','Biratnagar'];
    enLocations.forEach(loc => { if (text.includes(loc)) entities.push({ word: loc, type: 'LOCATION' }); });

    res.json({ status: 'success', data: { text, entities, entity_count: entities.length } });
  } catch (error) { next(error); }
};

exports.detect = async (req, res, next) => {
  try {
    const { text } = req.query;
    if (!text) return res.status(400).json({ error: { code: 'MISSING_TEXT', message: 'Text query parameter is required.', status: 400 } });

    const nepaliRegex = /[\u0900-\u097F]/;
    const isNepali = nepaliRegex.test(text);
    const language = isNepali ? 'ne' : 'en';
    const confidence = isNepali ? 0.98 : 0.95;

    res.json({ status: 'success', data: { text, detected_language: language, language_name: isNepali ? 'Nepali' : 'English', confidence, script: isNepali ? 'Devanagari' : 'Latin' } });
  } catch (error) { next(error); }
};
