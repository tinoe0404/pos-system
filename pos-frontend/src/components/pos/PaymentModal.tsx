'use client';

import { X, Banknote, Smartphone } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (method: 'CASH' | 'ECOCASH') => void;
    totalAmount: number;
    isLoading: boolean;
}

export default function PaymentModal({
    isOpen,
    onClose,
    onConfirm,
    totalAmount,
    isLoading,
}: PaymentModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">Select Payment Method</h2>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-6 text-center">
                        <p className="text-slate-500 mb-1">Total Amount to Pay</p>
                        <p className="text-3xl font-bold text-slate-900">
                            ${totalAmount.toFixed(2)}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => onConfirm('CASH')}
                            disabled={isLoading}
                            className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                        >
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Banknote className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-slate-700 group-hover:text-blue-700">Cash</span>
                        </button>

                        <button
                            onClick={() => onConfirm('ECOCASH')}
                            disabled={isLoading}
                            className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                        >
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Smartphone className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-slate-700 group-hover:text-blue-700">EcoCash</span>
                        </button>
                    </div>
                </div>

                {isLoading && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-sm text-slate-500">
                        Processing payment...
                    </div>
                )}
            </div>
        </div>
    );
}
