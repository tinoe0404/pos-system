'use client';

import { useState, useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useDeleteProduct } from '@/hooks/useProductMutations';
import ProductModal from '@/components/admin/ProductModal';
import { Search, Plus, Edit, Trash2, Package, AlertCircle, Loader2 } from 'lucide-react';

export default function InventoryPage() {
    const { data: productsData, isLoading } = useProducts();
    const deleteProductMutation = useDeleteProduct();

    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    // Client-side search filter
    const filteredProducts = useMemo(() => {
        if (!productsData?.products) return [];

        const query = searchQuery.toLowerCase();
        return productsData.products.filter((product) =>
            product.name.toLowerCase().includes(query) ||
            product.sku.toLowerCase().includes(query) ||
            product.category?.toLowerCase().includes(query)
        );
    }, [productsData, searchQuery]);

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

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800">Inventory Management</h2>
                    <p className="text-sm text-slate-500">Manage your products and stock levels</p>
                </div>
                <button
                    onClick={handleAddProduct}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Product</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, SKU, or category..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Products</p>
                            <p className="text-2xl font-bold text-slate-900">{productsData?.count || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-50 rounded-lg">
                            <Package className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Active Products</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {productsData?.products.filter((p) => p.active).length || 0}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <AlertCircle className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Low Stock</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {productsData?.products.filter((p) => p.stock < 10).length || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">
                            {searchQuery ? 'No products found matching your search' : 'No products yet. Add your first product!'}
                        </p>
                    </div>
                ) : (
                    <div>
                        {/* Mobile scroll hint */}
                        <div className="md:hidden px-4 py-2 bg-blue-50 text-blue-700 text-xs text-center border-b border-blue-100">
                            ← Scroll horizontally to see all columns →
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                            Product
                                        </th>
                                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                            SKU
                                        </th>
                                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                            Category
                                        </th>
                                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                            Price
                                        </th>
                                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                            Stock
                                        </th>
                                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                            Status
                                        </th>
                                        <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <p className="font-medium text-slate-900">{product.name}</p>
                                                    {product.description && (
                                                        <p className="text-sm text-slate-500 line-clamp-1 max-w-xs">
                                                            {product.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                                <span className="font-mono text-sm text-slate-600">{product.sku}</span>
                                            </td>
                                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-slate-600">
                                                    {product.category || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                                <span className="font-medium text-slate-900">
                                                    ${Number(product.price).toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-900">{product.stock}</span>
                                                    {product.stock < 10 && (
                                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                                                            Low
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 text-xs font-medium rounded ${product.active
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                        }`}
                                                >
                                                    {product.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditProduct(product)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit product"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id, product.name)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                    </div>
                )}
            </div>

            {/* Product Modal */}
            <ProductModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedProduct(null);
                }}
                product={selectedProduct}
            />
        </div>
    );
}
