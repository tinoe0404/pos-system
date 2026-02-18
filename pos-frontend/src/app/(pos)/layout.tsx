'use client';

import Sidebar from '@/components/pos/Sidebar';
import CartPanel from '@/components/pos/CartPanel';
import RegisterPanel from '@/components/pos/RegisterPanel';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { Loader2, ShoppingCart, X, Store, DollarSign } from 'lucide-react';

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
            {/* Sidebar - hidden on mobile, visible on md+ */}
            <div className="hidden md:block">
                <Sidebar onOpenRegister={() => setIsRegisterOpen(true)} />
            </div>

            {/* Main Content */}
            <main className="flex-1 h-screen overflow-y-auto w-full">
                {children}
            </main>

            {/* Desktop Cart Panel */}
            <div className="hidden lg:block">
                <CartPanel />
            </div>

            {/* Mobile Bottom Bar - Enhanced FAB */}
            <div className="fixed bottom-0 left-0 right-0 md:hidden z-40">
                <div className="glass border-t border-card-border px-4 py-3 flex items-center justify-between">
                    <MobileNav onOpenRegister={() => setIsRegisterOpen(true)} />
                    <button
                        onClick={() => setMobileCartOpen(true)}
                        className={`relative bg-primary text-foreground rounded-xl font-semibold text-sm flex items-center gap-2 active:scale-[0.95] transition-all shadow-lg shadow-primary/25 ${itemCount > 0 ? 'px-5 py-3' : 'px-4 py-2.5'
                            }`}
                    >
                        <ShoppingCart className="w-5 h-5" />
                        {itemCount > 0 ? (
                            <span>Cart · ${cartTotal.toFixed(2)}</span>
                        ) : (
                            <span>Cart</span>
                        )}
                        {itemCount > 0 && (
                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-foreground text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
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
    const pathname =
        typeof window !== 'undefined' ? window.location.pathname : '';

    const navItems = [
        { icon: Store, label: 'POS', href: '/pos' },
        { icon: ShoppingCart, label: 'Orders', href: '/orders' },
        { icon: DollarSign, label: 'Register', action: onOpenRegister },
    ];

    return (
        <div className="flex items-center gap-2">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <button
                        key={item.label}
                        onClick={() => item.action ? item.action() : router.push(item.href!)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                            ? 'text-foreground bg-background-tertiary'
                            : 'text-foreground-muted'
                            }`}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                    </button>
                );
            })}
        </div>
    );
}
