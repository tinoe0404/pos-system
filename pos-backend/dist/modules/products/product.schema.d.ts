import { z } from 'zod';
export declare const createProductSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodNumber;
    stock: z.ZodDefault<z.ZodNumber>;
    sku: z.ZodString;
    category: z.ZodOptional<z.ZodString>;
    is_active: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    price: number;
    stock: number;
    sku: string;
    is_active: boolean;
    description?: string | undefined;
    category?: string | undefined;
}, {
    name: string;
    price: number;
    sku: string;
    description?: string | undefined;
    stock?: number | undefined;
    category?: string | undefined;
    is_active?: boolean | undefined;
}>;
export declare const updateProductSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodNumber>;
    stock: z.ZodOptional<z.ZodNumber>;
    sku: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    is_active: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    price?: number | undefined;
    stock?: number | undefined;
    sku?: string | undefined;
    category?: string | undefined;
    is_active?: boolean | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    price?: number | undefined;
    stock?: number | undefined;
    sku?: string | undefined;
    category?: string | undefined;
    is_active?: boolean | undefined;
}>;
export declare const productResponseSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    price: z.ZodString;
    stock: z.ZodNumber;
    sku: z.ZodString;
    category: z.ZodNullable<z.ZodString>;
    is_active: z.ZodBoolean;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: Date;
    name: string;
    description: string | null;
    price: string;
    stock: number;
    sku: string;
    category: string | null;
    is_active: boolean;
    updated_at: Date;
}, {
    id: string;
    created_at: Date;
    name: string;
    description: string | null;
    price: string;
    stock: number;
    sku: string;
    category: string | null;
    is_active: boolean;
    updated_at: Date;
}>;
export declare const productsListResponseSchema: z.ZodObject<{
    products: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodNullable<z.ZodString>;
        price: z.ZodString;
        stock: z.ZodNumber;
        sku: z.ZodString;
        category: z.ZodNullable<z.ZodString>;
        is_active: z.ZodBoolean;
        created_at: z.ZodDate;
        updated_at: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        created_at: Date;
        name: string;
        description: string | null;
        price: string;
        stock: number;
        sku: string;
        category: string | null;
        is_active: boolean;
        updated_at: Date;
    }, {
        id: string;
        created_at: Date;
        name: string;
        description: string | null;
        price: string;
        stock: number;
        sku: string;
        category: string | null;
        is_active: boolean;
        updated_at: Date;
    }>, "many">;
    count: z.ZodNumber;
    cached: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    products: {
        id: string;
        created_at: Date;
        name: string;
        description: string | null;
        price: string;
        stock: number;
        sku: string;
        category: string | null;
        is_active: boolean;
        updated_at: Date;
    }[];
    count: number;
    cached?: boolean | undefined;
}, {
    products: {
        id: string;
        created_at: Date;
        name: string;
        description: string | null;
        price: string;
        stock: number;
        sku: string;
        category: string | null;
        is_active: boolean;
        updated_at: Date;
    }[];
    count: number;
    cached?: boolean | undefined;
}>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductResponse = z.infer<typeof productResponseSchema>;
export type ProductsListResponse = z.infer<typeof productsListResponseSchema>;
//# sourceMappingURL=product.schema.d.ts.map