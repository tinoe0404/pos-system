'use client';

import { useSales, Sale } from '@/hooks/useSales';
import { Loader2, Receipt, Eye, Search, ClipboardList, Trash2, RotateCcw } from 'lucide-react';
import { useState, useMemo } from 'react';
import ReceiptModal from '@/components/pos/ReceiptModal';
import PinModal from '@/components/pos/PinModal';
import RefundModal from '@/components/pos/RefundModal';
import { CartItem } from '@/store/useCartStore';
import { voidSale } from '@/lib/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function OrdersPage() {
    const { data, isLoading } = useSales();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');

    // State for modals
    const [selectedOrder, setSelectedOrder] = useState<{
        order: Sale;
        action: 'view' | 'reprint';
    } | null>(null);
    const [voidOrder, setVoidOrder] = useState<Sale | null>(null);
    const [refundOrder, setRefundOrder] = useState<Sale | null>(null);

    const getReceiptData = (sale: Sale) => ({
        id: sale.id,
        items: sale.items.map((item) => ({
            id: item.productId,
            name: item.productName,
            price: item.price,
            quantity: item.quantity,
        } as CartItem)),
        total: sale.total,
        date: sale.createdAt,
        paymentMethod: sale.paymentMethod as 'CASH' | 'ECOCASH' | 'TAB',
        tax: sale.total * 0.1,
    });

    const handleVoidVerify = async (pin: string) => {
        if (!voidOrder) return false;
        try {
            await voidSale(voidOrder.id, "Manager Void", pin);
            toast.success('Sale voided successfully');
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            setVoidOrder(null);
            return true;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to void sale');
            return false;
        }
    };

    const handleRefundSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['sales'] });
        setRefundOrder(null);
    };

    const filteredSales = useMemo(() => {
        if (!data?.sales) return [];
        if (!searchQuery) return data.sales;
        return data.sales.filter((sale) =>
            sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sale.items.some((item) => item.productName.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [data?.sales, searchQuery]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-foreground-muted text-sm">Loading transactions...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <header className="px-6 py-4 border-b border-card-border shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h1 className="text-lg font-semibold text-foreground">Transaction History</h1>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by ID or product..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 bg-card border border-card-border rounded-lg text-sm text-foreground outline-none focus:border-input-focus focus:ring-2 focus:ring-primary-muted placeholder:text-foreground-subtle"
                        />
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-auto p-4 lg:p-6">
                {filteredSales.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-foreground-muted">
                        <div className="bg-background-tertiary p-5 rounded-2xl mb-4">
                            <ClipboardList className="w-8 h-8 text-foreground-subtle" />
                        </div>
                        <p className="text-base font-medium text-foreground">No transactions found</p>
                        <p className="text-sm text-foreground-muted mt-1">
                            {searchQuery ? 'Try a different search term' : 'Completed orders will appear here'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block bg-card rounded-xl border border-card-border overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-background-secondary border-b border-card-border">
                                    <tr>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-foreground-subtle uppercase tracking-wider">Receipt ID</th>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-foreground-subtle uppercase tracking-wider">Time</th>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-foreground-subtle uppercase tracking-wider">Status</th>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-foreground-subtle uppercase tracking-wider">Items</th>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-foreground-subtle uppercase tracking-wider">Total</th>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-foreground-subtle uppercase tracking-wider">Payment</th>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-foreground-subtle uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-card-border">
                                    {filteredSales.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-card-hover transition-colors">
                                            <td className="px-5 py-3.5 text-sm font-mono text-foreground-muted">
                                                #{sale.id.slice(-8).toUpperCase()}
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-foreground-muted">
                                                {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${sale.status === 'VOIDED' ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                                                    }`}>
                                                    {sale.status || 'COMPLETED'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-foreground-muted">
                                                <div className="truncate max-w-[200px]" title={sale.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}>
                                                    {sale.items.slice(0, 2).map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                                                    {sale.items.length > 2 && ` +${sale.items.length - 2} more`}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm font-bold text-foreground">
                                                ${sale.total.toFixed(2)}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${sale.paymentMethod === 'CASH' ? 'bg-success-muted text-success' : 'bg-primary-muted text-primary'
                                                    }`}>
                                                    {sale.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => setSelectedOrder({ order: sale, action: 'reprint' })}
                                                        className="p-2 text-foreground-subtle hover:text-foreground hover:bg-background-tertiary rounded-lg transition-colors"
                                                        title="Reprint"
                                                    >
                                                        <Receipt className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedOrder({ order: sale, action: 'view' })}
                                                        className="p-2 text-foreground-subtle hover:text-foreground hover:bg-background-tertiary rounded-lg transition-colors"
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {/* Refund Button */}
                                                    {sale.status === 'COMPLETED' && (
                                                        <button
                                                            onClick={() => setRefundOrder(sale)}
                                                            className="p-2 text-foreground-subtle hover:text-warning hover:bg-warning-muted rounded-lg transition-colors"
                                                            title="Refund"
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {/* Void Button */}
                                                    {sale.status !== 'VOIDED' && (
                                                        <button
                                                            onClick={() => setVoidOrder(sale)}
                                                            className="p-2 text-foreground-subtle hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                                            title="Void Sale"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card Layout */}
                        <div className="md:hidden space-y-3">
                            {filteredSales.map((sale) => (
                                <div key={sale.id} className="bg-card rounded-xl border border-card-border p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-mono text-foreground-muted">#{sale.id.slice(-8).toUpperCase()}</span>
                                        <div className="flex gap-2">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${sale.status === 'VOIDED' ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                                                }`}>
                                                {sale.status || 'COMPLETED'}
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${sale.paymentMethod === 'CASH' ? 'bg-success-muted text-success' : 'bg-primary-muted text-primary'
                                                }`}>
                                                {sale.paymentMethod}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-sm text-foreground-muted">
                                        {sale.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-lg font-bold text-foreground">${sale.total.toFixed(2)}</span>
                                            <span className="text-xs text-foreground-subtle ml-2">
                                                {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setSelectedOrder({ order: sale, action: 'reprint' })}
                                                className="p-2 text-foreground-subtle hover:text-foreground hover:bg-background-tertiary rounded-lg transition-colors"
                                            >
                                                <Receipt className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setSelectedOrder({ order: sale, action: 'view' })}
                                                className="p-2 text-foreground-subtle hover:text-foreground hover:bg-background-tertiary rounded-lg transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {/* Refund Button */}
                                            {sale.status === 'COMPLETED' && (
                                                <button
                                                    onClick={() => setRefundOrder(sale)}
                                                    className="p-2 text-foreground-subtle hover:text-warning hover:bg-warning-muted rounded-lg transition-colors"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                </button>
                                            )}
                                            {sale.status !== 'VOIDED' && (
                                                <button
                                                    onClick={() => setVoidOrder(sale)}
                                                    className="p-2 text-foreground-subtle hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>

            {selectedOrder && (
                <ReceiptModal
                    isOpen={true}
                    onClose={() => setSelectedOrder(null)}
                    order={getReceiptData(selectedOrder.order)}
                    autoPrint={selectedOrder.action === 'reprint'}
                />
            )}

            <PinModal
                isOpen={!!voidOrder}
                onClose={() => setVoidOrder(null)}
                onVerify={handleVoidVerify}
                title="Void Sale"
                description="Enter admin PIN to void this sale"
            />

            <RefundModal
                isOpen={!!refundOrder}
                onClose={() => setRefundOrder(null)}
                sale={refundOrder}
                onRefundSuccess={handleRefundSuccess}
            />
        </div>
    );
}
