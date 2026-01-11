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
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full text-center space-y-6">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">Something went wrong!</h2>
                    <p className="text-slate-500">
                        We encountered an unexpected error. Our team has been notified.
                    </p>
                </div>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        Reload Page
                    </button>
                    <button
                        onClick={reset}
                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Try Again
                    </button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-6 p-4 bg-slate-50 rounded-lg text-left overflow-auto max-h-48 text-xs font-mono text-slate-600">
                        {error.message}
                    </div>
                )}
            </div>
        </div>
    );
}
