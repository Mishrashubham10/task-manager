import { Router } from 'express';
import {
  getUserSessions,
  deleteSession,
  deleteMe,
  updateProfileDetails,
  updateEmail,
} from './user.controller';
import { protect } from '../../middlewares/auth.middleware';

const router = Router();

/*
=========== SESSION ROUTES ============
*/

// 🔹 Get all active sessions (devices)
router.get('/sessions', protect, getUserSessions);

// UPDATE PROFILE
router.put('/update-profile', updateProfileDetails);
// UPDATE EMAIL
router.put('/update-email', protect, updateEmail);

// 🔹 Logout from a specific device
router.delete('/sessions/:id', protect, deleteSession);

// DELETE PROFILE
router.delete('/delete-profile', protect, deleteMe);

export default router;