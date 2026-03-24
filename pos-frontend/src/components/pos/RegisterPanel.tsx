'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, LogOut, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentRegister, openRegister, closeRegister, cashIn, cashOut } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface RegisterPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RegisterPanel({ isOpen, onClose }: RegisterPanelProps) {
    const queryClient = useQueryClient();
    const [mode, setMode] = useState<'view' | 'open' | 'close' | 'in' | 'out'>('view');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');

    // Fetch current register status
    const { data: registerData, isLoading } = useQuery({
        queryKey: ['register'],
        queryFn: async () => {
            const res = await getCurrentRegister();
            return res.data;
        },
        enabled: isOpen,
    });

    const isOpenRegister = registerData?.isOpen;
    const register = registerData?.register;

    // Reset mode when data loads
    useEffect(() => {
        if (!isLoading) {
            if (!isOpenRegister) setMode('open');
            else if (mode === 'open') setMode('view');
        }
    }, [isOpenRegister, isLoading, isOpen]);

    const openMutation = useMutation({
        mutationFn: (amount: number) => openRegister(amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['register'] });
            toast.success('Register opened successfully');
            setMode('view');
            setAmount('');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to open register');
        }
    });

    const closeMutation = useMutation({
        mutationFn: ({ amount, note }: { amount: number, note?: string }) => closeRegister(amount, note),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['register'] });
            toast.success(`Register closed. Difference: ${formatCurrency(data.data.difference)}`);
            onClose();
            setAmount('');
            setNote('');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to close register');
        }
    });

    const cashMovementMutation = useMutation({
        mutationFn: ({ type, amount, note }: { type: 'in' | 'out', amount: number, note?: string }) =>
            type === 'in' ? cashIn(amount, note) : cashOut(amount, note),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['register'] });
            toast.success('Cash movement recorded');
            setMode('view');
            setAmount('');
            setNote('');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to record cash movement');
        }
    });

    const handleSubmit = () => {
        const val = parseFloat(amount);
        if (isNaN(val) || val < 0) {
            toast.error('Please enter a valid positive amount');
            return;
        }

        if (mode === 'open') {
            openMutation.mutate(val);
        } else if (mode === 'close') {
            closeMutation.mutate({ amount: val, note });
        } else if (mode === 'in' || mode === 'out') {
            cashMovementMutation.mutate({ type: mode, amount: val, note });
        }
    };

    // Quick calculations from logs
    const calculateTotals = () => {
        if (!register?.logs) return { cashSales: 0, cashIn: 0, cashOut: 0, expected: 0 };
        let cashSales = 0, totalIn = 0, totalOut = 0;

        register.logs.forEach((log: { type: string; amount: string | number }) => {
            const amt = Number(log.amount);
            if (log.type === 'SALE') cashSales += amt;
            if (log.type === 'CASH_IN') totalIn += amt;
            if (log.type === 'CASH_OUT') totalOut += amt;
        });

        const expected = Number(register.opening_amount) + cashSales + totalIn - totalOut;
        return { cashSales, cashIn: totalIn, cashOut: totalOut, expected };
    };

    const totals = calculateTotals();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        className="fixed left-0 top-0 bottom-0 w-full max-w-md bg-background-secondary border-r border-card-border shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-card-border flex justify-between items-center bg-background-primary">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-accent" />
                                Cash Register
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-background-tertiary rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div></div>
                            ) : mode === 'view' ? (
                                <>
                                    {/* Status Card */}
                                    <div className="bg-background-primary p-4 rounded-xl border border-card-border">
                                        <div className="text-sm text-foreground-subtle mb-1">Status</div>
                                        <div className="flex justify-between items-end">
                                            <div className="text-2xl font-bold text-success">OPEN</div>
                                            <div className="text-sm text-foreground-subtle">
                                                Since {new Date(register.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <StatBox label="Opening Float" value={Number(register.opening_amount)} />
                                        <StatBox label="Cash Sales" value={totals.cashSales} />
                                        <StatBox label="Cash In" value={totals.cashIn} className="text-success" />
                                        <StatBox label="Cash Out" value={totals.cashOut} className="text-danger" />
                                        <StatBox label="Expected Cash" value={totals.expected} className="col-span-2 bg-accent/10 border-accent/20" valueClass="text-accent" />
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-2 pt-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <button onClick={() => setMode('in')} className="btn-secondary py-3">Cash In</button>
                                            <button onClick={() => setMode('out')} className="btn-secondary py-3">Cash Out</button>
                                        </div>
                                        <button onClick={() => setMode('close')} className="btn-primary w-full py-3 bg-danger hover:bg-danger/90">
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Close Register & End Shift
                                        </button>
                                    </div>
                                </>
                            ) : (
                                /* Action Form (Open, Close, In, Out) */
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        {isOpenRegister && (
                                            <button onClick={() => setMode('view')} className="text-sm text-foreground-subtle hover:text-foreground flex items-center">
                                                <ArrowLeft className="w-4 h-4 mr-1" /> Back
                                            </button>
                                        )}
                                        <h3 className="font-semibold text-foreground">
                                            {mode === 'open' ? 'Open Register' :
                                                mode === 'close' ? 'Close Register' :
                                                    mode === 'in' ? 'Cash In' : 'Cash Out'}
                                        </h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-foreground-subtle mb-1">
                                                {mode === 'close' ? 'Total Cash Counted' : 'Amount'}
                                            </label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
                                                <input
                                                    type="number"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    className="w-full pl-9 pr-4 py-3 bg-background-primary border border-card-border rounded-xl focus:border-accent outline-none text-lg"
                                                    placeholder="0.00"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>

                                        {(mode === 'close' || mode === 'in' || mode === 'out') && (
                                            <div>
                                                <label className="block text-sm text-foreground-subtle mb-1">Note (Optional)</label>
                                                <textarea
                                                    value={note}
                                                    onChange={(e) => setNote(e.target.value)}
                                                    className="w-full p-3 bg-background-primary border border-card-border rounded-xl focus:border-accent outline-none resize-none h-24"
                                                    placeholder="Reason or details..."
                                                />
                                            </div>
                                        )}

                                        {mode === 'close' && totals && (
                                            <div className="bg-background-tertiary p-3 rounded-lg text-sm flex justify-between">
                                                <span>Expected Amount:</span>
                                                <span className="font-mono font-bold">{formatCurrency(totals.expected)}</span>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleSubmit}
                                            disabled={openMutation.isPending || closeMutation.isPending || cashMovementMutation.isPending}
                                            className="btn-primary w-full py-3"
                                        >
                                            {openMutation.isPending || closeMutation.isPending || cashMovementMutation.isPending ? 'Processing...' : 'Confirm'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

interface StatBoxProps {
    label: string;
    value: number;
    className?: string;
    valueClass?: string;
}

function StatBox({ label, value, className, valueClass }: StatBoxProps) {
    return (
        <div className={cn("bg-background-primary p-3 rounded-xl border border-card-border", className)}>
            <div className="text-xs text-foreground-subtle mb-1">{label}</div>
            <div className={cn("font-bold font-mono", valueClass)}>{formatCurrency(value)}</div>
        </div>
    );
}
