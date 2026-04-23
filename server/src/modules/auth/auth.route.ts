import { Router } from 'express';
import {
  forgotPassword,
  getMe,
  login,
  logout,
  refreshToken,
  register,
  resetPassword,
} from './auth.controller';
import {
  forgotPasswordLimiter,
  loginLimiter,
  registerLimiter,
} from '../../middlewares/rateLimitter';
import { protect } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;