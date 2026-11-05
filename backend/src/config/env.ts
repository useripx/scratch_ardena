import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Muat berkas .env dari root folder backend jika tersedia
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function resolveKeyFromTemplate(provider: string): string {
  try {
    const templatePath = path.resolve(__dirname, '../../../template/api');
    if (fs.existsSync(templatePath)) {
      const lines = fs
        .readFileSync(templatePath, 'utf8')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      const targetIdx = lines.findIndex((l) =>
        l.toLowerCase().startsWith(provider.toLowerCase())
      );
      if (targetIdx !== -1 && lines[targetIdx + 1]) {
        return lines[targetIdx + 1];
      }
    }
  } catch {
    // Abaikan jika tidak dapat membaca template/api
  }
  return '';
}

export interface AppConfig {
  readonly nodeEnv: string;
  readonly port: number;
  readonly corsOrigins: string[];
  readonly geminiApiKey: string;
  readonly groqApiKey: string;
  readonly openrouterApiKey: string;
  readonly cohereApiKey: string;
  readonly nvidiaApiKey: string;
  readonly sambanovaApiKey: string;
}

export const config: AppConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : ['http://localhost:8601', 'http://localhost:3000'],
  geminiApiKey: process.env.GEMINI_API_KEY || resolveKeyFromTemplate('google'),
  groqApiKey: process.env.GROQ_API_KEY || resolveKeyFromTemplate('groq'),
  openrouterApiKey:
    process.env.OPENROUTER_API_KEY || resolveKeyFromTemplate('openrouter'),
  cohereApiKey: process.env.COHERE_API_KEY || resolveKeyFromTemplate('cohere'),
  nvidiaApiKey: process.env.NVIDIA_API_KEY || resolveKeyFromTemplate('nvidia'),
  sambanovaApiKey:
    process.env.SAMBANOVA_API_KEY || resolveKeyFromTemplate('sambanova'),
};
