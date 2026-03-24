'use client';

import { X, Loader2, ArrowRight } from 'lucide-react';
import { useStockHistory } from '@/hooks/useStockHistory';
import { Product } from '@/types/product';

interface StockHistoryDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

export default function StockHistoryDrawer({ isOpen, onClose, product }: StockHistoryDrawerProps) {
    const { data: historyData, isLoading, isError } = useStockHistory(product?.id, 1, 50);

    if (!isOpen || !product) return null;

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'RESTOCK': return 'bg-success/10 text-success border-success/20';
            case 'SALE': return 'bg-primary/10 text-primary border-primary/20';
            case 'ADJUSTMENT': return 'bg-warning/10 text-warning border-warning/20';
            case 'VOID': return 'bg-destructive/10 text-destructive border-destructive/20';
            case 'INITIAL': return 'bg-foreground-muted/10 text-foreground border-border';
            default: return 'bg-card border-card-border text-foreground';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/50 backdrop-blur-sm transition-opacity">
            {/* Drawer Panel */}
            <div className="w-full max-w-md bg-card border-l border-card-border shadow-2xl h-full flex flex-col animate-slide-in-right transform transition-transform duration-300">
                {/* Header */}
                <div className="p-5 border-b border-card-border flex items-center justify-between bg-background-tertiary">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Stock History</h2>
                        <p className="text-sm text-foreground-muted">{product.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-card rounded-lg transition-colors text-foreground-muted"
                        aria-label="Close panel"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-40 space-y-4">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm text-foreground-muted">Loading history...</p>
                        </div>
                    ) : isError ? (
                        <div className="flex items-center justify-center h-40">
                            <p className="text-sm text-destructive">Failed to load history.</p>
                        </div>
                    ) : !historyData?.movements?.length ? (
                        <div className="flex items-center justify-center h-40">
                            <p className="text-sm text-foreground-muted">No stock movements found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 relative before:absolute before:inset-0 before:left-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-card-border before:to-transparent">
                            {historyData.movements.map((movement, idx) => {
                                const isPositive = movement.quantity_change > 0;
                                const isNegative = movement.quantity_change < 0;

                                return (
                                    <div key={movement.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-card-border bg-background-tertiary text-foreground-muted group-[.is-active]:text-foreground group-[.is-active]:bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 mx-auto">
                                            <span className={`text-xs font-bold ${isPositive ? 'text-success' : isNegative ? 'text-destructive' : 'text-foreground'}`}>
                                                {isPositive ? '+' : ''}{movement.quantity_change}
                                            </span>
                                        </div>
                                        
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-background-tertiary border border-card-border p-4 rounded-xl shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getTypeColor(movement.type)}`}>
                                                    {movement.type}
                                                </span>
                                                <time className="text-xs text-foreground-subtle">
                                                    {new Date(movement.created_at).toLocaleString()}
                                                </time>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 text-sm text-foreground font-medium mb-1">
                                                <span className="text-foreground-muted">Stock:</span>
                                                <span>{movement.previous_stock}</span>
                                                <ArrowRight className="w-3 h-3 text-foreground-subtle" />
                                                <span className="text-foreground font-bold">{movement.new_stock}</span>
                                            </div>
                                            
                                            {movement.reason && (
                                                <p className="text-xs text-foreground-muted italic mt-2 border-t border-card-border pt-2">
                                                    "{movement.reason}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
