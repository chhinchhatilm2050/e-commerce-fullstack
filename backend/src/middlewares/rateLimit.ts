import rateLimit from 'express-rate-limit';

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    code: 'RATE_LIMIT_EXCEEDED',
    message:
      'Too many requests from this IP, please try again after 15 minutes.',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    code: 'RATE_LIMIT_EXCEEDED',
    message:
      'Too many authentication requests from this IP, please try again after 15 minutes.',
  },
});

export { globalLimiter, authLimiter };
