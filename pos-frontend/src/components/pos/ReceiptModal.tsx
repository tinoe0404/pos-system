'use client';

import { X, Printer, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CartItem } from '@/store/useCartStore';

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: {
        id: string;
        items: CartItem[];
        total: number;
        date: string;
        paymentMethod: 'CASH' | 'ECOCASH';
        tax: number;
    } | null;
    autoPrint?: boolean; // Enable auto-print for fast workflows
}

export default function ReceiptModal({ isOpen, onClose, order, autoPrint = true }: ReceiptModalProps) {
    const [hasAutoPrinted, setHasAutoPrinted] = useState(false);

    // Auto-print when modal opens (high-volume workflow optimization)
    useEffect(() => {
        if (isOpen && order && autoPrint && !hasAutoPrinted) {
            // Small delay to ensure content is rendered before printing
            const timer = setTimeout(() => {
                window.print();
                setHasAutoPrinted(true);
            }, 300);
            return () => clearTimeout(timer);
        }

        // Reset auto-print flag when modal closes
        if (!isOpen) {
            setHasAutoPrinted(false);
        }
    }, [isOpen, order, autoPrint, hasAutoPrinted]);

    if (!isOpen || !order) return null;

    const handlePrint = () => {
        window.print();
    };

    const subtotal = order.total - order.tax;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:p-0 print:bg-white print:static">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:rounded-none print:w-full print:max-w-none print:animate-none">
                {/* Modal Header - Hidden when printing */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between print:hidden">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        Order Complete
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Receipt Content - Optimized for 58mm/80mm thermal paper */}
                <div id="receipt-content" className="p-6 bg-white print:p-4">
                    {/* Store Header */}
                    <div className="text-center mb-4 print:mb-3">
                        <h1 className="text-2xl font-bold text-slate-900 mb-1 print:text-lg print:font-bold">
                            POS SYSTEM
                        </h1>
                        <p className="text-xs text-slate-500 print:text-[10px]">123 Store Address, City</p>
                        <p className="text-xs text-slate-500 print:text-[10px]">Tel: +123 456 7890</p>
                    </div>

                    {/* Divider */}
                    <div className="border-b border-dashed border-slate-300 my-3 print:my-2" />

                    {/* Order Info */}
                    <div className="space-y-1 mb-3 print:mb-2">
                        <div className="flex justify-between text-xs text-slate-600 print:text-[10px]">
                            <span>Date:</span>
                            <span>{new Date(order.date).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600 print:text-[10px]">
                            <span>Order ID:</span>
                            <span className="font-mono font-bold">#{order.id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600 print:text-[10px]">
                            <span>Payment:</span>
                            <span className="font-bold">{order.paymentMethod}</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-b border-dashed border-slate-300 my-3 print:my-2" />

                    {/* Items List */}
                    <div className="space-y-2 mb-3 print:mb-2 print:space-y-1">
                        {order.items.map((item) => (
                            <div key={item.id} className="text-sm print:text-[11px]">
                                <div className="flex justify-between items-start">
                                    <span className="text-slate-800 font-medium flex-1 pr-2">
                                        {item.name}
                                    </span>
                                    <span className="font-mono font-bold text-slate-900 whitespace-nowrap">
                                        ${(Number(item.price) * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 print:text-[9px] ml-2">
                                    {item.quantity} × ${Number(item.price).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="border-b border-dashed border-slate-300 my-3 print:my-2" />

                    {/* Totals */}
                    <div className="space-y-1 mb-3 print:mb-2">
                        <div className="flex justify-between text-sm text-slate-600 print:text-[11px]">
                            <span>Subtotal:</span>
                            <span className="font-mono">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600 print:text-[11px]">
                            <span>Tax (10%):</span>
                            <span className="font-mono">${order.tax.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-2 mt-2 print:pt-1 print:mt-1" />
                        <div className="flex justify-between text-lg font-bold text-slate-900 print:text-base">
                            <span>TOTAL:</span>
                            <span className="font-mono">${order.total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-b border-dashed border-slate-300 my-3 print:my-2" />

                    {/* Footer */}
                    <div className="text-center text-xs text-slate-500 space-y-1 print:text-[10px] print:space-y-0.5">
                        <p className="font-semibold">Thank you for your purchase!</p>
                        <p>Please come again.</p>
                    </div>
                </div>

                {/* Footer Actions - Hidden when printing */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 print:hidden">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                        <Printer className="w-4 h-4" />
                        Print Again
                    </button>
                </div>
            </div>

            {/* Thermal Printer Optimized Styles */}
            <style jsx global>{`
                @media print {
                    /* Hide everything except receipt */
                    body * {
                        visibility: hidden;
                    }
                    
                    div:has(> #receipt-content),
                    #receipt-content,
                    #receipt-content * {
                        visibility: visible;
                    }
                    
                    /* Page setup for thermal printer (80mm width) */
                    @page {
                        size: 80mm auto; /* Auto height for continuous paper */
                        margin: 5mm; /* Minimal margins */
                    }
                    
                    /* Receipt container */
                    div:has(> #receipt-content) {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 80mm;
                        max-width: 80mm;
                        margin: 0;
                        padding: 0;
                        box-shadow: none;
                        background: white;
                    }
                    
                    /* Receipt content */
                    #receipt-content {
                        width: 100%;
                        max-width: 80mm;
                        padding: 5mm !important;
                        font-family: 'Courier New', 'Courier', monospace !important;
                        font-size: 11px !important;
                        line-height: 1.4 !important;
                        color: #000 !important;
                        background: white !important;
                    }
                    
                    /* Force black and white */
                    #receipt-content * {
                        color: #000 !important;
                        background: transparent !important;
                        border-color: #000 !important;
                    }
                    
                    /* Optimize text rendering */
                    #receipt-content h1,
                    #receipt-content h2,
                    #receipt-content .font-bold {
                        font-weight: bold !important;
                    }
                    
                    /* Remove any shadows, rounded corners */
                    #receipt-content * {
                        box-shadow: none !important;
                        border-radius: 0 !important;
                    }
                    
                    /* Ensure monospace for numbers */
                    #receipt-content .font-mono {
                        font-family: 'Courier New', 'Courier', monospace !important;
                    }
                }
            `}</style>
        </div>
    );
}
