import {
  GenerateGameInput,
  ProviderRawResponse,
} from '../providers/provider.interface';
import { ProviderManager } from '../providers/provider.manager';
import {
  validateCapabilities,
} from '../validators/capability.validator';
import {
  ArdenaGameSpec,
  ArdenaGameSpecSchema,
} from '../validators/output.validator';

export class OutputValidationError extends Error {
  readonly code:
    | 'AI_OUTPUT_PARSE_FAILED'
    | 'AI_OUTPUT_SCHEMA_INVALID'
    | 'VM_WHITELIST_VALIDATION_FAILED';
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(params: {
    message: string;
    code:
      | 'AI_OUTPUT_PARSE_FAILED'
      | 'AI_OUTPUT_SCHEMA_INVALID'
      | 'VM_WHITELIST_VALIDATION_FAILED';
    statusCode?: number;
    details?: unknown;
  }) {
    super(params.message);
    this.name = 'OutputValidationError';
    this.code = params.code;
    this.statusCode = params.statusCode ?? 422;
    this.details = params.details;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export interface GenerateGameResult {
  game: ArdenaGameSpec;
  meta: {
    provider: string;
    modelUsed: string;
    durationMs: number;
    totalTokens?: number;
    requestId?: string;
  };
}

export class GenerateGameUseCase {
  private readonly providerManager: ProviderManager;

  constructor(providerManager?: ProviderManager) {
    this.providerManager = providerManager || new ProviderManager();
  }

  /**
   * Menghapus markdown code fence (seperti ```json ... ```) jika LLM menambahkannya.
   */
  private stripMarkdownFences(raw: string): string {
    let clean = raw.trim();

    // Hapus opening ```json atau ```
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\s*\r?\n?/i, '');
    }

    // Hapus closing ```
    if (clean.endsWith('```')) {
      clean = clean.replace(/\r?\n?```\s*$/i, '');
    }

    return clean.trim();
  }

  /**
   * Mengekstrak dan mem-parsing JSON dari string mentah LLM.
   */
  private parseRawContent(rawContent: string): unknown {
    const cleaned = this.stripMarkdownFences(rawContent);

    // Cari kurung kurawal pertama dan terakhir jika ada teks luar
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
      throw new OutputValidationError({
        message: 'Respons dari AI tidak memuat objek JSON yang valid.',
        code: 'AI_OUTPUT_PARSE_FAILED',
        statusCode: 422,
      });
    }

    const jsonSlice = cleaned.slice(firstBrace, lastBrace + 1);

    try {
      return JSON.parse(jsonSlice);
    } catch (err: unknown) {
      throw new OutputValidationError({
        message: `Gagal mem-parsing sintaks JSON hasil AI: ${err instanceof Error ? err.message : String(err)}`,
        code: 'AI_OUTPUT_PARSE_FAILED',
        statusCode: 422,
        details: { rawSlice: jsonSlice.slice(0, 200) },
      });
    }
  }

  /**
   * Eksekusi use case pembuatan game berbasis AI dengan validasi berlapis.
   */
  async execute(input: GenerateGameInput): Promise<GenerateGameResult> {
    let rawResponse: ProviderRawResponse;
    let parsedJson: unknown;

    try {
      rawResponse = await this.providerManager.generateGame(input);
      parsedJson = this.parseRawContent(rawResponse.rawContent);
    } catch (firstErr: unknown) {
      // Jika kegagalan adalah parsing JSON, lakukan 1x retry koreksi otomatis
      if (
        firstErr instanceof OutputValidationError &&
        firstErr.code === 'AI_OUTPUT_PARSE_FAILED'
      ) {
        const retryInput: GenerateGameInput = {
          ...input,
          prompt: `${input.prompt}\n\nIMPORTANT: Your previous output could not be parsed as valid JSON. Return strictly a raw JSON object conforming to schema version 1.0 without markdown fences or additional text.`,
        };

        try {
          rawResponse = await this.providerManager.generateGame(retryInput);
          parsedJson = this.parseRawContent(rawResponse.rawContent);
        } catch {
          // Jika retry tetap gagal, lempar error parsing awal
          throw firstErr;
        }
      } else {
        throw firstErr;
      }
    }

    // 1. Validasi Skema Zod
    const schemaValidation = ArdenaGameSpecSchema.safeParse(parsedJson);
    if (!schemaValidation.success) {
      const errorMap = schemaValidation.error.format();
      throw new OutputValidationError({
        message: 'Struktur JSON hasil AI tidak memenuhi standar GameSpec v1.0.',
        code: 'AI_OUTPUT_SCHEMA_INVALID',
        statusCode: 422,
        details: errorMap,
      });
    }

    const gameSpec = schemaValidation.data;

    // 2. Validasi Capability Allowlist Scratch VM
    const capabilityValidation = validateCapabilities(gameSpec, input.template);
    if (!capabilityValidation.valid) {
      throw new OutputValidationError({
        message: `Ditemukan pelanggaran Capability Allowlist untuk template '${input.template}'.`,
        code: 'VM_WHITELIST_VALIDATION_FAILED',
        statusCode: 422,
        details: capabilityValidation.violations,
      });
    }

    return {
      game: gameSpec,
      meta: {
        provider: rawResponse.provider,
        modelUsed: rawResponse.modelUsed,
        durationMs: rawResponse.durationMs,
        totalTokens: rawResponse.totalTokens,
        requestId: input.requestId,
      },
    };
  }
}
