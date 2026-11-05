import { GeminiAdapter } from '../src/providers/gemini/gemini.adapter';
import { GenerateGameInput } from '../src/providers/provider.interface';

async function runSmokeTest(): Promise<void> {
  console.log('====================================================');
  console.log('🧪 Ardena Playground — Controlled Smoke Test: Gemini');
  console.log('====================================================\n');

  try {
    const adapter = new GeminiAdapter();
    console.log(`[INFO] GeminiAdapter diinisialisasi.`);

    const input: GenerateGameInput = {
      prompt: 'Buat game menangkap apel sederhana dengan Scratch',
      template: 'catching-game',
      language: 'id',
      schemaVersion: '1.0',
      requestId: `smoke-${Date.now()}`,
    };

    console.log(`[REQUEST] Mengirim prompt: "${input.prompt}"...`);
    const startTime = Date.now();
    const result = await adapter.generateGame(input);
    const totalTime = Date.now() - startTime;

    console.log('\n[SUCCESS] Pemanggilan Gemini Berhasil!');
    console.log(`- Provider     : ${result.provider}`);
    console.log(`- Model Used   : ${result.modelUsed}`);
    console.log(`- Durasi       : ${result.durationMs} ms (Total: ${totalTime} ms)`);
    console.log(`- Total Tokens : ${result.totalTokens ?? 'N/A'}`);
    console.log(`- Raw Length   : ${result.rawContent.length} karakter`);

    let parsed: unknown;
    try {
      parsed = JSON.parse(result.rawContent);
      console.log('✅ Respons JSON murni dan terurai dengan valid:');
      console.log(JSON.stringify(parsed, null, 2).slice(0, 500) + '...\n');
    } catch {
      console.log('⚠️ Format respons bukan JSON mentah langsung:');
      console.log(result.rawContent.slice(0, 300) + '...\n');
    }

    console.log('====================================================');
    console.log('🎉 Smoke Test Selesai.');
    console.log('====================================================');
  } catch (error: any) {
    console.error('\n❌ Smoke Test Gagal:');
    console.error(`- Kode Error : ${error.code ?? 'UNKNOWN'}`);
    console.error(`- Pesan      : ${error.message}`);
    console.error(`- Retryable  : ${error.retryable ?? false}`);
    console.error(`- Status Code: ${error.statusCode ?? 500}`);
    process.exit(1);
  }
}

if (require.main === module) {
  runSmokeTest();
}

