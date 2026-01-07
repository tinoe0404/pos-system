'use client';

import { useCartStore, CartItem } from '@/store/useCartStore';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCreateOrder } from '@/hooks/useCreateOrder';
import { toast } from 'sonner';
import PaymentModal from './PaymentModal';
import ReceiptModal from './ReceiptModal';

export default function CartPanel() {
    const { items, clearCart, removeItem, updateQuantity, getTotal } = useCartStore();
    const [mounted, setMounted] = useState(false);
    const { mutate: createOrder, isPending } = useCreateOrder();

    // Modal States
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [lastOrder, setLastOrder] = useState<{
        id: string;
        items: CartItem[];
        total: number;
        date: string;
        paymentMethod: 'CASH' | 'ECOCASH';
        tax: number;
    } | null>(null);

    // Hydration fix for persisted store
    useEffect(() => {
        setMounted(true);
    }, []);

    const total = getTotal();
    const tax = total * 0.1; // Example 10% tax
    const finalTotal = total + tax;

    const handleChargeClick = () => {
        setIsPaymentModalOpen(true);
    };

    const handleConfirmPayment = (method: 'CASH' | 'ECOCASH') => {
        createOrder(
            { items, paymentMethod: method },
            {
                onSuccess: (data) => {
                    // Prepare receipt data
                    setLastOrder({
                        id: data.id,
                        items: [...items], // Copy items before clearing
                        total: finalTotal,
                        date: new Date().toISOString(),
                        paymentMethod: method,
                        tax,
                    });

                    // Close payment modal
                    setIsPaymentModalOpen(false);

                    // Clear cart
                    clearCart();

                    // Open receipt modal
                    setIsReceiptModalOpen(true);

                    toast.success('Order processed successfully');
                },
                onError: (error) => {
                    console.error(error);
                    toast.error('Failed to process order');
                },
            }
        );
    };

    if (!mounted) {
        return null;
    }

    return (
        <>
            <div className="w-96 bg-white border-l border-slate-200 h-screen flex flex-col sticky top-0 shadow-xl z-20">
                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3 text-slate-800">
                        <div className="bg-blue-50 p-2 rounded-lg">
                            <ShoppingCart className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="font-bold text-lg tracking-tight">Current Order</h2>
                    </div>
                    <button
                        onClick={clearCart}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Clear Cart"
                        disabled={items.length === 0 || isPending}
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                <ShoppingCart className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="font-medium">Cart is empty</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item) => (
                                <CartItemRow
                                    key={item.id}
                                    item={item}
                                    onUpdateQuantity={updateQuantity}
                                    onRemove={removeItem}
                                    disabled={isPending}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer / Totals */}
                <div className="p-5 bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center text-slate-500 text-sm">
                            <span>Subtotal</span>
                            <span className="font-medium">${total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 text-sm">
                            <span>Tax (10%)</span>
                            <span className="font-medium">${tax.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-slate-100 my-2" />
                        <div className="flex justify-between items-center text-slate-800 font-bold text-xl">
                            <span>Total</span>
                            <span>${finalTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleChargeClick}
                        disabled={items.length === 0 || isPending}
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2 group"
                    >
                        {isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span>Charge ${finalTotal.toFixed(2)}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Modals */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onConfirm={handleConfirmPayment}
                totalAmount={finalTotal}
                isLoading={isPending}
            />

            <ReceiptModal
                isOpen={isReceiptModalOpen}
                onClose={() => setIsReceiptModalOpen(false)}
                order={lastOrder}
            />
        </>
    );
}

interface CartItemRowProps {
    item: CartItem;
    onUpdateQuantity: (id: string, qty: number) => void;
    onRemove: (id: string) => void;
    disabled?: boolean;
}

function CartItemRow({ item, onUpdateQuantity, onRemove, disabled }: CartItemRowProps) {
    return (
        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex gap-3 group hover:border-blue-200 transition-colors">
            <div className="w-16 h-16 bg-slate-50 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-slate-300 text-lg">
                {/* Placeholder for image */}
                {item.name.charAt(0)}
            </div>

            <div className="flex-1 flex flex-col justify-between py-1">
                <div className="flex justify-between items-start gap-2">
                    <h4 className="font-semibold text-slate-700 text-sm line-clamp-2 leading-tight">
                        {item.name}
                    </h4>
                    <button
                        onClick={() => onRemove(item.id)}
                        disabled={disabled}
                        className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-0"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex justify-between items-center mt-2">
                    <span className="text-blue-600 font-bold text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                    </span>

                    <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                        <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-blue-600 disabled:opacity-50"
                            disabled={item.quantity <= 1 || disabled}
                        >
                            <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-700 w-4 text-center">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-blue-600 disabled:opacity-50"
                            disabled={disabled}
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
