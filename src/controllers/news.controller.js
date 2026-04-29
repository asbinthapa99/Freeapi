const liveApi = require('../services/liveApi.service');

const fallbackHeadlines = [
  { title: 'Nepal GDP grows 4.5% in fiscal year 2025', source: 'fallback', link: '', published: '', summary: '' },
  { title: 'Nepal Rastra Bank raises policy rate to 5%', source: 'fallback', link: '', published: '', summary: '' },
  { title: 'New hydropower projects approved in Karnali province', source: 'fallback', link: '', published: '', summary: '' },
];

exports.getHeadlines = async (req, res, next) => {
  try {
    const news = await liveApi.fetchAllNewsRSS(10);
    if (news && news.length) {
      return res.json({ status: 'success', source: 'RSS (Live)', data: { count: news.length, headlines: news } });
    }
    if (liveApi.isStrictLiveMode()) {
      return res.status(503).json({ error: { code: 'NEWS_UNAVAILABLE', message: 'Live news feeds unavailable.', status: 503 } });
    }
    res.json({ status: 'success', source: 'fallback', data: { count: fallbackHeadlines.length, headlines: fallbackHeadlines } });
  } catch (e) { next(e); }
};

exports.getBySource = async (req, res, next) => {
  try {
    const { source } = req.params;
    const validSources = liveApi.RSS_FEED_SOURCES;
    if (!validSources.includes(source)) {
      return res.status(400).json({ error: { code: 'INVALID_SOURCE', message: `Valid sources: ${validSources.join(', ')}`, status: 400 } });
    }
    const { limit = 15 } = req.query;
    const news = await liveApi.fetchNewsRSS(source, Number(limit));
    if (news && news.length) {
      return res.json({ status: 'success', source: `${source} RSS (Live)`, data: { count: news.length, articles: news } });
    }
    if (liveApi.isStrictLiveMode()) {
      return res.status(503).json({ error: { code: 'SOURCE_UNAVAILABLE', message: `Feed from ${source} is unavailable.`, status: 503 } });
    }
    res.json({ status: 'success', source: 'fallback', data: { count: 0, articles: [] } });
  } catch (e) { next(e); }
};

exports.getRssFeeds = async (req, res, next) => {
  try {
    const feeds = liveApi.RSS_FEED_SOURCES.map(name => ({
      name,
      endpoint: `/api/v1/news/source/${name}`,
    }));
    res.json({ status: 'success', data: { count: feeds.length, feeds } });
  } catch (e) { next(e); }
};
