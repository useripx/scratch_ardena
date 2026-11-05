import { GenerateGameRequestSchema } from '../../src/validators/request.validator';

describe('Unit Test: GenerateGameRequestSchema (Zod Validator)', () => {
  it('harus berhasil memvalidasi payload yang valid dan lengkap', () => {
    const validPayload = {
      prompt: 'Buat game menangkap koin yang jatuh dari langit.',
      template: 'catching-game',
      language: 'id',
      schemaVersion: '1.0',
    };

    const result = GenerateGameRequestSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.prompt).toBe('Buat game menangkap koin yang jatuh dari langit.');
      expect(result.data.template).toBe('catching-game');
      expect(result.data.language).toBe('id');
      expect(result.data.schemaVersion).toBe('1.0');
    }
  });

  it('harus memberikan nilai default language "id" jika opsional tidak diisi', () => {
    const payloadTanpaBahasa = {
      prompt: 'Petualangan melewati labirin penuh rintangan warna.',
      template: 'maze-game',
      schemaVersion: '1.0',
    };

    const result = GenerateGameRequestSchema.safeParse(payloadTanpaBahasa);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.language).toBe('id');
    }
  });

  it('harus gagal jika prompt kurang dari 5 karakter', () => {
    const payloadPendek = {
      prompt: 'hai',
      template: 'space-shooter',
      schemaVersion: '1.0',
    };

    const result = GenerateGameRequestSchema.safeParse(payloadPendek);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('terlalu pendek');
    }
  });

  it('harus gagal jika prompt hanya berupa spasi kosong', () => {
    const payloadSpasi = {
      prompt: '       ',
      template: 'space-shooter',
      schemaVersion: '1.0',
    };

    const result = GenerateGameRequestSchema.safeParse(payloadSpasi);
    expect(result.success).toBe(false);
  });

  it('harus gagal jika prompt melebihi 1000 karakter', () => {
    const payloadPanjang = {
      prompt: 'A'.repeat(1001),
      template: 'custom',
      schemaVersion: '1.0',
    };

    const result = GenerateGameRequestSchema.safeParse(payloadPanjang);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('terlalu panjang');
    }
  });

  it('harus gagal jika template tidak dikenal', () => {
    const payloadTemplateAsing = {
      prompt: 'Buat game mobil balap di sirkuit jalan raya.',
      template: 'balapan-liar',
      schemaVersion: '1.0',
    };

    const result = GenerateGameRequestSchema.safeParse(payloadTemplateAsing);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Template tidak dikenal');
    }
  });

  it('harus gagal jika schemaVersion bukan "1.0"', () => {
    const payloadSchemaSalah = {
      prompt: 'Buat game menangkap apel jatuh.',
      template: 'catching-game',
      schemaVersion: '2.0',
    };

    const result = GenerateGameRequestSchema.safeParse(payloadSchemaSalah);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('schemaVersion');
    }
  });
});

