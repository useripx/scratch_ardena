import request from 'supertest';
import { createApp } from '../../src/app';
import { setGenerateGameUseCase } from '../../src/controllers/game.controller';
import { OutputValidationError } from '../../src/usecases/generate-game.usecase';
import validCatching from '../fixtures/game-valid-catching.json';

describe('HTTP & Contract Test: /api/v1/games/generate & /api/v1/meta/capabilities', () => {
  const app = createApp();

  beforeEach(() => {
    const mockUseCase: any = {
      execute: jest.fn().mockResolvedValue({
        game: validCatching,
        meta: {
          provider: 'mock_provider',
          modelUsed: 'mock_model',
          durationMs: 15,
          requestId: 'req-test',
        },
      }),
    };
    setGenerateGameUseCase(mockUseCase);
  });

  afterAll(() => {
    setGenerateGameUseCase(null);
  });

  describe('GET /api/v1/meta/capabilities', () => {
    it('harus mengembalikan HTTP 200 dan daftar template resmi', async () => {
      const response = await request(app).get('/api/v1/meta/capabilities');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('supportedSchemaVersions');
      expect(response.body.data.supportedSchemaVersions).toContain('1.0');
      expect(response.body.data).toHaveProperty('templates');
      expect(response.body.data.templates.length).toBeGreaterThanOrEqual(3);
      expect(response.body.meta).toHaveProperty('requestId');
    });
  });

  describe('POST /api/v1/games/generate', () => {
    it('harus menerima request valid dan mengembalikan HTTP 200 terstruktur', async () => {
      const validBody = {
        prompt: 'Buat game menangkap koin yang jatuh dari langit secara acak.',
        template: 'catching-game',
        language: 'id',
        schemaVersion: '1.0',
      };

      const response = await request(app)
        .post('/api/v1/games/generate')
        .set('Content-Type', 'application/json')
        .send(validBody);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('schemaVersion', '1.0');
      expect(response.body.data.game).toHaveProperty('genre', 'catching-game');
      expect(response.body.data.delta).toHaveProperty('overwrittenBlocksCount', 0);
      expect(response.body.data.objects.length).toBeGreaterThan(0);
      expect(response.body.data.rules.length).toBeGreaterThan(0);
      expect(response.headers).toHaveProperty('x-request-id');
    });

    it('harus mengembalikan HTTP 422 jika use case mendeteksi kegagalan parsing / skema', async () => {
      const failingUseCase: any = {
        execute: jest.fn().mockRejectedValue(
          new OutputValidationError({
            message: 'Respons dari AI tidak memuat objek JSON yang valid.',
            code: 'AI_OUTPUT_PARSE_FAILED',
            statusCode: 422,
          })
        ),
      };
      setGenerateGameUseCase(failingUseCase);

      const validBody = {
        prompt: 'Buat game menangkap apel.',
        template: 'catching-game',
        language: 'id',
        schemaVersion: '1.0',
      };

      const response = await request(app)
        .post('/api/v1/games/generate')
        .set('Content-Type', 'application/json')
        .send(validBody);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AI_OUTPUT_PARSE_FAILED');
    });

    it('harus menolak request dengan status HTTP 400 jika prompt tidak valid', async () => {
      const invalidBody = {
        prompt: 'x', // < 5 karakter
        template: 'catching-game',
        schemaVersion: '1.0',
      };

      const response = await request(app)
        .post('/api/v1/games/generate')
        .set('Content-Type', 'application/json')
        .send(invalidBody);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'INVALID_REQUEST_BODY');
      expect(response.body.error).toHaveProperty('details');
      expect(response.headers).toHaveProperty('x-request-id');
    });

    it('harus menolak request jika template tidak dikenali', async () => {
      const invalidTemplate = {
        prompt: 'Game dengan rintangan meteor jatuh dari langit.',
        template: 'template-tidak-terdaftar',
        schemaVersion: '1.0',
      };

      const response = await request(app)
        .post('/api/v1/games/generate')
        .set('Content-Type', 'application/json')
        .send(invalidTemplate);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_REQUEST_BODY');
    });

    it('harus menolak request dengan HTTP 415 jika Content-Type bukan application/json', async () => {
      const response = await request(app)
        .post('/api/v1/games/generate')
        .set('Content-Type', 'text/plain')
        .send('bukan format json');

      expect(response.status).toBe(415);
      expect(response.body.error.code).toBe('UNSUPPORTED_MEDIA_TYPE');
    });
  });
});
