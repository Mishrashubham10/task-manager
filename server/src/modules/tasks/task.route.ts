import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  assignTask,
  updateCollaborators,
} from './task.controller';
import { protect } from '../../middlewares/auth.middleware';

const router = Router();

/*
=========== TASK ROUTES ============
*/

// 🔹 Create Task
router.post('/', protect, createTask);

// 🔹 Get All Tasks (with filters + collaboration)
router.get('/', protect, getTasks);

// 🔹 Get Single Task
router.get('/:id', protect, getTask);

// 🔹 Update Task
router.put('/:id', protect, updateTask);

// 🔹 Delete Task (soft delete)
router.delete('/:id', protect, deleteTask);

// 🔹 Assign Task
router.patch('/:id/assign', protect, assignTask);

// 🔹 Update Collaborators
router.patch('/:id/collaborators', protect, updateCollaborators);

export default router;