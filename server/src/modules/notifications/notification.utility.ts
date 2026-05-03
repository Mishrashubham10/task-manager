import Notification from './notification.model';

export const createNotification = async ({
  userId,
  type,
  taskId,
  message,
}: {
  userId: string;
  type: string;
  taskId?: string;
  message?: string;
}) => {
  try {
    await Notification.create({
      userId,
      type,
      taskId,
      message,
    });
  } catch (error) {
    console.error('Notification error:', error);
  }
};