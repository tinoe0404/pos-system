import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
export declare const userResponseSchema: z.ZodObject<{
    id: z.ZodString;
    username: z.ZodString;
    role: z.ZodEnum<["admin", "cashier"]>;
    created_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    username: string;
    id: string;
    role: "admin" | "cashier";
    created_at: Date;
}, {
    username: string;
    id: string;
    role: "admin" | "cashier";
    created_at: Date;
}>;
export declare const authResponseSchema: z.ZodObject<{
    token: z.ZodString;
    user: z.ZodObject<{
        id: z.ZodString;
        username: z.ZodString;
        role: z.ZodEnum<["admin", "cashier"]>;
        created_at: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        username: string;
        id: string;
        role: "admin" | "cashier";
        created_at: Date;
    }, {
        username: string;
        id: string;
        role: "admin" | "cashier";
        created_at: Date;
    }>;
}, "strip", z.ZodTypeAny, {
    token: string;
    user: {
        username: string;
        id: string;
        role: "admin" | "cashier";
        created_at: Date;
    };
}, {
    token: string;
    user: {
        username: string;
        id: string;
        role: "admin" | "cashier";
        created_at: Date;
    };
}>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
//# sourceMappingURL=auth.schema.d.ts.map