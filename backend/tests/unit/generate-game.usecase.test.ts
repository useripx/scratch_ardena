import validCatching from '../fixtures/game-valid-catching.json';
import {
  GenerateGameUseCase,
  OutputValidationError,
} from '../../src/usecases/generate-game.usecase';
import { GenerateGameInput } from '../../src/providers/provider.interface';

describe('GenerateGameUseCase (Unit Tests)', () => {
  const dummyInput: GenerateGameInput = {
    prompt: 'Buat game tangkap apel',
    template: 'catching-game',
    language: 'id',
    schemaVersion: '1.0',
    requestId: 'req-uc-123',
  };

  const validJsonString = JSON.stringify(validCatching);

  it('harus berhasil memproses output AI yang valid dan mengembalikan GameSpec', async () => {
    const mockProviderManager: any = {
      generateGame: jest.fn().mockResolvedValue({
        rawContent: validJsonString,
        provider: 'gemini',
        modelUsed: 'gemini-4-argon',
        durationMs: 450,
        totalTokens: 520,
      }),
    };

    const useCase = new GenerateGameUseCase(mockProviderManager);
    const result = await useCase.execute(dummyInput);

    expect(result.game.schemaVersion).toBe('1.0');
    expect(result.game.game.title).toBe(validCatching.game.title);
    expect(result.meta.provider).toBe('gemini');
    expect(result.meta.modelUsed).toBe('gemini-4-argon');
    expect(result.meta.durationMs).toBe(450);
  });

  it('harus membersihkan bungkus markdown (```json ... ```) secara transparan', async () => {
    const markdownWrapped = `\`\`\`json\n${validJsonString}\n\`\`\``;
    const mockProviderManager: any = {
      generateGame: jest.fn().mockResolvedValue({
        rawContent: markdownWrapped,
        provider: 'groq',
        modelUsed: 'openai/gpt-oss-120b',
        durationMs: 200,
      }),
    };

    const useCase = new GenerateGameUseCase(mockProviderManager);
    const result = await useCase.execute(dummyInput);

    expect(result.game.schemaVersion).toBe('1.0');
    expect(result.meta.provider).toBe('groq');
  });

  it('harus memicu auto-retry 1x jika inferensi pertama bukan JSON, dan berhasil jika percobaan kedua valid', async () => {
    const mockProviderManager: any = {
      generateGame: jest
        .fn()
        // Panggilan 1: teks non-JSON
        .mockResolvedValueOnce({
          rawContent: 'Halo, ini game Scratch yang bagus untuk Anda buat!',
          provider: 'sambanova',
          modelUsed: 'gemma-4-31B-it',
          durationMs: 300,
        })
        // Panggilan 2 (Retry): JSON valid
        .mockResolvedValueOnce({
          rawContent: validJsonString,
          provider: 'sambanova',
          modelUsed: 'gemma-4-31B-it',
          durationMs: 350,
        }),
    };

    const useCase = new GenerateGameUseCase(mockProviderManager);
    const result = await useCase.execute(dummyInput);

    expect(mockProviderManager.generateGame).toHaveBeenCalledTimes(2);
    expect(result.game.schemaVersion).toBe('1.0');
  });

  it('harus melempar AI_OUTPUT_PARSE_FAILED (422) jika teks tetap bukan JSON setelah retry', async () => {
    const mockProviderManager: any = {
      generateGame: jest.fn().mockResolvedValue({
        rawContent: 'Teks percakapan biasa tanpa kurung kurawal.',
        provider: 'nvidia',
        modelUsed: 'nemotron-bolt',
        durationMs: 100,
      }),
    };

    const useCase = new GenerateGameUseCase(mockProviderManager);

    try {
      await useCase.execute(dummyInput);
      fail('Harusnya melempar error');
    } catch (err: unknown) {
      const outErr = err as OutputValidationError;
      expect(outErr.code).toBe('AI_OUTPUT_PARSE_FAILED');
      expect(outErr.statusCode).toBe(422);
    }
  });

  it('harus melempar AI_OUTPUT_SCHEMA_INVALID (422) jika JSON tidak memuat field wajib', async () => {
    const incompleteJson = JSON.stringify({
      schemaVersion: '1.0',
      game: { title: 'Game Rusak' },
      // field objects, delta, rules dll hilang
    });

    const mockProviderManager: any = {
      generateGame: jest.fn().mockResolvedValue({
        rawContent: incompleteJson,
        provider: 'cohere',
        modelUsed: 'command-r7b',
        durationMs: 120,
      }),
    };

    const useCase = new GenerateGameUseCase(mockProviderManager);

    try {
      await useCase.execute(dummyInput);
      fail('Harusnya melempar error');
    } catch (err: unknown) {
      const outErr = err as OutputValidationError;
      expect(outErr.code).toBe('AI_OUTPUT_SCHEMA_INVALID');
      expect(outErr.statusCode).toBe(422);
    }
  });

  it('harus melempar VM_WHITELIST_VALIDATION_FAILED (422) jika terdapat pelanggaran allowlist', async () => {
    const violatedSpec = {
      ...validCatching,
      objects: [
        ...validCatching.objects,
        {
          id: 'sprite_laser',
          name: 'Laser',
          role: 'projectile',
          initialPosition: { x: 0, y: 0 },
        },
      ],
    };

    const mockProviderManager: any = {
      generateGame: jest.fn().mockResolvedValue({
        rawContent: JSON.stringify(violatedSpec),
        provider: 'openrouter',
        modelUsed: 'openrouter/free',
        durationMs: 180,
      }),
    };

    const useCase = new GenerateGameUseCase(mockProviderManager);

    try {
      await useCase.execute(dummyInput);
      fail('Harusnya melempar error');
    } catch (err: unknown) {
      const outErr = err as OutputValidationError;
      expect(outErr.code).toBe('VM_WHITELIST_VALIDATION_FAILED');
      expect(outErr.statusCode).toBe(422);
    }
  });
});
