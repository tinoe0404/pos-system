"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const prisma_1 = __importDefault(require("../../shared/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserService {
    /**
     * Get all users
     */
    async getAllUsers() {
        try {
            const users = await prisma_1.default.user.findMany({
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
        }
        catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }
    /**
     * Create a new user
     */
    async createUser(data) {
        try {
            // Hash password before saving
            const password_hash = await bcrypt_1.default.hash(data.password, 10);
            const user = await prisma_1.default.user.create({
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
        }
        catch (error) {
            // Check for unique constraint violation (duplicate username)
            if (typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                error.code === 'P2002') {
                throw new Error('User with this username already exists');
            }
            throw error;
        }
    }
    /**
     * Deactivate user
     */
    async deactivateUser(id) {
        try {
            const user = await prisma_1.default.user.update({
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
        }
        catch (error) {
            // Check for record not found
            if (typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                error.code === 'P2025') {
                throw new Error('User not found');
            }
            throw error;
        }
    }
    /**
     * Get user by ID
     */
    async getUserById(id) {
        try {
            const user = await prisma_1.default.user.findUnique({
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
        }
        catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }
    /**
     * Set user PIN (hashed)
     */
    async setPin(userId, pin) {
        if (pin.length !== 4 || !/^\d+$/.test(pin)) {
            throw new Error('PIN must be 4 digits');
        }
        try {
            const pin_hash = await bcrypt_1.default.hash(pin, 10);
            // Using type assertion until Prisma client updates
            await prisma_1.default.user.update({
                where: { id: userId },
                data: {
                    pin_hash
                },
            });
            console.log(`✅ PIN set for user: ${userId}`);
            return true;
        }
        catch (error) {
            console.error('Error setting PIN:', error);
            throw error;
        }
    }
    /**
     * Verify user PIN
     */
    async verifyPin(userId, pin) {
        try {
            const user = await prisma_1.default.user.findUnique({
                where: { id: userId },
                select: { pin_hash: true },
            });
            if (!user || !user.pin_hash) {
                return false;
            }
            const isValid = await bcrypt_1.default.compare(pin, user.pin_hash);
            return isValid;
        }
        catch (error) {
            console.error('Error verifying PIN:', error);
            return false;
        }
    }
    /**
     * Verify if a PIN belongs to any active admin
     */
    async verifyAdminPin(pin) {
        try {
            // Find all active admins with a PIN set
            // @ts-ignore - pin_hash not yet in types
            const admins = await prisma_1.default.user.findMany({
                where: {
                    role: 'admin',
                    is_active: true,
                    pin_hash: { not: null }
                },
                select: { pin_hash: true }
            });
            for (const admin of admins) {
                // @ts-ignore
                const isValid = await bcrypt_1.default.compare(pin, admin.pin_hash);
                if (isValid)
                    return true;
            }
            return false;
        }
        catch (error) {
            console.error('Error verifying admin PIN:', error);
            return false;
        }
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
