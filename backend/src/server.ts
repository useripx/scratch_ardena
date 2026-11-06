import { createApp } from './app';
import { config } from './config/env';

const app = createApp();

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🚀 Ardena Playground Backend Service Berjalan`);
  console.log(`📡 URL Server   : http://localhost:${config.port}`);
  console.log(`🌐 Lingkungan   : ${config.nodeEnv}`);
  console.log(`🩺 Health Check : http://localhost:${config.port}/api/v1/health`);
  console.log(`====================================================`);
});

/**
 * Penanganan Graceful Shutdown untuk SIGINT dan SIGTERM
 */
function handleShutdown(signal: string): void {
  console.log(`\n[Shutdown] Menerima sinyal ${signal}. Menutup koneksi server secara aman...`);
  server.close(() => {
    console.log('[Shutdown] Server HTTP berhasil ditutup. Proses selesai.');
    process.exit(0);
  });
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

