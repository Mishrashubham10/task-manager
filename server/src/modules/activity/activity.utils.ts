import ActivityLog from './activityLog.model';

export const logActivity = async ({
  userId,
  taskId,
  action,
  meta = {},
}: {
  userId: string;
  taskId: string;
  action: string;
  meta?: any;
}) => {
  try {
    await ActivityLog.create({
      userId,
      taskId,
      action,
      meta,
    });
  } catch (error) {
    console.error('Activity log error:', error);
  }
};