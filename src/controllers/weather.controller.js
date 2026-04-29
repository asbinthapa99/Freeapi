const liveApi = require('../services/liveApi.service');

const CITIES_MAP = liveApi.NEPAL_CITIES.reduce((acc, c) => {
  acc[c.city.toLowerCase()] = c;
  return acc;
}, {});

exports.getAllCities = async (req, res, next) => {
  try {
    const live = await liveApi.fetchWeatherAllCities();
    if (live && live.length) {
      return res.json({ status: 'success', source: 'Open-Meteo (Live)', data: { count: live.length, cities: live } });
    }
    if (liveApi.isStrictLiveMode()) {
      return res.status(503).json({ error: { code: 'WEATHER_UNAVAILABLE', message: 'Live weather data unavailable.', status: 503 } });
    }
    res.json({ status: 'success', source: 'fallback', data: { cities: liveApi.NEPAL_CITIES.map(c => ({ ...c, temperature_c: null, condition: 'Unavailable' })) } });
  } catch (e) { next(e); }
};

exports.getCity = async (req, res, next) => {
  try {
    const key = req.params.city.toLowerCase();
    const cityInfo = CITIES_MAP[key];
    if (!cityInfo) {
      const available = liveApi.NEPAL_CITIES.map(c => c.city).join(', ');
      return res.status(404).json({ error: { code: 'CITY_NOT_FOUND', message: `City not found. Available: ${available}`, status: 404 } });
    }
    const weather = await liveApi.fetchWeather(cityInfo.lat, cityInfo.lon);
    if (weather) {
      return res.json({ status: 'success', source: 'Open-Meteo (Live)', data: { city: cityInfo.city, lat: cityInfo.lat, lon: cityInfo.lon, ...weather } });
    }
    if (liveApi.isStrictLiveMode()) {
      return res.status(503).json({ error: { code: 'WEATHER_UNAVAILABLE', message: 'Live weather data unavailable.', status: 503 } });
    }
    res.json({ status: 'success', source: 'fallback', data: { city: cityInfo.city, temperature_c: null, condition: 'Unavailable' } });
  } catch (e) { next(e); }
};

exports.listCities = async (req, res, next) => {
  try {
    res.json({
      status: 'success',
      data: {
        cities: liveApi.NEPAL_CITIES.map(c => ({ ...c, endpoint: `/api/v1/weather/city/${c.city.toLowerCase()}` })),
      },
    });
  } catch (e) { next(e); }
};
