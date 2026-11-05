import request from 'supertest';
import { createApp } from '../../src/app';

describe('GET /api/v1/health — Pemeriksaan Kesiapan Server', () => {
  const app = createApp();

  it('harus mengembalikan HTTP 200 dengan payload status healthy', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('version', '1.0.0');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptimeSeconds');
    expect(typeof response.body.uptimeSeconds).toBe('number');
  });

  it('harus menyertakan header X-Request-ID pada respons', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.headers).toHaveProperty('x-request-id');
    expect(typeof response.headers['x-request-id']).toBe('string');
    expect(response.headers['x-request-id'].length).toBeGreaterThan(0);
  });

  it('harus meneruskan X-Request-ID jika dikirim oleh client', async () => {
    const customId = 'client-custom-req-12345';
    const response = await request(app)
      .get('/api/v1/health')
      .set('X-Request-ID', customId);

    expect(response.headers['x-request-id']).toBe(customId);
  });

  it('harus mengembalikan HTTP 404 berformat JSON jika mengakses rute yang tidak terdaftar', async () => {
    const response = await request(app).get('/api/v1/rute-acak-tidak-ada');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    expect(response.body).toHaveProperty('meta');
    expect(response.body.meta).toHaveProperty('requestId');
  });
});

