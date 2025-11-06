import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const generateRecipeLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 10, // limit each IP to 10 recipe generations per minute
  message: 'Too many recipe generation requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
