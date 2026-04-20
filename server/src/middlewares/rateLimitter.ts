import rateLimit from 'express-rate-limit';

/*
=========== RATE LIMITER - EXPRES RATE LIMIT ===========
*/
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 MINS
  max: 100, // MAX REQ PER IP
  message: {
    message: 'Too many requests, please try again later',
  },
});

// LOGIN LIMITER
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 max
  message: {
    message: 'Too many login attempts, try again later',
  },
});

// FORGOT PASSWORD LIMITER
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    message: 'Too many password reset requests',
  },
});

// REGISTER LIMITER
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    message: 'Too many accounts created from this IP',
  },
});