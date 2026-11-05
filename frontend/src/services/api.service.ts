import {
  ApiClientError,
  CapabilitiesResponse,
  calculateDiffCounters,
  DiffCounters,
  GenerateGameRequest,
  GenerateGameResponse,
  HealthResponse,
} from '../types/game.types';

export interface ApiServiceOptions {
  baseUrl?: string;
  timeoutMs?: number;
  fetchFn?: typeof fetch;
}

export interface GenerateGameResult {
  schemaVersion: '1.0';
  game: GenerateGameResponse['data']['game'];
  diffCounters: DiffCounters;
  meta: GenerateGameResponse['meta'];
}

export class ApiService {
  readonly baseUrl: string;
  readonly timeoutMs: number;
  protected readonly fetchFn: typeof fetch;

  constructor(options?: ApiServiceOptions) {
    const defaultUrl =
      (typeof process !== 'undefined' &&
        (process.env?.REACT_APP_API_URL ||
          process.env?.VITE_API_BASE_URL ||
          process.env?.API_BASE_URL)) ||
      'http://localhost:3001/api/v1';

    this.baseUrl = (options?.baseUrl || defaultUrl).replace(/\/+$/, '');
    this.timeoutMs = options?.timeoutMs ?? 45000;
    const resolvedFetch =
      options?.fetchFn ||
      (typeof fetch !== 'undefined'
        ? fetch
        : typeof globalThis !== 'undefined' && (globalThis as any).fetch
        ? (globalThis as any).fetch
        : (() => Promise.reject(new Error('Fetch API is not available'))) as any);

    this.fetchFn = resolvedFetch;
  }

  /**
   * Memeriksa kesehatan server backend (Health Check).
   */
  async checkHealth(): Promise<HealthResponse['data']> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/health`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw await this.handleErrorResponse(response);
    }

    const json = (await response.json()) as HealthResponse;
    return json.data;
  }

  /**
   * Mengambil daftar kapabilitas resmi (Template game & Schema Version).
   */
  async getCapabilities(): Promise<CapabilitiesResponse['data']> {
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/meta/capabilities`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      throw await this.handleErrorResponse(response);
    }

    const json = (await response.json()) as CapabilitiesResponse;
    return json.data;
  }

  /**
   * Mengirim prompt teks untuk menghasilkan game Scratch terstruktur.
   */
  async generateGame(
    request: GenerateGameRequest,
    options?: { signal?: AbortSignal; timeoutMs?: number }
  ): Promise<GenerateGameResult> {
    const timeout = options?.timeoutMs ?? this.timeoutMs;

    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/games/generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: options?.signal,
      },
      timeout
    );

    if (!response.ok) {
      throw await this.handleErrorResponse(response);
    }

    const json = (await response.json()) as GenerateGameResponse;
    const diffCounters = calculateDiffCounters(json.data.game);

    return {
      schemaVersion: json.data.schemaVersion,
      game: json.data.game,
      diffCounters,
      meta: json.meta,
    };
  }

  /**
   * Helper internal untuk memanggil fetch dengan batas waktu (timeout).
   */
  protected async fetchWithTimeout(
    url: string,
    init?: RequestInit,
    timeoutMs?: number
  ): Promise<Response> {
    const timeout = timeoutMs ?? this.timeoutMs;
    const abortController = new AbortController();
    let timer: NodeJS.Timeout | undefined;

    const customSignal = init?.signal;

    if (customSignal) {
      customSignal.addEventListener('abort', () => abortController.abort());
    }

    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        abortController.abort();
        reject(
          new ApiClientError({
            message: `Permintaan ke server backend melebihi batas waktu ${timeout}ms.`,
            code: 'AI_TIMEOUT',
            statusCode: 504,
            retryable: true,
          })
        );
      }, timeout);
    });

    try {
      const response = await Promise.race([
        this.fetchFn(url, { ...init, signal: abortController.signal }),
        timeoutPromise,
      ]);

      return response as Response;
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        throw err;
      }

      const isAborted =
        (err as Error)?.name === 'AbortError' ||
        String(err).toLowerCase().includes('aborted');

      if (isAborted) {
        throw new ApiClientError({
          message: 'Permintaan dibatalkan oleh pengguna.',
          code: 'REQUEST_ABORTED',
          statusCode: 499,
          retryable: false,
        });
      }

      throw new ApiClientError({
        message:
          'Gagal terhubung ke layanan backend Ardena. Pastikan server di port 3001 sedang aktif.',
        code: 'NETWORK_ERROR',
        statusCode: 0,
        retryable: true,
        details: err instanceof Error ? err.message : String(err),
      });
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }

  /**
   * Helper internal untuk memetakan respons error HTTP dari backend.
   */
  protected async handleErrorResponse(response: Response): Promise<ApiClientError> {
    let errorData: any = null;

    try {
      errorData = await response.json();
    } catch {
      // Abaikan jika respons bukan JSON
    }

    const statusCode = response.status;
    const code = errorData?.error?.code || `HTTP_${statusCode}`;
    const message =
      errorData?.error?.message ||
      `Server mengembalikan status error ${statusCode}.`;
    const retryable =
      typeof errorData?.error?.retryable === 'boolean'
        ? errorData.error.retryable
        : statusCode >= 500;

    // Baca header Retry-After jika tersedia (misal saat HTTP 502 All-Fail)
    const retryAfterHeader = response.headers?.get?.('Retry-After');
    const retryAfterSeconds = retryAfterHeader
      ? parseInt(retryAfterHeader, 10)
      : undefined;

    return new ApiClientError({
      message,
      code,
      statusCode,
      retryable,
      retryAfterSeconds: isNaN(retryAfterSeconds as number)
        ? undefined
        : retryAfterSeconds,
      details: errorData?.error?.details,
    });
  }
}

// Instance singleton default
export const apiService = new ApiService();
