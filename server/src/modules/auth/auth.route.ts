import { Router } from 'express';
import {
  forgotPassword,
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

const router = Router();

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/logout', logout);

export default router;