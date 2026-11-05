import { GoogleGenAI } from '@google/genai';
import { aiConfig, ModelDescriptor } from '../../config/ai.config';
import { config } from '../../config/env';
import {
  AIProvider,
  GenerateGameInput,
  ProviderRawResponse,
} from '../provider.interface';
import { AIError, normalizeGeminiError } from './gemini.error';

export interface GeminiAdapterOptions {
  apiKey?: string;
  models?: readonly ModelDescriptor[];
  timeoutMs?: number;
  temperature?: number;
  maxOutputTokens?: number;
  client?: GoogleGenAI;
}

export class GeminiAdapter implements AIProvider {
  readonly name = 'gemini' as const;

  private readonly apiKey: string;
  private readonly models: readonly ModelDescriptor[];
  private readonly timeoutMs: number;
  private readonly temperature: number;
  private readonly maxOutputTokens: number;
  private readonly client: GoogleGenAI;

  constructor(options: GeminiAdapterOptions = {}) {
    this.apiKey =
      typeof options.apiKey === 'string'
        ? options.apiKey
        : config.geminiApiKey;
    this.models = options.models || aiConfig.gemini.models;
    this.timeoutMs = options.timeoutMs ?? aiConfig.gemini.timeoutMs;
    this.temperature = options.temperature ?? aiConfig.gemini.temperature;
    this.maxOutputTokens =
      options.maxOutputTokens ?? aiConfig.gemini.maxOutputTokens;

    if (!this.apiKey || !this.apiKey.trim()) {
      throw new AIError({
        message:
          'Kunci GEMINI_API_KEY tidak ditemukan pada environment variables maupun template/api.',
        code: 'AI_CONFIG_ERROR',
        provider: 'gemini',
        retryable: false,
        statusCode: 500,
      });
    }

    this.client =
      options.client ||
      new GoogleGenAI({
        apiKey: this.apiKey,
        httpOptions: { timeout: this.timeoutMs },
      });
  }

  /**
   * Menghasilkan teks system prompt terstandarisasi untuk inferensi Scratch game JSON.
   */
  private buildSystemInstruction(input: GenerateGameInput): string {
    return [
      'You are Ardena Playground AI, an expert assistant that generates structured Scratch 3.0 games.',
      'Generate a complete, valid JSON representation for the game based on the user prompt.',
      `Target Game Template: ${input.template}`,
      `Preferred Language: ${input.language === 'id' ? 'Indonesian' : 'English'}`,
      `Schema Version: ${input.schemaVersion}`,
      'CRITICAL: Return strictly raw JSON. Do NOT include markdown code fences (such as ```json or ```), explanations, or conversational text.',
    ].join('\n');
  }

  /**
   * Mengeksekusi permintaan generate game ke Gemini dengan mekanisme cascading fallback antar model.
   */
  async generateGame(input: GenerateGameInput): Promise<ProviderRawResponse> {
    let lastError: AIError | null = null;
    const systemInstruction = this.buildSystemInstruction(input);

    for (let i = 0; i < this.models.length; i++) {
      const currentModel = this.models[i];
      const startTime = Date.now();
      let timer: NodeJS.Timeout | undefined;

      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            reject(new Error(`Timeout: Request exceeded ${this.timeoutMs}ms`));
          }, this.timeoutMs);
        });

        const requestPromise = this.client.models.generateContent({
          model: currentModel.id,
          contents: input.prompt,
          config: {
            systemInstruction,
            temperature: this.temperature,
            maxOutputTokens: this.maxOutputTokens,
            responseMimeType: 'application/json',
          },
        });

        // Balapan antara pemanggilan API dengan timeout lokal
        const response = (await Promise.race([
          requestPromise,
          timeoutPromise,
        ])) as {
          text?: string;
          usageMetadata?: {
            promptTokenCount?: number;
            candidatesTokenCount?: number;
            totalTokenCount?: number;
          };
        };

        if (timer) {
          clearTimeout(timer);
          timer = undefined;
        }

        const durationMs = Date.now() - startTime;
        const rawContent = response.text || '';

        return {
          rawContent,
          provider: 'gemini',
          modelUsed: currentModel.id,
          durationMs,
          promptTokens: response.usageMetadata?.promptTokenCount,
          completionTokens: response.usageMetadata?.candidatesTokenCount,
          totalTokens: response.usageMetadata?.totalTokenCount,
        };
      } catch (err: unknown) {
        if (timer) {
          clearTimeout(timer);
          timer = undefined;
        }

        const normalized = normalizeGeminiError(err, currentModel.id);
        lastError = normalized;

        // Jika kunci API salah, langsung lempar tanpa mencoba model lain
        if (normalized.code === 'AI_CONFIG_ERROR') {
          throw normalized;
        }

        // Jika rate limit (429) atau error retryable, lanjutkan ke model berikutnya
        if (i < this.models.length - 1) {
          continue;
        }
      }
    }

    // Jika seluruh model Google telah dicoba dan semuanya gagal:
    throw (
      lastError ||
      new AIError({
        message: 'Seluruh model Google Gemini mengalami kegagalan.',
        code: 'AI_PROVIDER_ERROR',
        provider: 'gemini',
        retryable: true,
        statusCode: 502,
      })
    );
  }
}
