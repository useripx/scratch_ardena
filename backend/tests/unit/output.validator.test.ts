import validCatching from '../fixtures/game-valid-catching.json';
import validMaze from '../fixtures/game-valid-maze.json';
import validSpace from '../fixtures/game-valid-space.json';
import {
  ArdenaGameSpecSchema,
} from '../../src/validators/output.validator';
import {
  validateCapabilities,
} from '../../src/validators/capability.validator';

describe('Output Schema & Capability Allowlist Validator', () => {
  it('harus meluluskan game Catching valid', () => {
    const parseResult = ArdenaGameSpecSchema.safeParse(validCatching);
    expect(parseResult.success).toBe(true);

    if (parseResult.success) {
      const capResult = validateCapabilities(parseResult.data, 'catching-game');
      expect(capResult.valid).toBe(true);
      expect(capResult.violations).toHaveLength(0);
    }
  });

  it('harus meluluskan game Maze valid', () => {
    const parseResult = ArdenaGameSpecSchema.safeParse(validMaze);
    expect(parseResult.success).toBe(true);

    if (parseResult.success) {
      const capResult = validateCapabilities(parseResult.data, 'maze-adventure');
      expect(capResult.valid).toBe(true);
      expect(capResult.violations).toHaveLength(0);
    }
  });

  it('harus meluluskan game Space Shooter valid', () => {
    const parseResult = ArdenaGameSpecSchema.safeParse(validSpace);
    expect(parseResult.success).toBe(true);

    if (parseResult.success) {
      const capResult = validateCapabilities(parseResult.data, 'space-shooter');
      expect(capResult.valid).toBe(true);
      expect(capResult.violations).toHaveLength(0);
    }
  });

  it('harus menolak jika schemaVersion bukan 1.0', () => {
    const invalid = { ...validCatching, schemaVersion: '2.0' };
    const parseResult = ArdenaGameSpecSchema.safeParse(invalid);
    expect(parseResult.success).toBe(false);
  });

  it('harus menolak jika overwrittenBlocksCount bukan 0 (Pilar Zero Overwrite)', () => {
    const invalid = {
      ...validCatching,
      delta: {
        ...validCatching.delta,
        overwrittenBlocksCount: 3,
      },
    };
    const parseResult = ArdenaGameSpecSchema.safeParse(invalid);
    expect(parseResult.success).toBe(false);
  });

  it('harus menolak jika daftar objects kosong', () => {
    const invalid = { ...validCatching, objects: [] };
    const parseResult = ArdenaGameSpecSchema.safeParse(invalid);
    expect(parseResult.success).toBe(false);
  });

  it('harus mendeteksi pelanggaran allowlist role objek (misal: projectile pada catching-game)', () => {
    const parseResult = ArdenaGameSpecSchema.safeParse(validCatching);
    expect(parseResult.success).toBe(true);

    if (parseResult.success) {
      const modified = {
        ...parseResult.data,
        objects: [
          ...parseResult.data.objects,
          {
            id: 'sprite_laser',
            name: 'Laser',
            role: 'projectile' as const,
            initialPosition: { x: 0, y: 0 },
          },
        ],
      };
      const capResult = validateCapabilities(modified, 'catching-game');
      expect(capResult.valid).toBe(false);
      expect(capResult.violations.some((v) => v.field.includes('role'))).toBe(true);
    }
  });

  it('harus mendeteksi kontrol terlarang untuk template (misal: space pada maze-adventure)', () => {
    const parseResult = ArdenaGameSpecSchema.safeParse(validMaze);
    expect(parseResult.success).toBe(true);

    if (parseResult.success) {
      const modified = {
        ...parseResult.data,
        controls: [
          ...parseResult.data.controls,
          { key: 'space' as const, action: 'shoot_laser' as const, value: 1 },
        ],
      };
      const capResult = validateCapabilities(modified, 'maze-adventure');
      expect(capResult.valid).toBe(false);
      expect(capResult.violations.some((v) => v.field.includes('controls'))).toBe(true);
    }
  });

  it('harus menolak upaya injeksi kode berbahaya (Code Injection)', () => {
    const parseResult = ArdenaGameSpecSchema.safeParse(validCatching);
    expect(parseResult.success).toBe(true);

    if (parseResult.success) {
      const malicious = {
        ...parseResult.data,
        game: {
          ...parseResult.data.game,
          description: 'Game seru <script>alert(1)</script>',
        },
      };
      const capResult = validateCapabilities(malicious, 'catching-game');
      expect(capResult.valid).toBe(false);
      expect(capResult.violations[0].reason).toContain('Code Injection');
    }
  });
});
