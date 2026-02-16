'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            <div className="bg-card p-8 rounded-2xl border border-card-border max-w-md w-full text-center space-y-6 animate-scale-in">
                <div className="w-16 h-16 bg-destructive-muted text-destructive rounded-2xl flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-foreground text-balance">Something went wrong</h2>
                    <p className="text-foreground-muted text-sm leading-relaxed">
                        We encountered an unexpected error. Please try again.
                    </p>
                </div>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-5 py-2.5 bg-background-tertiary border border-card-border text-foreground font-semibold rounded-xl hover:bg-card-hover transition-colors text-sm"
                    >
                        Reload Page
                    </button>
                    <button
                        onClick={reset}
                        className="px-5 py-2.5 bg-primary text-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-2 shadow-lg shadow-primary/20 text-sm"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Try Again
                    </button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-4 p-3 bg-background-secondary rounded-lg text-left overflow-auto max-h-48 text-xs font-mono text-foreground-muted border border-card-border">
                        {error.message}
                    </div>
                )}
            </div>
        </div>
    );
}
