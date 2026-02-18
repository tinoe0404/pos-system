import { Prisma, SaleStatus } from '@prisma/client';
import prisma from '../../shared/prisma';
import { CreateRefundInput } from './refund.schema';
import { registerService } from '../register/register.service'; // To log cash out


export const refundService = {
    async processRefund(userId: string, data: CreateRefundInput) {
        // 1. Fetch original sale with items
        const sale = await prisma.sale.findUnique({
            where: { id: data.saleId },
            include: { items: true }
        });

        if (!sale) throw new Error('Sale not found');
        if (sale.status === SaleStatus.VOIDED) throw new Error('Cannot refund a voided sale');

        // 2. Validate items and calculate total refund
        let totalRefundAmount = new Prisma.Decimal(0);
        const refundItemsData: Prisma.RefundItemCreateManyRefundInput[] = [];

        for (const item of data.items) {
            const saleItem = sale.items.find(i => i.product_id === item.productId);
            if (!saleItem) throw new Error(`Product ${item.productId} not found in sale`);

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
        const result = await prisma.$transaction(async (tx) => {
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

        // 4. Update Cash Register
        try {
            await registerService.cashOut(userId, Number(totalRefundAmount), `Refund for sale #${sale.id.slice(-6)}`);
        } catch (e) {
            console.warn("Failed to update register log for refund:", e);
        }

        return result;
    }
};
