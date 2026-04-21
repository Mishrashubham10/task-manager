export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  _id: string;
  title: string;
  description?: string;

  priority: TaskPriority;
  status: TaskStatus;

  dueDate?: string;

  userId: string;
  assignedTo?: string;

  tags: string[];

  completedAt?: string;

  createdAt: string;
  updatedAt: string;
}