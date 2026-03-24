import prisma from '../../shared/prisma';
import { redisSession } from '../../shared/redis';

export const analyticsService = {
  /**
   * Get comprehensive inventory analytics
   */
  async getInventoryAnalytics(days: number = 30) {
    const cacheKey = `analytics:inventory:${days}`;
    const cached = await redisSession.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // 1. Total Valuation & Low Stock Count
    const products = await prisma.product.findMany({
      where: { active: true },
    });

    let totalValuation = 0;
    let lowStockCount = 0;
    const activeProductsMap = new Map();

    products.forEach((p: any) => {
      activeProductsMap.set(p.id, p);
      if (p.stock > 0) {
        totalValuation += p.stock * Number(p.price);
      }
      if (p.stock <= (p.min_stock ?? 10)) {
        lowStockCount++;
      }
    });

    // 2. Top Moving Items (From SaleItems)
    const saleItems = await prisma.saleItem.groupBy({
      by: ['product_id'],
      _sum: {
        quantity: true,
        total: true,
      },
      where: {
        sale: {
          status: 'COMPLETED',
          created_at: { gte: dateThreshold },
        },
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    const topMovingItems = saleItems.map((item: any) => {
      const product = activeProductsMap.get(item.product_id);
      return {
        product_id: item.product_id,
        name: product?.name || 'Unknown Product',
        sku: product?.sku || 'N/A',
        quantity_sold: item._sum.quantity || 0,
        revenue: Number(item._sum.total) || 0,
      };
    });

    // 3. Stock Shrinkage (Voids & Negative Adjustments)
    const shrinkageMovements = await prisma.stockMovement.findMany({
      where: {
        created_at: { gte: dateThreshold },
        type: { in: ['VOID', 'ADJUSTMENT'] },
        quantity_change: { lt: 0 },
      },
      include: {
        product: {
          select: { name: true, sku: true, price: true },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 10,
    });

    let totalShrinkageValue = 0;
    const shrinkageList = shrinkageMovements.map((m: any) => {
      const lossValue = Math.abs(m.quantity_change) * Number(m.product.price);
      totalShrinkageValue += lossValue;
      return {
        id: m.id,
        product_id: m.product_id,
        name: m.product.name,
        sku: m.product.sku,
        type: m.type,
        quantity_lost: Math.abs(m.quantity_change),
        value_lost: lossValue,
        reason: m.reason || (m.type === 'VOID' ? 'Sale Voided' : 'Manual Adjustment'),
        date: m.created_at,
      };
    });

    // 4. Dead Stock (Products with >0 stock but NO sales in dateThreshold)
    const productsWithSales = new Set(
      (
        await prisma.saleItem.findMany({
          select: { product_id: true },
          where: {
            sale: {
              status: 'COMPLETED',
              created_at: { gte: dateThreshold },
            },
          },
          distinct: ['product_id'],
        })
      ).map((item: any) => item.product_id)
    );

    const deadStock = products
      .filter((p: any) => p.stock > 0 && !productsWithSales.has(p.id))
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        stock: p.stock,
        value: p.stock * Number(p.price),
        category: p.category,
      }))
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 10); // Top 10 worst offenders

    const result = {
      summary: {
        totalValuation,
        lowStockCount,
        totalShrinkageValue,
        activeProductsCount: products.length,
      },
      topMovingItems,
      shrinkageList,
      deadStock,
    };

    // Cache for 15 minutes
    await redisSession.set(cacheKey, JSON.stringify(result), 'EX', 900);

    return result;
  },
};
