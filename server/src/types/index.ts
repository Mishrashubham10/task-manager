import { Document, Types } from 'mongoose';

// USER INTERFACE - IMPROVE LATER WITH (HYDRATED DOCUMENT)
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
  isDeleted: boolean;
  updatedAt: Date;
  createdAt: Date;
  deletedAt?: Date;

  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

// TASK INTERFACE
export interface ITask extends Document {
  title: string;
  description?: string;

  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';

  dueDate?: Date;

  userId: Types.ObjectId; // owner
  assignedTo?: Types.ObjectId; // assigned user

  owner: Types.ObjectId;
  collaborators?: Types.ObjectId;

  tags: string[];

  completedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  isCompleted?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

// REFRESH TOKEN INTERFACE
export interface IRefreshToken extends Document {
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;

  device: string;
  ipAddress: string;
  userAgent: string;
}

// NOTIFICATION INTERFACE
export interface INotification extends Document {
  userId: Types.ObjectId;
  type:
    | 'TASK_ASSIGNED'
    | 'TASK_UPDATED'
    | 'TASK_DELETED'
    | 'COLLABORATOR_ADDED';
  taskId: Types.ObjectId;
  message: string;
  isRead: boolean;
}