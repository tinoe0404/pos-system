"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const app_1 = require("../../../app");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const redis_1 = __importDefault(require("../../../shared/redis"));
const prisma = new client_1.PrismaClient();
let app;
let adminToken;
let cashierToken;
let testProductId;
const TEST_ADMIN = {
    username: 'test_admin_products',
    password: 'admin123',
    role: 'admin',
};
const TEST_CASHIER = {
    username: 'test_cashier_products',
    password: 'cashier123',
    role: 'cashier',
};
const TEST_PRODUCT = {
    name: 'Test Product',
    description: 'A test product',
    price: 99.99,
    stock: 100,
    sku: 'TEST-SKU-001',
    category: 'Electronics',
};
(0, vitest_1.describe)('Products Module', () => {
    (0, vitest_1.beforeAll)(async () => {
        app = await (0, app_1.buildApp)();
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
        const adminHash = await bcrypt_1.default.hash(TEST_ADMIN.password, 10);
        await prisma.user.create({
            data: {
                username: TEST_ADMIN.username,
                password_hash: adminHash,
                role: TEST_ADMIN.role,
            },
        });
        // Create test cashier
        const cashierHash = await bcrypt_1.default.hash(TEST_CASHIER.password, 10);
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
    (0, vitest_1.beforeEach)(async () => {
        // Clear cache before each test
        await redis_1.default.del('all_products');
        // Clean up test products
        await prisma.product.deleteMany({
            where: {
                sku: {
                    startsWith: 'TEST-SKU',
                },
            },
        });
    });
    (0, vitest_1.afterAll)(async () => {
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
        await redis_1.default.quit();
        await prisma.$disconnect();
        await app.close();
    });
    (0, vitest_1.it)('[TEST 1] Admin should successfully create a product (Expect 201)', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/products',
            headers: {
                authorization: `Bearer ${adminToken}`,
            },
            payload: TEST_PRODUCT,
        });
        (0, vitest_1.expect)(response.statusCode).toBe(201);
        const body = JSON.parse(response.body);
        (0, vitest_1.expect)(body).toHaveProperty('id');
        (0, vitest_1.expect)(body.name).toBe(TEST_PRODUCT.name);
        (0, vitest_1.expect)(body.sku).toBe(TEST_PRODUCT.sku);
        (0, vitest_1.expect)(parseFloat(body.price)).toBe(TEST_PRODUCT.price);
        // Save product ID for other tests
        testProductId = body.id;
    });
    (0, vitest_1.it)('[TEST 2] Cashier should successfully read products (Expect 200)', async () => {
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
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        (0, vitest_1.expect)(body).toHaveProperty('products');
        (0, vitest_1.expect)(body).toHaveProperty('count');
        (0, vitest_1.expect)(Array.isArray(body.products)).toBe(true);
        (0, vitest_1.expect)(body.count).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('[TEST 3] Cashier should NOT be able to create a product (Expect 403)', async () => {
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
        (0, vitest_1.expect)(response.statusCode).toBe(403);
        const body = JSON.parse(response.body);
        (0, vitest_1.expect)(body.error).toBe('Forbidden');
    });
    (0, vitest_1.it)('[TEST 4] Cache Check: Second GET should come from Redis (Prisma called ONLY ONCE)', async () => {
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
        (0, vitest_1.expect)(firstResponse.statusCode).toBe(200);
        const firstBody = JSON.parse(firstResponse.body);
        (0, vitest_1.expect)(firstBody.cached).toBe(false); // First hit = DB
        // Second request - should hit cache
        const secondResponse = await app.inject({
            method: 'GET',
            url: '/api/products',
            headers: {
                authorization: `Bearer ${adminToken}`,
            },
        });
        (0, vitest_1.expect)(secondResponse.statusCode).toBe(200);
        const secondBody = JSON.parse(secondResponse.body);
        (0, vitest_1.expect)(secondBody.cached).toBe(true); // Second hit = Redis Cache
        // Verify data is the same
        (0, vitest_1.expect)(secondBody.products.length).toBe(firstBody.products.length);
    });
    (0, vitest_1.it)('Should invalidate cache after creating a product', async () => {
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
        (0, vitest_1.expect)(secondBody.cached).toBe(false); // Cache was invalidated
        (0, vitest_1.expect)(secondBody.count).toBe(firstCount + 1); // New product added
    });
    (0, vitest_1.it)('Should successfully update a product', async () => {
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
        (0, vitest_1.expect)(updateResponse.statusCode).toBe(200);
        const body = JSON.parse(updateResponse.body);
        (0, vitest_1.expect)(body.name).toBe('Updated Product Name');
        (0, vitest_1.expect)(parseFloat(body.price)).toBe(199.99);
    });
    (0, vitest_1.it)('Should successfully delete a product', async () => {
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
        (0, vitest_1.expect)(deleteResponse.statusCode).toBe(204);
        // Verify product is deleted
        const getResponse = await app.inject({
            method: 'GET',
            url: `/api/products/${productId}`,
            headers: {
                authorization: `Bearer ${adminToken}`,
            },
        });
        (0, vitest_1.expect)(getResponse.statusCode).toBe(404);
    });
});
