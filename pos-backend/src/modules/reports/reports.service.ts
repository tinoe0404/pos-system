import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { DailyReportData } from './reports.schema';

const prisma = new PrismaClient();

export class ReportsService {
  /**
   * Get daily report data
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
   * Generate PDF report and return as stream
   */
  async generateDailyPDF(dateString?: string): Promise<Readable> {
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