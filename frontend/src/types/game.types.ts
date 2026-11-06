/**
 * Definisi Type & Interface Resmi Frontend Ardena Playground.
 * Selaras dengan kontrak backend ArdenaGameSpec v1.0.
 */

export type SupportedTemplateKey =
  | 'catching-game'
  | 'maze-adventure'
  | 'maze-game'
  | 'space-shooter'
  | 'custom';

export type SpriteRole =
  | 'player'
  | 'collectible'
  | 'obstacle'
  | 'projectile'
  | 'goal';

export type SpriteControl =
  | 'arrow_left'
  | 'arrow_right'
  | 'arrow_up'
  | 'arrow_down'
  | 'space'
  | 'mouse_x';

export interface SpriteScript {
  trigger: string;
  action: string;
}

export interface GameSprite {
  name: string;
  role: SpriteRole;
  costume: string;
  initialPosition: {
    x: number;
    y: number;
  };
  controls?: SpriteControl[];
  scripts: SpriteScript[];
}

export interface GameVariable {
  name: string;
  initialValue: number;
}

export interface GameRules {
  winCondition: string;
  loseCondition: string;
  timeLimitSeconds?: number;
}

export interface GameLoop {
  stepIntervalMs?: number;
  spawnRateSeconds?: number;
}

export interface ArdenaGameSpec {
  title: string;
  genre: SupportedTemplateKey;
  description: string;
  rules: GameRules;
  sprites: GameSprite[];
  variables: GameVariable[];
  gameLoop?: GameLoop;
  soundEffects: string[];
}

/**
 * Representasi Diff Counters untuk Layar Review Gate (Google Stitch UI 09).
 */
export interface DiffCounters {
  spritesCount: number;
  variablesCount: number;
  sfxCount: number;
  blocksCount: number;
  overwrittenBlocksCount: 0;
}

/**
 * Helper untuk menghitung Diff Counters dari ArdenaGameSpec secara deterministik.
 */
export function calculateDiffCounters(game: ArdenaGameSpec): DiffCounters {
  const blocksCount = game.sprites.reduce(
    (total, sprite) => total + (sprite.scripts ? sprite.scripts.length : 0),
    0
  );

  return {
    spritesCount: game.sprites.length,
    variablesCount: game.variables.length,
    sfxCount: game.soundEffects.length,
    blocksCount,
    overwrittenBlocksCount: 0, // Zero Overwrite Guarantee
  };
}

export interface GenerateGameRequest {
  prompt: string;
  template: SupportedTemplateKey;
  language?: 'id' | 'en';
  schemaVersion: '1.0';
}

export interface GenerateGameResponse {
  success: boolean;
  data: {
    schemaVersion: '1.0';
    game: ArdenaGameSpec;
  };
  meta: {
    provider: string;
    modelUsed: string;
    durationMs: number;
    requestId: string;
  };
}

export interface TemplateCapability {
  key: SupportedTemplateKey;
  name: string;
  genre: string;
  description: string;
  allowedRoles: string[];
  allowedControls: string[];
}

export interface CapabilitiesResponse {
  success: boolean;
  data: {
    supportedSchemaVersions: string[];
    templates: TemplateCapability[];
  };
  meta: {
    requestId: string;
  };
}

export interface HealthResponse {
  success: boolean;
  data: {
    status: string;
    timestamp: string;
    uptime: number;
    service: string;
    version: string;
  };
  meta: {
    requestId: string;
  };
}

export class ApiClientError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly retryable: boolean;
  readonly retryAfterSeconds?: number;
  readonly details?: unknown;

  constructor(params: {
    message: string;
    code: string;
    statusCode: number;
    retryable: boolean;
    retryAfterSeconds?: number;
    details?: unknown;
  }) {
    super(params.message);
    this.name = 'ApiClientError';
    this.code = params.code;
    this.statusCode = params.statusCode;
    this.retryable = params.retryable;
    this.retryAfterSeconds = params.retryAfterSeconds;
    this.details = params.details;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * =========================================================================
 * Sub-Fase FE-05: Entitas & Skema Penyimpanan Lokal IndexedDB
 * =========================================================================
 */

export type ProjectCategory = 'arcade' | 'puzzle' | 'shooter' | 'edukasi' | 'lainnya';

export interface ProjectStats {
  spriteCount: number;
  blockCount: number;
  variableCount: number;
  soundCount: number;
  estimatedSizeBytes: number;
}

export interface StoredProject {
  id: string; // Identifier unik proyek (misal: 'proj-1730800000000-xyz')
  title: string; // Judul proyek (maks 60 karakter)
  category: ProjectCategory;
  tags: string[]; // Contoh: ['Kucing', 'Luar Angkasa', 'AI']
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
  version: string; // Skema versi entitas proyek (default: '1.0')
  gameSpec: ArdenaGameSpec; // Payload spesifikasi game hasil AI
  scratchPayload?: {
    // AST Scratch 3.0 project.json
    targets: unknown[];
    monitors: unknown[];
    meta: { semver: string; vm: string; agent: string };
  };
  thumbnailDataUrl?: string; // Optional snapshot / visual placeholder
  stats: ProjectStats;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  soundEffectsEnabled: boolean;
  autoSaveIntervalSeconds: number; // default: 60
  defaultTemplate: SupportedTemplateKey;
  highContrastMode: boolean;
  aiModelPreference: string;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'light',
  soundEffectsEnabled: true,
  autoSaveIntervalSeconds: 60,
  defaultTemplate: 'catching-game',
  highContrastMode: false,
  aiModelPreference: 'gemini-1.5-flash',
};
