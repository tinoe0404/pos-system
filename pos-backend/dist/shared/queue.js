"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.salesWorker = exports.salesQueue = void 0;
const bullmq_1 = require("bullmq");
const prisma_1 = __importDefault(require("./prisma"));
const redis_1 = __importStar(require("./redis"));
// Queue configuration
exports.salesQueue = new bullmq_1.Queue('sales-queue', {
    connection: (0, redis_1.getRedisConnectionConfig)(),
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: {
            count: 100, // Keep last 100 completed jobs
        },
        removeOnFail: {
            count: 50, // Keep last 50 failed jobs
        },
    },
});
// Worker function - processes stock deduction
async function processStockDeduction(job) {
    const { saleId, items } = job.data;
    console.log(`🔄 Processing stock deduction for Sale ID: ${saleId}`);
    try {
        // First check if sale exists
        const saleExists = await prisma_1.default.sale.findUnique({
            where: { id: saleId },
        });
        if (!saleExists) {
            console.log(`⚠️  Sale ${saleId} not found in database. Skipping job.`);
            return { success: false, reason: 'Sale not found' };
        }
        // Use transaction to ensure all stock updates succeed or fail together
        await prisma_1.default.$transaction(async (tx) => {
            for (const item of items) {
                // Get current product
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });
                if (!product) {
                    throw new Error(`Product ${item.productId} not found`);
                }
                // Check if sufficient stock
                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`);
                }
                // Decrement stock and record stock movement
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });
                await tx.stockMovement.create({
                    data: {
                        product_id: item.productId,
                        type: 'SALE',
                        quantity_change: -item.quantity,
                        previous_stock: product.stock,
                        new_stock: product.stock - item.quantity,
                        reference_id: saleId,
                        created_by: saleExists.user_id,
                    },
                });
                console.log(`✅ Deducted ${item.quantity} units from ${product.name} (SKU: ${product.sku})`);
            }
            // Update sale status to COMPLETED
            await tx.sale.update({
                where: { id: saleId },
                data: { status: 'COMPLETED' },
            });
            console.log(`✅ Sale ${saleId} completed successfully`);
        });
        // Invalidate product cache
        await redis_1.default.del('all_products');
        console.log('🗑️  Cache INVALIDATED after stock deduction');
        return { success: true, saleId };
    }
    catch (error) {
        console.error(`❌ Failed to process sale ${saleId}:`, error);
        // Try to update sale status to FAILED (but don't fail if sale doesn't exist)
        try {
            const saleExists = await prisma_1.default.sale.findUnique({
                where: { id: saleId },
            });
            if (saleExists) {
                await prisma_1.default.sale.update({
                    where: { id: saleId },
                    data: { status: 'FAILED' },
                });
                console.log(`⚠️  Sale ${saleId} marked as FAILED`);
            }
            else {
                console.log(`⚠️  Sale ${saleId} not found, cannot mark as FAILED`);
            }
        }
        catch (updateError) {
            console.error(`⚠️  Could not update sale status:`, updateError);
        }
        throw error; // This will trigger BullMQ retry mechanism
    }
}
// Create worker instance
exports.salesWorker = new bullmq_1.Worker('sales-queue', processStockDeduction, {
    connection: (0, redis_1.getRedisConnectionConfig)(),
    concurrency: 1, // Single cashier — no concurrency needed
});
// Worker event listeners
exports.salesWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed successfully`);
});
exports.salesWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
});
exports.salesWorker.on('error', (err) => {
    console.error('❌ Worker error:', err);
});
console.log('✅ Sales Worker initialized');
