import prisma from '../../shared/prisma';

export async function cleanupOldTransactions() {
  try {
    console.log('🧹 [Cleanup Job] Starting old transaction retention cleanup...');
    
    // Calculate date exactly 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // Find sales older than 6 months
    const oldSales = await prisma.sale.findMany({
      where: {
        created_at: {
          lt: sixMonthsAgo
        }
      },
      select: {
        id: true
      }
    });

    if (oldSales.length === 0) {
      console.log('🧹 [Cleanup Job] No transactions older than 6 months found. Skipped.');
      return;
    }

    const oldSaleIds = oldSales.map(sale => sale.id);
    console.log(`🧹 [Cleanup Job] Found ${oldSaleIds.length} transactions older than 6 months to clean up.`);

    // Perform cleanup in a single transaction
    await prisma.$transaction(async (tx) => {
      // 1. Find and delete refunds related to these sales
      // RefundItems cascade delete because schema has `onDelete: Cascade` on Refund relation
      const refunds = await tx.refund.findMany({
        where: { sale_id: { in: oldSaleIds } },
        select: { id: true }
      });
      const refundIds = refunds.map(r => r.id);
      
      if (refundIds.length > 0) {
        await tx.refund.deleteMany({
          where: { id: { in: refundIds } }
        });
        console.log(`🧹 [Cleanup Job] Deleted ${refundIds.length} associated refunds.`);
      }

      // 2. Unlink TabTransactions to preserve financial tab history
      // We set sale_id to null instead of deleting the transaction
      const updatedTabs = await tx.tabTransaction.updateMany({
        where: { sale_id: { in: oldSaleIds } },
        data: { sale_id: null }
      });
      
      if (updatedTabs.count > 0) {
         console.log(`🧹 [Cleanup Job] Unlinked ${updatedTabs.count} tab transactions to preserve history.`);
      }

      // 3. Delete Sales
      // SaleItems cascade delete because schema has `onDelete: Cascade` on Sale relation
      // StockMovements stay untouched because they use reference_id without Database ForeignKey
      const deletedSales = await tx.sale.deleteMany({
        where: { id: { in: oldSaleIds } }
      });
      
      console.log(`🧹 [Cleanup Job] Successfully deleted ${deletedSales.count} old sales and their sale items.`);
    });
    
  } catch (err) {
    console.error('❌ [Cleanup Job] Failed to execute old transaction cleanup:', err);
  }
}

export function startTransactionCleanupJob() {
  // Run immediately on startup to clean up anything that expired while server was offline
  cleanupOldTransactions();

  // Run every 24 hours (24 hours * 60 min * 60 sec * 1000 ms)
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  setInterval(() => {
    cleanupOldTransactions();
  }, TWENTY_FOUR_HOURS);
  
  console.log('✅ Scheduled 6-month transaction cleanup job (Runs daily)');
}
