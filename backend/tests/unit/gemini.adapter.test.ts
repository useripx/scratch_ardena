import { GeminiAdapter } from '../../src/providers/gemini/gemini.adapter';
import { AIError } from '../../src/providers/gemini/gemini.error';
import { GenerateGameInput } from '../../src/providers/provider.interface';
import mockFixture from '../fixtures/gemini-mock.json';

describe('GeminiAdapter (Unit & Cascading Mock Tests)', () => {
  const dummyInput: GenerateGameInput = {
    prompt: 'Buat game kucing tangkap apel sederhana',
    template: 'catching-game',
    language: 'id',
    schemaVersion: '1.0',
    requestId: 'req-test-123',
  };

  const sampleJsonOutput = JSON.stringify(mockFixture.validCatchingGame);

  it('harus melempar AI_CONFIG_ERROR jika apiKey kosong', () => {
    expect(() => {
      new GeminiAdapter({ apiKey: '' });
    }).toThrow(AIError);

    try {
      new GeminiAdapter({ apiKey: '' });
    } catch (err: unknown) {
      const aiErr = err as AIError;
      expect(aiErr.code).toBe('AI_CONFIG_ERROR');
      expect(aiErr.retryable).toBe(false);
    }
  });

  it('harus berhasil mengembalikan respons valid dari model pertama (gemini-4-argon)', async () => {
    const mockGenerateContent = jest.fn().mockResolvedValue({
      text: sampleJsonOutput,
      usageMetadata: {
        promptTokenCount: 120,
        candidatesTokenCount: 350,
        totalTokenCount: 470,
      },
    });

    const mockClient: any = {
      models: {
        generateContent: mockGenerateContent,
      },
    };

    const adapter = new GeminiAdapter({
      apiKey: 'dummy-valid-key',
      client: mockClient,
      timeoutMs: 500,
    });

    const result = await adapter.generateGame(dummyInput);

    expect(result.provider).toBe('gemini');
    expect(result.modelUsed).toBe('gemini-4-argon');
    expect(result.rawContent).toBe(sampleJsonOutput);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.totalTokens).toBe(470);
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gemini-4-argon',
        contents: dummyInput.prompt,
      })
    );
  });

  it('harus melakukan intra-provider cascading fallback saat model pertama mengalami rate limit HTTP 429', async () => {
    const mockGenerateContent = jest
      .fn()
      // Panggilan 1 (gemini-4-argon): 429 RESOURCE_EXHAUSTED
      .mockRejectedValueOnce(
        new Error('HTTP 429: RESOURCE_EXHAUSTED quota exceeded')
      )
      // Panggilan 2 (gemini-3.8-flash): Berhasil
      .mockResolvedValueOnce({
        text: sampleJsonOutput,
        usageMetadata: {
          promptTokenCount: 110,
          candidatesTokenCount: 320,
          totalTokenCount: 430,
        },
      });

    const mockClient: any = {
      models: {
        generateContent: mockGenerateContent,
      },
    };

    const adapter = new GeminiAdapter({
      apiKey: 'dummy-valid-key',
      client: mockClient,
      timeoutMs: 500,
    });

    const result = await adapter.generateGame(dummyInput);

    expect(result.provider).toBe('gemini');
    expect(result.modelUsed).toBe('gemini-3.8-flash');
    expect(result.rawContent).toBe(sampleJsonOutput);
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it('harus berhasil melewati beberapa model hingga menemukan model yang aktif (Model 1 & 2 gagal, Model 3 berhasil)', async () => {
    const mockGenerateContent = jest
      .fn()
      .mockRejectedValueOnce(new Error('HTTP 429: rate limit exceeded'))
      .mockRejectedValueOnce(new Error('HTTP 429: rate limit exceeded'))
      .mockResolvedValueOnce({
        text: sampleJsonOutput,
        usageMetadata: {
          promptTokenCount: 100,
          candidatesTokenCount: 300,
          totalTokenCount: 400,
        },
      });

    const mockClient: any = {
      models: {
        generateContent: mockGenerateContent,
      },
    };

    const adapter = new GeminiAdapter({
      apiKey: 'dummy-valid-key',
      client: mockClient,
      timeoutMs: 500,
    });

    const result = await adapter.generateGame(dummyInput);

    expect(result.modelUsed).toBe('gemini-3.6-flash');
    expect(mockGenerateContent).toHaveBeenCalledTimes(3);
  });

  it('harus melempar AI_RATE_LIMIT_EXCEEDED jika seluruh 15 model Google terkena 429', async () => {
    const mockGenerateContent = jest
      .fn()
      .mockRejectedValue(new Error('HTTP 429: quota exhausted'));

    const mockClient: any = {
      models: {
        generateContent: mockGenerateContent,
      },
    };

    const adapter = new GeminiAdapter({
      apiKey: 'dummy-valid-key',
      client: mockClient,
      timeoutMs: 50,
    });

    try {
      await adapter.generateGame(dummyInput);
      fail('Harusnya melempar AI_RATE_LIMIT_EXCEEDED');
    } catch (err: unknown) {
      const aiErr = err as AIError;
      expect(aiErr.code).toBe('AI_RATE_LIMIT_EXCEEDED');
      expect(aiErr.retryable).toBe(true);
      expect(aiErr.statusCode).toBe(429);
    }
  });

  it('harus langsung melempar AI_CONFIG_ERROR tanpa mencoba model lain jika API key invalid (401/403)', async () => {
    const mockGenerateContent = jest
      .fn()
      .mockRejectedValue(
        new Error('HTTP 403: PERMISSION_DENIED API_KEY_INVALID')
      );

    const mockClient: any = {
      models: {
        generateContent: mockGenerateContent,
      },
    };

    const adapter = new GeminiAdapter({
      apiKey: 'dummy-invalid-key',
      client: mockClient,
      timeoutMs: 500,
    });

    try {
      await adapter.generateGame(dummyInput);
      fail('Harusnya melempar AI_CONFIG_ERROR');
    } catch (err: unknown) {
      const aiErr = err as AIError;
      expect(aiErr.code).toBe('AI_CONFIG_ERROR');
      expect(aiErr.retryable).toBe(false);
      // Verifikasi bahwa loop langsung berhenti (hanya 1 pemanggilan)
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    }
  });

  it('harus menangani timeout lokal dan melempar AI_TIMEOUT', async () => {
    const mockGenerateContent = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => setTimeout(resolve, 300));
    });

    const mockClient: any = {
      models: {
        generateContent: mockGenerateContent,
      },
    };

    // Tetapkan timeout sangat pendek (30 ms) agar memicu timeout
    const adapter = new GeminiAdapter({
      apiKey: 'dummy-valid-key',
      client: mockClient,
      timeoutMs: 30,
      models: [{ id: 'gemini-4-argon', label: 'Gemini 4 Argon' }],
    });

    try {
      await adapter.generateGame(dummyInput);
      fail('Harusnya melempar AI_TIMEOUT');
    } catch (err: unknown) {
      const aiErr = err as AIError;
      expect(aiErr.code).toBe('AI_TIMEOUT');
      expect(aiErr.retryable).toBe(true);
      expect(aiErr.statusCode).toBe(504);
    }
  });

  it('harus menyamarkan kunci rahasia API (Zero Secret Leakage) pada pesan error', async () => {
    const mockGenerateContent = jest.fn().mockRejectedValueOnce(
      new Error(
        'Call failed with key AQ.FakeTestSecretTokenNotReal1234567890 internal error'
      )
    );

    const mockClient: any = {
      models: {
        generateContent: mockGenerateContent,
      },
    };

    const adapter = new GeminiAdapter({
      apiKey: 'dummy-valid-key',
      client: mockClient,
      timeoutMs: 500,
      models: [{ id: 'gemini-4-argon', label: 'Gemini 4 Argon' }],
    });

    try {
      await adapter.generateGame(dummyInput);
      fail('Harusnya melempar error');
    } catch (err: unknown) {
      const aiErr = err as AIError;
      expect(aiErr.message).not.toContain('AQ.FakeTestSecretTokenNotReal1234567890');
      expect(aiErr.message).toContain('[REDACTED_GOOGLE_KEY]');
    }
  });
});
