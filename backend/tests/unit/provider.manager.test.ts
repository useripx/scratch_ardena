import { AIError } from '../../src/providers/gemini/gemini.error';
import {
  AIProvider,
  GenerateGameInput,
  ProviderRawResponse,
} from '../../src/providers/provider.interface';
import { ProviderManager } from '../../src/providers/provider.manager';

describe('ProviderManager (Hexa-Cluster Sequential Failover Tests)', () => {
  const dummyInput: GenerateGameInput = {
    prompt: 'Buat game pesawat luar angkasa',
    template: 'space-shooter',
    language: 'id',
    schemaVersion: '1.0',
    requestId: 'req-manager-test',
  };

  const sampleJson = JSON.stringify({ title: 'Space Shooter MVP' });

  function createMockProvider(
    name: any,
    behavior: 'success' | 'fail_429' | 'fail_timeout' | 'fail_500'
  ): AIProvider {
    return {
      name,
      generateGame: jest.fn().mockImplementation(async (): Promise<ProviderRawResponse> => {
        if (behavior === 'success') {
          return {
            rawContent: sampleJson,
            provider: name,
            modelUsed: `${name}-mock-model`,
            durationMs: 50,
          };
        }
        if (behavior === 'fail_429') {
          throw new AIError({
            message: `${name} 429 Quota Exceeded`,
            code: 'AI_RATE_LIMIT_EXCEEDED',
            provider: name,
            retryable: true,
            statusCode: 429,
          });
        }
        if (behavior === 'fail_timeout') {
          throw new AIError({
            message: `${name} timeout`,
            code: 'AI_TIMEOUT',
            provider: name,
            retryable: true,
            statusCode: 504,
          });
        }
        throw new AIError({
          message: `${name} 500 Server Error`,
          code: 'AI_PROVIDER_ERROR',
          provider: name,
          retryable: true,
          statusCode: 502,
        });
      }),
    };
  }

  it('harus mengembalikan hasil dari Cluster 1 (Gemini) jika berhasil, tanpa memanggil provider lain', async () => {
    const gemini = createMockProvider('gemini', 'success');
    const groq = createMockProvider('groq', 'success');

    const manager = new ProviderManager({
      providers: [gemini, groq],
    });

    const result = await manager.generateGame(dummyInput);
    expect(result.provider).toBe('gemini');
    expect(gemini.generateGame).toHaveBeenCalledTimes(1);
    expect(groq.generateGame).not.toHaveBeenCalled();
  });

  it('harus failover ke Cluster 2 (Groq) jika Gemini mengalami kuota habis (429)', async () => {
    const gemini = createMockProvider('gemini', 'fail_429');
    const groq = createMockProvider('groq', 'success');

    const manager = new ProviderManager({
      providers: [gemini, groq],
    });

    const result = await manager.generateGame(dummyInput);
    expect(result.provider).toBe('groq');
    expect(gemini.generateGame).toHaveBeenCalledTimes(1);
    expect(groq.generateGame).toHaveBeenCalledTimes(1);
  });

  it('harus melakukan deep failover melintasi seluruh cluster hingga OpenRouter', async () => {
    const gemini = createMockProvider('gemini', 'fail_429');
    const groq = createMockProvider('groq', 'fail_429');
    const sambanova = createMockProvider('sambanova', 'fail_429');
    const nvidia = createMockProvider('nvidia', 'fail_500');
    const cohere = createMockProvider('cohere', 'fail_timeout');
    const openrouter = createMockProvider('openrouter', 'success');

    const manager = new ProviderManager({
      providers: [gemini, groq, sambanova, nvidia, cohere, openrouter],
    });

    const result = await manager.generateGame(dummyInput);
    expect(result.provider).toBe('openrouter');
    expect(openrouter.generateGame).toHaveBeenCalledTimes(1);
  });

  it('harus melempar AI_PROVIDER_ERROR (HTTP 502) jika seluruh 6 cluster gagal', async () => {
    const gemini = createMockProvider('gemini', 'fail_429');
    const groq = createMockProvider('groq', 'fail_429');
    const sambanova = createMockProvider('sambanova', 'fail_429');

    const manager = new ProviderManager({
      providers: [gemini, groq, sambanova],
    });

    try {
      await manager.generateGame(dummyInput);
      fail('Harusnya melempar error');
    } catch (err: unknown) {
      const aiErr = err as AIError;
      expect(aiErr.statusCode).toBe(502);
      expect(aiErr.code).toBe('AI_PROVIDER_ERROR');
    }
  });

  it('harus menghentikan eksekusi jika totalTimeoutMs telah terlampaui', async () => {
    const gemini = createMockProvider('gemini', 'fail_429');
    const groq = createMockProvider('groq', 'success');

    const manager = new ProviderManager({
      providers: [gemini, groq],
      // Tetapkan total timeout 0ms sehingga langsung habis
      totalTimeoutMs: 0,
    });

    try {
      await manager.generateGame(dummyInput);
      fail('Harusnya melempar AI_TIMEOUT');
    } catch (err: unknown) {
      const aiErr = err as AIError;
      expect(aiErr.code).toBe('AI_TIMEOUT');
      expect(aiErr.statusCode).toBe(504);
    }
  });
});
