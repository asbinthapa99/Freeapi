# Nepal API Ecosystem

Nepal-focused Express API platform with 10 domain modules, shared validation, JWT admin auth, structured logging, and MongoDB native-driver persistence with safe JSON fallback for local/test use.

## Current State

This repository is now:

- runnable
- lint-clean
- test-covered with controller smoke tests
- protected on admin-style write endpoints
- validated on major request bodies and params
- MongoDB-ready for permits, tickets, jobs, subscriptions, and payments
- auto-seeding Mongo on first successful connection
- container-ready with Docker

This makes it a strong starter backend and deployable demo API.

## Modules

- `auth`
- `language`
- `agri`
- `disaster`
- `tourism`
- `finance`
- `education`
- `health`
- `gov`
- `jobs`
- `transport`

## Stack

- Node.js 18+
- Express.js
- Helmet
- CORS
- Compression
- Morgan
- Winston
- MongoDB native driver
- express-rate-limit
- express-validator
- JWT
- Jest

## Project Structure

```text
src/
  __tests__/
  controllers/
  data/
  middleware/
  models/
  routes/
  services/
  validators/
  app.js
  index.js

.env.example
Dockerfile
README.md
PROJECT_FILE.md
```

## Setup

Install dependencies:

```bash
npm install
```

Create env file:

```bash
cp .env.example .env
```

Core env:

```env
PORT=3000
NODE_ENV=development
TRUST_PROXY=false
CORS_ORIGIN=http://localhost:3000
API_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX=100
OPENWEATHER_API_KEY=
LOG_LEVEL=info
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=12h
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
MONGO_URI=mongodb://127.0.0.1:27017/nepal-api-ecosystem
MONGO_DB_NAME=nepal-api-ecosystem
MONGO_REQUIRED=false
MONGO_SERVER_SELECTION_TIMEOUT_MS=5000
PERSISTENCE_DIR=.runtime-store
```

Notes:

- `OPENWEATHER_API_KEY` is optional.
- if `MONGO_URI` is set, runtime records are stored in MongoDB.
- if MongoDB is not configured or unavailable in non-production mode, the app falls back to JSON files in `PERSISTENCE_DIR`.
- set `MONGO_REQUIRED=true` to fail startup if MongoDB cannot be reached.
- if `JWT_SECRET` and admin credentials are missing, public endpoints still work but admin login and protected routes will not.

## MongoDB

Local Mongo with Docker:

```bash
docker run -d --name nepal-mongo -p 27017:27017 mongo:7
```

Local Mongo env:

```env
MONGO_URI=mongodb://127.0.0.1:27017/nepal-api-ecosystem
MONGO_DB_NAME=nepal-api-ecosystem
```

MongoDB Atlas example:

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
MONGO_DB_NAME=nepal-api-ecosystem
MONGO_REQUIRED=true
```

Mongo-backed collections used by this app:

- `permits`
- `tickets`
- `jobs`
- `subscriptions`
- `payments`
- `jobs_catalog`
- `job_categories`
- `tourism_treks`
- `tourism_teahouses`
- `transport_routes_catalog`
- `transport_intercity_routes`
- `seed_metadata`

On first successful Mongo startup, the app auto-seeds catalog collections so Atlas SQL Interface has real databases and collections to query.

## Run

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Health check:

```bash
curl http://localhost:3000/health
```

## Docker

Build:

```bash
docker build -t nepal-api-ecosystem .
```

Run:

```bash
docker run --env-file .env -p 3000:3000 nepal-api-ecosystem
```

## Quality Checks

Lint:

```bash
npm run lint
```

Tests:

```bash
npm test -- --runInBand
```

## Base URL

```text
http://localhost:3000/api/v1
```

## Auth

Admin login endpoint:

- `POST /api/v1/auth/login`

Request:

```json
{
  "email": "admin@example.com",
  "password": "ChangeMe123!"
}
```

Response returns a Bearer token.

Use it like this:

```bash
Authorization: Bearer <token>
```

## Protected Endpoints

These require admin auth:

- `POST /api/v1/finance/payments/initiate`
- `POST /api/v1/gov/documents/verify`
- `POST /api/v1/health/sync/offline-records`
- `POST /api/v1/jobs/post`

## Persistence

Primary persistence path:

- permits
- tickets
- jobs
- subscriptions
- payments

When MongoDB is configured, these records are stored in MongoDB through the native `MongoClient` driver.

The app also auto-seeds read/catalog collections on first startup from the static data files under `src/data/*`.

Fallback path:

- JSON files under `.runtime-store/` by default
- used for local development and tests when Mongo is not configured

## API Modules

### Auth
Base path: `/api/v1/auth`

- `POST /login`

### Language
Base path: `/api/v1/language`

- `POST /translate`
- `POST /transliterate`
- `POST /sentiment`
- `POST /ner`
- `GET /detect`

### Agriculture
Base path: `/api/v1/agri`

- `GET /prices/kalimati`
- `POST /disease/analyze`
- `GET /weather/forecast`
- `POST /fertilizer/recommend`
- `GET /crops/calendar`

### Disaster
Base path: `/api/v1/disaster`

- `GET /alerts/active`
- `GET /rivers/levels`
- `POST /subscriptions/register`
- `GET /landslide-risk`
- `GET /earthquakes/recent`

### Tourism
Base path: `/api/v1/tourism`

- `GET /treks/routes`
- `POST /permits/apply`
- `GET /permits/:permit_id/status`
- `POST /itinerary/generate`
- `GET /teahouses/availability`
- `POST /health/altitude-risk`

### Finance
Base path: `/api/v1/finance`

- `GET /forex/rates`
- `POST /remittance/calculate`
- `GET /remittance/:tracking_code`
- `POST /payments/initiate`
- `GET /banks/branches`
- `GET /inflation`
- `POST /budget/categorize`

### Education
Base path: `/api/v1/education`

- `POST /tutor/ask`
- `GET /syllabus/topics`
- `GET /syllabus/:grade`
- `GET /past-papers`
- `GET /past-papers/:subject/:year`
- `POST /grade/objective`
- `POST /grade/essay`

### Health
Base path: `/api/v1/health`

- `POST /triage/analyze`
- `GET /facilities/nearby`
- `GET /first-aid/:condition`
- `POST /sync/offline-records`
- `GET /diseases/outbreaks`

### Government
Base path: `/api/v1/gov`

- `GET /applications/status/:tracking_id`
- `POST /documents/verify`
- `GET /holidays`
- `GET /holidays/:year`
- `GET /offices/ward`
- `GET /tax/vehicle-rates`

### Jobs
Base path: `/api/v1/jobs`

- `GET /categories`
- `GET /search`
- `POST /resume/parse`
- `POST /match`
- `GET /foreign-demands/verify/:lt_number`
- `POST /post`

### Transport
Base path: `/api/v1/transport`

- `GET /routes/search`
- `GET /routes/intercity`
- `GET /fares/calculate`
- `POST /fares/calculate`
- `GET /buses/:bus_id/location`
- `POST /tickets/book`
- `GET /seats/:trip_id`

## Sample Requests

Admin login:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"ChangeMe123!"}'
```

Apply for a permit:

```bash
curl -X POST http://localhost:3000/api/v1/tourism/permits/apply \
  -H "Content-Type: application/json" \
  -d '{"trek_id":"EBC","passport_number":"P123456","nationality":"Foreign"}'
```

Create a protected job post:

```bash
curl -X POST http://localhost:3000/api/v1/jobs/post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Backend Engineer","company":"Kathmandu Tech","location":"Kathmandu","category":"IT","type":"FULL_TIME","skills":["nodejs","postgres"]}'
```

Book a transport ticket:

```bash
curl -X POST http://localhost:3000/api/v1/transport/tickets/book \
  -H "Content-Type: application/json" \
  -d '{"route_id":"IC1","passenger_name":"Ram Bahadur","date":"2026-05-01"}'
```

## Production Improvements Already Added

- route/controller consistency fixes
- MongoClient-based persistence layer with file fallback
- automatic Mongo seed on first successful connection
- UUID-based IDs instead of timestamp-only IDs
- request validation middleware
- JWT admin auth
- structured error logging with Winston
- env template
- Dockerfile
- better app configuration for CORS, proxy, and rate limiting

## Remaining Work For Full Enterprise Production

- move remaining static datasets from `src/data/*` into MongoDB
- add refresh tokens and full user management
- add RBAC beyond a single admin role
- add integration tests for all routes
- add API docs with OpenAPI/Swagger
- add CI/CD pipeline
- add metrics, tracing, and alerting
- replace simulated payments/government verification with live provider integrations

## Verification Status

- app boot: passing
- lint: passing
- tests: passing

## License

MIT
