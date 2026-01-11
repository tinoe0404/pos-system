'use client';

import { useSales, Sale } from '@/hooks/useSales';
import { Loader2, Receipt, Eye } from 'lucide-react';
import { useState } from 'react';
import ReceiptModal from '@/components/pos/ReceiptModal';
import { CartItem } from '@/store/useCartStore';

export default function OrdersPage() {
    const { data, isLoading } = useSales();
    const [selectedOrder, setSelectedOrder] = useState<{
        order: Sale;
        action: 'view' | 'reprint';
    } | null>(null);

    // Transform Sale to ReceiptModal format
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
        paymentMethod: sale.paymentMethod,
        tax: sale.total * 0.1, // Assuming 10% tax as per ReceiptModal logic, adjust if backend provides tax
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <header className="px-6 py-4 bg-white border-b border-slate-200">
                <h1 className="text-xl font-bold text-slate-800">Transaction History</h1>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-auto p-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Receipt ID
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Time
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Items
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Payment
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data?.sales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                                        #{sale.id.slice(-8).toUpperCase()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        <div className="truncate max-w-[200px]" title={sale.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}>
                                            {sale.items.slice(0, 2).map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                                            {sale.items.length > 2 && ` +${sale.items.length - 2} more`}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                        ${sale.total.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sale.paymentMethod === 'CASH'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {sale.paymentMethod}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => setSelectedOrder({ order: sale, action: 'reprint' })}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Reprint Receipt"
                                        >
                                            <Receipt className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setSelectedOrder({ order: sale, action: 'view' })}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Receipt Modal for Reprinting/Viewing */}
            {selectedOrder && (
                <ReceiptModal
                    isOpen={true}
                    onClose={() => setSelectedOrder(null)}
                    order={getReceiptData(selectedOrder.order)}
                    autoPrint={selectedOrder.action === 'reprint'}
                />
            )}
        </div>
    );
}
