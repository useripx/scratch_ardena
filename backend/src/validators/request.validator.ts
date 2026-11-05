import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Daftar template game resmi yang didukung pada MVP.
 */
export const SUPPORTED_TEMPLATES = [
  'catching-game',
  'maze-adventure',
  'maze-game',
  'space-shooter',
  'custom',
] as const;

export type SupportedTemplate = (typeof SUPPORTED_TEMPLATES)[number];

/**
 * Skema validasi Zod untuk payload request POST /api/v1/games/generate.
 */
export const GenerateGameRequestSchema = z.object({
  prompt: z
    .string({
      required_error: "Field 'prompt' wajib diisi.",
      invalid_type_error: "Field 'prompt' harus berupa teks (string).",
    })
    .trim()
    .min(5, "Deskripsi prompt terlalu pendek (minimal 5 karakter).")
    .max(1000, "Deskripsi prompt terlalu panjang (maksimum 1.000 karakter)."),
  template: z.enum(SUPPORTED_TEMPLATES, {
    errorMap: () => ({
      message: `Template tidak dikenal. Pilihan yang didukung: ${SUPPORTED_TEMPLATES.join(', ')}.`,
    }),
  }),
  language: z.enum(['id', 'en']).optional().default('id'),
  schemaVersion: z.literal('1.0', {
    errorMap: () => ({
      message: "Versi schema tidak didukung. 'schemaVersion' wajib bernilai '1.0'.",
    }),
  }),
});

export type GenerateGameRequest = z.infer<typeof GenerateGameRequestSchema>;

/**
 * Middleware Express untuk memvalidasi request body pembuatan game.
 * Menolak input invalid secara langsung (fail-fast) dengan status HTTP 400.
 */
export function validateGenerateGameRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = req.id || 'unknown';

  // Verifikasi tipe konten (wajib application/json)
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('application/json')) {
    res.status(415).json({
      success: false,
      error: {
        code: 'UNSUPPORTED_MEDIA_TYPE',
        message: "Header 'Content-Type' wajib bernilai 'application/json'.",
        retryable: false,
      },
      meta: {
        requestId,
      },
    });
    return;
  }

  // Validasi struktur dan aturan body menggunakan Zod
  const result = GenerateGameRequestSchema.safeParse(req.body);

  if (!result.success) {
    const errorDetails = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST_BODY',
        message: 'Permintaan tidak valid. Silakan periksa kembali field yang dikirimkan.',
        retryable: false,
        details: errorDetails,
      },
      meta: {
        requestId,
      },
    });
    return;
  }

  // Simpan data yang telah tervalidasi dan ternormalisasi
  req.body = result.data;
  next();
}

