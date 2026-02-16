'use client';

import { X, Banknote, Smartphone, CreditCard, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CartItem } from '@/store/useCartStore';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (method: 'CASH' | 'ECOCASH' | 'CARD') => void;
    totalAmount: number;
    subtotal: number;
    tax: number;
    discount?: number;
    items: CartItem[];
    isLoading: boolean;
}

type PaymentMethod = 'CASH' | 'ECOCASH' | 'CARD';
type Step = 'METHOD' | 'CASH_TENDERED' | 'SUMMARY';

export default function PaymentModal({
    isOpen, onClose, onConfirm, totalAmount, subtotal, tax, discount = 0, items, isLoading,
}: PaymentModalProps) {
    const [step, setStep] = useState<Step>('METHOD');
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [cashTendered, setCashTendered] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setStep('METHOD');
            setSelectedMethod(null);
            setCashTendered('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleMethodSelect = (method: PaymentMethod) => {
        setSelectedMethod(method);
        if (method === 'CASH') {
            setStep('CASH_TENDERED');
        } else {
            setStep('SUMMARY');
        }
    };

    const handleBack = () => {
        if (step === 'SUMMARY' && selectedMethod === 'CASH') {
            setStep('CASH_TENDERED');
        } else {
            setStep('METHOD');
            setSelectedMethod(null);
            setCashTendered('');
        }
    };

    const cashAmount = parseFloat(cashTendered) || 0;
    const change = cashAmount - totalAmount;

    const quickAmounts = [
        Math.ceil(totalAmount),
        Math.ceil(totalAmount / 5) * 5,
        Math.ceil(totalAmount / 10) * 10,
        Math.ceil(totalAmount / 20) * 20,
    ].filter((v, i, a) => a.indexOf(v) === i && v >= totalAmount).slice(0, 4);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-5 border-b border-card-border flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        {step !== 'METHOD' && (
                            <button onClick={handleBack} className="p-1 hover:bg-background-tertiary rounded-lg transition-colors text-foreground-muted">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <h2 className="text-lg font-semibold text-foreground">
                            {step === 'METHOD' ? 'Payment Method' : step === 'CASH_TENDERED' ? 'Cash Payment' : 'Confirm Order'}
                        </h2>
                    </div>
                    <button onClick={onClose} disabled={isLoading} className="p-2 hover:bg-background-tertiary rounded-lg transition-colors text-foreground-muted">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto flex-1">
                    {step === 'METHOD' ? (
                        <div className="space-y-5">
                            <div className="text-center">
                                <p className="text-foreground-muted text-sm mb-1">Total Amount</p>
                                <p className="text-3xl font-bold text-foreground">${totalAmount.toFixed(2)}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { method: 'CASH' as PaymentMethod, icon: Banknote, label: 'Cash', color: 'text-success bg-success-muted' },
                                    { method: 'CARD' as PaymentMethod, icon: CreditCard, label: 'Card', color: 'text-primary bg-primary-muted' },
                                    { method: 'ECOCASH' as PaymentMethod, icon: Smartphone, label: 'EcoCash', color: 'text-warning bg-warning-muted' },
                                ].map(({ method, icon: Icon, label, color }) => (
                                    <button
                                        key={method}
                                        onClick={() => handleMethodSelect(method)}
                                        disabled={isLoading}
                                        className="flex flex-col items-center justify-center p-5 rounded-xl border border-card-border hover:border-border-hover hover:bg-card-hover transition-all group"
                                    >
                                        <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-semibold text-foreground text-sm">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : step === 'CASH_TENDERED' ? (
                        <div className="space-y-5">
                            <div className="text-center">
                                <p className="text-foreground-muted text-sm mb-1">Amount Due</p>
                                <p className="text-2xl font-bold text-foreground">${totalAmount.toFixed(2)}</p>
                            </div>
                            {/* Cash Input */}
                            <div>
                                <label className="block text-sm font-medium text-foreground-muted mb-2">Cash Tendered</label>
                                <input
                                    type="number"
                                    value={cashTendered}
                                    onChange={(e) => setCashTendered(e.target.value)}
                                    placeholder="0.00"
                                    autoFocus
                                    className="w-full h-14 px-4 bg-input-bg border border-input-border rounded-xl text-foreground text-2xl font-bold text-center outline-none focus:border-input-focus focus:ring-2 focus:ring-primary-muted"
                                />
                            </div>
                            {/* Quick Amounts */}
                            <div className="grid grid-cols-4 gap-2">
                                {quickAmounts.map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => setCashTendered(amount.toString())}
                                        className="py-2.5 bg-background-tertiary border border-card-border rounded-lg text-sm font-semibold text-foreground hover:bg-card-hover transition-colors"
                                    >
                                        ${amount}
                                    </button>
                                ))}
                            </div>
                            {/* Change display */}
                            {cashAmount > 0 && (
                                <div className={`p-4 rounded-xl text-center ${change >= 0 ? 'bg-success-muted' : 'bg-destructive-muted'}`}>
                                    <p className={`text-sm font-medium ${change >= 0 ? 'text-success' : 'text-destructive'}`}>
                                        {change >= 0 ? 'Change' : 'Insufficient'}
                                    </p>
                                    <p className={`text-2xl font-bold ${change >= 0 ? 'text-success' : 'text-destructive'}`}>
                                        ${Math.abs(change).toFixed(2)}
                                    </p>
                                </div>
                            )}
                            {/* Continue button */}
                            <button
                                onClick={() => setStep('SUMMARY')}
                                disabled={cashAmount < totalAmount}
                                className="w-full h-12 bg-primary text-foreground font-semibold rounded-xl hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                Continue
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Order Summary */}
                            <div className="bg-background-secondary p-4 rounded-xl space-y-3">
                                <div className="flex justify-between items-center text-sm font-medium text-foreground-muted border-b border-card-border pb-2">
                                    <span>Order Summary</span>
                                    <span className="bg-card px-2 py-1 rounded border border-card-border text-xs text-foreground">
                                        {selectedMethod}
                                    </span>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-foreground-muted">
                                                <span className="font-bold text-foreground">{item.quantity}x</span> {item.name}
                                            </span>
                                            <span className="text-foreground font-medium">
                                                ${(Number(item.price) * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-sm text-foreground-muted">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm text-success">
                                        <span>Discount</span>
                                        <span>-${discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-foreground-muted">
                                    <span>Tax (10%)</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                {selectedMethod === 'CASH' && cashAmount > 0 && (
                                    <div className="flex justify-between text-sm text-foreground-muted">
                                        <span>Cash Tendered</span>
                                        <span>${cashAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                {selectedMethod === 'CASH' && change > 0 && (
                                    <div className="flex justify-between text-sm text-success font-medium">
                                        <span>Change</span>
                                        <span>${change.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="h-px bg-card-border my-1" />
                                <div className="flex justify-between text-xl font-bold text-foreground pt-1">
                                    <span>Total</span>
                                    <span>${totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step === 'SUMMARY' && (
                    <div className="p-5 border-t border-card-border flex gap-3 shrink-0">
                        <button
                            onClick={handleBack}
                            disabled={isLoading}
                            className="flex-1 h-12 bg-background-tertiary border border-card-border text-foreground font-semibold rounded-xl hover:bg-card-hover transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => selectedMethod && onConfirm(selectedMethod)}
                            disabled={isLoading}
                            className="flex-[2] h-12 bg-primary text-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
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
