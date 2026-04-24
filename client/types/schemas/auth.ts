import { z } from 'zod';
// REGISTER SHCEMA
export const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be atleast 6 characters'),
});

// LOGIN SCHEMA
export const loginSchema = z.object({
  email: z.string().email('Invalid email').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

// TYPES
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;