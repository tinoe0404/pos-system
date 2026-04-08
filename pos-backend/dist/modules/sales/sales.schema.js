"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.salesListResponseSchema = exports.publicReceiptResponseSchema = exports.saleDetailResponseSchema = exports.saleResponseSchema = exports.userInfoSchema = exports.saleItemWithProductSchema = exports.saleItemResponseSchema = exports.salesPaginationSchema = exports.voidSaleSchema = exports.createSaleSchema = exports.saleItemInputSchema = void 0;
const zod_1 = require("zod");
// Input schemas
exports.saleItemInputSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1),
    quantity: zod_1.z.number().int().positive().min(1),
    priceAtSale: zod_1.z.number().positive(),
});
exports.createSaleSchema = zod_1.z.object({
    items: zod_1.z.array(exports.saleItemInputSchema).min(1, 'At least one item is required'),
    paymentMethod: zod_1.z.enum(['CASH', 'ECOCASH', 'TAB']).default('CASH'),
    tabId: zod_1.z.string().optional(),
    discount: zod_1.z.number().min(0).optional(),
});
exports.voidSaleSchema = zod_1.z.object({
    reason: zod_1.z.string().min(1, 'Reason is required'),
    pin: zod_1.z.string().length(4, 'PIN must be 4 digits').optional(),
});
// Pagination query schema
exports.salesPaginationSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'COMPLETED', 'FAILED']).optional(),
    skip: zod_1.z.coerce.number().int().min(0).default(0),
    take: zod_1.z.coerce.number().int().min(1).max(500).default(50),
    from: zod_1.z.string().optional(), // ISO date string — start of range
    to: zod_1.z.string().optional(), // ISO date string — end of range
});
// Output schemas
exports.saleItemResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    sale_id: zod_1.z.string(),
    product_id: zod_1.z.string(),
    quantity: zod_1.z.number(),
    price_at_sale: zod_1.z.string(), // Decimal as string
    productName: zod_1.z.string().optional(),
});
// Extended sale item with product details
exports.saleItemWithProductSchema = zod_1.z.object({
    id: zod_1.z.string(),
    sale_id: zod_1.z.string(),
    product_id: zod_1.z.string(),
    quantity: zod_1.z.number(),
    price_at_sale: zod_1.z.string(),
    product: zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        sku: zod_1.z.string(),
        category: zod_1.z.string().nullable(),
    }),
});
exports.userInfoSchema = zod_1.z.object({
    id: zod_1.z.string(),
    username: zod_1.z.string(),
    role: zod_1.z.enum(['admin', 'cashier']),
});
exports.saleResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    user_id: zod_1.z.string(),
    total: zod_1.z.string(), // Decimal as string
    status: zod_1.z.enum(['PENDING', 'COMPLETED', 'FAILED']),
    payment_method: zod_1.z.enum(['CASH', 'ECOCASH', 'TAB']),
    created_at: zod_1.z.union([zod_1.z.date(), zod_1.z.string()]),
    updated_at: zod_1.z.union([zod_1.z.date(), zod_1.z.string()]),
    items: zod_1.z.array(exports.saleItemResponseSchema).optional(),
    user: exports.userInfoSchema.optional(),
});
// Detailed sale response with product info
exports.saleDetailResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    user_id: zod_1.z.string(),
    total: zod_1.z.string(),
    status: zod_1.z.enum(['PENDING', 'COMPLETED', 'FAILED']),
    created_at: zod_1.z.union([zod_1.z.date(), zod_1.z.string()]),
    updated_at: zod_1.z.union([zod_1.z.date(), zod_1.z.string()]),
    items: zod_1.z.array(exports.saleItemWithProductSchema),
    user: exports.userInfoSchema,
});
// Minimal public receipt schema (no user role/id details needed, just store info if we had it)
exports.publicReceiptResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    total: zod_1.z.string(),
    status: zod_1.z.enum(['PENDING', 'COMPLETED', 'FAILED']),
    payment_method: zod_1.z.enum(['CASH', 'ECOCASH', 'TAB']),
    created_at: zod_1.z.union([zod_1.z.date(), zod_1.z.string()]),
    items: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        quantity: zod_1.z.number(),
        price_at_sale: zod_1.z.string(),
        product: zod_1.z.object({
            name: zod_1.z.string(),
            sku: zod_1.z.string(),
        }),
    })),
    user: zod_1.z.object({
        username: zod_1.z.string(), // Only show cashier name
    }),
});
exports.salesListResponseSchema = zod_1.z.object({
    sales: zod_1.z.array(exports.saleResponseSchema),
    count: zod_1.z.number(),
    pagination: zod_1.z.object({
        skip: zod_1.z.number(),
        take: zod_1.z.number(),
        total: zod_1.z.number().optional(),
    }).optional(),
});
