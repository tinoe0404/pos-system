'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { LayoutGrid, ClipboardList, Settings, LogOut, Store, Briefcase, FileSpreadsheet, Loader2, Wallet, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { downloadStockSheetPDF } from '@/hooks/useStockSheet';
import { toast } from 'sonner';

interface SidebarProps {
    onOpenRegister?: () => void;
}

export default function Sidebar({ onOpenRegister }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const logout = useAuthStore((state) => state.logout);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleDownloadStockSheet = async () => {
        setIsDownloading(true);
        try {
            await downloadStockSheetPDF();
            toast.success('Stock sheet downloaded');
        } catch {
            toast.error('Failed to download stock sheet');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const navItems = [
        { icon: LayoutGrid, label: 'POS', href: '/pos' },
        { icon: ClipboardList, label: 'Orders', href: '/orders' },
        { icon: Wallet, label: 'Tabs', href: '/tabs' },
        { icon: Settings, label: 'Settings', href: '/settings' },
    ];

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-3 left-4 z-50 p-2 bg-card border border-card-border rounded-lg text-foreground-muted hover:text-foreground transition-colors shadow-sm"
                aria-label="Toggle menu"
            >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`
                fixed md:sticky top-0 left-0 h-screen
                w-[72px] bg-card border-r border-card-border 
                flex flex-col items-center py-5 shrink-0
                transform transition-transform duration-300 ease-in-out
                z-50 md:z-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}
            >
                {/* Brand Logo */}
                <div className="mb-6 w-11 h-11 bg-primary-muted text-primary rounded-xl flex items-center justify-center border border-card-border">
                    <Store className="w-5 h-5" />
                </div>

                {/* Navigation */}
                <nav className="flex-1 flex flex-col gap-1.5 w-full px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <button
                                key={item.href}
                                onClick={() => {
                                    router.push(item.href);
                                    setIsOpen(false);
                                }}
                                title={item.label}
                                className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-primary text-foreground shadow-lg shadow-primary/20'
                                    : 'text-foreground-muted hover:bg-background-tertiary hover:text-foreground'
                                    }`}
                            >
                                {/* Active indicator */}
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-1 h-5 bg-primary rounded-full" />
                                )}
                                <item.icon className="w-5 h-5" />
                                <span className="text-[10px] mt-1 font-medium leading-none">{item.label}</span>

                                {/* Tooltip */}
                                <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-background-tertiary text-foreground text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap border border-card-border z-50">
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}

                    {/* Register Button */}
                    <button
                        onClick={() => {
                            if (onOpenRegister) onOpenRegister();
                            setIsOpen(false);
                        }}
                        title="Register"
                        className="relative flex flex-col items-center justify-center p-2.5 rounded-xl transition-all duration-200 group text-foreground-muted hover:bg-background-tertiary hover:text-foreground"
                    >
                        <Briefcase className="w-5 h-5" />
                        <span className="text-[10px] mt-1 font-medium leading-none">Register</span>
                        <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-background-tertiary text-foreground text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap border border-card-border z-50">
                            Shift/Cash
                        </span>
                    </button>

                    {/* Stock Sheet Download Button */}
                    <button
                        onClick={handleDownloadStockSheet}
                        disabled={isDownloading}
                        title="Stock Sheet"
                        className="relative flex flex-col items-center justify-center p-2.5 rounded-xl transition-all duration-200 group text-foreground-muted hover:bg-background-tertiary hover:text-foreground disabled:opacity-50"
                    >
                        {isDownloading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <FileSpreadsheet className="w-5 h-5" />
                        )}
                        <span className="text-[10px] mt-1 font-medium leading-none">
                            {isDownloading ? '...' : 'Stock'}
                        </span>
                        <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-background-tertiary text-foreground text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap border border-card-border z-50">
                            Download Stock Sheet
                        </span>
                    </button>
                </nav>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="mt-auto p-2.5 text-foreground-muted hover:bg-destructive-muted hover:text-destructive rounded-xl transition-all duration-200 group relative"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-background-tertiary text-foreground text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap border border-card-border z-50">
                        Logout
                    </span>
                </button>
            </aside>
        </>
    );
}
