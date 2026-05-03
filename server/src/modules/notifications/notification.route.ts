import { Router } from 'express';
import {
  getNotifications,
  markAllRead,
  markNotificationAsRead,
} from './notification.controller';
import { protect } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', protect, getNotifications);
router.patch('/:id/read', protect, markNotificationAsRead);
router.patch('/read-all', protect, markAllRead);

export default router;