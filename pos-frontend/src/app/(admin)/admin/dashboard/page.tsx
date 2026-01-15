'use client';

import { useAnalytics, useBestSellers } from '@/hooks/useAnalytics';
import { useLowStock } from '@/hooks/useLowStock';
import { DollarSign, ShoppingCart, Package, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';

export default function DashboardPage() {
    const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
    const { data: bestSellers, isLoading: bestSellersLoading } = useBestSellers(5);
    const { data: lowStock, isLoading: lowStockLoading } = useLowStock();

    const isLoading = analyticsLoading || bestSellersLoading || lowStockLoading;

    return (
        <div className="p-4 md:p-8">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">Overview of your business metrics</p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-slate-500">Total Revenue</h3>
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-2xl md:text-3xl font-bold text-slate-900">
                                ${analytics?.totalRevenue || '0.00'}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">Today</p>
                        </div>

                        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-slate-500">Transactions</h3>
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <ShoppingCart className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-2xl md:text-3xl font-bold text-slate-900">
                                {analytics?.totalTransactions || 0}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">Today</p>
                        </div>

                        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-slate-500">Total Stock</h3>
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <Package className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-2xl md:text-3xl font-bold text-slate-900">
                                {analytics?.totalStock || 0}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">Items in inventory</p>
                        </div>

                        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-slate-500">Avg. Sale</h3>
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-2xl md:text-3xl font-bold text-slate-900">
                                ${analytics?.totalTransactions && analytics?.totalRevenue
                                    ? (parseFloat(analytics.totalRevenue) / analytics.totalTransactions).toFixed(2)
                                    : '0.00'}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">Per transaction</p>
                        </div>
                    </div>

                    {/* Best Sellers & Low Stock */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Best Sellers Widget */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-slate-800">Top Products</h2>
                                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                            </div>
                            {bestSellers?.products && bestSellers.products.length > 0 ? (
                                <div className="space-y-3">
                                    {bestSellers.products.map((product, index) => (
                                        <div key={product.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <span className="w-7 h-7 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-xs font-bold shrink-0">
                                                    {index + 1}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-slate-800 truncate">{product.name}</p>
                                                    <p className="text-xs text-slate-400">{product.category}</p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 ml-2">
                                                <p className="font-bold text-slate-900">{product.totalSold}</p>
                                                <p className="text-xs text-slate-500">${product.totalRevenue}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400 text-center py-8">No sales data available</p>
                            )}
                        </div>

                        {/* Low Stock Alerts */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-slate-800">Low Stock Alerts</h2>
                                    {lowStock?.count ? (
                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                            {lowStock.count}
                                        </span>
                                    ) : null}
                                </div>
                                <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                                    <AlertTriangle className="w-4 h-4" />
                                </div>
                            </div>
                            {lowStock?.lowStockProducts && lowStock.lowStockProducts.length > 0 ? (
                                <div className="space-y-3">
                                    {lowStock.lowStockProducts.slice(0, 5).map((product) => (
                                        <div key={product.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-800 truncate">{product.name}</p>
                                                <p className="text-xs text-slate-400">{product.sku}</p>
                                            </div>
                                            <div className="shrink-0 ml-2">
                                                <span className="px-2 py-1 bg-red-50 text-red-700 text-sm font-bold rounded">
                                                    {product.stock} left
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-emerald-600 text-center py-8 flex items-center justify-center gap-2">
                                    <Package className="w-5 h-5" />
                                    All products well stocked
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
