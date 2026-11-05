import { config } from '../../config/env';
import { SupportedAIProvider } from '../provider.interface';

export type AIErrorCode =
  | 'AI_RATE_LIMIT_EXCEEDED'
  | 'AI_TIMEOUT'
  | 'AI_CONFIG_ERROR'
  | 'AI_PROVIDER_ERROR';

export class AIError extends Error {
  readonly code: AIErrorCode;
  readonly provider: SupportedAIProvider;
  readonly model?: string;
  readonly retryable: boolean;
  readonly statusCode: number;

  constructor(params: {
    message: string;
    code: AIErrorCode;
    provider: SupportedAIProvider;
    model?: string;
    retryable: boolean;
    statusCode: number;
  }) {
    super(params.message);
    this.name = 'AIError';
    this.code = params.code;
    this.provider = params.provider;
    this.model = params.model;
    this.retryable = params.retryable;
    this.statusCode = params.statusCode;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Sanitasi string error agar tidak membocorkan kunci rahasia API (Pilar 3: Keamanan Rahasia).
 */
export function sanitizeErrorMessage(rawMessage: string): string {
  let cleaned = rawMessage
    .replace(/AQ\.[A-Za-z0-9_-]{20,}/g, '[REDACTED_GOOGLE_KEY]')
    .replace(/gsk_[A-Za-z0-9_-]{20,}/g, '[REDACTED_GROQ_KEY]')
    .replace(/nvapi-[A-Za-z0-9_-]{20,}/g, '[REDACTED_NVIDIA_KEY]')
    .replace(/sk-or-[A-Za-z0-9_-]{20,}/g, '[REDACTED_OPENROUTER_KEY]')
    .replace(/key=[A-Za-z0-9_.-]+/gi, 'key=[REDACTED]')
    .replace(/Bearer\s+[A-Za-z0-9_.-]{20,}/gi, 'Bearer [REDACTED_TOKEN]');

  // Redaksi dinamis seluruh token aktif dari konfigurasi environment
  const activeKeys = [
    config.geminiApiKey,
    config.groqApiKey,
    config.sambanovaApiKey,
    config.nvidiaApiKey,
    config.cohereApiKey,
    config.openrouterApiKey,
  ];

  for (const key of activeKeys) {
    if (key && key.trim().length >= 8) {
      cleaned = cleaned.split(key).join('[REDACTED_SECRET]');
    }
  }

  return cleaned;
}

/**
 * Memetakan error SDK Google Generative AI ke entitas AIError terstandarisasi.
 */
export function normalizeGeminiError(error: unknown, model: string): AIError {
  if (error instanceof AIError) {
    return error;
  }

  const rawMessage = error instanceof Error ? error.message : String(error);
  const cleanMessage = sanitizeErrorMessage(rawMessage);
  const errObj = error as Record<string, unknown> | null;

  // 1. Timeout / AbortController
  if (
    cleanMessage.toLowerCase().includes('aborted') ||
    cleanMessage.toLowerCase().includes('timeout') ||
    errObj?.name === 'AbortError'
  ) {
    return new AIError({
      message: `Gemini pemanggilan model ${model} melebihi batas waktu (timeout).`,
      code: 'AI_TIMEOUT',
      provider: 'gemini',
      model,
      retryable: true,
      statusCode: 504,
    });
  }

  // 2. Rate Limit / Quota Exceeded (HTTP 429 / RESOURCE_EXHAUSTED)
  const isRateLimit =
    cleanMessage.includes('429') ||
    cleanMessage.toLowerCase().includes('resource_exhausted') ||
    cleanMessage.toLowerCase().includes('quota') ||
    cleanMessage.toLowerCase().includes('rate limit') ||
    errObj?.status === 429;

  if (isRateLimit) {
    return new AIError({
      message: `Gemini kuota/rate-limit terlampaui pada model ${model}: ${cleanMessage}`,
      code: 'AI_RATE_LIMIT_EXCEEDED',
      provider: 'gemini',
      model,
      retryable: true,
      statusCode: 429,
    });
  }

  // 3. Autentikasi / Kunci Invalid (401 / 403 / PERMISSION_DENIED)
  const isAuthError =
    cleanMessage.includes('401') ||
    cleanMessage.includes('403') ||
    cleanMessage.toLowerCase().includes('permission_denied') ||
    cleanMessage.toLowerCase().includes('api_key_invalid') ||
    cleanMessage.toLowerCase().includes('unauthorized') ||
    errObj?.status === 401 ||
    errObj?.status === 403;

  if (isAuthError) {
    return new AIError({
      message: `Konfigurasi kredensial Gemini tidak valid atau tidak memiliki izin akses: ${cleanMessage}`,
      code: 'AI_CONFIG_ERROR',
      provider: 'gemini',
      model,
      retryable: false,
      statusCode: 500,
    });
  }

  // 4. Server Error 5xx / Vendor Error Umum
  return new AIError({
    message: `Terjadi kendala saat memanggil Gemini model ${model}: ${cleanMessage}`,
    code: 'AI_PROVIDER_ERROR',
    provider: 'gemini',
    model,
    retryable: true,
    statusCode: 502,
  });
}
