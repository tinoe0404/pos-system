'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/pos/ProductCard';
import { Search, PackageX, Loader2 } from 'lucide-react';
import { Product } from '@/types/product';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function POSPage() {
    const { data, isLoading } = useProducts();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const searchRef = useRef<HTMLInputElement>(null);

    const shortcuts = useMemo(
        () => ({
            '/': () => searchRef.current?.focus(),
            'escape': () => {
                setSearchQuery('');
                searchRef.current?.blur();
            },
        }),
        []
    );
    useKeyboardShortcuts(shortcuts);

    const filteredProducts = useMemo(() => {
        if (!data?.products) return [];
        return data.products.filter((product: Product) => {
            const matchesSearch =
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory =
                selectedCategory === 'all' || product.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [data?.products, searchQuery, selectedCategory]);

    const categories = useMemo(() => {
        if (!data?.products) return ['all'];
        const cats = Array.from(
            new Set(data.products.map((p: Product) => p.category).filter(Boolean))
        ) as string[];
        return ['all', ...cats];
    }, [data?.products]);

    const getCategoryCount = useCallback(
        (cat: string) => {
            if (!data?.products) return 0;
            if (cat === 'all') return data.products.length;
            return data.products.filter((p: Product) => p.category === cat).length;
        },
        [data?.products]
    );

    return (
        <div className="p-4 lg:p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-5">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-subtle w-5 h-5" />
                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="Search products or SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-16 bg-card border border-card-border rounded-xl text-foreground outline-none transition-all duration-200 placeholder:text-foreground-subtle focus:border-input-focus focus:ring-2 focus:ring-primary-muted"
                    />
                    <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-foreground-subtle bg-background-tertiary px-2 py-1 rounded-md border border-card-border font-mono">
                        /
                    </kbd>
                </div>

                {/* Category Pills */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${selectedCategory === category
                                ? 'bg-primary text-foreground'
                                : 'bg-card border border-card-border text-foreground-muted hover:bg-card-hover hover:text-foreground'
                                }`}
                        >
                            <span>{category === 'all' ? 'All Items' : category}</span>
                            <span
                                className={`text-[11px] px-1.5 py-0.5 rounded-full ${selectedCategory === category
                                    ? 'bg-foreground/15 text-foreground'
                                    : 'bg-background-tertiary text-foreground-subtle'
                                    }`}
                            >
                                {getCategoryCount(category)}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-foreground-muted text-sm">Loading products...</p>
                </div>
            ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3 overflow-y-auto pb-24 md:pb-6">
                    {filteredProducts.map((product: Product, i: number) => (
                        <div key={product.id} className="stagger-item h-full">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-foreground-muted">
                    <div className="bg-background-tertiary p-5 rounded-2xl mb-4">
                        <PackageX className="w-8 h-8 text-foreground-subtle" />
                    </div>
                    <p className="text-base font-medium text-foreground">No products found</p>
                    <p className="text-sm text-foreground-muted mt-1">
                        Try adjusting your search or category filter
                    </p>
                </div>
            )}
        </div>
    );
}
