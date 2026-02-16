'use client';

import { X, Printer, CheckCircle2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { CartItem } from '@/store/useCartStore';

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: {
        id: string;
        items: CartItem[];
        total: number;
        date: string;
        paymentMethod: 'CASH' | 'ECOCASH' | 'CARD';
        tax: number;
        discount?: number;
    } | null;
    autoPrint?: boolean;
}

export default function ReceiptModal({ isOpen, onClose, order, autoPrint = false }: ReceiptModalProps) {
    const [hasAutoPrinted, setHasAutoPrinted] = useState(false);

    useEffect(() => {
        if (isOpen && order && autoPrint && !hasAutoPrinted) {
            const timer = setTimeout(() => {
                window.print();
                setHasAutoPrinted(true);
            }, 300);
            return () => clearTimeout(timer);
        }
        if (!isOpen) setHasAutoPrinted(false);
    }, [isOpen, order, autoPrint, hasAutoPrinted]);

    if (!isOpen || !order) return null;

    const subtotal = order.total - order.tax;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm print:p-0 print:bg-white print:static">
            <div className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in print:shadow-none print:rounded-none print:w-full print:max-w-none print:border-none">
                {/* Header */}
                <div className="p-4 border-b border-card-border flex items-center justify-between print:hidden">
                    <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                        Order Complete
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-background-tertiary rounded-lg transition-colors text-foreground-muted" aria-label="Close">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Receipt Content */}
                <div id="receipt-content" className="p-6 print:p-4 print:bg-white">
                    <div className="text-center mb-4 print:mb-3">
                        <h1 className="text-xl font-bold text-foreground mb-1 print:text-lg print:text-black">RETAILPOS</h1>
                        <p className="text-[11px] text-foreground-muted print:text-black">123 Store Address, City</p>
                        <p className="text-[11px] text-foreground-muted print:text-black">Tel: +123 456 7890</p>
                    </div>

                    <div className="border-b border-dashed border-card-border my-3 print:border-black" />

                    <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-[11px] text-foreground-muted print:text-black">
                            <span>Date:</span>
                            <span>{new Date(order.date).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-foreground-muted print:text-black">
                            <span>Order ID:</span>
                            <span className="font-mono font-bold">#{order.id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-foreground-muted print:text-black">
                            <span>Payment:</span>
                            <span className="font-bold">{order.paymentMethod}</span>
                        </div>
                    </div>

                    <div className="border-b border-dashed border-card-border my-3 print:border-black" />

                    <div className="space-y-2 mb-3">
                        {order.items.map((item) => (
                            <div key={item.id} className="text-sm print:text-[11px]">
                                <div className="flex justify-between items-start">
                                    <span className="text-foreground font-medium flex-1 pr-2 print:text-black">{item.name}</span>
                                    <span className="font-mono font-bold text-foreground whitespace-nowrap print:text-black">
                                        ${(Number(item.price) * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                                <div className="text-[11px] text-foreground-muted ml-2 print:text-black">
                                    {item.quantity} x ${Number(item.price).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-b border-dashed border-card-border my-3 print:border-black" />

                    <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-sm text-foreground-muted print:text-black">
                            <span>Subtotal:</span>
                            <span className="font-mono">${subtotal.toFixed(2)}</span>
                        </div>
                        {(order.discount ?? 0) > 0 && (
                            <div className="flex justify-between text-sm text-success print:text-black">
                                <span>Discount:</span>
                                <span className="font-mono">-${(order.discount ?? 0).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-foreground-muted print:text-black">
                            <span>Tax (10%):</span>
                            <span className="font-mono">${order.tax.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-card-border pt-2 mt-2 print:border-black" />
                        <div className="flex justify-between text-lg font-bold text-foreground print:text-base print:text-black">
                            <span>TOTAL:</span>
                            <span className="font-mono">${order.total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="border-b border-dashed border-card-border my-3 print:border-black" />

                    {/* QR Code */}
                    <div className="flex flex-col items-center justify-center my-4 print:my-4">
                        {typeof window !== 'undefined' && order && (
                            <div className="bg-white p-2 rounded-lg">
                                {/* Cast to any to avoid React 19 type issues */}
                                {(() => {
                                    const QRCodeComponent = QRCode as any;
                                    return (
                                        <QRCodeComponent
                                            value={`${window.location.origin}/receipt/${order.id}`}
                                            size={100}
                                            style={{ height: "auto", maxWidth: "100%", width: "100px" }}
                                            viewBox={`0 0 256 256`}
                                        />
                                    );
                                })()}
                            </div>
                        )}
                        <p className="text-[10px] text-foreground-muted print:text-black mt-1">Scan for Digital Receipt</p>
                    </div>

                    <div className="text-center text-[11px] text-foreground-muted space-y-1 print:text-black">
                        <p className="font-semibold">Thank you for your purchase!</p>
                        <p>Please come again.</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-card-border flex gap-2 print:hidden">
                    <button
                        onClick={onClose}
                        className="flex-1 h-11 bg-background-tertiary border border-card-border text-foreground font-medium rounded-xl hover:bg-card-hover transition-colors text-sm"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex-1 h-11 bg-card border border-card-border text-foreground font-medium rounded-xl hover:bg-card-hover transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 h-11 bg-primary text-foreground font-medium rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        New Sale
                    </button>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    div:has(> #receipt-content), #receipt-content, #receipt-content * { visibility: visible; }
                    @page { size: 80mm auto; margin: 5mm; }
                    div:has(> #receipt-content) { position: absolute; left: 0; top: 0; width: 80mm; }
                    #receipt-content { width: 100%; font-family: 'Courier New', monospace !important; font-size: 11px !important; color: #000 !important; background: white !important; }
                    #receipt-content * { color: #000 !important; background: transparent !important; border-color: #000 !important; box-shadow: none !important; border-radius: 0 !important; }
                }
            `}</style>
        </div>
    );
}
