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

  tags: string[];

  completedAt?: Date;
  isDeleted: boolean;

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
