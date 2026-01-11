'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { FileDown, Loader2, DollarSign, ShoppingBag, TrendingUp, AlertCircle } from 'lucide-react';
import SalesChart from '@/components/admin/SalesChart';
import { toast } from 'sonner';

interface DailyReportResponse {
    date: string;
    totalRevenue: string;
    totalTransactions: number;
    completedTransactions: number;
    pendingTransactions: number;
    failedTransactions: number;
    averageTransactionValue: string;
    paymentMethodBreakdown: {
        cash: string;
        ecocash: string;
    };
    topProducts: Array<{
        productId: string;
        productName: string;
        quantity: number;
        revenue: string;
    }>;
}

export default function ReportsPage() {
    const [isDownloading, setIsDownloading] = useState(false);

    const { data: report, isLoading, isError } = useQuery({
        queryKey: ['daily-report'],
        queryFn: async () => {
            const res = await api.get<DailyReportResponse>('/api/reports/daily');
            return res.data;
        },
    });

    const handleDownloadPDF = async () => {
        try {
            setIsDownloading(true);
            const response = await api.get('/api/reports/daily/pdf', {
                responseType: 'blob',
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `daily-sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Report downloaded successfully');
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to download PDF report');
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (isError || !report) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <p>Failed to load sales data. Please try again later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Daily Sales Report</h2>
                    <p className="text-slate-500">Overview for {new Date(report.date).toLocaleDateString()}</p>
                </div>
                <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-4 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isDownloading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <FileDown className="w-5 h-5" />
                    )}
                    Download PDF
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Revenue */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-400">Total Revenue</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-800">${report.totalRevenue}</h3>
                        <p className="text-sm text-slate-500 mt-1">Based on completed sales</p>
                    </div>
                </div>

                {/* Transactions */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-400">Transactions</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-800">{report.completedTransactions}</h3>
                        <div className="flex gap-3 mt-1 text-sm">
                            <span className="text-amber-600">{report.pendingTransactions} Pending</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-red-500">{report.failedTransactions} Failed</span>
                        </div>
                    </div>
                </div>

                {/* Avg Value */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-400">Avg. Transaction</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-800">${report.averageTransactionValue}</h3>
                        <p className="text-sm text-slate-500 mt-1">Per completed sale</p>
                    </div>
                </div>
            </div>

            {/* Charts & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Breakdown Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue by Payment Method</h3>
                    <SalesChart
                        data={{
                            cash: Number(report.paymentMethodBreakdown.cash),
                            ecocash: Number(report.paymentMethodBreakdown.ecocash)
                        }}
                    />
                </div>

                {/* Top Products */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Top Selling Products</h3>
                    <div className="space-y-4">
                        {report.topProducts.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">No sales data available yet.</p>
                        ) : (
                            report.topProducts.map((product, index) => (
                                <div key={product.productId} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-500 text-sm">
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800">{product.productName}</p>
                                            <p className="text-sm text-slate-500">{product.quantity} units sold</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-800">${product.revenue}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
