'use client';

import { useState } from 'react';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/useCartStore';
import { Plus, Package } from 'lucide-react';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem);
    const [justAdded, setJustAdded] = useState(false);

    const isOutOfStock = product.stock <= 0;
    const isLowStock = product.stock > 0 && product.stock <= 5;

    const handleAdd = () => {
        if (isOutOfStock) return;
        addItem(product);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 400);
    };

    return (
        <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`relative bg-card rounded-xl border border-card-border p-4 flex flex-col items-start text-left transition-all duration-200 group h-full w-full ${
                isOutOfStock
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:border-border-hover hover:bg-card-hover active:scale-[0.98] cursor-pointer'
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

                {/* Add overlay */}
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
                    <p className="text-[11px] text-foreground-subtle font-medium uppercase tracking-wider">
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
    );
}
