import { SupportedGameTemplate } from '../providers/provider.interface';
import { ArdenaGameSpec } from './output.validator';

export interface CapabilityViolation {
  field: string;
  reason: string;
}

export interface CapabilityValidationResult {
  valid: boolean;
  violations: CapabilityViolation[];
}

const TEMPLATE_ALLOWLIST = {
  'catching-game': {
    allowedRoles: new Set(['player', 'collectible', 'obstacle']),
    allowedControls: new Set(['arrow_left', 'arrow_right', 'mouse_x']),
    allowedSfx: new Set(['pop.wav', 'chomp.wav']),
  },
  'maze-adventure': {
    allowedRoles: new Set(['player', 'goal', 'obstacle']),
    allowedControls: new Set(['arrow_up', 'arrow_down', 'arrow_left', 'arrow_right']),
    allowedSfx: new Set(['pop.wav', 'win.wav']),
  },
  'maze-game': {
    allowedRoles: new Set(['player', 'goal', 'obstacle']),
    allowedControls: new Set(['arrow_up', 'arrow_down', 'arrow_left', 'arrow_right']),
    allowedSfx: new Set(['pop.wav', 'win.wav']),
  },
  'space-shooter': {
    allowedRoles: new Set(['player', 'projectile', 'obstacle']),
    allowedControls: new Set(['arrow_left', 'arrow_right', 'space']),
    allowedSfx: new Set(['laser.wav', 'explosion.wav', 'pop.wav']),
  },
  custom: {
    allowedRoles: new Set(['player', 'obstacle', 'collectible', 'projectile', 'goal']),
    allowedControls: new Set([
      'arrow_left',
      'arrow_right',
      'arrow_up',
      'arrow_down',
      'space',
      'mouse_x',
    ]),
    allowedSfx: new Set(['pop.wav', 'chomp.wav', 'explosion.wav', 'laser.wav', 'win.wav']),
  },
};

/**
 * Memeriksa apakah terdapat upaya injeksi kode arbitrer pada data string.
 */
function containsCodeInjection(str: string): boolean {
  const dangerousPatterns = [
    /<script\b[^>]*>/i,
    /javascript:/i,
    /\beval\s*\(/i,
    /\bFunction\s*\(/i,
    /\bprocess\./i,
    /\brequire\s*\(/i,
    /\b__proto__\b/i,
  ];

  return dangerousPatterns.some((pattern) => pattern.test(str));
}

/**
 * Validasi Capability Allowlist terhadap ArdenaGameSpec berdasarkan template game.
 */
export function validateCapabilities(
  spec: ArdenaGameSpec,
  templateKey: SupportedGameTemplate
): CapabilityValidationResult {
  const violations: CapabilityViolation[] = [];
  const allowlist =
    TEMPLATE_ALLOWLIST[templateKey] || TEMPLATE_ALLOWLIST['custom'];

  // 1. Periksa injeksi kode berbahaya pada seluruh payload string
  const rawString = JSON.stringify(spec);
  if (containsCodeInjection(rawString)) {
    violations.push({
      field: 'payload',
      reason:
        'Terdeteksi upaya injeksi kode atau pola berbahaya (Code Injection detected)',
    });
  }

  // 2. Periksa peran objek (roles)
  for (const obj of spec.objects) {
    if (!allowlist.allowedRoles.has(obj.role)) {
      violations.push({
        field: `objects[${obj.id}].role`,
        reason: `Role '${obj.role}' tidak diizinkan pada template '${templateKey}'`,
      });
    }
  }

  // 3. Periksa tombol kontrol (controls)
  for (const ctrl of spec.controls) {
    if (!allowlist.allowedControls.has(ctrl.key)) {
      violations.push({
        field: `controls[${ctrl.key}]`,
        reason: `Tombol kontrol '${ctrl.key}' tidak didukung pada template '${templateKey}'`,
      });
    }
  }

  // 4. Periksa efek suara (sfx) pada rules
  for (let i = 0; i < spec.rules.length; i++) {
    const rule = spec.rules[i];
    if (rule.sfx && !allowlist.allowedSfx.has(rule.sfx)) {
      violations.push({
        field: `rules[${i}].sfx`,
        reason: `Efek suara '${rule.sfx}' tidak diizinkan pada template '${templateKey}'`,
      });
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}
