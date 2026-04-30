process.env.NODE_ENV = 'test';
process.env.PERSISTENCE_DIR = '/tmp/nepal-api-ecosystem-integration-tests';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.ADMIN_EMAIL = 'admin@example.com';
process.env.ADMIN_PASSWORD = 'Password123!';
process.env.ALLOW_PUBLIC_REGISTRATION = 'true';

const fs = require('fs/promises');
const request = require('supertest');

const runtimeDir = process.env.PERSISTENCE_DIR;

let app;
let adminToken;
let refreshToken;
let createdUserId;

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

beforeAll(async () => {
  await fs.rm(runtimeDir, { recursive: true, force: true });
  jest.resetModules();
  app = require('../app');

  const loginResponse = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD
    });

  adminToken = loginResponse.body.data.access_token;
  refreshToken = loginResponse.body.data.refresh_token;
});

afterAll(async () => {
  await fs.rm(runtimeDir, { recursive: true, force: true });
});

describe('integration coverage', () => {
  it('covers platform and auth routes', async () => {
    const healthResponse = await request(app).get('/health');
    expect(healthResponse.statusCode).toBe(200);
    expect(healthResponse.headers['x-request-id']).toBeDefined();

    const readyResponse = await request(app).get('/ready');
    expect(readyResponse.statusCode).toBe(200);

    const docsHtmlResponse = await request(app).get('/docs');
    expect(docsHtmlResponse.statusCode).toBe(200);

    const docsJsonResponse = await request(app).get('/docs/openapi.json');
    expect(docsJsonResponse.statusCode).toBe(200);
    expect(docsJsonResponse.body.openapi).toBeDefined();

    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'viewer@example.com',
        password: 'Password123!',
        full_name: 'Viewer User',
        roles: ['viewer']
      });
    expect(registerResponse.statusCode).toBe(201);
    createdUserId = registerResponse.body.data.user_id;

    const refreshResponse = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refresh_token: refreshToken });
    expect(refreshResponse.statusCode).toBe(200);
    refreshToken = refreshResponse.body.data.refresh_token;

    const meResponse = await request(app)
      .get('/api/v1/auth/me')
      .set(authHeader(adminToken));
    expect(meResponse.statusCode).toBe(200);

    const usersResponse = await request(app)
      .get('/api/v1/auth/users')
      .set(authHeader(adminToken));
    expect(usersResponse.statusCode).toBe(200);
    expect(usersResponse.body.data.count).toBeGreaterThanOrEqual(2);

    const createUserResponse = await request(app)
      .post('/api/v1/auth/users')
      .set(authHeader(adminToken))
      .send({
        email: 'operator@example.com',
        password: 'Password123!',
        full_name: 'Ops User',
        roles: ['operator']
      });
    expect(createUserResponse.statusCode).toBe(201);

    const updateUserResponse = await request(app)
      .patch(`/api/v1/auth/users/${createdUserId}`)
      .set(authHeader(adminToken))
      .send({
        full_name: 'Viewer User Updated',
        status: 'ACTIVE'
      });
    expect(updateUserResponse.statusCode).toBe(200);

    const metricsResponse = await request(app)
      .get('/metrics')
      .set(authHeader(adminToken));
    expect(metricsResponse.statusCode).toBe(200);
    expect(metricsResponse.text).toContain('http_requests_total');

    const logoutResponse = await request(app)
      .post('/api/v1/auth/logout')
      .send({ refresh_token: refreshToken });
    expect(logoutResponse.statusCode).toBe(200);
  });

  it('covers language routes', async () => {
    expect((await request(app).post('/api/v1/language/translate').send({
      text: 'hello',
      source_lang: 'en',
      target_lang: 'ne'
    })).statusCode).toBe(200);

    expect((await request(app).post('/api/v1/language/transliterate').send({
      text: 'namaste',
      source_lang: 'ro_ne',
      target_lang: 'ne'
    })).statusCode).toBe(200);

    expect((await request(app).post('/api/v1/language/sentiment').send({
      text: 'यो राम्रो छ'
    })).statusCode).toBe(200);

    expect((await request(app).post('/api/v1/language/ner').send({
      text: 'Kathmandu and नेपाल सरकार'
    })).statusCode).toBe(200);

    expect((await request(app).get('/api/v1/language/detect').query({
      text: 'Hello world'
    })).statusCode).toBe(200);
  });

  it('covers agriculture and disaster routes', async () => {
    expect((await request(app).get('/api/v1/agri/prices/kalimati')).statusCode).toBe(200);
    expect((await request(app).post('/api/v1/agri/disease/analyze').send({
      crop: 'tomato',
      symptoms: ['black spots']
    })).statusCode).toBe(200);
    expect((await request(app).get('/api/v1/agri/weather/forecast').query({
      lat: 27.7,
      lon: 85.3
    })).statusCode).toBe(200);
    expect((await request(app).post('/api/v1/agri/fertilizer/recommend').send({
      crop: 'rice',
      soil_type: 'loamy'
    })).statusCode).toBe(200);
    expect((await request(app).get('/api/v1/agri/crops/calendar')).statusCode).toBe(200);

    expect((await request(app).get('/api/v1/disaster/alerts/active')).statusCode).toBe(200);
    expect((await request(app).get('/api/v1/disaster/rivers/levels')).statusCode).toBe(200);
    expect((await request(app).post('/api/v1/disaster/subscriptions/register').send({
      phone: '9800000000',
      district: 'Kathmandu',
      alert_types: ['FLOOD']
    })).statusCode).toBe(201);
    expect((await request(app).get('/api/v1/disaster/landslide-risk')).statusCode).toBe(200);
    expect((await request(app).get('/api/v1/disaster/earthquakes/recent')).statusCode).toBe(200);
  });

  it('covers education and tourism routes', async () => {
    expect((await request(app).post('/api/v1/education/tutor/ask').send({
      question: 'Tell me about Newton',
      grade_level: 'SEE'
    })).statusCode).toBe(200);
    expect((await request(app).get('/api/v1/education/syllabus/topics').query({ grade: 'SEE' })).statusCode).toBe(200);
    expect((await request(app).get('/api/v1/education/syllabus/SEE')).statusCode).toBe(200);
    expect((await request(app).get('/api/v1/education/past-papers/Science/2023')).statusCode).toBe(200);
    expect((await request(app).post('/api/v1/education/grade/objective').send({
      answers: ['A', 'B'],
      answer_key: ['A', 'C']
    })).statusCode).toBe(200);
    expect((await request(app).post('/api/v1/education/grade/essay').send({
      essay: 'This is a sufficiently long essay answer with some details about the topic and supporting explanation to exercise the grader.'
    })).statusCode).toBe(200);

    expect((await request(app).get('/api/v1/tourism/treks/routes')).statusCode).toBe(200);
    const permitResponse = await request(app).post('/api/v1/tourism/permits/apply').send({
      trek_id: 'EBC',
      passport_number: 'P123456',
      nationality: 'Foreign'
    });
    expect(permitResponse.statusCode).toBe(201);
    expect((await request(app).get(`/api/v1/tourism/permits/${permitResponse.body.data.permit_id}/status`)).statusCode).toBe(200);
    expect((await request(app).post('/api/v1/tourism/itinerary/generate').send({ trek_id: 'EBC' })).statusCode).toBe(200);
    expect((await request(app).get('/api/v1/tourism/teahouses/availability')).statusCode).toBe(200);
    expect((await request(app).post('/api/v1/tourism/health/altitude-risk').send({
      start_alt: 1400,
      end_alt: 3000
    })).statusCode).toBe(200);
  });

  it('covers finance, gov, and health routes', async () => {
    expect((await request(app).get('/api/v1/finance/forex/rates')).statusCode).toBe(200);
    expect((await request(app).get('/api/v1/finance/remittance/TRK123')).statusCode).toBe(200);
    expect((await request(app).post('/api/v1/finance/remittance/calculate').send({
      amount: 100,
      from_currency: 'USD',
      to_currency: 'NPR'
    })).statusCode).toBe(200);
    expect((await request(app).post('/api/v1/finance/payments/initiate').set(authHeader(adminToken)).send({
      amount: 500,
      currency: 'NPR',
      channel: 'CARD',
      reference: 'ORDER-1'
    })).statusCode).toBe(201);
    expect((await request(app).get('/api/v1/finance/banks/branches')).statusCode).toBe(200);
    const dhadingBranches = await request(app).get('/api/v1/finance/banks/branches').query({
      district: 'dhading '
    });
    expect(dhadingBranches.statusCode).toBe(200);
    expect(dhadingBranches.body.data.count).toBeGreaterThan(0);
    expect((await request(app).get('/api/v1/finance/inflation')).statusCode).toBe(200);
    expect((await request(app).post('/api/v1/finance/budget/categorize').send({
      entries: [{ description: 'grocery mart', amount: 1000 }]
    })).statusCode).toBe(200);

    expect((await request(app).get('/api/v1/gov/applications/status/PASS-12345')).statusCode).toBe(200);
    expect((await request(app).post('/api/v1/gov/documents/verify').set(authHeader(adminToken)).send({
      document_number: 'NP12345',
      document_type: 'passport',
      holder_name: 'Test User'
    })).statusCode).toBe(200);
    expect((await request(app).get('/api/v1/gov/holidays/2025')).statusCode).toBe(200);
    expect((await request(app).get('/api/v1/gov/holidays').query({ month: '01' })).statusCode).toBe(200);
    expect((await request(app).get('/api/v1/gov/offices/ward')).statusCode).toBe(200);
    const thakreWard = await request(app).get('/api/v1/gov/offices/ward').query({
      ward: '6',
      municipality: 'thakre municipality '
    });
    expect(thakreWard.statusCode).toBe(200);
    expect(thakreWard.body.data.count).toBe(1);
    expect(thakreWard.body.data.offices[0].municipality).toBe('Thakre Rural Municipality');
    expect((await request(app).get('/api/v1/gov/tax/vehicle-rates')).statusCode).toBe(200);

    expect((await request(app).post('/api/v1/health/triage/analyze').send({
      symptoms: ['fever', 'cough'],
      patient_age: 30
    })).statusCode).toBe(200);
    expect((await request(app).get('/api/v1/health/facilities/nearby')).statusCode).toBe(200);
    expect((await request(app).get('/api/v1/health/first-aid/burn')).statusCode).toBe(200);
    expect((await request(app).post('/api/v1/health/sync/offline-records').set(authHeader(adminToken)).send({
      records: [{ patient_id: 'PT1' }]
    })).statusCode).toBe(200);
    expect((await request(app).get('/api/v1/health/diseases/outbreaks')).statusCode).toBe(200);
  });

  it('covers jobs and transport routes', async () => {
    expect((await request(app).post('/api/v1/jobs/resume/parse').send({
      resume_text: 'Experienced nodejs react developer'
    })).statusCode).toBe(200);
    expect((await request(app).post('/api/v1/jobs/match').send({
      skills: ['nodejs', 'react'],
      preferred_type: 'FULL_TIME'
    })).statusCode).toBe(200);
    expect((await request(app).get('/api/v1/jobs/search')).statusCode).toBe(200);
    expect((await request(app).get('/api/v1/jobs/foreign-demands/verify/LT123')).statusCode).toBe(200);
    expect((await request(app).get('/api/v1/jobs/categories')).statusCode).toBe(200);
    expect((await request(app).post('/api/v1/jobs/post').set(authHeader(adminToken)).send({
      title: 'QA Engineer',
      company: 'Nepal Tech',
      location: 'Kathmandu',
      category: 'IT',
      type: 'FULL_TIME',
      skills: ['testing']
    })).statusCode).toBe(201);

    expect((await request(app).get('/api/v1/transport/routes/search')).statusCode).toBe(200);
    expect((await request(app).get('/api/v1/transport/fares/calculate').query({
      distance_km: 10,
      vehicle_type: 'BUS'
    })).statusCode).toBe(200);
    expect((await request(app).post('/api/v1/transport/fares/calculate').send({
      distance_km: 10,
      vehicle_type: 'BUS'
    })).statusCode).toBe(200);
    expect((await request(app).get('/api/v1/transport/routes/intercity')).statusCode).toBe(200);
    expect((await request(app).get('/api/v1/transport/buses/R3/location')).statusCode).toBe(200);
    expect((await request(app).post('/api/v1/transport/tickets/book').send({
      route_id: 'IC1',
      passenger_name: 'Test Rider',
      date: '2026-06-01'
    })).statusCode).toBe(201);
    expect((await request(app).get('/api/v1/transport/seats/IC1')).statusCode).toBe(200);
  });

  it('deletes a managed user', async () => {
    const response = await request(app)
      .delete(`/api/v1/auth/users/${createdUserId}`)
      .set(authHeader(adminToken));

    expect(response.statusCode).toBe(200);
  });
});
