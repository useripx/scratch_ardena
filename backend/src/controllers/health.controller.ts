import { Request, Response } from 'express';

const processStartTime = Date.now();

/**
 * Controller untuk pemeriksaan kesiapan server (Health Check).
 * Endpoint ini tidak memanggil AI dan tidak menimbulkan biaya.
 */
export function getHealth(req: Request, res: Response): void {
  const uptimeSeconds = Math.floor((Date.now() - processStartTime) / 1000);

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptimeSeconds,
  });
}

