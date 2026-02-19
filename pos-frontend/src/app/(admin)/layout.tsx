'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { Loader2, LogOut, Store, Sun, Moon } from 'lucide-react';
import AdminSidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { token, user, logout, _hasHydrated } = useAuthStore();
    const { resolvedTheme, toggleTheme } = useThemeStore();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (_hasHydrated) {
            if (!token) {
                router.replace('/login');
            } else if (user?.role !== 'admin') {
                router.replace('/pos');
            }
        }
    }, [token, user, router, _hasHydrated]);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    if (!isClient || !_hasHydrated || !token || user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
                <div className="w-12 h-12 bg-primary-muted text-primary rounded-2xl flex items-center justify-center">
                    <Store className="w-6 h-6" />
                </div>
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-background">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="glass border-b border-card-border px-6 py-3.5 sticky top-0 z-30">
                    <div className="flex items-center justify-between">
                        <div className="pl-10 lg:pl-0">
                            <h1 className="text-sm font-semibold text-foreground">
                                {user?.name ? `Welcome, ${user.name}` : 'Admin'}
                            </h1>
                            <p className="text-[11px] text-foreground-subtle">Manage your business</p>
                        </div>
                        <div className="flex items-center gap-1">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 text-foreground-muted hover:text-warning hover:bg-warning-muted rounded-lg transition-all"
                                title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>
                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3 py-2 text-foreground-muted hover:text-foreground hover:bg-background-tertiary rounded-lg transition-colors text-sm"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-auto">{children}</main>
            </div>
        </div>
    );
}
