'use client';

import { useDailyReport, downloadDailyReportPDF } from '@/hooks/useReports';
import { useState } from 'react';
import { Download, Calendar, DollarSign, ShoppingCart, TrendingUp, Loader2 } from 'lucide-react';
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
        } catch (error) {
            toast.error('Failed to download report');
        } finally {
            setIsDownloading(false);
        }
    };

    if (error) {
        return (
            <div className="p-4 md:p-8">
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    Failed to load report. Please try again.
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Daily Reports</h1>
                    <p className="text-sm text-slate-500 mt-1">View and download daily sales reports</p>
                </div>
                <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading || isLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                    {isDownloading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    <span className="font-medium">Download PDF</span>
                </button>
            </div>

            {/* Date Selector */}
            <div className="mb-6">
                <label htmlFor="date" className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    Select Date
                </label>
                <input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
                />
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-slate-500">Total Sales</h3>
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <ShoppingCart className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">{data?.totalSales || 0}</p>
                            <p className="text-xs text-slate-400 mt-1">Transactions</p>
                        </div>

                        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-slate-500">Total Revenue</h3>
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">${data?.totalRevenue || '0.00'}</p>
                            <p className="text-xs text-slate-400 mt-1">USD</p>
                        </div>

                        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 sm:col-span-2 lg:col-span-1">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-slate-500">Avg. Transaction</h3>
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-slate-900">
                                ${data?.totalSales && data?.totalRevenue
                                    ? (parseFloat(data.totalRevenue) / data.totalSales).toFixed(2)
                                    : '0.00'}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">Per sale</p>
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Top Products</h2>
                        {data?.topProducts && data.topProducts.length > 0 ? (
                            <div className="space-y-3">
                                {data.topProducts.map((product, index) => (
                                    <div key={index} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-600 rounded-full text-sm font-bold">
                                                {index + 1}
                                            </span>
                                            <span className="font-medium text-slate-800">{product.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900">{product.quantity} sold</p>
                                            <p className="text-sm text-slate-500">${product.revenue}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-center py-8">No sales data for this date</p>
                        )}
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Payment Methods</h2>
                        {data?.paymentMethods && Object.keys(data.paymentMethods).length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(data.paymentMethods).map(([method, count]) => (
                                    <div key={method} className="p-4 bg-slate-50 rounded-lg">
                                        <p className="text-sm text-slate-500 mb-1">{method}</p>
                                        <p className="text-2xl font-bold text-slate-900">{count as number}</p>
                                        <p className="text-xs text-slate-400">transactions</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-center py-8">No payment data available</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
