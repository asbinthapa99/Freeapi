const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 });

const isStrictLiveMode = () => process.env.LIVE_DATA_STRICT === 'true';

// ── NRB Forex (Nepal Rastra Bank) ──
exports.fetchNRBForex = async (requestedDate) => {
  const cacheKey = `nrb_forex:${requestedDate || 'latest'}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  try {
    const now = new Date();
    const from = `${now.getUTCFullYear()}-01-01`;
    const to   = `${now.getUTCFullYear()}-12-31`;
    const { data } = await axios.get('https://www.nrb.org.np/api/forex/v1/rates', {
      params: { page: 1, per_page: 5, from, to },
      timeout: 8000,
      headers: { 'Accept': 'application/json' }
    });
    // NRB returns { status:{code:200}, data:{ payload:[{date, rates:[]}] } }
    const payload = data?.data?.payload;
    if (payload && payload.length > 0) {
      cache.set(cacheKey, payload);
      return payload;
    }
    return null;
  } catch {
    return null;
  }
};

exports.fetchForex = exports.fetchNRBForex;

// ── USGS Earthquakes (Nepal region, real-time) ──
exports.fetchEarthquakes = async () => {
  const cached = cache.get('earthquakes');
  if (cached) return cached;
  try {
    const { data } = await axios.get('https://earthquake.usgs.gov/fdsnws/event/1/query', {
      params: {
        format: 'geojson',
        minlatitude: 26, maxlatitude: 31,
        minlongitude: 80, maxlongitude: 89,
        minmagnitude: 3.5,
        limit: 15,
        orderby: 'time'
      },
      timeout: 10000
    });
    const results = (data.features || []).map(f => ({
      magnitude: f.properties.mag,
      location: f.properties.place,
      time: new Date(f.properties.time).toISOString(),
      depth_km: parseFloat(f.geometry.coordinates[2].toFixed(1)),
      coordinates: {
        lat: parseFloat(f.geometry.coordinates[1].toFixed(4)),
        lng: parseFloat(f.geometry.coordinates[0].toFixed(4))
      },
      url: f.properties.url
    }));
    cache.set('earthquakes', results, 300); // 5 min cache
    return results;
  } catch {
    return null;
  }
};

// ── Open-Meteo Weather (free, no API key needed) ──
exports.fetchWeather = async (lat = 27.7172, lon = 85.324) => {
  const cacheKey = `weather:${lat}:${lon}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  try {
    const { data } = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation',
        timezone: 'Asia/Kathmandu',
        forecast_days: 1
      },
      timeout: 8000
    });
    const c = data.current;
    const result = {
      lat,
      lon,
      temp_c: c.temperature_2m,
      humidity: c.relative_humidity_2m,
      wind_speed_kmh: c.wind_speed_10m,
      precipitation_mm: c.precipitation,
      condition: weatherCodeToCondition(c.weather_code),
      updated: c.time
    };
    cache.set(cacheKey, result, 1800); // 30 min cache
    return result;
  } catch {
    // Fallback to OpenWeatherMap if key provided
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key || key === 'your_openweather_api_key_here') return null;
    try {
      const { data } = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: { lat, lon, units: 'metric', appid: key },
        timeout: 8000
      });
      return {
        lat, lon,
        temp_c: data.main.temp,
        humidity: data.main.humidity,
        wind_speed_kmh: data.wind.speed * 3.6,
        condition: data.weather[0].main,
        updated: new Date().toISOString()
      };
    } catch {
      return null;
    }
  }
};

// ── Kalimati Market Prices (Government portal) ──
exports.fetchKalimati = async () => {
  const cached = cache.get('kalimati');
  if (cached) return cached;
  try {
    // Government Kalimati market price API
    const { data } = await axios.get('https://kalimatimarket.gov.np/lang/en/priceLang', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NepalAPI/1.0)',
        'Accept': 'application/json, text/html'
      }
    });
    // Try to parse the table from HTML response
    const rows = [];
    const regex = /<td[^>]*>(.*?)<\/td>/gi;
    const cells = [];
    let m;
    while ((m = regex.exec(data)) !== null) {
      cells.push(m[1].replace(/<[^>]+>/g, '').trim());
    }
    for (let i = 0; i + 3 < cells.length; i += 4) {
      const [commodity, unit, min_price, max_price] = cells.slice(i, i + 4);
      if (commodity && unit && !isNaN(parseFloat(min_price))) {
        rows.push({ commodity, unit, min_price: parseFloat(min_price), max_price: parseFloat(max_price) });
      }
    }
    if (rows.length > 3) {
      cache.set('kalimati', rows, 3600);
      return rows;
    }
    return null;
  } catch {
    return null;
  }
};

exports.isStrictLiveMode = isStrictLiveMode;

function weatherCodeToCondition(code) {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 49) return 'Foggy';
  if (code <= 69) return 'Drizzle';
  if (code <= 79) return 'Rain';
  if (code <= 84) return 'Rain Showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}
