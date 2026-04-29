/**
 * DISCLAIMER:
 * This is a non-profit, open-source project. All live data fetched from public APIs 
 * (NRB, USGS, Open-Meteo, Kalimati Market, World Bank, etc.) are strictly for 
 * educational and informational purposes. Copyrights and intellectual property 
 * of the original data belong to their respective organizations and sources.
 */
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
    // Government Kalimati market price API (Main page now holds the daily table)
    const { data } = await axios.get('https://kalimatimarket.gov.np/', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NepalAPI/1.0)',
        'Accept': 'application/json, text/html'
      }
    });

    const rows = [];
    const tableMatch = data.match(/id="commodityDailyPrice"[^>]*>([\s\S]*?)<\/table>/i);
    
    if (tableMatch) {
      const trRegex = /<tr>([\s\S]*?)<\/tr>/gi;
      let trMatch;
      while ((trMatch = trRegex.exec(tableMatch[1])) !== null) {
        const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
        const cells = [];
        let tdMatch;
        while ((tdMatch = tdRegex.exec(trMatch[1])) !== null) {
          cells.push(tdMatch[1].trim());
        }
        
        if (cells.length >= 4) {
          // Parse commodity and unit
          const commodityHtml = cells[0];
          const unitMatch = commodityHtml.match(/<span[^>]*>\((.*?)\)<\/span>/i) || commodityHtml.match(/\((.*?)\)/);
          const unit = unitMatch ? unitMatch[1].replace(/<[^>]*>/g, '').trim() : '';
          const commodity = commodityHtml.replace(/<span[^>]*>.*?<\/span>/i, '').replace(/\(.*?\)/, '').trim();
          
          // Helper to convert Nepali numerals and parse float
          const parseNepaliPrice = (str) => {
            if (!str) return NaN;
            const cleanStr = str.replace(/<[^>]*>/g, '').replace(/रू\s*/g, '').trim();
            const enStr = cleanStr.replace(/[०-९]/g, d => '०१२३४५६७८९'.indexOf(d));
            return parseFloat(enStr);
          };
          
          const min_price = parseNepaliPrice(cells[1]);
          const max_price = parseNepaliPrice(cells[2]);
          
          // Valid commodity checks (ignore header or malformed rows)
          if (commodity && commodity !== 'कृषि उपज' && !isNaN(min_price)) {
            rows.push({ 
              commodity, 
              unit: unit || 'kg', 
              min_price, 
              max_price: isNaN(max_price) ? min_price : max_price 
            });
          }
        }
      }
    }

    if (rows.length > 3) {
      cache.set('kalimati', rows, 3600);
      return rows;
    }
    return null;
  } catch (e) {
    return null;
  }
};

// ── Nepal cities for multi-city weather ──────────────────────────────────────
const NEPAL_CITIES = [
  { city: 'Kathmandu', lat: 27.7172, lon: 85.3240 },
  { city: 'Pokhara', lat: 28.2096, lon: 83.9856 },
  { city: 'Biratnagar', lat: 26.4525, lon: 87.2718 },
  { city: 'Bhaktapur', lat: 27.6710, lon: 85.4298 },
  { city: 'Lalitpur', lat: 27.6588, lon: 85.3247 },
  { city: 'Birgunj', lat: 27.0104, lon: 84.8778 },
  { city: 'Dharan', lat: 26.8120, lon: 87.2840 },
  { city: 'Butwal', lat: 27.7006, lon: 83.4532 },
  { city: 'Hetauda', lat: 27.4264, lon: 85.0313 },
  { city: 'Chitwan', lat: 27.5291, lon: 84.3542 },
];
exports.NEPAL_CITIES = NEPAL_CITIES;

// ── NEPSE Stock Exchange ──────────────────────────────────────────────────────
exports.fetchNepseData = async () => {
  if (!areLiveProvidersEnabled()) return null;
  const cached = getCache('nepse_data');
  if (cached) return cached;
  try {
    const [indexRes, topRes, statusRes] = await Promise.allSettled([
      axios.get('https://nepalstock.com.np/api/nots/nepse-index', { timeout: defaultTimeout(), headers: { Accept: 'application/json' } }),
      axios.get('https://nepalstock.com.np/api/nots/top-ten-trade-share', { timeout: defaultTimeout(), headers: { Accept: 'application/json' } }),
      axios.get('https://nepalstock.com.np/api/nots/market-open', { timeout: defaultTimeout(), headers: { Accept: 'application/json' } }),
    ]);
    const index = indexRes.status === 'fulfilled' ? indexRes.value.data : null;
    const topTraded = topRes.status === 'fulfilled' ? topRes.value.data : null;
    const marketStatus = statusRes.status === 'fulfilled' ? statusRes.value.data : null;
    if (!index) return null;
    const result = { index, topTraded, marketStatus, fetchedAt: new Date().toISOString() };
    setCache('nepse_data', result, 300);
    return result;
  } catch (e) {
    return null;
  }
};

// ── Multi-city Nepal Weather ──────────────────────────────────────────────────
exports.fetchWeatherAllCities = async () => {
  if (!areLiveProvidersEnabled()) return null;
  const cached = getCache('weather_all_cities');
  if (cached) return cached;
  try {
    const results = await Promise.allSettled(
      NEPAL_CITIES.map(({ city, lat, lon }) =>
        exports.fetchWeather(lat, lon).then(w => (w ? { city, lat, lon, ...w } : null))
      )
    );
    const cities = results.filter(r => r.status === 'fulfilled' && r.value).map(r => r.value);
    if (!cities.length) return null;
    setCache('weather_all_cities', cities, 1800);
    return cities;
  } catch (e) {
    return null;
  }
};

// ── News RSS Feeds ────────────────────────────────────────────────────────────
const RSS_FEEDS = {
  onlinekhabar: 'https://www.onlinekhabar.com/feed',
  setopati: 'https://setopati.com/feed',
  ratopati: 'https://ratopati.com/feed',
  ekantipur: 'https://ekantipur.com/rss',
};
exports.RSS_FEED_SOURCES = Object.keys(RSS_FEEDS);

const parseRSSItems = (xml, source, limit = 15) => {
  const items = [];
  const blocks = xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
  for (const block of blocks.slice(0, limit)) {
    const get = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'))
        || block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return m ? m[1].trim().replace(/<[^>]+>/g, '') : '';
    };
    const title = get('title');
    if (title) items.push({ title, link: get('link'), published: get('pubDate'), summary: get('description').slice(0, 200), source });
  }
  return items;
};

exports.fetchNewsRSS = async (source = 'onlinekhabar', limit = 15) => {
  if (!areLiveProvidersEnabled()) return null;
  const cacheKey = `news_rss_${source}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;
  const url = RSS_FEEDS[source];
  if (!url) return null;
  try {
    const res = await axios.get(url, {
      timeout: defaultTimeout(),
      headers: { 'User-Agent': 'NepalAPI/1.0', Accept: 'application/rss+xml, text/xml' },
    });
    const items = parseRSSItems(res.data, source, limit);
    if (!items.length) return null;
    setCache(cacheKey, items, 900);
    return items;
  } catch (e) {
    return null;
  }
};

exports.fetchAllNewsRSS = async (limit = 8) => {
  if (!areLiveProvidersEnabled()) return null;
  const cached = getCache('news_rss_all');
  if (cached) return cached;
  const results = await Promise.allSettled(Object.keys(RSS_FEEDS).map(s => exports.fetchNewsRSS(s, limit)));
  const combined = results.filter(r => r.status === 'fulfilled' && Array.isArray(r.value)).flatMap(r => r.value);
  if (!combined.length) return null;
  setCache('news_rss_all', combined, 900);
  return combined;
};

// ── Fuel Prices (NOC Nepal) ───────────────────────────────────────────────────
exports.fetchFuelPrices = async () => {
  if (!areLiveProvidersEnabled()) return null;
  const cached = getCache('fuel_prices');
  if (cached) return cached;
  try {
    const res = await axios.get('https://noc.org.np/', {
      timeout: defaultTimeout(),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NepalAPI/1.0)' },
    });
    const html = res.data;
    const grab = (pattern) => { const m = html.match(pattern); return m ? parseFloat(m[1].replace(/,/g, '')) : null; };
    const petrol = grab(/[Pp]etrol[^0-9]*?([\d,]+(?:\.\d+)?)\s*(?:per litre|\/litre|NPR)?/);
    const diesel = grab(/[Dd]iesel[^0-9]*?([\d,]+(?:\.\d+)?)\s*(?:per litre|\/litre|NPR)?/);
    const kerosene = grab(/[Kk]erosene[^0-9]*?([\d,]+(?:\.\d+)?)\s*(?:per litre|\/litre|NPR)?/);
    if (petrol || diesel) {
      const data = { petrol_per_litre: petrol, diesel_per_litre: diesel, kerosene_per_litre: kerosene, currency: 'NPR', source: 'Nepal Oil Corporation', source_url: 'https://noc.org.np/', fetchedAt: new Date().toISOString() };
      setCache('fuel_prices', data, 21600);
      return data;
    }
    return null;
  } catch (e) {
    return null;
  }
};

// ── Gold & Silver Rates (FENEGOSIDA) ─────────────────────────────────────────
exports.fetchGoldRates = async () => {
  if (!areLiveProvidersEnabled()) return null;
  const cached = getCache('gold_rates');
  if (cached) return cached;
  try {
    const res = await axios.get('https://www.fenegosida.org.np/', {
      timeout: defaultTimeout(),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NepalAPI/1.0)' },
    });
    const html = res.data;
    const grab = (pattern) => { const m = html.match(pattern); return m ? parseFloat(m[1].replace(/,/g, '')) : null; };
    const fine = grab(/(?:Fine Gold|24\s*[Kk])[^0-9]*([\d,]+(?:\.\d+)?)/i);
    const tejabilo = grab(/[Tt]ejabilo[^0-9]*([\d,]+(?:\.\d+)?)/i);
    const silver = grab(/[Ss]ilver[^0-9]*([\d,]+(?:\.\d+)?)/i);
    if (fine) {
      const data = { fine_gold_per_tola_npr: fine, tejabilo_gold_per_tola_npr: tejabilo, silver_per_tola_npr: silver, unit: 'tola (11.664g)', source: 'FENEGOSIDA', source_url: 'https://www.fenegosida.org.np/', date: new Date().toISOString().split('T')[0], fetchedAt: new Date().toISOString() };
      setCache('gold_rates', data, 3600);
      return data;
    }
    return null;
  } catch (e) {
    return null;
  }
};

// ── Nepal Cricket (ESPNcricinfo) ──────────────────────────────────────────────
exports.fetchCricketFixtures = async () => {
  if (!areLiveProvidersEnabled()) return null;
  const cached = getCache('cricket_fixtures');
  if (cached) return cached;
  try {
    const res = await axios.get('https://hs-consumer-api.espncricinfo.com/v1/pages/team/schedule?lang=en&teamId=44', {
      timeout: defaultTimeout(),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NepalAPI/1.0)', Accept: 'application/json' },
    });
    const matches = (res.data?.content || []).slice(0, 10).map(m => ({
      match_id: m.match?.objectId,
      title: m.match?.title,
      status: m.match?.statusText,
      date: m.match?.startDate,
      format: m.match?.matchFormat,
      series: m.match?.series?.longName,
      venue: m.match?.ground?.longName,
      teams: (m.match?.teams || []).map(t => t.longName),
    }));
    if (!matches.length) return null;
    setCache('cricket_fixtures', matches, 1800);
    return matches;
  } catch (e) {
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
