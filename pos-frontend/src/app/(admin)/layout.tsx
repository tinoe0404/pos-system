'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2, LogOut } from 'lucide-react';
import AdminSidebar from '@/components/admin/Sidebar';

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

    const handleLogout = async () => {
        await logout();
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
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">
                                {user?.name ? `Welcome, ${user.name}` : 'Admin Dashboard'}
                            </h1>
                            <p className="text-sm text-slate-500">Manage your business in one place</p>
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
                <main className="flex-1 overflow-auto">{children}</main>
            </div>
        </div>
    );
}
