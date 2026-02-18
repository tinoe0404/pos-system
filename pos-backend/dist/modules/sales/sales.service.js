"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.salesService = exports.SalesService = void 0;
const client_1 = require("@prisma/client");
const queue_1 = require("../../shared/queue");
const register_service_1 = require("../register/register.service");
const prisma = new client_1.PrismaClient();
class SalesService {
    /**
     * Create a new sale and queue stock deduction
     */
    async createSale(userId, data) {
        try {
            // Validate all products exist BEFORE creating sale
            const productIds = data.items.map((item) => item.productId);
            const products = await prisma.product.findMany({
                where: {
                    id: {
                        in: productIds,
                    },
                },
            });
            // Check if all products were found
            if (products.length !== productIds.length) {
                const foundIds = products.map((p) => p.id);
                const missingIds = productIds.filter((id) => !foundIds.includes(id));
                throw new Error(`Products not found: ${missingIds.join(', ')}`);
            }
            // Validate stock availability
            for (const item of data.items) {
                const product = products.find((p) => p.id === item.productId);
                if (product && product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
                }
            }
            // Calculate total
            const total = data.items.reduce((sum, item) => sum + item.priceAtSale * item.quantity, 0);
            // Validate Tab if provided
            let tab = null;
            if (data.tabId) {
                tab = await prisma.tab.findUnique({ where: { id: data.tabId } });
                if (!tab)
                    throw new Error('Tab not found');
                if (tab.status !== 'ACTIVE')
                    throw new Error('Tab is not active');
                if (Number(tab.balance) < total) {
                    throw new Error(`Insufficient tab balance. Available: $${Number(tab.balance).toFixed(2)}, Required: $${total.toFixed(2)}`);
                }
            }
            // Create sale with items in a transaction
            const sale = await prisma.$transaction(async (tx) => {
                // Handle Tab Deduction
                if (tab) {
                    const newBalance = Number(tab.balance) - total;
                    await tx.tab.update({
                        where: { id: tab.id },
                        data: {
                            balance: newBalance,
                            status: newBalance <= 0 ? 'EXHAUSTED' : 'ACTIVE',
                        },
                    });
                }
                // Create the sale
                const newSale = await tx.sale.create({
                    data: {
                        user_id: userId,
                        tab_id: data.tabId,
                        total,
                        status: 'PENDING',
                        payment_method: data.tabId ? 'TAB' : data.paymentMethod,
                    },
                });
                // Create tab transaction if using tab
                if (tab) {
                    await tx.tabTransaction.create({
                        data: {
                            tab_id: tab.id,
                            type: 'PURCHASE',
                            amount: total,
                            sale_id: newSale.id,
                            note: 'Purchase from tab',
                        },
                    });
                }
                // Create sale items
                await tx.saleItem.createMany({
                    data: data.items.map((item) => ({
                        sale_id: newSale.id,
                        product_id: item.productId,
                        quantity: item.quantity,
                        price_at_sale: item.priceAtSale,
                    })),
                });
                return newSale;
            });
            console.log(`📝 Sale ${sale.id} created with status PENDING`);
            // Add job to queue for background stock deduction
            try {
                await queue_1.salesQueue.add('process-stock-deduction', {
                    saleId: sale.id,
                    items: data.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                    })),
                }, {
                    jobId: `sale-${sale.id}`, // Unique job ID to prevent duplicates
                });
                console.log(`🚀 Stock deduction job queued for Sale ${sale.id}`);
            }
            catch (queueError) {
                console.error('❌ Failed to queue stock deduction job. Rolling back sale...', queueError);
                // ROLLBACK: Delete the sale if we can't ensure stock deduction
                await prisma.sale.delete({
                    where: { id: sale.id },
                });
                throw new Error('Failed to process sale. System busy, please try again.');
            }
            // Return sale with items
            const saleWithItems = await prisma.sale.findUnique({
                where: { id: sale.id },
                include: {
                    items: true,
                },
            });
            // Record sale in cash register ONLY if NOT a tab sale
            // Tab sales do not increase cash in drawer
            if (!data.tabId) {
                try {
                    await register_service_1.registerService.recordSale(userId, Number(sale.total));
                }
                catch (regError) {
                    console.error('Failed to record sale to register:', regError);
                    // Don't fail the sale, just log error
                }
            }
            return {
                ...saleWithItems,
                total: saleWithItems.total.toString(),
                items: saleWithItems.items.map((item) => ({
                    ...item,
                    price_at_sale: item.price_at_sale.toString(),
                })),
            };
        }
        catch (error) {
            console.error('Error creating sale:', error);
            throw error;
        }
    }
    /**
     * Void a sale validation and processing
     */
    async voidSale(saleId, voidedById, reason) {
        try {
            const sale = await prisma.sale.findUnique({
                where: { id: saleId },
                include: { items: true },
            });
            if (!sale) {
                throw new Error('Sale not found');
            }
            if (sale.status === 'VOIDED') { // Type assertion until Prisma client updates
                throw new Error('Sale is already voided');
            }
            // 1. Transaction to update sale and restore stock
            await prisma.$transaction(async (tx) => {
                // Update sale status
                await tx.sale.update({
                    where: { id: saleId },
                    data: {
                        status: 'VOIDED',
                        void_reason: reason,
                        voided_by_id: voidedById,
                        voided_at: new Date(),
                    }, // Type assertions for new fields
                });
                // Restore stock
                for (const item of sale.items) {
                    await tx.product.update({
                        where: { id: item.product_id },
                        data: {
                            stock: {
                                increment: item.quantity,
                            },
                        },
                    });
                }
            });
            // 2. Record negative sale in register (if open) AND NOT TAB
            if (sale.payment_method === 'TAB' && sale.tab_id) {
                // Refund to tab
                await prisma.$transaction(async (tx) => {
                    await tx.tabTransaction.create({
                        data: {
                            tab_id: sale.tab_id,
                            type: 'REFUND',
                            amount: sale.total,
                            sale_id: sale.id,
                            note: 'Sale voided - amount returned to tab',
                        },
                    });
                    await tx.tab.update({
                        where: { id: sale.tab_id },
                        data: {
                            balance: { increment: sale.total },
                            status: 'ACTIVE', // Reactivate if was EXHAUSTED
                        },
                    });
                });
                console.log(`💳 Refunded to tab ${sale.tab_id}`);
            }
            else {
                // Refund to cash drawer log
                await register_service_1.registerService.recordSale(voidedById, -Number(sale.total));
            }
            console.log(`🚫 Sale ${saleId} voided by ${voidedById}`);
            return true;
        }
        catch (error) {
            console.error('Error voiding sale:', error);
            throw error;
        }
    }
    /**
     * Get sale by ID with product details
     */
    async getSaleById(saleId) {
        try {
            const sale = await prisma.sale.findUnique({
                where: { id: saleId },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    name: true,
                                    category: true,
                                },
                            },
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            username: true,
                            role: true,
                        },
                    },
                },
            });
            if (!sale) {
                return null;
            }
            return {
                ...sale,
                total: sale.total.toString(),
                items: sale.items.map((item) => ({
                    ...item,
                    price_at_sale: item.price_at_sale.toString(),
                    product: item.product,
                })),
            };
        }
        catch (error) {
            console.error('Error fetching sale:', error);
            throw error;
        }
    }
    /**
     * Get all sales with pagination and filters
     */
    async getTodaySales(filters) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const where = {
                created_at: {
                    gte: today,
                    lt: tomorrow,
                },
            };
            if (filters?.userId) {
                where.user_id = filters.userId;
            }
            const sales = await prisma.sale.findMany({
                where,
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            username: true,
                            role: true,
                        },
                    },
                },
                orderBy: {
                    created_at: 'desc',
                },
            });
            return {
                sales: sales.map((sale) => ({
                    ...sale,
                    total: sale.total.toString(),
                    items: sale.items.map((item) => ({
                        ...item,
                        price_at_sale: item.price_at_sale.toString(),
                        product: item.product,
                        productName: item.product?.name,
                    })),
                })),
                count: sales.length,
            };
        }
        catch (error) {
            console.error('Error fetching today\'s sales:', error);
            throw error;
        }
    }
    async getAllSales(filters, pagination) {
        try {
            const where = {};
            if (filters?.userId) {
                where.user_id = filters.userId;
            }
            if (filters?.status) {
                where.status = filters.status;
            }
            // Get total count for pagination
            const total = await prisma.sale.count({ where });
            // Get paginated sales
            const sales = await prisma.sale.findMany({
                where,
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            username: true,
                            role: true,
                        },
                    },
                },
                orderBy: {
                    created_at: 'desc',
                },
                skip: pagination?.skip || 0,
                take: pagination?.take || 20,
            });
            return {
                sales: sales.map((sale) => ({
                    ...sale,
                    total: sale.total.toString(),
                    items: sale.items.map((item) => ({
                        ...item,
                        price_at_sale: item.price_at_sale.toString(),
                        product: item.product,
                        productName: item.product?.name,
                    })),
                })),
                count: sales.length,
                pagination: pagination
                    ? {
                        skip: pagination.skip,
                        take: pagination.take,
                        total,
                    }
                    : undefined,
            };
        }
        catch (error) {
            console.error('Error fetching sales:', error);
            throw error;
        }
    }
}
exports.SalesService = SalesService;
exports.salesService = new SalesService();
