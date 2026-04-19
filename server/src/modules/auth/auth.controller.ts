import { Request, Response } from 'express';
import User from '../user/user.model';
import { generateAccessToken, generateRefreshToken } from './auth.utils';
import RefreshToken from './refreshToken.model';

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
      accessToken,
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
      accessToken,
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
1. Read refreshToken from cookies
2. Hash it (if stored hashed)
3. Find user with that token
4. If not found → reject
5. Generate new access token
6. (optional) rotate refresh token
7. Send new access token
*/

/*
============ LOGOUT CONTROLLER ==============
--- FLOW ---
1. Clear cookie
2. Remove refresh token from DB
*/
export const logout = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (userId) {
      await User.findByIdAndUpdate(userId, {
        refreshToken: null,
      });
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
