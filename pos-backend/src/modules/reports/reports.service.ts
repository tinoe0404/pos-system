import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import {
  DailyReportData,
  DailyJsonReport,
  WeeklyJsonReport,
  MonthlyJsonReport,
} from './reports.schema';

const prisma = new PrismaClient();

export class ReportsService {
  /**
   * Get daily report data (for PDF generation)
   */
  async getDailyReportData(dateString?: string): Promise<DailyReportData> {
    try {
      // Parse date or use today
      const targetDate = dateString ? new Date(dateString) : new Date();

      // Set to start and end of day
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Fetch all sales for the day
      const sales = await prisma.sale.findMany({
        where: {
          created_at: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          user: {
            select: {
              username: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      // Calculate totals
      const completedSales = sales.filter((s) => s.status === 'COMPLETED');
      const totalRevenue = completedSales.reduce(
        (sum, sale) => sum + Number(sale.total),
        0
      );

      // Format sales data
      const formattedSales = sales.map((sale) => ({
        id: sale.id,
        user_username: sale.user.username,
        total: sale.total.toString(),
        status: sale.status,
        created_at: sale.created_at,
        items: sale.items.map((item) => ({
          id: item.id,
          sale_id: item.sale_id,
          product_name: item.product.name,
          quantity: item.quantity,
          price_at_sale: item.price_at_sale.toString(),
          subtotal: (Number(item.price_at_sale) * item.quantity).toFixed(2),
        })),
      }));

      return {
        date: startOfDay.toISOString().split('T')[0],
        totalRevenue: totalRevenue.toFixed(2),
        totalTransactions: sales.length,
        sales: formattedSales,
      };
    } catch (error) {
      console.error('Error fetching daily report data:', error);
      throw error;
    }
  }

  /**
   * Get daily JSON report (for charts)
   */
  async getDailyJsonReport(dateString?: string): Promise<DailyJsonReport> {
    try {
      const targetDate = dateString ? new Date(dateString) : new Date();

      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Get all sales for the day
      const sales = await prisma.sale.findMany({
        where: {
          created_at: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Calculate metrics
      const completedSales = sales.filter((s) => s.status === 'COMPLETED');
      const pendingSales = sales.filter((s) => s.status === 'PENDING');
      const failedSales = sales.filter((s) => s.status === 'FAILED');

      const totalRevenue = completedSales.reduce(
        (sum, sale) => sum + Number(sale.total),
        0
      );

      const averageTransactionValue =
        completedSales.length > 0 ? totalRevenue / completedSales.length : 0;

      // Calculate top products
      const productSales = new Map<
        string,
        { id: string; name: string; quantity: number; revenue: number }
      >();

      completedSales.forEach((sale) => {
        sale.items.forEach((item) => {
          const existing = productSales.get(item.product_id);
          const itemRevenue = Number(item.price_at_sale) * item.quantity;

          if (existing) {
            existing.quantity += item.quantity;
            existing.revenue += itemRevenue;
          } else {
            productSales.set(item.product_id, {
              id: item.product.id,
              name: item.product.name,
              quantity: item.quantity,
              revenue: itemRevenue,
            });
          }
        });
      });

      const topProducts = Array.from(productSales.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map((p) => ({
          productId: p.id,
          productName: p.name,
          quantity: p.quantity,
          revenue: p.revenue.toFixed(2),
        }));

      // Calculate payment method breakdown
      const paymentBreakdown = completedSales.reduce(
        (acc, sale) => {
          if (sale.payment_method === 'CASH') {
            acc.cash += Number(sale.total);
          } else if (sale.payment_method === 'ECOCASH') {
            acc.ecocash += Number(sale.total);
          }
          return acc;
        },
        { cash: 0, ecocash: 0 }
      );

      return {
        date: startOfDay.toISOString().split('T')[0],
        totalRevenue: totalRevenue.toFixed(2),
        totalTransactions: sales.length,
        completedTransactions: completedSales.length,
        pendingTransactions: pendingSales.length,
        failedTransactions: failedSales.length,
        averageTransactionValue: averageTransactionValue.toFixed(2),
        paymentMethodBreakdown: {
          cash: paymentBreakdown.cash.toFixed(2),
          ecocash: paymentBreakdown.ecocash.toFixed(2),
        },
        topProducts,
      };
    } catch (error) {
      console.error('Error fetching daily JSON report:', error);
      throw error;
    }
  }

  /**
   * Get weekly JSON report (last 7 days)
   */
  async getWeeklyJsonReport(): Promise<WeeklyJsonReport> {
    try {
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6); // Last 7 days including today
      startDate.setHours(0, 0, 0, 0);

      // Get all sales for the week
      const sales = await prisma.sale.findMany({
        where: {
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      const completedSales = sales.filter((s) => s.status === 'COMPLETED');

      const totalRevenue = completedSales.reduce(
        (sum, sale) => sum + Number(sale.total),
        0
      );

      // Daily breakdown
      const dailyMap = new Map<string, { revenue: number; transactions: number }>();

      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        dailyMap.set(dateStr, { revenue: 0, transactions: 0 });
      }

      completedSales.forEach((sale) => {
        const dateStr = sale.created_at.toISOString().split('T')[0];
        const existing = dailyMap.get(dateStr);
        if (existing) {
          existing.revenue += Number(sale.total);
          existing.transactions += 1;
        }
      });

      const dailyBreakdown = Array.from(dailyMap.entries())
        .map(([date, data]) => ({
          date,
          revenue: data.revenue.toFixed(2),
          transactions: data.transactions,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Top products
      const productSales = new Map<
        string,
        { id: string; name: string; quantity: number; revenue: number }
      >();

      completedSales.forEach((sale) => {
        sale.items.forEach((item) => {
          const existing = productSales.get(item.product_id);
          const itemRevenue = Number(item.price_at_sale) * item.quantity;

          if (existing) {
            existing.quantity += item.quantity;
            existing.revenue += itemRevenue;
          } else {
            productSales.set(item.product_id, {
              id: item.product.id,
              name: item.product.name,
              quantity: item.quantity,
              revenue: itemRevenue,
            });
          }
        });
      });

      const topProducts = Array.from(productSales.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map((p) => ({
          productId: p.id,
          productName: p.name,
          quantity: p.quantity,
          revenue: p.revenue.toFixed(2),
        }));

      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        totalRevenue: totalRevenue.toFixed(2),
        totalTransactions: completedSales.length,
        averageDailyRevenue: (totalRevenue / 7).toFixed(2),
        dailyBreakdown,
        topProducts,
      };
    } catch (error) {
      console.error('Error fetching weekly JSON report:', error);
      throw error;
    }
  }

  /**
   * Get monthly JSON report (last 30 days)
   */
  async getMonthlyJsonReport(): Promise<MonthlyJsonReport> {
    try {
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 29); // Last 30 days including today
      startDate.setHours(0, 0, 0, 0);

      // Get all sales for the month
      const sales = await prisma.sale.findMany({
        where: {
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                },
              },
            },
          },
        },
      });

      const completedSales = sales.filter((s) => s.status === 'COMPLETED');

      const totalRevenue = completedSales.reduce(
        (sum, sale) => sum + Number(sale.total),
        0
      );

      // Weekly breakdown (4 weeks + partial week)
      const weeklyMap = new Map<
        string,
        { start: Date; end: Date; revenue: number; transactions: number }
      >();

      // Create 5 week buckets
      for (let i = 0; i < 5; i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(weekStart.getDate() + i * 7);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        if (weekEnd > endDate) weekEnd.setTime(endDate.getTime());

        const key = weekStart.toISOString().split('T')[0];
        weeklyMap.set(key, {
          start: weekStart,
          end: weekEnd,
          revenue: 0,
          transactions: 0,
        });
      }

      completedSales.forEach((sale) => {
        const saleDate = sale.created_at;
        for (const [key, week] of weeklyMap.entries()) {
          if (saleDate >= week.start && saleDate <= week.end) {
            week.revenue += Number(sale.total);
            week.transactions += 1;
            break;
          }
        }
      });

      const weeklyBreakdown = Array.from(weeklyMap.entries())
        .map(([, data]) => ({
          weekStart: data.start.toISOString().split('T')[0],
          weekEnd: data.end.toISOString().split('T')[0],
          revenue: data.revenue.toFixed(2),
          transactions: data.transactions,
        }))
        .filter((w) => w.transactions > 0);

      // Top products
      const productSales = new Map<
        string,
        { id: string; name: string; quantity: number; revenue: number }
      >();

      completedSales.forEach((sale) => {
        sale.items.forEach((item) => {
          const existing = productSales.get(item.product_id);
          const itemRevenue = Number(item.price_at_sale) * item.quantity;

          if (existing) {
            existing.quantity += item.quantity;
            existing.revenue += itemRevenue;
          } else {
            productSales.set(item.product_id, {
              id: item.product.id,
              name: item.product.name,
              quantity: item.quantity,
              revenue: itemRevenue,
            });
          }
        });
      });

      const topProducts = Array.from(productSales.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map((p) => ({
          productId: p.id,
          productName: p.name,
          quantity: p.quantity,
          revenue: p.revenue.toFixed(2),
        }));

      // Category breakdown
      const categoryMap = new Map<string, { revenue: number; transactions: number }>();

      completedSales.forEach((sale) => {
        sale.items.forEach((item) => {
          const category = item.product.category || 'Uncategorized';
          const existing = categoryMap.get(category);
          const itemRevenue = Number(item.price_at_sale) * item.quantity;

          if (existing) {
            existing.revenue += itemRevenue;
            existing.transactions += 1;
          } else {
            categoryMap.set(category, {
              revenue: itemRevenue,
              transactions: 1,
            });
          }
        });
      });

      const categoryBreakdown = Array.from(categoryMap.entries())
        .map(([category, data]) => ({
          category,
          revenue: data.revenue.toFixed(2),
          transactions: data.transactions,
        }))
        .sort((a, b) => Number(b.revenue) - Number(a.revenue));

      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        totalRevenue: totalRevenue.toFixed(2),
        totalTransactions: completedSales.length,
        averageDailyRevenue: (totalRevenue / 30).toFixed(2),
        weeklyBreakdown,
        topProducts,
        categoryBreakdown,
      };
    } catch (error) {
      console.error('Error fetching monthly JSON report:', error);
      throw error;
    }
  }

  /**
   * Generate PDF report and return as stream
   */
  async generateDailyPDF(dateString?: string): Promise<PDFKit.PDFDocument> {
    try {
      // Get report data
      const reportData = await this.getDailyReportData(dateString);

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      // Header
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Daily Sales Report', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(12)
        .font('Helvetica')
        .text(`Date: ${reportData.date}`, { align: 'center' })
        .moveDown(1);

      // Summary section
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Summary', { underline: true })
        .moveDown(0.5);

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Total Revenue: $${reportData.totalRevenue}`)
        .text(`Total Transactions: ${reportData.totalTransactions}`)
        .text(
          `Completed: ${reportData.sales.filter((s) => s.status === 'COMPLETED').length}`
        )
        .text(
          `Pending: ${reportData.sales.filter((s) => s.status === 'PENDING').length}`
        )
        .text(
          `Failed: ${reportData.sales.filter((s) => s.status === 'FAILED').length}`
        )
        .moveDown(1);

      // Transactions section
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Transactions', { underline: true })
        .moveDown(0.5);

      if (reportData.sales.length === 0) {
        doc
          .fontSize(11)
          .font('Helvetica-Oblique')
          .text('No transactions for this day.')
          .moveDown();
      } else {
        reportData.sales.forEach((sale, index) => {
          // Add new page if needed
          if (doc.y > 700) {
            doc.addPage();
          }

          doc
            .fontSize(11)
            .font('Helvetica-Bold')
            .text(
              `Transaction #${index + 1} - ${sale.id.substring(0, 8)}...`,
              { continued: false }
            );

          doc
            .fontSize(10)
            .font('Helvetica')
            .text(`Cashier: ${sale.user_username}`)
            .text(`Status: ${sale.status}`)
            .text(
              `Time: ${new Date(sale.created_at).toLocaleTimeString()}`
            )
            .text(`Total: $${sale.total}`)
            .moveDown(0.3);

          // Items
          doc.fontSize(9).font('Helvetica').text('Items:', { indent: 20 });

          sale.items.forEach((item) => {
            doc
              .fontSize(9)
              .text(
                `  • ${item.product_name} x${item.quantity} @ $${item.price_at_sale} = $${item.subtotal}`,
                { indent: 30 }
              );
          });

          doc.moveDown(0.8);
        });
      }

      // Footer
      doc
        .fontSize(8)
        .font('Helvetica-Oblique')
        .text(
          `Generated on ${new Date().toLocaleString()}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );

      // Finalize PDF
      doc.end();

      return doc;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }
}

export const reportsService = new ReportsService();