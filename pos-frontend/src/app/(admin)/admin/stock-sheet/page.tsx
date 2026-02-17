'use client';

import { useState } from 'react';
import { downloadStockSheetPDF } from '@/hooks/useStockSheet';
import { Download, Calendar, Loader2, ClipboardList, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

export default function StockSheetPage() {
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDownloadingToday, setIsDownloadingToday] = useState(false);

    const handleDownload = async (date?: string) => {
        const setLoading = date ? setIsDownloading : setIsDownloadingToday;
        setLoading(true);
        try {
            await downloadStockSheetPDF(date || undefined);
            toast.success('Stock sheet downloaded successfully');
        } catch {
            toast.error('Failed to download stock sheet');
        } finally {
            setLoading(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="p-4 lg:p-6 space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-foreground">Daily Stock Sheet</h1>
                    <p className="text-sm text-foreground-muted mt-0.5">
                        Download and print the daily stock sheet for inventory tracking
                    </p>
                </div>
                <button
                    onClick={() => handleDownload()}
                    disabled={isDownloadingToday}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 text-sm"
                >
                    {isDownloadingToday ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    <span>Download Today&apos;s Sheet</span>
                </button>
            </div>

            {/* Info Card */}
            <div className="bg-card p-5 rounded-xl border border-card-border">
                <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-primary-muted text-primary rounded-xl shrink-0">
                        <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-foreground mb-1">
                            TCP Investments Stock Sheet
                        </h2>
                        <p className="text-xs text-foreground-muted leading-relaxed">
                            The stock sheet includes all products grouped by category with columns for
                            Opening Stock, Add-New Stock, Total Stock, Stock Sold, Unit Price, Amount Sold,
                            Closing Stock, and Short Falls. Cigarettes are listed in a separate section.
                            The footer includes fields for Expenses, Cash Received, Signatures, and payment method breakdowns.
                        </p>
                    </div>
                </div>
            </div>

            {/* Date Selector Card */}
            <div className="bg-card p-5 rounded-xl border border-card-border">
                <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-foreground-subtle" />
                    Download for Specific Date
                </h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
                    <div className="w-full sm:w-auto">
                        <label
                            htmlFor="stock-sheet-date"
                            className="block text-xs font-medium text-foreground-muted mb-1.5"
                        >
                            Select Date
                        </label>
                        <input
                            id="stock-sheet-date"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            max={today}
                            className="h-10 px-4 bg-input-bg border border-input-border rounded-lg text-sm text-foreground outline-none focus:border-input-focus focus:ring-2 focus:ring-primary-muted w-full sm:w-auto"
                        />
                    </div>
                    <button
                        onClick={() => handleDownload(selectedDate)}
                        disabled={isDownloading || !selectedDate}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-card border border-card-border text-foreground font-medium rounded-xl hover:bg-background-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {isDownloading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <ClipboardList className="w-4 h-4" />
                        )}
                        <span>Download Stock Sheet</span>
                    </button>
                </div>
            </div>

            {/* Quick Access Info */}
            <div className="bg-card p-5 rounded-xl border border-card-border">
                <h2 className="text-sm font-semibold text-foreground mb-3">What&apos;s Included</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { label: 'Clear Beers', desc: 'Quarts & Pints', color: 'bg-primary-muted text-primary' },
                        { label: 'Spirits', desc: 'Brandy & Whiskey', color: 'bg-warning-muted text-warning' },
                        { label: 'Beverages', desc: 'Soft Drinks & Bartops', color: 'bg-success-muted text-success' },
                        { label: 'Others', desc: 'Cigarettes, Eats & More', color: 'bg-destructive-muted text-destructive' },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className="flex items-center gap-3 p-3 bg-background-secondary rounded-lg border border-card-border"
                        >
                            <div className={`w-2 h-8 rounded-full ${item.color}`} />
                            <div>
                                <p className="text-sm font-medium text-foreground">{item.label}</p>
                                <p className="text-[11px] text-foreground-subtle">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
