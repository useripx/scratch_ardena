import { CohereAdapter } from '../../src/providers/cohere/cohere.adapter';
import { AIError } from '../../src/providers/gemini/gemini.error';
import { GroqAdapter } from '../../src/providers/groq/groq.adapter';
import { NvidiaAdapter } from '../../src/providers/nvidia/nvidia.adapter';
import { OpenRouterAdapter } from '../../src/providers/openrouter/openrouter.adapter';
import { GenerateGameInput } from '../../src/providers/provider.interface';
import { SambaNovaAdapter } from '../../src/providers/sambanova/sambanova.adapter';

describe('Hexa-Cluster AI Adapters (Unit Mock Tests)', () => {
  const dummyInput: GenerateGameInput = {
    prompt: 'Buat game labirin sederhana',
    template: 'maze-adventure',
    language: 'id',
    schemaVersion: '1.0',
    requestId: 'req-test-456',
  };

  const sampleJsonOutput = JSON.stringify({
    title: 'Labirin Tikus',
    template: 'maze-adventure',
  });

  describe('GroqAdapter', () => {
    it('harus berhasil mengembalikan output dari model pertama', async () => {
      const mockFetch: any = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: sampleJsonOutput } }],
          usage: { prompt_tokens: 50, completion_tokens: 150, total_tokens: 200 },
        }),
      });

      const adapter = new GroqAdapter({
        apiKey: 'dummy-groq-key',
        fetchFn: mockFetch,
        timeoutMs: 500,
      });

      const result = await adapter.generateGame(dummyInput);
      expect(result.provider).toBe('groq');
      expect(result.rawContent).toBe(sampleJsonOutput);
      expect(result.totalTokens).toBe(200);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('harus melakukan intra-model fallback saat model pertama kena 429', async () => {
      const mockFetch: any = jest
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          text: async () => 'Rate limit reached',
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: sampleJsonOutput } }],
            usage: { total_tokens: 180 },
          }),
        });

      const adapter = new GroqAdapter({
        apiKey: 'dummy-groq-key',
        fetchFn: mockFetch,
        timeoutMs: 500,
      });

      const result = await adapter.generateGame(dummyInput);
      expect(result.provider).toBe('groq');
      expect(result.modelUsed).toBe('openai/gpt-oss-20b');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('SambaNovaAdapter', () => {
    it('harus melempar AI_CONFIG_ERROR jika apiKey kosong', () => {
      expect(() => {
        new SambaNovaAdapter({ apiKey: '' });
      }).toThrow(AIError);
    });

    it('harus berhasil memanggil SambaNova endpoint', async () => {
      const mockFetch: any = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: sampleJsonOutput } }],
          usage: { total_tokens: 150 },
        }),
      });

      const adapter = new SambaNovaAdapter({
        apiKey: 'dummy-sambanova-key',
        fetchFn: mockFetch,
        timeoutMs: 500,
      });

      const result = await adapter.generateGame(dummyInput);
      expect(result.provider).toBe('sambanova');
      expect(result.rawContent).toBe(sampleJsonOutput);
    });
  });

  describe('NvidiaAdapter', () => {
    it('harus menyamarkan token kunci pada pesan error jika terjadi kegagalan', async () => {
      const mockFetch: any = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () =>
          'Internal server error with nvapi-secret1234567890abcdefghijklmn token',
      });

      const adapter = new NvidiaAdapter({
        apiKey: 'dummy-nvidia-key',
        fetchFn: mockFetch,
        timeoutMs: 500,
        models: [{ id: 'nvidia/nemotron-3.5-bolt-e4b', label: 'Nemotron Bolt' }],
      });

      try {
        await adapter.generateGame(dummyInput);
        fail('Harusnya melempar error');
      } catch (err: unknown) {
        const aiErr = err as AIError;
        expect(aiErr.message).not.toContain('nvapi-secret1234567890abcdefghijklmn');
        expect(aiErr.message).toContain('[REDACTED_NVIDIA_KEY]');
      }
    });
  });

  describe('OpenRouterAdapter', () => {
    it('harus mengirim header referer dan menghasilkan response valid', async () => {
      let capturedHeaders: Record<string, string> = {};
      const mockFetch: any = jest.fn().mockImplementation((url, init) => {
        capturedHeaders = init.headers;
        return Promise.resolve({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: sampleJsonOutput } }],
            usage: { total_tokens: 120 },
          }),
        });
      });

      const adapter = new OpenRouterAdapter({
        apiKey: 'dummy-openrouter-key',
        fetchFn: mockFetch,
        timeoutMs: 500,
      });

      const result = await adapter.generateGame(dummyInput);
      expect(result.provider).toBe('openrouter');
      expect(capturedHeaders['X-Title']).toBe('Ardena Playground');
    });
  });

  describe('CohereAdapter', () => {
    it('harus mengekstrak token dan teks dari payload v2 chat Cohere', async () => {
      const mockFetch: any = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          message: {
            content: [{ text: sampleJsonOutput }],
          },
          usage: {
            tokens: {
              input_tokens: 60,
              output_tokens: 140,
            },
          },
        }),
      });

      const adapter = new CohereAdapter({
        apiKey: 'dummy-cohere-key',
        fetchFn: mockFetch,
        timeoutMs: 500,
      });

      const result = await adapter.generateGame(dummyInput);
      expect(result.provider).toBe('cohere');
      expect(result.rawContent).toBe(sampleJsonOutput);
      expect(result.totalTokens).toBe(200);
    });

    it('harus menangani timeout lokal dan melempar AI_TIMEOUT', async () => {
      const mockFetch: any = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => setTimeout(resolve, 300));
      });

      const adapter = new CohereAdapter({
        apiKey: 'dummy-cohere-key',
        fetchFn: mockFetch,
        timeoutMs: 30,
        models: [{ id: 'command-r7b-12-2024', label: 'Command R 7B' }],
      });

      try {
        await adapter.generateGame(dummyInput);
        fail('Harusnya melempar AI_TIMEOUT');
      } catch (err: unknown) {
        const aiErr = err as AIError;
        expect(aiErr.code).toBe('AI_TIMEOUT');
        expect(aiErr.statusCode).toBe(504);
      }
    });
  });
});

