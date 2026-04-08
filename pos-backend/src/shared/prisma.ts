import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'production'
        ? ['error']
        : ['error', 'warn'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

// Eagerly connect to pre-warm the connection pool at import time
prisma.$connect().catch((err) => {
    console.error('❌ Prisma failed to pre-connect:', err);
});

export default prisma;
