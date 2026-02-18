import { Prisma } from '@prisma/client';
import prisma from '../../shared/prisma';


export const registerService = {
    /**
     * Open a new cash register for the user.
     * Only one register can be open at a time per user.
     */
    async openRegister(userId: string, openingAmount: number) {
        // Check if user already has an open register
        const existing = await prisma.cashRegister.findFirst({
            where: {
                user_id: userId,
                closed_at: null,
            },
        });

        if (existing) {
            throw new Error('You already have an open register. Close it before opening a new one.');
        }

        const register = await prisma.cashRegister.create({
            data: {
                user_id: userId,
                opening_amount: new Prisma.Decimal(openingAmount),
            },
            include: { logs: true },
        });

        return formatRegister(register);
    },

    /**
     * Close the current open register for the user.
     */
    async closeRegister(userId: string, closingAmount: number, notes?: string) {
        const register = await prisma.cashRegister.findFirst({
            where: {
                user_id: userId,
                closed_at: null,
            },
            include: {
                logs: true,
            },
        });

        if (!register) {
            throw new Error('No open register found.');
        }

        // Calculate expected amount: opening + sales + cash_in - cash_out +/- adjustments
        let expected = Number(register.opening_amount);
        for (const log of register.logs) {
            const amt = Number(log.amount);
            switch (log.type) {
                case 'SALE':
                case 'CASH_IN':
                    expected += amt;
                    break;
                case 'CASH_OUT':
                    expected -= amt;
                    break;
                case 'ADJUSTMENT':
                    expected += amt; // can be negative
                    break;
            }
        }

        const updated = await prisma.cashRegister.update({
            where: { id: register.id },
            data: {
                closed_at: new Date(),
                closing_amount: new Prisma.Decimal(closingAmount),
                expected_amount: new Prisma.Decimal(expected),
                notes,
            },
            include: { logs: true },
        });

        return {
            ...formatRegister(updated),
            difference: closingAmount - expected,
        };
    },

    /**
     * Get the current open register for the user.
     */
    async getCurrentRegister(userId: string) {
        const register = await prisma.cashRegister.findFirst({
            where: {
                user_id: userId,
                closed_at: null,
            },
            include: { logs: true },
        });

        if (!register) return null;
        return formatRegister(register);
    },

    /**
     * Record a cash-in to the current register.
     */
    async cashIn(userId: string, amount: number, note?: string) {
        const register = await getOpenRegister(userId);

        const log = await prisma.cashRegisterLog.create({
            data: {
                register_id: register.id,
                type: 'CASH_IN',
                amount: new Prisma.Decimal(amount),
                note,
            },
        });

        return log;
    },

    /**
     * Record a cash-out from the current register.
     */
    async cashOut(userId: string, amount: number, note?: string) {
        const register = await getOpenRegister(userId);

        const log = await prisma.cashRegisterLog.create({
            data: {
                register_id: register.id,
                type: 'CASH_OUT',
                amount: new Prisma.Decimal(amount),
                note,
            },
        });

        return log;
    },

    /**
     * Record a sale in the cash register log.
     */
    async recordSale(userId: string, saleAmount: number) {
        const register = await prisma.cashRegister.findFirst({
            where: {
                user_id: userId,
                closed_at: null,
            },
        });

        // If no register is open, silently skip (don't block sales)
        if (!register) return null;

        const log = await prisma.cashRegisterLog.create({
            data: {
                register_id: register.id,
                type: 'SALE',
                amount: new Prisma.Decimal(saleAmount),
                note: 'Automatic sale record',
            },
        });

        return log;
    },
};

async function getOpenRegister(userId: string) {
    const register = await prisma.cashRegister.findFirst({
        where: {
            user_id: userId,
            closed_at: null,
        },
    });

    if (!register) {
        throw new Error('No open register found. Please open a register first.');
    }

    return register;
}

function formatRegister(register: any) {
    return {
        id: register.id,
        user_id: register.user_id,
        opened_at: register.opened_at.toISOString(),
        closed_at: register.closed_at?.toISOString() || null,
        opening_amount: Number(register.opening_amount),
        closing_amount: register.closing_amount ? Number(register.closing_amount) : null,
        expected_amount: register.expected_amount ? Number(register.expected_amount) : null,
        notes: register.notes,
        logs: register.logs?.map((log: any) => ({
            id: log.id,
            type: log.type,
            amount: Number(log.amount),
            note: log.note,
            created_at: log.created_at.toISOString(),
        })),
    };
}
