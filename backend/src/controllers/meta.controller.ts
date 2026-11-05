import { Request, Response } from 'express';
import { SUPPORTED_TEMPLATES } from '../validators/request.validator';

/**
 * Controller untuk mengembalikan metadata kapabilitas Scratch Generator MVP.
 * Menampilkan daftar template resmi, batasan ukuran, dan versi skema yang didukung.
 */
export function getCapabilities(req: Request, res: Response): void {
  const requestId = req.id || 'unknown';

  res.status(200).json({
    success: true,
    data: {
      supportedSchemaVersions: ['1.0'],
      maxPromptLength: 500,
      hardPromptLimit: 1000,
      supportedLanguages: ['id', 'en'],
      templates: [
        {
          id: 'catching-game',
          title: 'Catching Game Engine (Tangkap Apel Ajaib)',
          category: 'arcade',
          difficulty: 'pemula',
          estimatedMinutes: 5,
          activeSpritesCount: 3,
          description: 'Tangkap objek buah yang jatuh dari langit dengan keranjang kendali panah/mouse.',
        },
        {
          id: 'maze-game',
          title: 'Maze Adventure Starter (Labirin Keju)',
          category: 'puzzle',
          difficulty: 'pemula',
          estimatedMinutes: 8,
          activeSpritesCount: 2,
          description: 'Navigasi karakter melewati labirin berliku tanpa menabrak warna dinding.',
        },
        {
          id: 'space-shooter',
          title: 'Space Shooter Core (Pertempuran Asteroid Galaksi)',
          category: 'shooter',
          difficulty: 'menengah',
          estimatedMinutes: 12,
          activeSpritesCount: 3,
          description: 'Kendalikan pesawat tempur dan tembak laser untuk menghancurkan rintangan asteroid.',
        },
        {
          id: 'custom',
          title: 'Rancangan Bebas Kustom',
          category: 'sandbox',
          difficulty: 'fleksibel',
          estimatedMinutes: 10,
          activeSpritesCount: 1,
          description: 'Mulai dari kanvas kosong dan biarkan AI merancang logika game berdasarkan instruksimu.',
        },
      ],
      allowedOpcodesCount: 24,
    },
    meta: {
      requestId,
    },
  });
}

