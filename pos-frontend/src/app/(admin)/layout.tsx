'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { token, user, logout } = useAuthStore();
    const [isClient, setIsClient] = useState(false);

    // Route protection
    useEffect(() => {
        setIsClient(true);
        if (!token) {
            router.replace('/login');
        } else if (user?.role !== 'admin') {
            // Redirect non-admin users
            router.replace('/pos');
        }
    }, [token, user, router]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (!isClient || !token || user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Simple header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 text-white font-bold px-3 py-2 rounded-lg">
                            BP
                        </div>
                        <h1 className="text-xl font-bold text-slate-800">Admin Portal</h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </header>

            {/* Main content */}
            <main>{children}</main>
        </div>
    );
}
