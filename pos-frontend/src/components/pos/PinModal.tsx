'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Delete, Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: (pin: string) => Promise<boolean>;
    title?: string;
    description?: string;
}

export default function PinModal({ isOpen, onClose, onVerify, title = 'Admin PIN Required', description = 'Enter 4-digit PIN to authorize this action' }: PinModalProps) {
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setPin('');
            setIsLoading(false);
            setIsError(false);
        }
    }, [isOpen]);

    const handleNumberClick = (num: string) => {
        if (pin.length < 4) {
            setPin(prev => prev + num);
            setIsError(false);
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
        setIsError(false);
    };

    const handleSubmit = useCallback(async () => {
        if (pin.length !== 4) return;

        setIsLoading(true);
        try {
            const isValid = await onVerify(pin);
            if (isValid) {
                // Success handled by parent
                onClose();
            } else {
                setIsError(true);
                setPin('');
                toast.error('Invalid PIN');
            }
        } catch (error) {
            console.error('PIN verification error:', error);
            setIsError(true);
            toast.error('Verification failed');
        } finally {
            setIsLoading(false);
        }
    }, [pin, onVerify, onClose]);

    // Auto-submit when 4 digits entered
    useEffect(() => {
        if (pin.length === 4) {
            handleSubmit();
        }
    }, [pin, handleSubmit]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-card w-full max-w-sm rounded-2xl shadow-xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 bg-background-secondary border-b border-card-border flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <Lock className="w-5 h-5 text-accent" />
                                {title}
                            </h3>
                            <p className="text-sm text-foreground-subtle mt-1">{description}</p>
                        </div>
                        <button onClick={onClose} className="text-foreground-subtle hover:text-foreground">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* PIN Display */}
                    <div className="p-8 flex justify-center py-10 bg-background-primary relative">
                        {/* Hidden Input for mobile keyboard support (optional, but numpad is better for kiosk) */}
                        <div className="flex gap-4">
                            {[0, 1, 2, 3].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={isError ? { x: [-5, 5, -5, 5, 0] } : {}}
                                    transition={{ duration: 0.4 }}
                                    className={cn(
                                        "w-4 h-4 rounded-full border-2 transition-all duration-200",
                                        i < pin.length
                                            ? "bg-accent border-accent"
                                            : "border-card-border bg-transparent",
                                        isError && "border-danger bg-danger/20"
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Numpad */}
                    <div className="p-6 bg-background-secondary grid grid-cols-3 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleNumberClick(num.toString())}
                                disabled={isLoading}
                                className="h-16 rounded-xl bg-background-primary hover:bg-background-tertiary text-2xl font-bold text-foreground transition-all active:scale-95 disabled:opacity-50 shadow-sm border border-card-border"
                            >
                                {num}
                            </button>
                        ))}
                        <div className="flex items-center justify-center">
                            {/* Empty or special key */}
                        </div>
                        <button
                            onClick={() => handleNumberClick('0')}
                            disabled={isLoading}
                            className="h-16 rounded-xl bg-background-primary hover:bg-background-tertiary text-2xl font-bold text-foreground transition-all active:scale-95 disabled:opacity-50 shadow-sm border border-card-border"
                        >
                            0
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isLoading || pin.length === 0}
                            className="h-16 rounded-xl bg-background-primary hover:bg-danger/10 hover:text-danger text-foreground transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center shadow-sm border border-card-border"
                        >
                            <Delete className="w-6 h-6" />
                        </button>
                    </div>

                    {isLoading && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[1px]">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
