import mongoose, { Schema } from 'mongoose';
import { INotification } from '../../types';

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        'TASK_ASSIGNED',
        'TASK_UPDATED',
        'TASK_DELETED',
        'COLLABORATOR_ADDED',
      ],
      required: true,
    },

    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
    },

    message: {
      type: String,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

// 🔥 Index for fast queries
notificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.model<INotification>(
  'Notification',
  notificationSchema,
);

export default Notification;