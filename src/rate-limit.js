import rateLimit from 'express-rate-limit';
import { NO_RESPONSE } from './no.js';

export function createRateLimitMiddleware(config) {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).type('text/plain').send(NO_RESPONSE);
    }
  });
}
