'use client';

import Sidebar from '@/components/pos/Sidebar';
import CartPanel from '@/components/pos/CartPanel';
import RegisterPanel from '@/components/pos/RegisterPanel';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useCartStore } from '@/store/useCartStore';
import { Loader2, ShoppingCart, Store, DollarSign, LayoutGrid, ClipboardList, Wallet, Settings, Sun, Moon } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function POSLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { token, _hasHydrated } = useAuthStore();
    const [isClient, setIsClient] = useState(false);
    const [mobileCartOpen, setMobileCartOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const items = useCartStore((state) => state.items);
    const getTotal = useCartStore((state) => state.getTotal);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = getTotal();

    useEffect(() => {
        setIsClient(true);
        if (_hasHydrated && !token) {
            router.replace('/login');
        }
    }, [token, router, _hasHydrated]);

    if (!isClient || !_hasHydrated || !token) {
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
        <div className="flex min-h-screen bg-background overflow-hidden">
            {/* Sidebar - responsive behavior handled internally */}
            <Sidebar onOpenRegister={() => setIsRegisterOpen(true)} />

            {/* Main Content - add bottom padding on mobile to account for bottom nav */}
            <main className="flex-1 h-screen overflow-y-auto w-full pb-24 md:pb-0">
                {children}
            </main>

            {/* Desktop Cart Panel */}
            <div className="hidden lg:block">
                <CartPanel />
            </div>

            {/* Mobile Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 md:hidden z-40">
                <div className="glass border-t border-card-border px-3 py-2 flex items-center gap-2">
                    <MobileNav onOpenRegister={() => setIsRegisterOpen(true)} />
                    <button
                        onClick={() => setMobileCartOpen(true)}
                        className={`relative bg-primary text-foreground rounded-xl font-semibold text-sm flex items-center gap-2 active:scale-[0.95] transition-all shadow-lg shadow-primary/25 shrink-0 ${itemCount > 0 ? 'px-4 py-2.5' : 'px-3 py-2.5'
                            }`}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        {itemCount > 0 ? (
                            <span className="text-xs">${cartTotal.toFixed(2)}</span>
                        ) : (
                            <span className="text-xs">Cart</span>
                        )}
                        {itemCount > 0 && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-foreground text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
                                {itemCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Cart Drawer */}
            {mobileCartOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        onClick={() => setMobileCartOpen(false)}
                    />
                    <div className="absolute right-0 top-0 bottom-0 w-full max-w-md animate-slide-in-right" style={{ height: '100dvh' }}>
                        <CartPanel
                            onCheckoutComplete={() => setMobileCartOpen(false)}
                            onClose={() => setMobileCartOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* Register Panel */}
            <RegisterPanel isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
        </div>
    );
}

function MobileNav({ onOpenRegister }: { onOpenRegister: () => void }) {
    const router = useRouter();
    const pathname = usePathname();
    const { resolvedTheme, toggleTheme } = useThemeStore();

    const navItems = [
        { icon: LayoutGrid, label: 'POS', href: '/pos' },
        { icon: ClipboardList, label: 'Orders', href: '/orders' },
        { icon: Wallet, label: 'Tabs', href: '/tabs' },
        { icon: Settings, label: 'Settings', href: '/settings' },
        { icon: DollarSign, label: 'Register', action: onOpenRegister },
    ];

    return (
        <div className="flex-1 flex items-center justify-around">
            {navItems.map((item) => {
                const isActive = item.href ? pathname === item.href : false;
                return (
                    <button
                        key={item.label}
                        onClick={() => item.action ? item.action() : router.push(item.href!)}
                        className={`flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${isActive
                            ? 'text-primary'
                            : 'text-foreground-muted'
                            }`}
                    >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                    </button>
                );
            })}
            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg text-[10px] font-medium transition-colors text-foreground-muted"
            >
                {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{resolvedTheme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
        </div>
    );
}
