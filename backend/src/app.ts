import express, { Express } from 'express';
import { corsMiddleware } from './middleware/cors.middleware';
import { requestIdMiddleware } from './middleware/request-id.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import healthRoutes from './routes/health.routes';
import metaRoutes from './routes/meta.routes';
import gameRoutes from './routes/game.routes';

/**
 * Factory function untuk membuat instance Express App.
 * Dipisahkan dari listen server agar mudah diuji dengan Supertest.
 */
export function createApp(): Express {
  const app = express();

  // Middleware Global
  app.use(requestIdMiddleware);
  app.use(corsMiddleware);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Pendaftaran Rute API v1
  app.use('/api/v1', healthRoutes);
  app.use('/api/v1', metaRoutes);
  app.use('/api/v1', gameRoutes);

  // Penanganan Rute Tidak Ditemukan & Global Error
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

