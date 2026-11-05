import { ApiService } from '../src/services/api.service';
import { ApiClientError, GenerateGameRequest } from '../src/types/game.types';

describe('Frontend API Client Service (FE-01)', () => {
  const mockFetch = jest.fn();
  let service: ApiService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ApiService({
      baseUrl: 'http://localhost:3001/api/v1',
      timeoutMs: 2000,
      fetchFn: mockFetch as any,
    });
  });

  describe('1. checkHealth()', () => {
    it('harus mengembalikan status kesehatan backend saat respons HTTP 200', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            status: 'ok',
            service: 'ardena-playground-backend',
            version: '1.0.0',
            uptime: 100,
          },
        }),
      });

      const data = await service.checkHealth();
      expect(data.status).toBe('ok');
      expect(data.service).toBe('ardena-playground-backend');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/health',
        expect.objectContaining({ method: 'GET' })
      );
    });
  });

  describe('2. getCapabilities()', () => {
    it('harus mengembalikan daftar template resmi dan versi skema', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            supportedSchemaVersions: ['1.0'],
            templates: [
              {
                key: 'catching-game',
                name: 'Catching Game',
                genre: 'Arcade',
                description: 'Game tangkap objek',
                allowedRoles: ['player', 'collectible'],
                allowedControls: ['arrow_left', 'arrow_right'],
              },
            ],
          },
        }),
      });

      const capabilities = await service.getCapabilities();
      expect(capabilities.supportedSchemaVersions).toContain('1.0');
      expect(capabilities.templates.length).toBe(1);
      expect(capabilities.templates[0].key).toBe('catching-game');
    });
  });

  describe('3. generateGame() & Diff Counters', () => {
    it('harus mengirim payload generate dan menghitung diff counters dengan tepat', async () => {
      const mockGameSpec = {
        title: 'Catch the Apples',
        genre: 'catching-game',
        description: 'Tangkap apel',
        rules: { winCondition: 'Skor 10', loseCondition: 'Skor 0' },
        sprites: [
          {
            name: 'Bowl',
            role: 'player',
            costume: 'bowl',
            initialPosition: { x: 0, y: -100 },
            scripts: [{ trigger: 'when_flag_clicked', action: 'move' }],
          },
          {
            name: 'Apple',
            role: 'collectible',
            costume: 'apple',
            initialPosition: { x: 0, y: 100 },
            scripts: [
              { trigger: 'when_flag_clicked', action: 'fall' },
              { trigger: 'when_touching_player', action: 'score' },
            ],
          },
        ],
        variables: [{ name: 'Score', initialValue: 0 }],
        soundEffects: ['pop.wav'],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            schemaVersion: '1.0',
            game: mockGameSpec,
          },
          meta: {
            provider: 'gemini',
            modelUsed: 'gemini-2.5-flash',
            durationMs: 400,
            requestId: 'req-123',
          },
        }),
      });

      const request: GenerateGameRequest = {
        prompt: 'Buat game menangkap apel jatuh',
        template: 'catching-game',
        language: 'id',
        schemaVersion: '1.0',
      };

      const result = await service.generateGame(request);

      expect(result.schemaVersion).toBe('1.0');
      expect(result.game.title).toBe('Catch the Apples');
      // Verifikasi Diff Counters
      expect(result.diffCounters.spritesCount).toBe(2);
      expect(result.diffCounters.variablesCount).toBe(1);
      expect(result.diffCounters.sfxCount).toBe(1);
      expect(result.diffCounters.blocksCount).toBe(3); // 1 + 2 scripts
      expect(result.diffCounters.overwrittenBlocksCount).toBe(0); // Zero Overwrite
    });
  });

  describe('4. Penanganan Error HTTP & Resiliensi', () => {
    it('harus melempar ApiClientError dengan PAYLOAD_TOO_LARGE saat menerima HTTP 413', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 413,
        json: async () => ({
          success: false,
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: 'Ukuran payload melebihi batas 10 MB.',
          },
        }),
      });

      await expect(
        service.generateGame({
          prompt: 'x',
          template: 'catching-game',
          schemaVersion: '1.0',
        })
      ).rejects.toMatchObject({
        code: 'PAYLOAD_TOO_LARGE',
        statusCode: 413,
      });
    });

    it('harus mem-parsing Retry-After header saat menerima HTTP 502 All-Fail', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        headers: {
          get: (headerName: string) =>
            headerName.toLowerCase() === 'retry-after' ? '15' : null,
        },
        json: async () => ({
          success: false,
          error: {
            code: 'AI_PROVIDER_UNAVAILABLE',
            message: 'Seluruh cluster AI sedang sibuk.',
            retryable: true,
          },
        }),
      });

      try {
        await service.generateGame({
          prompt: 'Buat game maze',
          template: 'maze-adventure',
          schemaVersion: '1.0',
        });
        fail('Seharusnya melempar error');
      } catch (err: any) {
        expect(err).toBeInstanceOf(ApiClientError);
        expect(err.statusCode).toBe(502);
        expect(err.code).toBe('AI_PROVIDER_UNAVAILABLE');
        expect(err.retryAfterSeconds).toBe(15);
        expect(err.retryable).toBe(true);
      }
    });

    it('harus melempar NETWORK_ERROR saat koneksi ke backend terputus', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

      await expect(
        service.checkHealth()
      ).rejects.toMatchObject({
        code: 'NETWORK_ERROR',
        statusCode: 0,
        retryable: true,
      });
    });
  });
});
