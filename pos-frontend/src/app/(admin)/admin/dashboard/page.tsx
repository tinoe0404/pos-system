'use client';

import { useAnalytics, useBestSellers } from '@/hooks/useAnalytics';
import { useLowStock } from '@/hooks/useLowStock';
import {
    DollarSign, ShoppingCart, Package, TrendingUp, AlertTriangle, Loader2,
    ArrowRight, LayoutGrid, Plus, FileText
} from 'lucide-react';
import Link from 'next/link';
import SalesChart from '@/components/admin/SalesChart';
import { useReports } from '@/hooks/useReports';

export default function DashboardPage() {
    const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
    const { data: bestSellers, isLoading: bestSellersLoading } = useBestSellers(5);
    const { data: lowStock, isLoading: lowStockLoading } = useLowStock();
    const { data: reports } = useReports();

    const isLoading = analyticsLoading || bestSellersLoading || lowStockLoading;

    const statCards = [
        {
            label: 'Total Revenue',
            value: `$${analytics?.totalRevenue || '0.00'}`,
            sub: 'Today',
            icon: DollarSign,
            iconBg: 'bg-success-muted text-success',
        },
        {
            label: 'Transactions',
            value: analytics?.totalTransactions || 0,
            sub: 'Today',
            icon: ShoppingCart,
            iconBg: 'bg-primary-muted text-primary',
        },
        {
            label: 'Total Stock',
            value: analytics?.totalStock || 0,
            sub: 'Items in inventory',
            icon: Package,
            iconBg: 'bg-warning-muted text-warning',
        },
        {
            label: 'Avg. Sale',
            value: `$${
                analytics?.totalTransactions && analytics?.totalRevenue
                    ? (parseFloat(analytics.totalRevenue) / analytics.totalTransactions).toFixed(2)
                    : '0.00'
            }`,
            sub: 'Per transaction',
            icon: TrendingUp,
            iconBg: 'bg-primary-muted text-primary',
        },
    ];

    return (
        <div className="p-4 lg:p-6">
            {/* Page Title */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
                    <p className="text-sm text-foreground-muted mt-0.5">Overview of your business metrics</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-foreground-muted text-sm">Loading dashboard...</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            { label: 'Go to POS', href: '/pos', icon: LayoutGrid },
                            { label: 'Add Product', href: '/admin/inventory', icon: Plus },
                            { label: 'View Reports', href: '/admin/reports', icon: FileText },
                        ].map((action) => (
                            <Link
                                key={action.label}
                                href={action.href}
                                className="flex items-center gap-2 px-4 py-2 bg-card border border-card-border rounded-lg text-sm text-foreground-muted hover:text-foreground hover:border-border-hover transition-colors"
                            >
                                <action.icon className="w-4 h-4" />
                                {action.label}
                            </Link>
                        ))}
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {statCards.map((card, i) => (
                            <div key={i} className="bg-card p-4 rounded-xl border border-card-border stagger-item">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-medium text-foreground-muted">{card.label}</span>
                                    <div className={`p-2 rounded-lg ${card.iconBg}`}>
                                        <card.icon className="w-4 h-4" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                                <p className="text-[11px] text-foreground-subtle mt-1">{card.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Chart Row */}
                    {reports?.paymentBreakdown && (
                        <div className="bg-card p-5 rounded-xl border border-card-border">
                            <h2 className="text-sm font-semibold text-foreground mb-4">Revenue by Payment Method</h2>
                            <SalesChart data={reports.paymentBreakdown} />
                        </div>
                    )}

                    {/* Best Sellers & Low Stock */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Best Sellers */}
                        <div className="bg-card p-5 rounded-xl border border-card-border">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-semibold text-foreground">Top Products</h2>
                                <TrendingUp className="w-4 h-4 text-foreground-subtle" />
                            </div>
                            {bestSellers?.products && bestSellers.products.length > 0 ? (
                                <div className="space-y-1">
                                    {bestSellers.products.map((product, index) => (
                                        <div key={product.id} className="flex items-center justify-between py-2.5 border-b border-card-border last:border-0">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <span className="w-6 h-6 flex items-center justify-center bg-primary-muted text-primary rounded-md text-[11px] font-bold shrink-0">
                                                    {index + 1}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                                                    <p className="text-[11px] text-foreground-subtle">{product.category}</p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 ml-2">
                                                <p className="text-sm font-bold text-foreground">{product.totalSold}</p>
                                                <p className="text-[11px] text-foreground-subtle">${product.totalRevenue}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <p className="text-sm text-foreground-muted">No sales data available</p>
                                </div>
                            )}
                        </div>

                        {/* Low Stock Alerts */}
                        <div className="bg-card p-5 rounded-xl border border-card-border">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-sm font-semibold text-foreground">Low Stock Alerts</h2>
                                    {lowStock?.count ? (
                                        <span className="px-1.5 py-0.5 bg-destructive-muted text-destructive text-[11px] font-bold rounded-full">
                                            {lowStock.count}
                                        </span>
                                    ) : null}
                                </div>
                                <AlertTriangle className="w-4 h-4 text-foreground-subtle" />
                            </div>
                            {lowStock?.lowStockProducts && lowStock.lowStockProducts.length > 0 ? (
                                <div className="space-y-1">
                                    {lowStock.lowStockProducts.slice(0, 5).map((product) => (
                                        <div key={product.id} className="flex items-center justify-between py-2.5 border-b border-card-border last:border-0">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                                                <p className="text-[11px] text-foreground-subtle">{product.sku}</p>
                                            </div>
                                            <span className={`shrink-0 ml-2 px-2 py-0.5 text-[11px] font-bold rounded-full ${
                                                product.stock === 0
                                                    ? 'bg-destructive-muted text-destructive'
                                                    : 'bg-warning-muted text-warning'
                                            }`}>
                                                {product.stock} left
                                            </span>
                                        </div>
                                    ))}
                                    {lowStock.count > 5 && (
                                        <Link href="/admin/inventory" className="flex items-center justify-center gap-1 py-2 text-xs text-primary hover:text-primary-hover transition-colors">
                                            View all {lowStock.count} items <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <Package className="w-6 h-6 text-success mx-auto mb-2" />
                                    <p className="text-sm text-foreground-muted">All products well stocked</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
