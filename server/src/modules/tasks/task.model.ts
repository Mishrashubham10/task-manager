import mongoose, { Schema } from 'mongoose';
import { ITask } from '../../types';

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
      type: Date,
    },

    completedAt: {
      type: Date,
    },

    // ✅ SINGLE SOURCE OF TRUTH
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    collaborators: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    tags: {
      type: [String],
      default: [],
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

/*
=========== INDEXES ============
*/
taskSchema.index({ owner: 1, status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({
  owner: 1,
  assignedTo: 1,
  collaborators: 1,
});

const Task = mongoose.model<ITask>('Task', taskSchema);

export default Task;