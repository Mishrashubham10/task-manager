import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../modules/user/user.model';

// DECODED TOKEN INTERFACE
export interface DecodedToken extends JwtPayload {
  userId: string;
  role: string;
}

/**
 * PROTECT MIDDLEWARE
 * ------------------
 * This middleware:
 * 1. Checks if token exists
 * 2. Verifies JWT
 * 3. Fetches user from DB
 * 4. Attaches user to req.user
 *
 * If anything fails → request is blocked
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeaders = req.headers.authorization;

    if (!authHeaders || !authHeaders.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // EXTRACT THE TOKEN
    const token = authHeaders.split(' ')[1];

    // 2. VERIFY DECODED
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_TOKEN!,
    ) as DecodedToken;

    // 3. FIND THE USER
    const user = await User.findById(decoded.userId).select('_id isDeleted');;
    if (!user || user.isDeleted) {
      return res.status(401).json({
        message: 'User not found or inactive',
      });
    }

    // 4. ATTACH SAFE USER DATA
    req.user = {
      userId: user._id.toString(),
      role: user.role,
    };

    next();
  } catch (error: any) {
    return res.status(401).json({
      message: 'Invalid or expired token',
    });
  }
};

/**
 * AUTHORIZE ROLES
 * ---------------
 * This middleware checks if logged-in user
 * has one of the allowed roles.
 *
 * Usage:
 * authorizeRoles("ADMIN", "SUPER_ADMIN")
 */
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    /**
     * req.user is added by protect middleware
     * So authorizeRoles MUST run AFTER protect
     */
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user?.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: You don't have permission" });
    }

    next();
  };
};