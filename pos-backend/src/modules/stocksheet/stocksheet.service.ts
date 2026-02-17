import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';

const prisma = new PrismaClient();

// Category display order matching the TCP Investments stock sheet
const CATEGORY_ORDER = [
    'Clear Beers Quarts',
    'Clear Beers Pints',
    'Brandy',
    'Bartops',
    'Soft Drinks',
    'Whiskey',
    'Ma Eats',
];

// Cigarettes is rendered as a separate section at the bottom
const CIGARETTES_CATEGORY = 'Cigarettes';

interface StockSheetRow {
    name: string;
    openingStock: number;
    addNewStock: number;
    totalStock: number;
    stockSold: number;
    unitPrice: number;
    amountSold: number;
    closingStock: number;
    shortFalls: number;
}

interface CategorySection {
    category: string;
    rows: StockSheetRow[];
}

export class StockSheetService {
    /**
     * Gather all data needed for the stock sheet on a given date
     */
    async getStockSheetData(dateString?: string) {
        const targetDate = dateString ? new Date(dateString) : new Date();

        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        // 1. Get all active products
        const products = await prisma.product.findMany({
            where: { is_active: true },
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
        });

        // 2. Get all completed sale items for the day
        const saleItems = await prisma.saleItem.findMany({
            where: {
                sale: {
                    status: 'COMPLETED',
                    created_at: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
            },
            select: {
                product_id: true,
                quantity: true,
            },
        });

        // 3. Aggregate sold quantities per product
        const soldMap = new Map<string, number>();
        saleItems.forEach((item) => {
            const current = soldMap.get(item.product_id) || 0;
            soldMap.set(item.product_id, current + item.quantity);
        });

        // 4. Build rows per product
        const categoryMap = new Map<string, StockSheetRow[]>();

        products.forEach((product) => {
            const category = product.category || 'Other';
            const stockSold = soldMap.get(product.id) || 0;
            const closingStock = product.stock;
            const unitPrice = Number(product.price);

            // Opening stock = closing + sold (approximation without add-new tracking)
            const openingStock = closingStock + stockSold;
            const addNewStock = 0; // No restock tracking model yet
            const totalStock = openingStock + addNewStock;
            const amountSold = stockSold * unitPrice;
            const shortFalls = totalStock - stockSold - closingStock;

            const row: StockSheetRow = {
                name: product.name,
                openingStock,
                addNewStock,
                totalStock,
                stockSold,
                unitPrice,
                amountSold,
                closingStock,
                shortFalls,
            };

            if (!categoryMap.has(category)) {
                categoryMap.set(category, []);
            }
            categoryMap.get(category)!.push(row);
        });

        // 5. Sort categories according to CATEGORY_ORDER
        const mainSections: CategorySection[] = [];
        let cigarettesSection: CategorySection | null = null;

        // First, add categories in the defined order
        for (const cat of CATEGORY_ORDER) {
            const rows = categoryMap.get(cat);
            if (rows && rows.length > 0) {
                mainSections.push({ category: cat, rows });
                categoryMap.delete(cat);
            }
        }

        // Pull out cigarettes
        const cigRows = categoryMap.get(CIGARETTES_CATEGORY);
        if (cigRows && cigRows.length > 0) {
            cigarettesSection = { category: CIGARETTES_CATEGORY, rows: cigRows };
            categoryMap.delete(CIGARETTES_CATEGORY);
        }

        // Add any remaining categories not in CATEGORY_ORDER
        for (const [cat, rows] of categoryMap.entries()) {
            if (rows.length > 0) {
                mainSections.push({ category: cat, rows });
            }
        }

        // 6. Compute totals for the footer
        const allRows = [
            ...mainSections.flatMap((s) => s.rows),
            ...(cigarettesSection?.rows || []),
        ];
        const totalAmountSold = allRows.reduce((sum, r) => sum + r.amountSold, 0);

        return {
            date: startOfDay,
            mainSections,
            cigarettesSection,
            totalAmountSold,
        };
    }

    /**
     * Generate the TCP Investments Daily Stock Sheet PDF
     */
    async generateStockSheetPDF(dateString?: string): Promise<PDFKit.PDFDocument> {
        const data = await this.getStockSheetData(dateString);

        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 30, bottom: 30, left: 30, right: 30 },
        });

        const pageWidth = doc.page.width - 60; // margins

        // ==================== HEADER ====================
        doc
            .fontSize(14)
            .font('Helvetica-Bold')
            .text('TCP INVESTMENTS- DAILY STOCK SHEET', { align: 'center' })
            .moveDown(0.4);

        const dateStr = data.date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

        doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .text(`CASHIER'S NAME ........................   DATE: ${dateStr}`, {
                align: 'center',
            })
            .moveDown(0.8);

        // ==================== MAIN TABLE ====================
        this.drawMainTable(doc, data.mainSections, pageWidth);

        // ==================== CIGARETTES SECTION ====================
        if (data.cigarettesSection) {
            doc.moveDown(1.5);
            this.drawCigarettesSection(doc, data.cigarettesSection, pageWidth);
        }

        // ==================== FOOTER ====================
        doc.moveDown(1);
        this.drawFooter(doc, data.totalAmountSold, pageWidth);

        doc.end();
        return doc;
    }

    // ====================== DRAWING HELPERS ======================

    private drawMainTable(
        doc: PDFKit.PDFDocument,
        sections: CategorySection[],
        pageWidth: number
    ) {
        // Column widths
        const col = {
            items: pageWidth * 0.22,
            opening: pageWidth * 0.09,
            addNew: pageWidth * 0.09,
            total: pageWidth * 0.09,
            sold: pageWidth * 0.09,
            price: pageWidth * 0.09,
            amount: pageWidth * 0.11,
            closing: pageWidth * 0.11,
            short: pageWidth * 0.11,
        };

        const colWidths = [
            col.items, col.opening, col.addNew, col.total,
            col.sold, col.price, col.amount, col.closing, col.short,
        ];
        const headers = [
            'ITEMS', 'Opening\nStock', 'Add-New\nStock', 'Total\nStock',
            'Stock\nsold', 'Unit\nPrice', 'Amount\nSold', 'Closing\nStock', 'Short\nFalls',
        ];

        let startX = 30;
        let y = doc.y;
        const rowHeight = 18;
        const headerHeight = 28;

        // Draw table header
        doc.fontSize(7).font('Helvetica-Bold');

        // Header background
        doc
            .rect(startX, y, pageWidth, headerHeight)
            .fillAndStroke('#f0f0f0', '#000000');

        let x = startX;
        headers.forEach((header, i) => {
            doc.fillColor('#000000');
            doc.text(header, x + 2, y + 3, {
                width: colWidths[i] - 4,
                height: headerHeight,
                align: 'center',
            });
            // Column separator
            if (i > 0) {
                doc
                    .moveTo(x, y)
                    .lineTo(x, y + headerHeight)
                    .stroke();
            }
            x += colWidths[i];
        });

        y += headerHeight;

        // Draw category sections and rows
        for (const section of sections) {
            // Check for page break
            if (y + rowHeight * (section.rows.length + 1) > doc.page.height - 80) {
                doc.addPage();
                y = 30;
            }

            // Category header row
            doc.rect(startX, y, pageWidth, rowHeight).fillAndStroke('#ffffff', '#000000');
            doc
                .fillColor('#000000')
                .fontSize(8)
                .font('Helvetica-Bold')
                .text(section.category, startX + 4, y + 4, {
                    width: col.items - 8,
                });
            y += rowHeight;

            // Product rows
            doc.font('Helvetica').fontSize(7);
            for (const row of section.rows) {
                if (y + rowHeight > doc.page.height - 80) {
                    doc.addPage();
                    y = 30;
                }

                // Row border
                doc.rect(startX, y, pageWidth, rowHeight).stroke();

                const values = [
                    row.name,
                    row.openingStock > 0 ? row.openingStock.toString() : '',
                    row.addNewStock > 0 ? row.addNewStock.toString() : '',
                    row.totalStock > 0 ? row.totalStock.toString() : '',
                    row.stockSold > 0 ? row.stockSold.toString() : '',
                    row.unitPrice > 0 ? row.unitPrice.toFixed(2) : '',
                    row.amountSold > 0 ? row.amountSold.toFixed(2) : '',
                    row.closingStock > 0 ? row.closingStock.toString() : '',
                    row.shortFalls !== 0 ? row.shortFalls.toString() : '',
                ];

                x = startX;
                values.forEach((val, i) => {
                    // Column separator
                    if (i > 0) {
                        doc.moveTo(x, y).lineTo(x, y + rowHeight).stroke();
                    }
                    doc.fillColor('#000000').text(val, x + 2, y + 5, {
                        width: colWidths[i] - 4,
                        align: i === 0 ? 'left' : 'center',
                    });
                    x += colWidths[i];
                });

                y += rowHeight;
            }
        }

        doc.y = y;
    }

    private drawCigarettesSection(
        doc: PDFKit.PDFDocument,
        section: CategorySection,
        pageWidth: number
    ) {
        let y = doc.y;
        const startX = 30;
        const colWidth = pageWidth * 0.25;
        const rowHeight = 18;

        // Check for page break
        if (y + rowHeight * (section.rows.length + 2) > doc.page.height - 120) {
            doc.addPage();
            y = 30;
        }

        // Section header
        doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .fillColor('#000000')
            .text('Cigarettes', startX, y)
            .moveDown(0.3);

        y = doc.y;

        // Simple table: just product names with empty cells for manual fill
        doc.fontSize(7).font('Helvetica');
        for (const row of section.rows) {
            if (y + rowHeight > doc.page.height - 120) {
                doc.addPage();
                y = 30;
            }

            doc.rect(startX, y, colWidth, rowHeight).stroke();
            doc
                .fillColor('#000000')
                .text(row.name, startX + 4, y + 5, { width: colWidth - 8 });

            y += rowHeight;
        }

        doc.y = y;
    }

    private drawFooter(
        doc: PDFKit.PDFDocument,
        totalAmountSold: number,
        pageWidth: number
    ) {
        let y = doc.y;
        const startX = 30;

        // Check for page break
        if (y + 120 > doc.page.height - 30) {
            doc.addPage();
            y = 30;
        }

        doc.fontSize(8).font('Helvetica').fillColor('#000000');

        // Expenses / Total Stock Sales / Short/Surplus line
        doc.text(
            `Expenses .......................   Total Stock Sales: $${totalAmountSold.toFixed(2)}   Short/Surplus.....................`,
            startX,
            y
        );
        y += 20;

        // Total Cash Received / Signatures
        doc.text(
            `Total Cash Received..................   Cashier's Signature.......................   Manager's Signature.......................`,
            startX,
            y
        );
        y += 25;

        // Payment method boxes
        const boxWidth = pageWidth / 5;
        const boxHeight = 28;
        const methods = ['USD', 'RTGS', 'ECOCASH', 'SWIPE', 'TOKEN'];

        methods.forEach((method, i) => {
            const bx = startX + i * boxWidth;
            doc.rect(bx, y, boxWidth, boxHeight).stroke();
            doc
                .fontSize(8)
                .font('Helvetica-Bold')
                .text(method, bx, y + 4, {
                    width: boxWidth,
                    align: 'center',
                });
            // Draw a line inside the box for writing
            doc
                .moveTo(bx + 5, y + boxHeight - 8)
                .lineTo(bx + boxWidth - 5, y + boxHeight - 8)
                .stroke();
        });

        y += boxHeight + 10;

        // Balance note
        doc
            .fontSize(7)
            .font('Helvetica-BoldOblique')
            .fillColor('#cc0000')
            .text('Balance your stock Plus Empties.', startX, y, { align: 'center' });

        doc.y = y + 15;
    }
}

export const stockSheetService = new StockSheetService();
