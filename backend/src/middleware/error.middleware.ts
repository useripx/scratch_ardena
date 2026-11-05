import { NextFunction, Request, Response } from 'express';
import { sanitizeErrorMessage } from '../providers/gemini/gemini.error';

/**
 * Middleware untuk menangani endpoint yang tidak terdaftar (404).
 */
export function notFoundHandler(req: Request, res: Response): void {
  const requestId = req.id || 'unknown';

  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Rute '${req.method} ${req.path}' tidak ditemukan pada server Ardena Backend.`,
      retryable: false,
    },
    meta: {
      requestId,
    },
  });
}

/**
 * Global Error Handler untuk menangkap error secara terpadu.
 * Memetakan AIError / domain error dan menyamarkan error tak terduga.
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const requestId = req.id || 'unknown';

  // Penanganan khusus jika ukuran payload melebihi batas (HTTP 413 Payload Too Large)
  if (
    err?.type === 'entity.too.large' ||
    err?.statusCode === 413 ||
    err?.status === 413
  ) {
    res.status(413).json({
      success: false,
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Ukuran request payload melebihi batas maksimal 10 MB.',
        retryable: false,
      },
      meta: {
        requestId,
      },
    });
    return;
  }

  const statusCode = typeof err?.statusCode === 'number' ? err.statusCode : 500;
  const code = err?.code || 'INTERNAL_SERVER_ERROR';
  const retryable = typeof err?.retryable === 'boolean' ? err.retryable : false;

  const safeMessage = sanitizeErrorMessage(err?.message || '');

  console.error(
    `[Ardena Error] [ReqID: ${requestId}] [Status: ${statusCode}] [Code: ${code}] ${safeMessage}`
  );

  // Jika terjadi pemadaman provider (502 / AI_PROVIDER_UNAVAILABLE), beri header Retry-After
  if (statusCode === 502 || code === 'AI_PROVIDER_UNAVAILABLE') {
    res.setHeader('Retry-After', '15');
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message:
        statusCode >= 500 && !err?.code?.startsWith('AI_')
          ? 'Terjadi kesalahan internal pada layanan backend.'
          : safeMessage || 'Permintaan tidak dapat diproses.',
      retryable,
      details: err?.details,
    },
    meta: {
      requestId,
    },
  });
}
