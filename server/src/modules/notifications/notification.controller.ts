import { Request, Response } from 'express';
import Notification from './notification.model';

/*
============== GET NOTIFICATIONS - CONTROLLER =============
---- FLOW ----
*/
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const notifications = await Notification.find({
      userId,
    })
      .sort('-createdAt')
      .limit(20);

    return res.status(200).json({
      notifications,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

/*
============== MARK AS READ NOTIFICATION - CONTROLLER =============
---- FLOW ----
*/
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      {
        _id: id,
        userId,
      },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found',
      });
    }

    return res.status(200).json({
      message: 'Notification marked as read',
    });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

/*
============== MARK AS READ NOTIFICATIONS - CONTROLLER =============
---- FLOW ----
*/
export const markAllRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    const result = await Notification.updateMany(
      {
        userId,
        isRead: false,
      },
      { isRead: true },
    );

    return res.status(200).json({
      message: 'All notifications marked as read',
      updatedCount: result.modifiedCount,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};