import { aiConfig, ModelDescriptor } from '../../config/ai.config';
import { config } from '../../config/env';
import {
  AIError,
  sanitizeErrorMessage,
} from '../gemini/gemini.error';
import {
  AIProvider,
  GenerateGameInput,
  ProviderRawResponse,
} from '../provider.interface';

export interface CohereAdapterOptions {
  apiKey?: string;
  baseUrl?: string;
  models?: readonly ModelDescriptor[];
  timeoutMs?: number;
  temperature?: number;
  maxOutputTokens?: number;
  fetchFn?: typeof fetch;
}

export class CohereAdapter implements AIProvider {
  readonly name = 'cohere' as const;

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly models: readonly ModelDescriptor[];
  private readonly timeoutMs: number;
  private readonly temperature: number;
  private readonly maxOutputTokens: number;
  private readonly fetchFn: typeof fetch;

  constructor(options: CohereAdapterOptions = {}) {
    this.apiKey =
      typeof options.apiKey === 'string'
        ? options.apiKey
        : config.cohereApiKey;
    this.baseUrl = (
      options.baseUrl ||
      aiConfig.cohere.baseUrl ||
      'https://api.cohere.com/v2'
    ).replace(/\/+$/, '');
    this.models = options.models || aiConfig.cohere.models;
    this.timeoutMs = options.timeoutMs ?? aiConfig.cohere.timeoutMs;
    this.temperature = options.temperature ?? aiConfig.cohere.temperature;
    this.maxOutputTokens =
      options.maxOutputTokens ?? aiConfig.cohere.maxOutputTokens;
    this.fetchFn = options.fetchFn || fetch;

    if (!this.apiKey || !this.apiKey.trim()) {
      throw new AIError({
        message: 'Kunci API Cohere tidak ditemukan.',
        code: 'AI_CONFIG_ERROR',
        provider: 'cohere',
        retryable: false,
        statusCode: 500,
      });
    }
  }

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

  private normalizeError(err: unknown, model: string, status?: number): AIError {
    if (err instanceof AIError) return err;

    const rawMessage = err instanceof Error ? err.message : String(err);
    const cleanMessage = sanitizeErrorMessage(rawMessage);

    if (
      cleanMessage.toLowerCase().includes('aborted') ||
      cleanMessage.toLowerCase().includes('timeout')
    ) {
      return new AIError({
        message: `Cohere timeout pada model ${model}.`,
        code: 'AI_TIMEOUT',
        provider: 'cohere',
        model,
        retryable: true,
        statusCode: 504,
      });
    }

    const isRateLimit =
      status === 429 ||
      cleanMessage.includes('429') ||
      cleanMessage.toLowerCase().includes('rate_limit') ||
      cleanMessage.toLowerCase().includes('quota');

    if (isRateLimit) {
      return new AIError({
        message: `Cohere kuota/rate-limit terlampaui pada model ${model}: ${cleanMessage}`,
        code: 'AI_RATE_LIMIT_EXCEEDED',
        provider: 'cohere',
        model,
        retryable: true,
        statusCode: 429,
      });
    }

    const isAuthError =
      status === 401 ||
      status === 403 ||
      cleanMessage.includes('401') ||
      cleanMessage.includes('403') ||
      cleanMessage.toLowerCase().includes('unauthorized') ||
      cleanMessage.toLowerCase().includes('invalid_api_key');

    if (isAuthError) {
      return new AIError({
        message: `Kredensial Cohere tidak valid: ${cleanMessage}`,
        code: 'AI_CONFIG_ERROR',
        provider: 'cohere',
        model,
        retryable: false,
        statusCode: 500,
      });
    }

    return new AIError({
      message: `Terjadi kendala pada Cohere model ${model}: ${cleanMessage}`,
      code: 'AI_PROVIDER_ERROR',
      provider: 'cohere',
      model,
      retryable: true,
      statusCode: status && status >= 500 ? status : 502,
    });
  }

  async generateGame(input: GenerateGameInput): Promise<ProviderRawResponse> {
    let lastError: AIError | null = null;
    const systemInstruction = this.buildSystemInstruction(input);

    for (let i = 0; i < this.models.length; i++) {
      const currentModel = this.models[i];
      const startTime = Date.now();
      const abortController = new AbortController();
      let timer: NodeJS.Timeout | undefined;

      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            abortController.abort();
            reject(new Error(`Timeout: Request exceeded ${this.timeoutMs}ms`));
          }, this.timeoutMs);
        });

        const fetchPromise = this.fetchFn(`${this.baseUrl}/chat`, {
          method: 'POST',
          signal: abortController.signal,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: currentModel.id,
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: input.prompt },
            ],
            temperature: this.temperature,
            max_tokens: this.maxOutputTokens,
            response_format: { type: 'json_object' },
          }),
        });

        const response = (await Promise.race([
          fetchPromise,
          timeoutPromise,
        ])) as Response;

        if (timer) {
          clearTimeout(timer);
          timer = undefined;
        }

        if (!response.ok) {
          const errBody = await response.text().catch(() => '');
          throw this.normalizeError(
            new Error(errBody || `HTTP ${response.status}`),
            currentModel.id,
            response.status
          );
        }

        const data = (await response.json()) as {
          message?: {
            content?: Array<{ text?: string }>;
          };
          usage?: {
            tokens?: {
              input_tokens?: number;
              output_tokens?: number;
            };
          };
        };

        const durationMs = Date.now() - startTime;
        const rawContent = data.message?.content?.[0]?.text || '';
        const promptTokens = data.usage?.tokens?.input_tokens;
        const completionTokens = data.usage?.tokens?.output_tokens;
        const totalTokens =
          promptTokens !== undefined && completionTokens !== undefined
            ? promptTokens + completionTokens
            : undefined;

        return {
          rawContent,
          provider: 'cohere',
          modelUsed: currentModel.id,
          durationMs,
          promptTokens,
          completionTokens,
          totalTokens,
        };
      } catch (err: unknown) {
        if (timer) {
          clearTimeout(timer);
          timer = undefined;
        }

        const normalized = this.normalizeError(err, currentModel.id);
        lastError = normalized;

        if (normalized.code === 'AI_CONFIG_ERROR') {
          throw normalized;
        }

        if (i < this.models.length - 1) {
          continue;
        }
      }
    }

    throw (
      lastError ||
      new AIError({
        message: 'Seluruh model pada provider Cohere mengalami kegagalan.',
        code: 'AI_PROVIDER_ERROR',
        provider: 'cohere',
        retryable: true,
        statusCode: 502,
      })
    );
  }
}
