import request from 'supertest';
import app from '../src/app.js';
import { connectDatabase } from '../src/config/db.js';

describe('Phase 01: Backend Foundation — Health Endpoints', () => {
  beforeAll(async () => {
    await connectDatabase();
  }, 25000);
  it('GET /api/v1/health returns 200 and healthy status', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('status', 'healthy');
    expect(res.body.data).toHaveProperty('service', 'library-hub-api');
    expect(res.body.data).toHaveProperty('uptime');
  });

  it('GET /api/v1/public/announcements returns public settings with popup and topBanner', async () => {
    const res = await request(app).get('/api/v1/public/announcements');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('popup');
    expect(res.body.data).toHaveProperty('topBanner');
    expect(typeof res.body.data.popup.enabled).toBe('boolean');
    expect(typeof res.body.data.topBanner.enabled).toBe('boolean');
  });

  it('GET /api/v1/non-existent returns 404 with standard error format', async () => {
    const res = await request(app).get('/api/v1/non-existent-route');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toHaveProperty('code', 'NOT_FOUND');
    expect(res.body.error.message).toContain('Endpoint not found');
  });
});

