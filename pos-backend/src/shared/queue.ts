import { Queue, Worker, Job } from 'bullmq';
import prisma from './prisma';
import redis, { getRedisConnectionConfig } from './redis';
import { memcache } from './memcache';


// Queue configuration
export const salesQueue = new Queue('sales-queue', {
  connection: getRedisConnectionConfig(),
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

    // Fetch all products first without holding a transaction lock
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const queries: any[] = [];

    // Build the query array for the transaction batch
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      // Check if sufficient stock
      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`
        );
      }

      // Query 1: Decrement stock
      queries.push(
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      );

      // Query 2: Record stock movement
      queries.push(
        prisma.stockMovement.create({
          data: {
            product_id: item.productId,
            type: 'SALE',
            quantity_change: -item.quantity,
            previous_stock: product.stock,
            new_stock: product.stock - item.quantity,
            reference_id: saleId,
            created_by: saleExists.user_id,
          },
        })
      );
    }

    // Query 3: Update sale status to COMPLETED
    queries.push(
      prisma.sale.update({
        where: { id: saleId },
        data: { status: 'COMPLETED' },
      })
    );

    // Execute all updates in one atomic batched call (bypasses PgBouncer timeout issues!)
    await prisma.$transaction(queries);
    
    items.forEach(item => {
      const p = products.find(prod => prod.id === item.productId);
      if (p) console.log(`✅ Deducted ${item.quantity} units from ${p.name} (SKU: ${p.sku})`);
    });

    console.log(`✅ Sale ${saleId} completed successfully`);

    // Invalidate product cache
    memcache.del('all_products');
    await redis.del('all_products');

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
    connection: getRedisConnectionConfig(),
    concurrency: 1, // Single cashier — no concurrency needed
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