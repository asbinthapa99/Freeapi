const liveApi = require('../services/liveApi.service');

const fallbackIndices = {
  nepse: { current: 2050.45, change: 12.34, percent_change: 0.61 },
  sensitive: { current: 390.12, change: 2.10, percent_change: 0.54 },
};

const fallbackBrokers = [
  { code: '1', name: 'Kumari Securities Pvt. Ltd.', district: 'Kathmandu' },
  { code: '5', name: 'Sunrise Securities Pvt. Ltd.', district: 'Kathmandu' },
  { code: '14', name: 'Dynamic Money Managers Securities', district: 'Kathmandu' },
  { code: '34', name: 'Vision Securities Pvt. Ltd.', district: 'Kathmandu' },
  { code: '42', name: 'Siprabi Securities Pvt. Ltd.', district: 'Pokhara' },
  { code: '50', name: 'Malla & Malla Stock Broking Co.', district: 'Biratnagar' },
  { code: '58', name: 'Naasa Securities Co. Ltd.', district: 'Kathmandu' },
];

exports.getLiveIndices = async (req, res, next) => {
  try {
    const live = await liveApi.fetchNepseData();
    if (live && live.index) {
      return res.json({ status: 'success', source: 'Nepal Stock Exchange (Live)', data: live });
    }
    if (liveApi.isStrictLiveMode()) {
      return res.status(503).json({ error: { code: 'NEPSE_UNAVAILABLE', message: 'Live NEPSE data unavailable.', status: 503 } });
    }
    res.json({
      status: 'success', source: 'fallback',
      data: {
        date: new Date().toISOString().split('T')[0],
        indices: fallbackIndices,
        note: 'Live data unavailable — showing last known values.',
      },
    });
  } catch (e) { next(e); }
};

exports.getTopGainers = async (req, res, next) => {
  try {
    const live = await liveApi.fetchNepseData();
    const gainers = live?.topTraded?.filter(s => (s.percentageChange || s.perChange) > 0)
      .sort((a, b) => (b.percentageChange || b.perChange) - (a.percentageChange || a.perChange))
      .slice(0, 10) || null;
    if (gainers && gainers.length) {
      return res.json({ status: 'success', source: 'Nepal Stock Exchange (Live)', data: { count: gainers.length, gainers } });
    }
    if (liveApi.isStrictLiveMode()) {
      return res.status(503).json({ error: { code: 'NEPSE_UNAVAILABLE', message: 'Live NEPSE data unavailable.', status: 503 } });
    }
    res.json({ status: 'success', source: 'fallback', data: { gainers: [{ symbol: 'NABIL', price: 650, percent_change: 4.5 }, { symbol: 'GBIME', price: 380, percent_change: 3.2 }] } });
  } catch (e) { next(e); }
};

exports.getTopLosers = async (req, res, next) => {
  try {
    const live = await liveApi.fetchNepseData();
    const losers = live?.topTraded?.filter(s => (s.percentageChange || s.perChange) < 0)
      .sort((a, b) => (a.percentageChange || a.perChange) - (b.percentageChange || b.perChange))
      .slice(0, 10) || null;
    if (losers && losers.length) {
      return res.json({ status: 'success', source: 'Nepal Stock Exchange (Live)', data: { count: losers.length, losers } });
    }
    if (liveApi.isStrictLiveMode()) {
      return res.status(503).json({ error: { code: 'NEPSE_UNAVAILABLE', message: 'Live NEPSE data unavailable.', status: 503 } });
    }
    res.json({ status: 'success', source: 'fallback', data: { losers: [{ symbol: 'NTC', price: 850, percent_change: -2.1 }, { symbol: 'NICA', price: 790, percent_change: -1.8 }] } });
  } catch (e) { next(e); }
};

exports.getMarketStatus = async (req, res, next) => {
  try {
    const live = await liveApi.fetchNepseData();
    const status = live?.marketStatus;
    if (status) {
      return res.json({ status: 'success', source: 'Nepal Stock Exchange (Live)', data: status });
    }
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun, 6=Sat
    const hourNPT = (now.getUTCHours() + 5) % 24 + (now.getUTCMinutes() >= 45 ? 1 : 0); // UTC+5:45
    const isWeekday = dayOfWeek >= 0 && dayOfWeek <= 4; // Sun–Thu in Nepal
    const isMarketHours = hourNPT >= 11 && hourNPT < 15;
    res.json({
      status: 'success', source: 'calculated',
      data: { isOpen: isWeekday && isMarketHours, tradingHours: '11:00–15:00 NPT (Sun–Thu)', timezone: 'Asia/Kathmandu' },
    });
  } catch (e) { next(e); }
};

exports.getBrokers = async (req, res, next) => {
  try {
    res.json({ status: 'success', source: 'static', data: { count: fallbackBrokers.length, brokers: fallbackBrokers } });
  } catch (e) { next(e); }
};
