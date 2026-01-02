import { z } from 'zod';

// Input schemas
export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
  role: z.enum(['admin', 'cashier']).default('cashier'),
});

export const deactivateUserSchema = z.object({
  id: z.string(),
});

// Output schemas
export const userResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  role: z.enum(['admin', 'cashier']),
  is_active: z.boolean(),
  created_at: z.union([z.date(), z.string()]),
});

export const usersListResponseSchema = z.object({
  users: z.array(userResponseSchema),
  count: z.number(),
});

// TypeScript types
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type UsersListResponse = z.infer<typeof usersListResponseSchema>;