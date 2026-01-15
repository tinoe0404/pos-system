'use client';

import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/pos/ProductCard';
import { Search, Loader2, PackageX } from 'lucide-react';
import { Product } from '@/types/product';

export default function POSPage() {
    const { data, isLoading } = useProducts();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Filter products
    const filteredProducts = data?.products.filter((product: Product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

        return matchesSearch && matchesCategory;
    }) || [];

    // Extract unique categories
    const categories = ['all', ...Array.from(new Set(data?.products.map((p) => p.category).filter(Boolean)))];

    return (
        <div className="p-6 h-full flex flex-col">
            {/* Header / Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 sticky top-0 z-10">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category as string)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === category
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {category === 'all' ? 'All Items' : category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
            ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 overflow-y-auto pb-20">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="h-full">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <div className="bg-slate-100 p-6 rounded-full mb-4">
                        <PackageX className="w-10 h-10" />
                    </div>
                    <p className="text-lg font-medium">No products found</p>
                    <p className="text-sm">Try adjusting your search or category filter</p>
                </div>
            )}
        </div>
    );
}
