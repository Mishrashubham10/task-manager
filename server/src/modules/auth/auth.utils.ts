import jwt from 'jsonwebtoken';
import { IUser } from '../../types';
import crypto, { randomUUID } from 'crypto';

/**
 * GENERATE ACCESS TOKEN (JWT)
 */
export const generateAccessToken = (user: IUser) => {
  if (!process.env.JWT_ACCESS_TOKEN) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    process.env.JWT_ACCESS_TOKEN,
    {
      expiresIn: '15m',
    },
  );
};

/**
 * GENERATE REFRESH TOKEN
 * (Better stored in DB)
 */
export const generateRefreshToken = () => {
  return randomUUID(); // good for opaque token strategy
};

export const hashedRefreshToken = (token: string) => {
  return crypto
    .createHash('sha256')
    .update(token + process.env.REFRESH_TOKEN_SECRET)
    .digest('hex');
};