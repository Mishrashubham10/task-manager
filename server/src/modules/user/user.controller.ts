import { Request, Response } from 'express';
import User from './user.model';
import RefreshToken from '../auth/refreshToken.model';

/*
============ UPDATE EMAIL CONTROLLER ==============
----- FLOW ----
1. User requests email change
2. Send verification link
3. Confirm → update email
*/
export const updateEmail = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { email } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: 'Email already in use',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { email: email.toLowerCase() },
      { new: true },
    ).select('-password');

    return res.status(200).json({
      message: 'Email updated successfully',
      user,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

/*
============ GET USER SESSIONS CONTROLLER ==============
----- FLOW ----
*/
export const getUserSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const sessions = await RefreshToken.find({
      userId,
      isRevoked: true,
    }).sort('-createdAt');

    return res.status(200).json({
      sessions,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

/*
============ DELETE SESSION CONTROLLER ==============
----- FLOW ----
*/
export const deleteSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const session = await RefreshToken.findOne({
      _id: id,
      userId,
    });

    if (!session) {
      return res.status(404).json({
        message: 'Session not found',
      });
    }

    session.isRevoked = true;
    await session.save();

    return res.status(200).json({
      message: 'Session revoked',
    });
  } catch (error: any) {
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

/*
============ UPDATE-PROFILE CONTROLLER ==============
----- FLOW ----
1. Soft delete user
2. Revoke all sessions
3. Clear cookie
*/
export const updateProfileDetails = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { name } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const updates: any = {};

    if (name) updates.name = name;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: 'No valid fields to update',
      });
    }

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    return res.status(200).json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (err: any) {
    console.error('Update profile error:', err.message);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

/*
============ DELETE-ME CONTROLLER ==============
----- FLOW ----
1. Soft delete user
2. Revoke all sessions
3. Clear cookie
*/
export const deleteMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const user = await User.findById(userId);

    if (!user || user.isDeleted) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // 🔹 Soft delete
    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    // 🔹 Revoke all sessions
    await RefreshToken.updateMany({ userId }, { isRevoked: true });

    // 🔹 Clear cookie
    res.clearCookie('refreshToken');

    return res.status(200).json({
      message: 'Account deleted successfully',
    });
  } catch (err: any) {
    console.error('Delete account error:', err.message);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};