import { z } from 'zod';

export const productFormSchema = z.object({
    name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional().or(z.literal('')),
    price: z.number({ required_error: 'Price is required' })
        .positive('Price must be positive')
        .multipleOf(0.01, 'Price must have at most 2 decimal places'),
    stock: z.number({ required_error: 'Stock is required' })
        .int('Stock must be an integer')
        .min(0, 'Stock cannot be negative'),
    sku: z.string().min(1, 'SKU is required').max(100, 'SKU must be less than 100 characters'),
    category: z.string().max(100, 'Category must be less than 100 characters').optional().or(z.literal('')),
    is_active: z.boolean().default(true),
});

export type ProductFormData = z.infer<typeof productFormSchema>;
