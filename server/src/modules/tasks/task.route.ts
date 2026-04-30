import { Router } from 'express';
import {
  createTask,
  deleteTask,
  getTask,
  getTasks,
  updateTask,
} from './task.controller';
import { protect } from '../../middlewares/auth.middleware';

const router = Router();

// ============= TASK ROUTES =============
router.post('/', protect, createTask);
router.get('/', protect, getTasks);
router.get('/:id', protect, getTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);

export default router;