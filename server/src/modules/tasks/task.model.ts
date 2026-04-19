import mongoose, { Schema } from 'mongoose';
import { ITask } from '../../types';

/*
=========== TASK SCHEMA ============
*/
const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'LOW',
    },

    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'DONE'],
      default: 'TODO',
    },

    dueDate: {
      type: Date, // optional
    },

    completedAt: {
      type: Date,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    tags: {
      type: [String],
      default: [],
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

/*
=========== INDEXES ============
*/
taskSchema.index({ userId: 1, status: 1 }); // fast filtering
taskSchema.index({ dueDate: 1 }); // sorting by deadline

const Task = mongoose.model<ITask>('Task', taskSchema);

export default Task;