'use client';

import { useState } from 'react';
import { useInventoryAnalytics } from '@/hooks/useInventoryAnalytics';
import { 
    TrendingUp, 
    AlertTriangle, 
    PackageX, 
    DollarSign, 
    Clock, 
    Loader2, 
    ArrowRight,
    ArrowLeft
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell
} from 'recharts';
import { useRouter } from 'next/navigation';

export default function InventoryAnalyticsPage() {
    const router = useRouter();
    const [days, setDays] = useState<number>(30);
    const { data: analytics, isLoading, error } = useInventoryAnalytics(days);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
                <h2 className="text-xl font-bold text-foreground">Failed to load analytics</h2>
                <p className="text-foreground-muted mt-2">Please try refreshing the page.</p>
            </div>
        );
    }

    if (isLoading || !analytics) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const { summary, topMovingItems, shrinkageList, deadStock } = analytics;

    return (
        <div className="flex flex-col h-full animate-fade-in space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <button 
                        onClick={() => router.push('/admin/inventory')}
                        className="flex items-center gap-2 text-primary hover:underline text-sm font-semibold mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Inventory
                    </button>
                    <h2 className="text-2xl font-bold text-foreground">Inventory Analytics</h2>
                    <p className="text-sm text-foreground-muted mt-0.5">Deep insights into product movement, valuation, and loss.</p>
                </div>
                
                {/* Time Range Selector */}
                <div className="flex bg-background-tertiary p-1 rounded-xl border border-card-border">
                    {[7, 30, 90].map((d) => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                                days === d 
                                    ? 'bg-card text-foreground shadow-sm' 
                                    : 'text-foreground-muted hover:text-foreground'
                            }`}
                        >
                            {d} Days
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card border border-card-border p-5 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-sm text-foreground-subtle font-medium">Total Valuation</p>
                        <h3 className="text-2xl font-bold text-foreground mt-1">${summary.totalValuation.toFixed(2)}</h3>
                        <p className="text-xs text-foreground-muted mt-1">Across {summary.activeProductsCount} active items</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <DollarSign className="w-6 h-6 text-primary" />
                    </div>
                </div>

                <div className="bg-card border border-card-border p-5 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-sm text-foreground-subtle font-medium">Low Stock Alerts</p>
                        <h3 className="text-2xl font-bold text-warning mt-1">{summary.lowStockCount}</h3>
                        <p className="text-xs text-foreground-muted mt-1">Items below minimum</p>
                    </div>
                    <div className="w-12 h-12 bg-warning-muted rounded-full flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-6 h-6 text-warning" />
                    </div>
                </div>

                <div className="bg-card border border-card-border p-5 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-sm text-foreground-subtle font-medium">Total Shrinkage</p>
                        <h3 className="text-2xl font-bold text-destructive mt-1">${summary.totalShrinkageValue.toFixed(2)}</h3>
                        <p className="text-xs text-foreground-muted mt-1">Loss in last {days} days</p>
                    </div>
                    <div className="w-12 h-12 bg-destructive-muted rounded-full flex items-center justify-center shrink-0">
                        <TrendingUp className="w-6 h-6 text-destructive rotate-180" />
                    </div>
                </div>

                <div className="bg-card border border-card-border p-5 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-sm text-foreground-subtle font-medium">Dead Stock</p>
                        <h3 className="text-2xl font-bold text-foreground mt-1">{deadStock.length}</h3>
                        <p className="text-xs text-foreground-muted mt-1">Items with 0 sales</p>
                    </div>
                    <div className="w-12 h-12 bg-background-tertiary rounded-full flex items-center justify-center shrink-0">
                        <PackageX className="w-6 h-6 text-foreground-subtle" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart: Top Moving Items */}
                <div className="bg-card border border-card-border rounded-2xl p-5 shadow-sm">
                    <h3 className="text-lg font-bold text-foreground mb-1">Top Selling Items</h3>
                    <p className="text-sm text-foreground-muted mb-6">Highest quantity sold over the last {days} days</p>
                    
                    <div className="h-72 w-full">
                        {topMovingItems.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topMovingItems} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--card-border))" />
                                    <XAxis type="number" textAnchor="end" tick={{ fill: 'hsl(var(--foreground-muted))', fontSize: 12 }} />
                                    <YAxis 
                                        type="category" 
                                        dataKey="name" 
                                        width={120}
                                        tick={{ fill: 'hsl(var(--foreground-subtle))', fontSize: 12 }} 
                                    />
                                    <Tooltip 
                                        cursor={{ fill: 'hsl(var(--background-tertiary))' }}
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--card-border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                                        itemStyle={{ color: 'hsl(var(--primary))' }}
                                    />
                                    <Bar dataKey="quantity_sold" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                                        {topMovingItems.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-foreground-muted">
                                <Clock className="w-8 h-8 mb-2 opacity-50" />
                                <p>No sales data for this period.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dead Stock Recommendations */}
                <div className="bg-card border border-card-border rounded-2xl p-5 shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Dead Stock Alerts</h3>
                            <p className="text-sm text-foreground-muted">Items taking up shelf space with zero recent sales.</p>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto min-h-[250px] pr-2 custom-scrollbar">
                        {deadStock.length > 0 ? (
                            <div className="space-y-3">
                                {deadStock.map(item => (
                                    <div key={item.id} className="flex justify-between items-center bg-background-tertiary p-3 rounded-xl border border-card-border/50">
                                        <div>
                                            <p className="font-semibold text-sm text-foreground line-clamp-1">{item.name}</p>
                                            <p className="text-xs text-foreground-subtle mt-0.5">{item.category} • {item.sku}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-destructive">${item.value.toFixed(2)}</p>
                                            <p className="text-xs text-foreground-muted mt-0.5">{item.stock} in stock</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-foreground-muted">
                                <PackageX className="w-8 h-8 mb-2 opacity-50" />
                                <p>No dead stock found!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Shrinkage Table */}
            <div className="bg-card border border-card-border rounded-2xl flex flex-col overflow-hidden shadow-sm">
                <div className="p-5 border-b border-card-border">
                    <h3 className="text-lg font-bold text-foreground">Stock Shrinkage Log</h3>
                    <p className="text-sm text-foreground-muted">Recent voids and negative manual adjustments draining value.</p>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-background-tertiary border-b border-card-border text-sm text-foreground-subtle">
                                <th className="px-5 py-3 font-semibold">Date</th>
                                <th className="px-5 py-3 font-semibold">Product</th>
                                <th className="px-5 py-3 font-semibold">Type</th>
                                <th className="px-5 py-3 font-semibold">Qty Lost</th>
                                <th className="px-5 py-3 font-semibold">Value Lost</th>
                                <th className="px-5 py-3 font-semibold hidden md:table-cell">Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shrinkageList.length > 0 ? (
                                shrinkageList.map((item) => (
                                    <tr key={item.id} className="border-b border-card-border hover:bg-card-hover transition-colors text-sm">
                                        <td className="px-5 py-3 text-foreground-muted whitespace-nowrap">
                                            {new Date(item.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-5 py-3">
                                            <p className="font-medium text-foreground">{item.name}</p>
                                            <p className="text-xs text-foreground-subtle font-mono">{item.sku}</p>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${
                                                item.type === 'VOID' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
                                            }`}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 font-bold text-destructive">
                                            -{item.quantity_lost}
                                        </td>
                                        <td className="px-5 py-3 font-medium text-foreground">
                                            ${item.value_lost.toFixed(2)}
                                        </td>
                                        <td className="px-5 py-3 text-foreground-subtle hidden md:table-cell max-w-[200px] truncate">
                                            {item.reason}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-foreground-muted">
                                        <p>No shrinkage recorded in this period.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
