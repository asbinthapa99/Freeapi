process.env.PERSISTENCE_DIR = '/tmp/nepal-api-ecosystem-tests';

const tourismController = require('../controllers/tourism.controller');
const financeController = require('../controllers/finance.controller');
const jobsController = require('../controllers/jobs.controller');

const createResponse = () => {
  const response = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };

  return response;
};

describe('controller smoke tests', () => {
  it('returns trekking routes', async () => {
    const req = { query: {} };
    const res = createResponse();
    const next = jest.fn();

    await tourismController.getRoutes(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data.treks)).toBe(true);
  });

  it('returns forex rates', async () => {
    const req = { query: {} };
    const res = createResponse();
    const next = jest.fn();

    await financeController.getForexRates(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
  });

  it('creates a permit application', async () => {
    const req = {
      body: {
        trek_id: 'EBC',
        passport_number: 'P1234567',
        nationality: 'Foreign'
      }
    };
    const res = createResponse();
    const next = jest.fn();

    await tourismController.applyPermit(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    expect(res.body.data.permit_id).toContain('PRMT-');
  });

  it('persists posted jobs into the searchable jobs pool', async () => {
    const postReq = {
      body: {
        title: 'Backend Engineer',
        company: 'Kathmandu Tech',
        location: 'Kathmandu',
        category: 'IT',
        type: 'FULL_TIME',
        skills: ['nodejs', 'postgres']
      }
    };
    const postRes = createResponse();
    const postNext = jest.fn();

    await jobsController.postJob(postReq, postRes, postNext);

    expect(postNext).not.toHaveBeenCalled();
    expect(postRes.statusCode).toBe(201);

    const searchReq = { query: { location: 'Kathmandu' } };
    const searchRes = createResponse();
    const searchNext = jest.fn();

    await jobsController.searchJobs(searchReq, searchRes, searchNext);

    expect(searchNext).not.toHaveBeenCalled();
    expect(searchRes.body.data.jobs.some((job) => job.job_id === postRes.body.data.job_id)).toBe(true);
  });
});
