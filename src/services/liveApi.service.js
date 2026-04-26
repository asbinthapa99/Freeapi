const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 });

const isStrictLiveMode = () => process.env.LIVE_DATA_STRICT === 'true';
const areLiveProvidersEnabled = () => process.env.NODE_ENV !== 'test' && process.env.LIVE_PROVIDERS_DISABLED !== 'true';
const defaultTimeout = () => Number(process.env.LIVE_PROVIDER_TIMEOUT_MS) || 8000;
const nepalBbox = '(26,80,31,89)';
const kathmanduValleyBbox = '(27.55,85.15,27.85,85.55)';

const getCache = (key) => cache.get(key);
const setCache = (key, value, ttl = 600) => {
  cache.set(key, value, ttl);
  return value;
};

const normalizeText = (value = '') => String(value).toLowerCase().trim();

const elementPoint = (element) => {
  const lat = element.lat || element.center?.lat;
  const lon = element.lon || element.center?.lon;
  if (lat === undefined || lon === undefined) return null;
  return { lat: Number(lat), lon: Number(lon) };
};

const osmName = (tags = {}) => tags.name || tags['name:en'] || tags['name:ne'] || 'Unnamed';

const getOverpassUrls = () => (process.env.OVERPASS_API_URLS || 'https://overpass.kumi.systems/api/interpreter,https://overpass-api.de/api/interpreter')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

const fetchOverpass = async (cacheKey, query, ttl = 3600) => {
  if (!areLiveProvidersEnabled()) return null;

  const cached = getCache(cacheKey);
  if (cached) return cached;

  for (const url of getOverpassUrls()) {
    try {
      const { data } = await axios.get(url, {
        params: { data: query },
        timeout: Number(process.env.OVERPASS_TIMEOUT_MS) || 12000,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'NepalAPI/1.0 (https://github.com/asbinthapa99/Freeapi)'
        }
      });

      if (Array.isArray(data.elements)) {
        return setCache(cacheKey, data.elements, ttl);
      }
    } catch {
      // Try the next public mirror.
    }
  }

  return null;
};

// ── NRB Forex (Nepal Rastra Bank) ──
exports.fetchNRBForex = async (requestedDate) => {
  if (!areLiveProvidersEnabled()) return null;

  const cacheKey = `nrb_forex:${requestedDate || 'latest'}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  try {
    const toDate = requestedDate ? new Date(requestedDate) : new Date();
    const fromDate = requestedDate
      ? new Date(requestedDate)
      : new Date(toDate.getTime() - (10 * 24 * 60 * 60 * 1000));
    const to = toDate.toISOString().slice(0, 10);
    const from = fromDate.toISOString().slice(0, 10);
    const { data } = await axios.get('https://www.nrb.org.np/api/forex/v1/rates', {
      params: { page: 1, per_page: requestedDate ? 1 : 15, from, to },
      timeout: 8000,
      headers: { 'Accept': 'application/json' }
    });
    // NRB returns { status:{code:200}, data:{ payload:[{date, rates:[]}] } }
    const payload = data?.data?.payload;
    if (payload && payload.length > 0) {
      const newestFirst = [...payload].sort((a, b) => new Date(b.date) - new Date(a.date));
      cache.set(cacheKey, newestFirst);
      return newestFirst;
    }
    return null;
  } catch {
    return null;
  }
};

exports.fetchForex = exports.fetchNRBForex;

// ── USGS Earthquakes (Nepal region, real-time) ──
exports.fetchEarthquakes = async () => {
  if (!areLiveProvidersEnabled()) return null;

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
  if (!areLiveProvidersEnabled()) return null;

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

exports.fetchHealthFacilities = async ({ district, type, limit = 50 } = {}) => {
  const cacheKey = `osm:health:${district || 'all'}:${type || 'all'}:${limit}`;
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"~"^(hospital|clinic|doctors|pharmacy|dentist)$"]${nepalBbox};
      node["healthcare"]${nepalBbox};
    );
    out tags center ${Number(limit)};
  `;
  const elements = await fetchOverpass(cacheKey, query);
  if (!elements) return null;

  const districtFilter = normalizeText(district);
  const typeFilter = normalizeText(type);
  return elements
    .map((element) => {
      const tags = element.tags || {};
      return {
        source: 'OpenStreetMap',
        osm_id: `${element.type}/${element.id}`,
        name: osmName(tags),
        type: tags.healthcare || tags.amenity || 'healthcare',
        district: tags['addr:district'] || tags.district || null,
        municipality: tags['addr:city'] || tags['addr:municipality'] || null,
        phone: tags.phone || tags['contact:phone'] || null,
        coordinates: elementPoint(element)
      };
    })
    .filter((item) => !districtFilter || normalizeText(item.district || item.municipality || item.name).includes(districtFilter))
    .filter((item) => !typeFilter || normalizeText(item.type).includes(typeFilter));
};

exports.fetchBankBranches = async ({ district, bank, limit = 50 } = {}) => {
  const cacheKey = `osm:banks:${district || 'all'}:${bank || 'all'}:${limit}`;
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="bank"]${nepalBbox};
      node["office"~"^(financial|bank)$"]${nepalBbox};
    );
    out tags center ${Number(limit)};
  `;
  const elements = await fetchOverpass(cacheKey, query);
  if (!elements) return null;

  const districtFilter = normalizeText(district);
  const bankFilter = normalizeText(bank);
  return elements
    .map((element) => {
      const tags = element.tags || {};
      return {
        source: 'OpenStreetMap',
        osm_id: `${element.type}/${element.id}`,
        bank: osmName(tags),
        district: tags['addr:district'] || tags['addr:city'] || tags['addr:municipality'] || null,
        branch: tags.branch || osmName(tags),
        phone: tags.phone || tags['contact:phone'] || null,
        coordinates: elementPoint(element)
      };
    })
    .filter((item) => !districtFilter || normalizeText(`${item.district || ''} ${item.bank}`).includes(districtFilter))
    .filter((item) => !bankFilter || normalizeText(item.bank).includes(bankFilter));
};

exports.fetchGovernmentOffices = async ({ municipality, ward, limit = 50 } = {}) => {
  const cacheKey = `osm:gov:${municipality || 'all'}:${ward || 'all'}:${limit}`;
  const query = `
    [out:json][timeout:25];
    (
      node["office"="government"]${nepalBbox};
    );
    out tags center ${Number(limit)};
  `;
  const elements = await fetchOverpass(cacheKey, query);
  if (!elements) return null;

  const municipalityFilter = normalizeText(municipality);
  const wardFilter = ward ? String(ward) : '';
  return elements
    .map((element) => {
      const tags = element.tags || {};
      return {
        source: 'OpenStreetMap',
        osm_id: `${element.type}/${element.id}`,
        name: osmName(tags),
        office_type: tags.office || tags.amenity || 'government',
        municipality: tags['addr:city'] || tags['addr:municipality'] || null,
        ward: tags['addr:ward'] || tags.ward || null,
        phone: tags.phone || tags['contact:phone'] || null,
        coordinates: elementPoint(element)
      };
    })
    .filter((item) => !municipalityFilter || normalizeText(`${item.municipality || ''} ${item.name}`).includes(municipalityFilter))
    .filter((item) => !wardFilter || String(item.ward || item.name).includes(wardFilter));
};

exports.fetchTourismRoutes = async ({ region, limit = 50 } = {}) => {
  const cacheKey = `osm:tourism-routes:${region || 'all'}:${limit}`;
  const query = `
    [out:json][timeout:25];
    (
      node["tourism"~"^(attraction|viewpoint)$"]${nepalBbox};
      node["natural"="peak"]${nepalBbox};
    );
    out tags center ${Number(limit)};
  `;
  const elements = await fetchOverpass(cacheKey, query);
  if (!elements) return null;

  const regionFilter = normalizeText(region);
  return elements
    .map((element) => {
      const tags = element.tags || {};
      return {
        source: 'OpenStreetMap',
        osm_id: `${element.type}/${element.id}`,
        name: osmName(tags),
        route_type: tags.route || tags.tourism || 'tourism',
        distance: tags.distance || null,
        network: tags.network || null,
        region: tags.region || tags['addr:region'] || null,
        coordinates: elementPoint(element)
      };
    })
    .filter((item) => !regionFilter || normalizeText(`${item.region || ''} ${item.name}`).includes(regionFilter));
};

exports.fetchTourismPlaces = async ({ location, limit = 50 } = {}) => {
  const cacheKey = `osm:tourism-places:${location || 'all'}:${limit}`;
  const query = `
    [out:json][timeout:25];
    (
      node["tourism"~"^(guest_house|hotel|hostel|alpine_hut|camp_site)$"]${nepalBbox};
    );
    out tags center ${Number(limit)};
  `;
  const elements = await fetchOverpass(cacheKey, query);
  if (!elements) return null;

  const locationFilter = normalizeText(location);
  return elements
    .map((element) => {
      const tags = element.tags || {};
      return {
        source: 'OpenStreetMap',
        osm_id: `${element.type}/${element.id}`,
        name: osmName(tags),
        type: tags.tourism,
        location: tags['addr:city'] || tags['addr:place'] || tags.place || null,
        phone: tags.phone || tags['contact:phone'] || null,
        website: tags.website || tags['contact:website'] || null,
        coordinates: elementPoint(element)
      };
    })
    .filter((item) => !locationFilter || normalizeText(`${item.location || ''} ${item.name}`).includes(locationFilter));
};

exports.fetchTransportRoutes = async ({ start, end, limit = 50 } = {}) => {
  const cacheKey = `osm:transport:${start || 'all'}:${end || 'all'}:${limit}`;
  const query = `
    [out:json][timeout:25];
    (
      node["highway"="bus_stop"]${kathmanduValleyBbox};
      node["public_transport"~"^(stop_position|platform)$"]${kathmanduValleyBbox};
    );
    out tags center ${Number(limit)};
  `;
  const elements = await fetchOverpass(cacheKey, query);
  if (!elements) return null;

  const startFilter = normalizeText(start);
  const endFilter = normalizeText(end);
  return elements
    .map((element) => {
      const tags = element.tags || {};
      return {
        source: 'OpenStreetMap',
        osm_id: `${element.type}/${element.id}`,
        name: osmName(tags),
        route: tags.route || tags.highway || tags.public_transport || 'public_transport',
        from: tags.from || null,
        to: tags.to || null,
        operator: tags.operator || null,
        coordinates: elementPoint(element)
      };
    })
    .filter((item) => !startFilter || normalizeText(`${item.from || ''} ${item.name}`).includes(startFilter))
    .filter((item) => !endFilter || normalizeText(`${item.to || ''} ${item.name}`).includes(endFilter));
};

exports.fetchWorldBankIndicator = async (indicator, { perPage = 5 } = {}) => {
  if (!areLiveProvidersEnabled()) return null;

  const cacheKey = `worldbank:np:${indicator}:${perPage}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.get(`https://api.worldbank.org/v2/country/NP/indicator/${indicator}`, {
      params: { format: 'json', per_page: perPage },
      timeout: defaultTimeout()
    });
    const rows = Array.isArray(data) ? data[1] || [] : [];
    const result = rows
      .filter((row) => row.value !== null && row.value !== undefined)
      .map((row) => ({
        indicator: row.indicator?.value || indicator,
        date: row.date,
        value: row.value,
        unit: row.unit || null,
        source: 'World Bank'
      }));
    return setCache(cacheKey, result, 21600);
  } catch {
    return null;
  }
};

// ── Kalimati Market Prices (Government portal) ──
exports.fetchKalimati = async () => {
  if (!areLiveProvidersEnabled()) return null;

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
exports.areLiveProvidersEnabled = areLiveProvidersEnabled;

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
