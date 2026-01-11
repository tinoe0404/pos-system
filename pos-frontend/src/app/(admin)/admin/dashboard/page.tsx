'use client';

import { useAnalytics } from '@/hooks/useAnalytics';
import { useLowStock } from '@/hooks/useLowStock';
import StatCard from '@/components/admin/StatCard';
import { DollarSign, ShoppingCart, AlertCircle, Package } from 'lucide-react';

export default function AdminDashboard() {
    const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
    const { data: lowStock, isLoading: lowStockLoading } = useLowStock();

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
                <p className="text-slate-500">Real-time analytics for today</p>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={analytics?.totalRevenue ? `${Number(analytics.totalRevenue).toFixed(2)}` : '0.00'}
                    icon={DollarSign}
                    gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
                    isLoading={analyticsLoading}
                    prefix="$"
                    subtitle="Today's earnings"
                />

                <StatCard
                    title="Total Sales"
                    value={analytics?.totalTransactions || 0}
                    icon={ShoppingCart}
                    gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                    isLoading={analyticsLoading}
                    subtitle="Completed transactions"
                />

                <StatCard
                    title="Low Stock Items"
                    value={lowStock?.count || 0}
                    icon={AlertCircle}
                    gradient="bg-gradient-to-br from-orange-500 to-orange-600"
                    isLoading={lowStockLoading}
                    subtitle={`Below ${lowStock?.threshold || 10} units`}
                />

                <StatCard
                    title="Total Stock"
                    value={analytics?.totalStock || 0}
                    icon={Package}
                    gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                    isLoading={analyticsLoading}
                    subtitle="Units in inventory"
                />
            </div>

            {/* Quick Actions or Additional Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        Low Stock Alerts
                    </h3>
                    {lowStockLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : lowStock?.lowStockProducts.length ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {lowStock.lowStockProducts.slice(0, 5).map((product) => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100"
                                >
                                    <div>
                                        <p className="font-medium text-slate-800 text-sm">{product.name}</p>
                                        <p className="text-xs text-slate-500">{product.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-orange-600">{product.stock} left</p>
                                        <p className="text-xs text-slate-400">SKU: {product.sku}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-sm">All products are well stocked! 🎉</p>
                    )}
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                    <h3 className="font-bold mb-2">Quick Stats</h3>
                    <p className="text-blue-100 text-sm mb-4">
                        Today's performance at a glance
                    </p>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                            <span className="text-sm">Average Order Value</span>
                            <span className="font-bold">
                                ${analytics?.totalTransactions
                                    ? (Number(analytics.totalRevenue) / analytics.totalTransactions).toFixed(2)
                                    : '0.00'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                            <span className="text-sm">Inventory Value</span>
                            <span className="font-bold">Live Data</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
