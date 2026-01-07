'use client';

import { X, Printer, CheckCircle2 } from 'lucide-react';
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
}

export default function ReceiptModal({ isOpen, onClose, order }: ReceiptModalProps) {
    if (!isOpen || !order) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:p-0 print:bg-white print:static">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:w-full print:max-w-none print:animate-none">
                {/* Modal Header - Hidden when printing */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between print:hidden">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        Order Complete
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Receipt Content */}
                <div id="receipt-content" className="p-6 bg-white print:p-0">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-slate-900 mb-1">POS SYSTEM</h1>
                        <p className="text-xs text-slate-500">123 Store Address, City</p>
                        <p className="text-xs text-slate-500">Tel: +123 456 7890</p>
                    </div>

                    <div className="border-b border-dashed border-slate-300 pb-4 mb-4">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Date:</span>
                            <span>{new Date(order.date).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Order ID:</span>
                            <span>#{order.id.slice(-6).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>Payment:</span>
                            <span className="font-bold">{order.paymentMethod}</span>
                        </div>
                    </div>

                    <div className="space-y-2 mb-4">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-slate-800">
                                    {item.quantity} x {item.name}
                                </span>
                                <span className="font-medium text-slate-900">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-dashed border-slate-300 pt-4 space-y-1">
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Subtotal</span>
                            <span>${(order.total - order.tax).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Tax (10%)</span>
                            <span>${order.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-slate-900 mt-2 pt-2 border-t border-slate-100">
                            <span>Total</span>
                            <span>${order.total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-xs text-slate-400">
                        <p>Thank you for your purchase!</p>
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
                        Print Receipt
                    </button>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    div:has(> #receipt-content),
                    #receipt-content,
                    #receipt-content * {
                        visibility: visible;
                    }
                    div:has(> #receipt-content) {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 20px;
                        box-shadow: none;
                        background: white;
                    }
                }
            `}</style>
        </div>
    );
}
