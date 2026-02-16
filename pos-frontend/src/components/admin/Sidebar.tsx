'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Users, FileText, Menu, X, Store } from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', href: '/admin/inventory', icon: Package },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Reports', href: '/admin/reports', icon: FileText },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-card-border rounded-lg text-foreground-muted hover:text-foreground transition-colors"
                aria-label="Toggle menu"
            >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:sticky top-0 left-0 h-screen
                    w-60 bg-card border-r border-card-border
                    transform transition-transform duration-300 ease-in-out
                    z-40 lg:z-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Brand */}
                    <div className="p-5 border-b border-card-border">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary-muted text-primary p-2 rounded-xl border border-card-border">
                                <Store className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-foreground text-sm">RetailPOS</h2>
                                <p className="text-[11px] text-foreground-subtle">Admin Panel</p>
                            </div>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                                        isActive
                                            ? 'bg-primary text-foreground font-medium'
                                            : 'text-foreground-muted hover:bg-background-tertiary hover:text-foreground'
                                    }`}
                                >
                                    <Icon className="w-[18px] h-[18px]" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-3 border-t border-card-border">
                        <Link
                            href="/pos"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground-muted hover:bg-background-tertiary hover:text-foreground transition-colors"
                        >
                            <LayoutDashboard className="w-[18px] h-[18px]" />
                            <span>Go to POS</span>
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
}
