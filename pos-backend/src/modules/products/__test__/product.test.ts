import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildApp } from '../../../app';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { FastifyInstance } from 'fastify';
import redis from '../../../shared/redis';

const prisma = new PrismaClient();
let app: FastifyInstance;
let adminToken: string;
let cashierToken: string;
let testProductId: string;

const TEST_ADMIN = {
  username: 'test_admin_products',
  password: 'admin123',
  role: 'admin' as const,
};

const TEST_CASHIER = {
  username: 'test_cashier_products',
  password: 'cashier123',
  role: 'cashier' as const,
};

const TEST_PRODUCT = {
  name: 'Test Product',
  description: 'A test product',
  price: 99.99,
  stock: 100,
  sku: 'TEST-SKU-001',
  category: 'Electronics',
};

describe('Products Module', () => {
  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    // Clean up test users
    await prisma.user.deleteMany({
      where: {
        username: {
          in: [TEST_ADMIN.username, TEST_CASHIER.username],
        },
      },
    });

    // Create test admin
    const adminHash = await bcrypt.hash(TEST_ADMIN.password, 10);
    await prisma.user.create({
      data: {
        username: TEST_ADMIN.username,
        password_hash: adminHash,
        role: TEST_ADMIN.role,
      },
    });

    // Create test cashier
    const cashierHash = await bcrypt.hash(TEST_CASHIER.password, 10);
    await prisma.user.create({
      data: {
        username: TEST_CASHIER.username,
        password_hash: cashierHash,
        role: TEST_CASHIER.role,
      },
    });

    // Get admin token
    const adminLoginResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        username: TEST_ADMIN.username,
        password: TEST_ADMIN.password,
      },
    });
    adminToken = JSON.parse(adminLoginResponse.body).token;

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
  });

  beforeEach(async () => {
    // Clear cache before each test
    await redis.del('all_products');
    
    // Clean up test products
    await prisma.product.deleteMany({
      where: {
        sku: {
          startsWith: 'TEST-SKU',
        },
      },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.product.deleteMany({
      where: {
        sku: {
          startsWith: 'TEST-SKU',
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        username: {
          in: [TEST_ADMIN.username, TEST_CASHIER.username],
        },
      },
    });

    await redis.quit();
    await prisma.$disconnect();
    await app.close();
  });

  it('[TEST 1] Admin should successfully create a product (Expect 201)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/products',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: TEST_PRODUCT,
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('id');
    expect(body.name).toBe(TEST_PRODUCT.name);
    expect(body.sku).toBe(TEST_PRODUCT.sku);
    expect(parseFloat(body.price)).toBe(TEST_PRODUCT.price);

    // Save product ID for other tests
    testProductId = body.id;
  });

  it('[TEST 2] Cashier should successfully read products (Expect 200)', async () => {
    // First create a product as admin
    await app.inject({
      method: 'POST',
      url: '/api/products',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: TEST_PRODUCT,
    });

    // Now cashier tries to read
    const response = await app.inject({
      method: 'GET',
      url: '/api/products',
      headers: {
        authorization: `Bearer ${cashierToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('products');
    expect(body).toHaveProperty('count');
    expect(Array.isArray(body.products)).toBe(true);
    expect(body.count).toBeGreaterThan(0);
  });

  it('[TEST 3] Cashier should NOT be able to create a product (Expect 403)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/products',
      headers: {
        authorization: `Bearer ${cashierToken}`,
      },
      payload: {
        ...TEST_PRODUCT,
        sku: 'TEST-SKU-CASHIER',
      },
    });

    expect(response.statusCode).toBe(403);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Forbidden');
  });

  it('[TEST 4] Cache Check: Second GET should come from Redis (Prisma called ONLY ONCE)', async () => {
    // Create a product first
    await app.inject({
      method: 'POST',
      url: '/api/products',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: TEST_PRODUCT,
    });

    // First request - should hit database
    const firstResponse = await app.inject({
      method: 'GET',
      url: '/api/products',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    expect(firstResponse.statusCode).toBe(200);
    const firstBody = JSON.parse(firstResponse.body);
    expect(firstBody.cached).toBe(false); // First hit = DB

    // Second request - should hit cache
    const secondResponse = await app.inject({
      method: 'GET',
      url: '/api/products',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    expect(secondResponse.statusCode).toBe(200);
    const secondBody = JSON.parse(secondResponse.body);
    expect(secondBody.cached).toBe(true); // Second hit = Redis Cache
    
    // Verify data is the same
    expect(secondBody.products.length).toBe(firstBody.products.length);
  });

  it('Should invalidate cache after creating a product', async () => {
    // Create first product
    await app.inject({
      method: 'POST',
      url: '/api/products',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: TEST_PRODUCT,
    });

    // Get products (cache it)
    const firstGetResponse = await app.inject({
      method: 'GET',
      url: '/api/products',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });
    const firstBody = JSON.parse(firstGetResponse.body);
    const firstCount = firstBody.count;

    // Create another product (should invalidate cache)
    await app.inject({
      method: 'POST',
      url: '/api/products',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: {
        ...TEST_PRODUCT,
        sku: 'TEST-SKU-002',
        name: 'Test Product 2',
      },
    });

    // Get products again (should be fresh from DB)
    const secondGetResponse = await app.inject({
      method: 'GET',
      url: '/api/products',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });
    const secondBody = JSON.parse(secondGetResponse.body);
    
    expect(secondBody.cached).toBe(false); // Cache was invalidated
    expect(secondBody.count).toBe(firstCount + 1); // New product added
  });

  it('Should successfully update a product', async () => {
    // Create product
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/products',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: TEST_PRODUCT,
    });
    const productId = JSON.parse(createResponse.body).id;

    // Update product
    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/products/${productId}`,
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: {
        name: 'Updated Product Name',
        price: 199.99,
      },
    });

    expect(updateResponse.statusCode).toBe(200);
    const body = JSON.parse(updateResponse.body);
    expect(body.name).toBe('Updated Product Name');
    expect(parseFloat(body.price)).toBe(199.99);
  });

  it('Should successfully delete a product', async () => {
    // Create product
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/products',
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: TEST_PRODUCT,
    });
    const productId = JSON.parse(createResponse.body).id;

    // Delete product
    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/products/${productId}`,
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    expect(deleteResponse.statusCode).toBe(204);

    // Verify product is deleted
    const getResponse = await app.inject({
      method: 'GET',
      url: `/api/products/${productId}`,
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    expect(getResponse.statusCode).toBe(404);
  });
});