import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

/**
 * Middleware untuk menghasilkan atau meneruskan header X-Request-ID.
 * Membantu penelusuran satu siklus request-response di log.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingId = req.headers['x-request-id'];
  const requestId =
    typeof incomingId === 'string' && incomingId.trim().length > 0
      ? incomingId.trim()
      : uuidv4();

  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}

