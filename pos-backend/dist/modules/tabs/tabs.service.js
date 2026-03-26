"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tabsService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../shared/prisma"));
exports.tabsService = {
    /**
     * Create a new tab with an initial deposit.
     */
    async createTab(userId, data) {
        const tab = await prisma_1.default.$transaction(async (tx) => {
            const newTab = await tx.tab.create({
                data: {
                    customer_name: data.customer_name,
                    phone: data.phone,
                    balance: new client_1.Prisma.Decimal(data.deposit_amount),
                    initial_deposit: new client_1.Prisma.Decimal(data.deposit_amount),
                    status: 'ACTIVE',
                    created_by_id: userId,
                },
            });
            await tx.tabTransaction.create({
                data: {
                    tab_id: newTab.id,
                    type: 'DEPOSIT',
                    amount: new client_1.Prisma.Decimal(data.deposit_amount),
                    note: 'Initial deposit',
                },
            });
            return newTab;
        });
        return formatTab(await prisma_1.default.tab.findUnique({
            where: { id: tab.id },
            include: { transactions: { orderBy: { created_at: 'desc' } }, created_by: { select: { id: true, username: true } } },
        }));
    },
    /**
     * Get all tabs with optional filters.
     */
    async getTabs(filters) {
        const where = {};
        if (filters?.status) {
            where.status = filters.status;
        }
        if (filters?.q) {
            where.customer_name = {
                contains: filters.q,
                mode: 'insensitive',
            };
        }
        const tabs = await prisma_1.default.tab.findMany({
            where,
            include: {
                created_by: { select: { id: true, username: true } },
                _count: { select: { sales: true } },
            },
            orderBy: [
                { status: 'asc' }, // ACTIVE first
                { created_at: 'desc' },
            ],
        });
        return tabs.map(formatTabListItem);
    },
    /**
     * Get a single tab by ID with full transaction history.
     */
    async getTabById(tabId) {
        const tab = await prisma_1.default.tab.findUnique({
            where: { id: tabId },
            include: {
                transactions: {
                    orderBy: { created_at: 'desc' },
                    include: {
                        sale: {
                            select: { id: true, total: true, created_at: true, status: true },
                        },
                    },
                },
                created_by: { select: { id: true, username: true } },
                sales: {
                    select: { id: true, total: true, created_at: true, status: true },
                    orderBy: { created_at: 'desc' },
                },
            },
        });
        if (!tab)
            throw new Error('Tab not found');
        return formatTab(tab);
    },
    /**
     * Add more money to an existing tab.
     */
    async depositToTab(tabId, amount, note) {
        const tab = await prisma_1.default.tab.findUnique({ where: { id: tabId } });
        if (!tab)
            throw new Error('Tab not found');
        if (tab.status !== 'ACTIVE')
            throw new Error('Tab is not active');
        const updated = await prisma_1.default.$transaction(async (tx) => {
            await tx.tabTransaction.create({
                data: {
                    tab_id: tabId,
                    type: 'DEPOSIT',
                    amount: new client_1.Prisma.Decimal(amount),
                    note: note || 'Top-up deposit',
                },
            });
            return tx.tab.update({
                where: { id: tabId },
                data: {
                    balance: { increment: new client_1.Prisma.Decimal(amount) },
                    status: 'ACTIVE', // Reactivate if was EXHAUSTED
                },
            });
        });
        return formatTab(await prisma_1.default.tab.findUnique({
            where: { id: updated.id },
            include: { transactions: { orderBy: { created_at: 'desc' } }, created_by: { select: { id: true, username: true } } },
        }));
    },
    /**
     * Close a tab and return remaining balance to customer.
     */
    async closeTab(tabId, note) {
        const tab = await prisma_1.default.tab.findUnique({ where: { id: tabId } });
        if (!tab)
            throw new Error('Tab not found');
        if (tab.status === 'CLOSED')
            throw new Error('Tab is already closed');
        const remainingBalance = Number(tab.balance);
        const updated = await prisma_1.default.$transaction(async (tx) => {
            if (remainingBalance > 0) {
                await tx.tabTransaction.create({
                    data: {
                        tab_id: tabId,
                        type: 'CASHOUT',
                        amount: new client_1.Prisma.Decimal(remainingBalance),
                        note: note || 'Tab closed - balance returned to customer',
                    },
                });
            }
            return tx.tab.update({
                where: { id: tabId },
                data: {
                    balance: 0,
                    status: 'CLOSED',
                    closed_at: new Date(),
                },
            });
        });
        return {
            ...formatTab(await prisma_1.default.tab.findUnique({
                where: { id: updated.id },
                include: { transactions: { orderBy: { created_at: 'desc' } }, created_by: { select: { id: true, username: true } } },
            })),
            returned_amount: remainingBalance,
        };
    },
    /**
     * Charge a sale to a tab (called from sales service).
     * Returns the updated tab balance.
     */
    async chargeToTab(tabId, saleId, amount) {
        const tab = await prisma_1.default.tab.findUnique({ where: { id: tabId } });
        if (!tab)
            throw new Error('Tab not found');
        if (tab.status !== 'ACTIVE')
            throw new Error('Tab is not active');
        if (Number(tab.balance) < amount) {
            throw new Error(`Insufficient tab balance. Available: $${Number(tab.balance).toFixed(2)}, Required: $${amount.toFixed(2)}`);
        }
        const newBalance = Number(tab.balance) - amount;
        const updated = await prisma_1.default.$transaction(async (tx) => {
            await tx.tabTransaction.create({
                data: {
                    tab_id: tabId,
                    type: 'PURCHASE',
                    amount: new client_1.Prisma.Decimal(amount),
                    sale_id: saleId,
                    note: 'Purchase from tab',
                },
            });
            return tx.tab.update({
                where: { id: tabId },
                data: {
                    balance: new client_1.Prisma.Decimal(newBalance),
                    status: newBalance <= 0 ? 'EXHAUSTED' : 'ACTIVE',
                },
            });
        });
        return { balance: Number(updated.balance), status: updated.status };
    },
    /**
     * Refund a sale amount back to a tab (called when voiding a tab-linked sale).
     */
    async refundToTab(tabId, saleId, amount) {
        const tab = await prisma_1.default.tab.findUnique({ where: { id: tabId } });
        if (!tab)
            throw new Error('Tab not found');
        await prisma_1.default.$transaction(async (tx) => {
            await tx.tabTransaction.create({
                data: {
                    tab_id: tabId,
                    type: 'REFUND',
                    amount: new client_1.Prisma.Decimal(amount),
                    sale_id: saleId,
                    note: 'Sale voided - amount returned to tab',
                },
            });
            await tx.tab.update({
                where: { id: tabId },
                data: {
                    balance: { increment: new client_1.Prisma.Decimal(amount) },
                    status: 'ACTIVE', // Reactivate if was EXHAUSTED
                },
            });
        });
    },
};
function formatTab(tab) {
    if (!tab)
        return null;
    return {
        id: tab.id,
        customer_name: tab.customer_name,
        phone: tab.phone,
        balance: Number(tab.balance),
        initial_deposit: Number(tab.initial_deposit),
        status: tab.status,
        created_by: tab.created_by,
        created_at: tab.created_at?.toISOString?.() || tab.created_at,
        closed_at: tab.closed_at?.toISOString?.() || null,
        transactions: tab.transactions?.map((t) => ({
            id: t.id,
            type: t.type,
            amount: Number(t.amount),
            note: t.note,
            sale_id: t.sale_id,
            sale: t.sale ? {
                id: t.sale.id,
                total: Number(t.sale.total),
                created_at: t.sale.created_at?.toISOString?.() || t.sale.created_at,
                status: t.sale.status,
            } : null,
            created_at: t.created_at?.toISOString?.() || t.created_at,
        })),
        sales: tab.sales?.map((s) => ({
            id: s.id,
            total: Number(s.total),
            created_at: s.created_at?.toISOString?.() || s.created_at,
            status: s.status,
        })),
    };
}
function formatTabListItem(tab) {
    return {
        id: tab.id,
        customer_name: tab.customer_name,
        phone: tab.phone,
        balance: Number(tab.balance),
        initial_deposit: Number(tab.initial_deposit),
        status: tab.status,
        created_by: tab.created_by,
        created_at: tab.created_at?.toISOString?.() || tab.created_at,
        closed_at: tab.closed_at?.toISOString?.() || null,
        sales_count: tab._count?.sales || 0,
    };
}
