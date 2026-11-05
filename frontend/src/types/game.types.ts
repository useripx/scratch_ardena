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
