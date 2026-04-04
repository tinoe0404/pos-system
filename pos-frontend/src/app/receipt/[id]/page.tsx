'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CartItem } from '@/store/useCartStore';

interface Sale {
    id: string;
    total: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    payment_method: 'CASH' | 'ECOCASH';
    created_at: string;
    items: {
        id: string;
        quantity: number;
        price_at_sale: string;
        product: {
            name: string;
            sku: string;
        };
    }[];
    user: {
        username: string;
    };
}

export default function ReceiptPage() {
    const params = useParams();
    const [sale, setSale] = useState<Sale | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReceipt = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/sales/${params.id}/receipt`);
                if (!response.ok) {
                    throw new Error('Receipt not found');
                }
                const data = await response.json();
                setSale(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load receipt');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchReceipt();
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (error || !sale) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-center">
                <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold text-foreground mb-2">Receipt Not Found</h1>
                <p className="text-foreground-muted">The receipt you are looking for does not exist or has been removed.</p>
            </div>
        );
    }

    const subtotal = sale.items.reduce((sum, item) => sum + (Number(item.price_at_sale) * item.quantity), 0);
    // Assuming tax is calculated same as frontend (10% on top of total? Or inclusive?)
    // In backend createSale, total is calculated. Tax logic is usually business logic.
    // For now, let's just show Total as per backend.
    // Wait, backend total includes tax?
    // In CartPanel: tax = (subtotal - discount) * 0.1; finalTotal = subtotal - discount + tax.
    // So Backend Total = finalTotal.
    // We can reverse calculate or just show Total.
    const total = Number(sale.total);
    // Simple reverse for display relative to Tax (10%)
    // Total = Subtotal * 1.1
    // So Subtotal = Total / 1.1
    // Tax = Total - Subtotal
    const calculatedSubtotal = total / 1.1;
    const calculatedTax = total - calculatedSubtotal;


    return (
        <div className="min-h-screen bg-background-secondary p-4 flex justify-center items-start pt-10">
            <div className="bg-card w-full max-w-sm rounded-2xl shadow-lg overflow-hidden border border-card-border">
                {/* Header */}
                <div className="bg-primary p-6 text-center text-primary-foreground">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-bold">Payment Successful</h1>
                    <p className="text-primary-foreground/80 text-sm mt-1">{new Date(sale.created_at).toLocaleString()}</p>
                </div>

                {/* Amount */}
                <div className="text-center py-6 border-b border-card-border">
                    <p className="text-foreground-muted text-sm mb-1">Total Amount</p>
                    <h2 className="text-3xl font-bold text-foreground">${total.toFixed(2)}</h2>
                </div>

                {/* Items */}
                <div className="p-6 space-y-4">
                    <h3 className="text-sm font-medium text-foreground-muted uppercase tracking-wider">Order Details</h3>
                    <div className="space-y-3">
                        {sale.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-start">
                                <div className="flex-1">
                                    <p className="font-medium text-foreground text-sm">{item.product.name}</p>
                                    <p className="text-xs text-foreground-muted">{item.quantity} x ${Number(item.price_at_sale).toFixed(2)}</p>
                                </div>
                                <span className="font-semibold text-foreground text-sm">
                                    ${(item.quantity * Number(item.price_at_sale)).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-dashed border-card-border my-4" />

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-foreground-muted">Subtotal</span>
                            <span className="text-foreground font-medium">${calculatedSubtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-foreground-muted">Tax (10%)</span>
                            <span className="text-foreground font-medium">${calculatedTax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold pt-2 border-t border-card-border mt-2">
                            <span className="text-foreground">Total</span>
                            <span className="text-foreground">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-background-tertiary p-4 text-center text-xs text-foreground-muted border-t border-card-border">
                    <p>Order ID: #{sale.id.slice(-8).toUpperCase()}</p>
                    <p className="mt-1">Served by {sale.user.username}</p>
                    <p className="mt-4 font-medium">Thank you for your business!</p>
                </div>
            </div>
        </div>
    );
}
