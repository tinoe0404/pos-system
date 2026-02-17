'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, Check } from 'lucide-react';
import { Sale, SaleItem } from '@/hooks/useSales';
import { toast } from 'sonner';
import api from '@/lib/api';

interface RefundModalProps {
    isOpen: boolean;
    onClose: () => void;
    sale: Sale | null;
    onRefundSuccess: () => void;
}

export default function RefundModal({ isOpen, onClose, sale, onRefundSuccess }: RefundModalProps) {
    const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Reset state when modal opens/closes or sale changes
    useEffect(() => {
        if (isOpen && sale) {
            setSelectedItems({});
            setReason('');
        }
    }, [isOpen, sale]);

    if (!isOpen || !sale) return null;

    const handleQuantityChange = (itemId: string, max: number, value: string) => {
        const qty = parseInt(value) || 0;
        if (qty < 0) return;
        if (qty > max) {
            toast.error(`Cannot refund more than ${max} items`);
            return;
        }

        setSelectedItems(prev => {
            const next = { ...prev };
            if (qty === 0) {
                delete next[itemId];
            } else {
                next[itemId] = qty;
            }
            return next;
        });
    };

    const toggleItem = (itemId: string, max: number) => {
        setSelectedItems(prev => {
            const next = { ...prev };
            if (next[itemId]) {
                delete next[itemId];
            } else {
                next[itemId] = max; // Default to full quantity
            }
            return next;
        });
    };

    const calculateTotalRefund = () => {
        let total = 0;
        sale.items.forEach(item => {
            const qty = selectedItems[item.id] || 0;
            total += qty * item.price;
        });
        return total;
    };

    const handleSubmit = async () => {
        const itemsToRefund = Object.entries(selectedItems).map(([itemId, qty]) => {
            const item = sale.items.find(i => i.id === itemId);
            return {
                productId: item?.productId, // We need productId for the backend
                quantity: qty
            };
        }).filter(i => i.productId); // Ensure productId exists

        if (itemsToRefund.length === 0) {
            toast.error("Please select at least one item to return");
            return;
        }

        setIsLoading(true);
        try {
            await api.post(`/api/sales/${sale.id}/refund`, {
                items: itemsToRefund,
                reason: reason || "Customer Return"
            });
            toast.success("Refund processed successfully");
            onRefundSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to process refund");
        } finally {
            setIsLoading(false);
        }
    };

    const totalRefund = calculateTotalRefund();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-5 border-b border-card-border flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Process Refund</h2>
                        <p className="text-sm text-foreground-muted">Order #{sale.id.slice(-6)}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-background-tertiary rounded-lg transition-colors text-foreground-muted">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto flex-1 space-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground-muted">Select Items to Return</label>
                        <div className="border border-card-border rounded-xl overflow-hidden divide-y divide-card-border">
                            {sale.items.map(item => {
                                const isSelected = !!selectedItems[item.id];
                                const currentQty = selectedItems[item.id] || 0;

                                return (
                                    <div key={item.id} className={`p-3 transition-colors ${isSelected ? 'bg-primary/5' : 'bg-card'}`}>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => toggleItem(item.id, item.quantity)}
                                                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected
                                                        ? 'bg-primary border-primary text-primary-foreground'
                                                        : 'border-input-border hover:border-primary-muted'
                                                    }`}
                                            >
                                                {isSelected && <Check className="w-3.5 h-3.5" />}
                                            </button>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{item.productName}</p>
                                                <p className="text-xs text-foreground-muted">${item.price.toFixed(2)} each</p>
                                            </div>

                                            {isSelected && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-foreground-muted">Qty:</span>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={item.quantity}
                                                        value={currentQty}
                                                        onChange={(e) => handleQuantityChange(item.id, item.quantity, e.target.value)}
                                                        className="w-16 h-8 px-2 bg-input-bg border border-input-border rounded-lg text-sm text-center outline-none focus:border-primary-muted"
                                                    />
                                                    <span className="text-xs text-foreground-muted">/ {item.quantity}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground-muted">Reason for Refund</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g., Defective product, Customer changed mind"
                            rows={2}
                            className="w-full p-3 bg-input-bg border border-input-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary-muted resize-none placeholder:text-foreground-subtle"
                        />
                    </div>

                    <div className="bg-background-secondary p-4 rounded-xl flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground-muted">Total Refund Amount</span>
                        <span className="text-xl font-bold text-foreground">${totalRefund.toFixed(2)}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-card-border flex gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 h-11 bg-background-tertiary border border-card-border text-foreground font-semibold rounded-xl hover:bg-card-hover transition-colors text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || totalRefund === 0}
                        className="flex-[2] h-11 bg-primary text-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Confirm Refund'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
