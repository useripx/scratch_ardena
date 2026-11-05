import { z } from 'zod';

export const ArdenaGameMetaSchema = z.object({
  title: z
    .string({ required_error: 'Judul game (game.title) wajib diisi' })
    .min(1, 'Judul game tidak boleh kosong')
    .max(60, 'Judul game maksimal 60 karakter'),
  genre: z.enum(['catching-game', 'maze-game', 'maze-adventure', 'space-shooter', 'custom'], {
    required_error: 'Genre game (game.genre) wajib diisi',
  }),
  description: z
    .string({ required_error: 'Deskripsi game (game.description) wajib diisi' })
    .max(250, 'Deskripsi game maksimal 250 karakter'),
});

export const ArdenaDeltaSchema = z.object({
  newSpritesCount: z.number().int().min(0).max(5),
  globalVariablesCount: z.number().int().min(0).max(5),
  sfxCount: z.number().int().min(0).max(5),
  logicBlocksCount: z.number().int().min(0).max(50),
  overwrittenBlocksCount: z.literal(0, {
    errorMap: () => ({ message: 'overwrittenBlocksCount wajib bernilai 0 (Zero Overwrite)' }),
  }),
});

export const ArdenaObjectSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9_]+$/, 'ID objek harus berupa lowercase alphanumeric dan underscore'),
  name: z.string().max(30, 'Nama objek maksimal 30 karakter'),
  role: z.enum(['player', 'obstacle', 'collectible', 'projectile', 'goal'], {
    required_error: 'Role objek tidak valid',
  }),
  initialPosition: z.object({
    x: z.number().min(-240).max(240),
    y: z.number().min(-180).max(180),
  }),
  costumes: z.array(z.string()).max(3).optional(),
});

export const ArdenaVariableSchema = z.object({
  name: z
    .string()
    .regex(/^[a-z0-9_]+$/, 'Nama variabel harus berupa lowercase alphanumeric dan underscore')
    .max(20),
  type: z.enum(['global', 'local']),
  initialValue: z.number(),
});

export const ArdenaRuleSchema = z.object({
  event: z.enum([
    'when_flag_clicked',
    'collision_detected',
    'timer_expired',
    'key_pressed',
  ]),
  actor: z.string().optional(),
  target: z.string().optional(),
  action: z.enum([
    'move_continuous',
    'spawn_repeatedly',
    'bounce_on_edge',
    'play_sound_and_decrease_health',
    'play_sound_and_increase_score',
    'game_over',
    'win_game',
  ]),
  sfx: z
    .enum(['pop.wav', 'chomp.wav', 'explosion.wav', 'laser.wav', 'win.wav'])
    .optional(),
  variableChange: z
    .object({
      name: z.string(),
      amount: z.number(),
    })
    .optional(),
});

export const ArdenaControlSchema = z.object({
  key: z.enum([
    'arrow_left',
    'arrow_right',
    'arrow_up',
    'arrow_down',
    'space',
    'mouse_x',
  ]),
  action: z.enum(['move_x', 'move_y', 'shoot_laser']),
  value: z.number(),
});

export const ArdenaGameSpecSchema = z.object({
  schemaVersion: z.literal('1.0', {
    errorMap: () => ({ message: 'schemaVersion wajib bernilai 1.0' }),
  }),
  game: ArdenaGameMetaSchema,
  delta: ArdenaDeltaSchema,
  objects: z.array(ArdenaObjectSchema).min(1, 'Minimal harus ada 1 objek/sprite').max(5),
  variables: z.array(ArdenaVariableSchema).max(5),
  rules: z.array(ArdenaRuleSchema).max(15),
  controls: z.array(ArdenaControlSchema).max(6),
});

export type ArdenaGameSpec = z.infer<typeof ArdenaGameSpecSchema>;
