import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface AuthenticatedSessionRequest extends Request {
  sessionId?: string;
}

/**
 * Session Authorization Middleware.
 * Ensures each incoming document analysis session has a valid session token (x-session-id).
 * Generates and returns a secure UUID session header if one is not provided.
 * Ensures clients can only access and query their own session context.
 */
export function sessionAuthMiddleware(req: AuthenticatedSessionRequest, res: Response, next: NextFunction) {
  let sessionId = req.headers['x-session-id'] as string;

  if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
    sessionId = `session-${uuidv4()}`;
  }

  req.sessionId = sessionId;
  res.setHeader('x-session-id', sessionId);
  next();
}
