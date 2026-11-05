import { ProviderManager } from '../src/providers/provider.manager';
import { GenerateGameInput } from '../src/providers/provider.interface';

async function runLiveTest(): Promise<void> {
  console.log('================================================================');
  console.log('🧪 Ardena Playground — Hexa-Cluster Live Smoke Test');
  console.log('================================================================\n');

  try {
    const manager = new ProviderManager();
    const input: GenerateGameInput = {
      prompt: 'Buat game labirin sederhana dengan Scratch 3.0',
      template: 'maze-adventure',
      language: 'id',
      schemaVersion: '1.0',
      requestId: `live-smoke-${Date.now()}`,
    };

    console.log(`[REQUEST] Mengirim prompt ke Provider Manager: "${input.prompt}"...`);
    const startTime = Date.now();
    const result = await manager.generateGame(input);
    const totalDuration = Date.now() - startTime;

    console.log('\n[SUCCESS] Inferensi AI Berhasil Ditangani!');
    console.log(`- Provider Berhasil : ${result.provider}`);
    console.log(`- Model Digunakan   : ${result.modelUsed}`);
    console.log(`- Durasi Provider   : ${result.durationMs} ms`);
    console.log(`- Total Waktu Alur  : ${totalDuration} ms`);
    console.log(`- Total Tokens      : ${result.totalTokens ?? 'N/A'}`);
    console.log(`- Panjang Output    : ${result.rawContent.length} karakter`);

    console.log('\n[CUPLIKAN OUTPUT JSON]:');
    console.log(result.rawContent.slice(0, 400) + '...\n');

    console.log('================================================================');
    console.log('🎉 Smoke Test Selesai.');
    console.log('================================================================');
  } catch (error: any) {
    console.error('\n❌ Smoke Test Gagal:');
    console.error(`- Kode Error : ${error.code ?? 'UNKNOWN'}`);
    console.error(`- Pesan      : ${error.message}`);
    console.error(`- Status Code: ${error.statusCode ?? 500}`);
    process.exit(1);
  }
}

if (require.main === module) {
  runLiveTest();
}

