'use client';

import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/pos/ProductCard';
import { Loader2, AlertCircle } from 'lucide-react';

export default function POSPage() {
    const { data: productsData, isLoading, isError } = useProducts();

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center text-blue-600">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-red-500 gap-2">
                <AlertCircle className="w-8 h-8" />
                <p>Failed to load products. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Menu</h1>
                <p className="text-slate-500">Select items to add to order</p>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
                {productsData?.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
                {productsData?.products.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-400">
                        No products found.
                    </div>
                )}
            </div>
        </div>
    );
}
