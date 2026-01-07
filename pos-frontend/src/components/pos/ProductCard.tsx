'use client';

import { Product } from '@/types/product';
import { useCartStore } from '@/store/useCartStore';
import { Plus } from 'lucide-react';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem);

    return (
        <button
            onClick={() => addItem(product)}
            className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col items-start text-left hover:shadow-md hover:border-blue-200 transition-all group h-full w-full"
        >
            <div className="w-full aspect-square bg-slate-50 rounded-lg mb-3 flex items-center justify-center text-slate-300 relative overflow-hidden">
                {/* Image placeholder or real image */}
                {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full" />
                ) : (
                    <div className="text-4xl font-bold text-slate-200 select-none">
                        {product.name.charAt(0)}
                    </div>
                )}

                {/* Add overlay on hover */}
                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors flex items-center justify-center">
                    <div className="bg-blue-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-lg">
                        <Plus className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full flex flex-col justify-between">
                <div>
                    <h3 className="font-bold text-slate-800 line-clamp-2 leading-snug mb-1">
                        {product.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">
                        {product.category || 'General'}
                    </p>
                </div>

                <div className="w-full flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                    <span className="text-lg font-bold text-blue-600">
                        ${Number(product.price).toFixed(2)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${product.stock > 0
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-red-50 text-red-600'
                        }`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                    </span>
                </div>
            </div>
        </button>
    );
}
