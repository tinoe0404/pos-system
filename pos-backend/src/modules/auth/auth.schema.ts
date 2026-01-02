import { z } from 'zod';

// Input schemas
export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
});

// Output schemas
export const userResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  role: z.enum(['admin', 'cashier']),
  created_at: z.date(),
});

// Simplified /me response (only id, username, role)
export const meResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  role: z.enum(['admin', 'cashier']),
});

export const authResponseSchema = z.object({
  token: z.string(),
  user: userResponseSchema,
});

// TypeScript types
export type LoginInput = z.infer<typeof loginSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;