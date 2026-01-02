import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { CreateUserInput } from './user.schema';

const prisma = new PrismaClient();

export class UserService {
  /**
   * Get all users
   */
  async getAllUsers() {
    try {
      const users = await prisma.user.findMany({
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          username: true,
          role: true,
          is_active: true,
          created_at: true,
        },
      });

      return {
        users,
        count: users.length,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserInput) {
    try {
      // Hash password before saving
      const password_hash = await bcrypt.hash(data.password, 10);

      const user = await prisma.user.create({
        data: {
          username: data.username,
          password_hash,
          role: data.role,
          is_active: true,
        },
        select: {
          id: true,
          username: true,
          role: true,
          is_active: true,
          created_at: true,
        },
      });

      console.log(`✅ User created: ${user.username} (${user.role})`);

      return user;
    } catch (error: unknown) {
      // Check for unique constraint violation (duplicate username)
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new Error('User with this username already exists');
      }
      throw error;
    }
  }

  /**
   * Deactivate user
   */
  async deactivateUser(id: string) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { is_active: false },
        select: {
          id: true,
          username: true,
          role: true,
          is_active: true,
          created_at: true,
        },
      });

      console.log(`🚫 User deactivated: ${user.username}`);

      return user;
    } catch (error: unknown) {
      // Check for record not found
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new Error('User not found');
      }
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          role: true,
          is_active: true,
          created_at: true,
        },
      });

      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }
}

export const userService = new UserService();