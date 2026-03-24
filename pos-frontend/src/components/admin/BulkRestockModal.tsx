'use client';

import { useState } from 'react';
import { X, Loader2, Search, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useRestockProduct } from '@/hooks/useInventoryMutations';
import { toast } from 'sonner';

interface BulkRestockModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BulkRestockModal({ isOpen, onClose }: BulkRestockModalProps) {
    const { data: productsData, isLoading: isLoadingProducts } = useProducts();
    const restockMutation = useRestockProduct();

    const [searchQuery, setSearchQuery] = useState('');
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    if (!isOpen) return null;

    const filteredProducts = productsData?.products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const hasChanges = Object.values(quantities).some(q => q > 0);

    const handleQuantityChange = (productId: string, value: string) => {
        const numValue = parseInt(value);
        if (value === '') {
            const newQuantities = { ...quantities };
            delete newQuantities[productId];
            setQuantities(newQuantities);
        } else if (!isNaN(numValue) && numValue >= 0) {
            setQuantities({ ...quantities, [productId]: numValue });
        }
    };

    const handleApplyAll = async () => {
        const itemsToRestock = Object.entries(quantities).filter(([, quantity]) => quantity > 0);
        
        if (itemsToRestock.length === 0) return;

        setIsSubmitting(true);
        setProgress({ current: 0, total: itemsToRestock.length });
        
        let successCount = 0;
        let failCount = 0;

        for (const [productId, quantity] of itemsToRestock) {
            try {
                await restockMutation.mutateAsync({ productId, quantity });
                successCount++;
            } catch (error) {
                console.error(`Failed to restock product ${productId}:`, error);
                failCount++;
            }
            setProgress(prev => ({ ...prev, current: prev.current + 1 }));
        }

        setIsSubmitting(false);
        setQuantities({});
        
        if (failCount === 0) {
            toast.success(`Successfully restocked ${successCount} products`);
            onClose();
        } else {
            toast.warning(`Restocked ${successCount} products, but ${failCount} failed`);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col animate-scale-in">
                {/* Header */}
                <div className="p-5 border-b border-card-border flex items-center justify-between shrink-0 bg-background-tertiary rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Bulk Restock</h2>
                        <p className="text-sm text-foreground-muted mt-1">Receive deliveries by updating multiple items at once</p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-2 hover:bg-card rounded-lg transition-colors text-foreground-muted"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search / Toolbar */}
                <div className="p-4 border-b border-card-border shrink-0 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products to restock..."
                            className="w-full h-10 pl-10 pr-4 bg-background-tertiary border border-card-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-muted"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="flex items-center text-sm font-medium text-foreground-muted px-2">
                        {Object.keys(quantities).length} items selected
                    </div>
                </div>

                {/* Product List */}
                <div className="flex-1 overflow-y-auto p-4 bg-background">
                    {isLoadingProducts ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredProducts.map(product => {
                                const q = quantities[product.id] || '';
                                return (
                                    <div 
                                        key={product.id} 
                                        className={`p-3 rounded-xl border transition-colors ${
                                            q ? 'bg-primary/5 border-primary/20' : 'bg-card border-card-border hover:border-foreground-muted/30'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-semibold text-sm text-foreground line-clamp-1">{product.name}</p>
                                                <p className="text-xs text-foreground-subtle font-mono mt-0.5">{product.sku}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-foreground-muted">Stock</p>
                                                <p className="font-bold text-sm text-foreground">{product.stock}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="0"
                                                value={q}
                                                onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                                placeholder="+ Add qty"
                                                disabled={isSubmitting}
                                                className="flex-1 h-9 px-3 text-sm bg-background-tertiary border border-card-border rounded-lg outline-none focus:ring-2 focus:ring-primary-muted"
                                            />
                                            {typeof q === 'number' && q > 0 && (
                                                <div className="flex items-center text-xs font-semibold text-success shrink-0 whitespace-nowrap bg-success/10 px-2 h-9 rounded-lg">
                                                    {product.stock} <ArrowRight className="w-3 h-3 mx-1" /> {product.stock + q}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-card-border shrink-0 bg-card rounded-b-2xl">
                    {isSubmitting ? (
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-foreground">Processing...</span>
                                <span className="text-primary">{progress.current} / {progress.total}</span>
                            </div>
                            <div className="h-2 w-full bg-background-tertiary rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary transition-all duration-300 rounded-full"
                                    style={{ width: `${(progress.current / Math.max(1, progress.total)) * 100}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-background-tertiary border border-card-border text-foreground font-semibold rounded-xl hover:bg-card-hover transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApplyAll}
                                disabled={!hasChanges}
                                className="flex-1 py-2.5 bg-primary text-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20 text-sm disabled:opacity-50 disabled:shadow-none"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Apply All Restocks ({Object.values(quantities).filter(q => q > 0).length} items)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
