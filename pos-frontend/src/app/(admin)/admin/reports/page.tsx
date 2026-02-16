'use client';

import { useDailyReport, downloadDailyReportPDF } from '@/hooks/useReports';
import { useState } from 'react';
import { Download, Calendar, DollarSign, ShoppingCart, TrendingUp, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const { data, isLoading, error } = useDailyReport(selectedDate);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            await downloadDailyReportPDF(selectedDate);
            toast.success('Report downloaded successfully');
        } catch {
            toast.error('Failed to download report');
        } finally {
            setIsDownloading(false);
        }
    };

    if (error) {
        return (
            <div className="p-4 lg:p-6">
                <div className="bg-destructive-muted text-destructive p-4 rounded-xl text-sm">
                    Failed to load report. Please try again.
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-foreground">Daily Reports</h1>
                    <p className="text-sm text-foreground-muted mt-0.5">View and download daily sales reports</p>
                </div>
                <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading || isLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 text-sm"
                >
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    <span>Download PDF</span>
                </button>
            </div>

            {/* Date Selector */}
            <div className="bg-card p-4 rounded-xl border border-card-border">
                <label htmlFor="date" className="flex items-center gap-2 text-sm font-medium text-foreground-muted mb-2">
                    <Calendar className="w-4 h-4" />
                    Select Date
                </label>
                <input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="h-10 px-4 bg-input-bg border border-input-border rounded-lg text-sm text-foreground outline-none focus:border-input-focus focus:ring-2 focus:ring-primary-muted w-full sm:w-auto"
                />
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-foreground-muted text-sm">Loading report...</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { label: 'Total Sales', value: data?.totalSales || 0, sub: 'Transactions', icon: ShoppingCart, color: 'bg-primary-muted text-primary' },
                            { label: 'Total Revenue', value: `$${data?.totalRevenue || '0.00'}`, sub: 'USD', icon: DollarSign, color: 'bg-success-muted text-success' },
                            {
                                label: 'Avg. Transaction',
                                value: `$${data?.totalSales && data?.totalRevenue ? (parseFloat(data.totalRevenue) / data.totalSales).toFixed(2) : '0.00'}`,
                                sub: 'Per sale',
                                icon: TrendingUp,
                                color: 'bg-warning-muted text-warning',
                            },
                        ].map((card) => (
                            <div key={card.label} className="bg-card p-5 rounded-xl border border-card-border">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-medium text-foreground-muted">{card.label}</span>
                                    <div className={`p-2 rounded-lg ${card.color}`}>
                                        <card.icon className="w-4 h-4" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                                <p className="text-[11px] text-foreground-subtle mt-1">{card.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Top Products */}
                    <div className="bg-card p-5 rounded-xl border border-card-border">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-4 h-4 text-foreground-subtle" />
                            <h2 className="text-sm font-semibold text-foreground">Top Products</h2>
                        </div>
                        {data?.topProducts && data.topProducts.length > 0 ? (
                            <div className="space-y-1">
                                {data.topProducts.map((product, index) => (
                                    <div key={index} className="flex items-center justify-between py-2.5 border-b border-card-border last:border-0">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <span className="w-6 h-6 flex items-center justify-center bg-primary-muted text-primary rounded-md text-[11px] font-bold shrink-0">
                                                {index + 1}
                                            </span>
                                            <span className="font-medium text-foreground text-sm truncate">{product.name}</span>
                                        </div>
                                        <div className="text-right shrink-0 ml-2">
                                            <p className="text-sm font-bold text-foreground">{product.quantity} sold</p>
                                            <p className="text-[11px] text-foreground-subtle">${product.revenue}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <FileText className="w-6 h-6 text-foreground-subtle mx-auto mb-2" />
                                <p className="text-sm text-foreground-muted">No sales data for this date</p>
                            </div>
                        )}
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-card p-5 rounded-xl border border-card-border">
                        <h2 className="text-sm font-semibold text-foreground mb-4">Payment Methods</h2>
                        {data?.paymentMethods && Object.keys(data.paymentMethods).length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {Object.entries(data.paymentMethods).map(([method, count]) => {
                                    const total = Object.values(data.paymentMethods).reduce((a, b) => a + (b as number), 0);
                                    const pct = total > 0 ? ((count as number) / total * 100) : 0;
                                    return (
                                        <div key={method} className="bg-background-secondary p-4 rounded-xl border border-card-border">
                                            <p className="text-xs text-foreground-muted mb-1">{method}</p>
                                            <p className="text-2xl font-bold text-foreground">{count as number}</p>
                                            <div className="mt-2 h-1.5 bg-background-tertiary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <p className="text-[11px] text-foreground-subtle mt-1">{pct.toFixed(0)}% of transactions</p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <p className="text-sm text-foreground-muted">No payment data available</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
