import { ModelDescriptor } from '../../config/ai.config';
import {
  AIError,
  sanitizeErrorMessage,
} from '../gemini/gemini.error';
import {
  AIProvider,
  GenerateGameInput,
  ProviderRawResponse,
  SupportedAIProvider,
} from '../provider.interface';

export interface OpenAICompatibleAdapterOptions {
  name: SupportedAIProvider;
  apiKey: string;
  baseUrl: string;
  models: readonly ModelDescriptor[];
  timeoutMs?: number;
  temperature?: number;
  maxOutputTokens?: number;
  extraHeaders?: Record<string, string>;
  fetchFn?: typeof fetch;
}

export class OpenAICompatibleAdapter implements AIProvider {
  readonly name: SupportedAIProvider;

  protected readonly apiKey: string;
  protected readonly baseUrl: string;
  protected readonly models: readonly ModelDescriptor[];
  protected readonly timeoutMs: number;
  protected readonly temperature: number;
  protected readonly maxOutputTokens: number;
  protected readonly extraHeaders: Record<string, string>;
  protected readonly fetchFn: typeof fetch;

  constructor(options: OpenAICompatibleAdapterOptions) {
    this.name = options.name;
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.models = options.models;
    this.timeoutMs = options.timeoutMs ?? 15000;
    this.temperature = options.temperature ?? 0.2;
    this.maxOutputTokens = options.maxOutputTokens ?? 2048;
    this.extraHeaders = options.extraHeaders || {};
    this.fetchFn = options.fetchFn || fetch;

    if (!this.apiKey || !this.apiKey.trim()) {
      throw new AIError({
        message: `Kunci API untuk provider ${this.name} tidak ditemukan.`,
        code: 'AI_CONFIG_ERROR',
        provider: this.name,
        retryable: false,
        statusCode: 500,
      });
    }
  }

  protected buildSystemInstruction(input: GenerateGameInput): string {
    return [
      'You are Ardena Playground AI, an expert assistant that generates structured Scratch 3.0 games.',
      'Generate a complete, valid JSON representation for the game based on the user prompt.',
      `Target Game Template: ${input.template}`,
      `Preferred Language: ${input.language === 'id' ? 'Indonesian' : 'English'}`,
      `Schema Version: ${input.schemaVersion}`,
      'CRITICAL: Return strictly raw JSON. Do NOT include markdown code fences (such as ```json or ```), explanations, or conversational text.',
    ].join('\n');
  }

  protected normalizeError(
    err: unknown,
    model: string,
    status?: number
  ): AIError {
    if (err instanceof AIError) return err;

    const rawMessage = err instanceof Error ? err.message : String(err);
    const cleanMessage = sanitizeErrorMessage(rawMessage);

    if (
      cleanMessage.toLowerCase().includes('aborted') ||
      cleanMessage.toLowerCase().includes('timeout')
    ) {
      return new AIError({
        message: `${this.name} timeout pada model ${model}.`,
        code: 'AI_TIMEOUT',
        provider: this.name,
        model,
        retryable: true,
        statusCode: 504,
      });
    }

    const isRateLimit =
      status === 429 ||
      cleanMessage.includes('429') ||
      cleanMessage.toLowerCase().includes('rate_limit') ||
      cleanMessage.toLowerCase().includes('quota') ||
      cleanMessage.toLowerCase().includes('high demand');

    if (isRateLimit) {
      return new AIError({
        message: `${this.name} kuota/rate-limit terlampaui pada model ${model}: ${cleanMessage}`,
        code: 'AI_RATE_LIMIT_EXCEEDED',
        provider: this.name,
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
      cleanMessage.toLowerCase().includes('permission_denied') ||
      cleanMessage.toLowerCase().includes('invalid_api_key');

    if (isAuthError) {
      return new AIError({
        message: `Kredensial ${this.name} tidak valid: ${cleanMessage}`,
        code: 'AI_CONFIG_ERROR',
        provider: this.name,
        model,
        retryable: false,
        statusCode: 500,
      });
    }

    return new AIError({
      message: `Terjadi kendala pada ${this.name} model ${model}: ${cleanMessage}`,
      code: 'AI_PROVIDER_ERROR',
      provider: this.name,
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

        const fetchPromise = this.fetchFn(
          `${this.baseUrl}/chat/completions`,
          {
            method: 'POST',
            signal: abortController.signal,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.apiKey}`,
              ...this.extraHeaders,
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
          }
        );

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
          choices?: Array<{ message?: { content?: string } }>;
          usage?: {
            prompt_tokens?: number;
            completion_tokens?: number;
            total_tokens?: number;
          };
        };

        const durationMs = Date.now() - startTime;
        const rawContent = data.choices?.[0]?.message?.content || '';

        return {
          rawContent,
          provider: this.name,
          modelUsed: currentModel.id,
          durationMs,
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
          totalTokens: data.usage?.total_tokens,
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
        message: `Seluruh model pada provider ${this.name} mengalami kegagalan.`,
        code: 'AI_PROVIDER_ERROR',
        provider: this.name,
        retryable: true,
        statusCode: 502,
      })
    );
  }
}
