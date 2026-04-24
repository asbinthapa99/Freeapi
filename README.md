# Nepal API Ecosystem

**10 free, production-ready REST APIs built for Nepal.** Agriculture prices, trekking permits, health triage, transport booking, forex rates, job matching, and more — all under one base URL.

> 📖 **Swagger Docs:** `/docs` &nbsp;|&nbsp; ⚡ **Health:** `/health`

---

## Base URL

```
https://your-app.vercel.app/api/v1
```

No API key needed for public read endpoints. Write endpoints require a Bearer token — see [Authentication](#authentication).

---

## Quick Start

```bash
# Health check
curl https://your-app.vercel.app/health

# Live forex rates (NPR)
curl https://your-app.vercel.app/api/v1/finance/forex/rates

# Trekking routes
curl https://your-app.vercel.app/api/v1/tourism/treks/routes

# Job search
curl "https://your-app.vercel.app/api/v1/jobs/search?category=IT&location=Kathmandu"
```

---

## Swagger Preview

Interactive API docs are available at `/docs`.

![Swagger UI Preview](<Screenshot 2026-04-24 at 23.09.28.png>)

---

## APIs

### 🔐 Auth — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | — | Login, returns Bearer token |
| POST | `/auth/register` | Admin | Create a new user |
| POST | `/auth/refresh` | — | Refresh access token |
| GET | `/auth/users` | Admin | List all users |
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
curl -X POST https://your-app.vercel.app/api/v1/language/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","source_lang":"en","target_lang":"ne"}'
```

---

### 🌾 KrishiData — `/api/v1/agri`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/agri/prices/kalimati` | — | Live Kalimati market prices |
| GET | `/agri/crops/calendar` | — | Planting/harvest calendar |
| GET | `/agri/weather/forecast` | — | Farm weather forecast |
| POST | `/agri/disease/analyze` | — | Crop disease diagnosis |
| POST | `/agri/fertilizer/recommend` | — | Fertilizer recommendations |

---

### 🚨 NepalAlert — `/api/v1/disaster`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/disaster/alerts/active` | — | Active disaster alerts |
| GET | `/disaster/rivers/levels` | — | River flood levels |
| GET | `/disaster/earthquakes/recent` | — | Recent earthquake data |
| GET | `/disaster/landslide/risk-zones` | — | Landslide risk zones |
| POST | `/disaster/subscribe` | — | Subscribe to SMS alerts |

---

### 🏔️ YatraTech — `/api/v1/tourism`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tourism/treks/routes` | — | All trekking routes |
| POST | `/tourism/permits/apply` | — | Apply for trekking permit |
| GET | `/tourism/permits/:permit_id/status` | — | Check permit status |
| POST | `/tourism/itinerary/generate` | — | AI itinerary generator |
| GET | `/tourism/teahouses/availability` | — | Teahouse availability |
| POST | `/tourism/altitude/risk` | — | Altitude sickness risk |

```bash
curl -X POST https://your-app.vercel.app/api/v1/tourism/permits/apply \
  -H "Content-Type: application/json" \
  -d '{"trek_id":"EBC","passport_number":"P123456","nationality":"Foreign"}'
```

---

### 💰 PaisaLink — `/api/v1/finance`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/finance/forex/rates` | — | Live NRB forex rates |
| POST | `/finance/remittance/calculate` | — | Remittance calculator |
| POST | `/finance/payment/initiate` | — | Initiate eSewa/Khalti payment |
| GET | `/finance/payment/:tracking_code/status` | — | Payment status |
| GET | `/finance/banks/branches` | — | Bank branch locator |
| POST | `/finance/budget/categorize` | — | Budget categorizer |
| GET | `/finance/microfinance/list` | — | Microfinance institutions |

---

### 📚 Shikshya — `/api/v1/education`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/education/tutor/ask` | — | AI tutor (any subject/grade) |
| GET | `/education/syllabus/:grade` | — | Syllabus by grade (1–12) |
| GET | `/education/past-papers` | — | Past exam papers |
| POST | `/education/grade/objective` | — | Grade objective answers |
| POST | `/education/grade/essay` | — | Grade essay answers |

---

### 🏥 SwasthyaTriage — `/api/v1/health`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/health/triage/analyze` | — | Symptom-based triage |
| GET | `/health/facilities/nearby` | — | Nearby health facilities |
| GET | `/health/first-aid/:condition` | — | First-aid guide |
| GET | `/health/diseases/outbreaks` | — | Disease outbreak monitor |
| POST | `/health/records/sync` | Admin | Sync health records |

```bash
curl -X POST https://your-app.vercel.app/api/v1/health/triage/analyze \
  -H "Content-Type: application/json" \
  -d '{"symptoms":["high_fever","joint_pain","rash"],"patient_age":28}'
```

---

### 🏛️ NagarikConnect — `/api/v1/gov`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/gov/holidays` | — | Public holidays |
| GET | `/gov/tax/vehicle-rates` | — | Vehicle tax rates |
| POST | `/gov/documents/verify` | — | Document verification |
| GET | `/gov/offices/ward` | — | Ward office locator |
| GET | `/gov/applications/:tracking_id/status` | — | Application status |
| POST | `/gov/applications/submit` | — | Submit application |

---

### 💼 RozgariMatch — `/api/v1/jobs`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/jobs/search` | — | Search jobs (category, location, type) |
| POST | `/jobs/resume/parse` | — | Extract skills from resume text |
| POST | `/jobs/match` | — | Match candidate to open jobs |
| GET | `/jobs/demand/:lt_number` | — | Foreign demand letter lookup |
| POST | `/jobs/post` | Admin | Post a job listing |

```bash
curl "https://your-app.vercel.app/api/v1/jobs/search?category=IT&location=Kathmandu"
```

---

### 🚌 YataYat — `/api/v1/transport`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/transport/routes/search` | — | City bus routes |
| GET | `/transport/routes/intercity` | — | Intercity routes |
| GET | `/transport/fare/calculate` | — | Fare calculator |
| GET | `/transport/buses/:bus_id/schedule` | — | Bus schedule |
| POST | `/transport/tickets/book` | — | Book a ticket |
| GET | `/transport/tickets/:trip_id/status` | — | Ticket status |
| GET | `/transport/buses/:bus_id/live` | — | Live bus tracking |

---

## Authentication

Admin endpoints require a Bearer token:

```bash
# 1. Get token
TOKEN=$(curl -s -X POST https://your-app.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nepalapi.dev","password":"NepalApi@2024!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")

# 2. Use it
curl -H "Authorization: Bearer $TOKEN" \
  https://your-app.vercel.app/api/v1/auth/users
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

### Vercel

1. Fork this repo
2. Go to [vercel.com](https://vercel.com) → New Project → import your fork
3. Add environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Any long random string |

4. Deploy — done.

### Local

```bash
git clone https://github.com/asbinthapa99/Freeapi.git
cd Freeapi
npm install
# Create .env (see .env.example)
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

---

## License

MIT — free for personal and commercial use.
