import { Document, Types } from 'mongoose';

// USER INTERFACE - IMPROVE LATER WITH (HYDRATED DOCUMENT)
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
  updatedAt: Date;
  createdAt: Date;
}

// TASK INTERFACE
export interface ITask extends Document {
  title: string;
  description?: string;

  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';

  dueDate: Date;

  userId: Types.ObjectId; // owner
  assignedTo: Types.ObjectId; // assigned user

  tags: string[];

  createdAt: Date;
  updatedAt: Date;
}