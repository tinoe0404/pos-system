import { Queue, Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import redis from './redis';

const prisma = new PrismaClient();

// Queue configuration
export const salesQueue = new Queue('sales-queue', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
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

// Job data type
export type StockDeductionJobData = {
  saleId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};

// Worker function - processes stock deduction
async function processStockDeduction(job: Job<StockDeductionJobData>) {
  const { saleId, items } = job.data;

  console.log(`🔄 Processing stock deduction for Sale ID: ${saleId}`);

  try {
    // First check if sale exists
    const saleExists = await prisma.sale.findUnique({
      where: { id: saleId },
    });

    if (!saleExists) {
      console.log(`⚠️  Sale ${saleId} not found in database. Skipping job.`);
      return { success: false, reason: 'Sale not found' };
    }

    // Use transaction to ensure all stock updates succeed or fail together
    await prisma.$transaction(async (tx) => {
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
          throw new Error(
            `Insufficient stock for product ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`
          );
        }

        // Decrement stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        console.log(
          `✅ Deducted ${item.quantity} units from ${product.name} (SKU: ${product.sku})`
        );
      }

      // Update sale status to COMPLETED
      await tx.sale.update({
        where: { id: saleId },
        data: { status: 'COMPLETED' },
      });

      console.log(`✅ Sale ${saleId} completed successfully`);
    });

    // Invalidate product cache
    await redis.del('all_products');
    console.log('🗑️  Cache INVALIDATED after stock deduction');

    return { success: true, saleId };
  } catch (error: unknown) {
    console.error(`❌ Failed to process sale ${saleId}:`, error);

    // Try to update sale status to FAILED (but don't fail if sale doesn't exist)
    try {
      const saleExists = await prisma.sale.findUnique({
        where: { id: saleId },
      });

      if (saleExists) {
        await prisma.sale.update({
          where: { id: saleId },
          data: { status: 'FAILED' },
        });
        console.log(`⚠️  Sale ${saleId} marked as FAILED`);
      } else {
        console.log(`⚠️  Sale ${saleId} not found, cannot mark as FAILED`);
      }
    } catch (updateError) {
      console.error(`⚠️  Could not update sale status:`, updateError);
    }

    throw error; // This will trigger BullMQ retry mechanism
  }
}

// Create worker instance
export const salesWorker = new Worker<StockDeductionJobData>(
  'sales-queue',
  processStockDeduction,
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
    },
    concurrency: 5, // Process up to 5 jobs concurrently
  }
);

// Worker event listeners
salesWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

salesWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

salesWorker.on('error', (err) => {
  console.error('❌ Worker error:', err);
});

console.log('✅ Sales Worker initialized');