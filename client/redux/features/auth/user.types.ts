export type UserRole = 'USER' | 'ADMIN';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;

  createdAt: string;
  updatedAt: string;
}