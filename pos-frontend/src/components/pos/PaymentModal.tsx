'use client';

import { X, Banknote, Smartphone, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CartItem } from '@/store/useCartStore';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (method: 'CASH' | 'ECOCASH') => void;
    totalAmount: number;
    subtotal: number;
    tax: number;
    items: CartItem[];
    isLoading: boolean;
}

type PaymentMethod = 'CASH' | 'ECOCASH';
type Step = 'METHOD' | 'SUMMARY';

export default function PaymentModal({
    isOpen,
    onClose,
    onConfirm,
    totalAmount,
    subtotal,
    tax,
    items,
    isLoading,
}: PaymentModalProps) {
    const [step, setStep] = useState<Step>('METHOD');
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setStep('METHOD');
            setSelectedMethod(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleMethodSelect = (method: PaymentMethod) => {
        setSelectedMethod(method);
        setStep('SUMMARY');
    };

    const handleBack = () => {
        setStep('METHOD');
        setSelectedMethod(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {step === 'SUMMARY' && (
                            <button
                                onClick={handleBack}
                                className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <h2 className="text-xl font-bold text-slate-800">
                            {step === 'METHOD' ? 'Select Payment Method' : 'Confirm Order'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {step === 'METHOD' ? (
                        <div className="space-y-6">
                            <div className="text-center">
                                <p className="text-slate-500 mb-1">Total Amount to Pay</p>
                                <p className="text-3xl font-bold text-slate-900">
                                    ${totalAmount.toFixed(2)}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleMethodSelect('CASH')}
                                    disabled={isLoading}
                                    className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                                >
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Banknote className="w-6 h-6" />
                                    </div>
                                    <span className="font-bold text-slate-700 group-hover:text-blue-700">Cash</span>
                                </button>

                                <button
                                    onClick={() => handleMethodSelect('ECOCASH')}
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
                    ) : (
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <div className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                                    <div className="flex justify-between items-center text-sm font-medium text-slate-500 border-b border-slate-200 pb-2">
                                        <span>Order Summary</span>
                                        <span className="bg-white px-2 py-1 rounded border border-slate-200 text-xs">
                                            {selectedMethod}
                                        </span>
                                    </div>

                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {items.map((item) => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span className="text-slate-700">
                                                    <span className="font-bold text-slate-900">{item.quantity}x</span> {item.name}
                                                </span>
                                                <span className="text-slate-600">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <div className="flex justify-between text-sm text-slate-500">
                                        <span>Subtotal</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-500">
                                        <span>Tax (10%)</span>
                                        <span>${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold text-slate-900 pt-2 border-t border-slate-100">
                                        <span>Total</span>
                                        <span>${totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {step === 'SUMMARY' && (
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 flex-shrink-0">
                        <button
                            onClick={handleBack}
                            disabled={isLoading}
                            className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => selectedMethod && onConfirm(selectedMethod)}
                            disabled={isLoading}
                            className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                        >
                            {isLoading ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    Confirm & Pay
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
