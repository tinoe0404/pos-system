"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireRole = requireRole;
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
//# sourceMappingURL=auth.middleware.js.map