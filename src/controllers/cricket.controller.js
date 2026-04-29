const liveApi = require('../services/liveApi.service');

const nepalSquad = [
  { name: 'Rohit Paudel', role: 'Batsman', age: 22, caps_odi: 30, caps_t20: 45 },
  { name: 'Kushal Bhurtel', role: 'Batsman', age: 23, caps_odi: 20, caps_t20: 35 },
  { name: 'Dipendra Singh Airee', role: 'All-rounder', age: 25, caps_odi: 25, caps_t20: 40 },
  { name: 'Sagar Pun', role: 'All-rounder', age: 28, caps_odi: 40, caps_t20: 55 },
  { name: 'Sandeep Lamichhane', role: 'Bowler (Leg Spin)', age: 24, caps_odi: 30, caps_t20: 60 },
  { name: 'Karan KC', role: 'Bowler (Fast)', age: 28, caps_odi: 35, caps_t20: 50 },
  { name: 'Aarif Sheikh', role: 'Wicketkeeper-Batsman', age: 27, caps_odi: 20, caps_t20: 38 },
  { name: 'Binod Bhandari', role: 'Wicketkeeper-Batsman', age: 29, caps_odi: 25, caps_t20: 42 },
  { name: 'Kushal Malla', role: 'All-rounder', age: 24, caps_odi: 18, caps_t20: 30 },
  { name: 'Sompal Kami', role: 'Bowler (Fast)', age: 27, caps_odi: 28, caps_t20: 44 },
  { name: 'Lalit Rajbanshi', role: 'Bowler (Spin)', age: 26, caps_odi: 15, caps_t20: 22 },
];

const recentResults = [
  { match: 'Nepal vs Uganda', format: 'T20I', date: '2026-03-15', venue: 'TU Cricket Ground, Kathmandu', result: 'Nepal won by 35 runs', nepal_score: '168/6', opponent_score: '133/10' },
  { match: 'Nepal vs USA', format: 'T20I', date: '2026-03-13', venue: 'TU Cricket Ground, Kathmandu', result: 'Nepal won by 7 wickets', nepal_score: '149/3', opponent_score: '148/7' },
  { match: 'Nepal vs Zimbabwe', format: 'ODI', date: '2025-11-20', venue: 'Harare Sports Club', result: 'Zimbabwe won by 4 wickets', nepal_score: '210/10', opponent_score: '211/6' },
  { match: 'Nepal vs Namibia', format: 'T20I', date: '2025-10-05', venue: 'Windhoek', result: 'Nepal won by 11 runs', nepal_score: '162/5', opponent_score: '151/9' },
];

const upcomingFixtures = [
  { match: 'Nepal vs Oman', format: 'ODI', date: '2026-05-10', venue: 'TU Cricket Ground, Kathmandu', series: 'ACC Men\'s Premier Cup' },
  { match: 'Nepal vs UAE', format: 'ODI', date: '2026-05-13', venue: 'TU Cricket Ground, Kathmandu', series: 'ACC Men\'s Premier Cup' },
  { match: 'Nepal vs Afghanistan A', format: 'T20I', date: '2026-06-01', venue: 'Pokhara Stadium', series: 'Bilateral T20I Series' },
];

exports.getFixtures = async (req, res, next) => {
  try {
    const live = await liveApi.fetchCricketFixtures();
    if (live && live.length) {
      return res.json({ status: 'success', source: 'ESPNcricinfo (Live)', data: { count: live.length, fixtures: live } });
    }
    res.json({ status: 'success', source: 'static', data: { count: upcomingFixtures.length, fixtures: upcomingFixtures } });
  } catch (e) { next(e); }
};

exports.getResults = async (req, res, next) => {
  try {
    res.json({ status: 'success', source: 'static', data: { count: recentResults.length, results: recentResults } });
  } catch (e) { next(e); }
};

exports.getSquad = async (req, res, next) => {
  try {
    const { role } = req.query;
    let squad = nepalSquad;
    if (role) squad = squad.filter(p => p.role.toLowerCase().includes(role.toLowerCase()));
    res.json({ status: 'success', source: 'static', data: { count: squad.length, squad } });
  } catch (e) { next(e); }
};

exports.getStats = async (req, res, next) => {
  try {
    res.json({
      status: 'success', source: 'static (ICC / ESPNcricinfo)',
      data: {
        team: 'Nepal',
        icc_member: 'Full Member (2014)',
        formats: ['T20I', 'ODI'],
        home_ground: 'TU Cricket Ground, Kirtipur, Kathmandu',
        capacity: 15000,
        ranking: { odi: 19, t20i: 16 },
        first_odi: '2018-08-31',
        espncricinfo_url: 'https://www.espncricinfo.com/team/nepal-44',
      },
    });
  } catch (e) { next(e); }
};
