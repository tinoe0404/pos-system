"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsService = exports.ReportsService = void 0;
const prisma_1 = __importDefault(require("../../shared/prisma"));
// @ts-ignore
const pdfkit_table_1 = __importDefault(require("pdfkit-table"));
class ReportsService {
    /**
     * Get daily report data (for PDF generation)
     */
    async getDailyReportData(dateString) {
        try {
            // Parse date or use today
            const targetDate = dateString ? new Date(dateString) : new Date();
            // Set to start and end of day
            const startOfDay = new Date(targetDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(targetDate);
            endOfDay.setHours(23, 59, 59, 999);
            // Fetch all sales for the day
            const sales = await prisma_1.default.sale.findMany({
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
            const totalRevenue = completedSales.reduce((sum, sale) => sum + Number(sale.total), 0);
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
        }
        catch (error) {
            console.error('Error fetching daily report data:', error);
            throw error;
        }
    }
    /**
     * Get daily JSON report (for charts)
     */
    async getDailyJsonReport(dateString) {
        try {
            const targetDate = dateString ? new Date(dateString) : new Date();
            const startOfDay = new Date(targetDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(targetDate);
            endOfDay.setHours(23, 59, 59, 999);
            // Get all sales for the day
            const sales = await prisma_1.default.sale.findMany({
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
            const totalRevenue = completedSales.reduce((sum, sale) => sum + Number(sale.total), 0);
            const averageTransactionValue = completedSales.length > 0 ? totalRevenue / completedSales.length : 0;
            // Calculate top products
            const productSales = new Map();
            completedSales.forEach((sale) => {
                sale.items.forEach((item) => {
                    const existing = productSales.get(item.product_id);
                    const itemRevenue = Number(item.price_at_sale) * item.quantity;
                    if (existing) {
                        existing.quantity += item.quantity;
                        existing.revenue += itemRevenue;
                    }
                    else {
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
            const paymentBreakdown = completedSales.reduce((acc, sale) => {
                if (sale.payment_method === 'CASH') {
                    acc.cash += Number(sale.total);
                }
                else if (sale.payment_method === 'ECOCASH') {
                    acc.ecocash += Number(sale.total);
                }
                return acc;
            }, { cash: 0, ecocash: 0 });
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
        }
        catch (error) {
            console.error('Error fetching daily JSON report:', error);
            throw error;
        }
    }
    /**
     * Get weekly JSON report (last 7 days)
     */
    async getWeeklyJsonReport() {
        try {
            const endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 6); // Last 7 days including today
            startDate.setHours(0, 0, 0, 0);
            // Get all sales for the week
            const sales = await prisma_1.default.sale.findMany({
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
            const totalRevenue = completedSales.reduce((sum, sale) => sum + Number(sale.total), 0);
            // Daily breakdown
            const dailyMap = new Map();
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
            const productSales = new Map();
            completedSales.forEach((sale) => {
                sale.items.forEach((item) => {
                    const existing = productSales.get(item.product_id);
                    const itemRevenue = Number(item.price_at_sale) * item.quantity;
                    if (existing) {
                        existing.quantity += item.quantity;
                        existing.revenue += itemRevenue;
                    }
                    else {
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
        }
        catch (error) {
            console.error('Error fetching weekly JSON report:', error);
            throw error;
        }
    }
    /**
     * Get monthly JSON report (last 30 days)
     */
    async getMonthlyJsonReport() {
        try {
            const endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 29); // Last 30 days including today
            startDate.setHours(0, 0, 0, 0);
            // Get all sales for the month
            const sales = await prisma_1.default.sale.findMany({
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
            const totalRevenue = completedSales.reduce((sum, sale) => sum + Number(sale.total), 0);
            // Weekly breakdown (4 weeks + partial week)
            const weeklyMap = new Map();
            // Create 5 week buckets
            for (let i = 0; i < 5; i++) {
                const weekStart = new Date(startDate);
                weekStart.setDate(weekStart.getDate() + i * 7);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                if (weekEnd > endDate)
                    weekEnd.setTime(endDate.getTime());
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
            const productSales = new Map();
            completedSales.forEach((sale) => {
                sale.items.forEach((item) => {
                    const existing = productSales.get(item.product_id);
                    const itemRevenue = Number(item.price_at_sale) * item.quantity;
                    if (existing) {
                        existing.quantity += item.quantity;
                        existing.revenue += itemRevenue;
                    }
                    else {
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
            const categoryMap = new Map();
            completedSales.forEach((sale) => {
                sale.items.forEach((item) => {
                    const category = item.product.category || 'Uncategorized';
                    const existing = categoryMap.get(category);
                    const itemRevenue = Number(item.price_at_sale) * item.quantity;
                    if (existing) {
                        existing.revenue += itemRevenue;
                        existing.transactions += 1;
                    }
                    else {
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
        }
        catch (error) {
            console.error('Error fetching monthly JSON report:', error);
            throw error;
        }
    }
    /**
     * Generate daily PDF report and return as stream
     */
    async generateDailyPDF(dateString) {
        try {
            const reportData = await this.getDailyReportData(dateString);
            const jsonReport = await this.getDailyJsonReport(dateString);
            // @ts-ignore
            const doc = new pdfkit_table_1.default({ margin: 50, size: 'A4' });
            doc.fontSize(20).font('Helvetica-Bold').text('Daily Sales Report', { align: 'center' }).moveDown();
            doc.fontSize(12).font('Helvetica').text(`Date: ${reportData.date}`, { align: 'center' }).moveDown(2);
            // Summary Table
            const summaryTable = {
                title: "Summary",
                headers: ["Metric", "Value"],
                rows: [
                    ["Total Revenue", `$${jsonReport.totalRevenue}`],
                    ["Total Transactions", jsonReport.totalTransactions.toString()],
                    ["Completed Transactions", jsonReport.completedTransactions.toString()],
                    ["Avg. Transaction Value", `$${jsonReport.averageTransactionValue}`]
                ]
            };
            await doc.table(summaryTable, { width: 500 });
            doc.moveDown(1);
            // Payment Breakdown
            const paymentTable = {
                title: "Payment Method Breakdown",
                headers: ["Method", "Revenue"],
                rows: [
                    ["Cash", `$${jsonReport.paymentMethodBreakdown.cash}`],
                    ["EcoCash", `$${jsonReport.paymentMethodBreakdown.ecocash}`]
                ]
            };
            await doc.table(paymentTable, { width: 500 });
            doc.moveDown(1);
            // Top Products
            if (jsonReport.topProducts.length > 0) {
                const topProductsTable = {
                    title: "Top Products",
                    headers: ["Product", "Quantity Sold", "Revenue"],
                    rows: jsonReport.topProducts.map(p => [p.productName, p.quantity.toString(), `$${p.revenue}`])
                };
                await doc.table(topProductsTable, { width: 500 });
                doc.moveDown(1);
            }
            // Transactions
            const txRows = reportData.sales.map(s => [
                s.id.substring(0, 8),
                s.user_username,
                new Date(s.created_at).toLocaleTimeString(),
                s.status,
                `$${s.total}`
            ]);
            const txTable = {
                title: "Transactions List",
                headers: ["ID", "Cashier", "Time", "Status", "Total"],
                rows: txRows
            };
            if (txRows.length > 0) {
                await doc.table(txTable, { width: 500 });
            }
            else {
                doc.fontSize(11).font('Helvetica-Oblique').text('No transactions for this day.').moveDown();
            }
            doc.fontSize(8).font('Helvetica-Oblique').text(`Generated on ${new Date().toLocaleString()}`, 50, doc.page.height - 50, { align: 'center' });
            doc.end();
            return doc;
        }
        catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    }
    /**
     * Generate weekly PDF report and return as stream
     */
    async generateWeeklyPDF() {
        try {
            const jsonReport = await this.getWeeklyJsonReport();
            // @ts-ignore
            const doc = new pdfkit_table_1.default({ margin: 50, size: 'A4' });
            doc.fontSize(20).font('Helvetica-Bold').text('Weekly Sales Report', { align: 'center' }).moveDown();
            doc.fontSize(12).font('Helvetica').text(`Period: ${jsonReport.startDate} to ${jsonReport.endDate}`, { align: 'center' }).moveDown(2);
            // Summary Table
            const summaryTable = {
                title: "Weekly Summary",
                headers: ["Metric", "Value"],
                rows: [
                    ["Total Revenue", `$${jsonReport.totalRevenue}`],
                    ["Total Transactions", jsonReport.totalTransactions.toString()],
                    ["Average Daily Revenue", `$${jsonReport.averageDailyRevenue}`]
                ]
            };
            await doc.table(summaryTable, { width: 500 });
            doc.moveDown(1);
            // Daily Breakdown
            if (jsonReport.dailyBreakdown.length > 0) {
                const dailyTable = {
                    title: "Daily Layout",
                    headers: ["Date", "Transactions", "Revenue"],
                    rows: jsonReport.dailyBreakdown.map(d => [d.date, d.transactions.toString(), `$${d.revenue}`])
                };
                await doc.table(dailyTable, { width: 500 });
                doc.moveDown(1);
            }
            // Top Products
            if (jsonReport.topProducts.length > 0) {
                const topProductsTable = {
                    title: "Top Products",
                    headers: ["Product", "Quantity Sold", "Revenue"],
                    rows: jsonReport.topProducts.map(p => [p.productName, p.quantity.toString(), `$${p.revenue}`])
                };
                await doc.table(topProductsTable, { width: 500 });
                doc.moveDown(1);
            }
            doc.fontSize(8).font('Helvetica-Oblique').text(`Generated on ${new Date().toLocaleString()}`, 50, doc.page.height - 50, { align: 'center' });
            doc.end();
            return doc;
        }
        catch (error) {
            console.error('Error generating Weekly PDF:', error);
            throw error;
        }
    }
    /**
     * Generate monthly PDF report and return as stream
     */
    async generateMonthlyPDF() {
        try {
            const jsonReport = await this.getMonthlyJsonReport();
            // @ts-ignore
            const doc = new pdfkit_table_1.default({ margin: 50, size: 'A4' });
            doc.fontSize(20).font('Helvetica-Bold').text('Monthly Sales Report', { align: 'center' }).moveDown();
            doc.fontSize(12).font('Helvetica').text(`Period: ${jsonReport.startDate} to ${jsonReport.endDate}`, { align: 'center' }).moveDown(2);
            // Summary
            const summaryTable = {
                title: "Monthly Summary",
                headers: ["Metric", "Value"],
                rows: [
                    ["Total Revenue", `$${jsonReport.totalRevenue}`],
                    ["Total Transactions", jsonReport.totalTransactions.toString()],
                    ["Average Daily Revenue", `$${jsonReport.averageDailyRevenue}`]
                ]
            };
            await doc.table(summaryTable, { width: 500 });
            doc.moveDown(1);
            // Weekly Breakdown
            if (jsonReport.weeklyBreakdown.length > 0) {
                const weeklyTable = {
                    title: "Weekly Layout",
                    headers: ["Week", "Transactions", "Revenue"],
                    rows: jsonReport.weeklyBreakdown.map(w => [`${w.weekStart} to ${w.weekEnd}`, w.transactions.toString(), `$${w.revenue}`])
                };
                await doc.table(weeklyTable, { width: 500 });
                doc.moveDown(1);
            }
            // Top Products
            if (jsonReport.topProducts.length > 0) {
                const topProductsTable = {
                    title: "Top Products",
                    headers: ["Product", "Quantity Sold", "Revenue"],
                    rows: jsonReport.topProducts.map(p => [p.productName, p.quantity.toString(), `$${p.revenue}`])
                };
                await doc.table(topProductsTable, { width: 500 });
                doc.moveDown(1);
            }
            // Categories
            if (jsonReport.categoryBreakdown.length > 0) {
                const catTable = {
                    title: "Category Breakdown",
                    headers: ["Category", "Transactions", "Revenue"],
                    rows: jsonReport.categoryBreakdown.map(c => [c.category, c.transactions.toString(), `$${c.revenue}`])
                };
                await doc.table(catTable, { width: 500 });
                doc.moveDown(1);
            }
            doc.fontSize(8).font('Helvetica-Oblique').text(`Generated on ${new Date().toLocaleString()}`, 50, doc.page.height - 50, { align: 'center' });
            doc.end();
            return doc;
        }
        catch (error) {
            console.error('Error generating Monthly PDF:', error);
            throw error;
        }
    }
}
exports.ReportsService = ReportsService;
exports.reportsService = new ReportsService();
