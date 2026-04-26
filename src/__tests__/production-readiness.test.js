const request = require('supertest');

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  jest.resetModules();
});

describe('production readiness guards', () => {
  it('allows explicit wildcard CORS origins', async () => {
    process.env.NODE_ENV = 'test';
    process.env.CORS_ORIGIN = '*';
    process.env.PERSISTENCE_DIR = '/tmp/nepal-api-ecosystem-readiness-tests';
    process.env.JWT_SECRET = 'test-jwt-secret';
    jest.resetModules();

    const app = require('../app');
    const response = await request(app)
      .get('/health')
      .set('Origin', 'https://storefront.example.com');

    expect(response.statusCode).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe('https://storefront.example.com');
  });

  it('rejects fallback payments in production when no provider is configured', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.STRIPE_SECRET_KEY;
    jest.resetModules();

    const { createPayment } = require('../services/payments.service');

    await expect(createPayment({
      channel: 'CARD',
      amount: 100,
      currency: 'NPR'
    })).rejects.toMatchObject({
      code: 'PAYMENT_PROVIDER_UNAVAILABLE',
      status: 503
    });
  });

  it('rejects file fallback persistence when MongoDB is required in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.MONGO_REQUIRED = 'true';
    jest.resetModules();

    const { readCollection } = require('../services/persistence.service');

    await expect(readCollection('users')).rejects.toMatchObject({
      code: 'PERSISTENCE_UNAVAILABLE',
      status: 503
    });
  });
});
