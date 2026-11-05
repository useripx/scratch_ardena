import cors from 'cors';
import { config } from '../config/env';

/**
 * Middleware CORS untuk membatasi origin ke Scratch Editor development server.
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (seperti curl, health check lokal, mobile client)
    if (!origin) {
      return callback(null, true);
    }

    if (config.corsOrigins.includes(origin) || config.nodeEnv === 'development') {
      return callback(null, true);
    }

    callback(new Error(`Akses dari origin ${origin} ditolak oleh kebijakan CORS.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
});

