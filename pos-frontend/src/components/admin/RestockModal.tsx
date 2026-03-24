'use client';

import { useState } from 'react';
import { X, Loader2, PackagePlus } from 'lucide-react';
import { useRestockProduct } from '@/hooks/useInventoryMutations';
import { Product } from '@/types/product';

interface RestockModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

export default function RestockModal({ isOpen, onClose, product }: RestockModalProps) {
    const [quantity, setQuantity] = useState<number | ''>('');
    const restockMutation = useRestockProduct();

    if (!isOpen || !product) return null;

    const isLoading = restockMutation.isPending;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const amount = Number(quantity);
        if (isNaN(amount) || amount <= 0) return;

        restockMutation.mutate(
            { productId: product.id, quantity: amount },
            {
                onSuccess: () => {
                    setQuantity('');
                    onClose();
                }
            }
        );
    };

    const inputClass = 'w-full h-11 px-4 bg-input-bg border border-input-border rounded-xl text-sm text-foreground outline-none transition-all focus:border-input-focus focus:ring-2 focus:ring-primary-muted placeholder:text-foreground-subtle disabled:opacity-50';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-5 border-b border-card-border flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            <PackagePlus className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Restock Product</h2>
                            <p className="text-xs text-foreground-muted truncate max-w-[200px]">{product.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-2 hover:bg-background-tertiary rounded-lg transition-colors text-foreground-muted"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
                    {/* Current Stock */}
                    <div className="flex justify-between items-center p-3 bg-background-tertiary rounded-xl border border-card-border">
                        <span className="text-sm font-medium text-foreground-muted">Current Stock</span>
                        <span className="text-lg font-bold text-foreground">{product.stock}</span>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-foreground-muted">
                            Quantity to Add <span className="text-destructive">*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                            className={inputClass}
                            placeholder="Enter quantity to add"
                            required
                            disabled={isLoading}
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="p-5 border-t border-card-border flex gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 h-11 bg-background-tertiary border border-card-border text-foreground font-semibold rounded-xl hover:bg-card-hover transition-colors text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !quantity || Number(quantity) <= 0}
                        className="flex-[2] h-11 bg-primary text-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20 text-sm disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>Restock {quantity ? `+${quantity}` : ''}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
