'use client';

import { useState, useRef, useCallback } from 'react';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/useCartStore';
import { Plus, Minus, Package, X } from 'lucide-react';
import { toast } from 'sonner';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem);
    const [justAdded, setJustAdded] = useState(false);
    const [showQuantityPicker, setShowQuantityPicker] = useState(false);
    const [quickQty, setQuickQty] = useState(1);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressTriggered = useRef(false);

    const isOutOfStock = product.stock <= 0;
    const isLowStock = product.stock > 0 && product.stock <= 5;

    const handleAdd = () => {
        if (isOutOfStock || longPressTriggered.current) return;
        const added = addItem({ ...product, price: Number(product.price), stock: product.stock });
        if (!added) {
            toast.error(`Only ${product.stock} in stock`);
            return;
        }
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 400);
    };

    const handleTouchStart = useCallback(() => {
        if (isOutOfStock) return;
        longPressTriggered.current = false;
        longPressTimer.current = setTimeout(() => {
            longPressTriggered.current = true;
            setQuickQty(1);
            setShowQuantityPicker(true);
        }, 500);
    }, [isOutOfStock]);

    const handleTouchEnd = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }, []);

    const handleQuickAdd = () => {
        for (let i = 0; i < quickQty; i++) {
            const added = addItem({ ...product, price: Number(product.price), stock: product.stock });
            if (!added) {
                toast.error(`Only ${product.stock} in stock`);
                break;
            }
        }
        setShowQuantityPicker(false);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 400);
    };

    if (showQuantityPicker) {
        return (
            <div className="relative bg-card rounded-xl border border-card-border p-3 sm:p-4 flex flex-col justify-between h-full w-full shadow-sm animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-foreground truncate pr-2">{product.name}</h3>
                    <button onClick={() => setShowQuantityPicker(false)} className="p-1 -mr-1 text-foreground-muted hover:text-foreground transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center justify-between px-2 my-auto">
                    <button
                        onClick={() => setQuickQty(Math.max(1, quickQty - 1))}
                        className="w-10 h-10 flex items-center justify-center bg-background-tertiary rounded-full text-foreground-muted hover:text-foreground active:scale-90 transition-all"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-3xl font-bold text-foreground">{quickQty}</span>
                    <button
                        onClick={() => setQuickQty(Math.min(product.stock, quickQty + 1))}
                        className="w-10 h-10 flex items-center justify-center bg-background-tertiary rounded-full text-foreground-muted hover:text-foreground active:scale-90 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <div className="text-center mt-2 mb-3">
                    <p className="text-xs text-foreground-muted">Total: <span className="font-bold text-primary">${(Number(product.price) * quickQty).toFixed(2)}</span></p>
                </div>

                <button
                    onClick={handleQuickAdd}
                    className="w-full py-2.5 bg-primary text-foreground text-sm font-bold rounded-xl hover:bg-primary-hover active:scale-[0.97] transition-all flex flex-col items-center justify-center leading-tight shadow-sm"
                >
                    <div className="flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add {quickQty} to</span>
                    </div>
                    <span>Cart</span>
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={handleAdd}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            disabled={isOutOfStock}
            className={`relative bg-card rounded-xl border border-card-border p-3 sm:p-4 flex flex-col items-start text-left transition-all duration-200 group h-full w-full ${isOutOfStock
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:border-border-hover hover:bg-card-hover active:scale-[0.95] cursor-pointer'
                } ${justAdded ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
        >
            {/* Image / Placeholder */}
            <div className="w-full aspect-square shrink-0 bg-background-tertiary rounded-xl mb-3 flex items-center justify-center relative overflow-hidden group-hover:bg-background-secondary transition-colors">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="object-cover w-full h-full"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-1 mt-1">
                        <Package className="w-7 h-7 text-foreground-muted" />
                        <span className="text-2xl font-black text-foreground-muted select-none">
                            {product.name.charAt(0)}
                        </span>
                    </div>
                )}

                {/* Add overlay - visible on hover (desktop) and always hinted on mobile */}
                {!isOutOfStock && (
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors flex items-center justify-center">
                        <div className="bg-primary text-foreground rounded-full p-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-md">
                            <Plus className="w-5 h-5" />
                        </div>
                    </div>
                )}

                {/* Out of stock badge over image */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                        <span className="text-xs font-semibold text-destructive bg-destructive-muted px-3 py-1.5 rounded-full backdrop-blur-sm">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 w-full flex flex-col justify-between h-full">
                <div>
                    <h3 className="font-bold text-foreground line-clamp-2 leading-snug text-sm sm:text-base">
                        {product.name}
                    </h3>
                    <p className="text-[10px] text-foreground-subtle font-semibold uppercase tracking-wider mt-0.5 truncate">
                        {product.category || 'General'}
                    </p>
                    
                    {/* Optional detailed tags (ABV, IBU, etc) */}
                    {(product.abv || product.ibu || product.style) && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                            {product.abv && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                                    {product.abv}% ABV
                                </span>
                            )}
                            {product.ibu && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-100 text-green-800 font-bold">
                                    {product.ibu} IBU
                                </span>
                            )}
                            {product.style && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-medium line-clamp-1">
                                    {product.style}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="w-full flex items-end justify-between mt-3 pt-1">
                    <span className="text-base font-black text-primary">
                        ${Number(product.price).toFixed(2)}
                    </span>
                    {isLowStock ? (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-warning-muted text-warning">
                            {product.stock} left
                        </span>
                    ) : !isOutOfStock ? (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-success-muted text-success">
                            In stock
                        </span>
                    ) : null}
                </div>
            </div>
        </button>
    );
}
