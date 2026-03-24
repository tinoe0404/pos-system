'use client';

import { useState, useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useDeleteProduct } from '@/hooks/useProductMutations';
import ProductModal from '@/components/admin/ProductModal';
import RestockModal from '@/components/admin/RestockModal';
import StockHistoryDrawer from '@/components/admin/StockHistoryDrawer';
import BulkRestockModal from '@/components/admin/BulkRestockModal';
import { Search, Plus, Edit, Trash2, Package, AlertCircle, Loader2, PackageX, PackagePlus, ClipboardList, ArrowUpDown, ArrowUp, ArrowDown, Truck, BarChart3 } from 'lucide-react';
import Link from 'next/link';

type SortColumn = 'name' | 'sku' | 'category' | 'price' | 'stock';
type SortDirection = 'asc' | 'desc';

export default function InventoryPage() {
    const { data: productsData, isLoading } = useProducts();
    const deleteProductMutation = useDeleteProduct();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [sortBy, setSortBy] = useState<SortColumn>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
    const [isBulkRestockOpen, setIsBulkRestockOpen] = useState(false);
    const [selectedActionProduct, setSelectedActionProduct] = useState<any>(null);

    const categories = useMemo(() => {
        if (!productsData?.products) return ['All'];
        const uniqueCategories = new Set(productsData.products.map(p => p.category).filter(Boolean));
        return ['All', ...Array.from(uniqueCategories).sort()];
    }, [productsData]);

    const filteredProducts = useMemo(() => {
        if (!productsData?.products) return [];
        const query = searchQuery.toLowerCase();
        
        // Filter
        let result = productsData.products.filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(query) ||
                product.sku.toLowerCase().includes(query) ||
                product.category?.toLowerCase().includes(query);
            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        // Sort
        result = result.sort((a, b) => {
            let valA: any = a[sortBy];
            let valB: any = b[sortBy];

            if (sortBy === 'price' || sortBy === 'stock') {
                valA = Number(valA);
                valB = Number(valB);
            } else {
                valA = (valA || '').toString().toLowerCase();
                valB = (valB || '').toString().toLowerCase();
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [productsData, searchQuery, selectedCategory, sortBy, sortDirection]);

    const handleSort = (column: SortColumn) => {
        if (sortBy === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('asc');
        }
    };

    const handleAddProduct = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const handleEditProduct = (product: any) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleDeleteProduct = (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            deleteProductMutation.mutate(id);
        }
    };

    const handleRestock = (product: any) => {
        setSelectedActionProduct(product);
        setIsRestockModalOpen(true);
    };

    const handleViewHistory = (product: any) => {
        setSelectedActionProduct(product);
        setIsHistoryDrawerOpen(true);
    };

    return (
        <div className="p-4 lg:p-6 space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-foreground">Inventory Management</h2>
                    <p className="text-sm text-foreground-muted mt-0.5">Manage your products and stock levels</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/admin/inventory/analytics"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-background-tertiary border border-card-border text-foreground font-semibold rounded-xl hover:bg-card-hover transition-colors text-sm"
                    >
                        <BarChart3 className="w-4 h-4 text-primary" />
                        <span>Analytics</span>
                    </Link>
                    <button
                        onClick={() => setIsBulkRestockOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-background-tertiary border border-card-border text-foreground font-semibold rounded-xl hover:bg-card-hover transition-colors text-sm"
                    >
                        <Truck className="w-4 h-4" />
                        <span>Bulk Restock</span>
                    </button>
                    <button
                        onClick={handleAddProduct}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, SKU, or category..."
                        className="w-full h-11 pl-11 pr-4 bg-card border border-card-border rounded-xl text-sm text-foreground outline-none transition-all focus:border-input-focus focus:ring-2 focus:ring-primary-muted placeholder:text-foreground-subtle"
                    />
                </div>

                {/* Category Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {categories.map((category: any) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                selectedCategory === category
                                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                                    : 'bg-background-secondary text-foreground-muted border border-card-border hover:bg-background-tertiary hover:text-foreground'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                    {
                        label: 'Total Products',
                        value: productsData?.count || 0,
                        icon: Package,
                        color: 'bg-primary-muted text-primary',
                    },
                    {
                        label: 'Active',
                        value: productsData?.products.filter((p) => p.active).length || 0,
                        icon: Package,
                        color: 'bg-success-muted text-success',
                    },
                    {
                        label: 'Low Stock',
                        value: productsData?.products.filter((p) => p.stock <= (p.min_stock ?? 10)).length || 0,
                        icon: AlertCircle,
                        color: 'bg-warning-muted text-warning',
                    },
                ].map((stat) => (
                    <div key={stat.label} className="bg-card p-4 rounded-xl border border-card-border flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${stat.color}`}>
                            <stat.icon className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[11px] text-foreground-muted font-medium">{stat.label}</p>
                            <p className="text-xl font-bold text-foreground">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border border-card-border overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-foreground-muted text-sm">Loading products...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="bg-background-tertiary p-5 rounded-2xl">
                            <PackageX className="w-8 h-8 text-foreground-subtle" />
                        </div>
                        <p className="text-foreground font-medium">
                            {searchQuery ? 'No products found' : 'No products yet'}
                        </p>
                        <p className="text-sm text-foreground-muted">
                            {searchQuery ? 'Try adjusting your search' : 'Add your first product to get started'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-background-secondary border-b border-card-border">
                                    <tr>
                                        {
                                            [
                                                { id: 'name', label: 'Product', sortable: true },
                                                { id: 'sku', label: 'SKU', sortable: true },
                                                { id: 'category', label: 'Category', sortable: true },
                                                { id: 'price', label: 'Price', sortable: true },
                                                { id: 'stock', label: 'Stock', sortable: true },
                                                { id: 'status', label: 'Status', sortable: false },
                                                { id: 'actions', label: 'Actions', sortable: false },
                                            ].map((col) => (
                                                <th
                                                    key={col.id}
                                                    onClick={() => col.sortable ? handleSort(col.id as SortColumn) : undefined}
                                                    className={`px-5 py-3 text-[11px] font-semibold text-foreground-subtle uppercase tracking-wider ${
                                                        col.id === 'actions' ? 'text-right' : ''
                                                    } ${col.sortable ? 'cursor-pointer hover:bg-background-tertiary transition-colors' : ''}`}
                                                >
                                                    <div className={`flex items-center gap-2 ${col.id === 'actions' ? 'justify-end' : ''}`}>
                                                        {col.label}
                                                        {col.sortable && sortBy === col.id && (
                                                            sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />
                                                        )}
                                                        {col.sortable && sortBy !== col.id && (
                                                            <ArrowUpDown className="w-3 h-3 text-foreground-subtle/50" />
                                                        )}
                                                    </div>
                                                </th>
                                            ))
                                        }
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-card-border">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-card-hover transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div>
                                                    <p className="font-medium text-foreground text-sm">{product.name}</p>
                                                    {product.description && (
                                                        <p className="text-xs text-foreground-subtle line-clamp-1 max-w-xs">{product.description}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="font-mono text-sm text-foreground-muted">{product.sku}</span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-sm text-foreground-muted">{product.category || '-'}</span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="font-bold text-foreground text-sm">${Number(product.price).toFixed(2)}</span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex flex-col gap-1.5 w-full min-w-[80px]">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-foreground text-sm">{product.stock}</span>
                                                        {product.stock === 0 ? (
                                                            <span className="px-1.5 py-0.5 bg-destructive-muted text-destructive text-[10px] font-medium rounded-full">Out</span>
                                                        ) : product.stock <= (product.min_stock ?? 10) ? (
                                                            <span className="px-1.5 py-0.5 bg-warning-muted text-warning text-[10px] font-medium rounded-full">Low</span>
                                                        ) : null}
                                                    </div>
                                                    
                                                    {/* Stock Level Progress Bar */}
                                                    <div className="h-1.5 w-full bg-background-tertiary rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full transition-all ${
                                                                product.stock === 0 ? 'bg-destructive w-full' :
                                                                product.stock <= (product.min_stock ?? 10) ? 'bg-warning' :
                                                                'bg-success'
                                                            }`}
                                                            style={{ 
                                                                width: product.stock === 0 ? '100%' : 
                                                                `${Math.min(100, Math.max(5, (product.stock / ((product.min_stock ?? 10) * 2)) * 100))}%` 
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${product.active ? 'bg-success-muted text-success' : 'bg-background-tertiary text-foreground-subtle'
                                                    }`}>
                                                    {product.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleRestock(product)}
                                                        className="p-2 text-foreground-subtle hover:text-success hover:bg-success/10 rounded-lg transition-colors"
                                                        title="Restock"
                                                    >
                                                        <PackagePlus className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewHistory(product)}
                                                        className="p-2 text-foreground-subtle hover:text-primary hover:bg-primary-muted rounded-lg transition-colors"
                                                        title="Stock History"
                                                    >
                                                        <ClipboardList className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditProduct(product)}
                                                        className="p-2 text-foreground-subtle hover:text-primary hover:bg-primary-muted rounded-lg transition-colors"
                                                        title="Edit product"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id, product.name)}
                                                        className="p-2 text-foreground-subtle hover:text-destructive hover:bg-destructive-muted rounded-lg transition-colors"
                                                        title="Delete product"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card Layout */}
                        <div className="md:hidden divide-y divide-card-border">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-foreground text-sm">{product.name}</p>
                                            <p className="text-xs text-foreground-subtle font-mono">{product.sku}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${product.active ? 'bg-success-muted text-success' : 'bg-background-tertiary text-foreground-subtle'
                                            }`}>
                                            {product.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-1.5 w-32">
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="font-bold text-foreground">${Number(product.price).toFixed(2)}</span>
                                                <span className="text-foreground-muted">Stock: {product.stock}</span>
                                                {product.stock <= (product.min_stock ?? 10) && product.stock > 0 && (
                                                    <span className="px-1.5 py-0.5 bg-warning-muted text-warning text-[10px] font-medium rounded-full">Low</span>
                                                )}
                                                {product.stock === 0 && (
                                                    <span className="px-1.5 py-0.5 bg-destructive-muted text-destructive text-[10px] font-medium rounded-full">Out</span>
                                                )}
                                            </div>
                                            {/* Stock Level Progress Bar */}
                                            <div className="h-1 w-full bg-background-tertiary rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all ${
                                                        product.stock === 0 ? 'bg-destructive w-full' :
                                                        product.stock <= (product.min_stock ?? 10) ? 'bg-warning' :
                                                        'bg-success'
                                                    }`}
                                                    style={{ 
                                                        width: product.stock === 0 ? '100%' : 
                                                        `${Math.min(100, Math.max(5, (product.stock / ((product.min_stock ?? 10) * 2)) * 100))}%` 
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleRestock(product)}
                                                className="p-2 text-foreground-subtle hover:text-success hover:bg-success/10 rounded-lg transition-colors"
                                            >
                                                <PackagePlus className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleViewHistory(product)}
                                                className="p-2 text-foreground-subtle hover:text-primary hover:bg-primary-muted rounded-lg transition-colors"
                                            >
                                                <ClipboardList className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEditProduct(product)}
                                                className="p-2 text-foreground-subtle hover:text-primary hover:bg-primary-muted rounded-lg transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id, product.name)}
                                                className="p-2 text-foreground-subtle hover:text-destructive hover:bg-destructive-muted rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedProduct(null); }}
                product={selectedProduct}
            />

            <RestockModal
                isOpen={isRestockModalOpen}
                onClose={() => { setIsRestockModalOpen(false); setSelectedActionProduct(null); }}
                product={selectedActionProduct}
            />

            <StockHistoryDrawer
                isOpen={isHistoryDrawerOpen}
                onClose={() => { setIsHistoryDrawerOpen(false); setSelectedActionProduct(null); }}
                product={selectedActionProduct}
            />

            <BulkRestockModal
                isOpen={isBulkRestockOpen}
                onClose={() => setIsBulkRestockOpen(false)}
            />
        </div>
    );
}
