'use client';

import { useCartStore } from '@/store/useCartStore';
import { ShoppingCart, Trash2 } from 'lucide-react';

export default function CartPanel() {
    const items = useCartStore((state) => state.items);
    const clearCart = useCartStore((state) => state.clearCart);

    return (
        <div className="w-96 bg-white border-l border-slate-200 h-screen flex flex-col sticky top-0 shadow-lg z-10">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                    <h2 className="font-bold text-lg">Current Order</h2>
                </div>
                <button
                    onClick={clearCart}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Clear Cart"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* Cart Items List (Placeholder) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                        <ShoppingCart className="w-12 h-12 opacity-20" />
                        <p>Cart is empty</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {/* Items will go here later */}
                        <p className="text-center text-slate-500 text-sm">
                            {items.length} items (Coming soon)
                        </p>
                    </div>
                )}
            </div>

            {/* Footer / Totals */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-4">
                <div className="flex justify-between items-center text-slate-600">
                    <span>Subtotal</span>
                    <span>$0.00</span>
                </div>
                <div className="flex justify-between items-center text-slate-900 font-bold text-xl">
                    <span>Total</span>
                    <span>$0.00</span>
                </div>

                <button
                    disabled={items.length === 0}
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
                >
                    Charge $0.00
                </button>
            </div>
        </div>
    );
}
