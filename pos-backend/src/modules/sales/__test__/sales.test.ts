import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildApp } from '../../../app';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { FastifyInstance } from 'fastify';
import redis from '../../../shared/redis';
import { salesWorker, salesQueue } from '../../../shared/queue';

const prisma = new PrismaClient();
let app: FastifyInstance;
let cashierToken: string;
let testProductId: string;
let testCashierId: string;

const TEST_CASHIER = {
  username: 'test_cashier_sales',
  password: 'cashier123',
  role: 'cashier' as const,
};

const TEST_PRODUCT = {
  name: 'Test Product for Sales',
  description: 'A test product',
  price: 50.0,
  stock: 100,
  sku: 'TEST-SALES-001',
  category: 'Test',
};

describe('Sales Module', () => {
  beforeAll(async () => {
    // Clear the queue before starting tests
    await salesQueue.obliterate({ force: true });
    
    app = await buildApp();
    await app.ready();

    // Clean up test data - DELETE SALES FIRST, then users and products
    const existingUser = await prisma.user.findUnique({
      where: { username: TEST_CASHIER.username },
    });

    if (existingUser) {
      // Delete sales and sale items first
      await prisma.sale.deleteMany({
        where: { user_id: existingUser.id },
      });
    }

    // Now safe to delete user
    await prisma.user.deleteMany({
      where: { username: TEST_CASHIER.username },
    });

    await prisma.product.deleteMany({
      where: { sku: TEST_PRODUCT.sku },
    });

    // Create test cashier
    const cashierHash = await bcrypt.hash(TEST_CASHIER.password, 10);
    const cashier = await prisma.user.create({
      data: {
        username: TEST_CASHIER.username,
        password_hash: cashierHash,
        role: TEST_CASHIER.role,
      },
    });
    testCashierId = cashier.id;

    // Get cashier token
    const cashierLoginResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        username: TEST_CASHIER.username,
        password: TEST_CASHIER.password,
      },
    });
    cashierToken = JSON.parse(cashierLoginResponse.body).token;

    // Create test product
    const product = await prisma.product.create({
      data: TEST_PRODUCT,
    });
    testProductId = product.id;
  });

  beforeEach(async () => {
    // Reset product stock
    await prisma.product.update({
      where: { id: testProductId },
      data: { stock: 100 },
    });

    // Clear sales for this user
    await prisma.sale.deleteMany({
      where: {
        user_id: testCashierId,
      },
    });

    // Drain any pending jobs
    await salesQueue.drain();
  });

  afterAll(async () => {
    // Clean up - DELETE IN CORRECT ORDER
    // 1. Delete sales (this will cascade to sale_items)
    await prisma.sale.deleteMany({
      where: {
        user_id: testCashierId,
      },
    });

    // 2. Delete product
    await prisma.product.deleteMany({
      where: { sku: TEST_PRODUCT.sku },
    });

    // 3. Delete user
    await prisma.user.deleteMany({
      where: { username: TEST_CASHIER.username },
    });

    // 4. Clean queue
    await salesQueue.obliterate({ force: true });

    // 5. Close connections
    await salesWorker.close();
    await redis.quit();
    await prisma.$disconnect();
    await app.close();
  });

  it('[TEST 1] Authenticated Cashier can submit a sale (Expect 201)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/sales',
      headers: {
        authorization: `Bearer ${cashierToken}`,
      },
      payload: {
        items: [
          {
            productId: testProductId,
            quantity: 5,
            priceAtSale: 50.0,
          },
        ],
      },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('id');
    expect(body.status).toBe('PENDING');
    expect(parseFloat(body.total)).toBe(250.0); // 5 * 50
    expect(body.items).toHaveLength(1);
  });

  it('[TEST 2] Verify that after the sale, the Sale exists in the DB', async () => {
    // Create a sale
    const response = await app.inject({
      method: 'POST',
      url: '/api/sales',
      headers: {
        authorization: `Bearer ${cashierToken}`,
      },
      payload: {
        items: [
          {
            productId: testProductId,
            quantity: 3,
            priceAtSale: 50.0,
          },
        ],
      },
    });

    const saleId = JSON.parse(response.body).id;

    // Verify sale exists in database
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: { items: true },
    });

    expect(sale).not.toBeNull();
    expect(sale?.items).toHaveLength(1);
    expect(sale?.items[0].quantity).toBe(3);
  });

  it('[TEST 3] Verify that the Stock actually went down after processing', async () => {
    // Get initial stock
    const productBefore = await prisma.product.findUnique({
      where: { id: testProductId },
    });
    const initialStock = productBefore!.stock;
    console.log(`📊 Initial stock: ${initialStock}`);

    // Create a sale
    const response = await app.inject({
      method: 'POST',
      url: '/api/sales',
      headers: {
        authorization: `Bearer ${cashierToken}`,
      },
      payload: {
        items: [
          {
            productId: testProductId,
            quantity: 10,
            priceAtSale: 50.0,
          },
        ],
      },
    });

    expect(response.statusCode).toBe(201);
    const saleId = JSON.parse(response.body).id;

    // Wait for worker to process the job
    console.log('⏳ Waiting for worker to process stock deduction...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Check stock after processing
    const productAfter = await prisma.product.findUnique({
      where: { id: testProductId },
    });
    const finalStock = productAfter!.stock;
    console.log(`📊 Final stock: ${finalStock}`);

    // Verify stock was decremented
    expect(finalStock).toBe(initialStock - 10);

    // Verify sale status is COMPLETED
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
    });
    expect(sale?.status).toBe('COMPLETED');
  });

  it('Should fail to create sale with non-existent product', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/sales',
      headers: {
        authorization: `Bearer ${cashierToken}`,
      },
      payload: {
        items: [
          {
            productId: 'non-existent-id',
            quantity: 5,
            priceAtSale: 50.0,
          },
        ],
      },
    });
  
    // Should return 404 because product doesn't exist
    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Not found');
    expect(body.message).toContain('Products not found');
  });

  it('Should get all sales for the authenticated cashier', async () => {
    // Create a sale
    await app.inject({
      method: 'POST',
      url: '/api/sales',
      headers: {
        authorization: `Bearer ${cashierToken}`,
      },
      payload: {
        items: [
          {
            productId: testProductId,
            quantity: 2,
            priceAtSale: 50.0,
          },
        ],
      },
    });

    // Wait a bit for sale to be created
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get all sales
    const response = await app.inject({
      method: 'GET',
      url: '/api/sales',
      headers: {
        authorization: `Bearer ${cashierToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.sales).toBeInstanceOf(Array);
    expect(body.count).toBeGreaterThan(0);
  });

  it('Should get sale by ID', async () => {
    // Create a sale
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/sales',
      headers: {
        authorization: `Bearer ${cashierToken}`,
      },
      payload: {
        items: [
          {
            productId: testProductId,
            quantity: 1,
            priceAtSale: 50.0,
          },
        ],
      },
    });

    const saleId = JSON.parse(createResponse.body).id;

    // Get sale by ID
    const response = await app.inject({
      method: 'GET',
      url: `/api/sales/${saleId}`,
      headers: {
        authorization: `Bearer ${cashierToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.id).toBe(saleId);
    expect(body.items).toHaveLength(1);
  });
});