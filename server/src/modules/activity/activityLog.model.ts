import mongoose, { Schema } from 'mongoose';

const activityLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },

    action: {
      type: String,
      enum: [
        'CREATE',
        'UPDATE',
        'DELETE',
        'ASSIGN',
        'ADD_COLLABORATOR',
        'REMOVE_COLLABORATOR',
      ],
      required: true,
    },

    meta: {
      type: Schema.Types.Mixed, // flexible data
    },
  },
  { timestamps: true },
);

export default mongoose.model('ActivityLog', activityLogSchema);