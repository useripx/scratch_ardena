import request from 'supertest';
import { createApp } from '../../src/app';
import { setGenerateGameUseCase } from '../../src/controllers/game.controller';
import { AIError, sanitizeErrorMessage } from '../../src/providers/gemini/gemini.error';
import { config } from '../../src/config/env';

describe('Security Hardening, Resilience & Integration QA (BE-06)', () => {
  const app = createApp();

  afterAll(() => {
    setGenerateGameUseCase(null);
  });

  describe('1. Payload Limit Enforcement (10 MB Boundary)', () => {
    it('harus menolak request dengan payload melebihi batas 10 MB dengan HTTP 413 PAYLOAD_TOO_LARGE', async () => {
      // Buat payload berukuran sedikit di atas 10 MB (10.5 MB)
      const oversizedData = 'x'.repeat(10.5 * 1024 * 1024);
      const oversizedPayload = JSON.stringify({
        prompt: oversizedData,
        template: 'catching-game',
      });

      const response = await request(app)
        .post('/api/v1/games/generate')
        .set('Content-Type', 'application/json')
        .send(oversizedPayload);

      expect(response.status).toBe(413);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'PAYLOAD_TOO_LARGE');
      expect(response.body.error.message).toContain('10 MB');
      expect(response.body.meta).toHaveProperty('requestId');
    });

    it('harus menerima request dengan payload dalam batas yang wajar (< 10 MB)', async () => {
      const mockUseCase: any = {
        execute: jest.fn().mockResolvedValue({
          game: { title: 'Test Game', genre: 'catching-game' },
          meta: { provider: 'mock', modelUsed: 'mock-model', durationMs: 10, requestId: 'req-ok' },
        }),
      };
      setGenerateGameUseCase(mockUseCase);

      const response = await request(app)
        .post('/api/v1/games/generate')
        .set('Content-Type', 'application/json')
        .send({
          prompt: 'Buat game menangkap apel sederhana',
          template: 'catching-game',
          language: 'id',
          schemaVersion: '1.0',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('2. Zero Secret Leakage Audit Across Vendors', () => {
    it('harus menyamarkan token Google, Groq, NVIDIA, OpenRouter, dan Bearer header', () => {
      const rawErrorWithTokens = [
        'Error from Google: AQ.AbCdEf1234567890GhIjKlMnOpQrStUv',
        'Error from Groq: gsk_1234567890abcdef1234567890abcdef',
        'Error from NVIDIA: nvapi-abcdef1234567890abcdef1234567890',
        'Error from OpenRouter: sk-or-v1-abcdef1234567890abcdef1234567890',
        'URL param leak: https://api.vendor.com/v1?key=AIzaSySecretApiKey1234567890',
        'Auth Header leak: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token1234567890',
      ].join(' | ');

      const sanitized = sanitizeErrorMessage(rawErrorWithTokens);

      expect(sanitized).not.toContain('AQ.AbCdEf1234567890GhIjKlMnOpQrStUv');
      expect(sanitized).toContain('[REDACTED_GOOGLE_KEY]');

      expect(sanitized).not.toContain('gsk_1234567890abcdef1234567890abcdef');
      expect(sanitized).toContain('[REDACTED_GROQ_KEY]');

      expect(sanitized).not.toContain('nvapi-abcdef1234567890abcdef1234567890');
      expect(sanitized).toContain('[REDACTED_NVIDIA_KEY]');

      expect(sanitized).not.toContain('sk-or-v1-abcdef1234567890abcdef1234567890');
      expect(sanitized).toContain('[REDACTED_OPENROUTER_KEY]');

      expect(sanitized).not.toContain('AIzaSySecretApiKey1234567890');
      expect(sanitized).toContain('key=[REDACTED]');

      expect(sanitized).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token1234567890');
      expect(sanitized).toContain('Bearer [REDACTED_TOKEN]');
    });

    it('harus menyamarkan seluruh kunci aktif environment jika muncul di pesan error', () => {
      const activeKeys = [
        config.geminiApiKey,
        config.groqApiKey,
        config.sambanovaApiKey,
        config.nvidiaApiKey,
        config.cohereApiKey,
        config.openrouterApiKey,
      ].filter((k) => k && k.length >= 8);

      for (const secretKey of activeKeys) {
        const errorString = `Fatal connection failure with secret key: ${secretKey}`;
        const sanitized = sanitizeErrorMessage(errorString);
        expect(sanitized).not.toContain(secretKey);
        expect(sanitized).toMatch(/\[REDACTED_/);
      }
    });

    it('tidak boleh membocorkan token rahasia ke respons HTTP klien saat usecase error', async () => {
      const sensitiveLeak = 'LeakToken_AQ.1234567890abcdef1234567890_Failed';
      const mockFailingUseCase: any = {
        execute: jest.fn().mockRejectedValue(
          new AIError({
            message: `Internal vendor crash: ${sensitiveLeak}`,
            code: 'AI_PROVIDER_ERROR',
            provider: 'gemini',
            retryable: true,
            statusCode: 502,
          })
        ),
      };
      setGenerateGameUseCase(mockFailingUseCase);

      const response = await request(app)
        .post('/api/v1/games/generate')
        .send({
          prompt: 'Buat game',
          template: 'catching-game',
          language: 'id',
          schemaVersion: '1.0',
        });

      expect(response.status).toBe(502);
      expect(response.body.error.message).not.toContain('AQ.1234567890abcdef1234567890');
      expect(response.body.error.message).toContain('[REDACTED_GOOGLE_KEY]');
    });
  });

  describe('3. Fault Tolerance & Resilience Testing', () => {
    it('harus mengembalikan HTTP 502 dan header Retry-After saat seluruh provider AI tumbang (All-Fail 502)', async () => {
      const mockOutageUseCase: any = {
        execute: jest.fn().mockRejectedValue(
          new AIError({
            message: 'Semua 6 cluster AI mengalami pemadaman total.',
            code: 'AI_PROVIDER_ERROR',
            provider: 'openrouter',
            retryable: true,
            statusCode: 502,
          })
        ),
      };
      setGenerateGameUseCase(mockOutageUseCase);

      const response = await request(app)
        .post('/api/v1/games/generate')
        .send({
          prompt: 'Buat game balapan labirin',
          template: 'maze-adventure',
          language: 'id',
          schemaVersion: '1.0',
        });

      expect(response.status).toBe(502);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error.retryable).toBe(true);
      expect(response.headers).toHaveProperty('retry-after', '15');
    });

    it('harus mengembalikan HTTP 504 saat cascading timeout akumulatif melampaui batas (> 45s)', async () => {
      const mockTimeoutUseCase: any = {
        execute: jest.fn().mockRejectedValue(
          new AIError({
            message: 'Pemanggilan AI melampaui batas waktu maksimal 45.000 ms.',
            code: 'AI_TIMEOUT',
            provider: 'gemini',
            retryable: true,
            statusCode: 504,
          })
        ),
      };
      setGenerateGameUseCase(mockTimeoutUseCase);

      const response = await request(app)
        .post('/api/v1/games/generate')
        .send({
          prompt: 'Buat game pesawat luar angkasa',
          template: 'space-shooter',
          language: 'id',
          schemaVersion: '1.0',
        });

      expect(response.status).toBe(504);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error.code).toBe('AI_TIMEOUT');
      expect(response.body.error.retryable).toBe(true);
    });
  });

  describe('4. CORS Whitelist Compliance (Scratch Editor Dev Origins)', () => {
    it('harus mengizinkan origin dev Scratch GUI (http://localhost:8601)', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .set('Origin', 'http://localhost:8601');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:8601');
    });

    it('harus mengizinkan origin dev Scratch GUI alternatif (http://localhost:3000)', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .set('Origin', 'http://localhost:3000');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    it('tidak boleh mengizinkan origin berbahaya di luar whitelist', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .set('Origin', 'http://malicious-site.example.com');

      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  describe('5. Input Injection & Anomaly Resilience', () => {
    it('harus menolak request dengan JSON format rusak (Malformed JSON) dengan HTTP 400', async () => {
      const response = await request(app)
        .post('/api/v1/games/generate')
        .set('Content-Type', 'application/json')
        .send('{"prompt": "unclosed json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('harus menolak request dengan parameter di luar skema Zod dengan HTTP 400', async () => {
      const response = await request(app)
        .post('/api/v1/games/generate')
        .send({
          prompt: '', // Kosong (invalid)
          template: 'invalid-genre-xyz',
          language: 'invalid-lang',
          schemaVersion: '999.0',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error.code).toBe('INVALID_REQUEST_BODY');
    });
  });
});
