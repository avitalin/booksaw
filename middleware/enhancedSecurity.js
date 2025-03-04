import { rateLimit } from 'express-rate-limit';
import csrf from 'csurf';

export const enhancedSecurity = {
  // CSRF Protection
  csrfProtection: csrf({ cookie: true }),
  
  // Advanced Rate Limiting
  advancedRateLimiter: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip + req.headers['user-agent']
  }),
  
  // Request Validation
  validateRequest: (schema) => {
    return (req, res, next) => {
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message
        });
      }
      next();
    };
  }
}; 