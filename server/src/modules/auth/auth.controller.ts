import { Request, Response } from 'express';
import User from '../user/user.model';
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetPassword,
  hashedRefreshToken,
} from './auth.utils';
import RefreshToken from './refreshToken.model';
import crypto from 'crypto';
import { sendEmail } from '../../utils/sendEmail';

interface Cookies {
  refreshToken?: string;
}

/*
============ REGISTER CONTROLLER ==============
----- FLOW ----
1. TAKE THE DATA FROM (req.body)
2. VALIDATE THE DATA
3. CHECK FOR EXISTING USER
4. IF IT IS THEN VALIDATE IT
5. HASHED THE PASSWORD (bcryptjs) (hashed - via pre method)
6. CREATE THE USER
7. CREATE ACCESS & REFRESH TOKEN (jsonwebtoken)
8. RETURN THE USER & TOKEN IN RESPONSE AND REFRESH TOKEN IN COOKIES
*/
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'USER' } = req.body;

    // 1. VALIDATION
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required',
      });
    }

    // 2. CHECK EXISTING USER
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        message: 'Email already registered',
      });
    }

    // 3. CREATE USER
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    // 4. GENERATE TOKENS
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 min
    });

    // 👉 (later) store refreshToken in DB or Redis
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      device: req.headers['user-agent'],
    });

    // 5. SET REFRESH TOKEN IN COOKIE
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // ❗ cannot be accessed via JS
      secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
      sameSite: 'lax', // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 6. SAFE USER RESPONSE
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // 7. SEND RESPONSE
    return res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || 'Internal server error',
    });
  }
};

/*
============ LOGIN CONTROLLER ==============
---- FLOW ----
1. Validate input (email, password)
2. Find user (+password)
3. Compare password
4. Generate access token
5. Generate refresh token (raw)
6. Hash refresh token
7. Store in RefreshToken collection
   - userId
   - hashed token
   - expiresAt
   - device, ip, userAgent
8. Send refresh token in cookie
9. Return access token + user
*/
export const login = async (req: Request, res: Response) => {
  try {
    // 1. TAKE THE DATA FROM (req.body)
    const { email, password } = req.body;

    console.log('EMAIL FROM BODY:', email);

    // 2. VALIDATE THE DATA
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    // 3. LOOK FOR EXISTING USER (EMAIL)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password',
    );
    console.log('USER FOUND:', user);
    // 4. VALIDATE EXISTING USER
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 5. COMPARE THE PASSWORDS (bcryptjs)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 6. GENERATE REFRESH AND ACCESS TOKEN (jsonwebtoken)
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 min
    });

    // 5. HASH REFRESH TOKEN

    // 6. SET EXPIRY
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    console.log(req.ip, req.headers['user-agent']);

    // 7. STORE REFRESH TOKEN IN DB
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      device: req.headers['user-agent'],
    });

    // 8. REFRESH TOKEN IN COOKIES ONLY
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // CREATE RESPONSE (later seprate login)
    const userResponse = {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // 9. SEND USER AND ACCESSTOKEN IN RES
    return res.status(200).json({
      message: 'User logged in successfully',
      user: userResponse,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || 'Internal server error',
    });
  }
};

/*
============ REFRESH CONTROLLER ==============
--- FLOW ---
1. Read refresh token from cookies
2. If missing → 401
3. Hash the token
4. Find token in DB
5. Validate:
   - exists
   - not revoked
   - not expired
6. Generate new access token
7. (Optional) rotate refresh token
8. Return new access token

---- TOKEN ROTATION FLOW ----
1. Validate old token
2. Revoke old token
3. Generate new refresh token
4. Store new token
5. Set new cookie
*/
export const refreshToken = async (req: Request, res: Response) => {
  try {
    // 1. GET TOKEN FROM COOKIE
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        message: 'Refresh token missing',
      });
    }

    // 2. HASH TOKEN
    const hashedToken = hashedRefreshToken(token);

    // 3. FIND TOKEN IN DB
    const tokenDoc = await RefreshToken.findOne({
      token: hashedToken,
      isRevoked: false,
    });

    if (!tokenDoc || tokenDoc.isRevoked) {
      return res.status(403).json({
        message: 'Invalid refresh token',
      });
    }

    // 5. CHECK EXPIRY
    if (tokenDoc.expiresAt < new Date()) {
      return res.status(403).json({
        message: 'Refresh token expired',
      });
    }

    // FIND THE ATTACHED USER
    const user = await User.findById(tokenDoc.userId);

    if (!user || user.isDeleted) {
      return res.status(403).json({
        message: 'User not found',
      });
    }

    // TOKEN ROTATION
    tokenDoc.isRevoked = true;
    await tokenDoc.save();

    const newRefreshToken = generateRefreshToken();
    const newHashedToken = hashedRefreshToken(newRefreshToken);

    await RefreshToken.create({
      userId: user._id,
      token: newHashedToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 6. GENERATE NEW ACCESS TOKEN
    const accessToken = generateAccessToken(user);

    // 7. RETURN NEW ACCESS TOKEN
    return res.status(200).json({
      accessToken,
    });
  } catch (error: any) {
    console.error('Refresh token error:', error.message);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

/*
============ FORGOT PASSWORD CONTROLLER ==============
---- FLOW ---
1. Get email
2. Find user
3. Generate reset token
4. Save hashed token + expiry
5. Send email with raw token
*/
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    // 1. GET EMAIL
    const { email } = req.body;

    if (!email) {
      return res.status(401).json({ message: 'Email address is required' });
    }

    // 2. FIND USER
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // 👇 don't reveal if user exists
      return res.status(200).json({
        message: 'If this email exists, a reset link has been sent',
      });
    }

    // 3. GENERATE RESET TOKEN
    const { rawToken, hashedToken } = generateResetPassword();

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    // 🔗 Create reset link
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    // TODO: send email (nodemailer later)
    // EMAIL CONTENT
    const message = `
        <h2>Password Reset</h2>
        <p>Click below to reset your password:</p>
        <a href="${resetURL}">${resetURL}</a>
        <p>This link expires in 10 minutes.</p>
    `;

    // 6. SEND EMAIL
    await sendEmail(user.email, 'Password reset', message);

    console.log('RESET LINK:', resetURL);

    return res.status(200).json({
      message: 'Reset link sent to email',
    });
  } catch (error: any) {
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

/*
============ RESET PASSWORD CONTROLLER ==============
---- FLOW ---
1. Get token from params
2. Hash token
3. Find user with:
   - matching token
   - not expired
4. Update password
5. Remove reset token fields
*/
export const resetPassword = async (req: Request, res: Response) => {
  try {
    let { token } = req.params;
    const { password } = req.body;

    // ✅ 1. TYPE SAFETY (fix your error here)
    if (Array.isArray(token)) {
      token = token[0];
    }

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // ✅ 2. HASH TOKEN
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // ✅ 3. FIND USER
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired token',
      });
    }

    // ✅ 4. VALIDATE PASSWORD (basic improvement)
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long',
      });
    }

    // ✅ 5. UPDATE PASSWORD (assuming pre-save hook hashes it)
    user.password = password;

    // ✅ 6. REMOVE TOKEN FIELDS
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    // ✅ 7. OPTIONAL: invalidate all sessions (if you use JWT/session versioning)
    // user.tokenVersion += 1;

    return res.status(200).json({
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error(error); // ✅ better debugging
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

/*
============ LOGOUT CONTROLLER ==============
--- FLOW ---
1. Clear cookie
2. Remove refresh token from DB
*/
export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.cookies as Cookies;

    if (refreshToken) {
      await RefreshToken.findOneAndUpdate(
        { token: refreshToken },
        {
          isRevoked: true,
          expiresAt: new Date(),
        },
      );
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.status(200).json({
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || 'Internal server error',
    });
  }
};

/*
============ GETME CONTROLLER ==============
--- FLOW ---
1. GET THE USER FROM REQ.USER
2. SEND IT IN RESPONSE
*/
export const getMe = async (req: Request, res: Response) => {
  try {
    // 1. Check if user exists in request (set by protect middleware)
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No user found',
      });
    }

    // 2. Fetch full user from DB
    const user = await User.findById(req.user.userId)
      .select('_id name email role isDelete')
      .lean();

    // 3. Validate user
    if (!user || user.isDeleted) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
      });
    }

    // 4. Send response
    return res.status(200).json({
      success: true,
      message: 'User profile fetched successfully',
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;

    res.status(500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  }
};