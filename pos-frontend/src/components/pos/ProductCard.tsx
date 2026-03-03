'use client';

import { useState, useRef, useCallback } from 'react';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/useCartStore';
import { Plus, Minus, Package, X } from 'lucide-react';

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
        addItem({ ...product, price: Number(product.price) });
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
            addItem({ ...product, price: Number(product.price) });
        }
        setShowQuantityPicker(false);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 400);
    };

    return (
        <>
            <button
                onClick={handleAdd}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                onMouseDown={handleTouchStart}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
                disabled={isOutOfStock}
                className={`relative bg-card rounded-xl border border-card-border p-4 flex flex-col items-start text-left transition-all duration-200 group h-full w-full ${isOutOfStock
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:border-border-hover hover:bg-card-hover active:scale-[0.95] cursor-pointer'
                    } ${justAdded ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
            >
                {/* Image / Placeholder */}
                <div className="w-full aspect-square bg-background-secondary rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-1">
                            <Package className="w-8 h-8 text-foreground-subtle" />
                            <span className="text-2xl font-bold text-foreground-subtle select-none">
                                {product.name.charAt(0)}
                            </span>
                        </div>
                    )}

                    {/* Add overlay - visible on hover (desktop) and always hinted on mobile */}
                    {!isOutOfStock && (
                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors flex items-center justify-center">
                            <div className="bg-primary text-foreground rounded-full p-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                                <Plus className="w-5 h-5" />
                            </div>
                        </div>
                    )}

                    {/* Out of stock badge */}
                    {isOutOfStock && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                            <span className="text-xs font-semibold text-destructive bg-destructive-muted px-3 py-1.5 rounded-full">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 w-full flex flex-col justify-between">
                    <div>
                        <h3 className="font-semibold text-foreground line-clamp-2 leading-snug text-sm mb-1">
                            {product.name}
                        </h3>
                        <div className="flex flex-wrap gap-1 mb-2">
                            {product.abv && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                                    {product.abv}% ABV
                                </span>
                            )}
                            {product.ibu && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-800 font-bold">
                                    {product.ibu} IBU
                                </span>
                            )}
                            {product.style && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                                    {product.style}
                                </span>
                            )}
                        </div>
                        {product.brewery && (
                            <p className="text-[11px] text-foreground-subtle font-medium truncate">
                                {product.brewery}
                            </p>
                        )}
                        <p className="text-[11px] text-foreground-subtle font-medium uppercase tracking-wider mt-1">
                            {product.category || 'General'}
                        </p>
                    </div>

                    <div className="w-full flex items-center justify-between mt-3 pt-3 border-t border-card-border">
                        <span className="text-base font-bold text-primary">
                            ${Number(product.price).toFixed(2)}
                        </span>
                        {isLowStock ? (
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-warning-muted text-warning">
                                {product.stock} left
                            </span>
                        ) : !isOutOfStock ? (
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-success-muted text-success">
                                In stock
                            </span>
                        ) : null}
                    </div>
                </div>
            </button>

            {/* Long-press Quantity Picker */}
            {showQuantityPicker && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setShowQuantityPicker(false)}>
                    <div className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-[280px] p-5 animate-scale-in" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-foreground truncate pr-2">{product.name}</h3>
                            <button onClick={() => setShowQuantityPicker(false)} className="p-1 text-foreground-muted hover:text-foreground">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-4 mb-5">
                            <button
                                onClick={() => setQuickQty(Math.max(1, quickQty - 1))}
                                className="w-12 h-12 flex items-center justify-center bg-background-tertiary rounded-xl text-foreground-muted hover:text-foreground active:scale-90 transition-all"
                            >
                                <Minus className="w-5 h-5" />
                            </button>
                            <span className="text-3xl font-bold text-foreground w-16 text-center">{quickQty}</span>
                            <button
                                onClick={() => setQuickQty(Math.min(product.stock, quickQty + 1))}
                                className="w-12 h-12 flex items-center justify-center bg-background-tertiary rounded-xl text-foreground-muted hover:text-foreground active:scale-90 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-center text-sm text-foreground-muted mb-4">
                            Total: <span className="font-bold text-primary">${(Number(product.price) * quickQty).toFixed(2)}</span>
                        </p>

                        <button
                            onClick={handleQuickAdd}
                            className="w-full h-12 bg-primary text-foreground font-semibold rounded-xl hover:bg-primary-hover active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add {quickQty} to Cart
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
