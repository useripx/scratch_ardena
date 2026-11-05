import { aiConfig } from '../config/ai.config';
import { CohereAdapter } from './cohere/cohere.adapter';
import { GeminiAdapter } from './gemini/gemini.adapter';
import { AIError } from './gemini/gemini.error';
import { GroqAdapter } from './groq/groq.adapter';
import { NvidiaAdapter } from './nvidia/nvidia.adapter';
import { OpenRouterAdapter } from './openrouter/openrouter.adapter';
import {
  AIProvider,
  GenerateGameInput,
  ProviderRawResponse,
} from './provider.interface';
import { SambaNovaAdapter } from './sambanova/sambanova.adapter';

export interface ProviderManagerOptions {
  providers?: AIProvider[];
  totalTimeoutMs?: number;
}

export class ProviderManager {
  private readonly providers: AIProvider[];
  private readonly totalTimeoutMs: number;

  constructor(options: ProviderManagerOptions = {}) {
    this.totalTimeoutMs = options.totalTimeoutMs ?? aiConfig.totalTimeoutMs;

    if (options.providers && options.providers.length > 0) {
      this.providers = options.providers;
    } else {
      // Susun hirarki default 6 cluster
      this.providers = [
        new GeminiAdapter(),
        new GroqAdapter(),
        new SambaNovaAdapter(),
        new NvidiaAdapter(),
        new CohereAdapter(),
        new OpenRouterAdapter(),
      ];
    }
  }

  /**
   * Menjalankan inferensi AI secara sekuensial melintasi 6 cluster provider (No racing calls).
   */
  async generateGame(input: GenerateGameInput): Promise<ProviderRawResponse> {
    const overallStartTime = Date.now();
    let lastError: AIError | null = null;

    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i];
      const elapsedTotal = Date.now() - overallStartTime;

      if (elapsedTotal >= this.totalTimeoutMs) {
        throw new AIError({
          message: `Total alokasi waktu inferensi (${this.totalTimeoutMs}ms) telah habis.`,
          code: 'AI_TIMEOUT',
          provider: provider.name,
          retryable: true,
          statusCode: 504,
        });
      }

      try {
        const response = await provider.generateGame(input);

        // Jika berhasil pada provider fallback, catat keberhasilan failover
        if (i > 0) {
          console.log(
            `[ProviderManager] Failover berhasil ditangani oleh provider: ${provider.name} (Model: ${response.modelUsed}, Durasi: ${response.durationMs}ms)`
          );
        }

        return response;
      } catch (err: unknown) {
        const aiError =
          err instanceof AIError
            ? err
            : new AIError({
                message: err instanceof Error ? err.message : String(err),
                code: 'AI_PROVIDER_ERROR',
                provider: provider.name,
                retryable: true,
                statusCode: 502,
              });

        lastError = aiError;

        console.warn(
          `[ProviderManager] Provider ${provider.name} mengalami kendala (${aiError.code}). Melanjutkan failover ke provider berikutnya...`
        );

        // Lanjutkan ke provider berikutnya dalam antrean Hexa-Cluster
        continue;
      }
    }

    // Jika seluruh 6 cluster gagal, lempar 502 terpadu
    throw new AIError({
      message:
        lastError?.message ||
        'Seluruh cluster AI provider (Gemini, Groq, SambaNova, NVIDIA, Cohere, OpenRouter) saat ini tidak tersedia. Silakan coba kembali beberapa saat lagi.',
      code: 'AI_PROVIDER_ERROR',
      provider: lastError?.provider || 'gemini',
      retryable: true,
      statusCode: 502,
    });
  }
}
