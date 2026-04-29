# Nepal API Ecosystem

**21 free, production-ready REST APIs built for Nepal.** Agriculture, tourism, finance, health, transport, NEPSE stock data, live weather, gold & silver rates, fuel prices, Bikram Sambat calendar, Nepal cricket, festivals, news, energy, and more — all under one base URL.

> 📖 **Swagger Docs:** [`/docs`](https://nepal-api-production.up.railway.app/docs) &nbsp;|&nbsp; ⚡ **Health:** [`/health`](https://nepal-api-production.up.railway.app/health) &nbsp;|&nbsp; 🌐 **Landing:** [freeapi-six.vercel.app](https://freeapi-six.vercel.app)

---

## Base URL

```
https://nepal-api-production.up.railway.app/api/v1
```

No API key needed for public read endpoints. Write endpoints require a Bearer token — see [Authentication](#authentication).

---

## Quick Start

```bash
# Health check
curl https://nepal-api-production.up.railway.app/health

# Live NRB forex rates
curl https://nepal-api-production.up.railway.app/api/v1/finance/forex/rates

# Live USGS earthquakes (Nepal region)
curl https://nepal-api-production.up.railway.app/api/v1/disaster/earthquakes/recent

# Job search
curl "https://nepal-api-production.up.railway.app/api/v1/jobs/search?category=IT&location=Kathmandu"
```

---

## APIs

### 🔐 Auth — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | — | Login, returns Bearer token |
| POST | `/auth/register` | — | Self-register (if open registration enabled) |
| POST | `/auth/refresh` | — | Refresh access token |
| POST | `/auth/logout` | — | Invalidate refresh token |
| GET | `/auth/me` | Bearer | Current user profile |
| GET | `/auth/users` | Admin | List all users |
| POST | `/auth/users` | Admin | Create a user |
| PATCH | `/auth/users/:user_id` | Admin | Update user |
| DELETE | `/auth/users/:user_id` | Admin | Delete user |

---

### 🗣️ BhasaAI — `/api/v1/language`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/language/translate` | — | Translate text (Nepali ↔ English) |
| POST | `/language/transliterate` | — | Romanize Nepali text |
| POST | `/language/sentiment` | — | Sentiment analysis |
| POST | `/language/ner` | — | Named entity recognition |
| GET | `/language/detect?text=...` | — | Detect language |

```bash
curl -X POST https://nepal-api-production.up.railway.app/api/v1/language/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","source_lang":"en","target_lang":"ne"}'
```

---

### 🌾 KrishiData — `/api/v1/agri`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/agri/prices/kalimati` | — | Live Kalimati market prices |
| GET | `/agri/crops/calendar` | — | Planting/harvest calendar |
| GET | `/agri/weather/forecast?lat=&lon=` | — | Live weather via Open-Meteo |
| POST | `/agri/disease/analyze` | — | Crop disease diagnosis |
| POST | `/agri/fertilizer/recommend` | — | Fertilizer recommendations |

```bash
# Live weather for Kathmandu
curl "https://nepal-api-production.up.railway.app/api/v1/agri/weather/forecast?lat=27.7172&lon=85.324"
```

---

### 🚨 NepalAlert — `/api/v1/disaster`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/disaster/alerts/active` | — | Active disaster alerts |
| GET | `/disaster/rivers/levels` | — | River monitoring stations |
| GET | `/disaster/earthquakes/recent` | — | Live USGS earthquakes (Nepal region) |
| GET | `/disaster/landslide-risk` | — | Landslide risk zones |
| POST | `/disaster/subscriptions/register` | — | Subscribe to SMS alerts |

```bash
# Real-time earthquakes (M3.5+, Nepal region)
curl https://nepal-api-production.up.railway.app/api/v1/disaster/earthquakes/recent
```

---

### 🏔️ YatraTech — `/api/v1/tourism`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tourism/treks/routes` | — | Trekking routes (OSM-backed) |
| POST | `/tourism/permits/apply` | — | Apply for trekking permit |
| GET | `/tourism/permits/:permit_id/status` | — | Check permit status |
| POST | `/tourism/itinerary/generate` | — | AI itinerary generator |
| GET | `/tourism/teahouses/availability` | — | Teahouse/lodge availability (OSM) |
| POST | `/tourism/health/altitude-risk` | — | Altitude sickness risk |

```bash
curl -X POST https://nepal-api-production.up.railway.app/api/v1/tourism/permits/apply \
  -H "Content-Type: application/json" \
  -d '{"trek_id":"EBC","passport_number":"P123456","nationality":"Foreign"}'
```

---

### 💰 PaisaLink — `/api/v1/finance`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/finance/forex/rates` | — | Live NRB forex rates (NPR) |
| GET | `/finance/inflation` | — | Live inflation data (World Bank) |
| POST | `/finance/remittance/calculate` | — | Remittance calculator |
| GET | `/finance/remittance/:tracking_code` | — | Remittance status |
| POST | `/finance/payments/initiate` | Bearer | Initiate eSewa/Khalti payment |
| GET | `/finance/banks/branches` | — | Bank branches (OSM-backed) |
| POST | `/finance/budget/categorize` | — | Budget categorizer |

```bash
# Live NRB forex (USD, EUR, GBP, INR, etc.)
curl https://nepal-api-production.up.railway.app/api/v1/finance/forex/rates
```

---

### 📚 Shikshya — `/api/v1/education`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/education/tutor/ask` | — | AI tutor (any subject/grade) |
| GET | `/education/syllabus/:grade` | — | Syllabus by grade (`SEE`, `PLUS_TWO`, `1`–`12`) |
| GET | `/education/syllabus/topics` | — | All syllabus topics |
| GET | `/education/past-papers` | — | Past exam papers list |
| GET | `/education/past-papers/:subject/:year` | — | Specific past paper |
| POST | `/education/grade/objective` | — | Grade objective answers |
| POST | `/education/grade/essay` | — | Grade essay answers |

---

### 🏥 SwasthyaTriage — `/api/v1/health`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/health/triage/analyze` | — | Symptom-based triage |
| GET | `/health/facilities/nearby` | — | Nearby health facilities (OSM-backed) |
| GET | `/health/first-aid/:condition` | — | First-aid guide |
| GET | `/health/diseases/outbreaks` | — | Disease outbreak monitor |
| POST | `/health/sync/offline-records` | Admin | Sync health records |

```bash
curl -X POST https://nepal-api-production.up.railway.app/api/v1/health/triage/analyze \
  -H "Content-Type: application/json" \
  -d '{"symptoms":["high_fever","joint_pain","rash"],"patient_age":28}'
```

---

### 🏛️ NagarikConnect — `/api/v1/gov`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/gov/holidays` | — | Public holidays |
| GET | `/gov/holidays/:year` | — | Holidays for a specific year |
| GET | `/gov/tax/vehicle-rates` | — | Vehicle tax rates |
| POST | `/gov/documents/verify` | Admin | Document verification |
| GET | `/gov/offices/ward` | — | Ward offices (OSM-backed) |
| GET | `/gov/applications/status/:tracking_id` | — | Application status |

---

### 💼 RozgariMatch — `/api/v1/jobs`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/jobs/search` | — | Search jobs (`category`, `location`, `type`) |
| GET | `/jobs/categories` | — | All job categories |
| POST | `/jobs/resume/parse` | — | Extract skills from resume text |
| POST | `/jobs/match` | — | Match candidate to open jobs |
| GET | `/jobs/foreign-demands/verify/:lt_number` | — | Foreign demand letter lookup |
| POST | `/jobs/post` | Admin | Post a job listing |

```bash
curl "https://nepal-api-production.up.railway.app/api/v1/jobs/search?category=IT&location=Kathmandu"
```

---

### 🚌 YataYat — `/api/v1/transport`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/transport/routes/search` | — | Bus stop search (OSM-backed) |
| GET | `/transport/routes/intercity` | — | Intercity routes |
| GET | `/transport/fares/calculate` | — | Fare calculator |
| GET | `/transport/seats/:trip_id` | — | Available seats |
| GET | `/transport/buses/:bus_id/location` | — | Live bus location |
| POST | `/transport/tickets/book` | — | Book a ticket |

---

### 📈 NEPSE — `/api/v1/nepse`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/nepse/live` | Live NEPSE index from Nepal Stock Exchange |
| GET | `/nepse/top-gainers` | Top gaining stocks today |
| GET | `/nepse/top-losers` | Top losing stocks today |
| GET | `/nepse/market-status` | Is market open? Trading hours |
| GET | `/nepse/brokers` | Registered NEPSE broker list |

---

### 📰 News — `/api/v1/news`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/news/headlines` | Aggregated headlines from all RSS sources |
| GET | `/news/source/:source` | News from a specific source (`onlinekhabar`, `setopati`, `ratopati`, `ekantipur`) |
| GET | `/news/feeds` | List all available RSS feed sources |

---

### ⛅ Weather — `/api/v1/weather`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/weather` | Live weather for all 10 major Nepal cities |
| GET | `/weather/city/:city` | Weather for a specific city (e.g. `kathmandu`, `pokhara`) |
| GET | `/weather/cities` | List of available cities with coordinates |

Cities available: Kathmandu, Pokhara, Biratnagar, Bhaktapur, Lalitpur, Birgunj, Dharan, Butwal, Hetauda, Chitwan.

---

### ⛽ Fuel Prices — `/api/v1/fuel`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/fuel/prices` | Current petrol, diesel, kerosene prices (NPR/litre) |
| GET | `/fuel/history` | Recent NOC price change history |

---

### 🪙 Gold & Silver — `/api/v1/gold`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/gold/rates` | Today's gold (24K, tejabilo) and silver rates per tola |
| GET | `/gold/history` | Recent rate history |
| GET | `/gold/convert?weight_grams=&karat=` | Estimate value of gold by weight and karat |

```bash
curl "https://nepal-api-production.up.railway.app/api/v1/gold/convert?weight_grams=10&karat=22"
```

---

### 📅 BS Calendar — `/api/v1/calendar`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/calendar/today` | Today's date in both AD and BS (Bikram Sambat) |
| GET | `/calendar/convert/ad-to-bs?date=YYYY-MM-DD` | Convert AD date to BS |
| GET | `/calendar/convert/bs-to-ad?year=&month=&day=` | Convert BS date to AD |
| GET | `/calendar/holidays` | Nepal public holidays |
| GET | `/calendar/months` | BS month names in English and Nepali |

```bash
curl "https://nepal-api-production.up.railway.app/api/v1/calendar/convert/ad-to-bs?date=2026-04-14"
```

---

### 🏏 Cricket — `/api/v1/cricket`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cricket/fixtures` | Upcoming Nepal national team fixtures |
| GET | `/cricket/results` | Recent match results |
| GET | `/cricket/squad` | Current squad with roles and caps |
| GET | `/cricket/stats` | Team stats, ICC ranking, home ground |

---

### ⚡ Energy — `/api/v1/energy`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/energy/tariff` | NEA electricity tariff by category (NPR/kWh) |
| GET | `/energy/hydro` | Major Nepal hydropower plants with capacity |
| GET | `/energy/outages` | Scheduled power outages |
| GET | `/energy/summary` | National energy summary (installed MW, coverage %) |

---

### 🎉 Festivals — `/api/v1/festivals`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/festivals` | All Nepal festivals (Hindu, Buddhist, Newari, National) |
| GET | `/festivals/upcoming` | Festivals in the current/next month |
| GET | `/festivals/types` | Festival types available |

```bash
curl "https://nepal-api-production.up.railway.app/api/v1/festivals?type=Buddhist"
```

---

### 🎬 Entertainment — `/api/v1/ent`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ent/movies` | Movies now showing in Nepal cinemas |
| GET | `/ent/events` | Upcoming cultural and sporting events |
| GET | `/ent/cinemas` | Cinema locations (QFX, Big Movies, etc.) |

---

## Authentication

Admin endpoints require a Bearer token:

```bash
# 1. Get token
TOKEN=$(curl -s -X POST https://nepal-api-production.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nepalapi.dev","password":"NepalApi@2024!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")

# 2. Use it
curl -H "Authorization: Bearer $TOKEN" \
  https://nepal-api-production.up.railway.app/api/v1/auth/users
```

---

## Live Data Sources

These routes fetch real data from free public APIs:

| Endpoint | Provider |
|----------|----------|
| `/finance/forex/rates` | Nepal Rastra Bank (NRB) |
| `/finance/inflation` | World Bank |
| `/finance/banks/branches` | OpenStreetMap (Overpass) |
| `/disaster/earthquakes/recent` | USGS Earthquake Hazards |
| `/agri/weather/forecast` | Open-Meteo (free, no key) |
| `/agri/prices/kalimati` | Kalimati Market Portal |
| `/health/facilities/nearby` | OpenStreetMap (Overpass) |
| `/gov/offices/ward` | OpenStreetMap (Overpass) |
| `/tourism/treks/routes` | OpenStreetMap (Overpass) |
| `/transport/routes/search` | OpenStreetMap (Overpass) |
| `/nepse/live` | Nepal Stock Exchange API |
| `/nepse/top-gainers` | Nepal Stock Exchange API |
| `/news/headlines` | OnlineKhabar / Setopati / Ratopati / eKantipur RSS |
| `/weather` | Open-Meteo — 10 Nepal cities |
| `/weather/city/:city` | Open-Meteo (no key needed) |
| `/fuel/prices` | Nepal Oil Corporation (NOC) scrape |
| `/gold/rates` | FENEGOSIDA scrape |
| `/cricket/fixtures` | ESPNcricinfo |
| `/calendar/today` | Algorithmic BS↔AD conversion |
| `/festivals` | Static cultural calendar |
| `/energy/tariff` | NEA tariff data |

All live endpoints fall back to cached/simulated data when a provider is unreachable. To force `503` instead of fallback data:

```env
LIVE_DATA_STRICT=true
```

---

## Response Format

**Success:**
```json
{
  "status": "success",
  "data": { "..." }
}
```

**Error:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "symptoms must be a non-empty array.",
    "status": 400
  }
}
```

---

## Rate Limiting

100 requests / 15 min per IP on all `/api/` routes. Returns `429` when exceeded.

---

## Deploy Your Own

### Railway (recommended)

1. Fork this repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
3. Add environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Any long random string |
| `ADMIN_EMAIL` | Optional | Seed admin account email |
| `ADMIN_PASSWORD` | Optional | Seed admin account password |

4. Deploy — done.

### Local

```bash
git clone https://github.com/asbinthapa99/Freeapi.git
cd Freeapi
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run dev
# → http://localhost:3000
```

### Docker

```bash
docker build -t nepal-api .
docker run -p 3000:3000 --env-file .env nepal-api
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + Express |
| Database | MongoDB Atlas + JSON file fallback |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Validation | express-validator |
| API Docs | Swagger UI (`/docs`) |
| Logging | Winston + Morgan |
| Security | Helmet, CORS, rate-limit |
| Caching | node-cache (5–30 min TTL per endpoint) |

---

## License

Free to use with required attribution.

```text
Original work by Asbin Thapa - Nepal API Ecosystem
```

See `LICENSE` for full terms.
