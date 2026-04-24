const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 });

const buildDateRange = (requestedDate) => {
  const parsedDate = requestedDate ? new Date(requestedDate) : new Date();
  const safeDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  const year = safeDate.getUTCFullYear();

  return {
    from: `${year}-01-01`,
    to: `${year}-12-31`
  };
};

// NRB Real Forex API
exports.fetchNRBForex = async (requestedDate) => {
  const cacheKey = `nrb_forex:${requestedDate || 'latest'}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  try {
    const { from, to } = buildDateRange(requestedDate);
    const { data } = await axios.get('https://www.nrb.org.np/api/forex/v1/rates', {
      params: {
        page: 1,
        per_page: 5,
        from,
        to
      },
      timeout: 8000
    });
    cache.set(cacheKey, data);
    return data;
  } catch (err) {
    return null;
  }
};

exports.fetchForex = exports.fetchNRBForex;

// USGS Real Earthquake API (Nepal region)
exports.fetchEarthquakes = async () => {
  const cached = cache.get('earthquakes');
  if (cached) return cached;
  try {
    const { data } = await axios.get('https://earthquake.usgs.gov/fdsnws/event/1/query', {
      params: { format: 'geojson', minlatitude: 26, maxlatitude: 31, minlongitude: 80, maxlongitude: 89, limit: 10, orderby: 'time' },
      timeout: 8000
    });
    const results = data.features.map(f => ({
      magnitude: f.properties.mag,
      place: f.properties.place,
      time: new Date(f.properties.time).toISOString(),
      depth_km: f.geometry.coordinates[2],
      coordinates: { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] }
    }));
    cache.set('earthquakes', results);
    return results;
  } catch (err) {
    return null;
  }
};

// OpenWeatherMap (requires API key in .env)
exports.fetchWeather = async (lat = 27.7172, lon = 85.324) => {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key || key === 'your_openweather_api_key_here') return null;
  try {
    const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`, { timeout: 8000 });
    return { temp_c: data.main.temp, humidity: data.main.humidity, condition: data.weather[0].main, description: data.weather[0].description, wind_speed: data.wind.speed };
  } catch (err) {
    return null;
  }
};
