"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../shared/prisma"));
exports.refundService = {
    async processRefund(userId, data) {
        // 1. Fetch original sale with items
        const sale = await prisma_1.default.sale.findUnique({
            where: { id: data.saleId },
            include: { items: true }
        });
        if (!sale)
            throw new Error('Sale not found');
        if (sale.status === client_1.SaleStatus.VOIDED)
            throw new Error('Cannot refund a voided sale');
        // 2. Validate items and calculate total refund
        let totalRefundAmount = new client_1.Prisma.Decimal(0);
        const refundItemsData = [];
        for (const item of data.items) {
            const saleItem = sale.items.find(i => i.product_id === item.productId);
            if (!saleItem)
                throw new Error(`Product ${item.productId} not found in sale`);
            if (item.quantity > saleItem.quantity) {
                throw new Error(`Cannot refund more than sold quantity for product ${item.productId}`);
            }
            // Calculate amount for this item based on price AT SALE
            const itemRefundAmount = saleItem.price_at_sale.mul(item.quantity);
            totalRefundAmount = totalRefundAmount.add(itemRefundAmount);
            refundItemsData.push({
                product_id: item.productId,
                quantity: item.quantity,
                amount: itemRefundAmount
            });
        }
        // 3. Transaction: Create Refund, Restore Stock, Log Register
        const result = await prisma_1.default.$transaction(async (tx) => {
            // Create Refund Record
            const refund = await tx.refund.create({
                data: {
                    sale_id: sale.id,
                    user_id: userId,
                    total_amount: totalRefundAmount,
                    reason: data.reason,
                    status: 'COMPLETED',
                    items: {
                        create: refundItemsData
                    }
                },
                include: { items: true }
            });
            // Restore Stock
            for (const item of data.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } }
                });
            }
            return refund;
        });
        // 4. Cash drawer updates handled manually.
        return result;
    }
};
