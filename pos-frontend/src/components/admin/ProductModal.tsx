'use client';

import { X, Loader2 } from 'lucide-react';
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
    } = useForm<ProductFormData>({
        resolver: zodResolver(productFormSchema) as any,
        defaultValues: {
            name: '', description: '', price: 0, stock: 0, sku: '', category: '', is_active: true,
        },
    });

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
            reset({ name: '', description: '', price: 0, stock: 0, sku: '', category: '', is_active: true });
        }
    }, [isOpen, product, reset]);

    const onSubmit = async (data: ProductFormData) => {
        if (isEditMode) {
            updateMutation.mutate({ id: product.id, data }, { onSuccess: () => { onClose(); reset(); } });
        } else {
            createMutation.mutate(data, { onSuccess: () => { onClose(); reset(); } });
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    if (!isOpen) return null;

    const inputClass = 'w-full h-11 px-4 bg-input-bg border border-input-border rounded-xl text-sm text-foreground outline-none transition-all focus:border-input-focus focus:ring-2 focus:ring-primary-muted placeholder:text-foreground-subtle disabled:opacity-50';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-5 border-b border-card-border flex items-center justify-between shrink-0">
                    <h2 className="text-lg font-semibold text-foreground">
                        {isEditMode ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-2 hover:bg-background-tertiary rounded-lg transition-colors text-foreground-muted"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4 overflow-y-auto flex-1">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-foreground-muted">
                            Product Name <span className="text-destructive">*</span>
                        </label>
                        <input {...register('name')} type="text" className={inputClass} placeholder="Enter product name" />
                        {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
                    </div>

                    {/* SKU */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-foreground-muted">
                            SKU <span className="text-destructive">*</span>
                        </label>
                        <input {...register('sku')} type="text" className={inputClass} placeholder="e.g., PROD-001" />
                        {errors.sku && <p className="text-destructive text-xs">{errors.sku.message}</p>}
                    </div>

                    {/* Price and Stock */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-foreground-muted">
                                Price ($) <span className="text-destructive">*</span>
                            </label>
                            <input {...register('price', { valueAsNumber: true })} type="number" step="0.01" className={inputClass} placeholder="0.00" />
                            {errors.price && <p className="text-destructive text-xs">{errors.price.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-foreground-muted">
                                Stock <span className="text-destructive">*</span>
                            </label>
                            <input {...register('stock', { valueAsNumber: true })} type="number" className={inputClass} placeholder="0" />
                            {errors.stock && <p className="text-destructive text-xs">{errors.stock.message}</p>}
                        </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-foreground-muted">Category</label>
                        <input {...register('category')} type="text" className={inputClass} placeholder="e.g., Electronics, Food, etc." />
                        {errors.category && <p className="text-destructive text-xs">{errors.category.message}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-foreground-muted">Description</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full p-3 bg-input-bg border border-input-border rounded-xl text-sm text-foreground outline-none transition-all focus:border-input-focus focus:ring-2 focus:ring-primary-muted resize-none placeholder:text-foreground-subtle"
                            placeholder="Product description (optional)"
                        />
                        {errors.description && <p className="text-destructive text-xs">{errors.description.message}</p>}
                    </div>

                    {/* Active Toggle */}
                    <label htmlFor="is_active" className="flex items-center gap-3 cursor-pointer">
                        <input
                            {...register('is_active')}
                            type="checkbox"
                            id="is_active"
                            className="w-4 h-4 text-primary bg-input-bg border-input-border rounded focus:ring-2 focus:ring-primary-muted"
                        />
                        <span className="text-sm font-medium text-foreground-muted">Product is active</span>
                    </label>
                </form>

                {/* Footer */}
                <div className="p-5 border-t border-card-border flex gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 h-11 bg-background-tertiary border border-card-border text-foreground font-semibold rounded-xl hover:bg-card-hover transition-colors text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isLoading}
                        className="flex-[2] h-11 bg-primary text-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20 text-sm disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
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
