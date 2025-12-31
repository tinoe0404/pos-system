"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const vitest_1 = require("vitest");
const prisma = new client_1.PrismaClient();
exports.prisma = prisma;
(0, vitest_1.beforeAll)(async () => {
    await prisma.$connect();
});
(0, vitest_1.afterAll)(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=test-setup.js.map