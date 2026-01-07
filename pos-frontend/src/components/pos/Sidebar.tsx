'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { LayoutGrid, ClipboardList, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const navItems = [
        { icon: LayoutGrid, label: 'POS', href: '/pos' },
        { icon: ClipboardList, label: 'Orders', href: '/pos/orders' },
        { icon: Settings, label: 'Settings', href: '/pos/settings' },
    ];

    return (
        <aside className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 h-screen sticky top-0">
            <div className="mb-8 p-3 bg-blue-50 text-blue-600 rounded-xl">
                <span className="font-bold text-lg">BP</span>
            </div>

            <nav className="flex-1 flex flex-col gap-4 w-full px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <button
                            key={item.href}
                            onClick={() => router.push(item.href)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${isActive
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                }`}
                        >
                            <item.icon className="w-6 h-6" />
                            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <button
                onClick={handleLogout}
                className="mt-auto p-3 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                title="Logout"
            >
                <LogOut className="w-6 h-6" />
            </button>
        </aside>
    );
}
