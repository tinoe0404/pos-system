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
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireRole = requireRole;
exports.requirePinOrRole = requirePinOrRole;
async function authenticate(request, reply) {
    try {
        await request.jwtVerify();
    }
    catch (err) {
        return reply.code(401).send({
            error: 'Unauthorized',
            message: 'Invalid or missing token',
        });
    }
}
function requireRole(...allowedRoles) {
    return async (request, reply) => {
        const user = request.user;
        if (!user || !allowedRoles.includes(user.role)) {
            return reply.code(403).send({
                error: 'Forbidden',
                message: 'Insufficient permissions',
            });
        }
    };
}
function requirePinOrRole(requiredRole) {
    return async (request, reply) => {
        const user = request.user;
        const body = request.body;
        // 1. Check if user already has the role
        if (user && user.role === requiredRole) {
            return;
        }
        // 2. Check if a valid PIN is provided
        if (body?.pin) {
            // Lazy import to avoid circular dependency if any
            const { userService } = await Promise.resolve().then(() => __importStar(require('../users/user.service')));
            const isValid = await userService.verifyAdminPin(body.pin);
            if (isValid) {
                return;
            }
        }
        // 3. Forbidden
        return reply.code(403).send({
            error: 'Forbidden',
            message: 'Insufficient permissions. Admin PIN required.',
        });
    };
}
