import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../../../app';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { FastifyInstance } from 'fastify';

const prisma = new PrismaClient();
let app: FastifyInstance;
let testToken: string;

const TEST_USER = {
  username: 'testuser',
  password: 'password123',
  role: 'cashier' as const,
};

describe('Auth Module', () => {
  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    // Clean up test user if exists
    await prisma.user.deleteMany({
      where: { username: TEST_USER.username },
    });

    // Create test user
    const passwordHash = await bcrypt.hash(TEST_USER.password, 10);
    await prisma.user.create({
      data: {
        username: TEST_USER.username,
        password_hash: passwordHash,
        role: TEST_USER.role,
      },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.user.deleteMany({
      where: { username: TEST_USER.username },
    });
    await prisma.$disconnect();
    await app.close();
  });

  it('should successfully login with valid credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        username: TEST_USER.username,
        password: TEST_USER.password,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('token');
    expect(body).toHaveProperty('user');
    expect(body.user.username).toBe(TEST_USER.username);
    expect(body.user.role).toBe(TEST_USER.role);

    // Save token for next tests
    testToken = body.token;
  });

  it('should fail login with wrong password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        username: TEST_USER.username,
        password: 'wrongpassword',
      },
    });

    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('error');
  });

  it('should fail login with non-existent user', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        username: 'nonexistent',
        password: 'password123',
      },
    });

    expect(response.statusCode).toBe(401);
  });

  it('should fail accessing /me without token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
    });

    expect(response.statusCode).toBe(401);
  });

  it('should successfully access /me with valid token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: {
        authorization: `Bearer ${testToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.username).toBe(TEST_USER.username);
    expect(body.role).toBe(TEST_USER.role);
  });
});