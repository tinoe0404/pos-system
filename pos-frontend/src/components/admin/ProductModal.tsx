'use client';

import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productFormSchema, ProductFormData } from '@/schemas/product.schema';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProductMutations';
import { useEffect } from 'react';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: {
        id: string;
        name: string;
        description: string | null;
        price: string;
        stock: number;
        sku: string;
        category: string | null;
        is_active: boolean;
    } | null;
}

export default function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
    const isEditMode = !!product;
    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<ProductFormData>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            stock: 0,
            sku: '',
            category: '',
            is_active: true,
        },
    });

    // Reset form when modal opens/closes or product changes
    useEffect(() => {
        if (isOpen && product) {
            reset({
                name: product.name,
                description: product.description || '',
                price: parseFloat(product.price),
                stock: product.stock,
                sku: product.sku,
                category: product.category || '',
                is_active: product.is_active,
            });
        } else if (isOpen && !product) {
            reset({
                name: '',
                description: '',
                price: 0,
                stock: 0,
                sku: '',
                category: '',
                is_active: true,
            });
        }
    }, [isOpen, product, reset]);

    const onSubmit = async (data: ProductFormData) => {
        if (isEditMode) {
            updateMutation.mutate(
                { id: product.id, data },
                {
                    onSuccess: () => {
                        onClose();
                        reset();
                    },
                }
            );
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">
                        {isEditMode ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Product Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('name')}
                            type="text"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="Enter product name"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </div>

                    {/* SKU */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            SKU <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('sku')}
                            type="text"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="e.g., PROD-001"
                        />
                        {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku.message}</p>}
                    </div>

                    {/* Price and Stock Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Price ($) <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('price', { valueAsNumber: true })}
                                type="number"
                                step="0.01"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="0.00"
                            />
                            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Stock <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('stock', { valueAsNumber: true })}
                                type="number"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="0"
                            />
                            {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>}
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <input
                            {...register('category')}
                            type="text"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="e.g., Electronics, Food, etc."
                        />
                        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                            placeholder="Product description (optional)"
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center gap-3">
                        <input
                            {...register('is_active')}
                            type="checkbox"
                            id="is_active"
                            className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                            Product is active
                        </label>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isLoading}
                        className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>{isEditMode ? 'Update Product' : 'Create Product'}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
