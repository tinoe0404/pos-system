'use client';

import { useCartStore, CartItem } from '@/store/useCartStore';
import { useHeldOrders } from '@/store/useHeldOrders';
import {
    ShoppingCart, Trash2, Plus, Minus, CreditCard, Loader2,
    Pause, Play, Percent, StickyNote, X
} from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useCreateOrder } from '@/hooks/useCreateOrder';
import { toast } from 'sonner';
import PaymentModal from './PaymentModal';
import ReceiptModal from './ReceiptModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { STORE_CONFIG } from '@/config/store';

const TAX_RATE = STORE_CONFIG.taxRate;

interface CartPanelProps {
    onCheckoutComplete?: () => void;
    onClose?: () => void;
}

export default function CartPanel({ onCheckoutComplete, onClose }: CartPanelProps) {
    const { items, clearCart, removeItem, updateQuantity, getTotal } = useCartStore();
    const { orders: heldOrders, addOrder: holdOrder, removeOrder: resumeHeldOrder } = useHeldOrders();
    const [mounted, setMounted] = useState(false);
    const { mutate: createOrder, isPending } = useCreateOrder();

    // Feature state
    const [discount, setDiscount] = useState<{ type: 'percent' | 'fixed'; value: number }>({ type: 'percent', value: 0 });
    const [orderNote, setOrderNote] = useState('');
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [showHeldOrders, setShowHeldOrders] = useState(false);

    // Modal States
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [lastOrder, setLastOrder] = useState<{
        id: string;
        items: CartItem[];
        total: number;
        date: string;
        paymentMethod: 'CASH' | 'ECOCASH' | 'TAB';
        tax: number;
        discount: number;
    } | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const subtotal = getTotal();
    const discountAmount = discount.type === 'percent'
        ? subtotal * (discount.value / 100)
        : Math.min(discount.value, subtotal);
    const afterDiscount = subtotal - discountAmount;
    const tax = afterDiscount * TAX_RATE;
    const finalTotal = afterDiscount + tax;

    const handleChargeClick = useCallback(() => {
        if (items.length === 0) return;
        setIsPaymentModalOpen(true);
    }, [items.length]);

    const handleHoldOrder = useCallback(() => {
        if (items.length === 0) return;
        holdOrder([...items], orderNote);
        clearCart();
        setOrderNote('');
        setDiscount({ type: 'percent', value: 0 });
        toast.success('Order held successfully');
    }, [items, orderNote, holdOrder, clearCart]);

    const handleResumeOrder = useCallback((orderId: string) => {
        const order = heldOrders.find((o) => o.id === orderId);
        if (!order) return;
        // Auto-hold current cart if it has items
        if (items.length > 0) {
            holdOrder([...items], 'Auto-held');
        }
        // Clear and restore the held order
        clearCart();
        order.items.forEach((item) => {
            useCartStore.getState().addItem({ id: item.id, name: item.name, price: item.price });
            if (item.quantity > 1) {
                useCartStore.getState().updateQuantity(item.id, item.quantity);
            }
        });
        setOrderNote(order.note);
        resumeHeldOrder(orderId);
        setShowHeldOrders(false);
        toast.success('Order resumed');
    }, [heldOrders, items, holdOrder, clearCart, resumeHeldOrder]);

    const shortcuts = useMemo(() => ({
        'f2': handleChargeClick,
        'f4': handleHoldOrder,
    }), [handleChargeClick, handleHoldOrder]);
    useKeyboardShortcuts(shortcuts);

    const handleConfirmPayment = (paymentMethod: 'CASH' | 'ECOCASH' | 'TAB', tabId?: string) => {
        setIsPaymentModalOpen(false);

        createOrder(
            { items, paymentMethod, tabId, discount: discountAmount },
            {
                onSuccess: (data) => {
                    setLastOrder({
                        id: data.id,
                        items: [...items],
                        total: finalTotal,
                        date: new Date().toISOString(),
                        paymentMethod: paymentMethod,
                        tax,
                        discount: discountAmount,
                    });
                    clearCart();
                    setDiscount({ type: 'percent', value: 0 });
                    setOrderNote('');
                    setIsReceiptModalOpen(true);
                    toast.success('Order processed successfully');
                    onCheckoutComplete?.();
                },
                onError: (error: any) => {
                    console.error(error);
                    toast.error(error.response?.data?.message || 'Failed to process order');
                },
            }
        );
    };

    if (!mounted) return null;

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            <div className="w-full lg:w-96 bg-card border-l border-card-border h-full lg:h-screen flex flex-col lg:sticky top-0 z-20 overflow-hidden">
                {/* Header */}
                <div className="p-3 sm:p-4 border-b border-card-border flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-muted p-2 rounded-lg">
                            <ShoppingCart className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-foreground text-sm">Current Order</h2>
                            {itemCount > 0 && (
                                <span className="text-[11px] text-foreground-muted">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1">
                        {/* Hold Order */}
                        <button
                            onClick={handleHoldOrder}
                            disabled={items.length === 0 || isPending}
                            className="p-2 text-foreground-muted hover:text-warning hover:bg-warning-muted rounded-lg transition-all disabled:opacity-30"
                            title="Hold Order (F4)"
                        >
                            <Pause className="w-4 h-4" />
                        </button>
                        {/* Held Orders */}
                        <button
                            onClick={() => setShowHeldOrders(!showHeldOrders)}
                            className={`relative p-2 rounded-lg transition-all ${showHeldOrders ? 'text-primary bg-primary-muted' : 'text-foreground-muted hover:text-foreground hover:bg-background-tertiary'}`}
                            title="Held Orders"
                        >
                            <Play className="w-4 h-4" />
                            {heldOrders.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-warning text-background text-[10px] rounded-full flex items-center justify-center font-bold">
                                    {heldOrders.length}
                                </span>
                            )}
                        </button>
                        {/* Clear */}
                        <button
                            onClick={clearCart}
                            className="p-2 text-foreground-muted hover:text-destructive hover:bg-destructive-muted rounded-lg transition-all disabled:opacity-30"
                            title="Clear Cart"
                            disabled={items.length === 0 || isPending}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        {/* Mobile Close Button */}
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 text-foreground-muted hover:text-foreground hover:bg-background-tertiary rounded-lg transition-all lg:hidden"
                                title="Close Cart"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Held Orders Dropdown */}
                {showHeldOrders && heldOrders.length > 0 && (
                    <div className="border-b border-card-border bg-background-secondary p-3 space-y-2 max-h-48 overflow-y-auto animate-fade-in shrink-0">
                        <p className="text-[11px] text-foreground-subtle font-medium uppercase tracking-wider">Held Orders</p>
                        {heldOrders.map((order) => (
                            <button
                                key={order.id}
                                onClick={() => handleResumeOrder(order.id)}
                                className="w-full flex items-center justify-between p-2.5 bg-card rounded-lg border border-card-border hover:border-border-hover transition-colors text-left"
                            >
                                <div>
                                    <p className="text-xs font-medium text-foreground">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                                    <p className="text-[11px] text-foreground-muted">
                                        {new Date(order.heldAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {order.note && ` - ${order.note}`}
                                    </p>
                                </div>
                                <span className="text-xs font-bold text-primary">${order.total.toFixed(2)}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1.5 sm:space-y-2 min-h-0">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-foreground-subtle gap-3">
                            <div className="w-14 h-14 bg-background-tertiary rounded-2xl flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 opacity-30" />
                            </div>
                            <p className="text-sm font-medium text-foreground-muted">Cart is empty</p>
                            <p className="text-xs text-foreground-subtle">Add products to start an order</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {items.map((item) => (
                                <CartItemRow
                                    key={item.id}
                                    item={item}
                                    onUpdateQuantity={updateQuantity}
                                    onRemove={removeItem}
                                    disabled={isPending}
                                />
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Discount & Note Row */}
                {items.length > 0 && (
                    <div className="px-4 py-2 border-t border-card-border flex items-center gap-2 shrink-0">
                        {/* Discount Toggle */}
                        <div className="flex-1 flex items-center gap-2">
                            <Percent className="w-3.5 h-3.5 text-foreground-subtle" />
                            <input
                                type="number"
                                min="0"
                                max={discount.type === 'percent' ? 100 : undefined}
                                value={discount.value || ''}
                                onChange={(e) => setDiscount({ ...discount, value: Number(e.target.value) })}
                                placeholder="Discount"
                                className="w-20 h-8 px-2 bg-input-bg border border-input-border rounded-lg text-xs text-foreground outline-none focus:border-input-focus"
                            />
                            <select
                                value={discount.type}
                                onChange={(e) => setDiscount({ ...discount, type: e.target.value as 'percent' | 'fixed' })}
                                className="h-8 px-1.5 bg-input-bg border border-input-border rounded-lg text-xs text-foreground outline-none focus:border-input-focus"
                            >
                                <option value="percent">%</option>
                                <option value="fixed">$</option>
                            </select>
                        </div>
                        {/* Note Toggle */}
                        <button
                            onClick={() => setShowNoteInput(!showNoteInput)}
                            className={`p-1.5 rounded-lg transition-colors ${showNoteInput ? 'text-primary bg-primary-muted' : 'text-foreground-subtle hover:text-foreground-muted'}`}
                            title="Add note"
                        >
                            <StickyNote className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* Note Input */}
                {showNoteInput && items.length > 0 && (
                    <div className="px-4 pb-2 shrink-0 animate-fade-in">
                        <textarea
                            value={orderNote}
                            onChange={(e) => setOrderNote(e.target.value)}
                            placeholder="Order note..."
                            rows={2}
                            className="w-full p-2 bg-input-bg border border-input-border rounded-lg text-xs text-foreground outline-none focus:border-input-focus resize-none placeholder:text-foreground-subtle"
                        />
                    </div>
                )}

                {/* Footer / Totals */}
                <div className="p-3 sm:p-4 border-t border-card-border shrink-0">
                    <div className="space-y-1 sm:space-y-1.5 mb-3 sm:mb-4">
                        <div className="flex justify-between text-sm text-foreground-muted">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-success">
                                <span>Discount</span>
                                <span>-${discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-foreground-muted">
                            <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-card-border my-1" />
                        <div className="flex justify-between text-foreground font-bold text-lg">
                            <span>Total</span>
                            <span>${finalTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleChargeClick}
                        disabled={items.length === 0 || isPending}
                        className="w-full h-11 sm:h-12 bg-primary text-foreground font-semibold rounded-xl hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                    >
                        {isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <CreditCard className="w-5 h-5" />
                                <span>Charge ${finalTotal.toFixed(2)}</span>
                                <kbd className="ml-2 text-[10px] bg-foreground/10 px-1.5 py-0.5 rounded font-mono">F2</kbd>
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
                subtotal={afterDiscount}
                tax={tax}
                discount={discountAmount}
                items={items}
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
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0, overflow: 'hidden' }}
            transition={{ duration: 0.2 }}
            className="relative overflow-hidden rounded-xl"
        >
            {/* Delete background revealed on swipe */}
            <div className="absolute inset-0 bg-destructive rounded-xl flex items-center justify-end pr-5">
                <Trash2 className="w-5 h-5 text-white" />
            </div>

            {/* Swipeable card */}
            <motion.div
                drag="x"
                dragDirectionLock
                dragConstraints={{ left: -120, right: 0 }}
                dragElastic={0.1}
                onDragEnd={(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
                    if (info.offset.x < -80) {
                        onRemove(item.id);
                    }
                }}
                className="relative bg-background-secondary p-2.5 sm:p-3 rounded-xl border border-card-border flex gap-2.5 sm:gap-3 group hover:border-border-hover transition-colors cursor-grab active:cursor-grabbing touch-pan-y"
            >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-background-tertiary rounded-lg shrink-0 flex items-center justify-center font-bold text-foreground-subtle text-xs sm:text-sm">
                    {item.name.charAt(0)}
                </div>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <h4 className="font-medium text-foreground text-sm truncate">{item.name}</h4>
                        <button
                            onClick={() => onRemove(item.id)}
                            disabled={disabled}
                            className="text-foreground-subtle hover:text-destructive transition-colors md:opacity-0 md:group-hover:opacity-100 shrink-0 p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                        <span className="text-primary font-semibold text-sm">
                            ${(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1 bg-background-tertiary rounded-lg p-0.5">
                            <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center bg-card rounded-md text-foreground-muted hover:text-foreground disabled:opacity-40 transition-colors active:scale-90"
                                disabled={item.quantity <= 1 || disabled}
                            >
                                <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-sm font-bold text-foreground w-6 text-center">{item.quantity}</span>
                            <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center bg-card rounded-md text-foreground-muted hover:text-foreground disabled:opacity-40 transition-colors active:scale-90"
                                disabled={disabled}
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
