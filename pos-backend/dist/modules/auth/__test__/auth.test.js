"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const app_1 = require("../../../app");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
let app;
let testToken;
const TEST_USER = {
    username: 'testuser',
    password: 'password123',
    role: 'cashier',
};
(0, vitest_1.describe)('Auth Module', () => {
    (0, vitest_1.beforeAll)(async () => {
        app = await (0, app_1.buildApp)();
        await app.ready();
        // Clean up test user if exists
        await prisma.user.deleteMany({
            where: { username: TEST_USER.username },
        });
        // Create test user
        const passwordHash = await bcrypt_1.default.hash(TEST_USER.password, 10);
        await prisma.user.create({
            data: {
                username: TEST_USER.username,
                password_hash: passwordHash,
                role: TEST_USER.role,
            },
        });
    });
    (0, vitest_1.afterAll)(async () => {
        // Clean up
        await prisma.user.deleteMany({
            where: { username: TEST_USER.username },
        });
        await prisma.$disconnect();
        await app.close();
    });
    (0, vitest_1.it)('should successfully login with valid credentials', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: {
                username: TEST_USER.username,
                password: TEST_USER.password,
            },
        });
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        (0, vitest_1.expect)(body).toHaveProperty('token');
        (0, vitest_1.expect)(body).toHaveProperty('user');
        (0, vitest_1.expect)(body.user.username).toBe(TEST_USER.username);
        (0, vitest_1.expect)(body.user.role).toBe(TEST_USER.role);
        // Save token for next tests
        testToken = body.token;
    });
    (0, vitest_1.it)('should fail login with wrong password', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: {
                username: TEST_USER.username,
                password: 'wrongpassword',
            },
        });
        (0, vitest_1.expect)(response.statusCode).toBe(401);
        const body = JSON.parse(response.body);
        (0, vitest_1.expect)(body).toHaveProperty('error');
    });
    (0, vitest_1.it)('should fail login with non-existent user', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: {
                username: 'nonexistent',
                password: 'password123',
            },
        });
        (0, vitest_1.expect)(response.statusCode).toBe(401);
    });
    (0, vitest_1.it)('should fail accessing /me without token', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/auth/me',
        });
        (0, vitest_1.expect)(response.statusCode).toBe(401);
    });
    (0, vitest_1.it)('should successfully access /me with valid token', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/auth/me',
            headers: {
                authorization: `Bearer ${testToken}`,
            },
        });
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        (0, vitest_1.expect)(body.username).toBe(TEST_USER.username);
        (0, vitest_1.expect)(body.role).toBe(TEST_USER.role);
    });
});
