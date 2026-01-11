import { z } from 'zod';

export const createUserSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(50),
    password: z.string().min(6, 'Password must be at least 6 characters').max(100),
    role: z.enum(['admin', 'cashier']),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export interface User {
    id: string;
    username: string;
    role: 'admin' | 'cashier';
    is_active: boolean;
    created_at: string;
}
