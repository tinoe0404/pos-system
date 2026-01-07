'use client';

import Sidebar from '@/components/pos/Sidebar';
import CartPanel from '@/components/pos/CartPanel';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function POSLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const token = useAuthStore((state) => state.token);
    const [isClient, setIsClient] = useState(false);

    // Prevent hydration mismatch and simple auth check
    useEffect(() => {
        setIsClient(true);
        if (!token) {
            router.replace('/login');
        }
    }, [token, router]);

    if (!isClient || !token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-slate-50 overflow-hidden">
            {/* 1. Left Sidebar */}
            <Sidebar />

            {/* 2. Main Content (Product Grid) */}
            <main className="flex-1 h-screen overflow-y-auto w-full">
                {children}
            </main>

            {/* 3. Right Cart Panel */}
            <CartPanel />
        </div>
    );
}
