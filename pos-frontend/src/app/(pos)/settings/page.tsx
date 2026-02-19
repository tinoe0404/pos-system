'use client';

import { Printer, Monitor, User, LogOut, CheckCircle2, Keyboard, Palette, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ReceiptModal from '@/components/pos/ReceiptModal';
import { CartItem } from '@/store/useCartStore';

export default function SettingsPage() {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const { theme, setTheme, resolvedTheme } = useThemeStore();
    const [showTestReceipt, setShowTestReceipt] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const testOrder = {
        id: 'TEST-PRINT-001',
        items: [
            { id: '1', name: 'Test Product A', price: 10.00, quantity: 1 },
            { id: '2', name: 'Test Product B', price: 5.50, quantity: 2 },
        ] as CartItem[],
        total: 21.00,
        date: new Date().toISOString(),
        paymentMethod: 'CASH' as const,
        tax: 2.10,
    };

    const shortcuts = [
        { key: '/', desc: 'Focus search' },
        { key: 'F2', desc: 'Open payment' },
        { key: 'F4', desc: 'Hold order' },
        { key: 'Esc', desc: 'Close modal / clear search' },
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <header className="px-6 py-4 border-b border-card-border shrink-0">
                <h1 className="text-lg font-semibold text-foreground">Settings</h1>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-auto p-4 lg:p-6">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Appearance Card — spans full width */}
                    <div className="bg-card p-5 rounded-xl border border-card-border md:col-span-2">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-2.5 bg-primary-muted text-primary rounded-xl">
                                <Palette className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground-muted bg-background-tertiary px-2.5 py-1 rounded-full">
                                {resolvedTheme === 'dark' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                                {resolvedTheme === 'dark' ? 'Dark' : 'Light'} Mode
                            </div>
                        </div>
                        <h2 className="text-base font-semibold text-foreground mb-1">Appearance</h2>
                        <p className="text-sm text-foreground-muted mb-5">
                            Choose how RetailPOS looks. Select a theme or sync with your system.
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            {([
                                { value: 'light' as const, icon: Sun, label: 'Light', desc: 'Clean & bright' },
                                { value: 'dark' as const, icon: Moon, label: 'Dark', desc: 'Easy on the eyes' },
                                { value: 'system' as const, icon: Monitor, label: 'System', desc: 'Match your OS' },
                            ]).map(({ value, icon: Icon, label, desc }) => (
                                <button
                                    key={value}
                                    onClick={() => setTheme(value)}
                                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${theme === value
                                        ? 'border-primary bg-primary-muted shadow-md shadow-primary/10'
                                        : 'border-card-border bg-background-secondary hover:border-border-hover hover:bg-background-tertiary'
                                        }`}
                                >
                                    <div className={`p-2.5 rounded-xl transition-colors duration-200 ${theme === value
                                        ? 'bg-primary text-white'
                                        : 'bg-background-tertiary text-foreground-muted'
                                        }`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-semibold text-foreground">{label}</span>
                                    <span className="text-[11px] text-foreground-muted leading-tight">{desc}</span>
                                    {theme === value && (
                                        <div className="absolute top-2 right-2">
                                            <CheckCircle2 className="w-4 h-4 text-primary" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Printer Card */}
                    <div className="bg-card p-5 rounded-xl border border-card-border">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-2.5 bg-primary-muted text-primary rounded-xl">
                                <Printer className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-success bg-success-muted px-2 py-1 rounded-full">
                                <CheckCircle2 className="w-3 h-3" />
                                Ready
                            </div>
                        </div>
                        <h2 className="text-base font-semibold text-foreground mb-1">Printer Setup</h2>
                        <p className="text-sm text-foreground-muted mb-5">
                            Configure printer connection and test receipt printing.
                        </p>
                        <button
                            onClick={() => setShowTestReceipt(true)}
                            className="w-full h-10 bg-background-tertiary border border-card-border text-foreground text-sm font-medium rounded-lg hover:bg-card-hover hover:border-border-hover transition-all"
                        >
                            Test Print Receipt
                        </button>
                    </div>

                    {/* Station Info Card */}
                    <div className="bg-card p-5 rounded-xl border border-card-border">
                        <div className="p-2.5 bg-primary-muted text-primary rounded-xl w-fit mb-4">
                            <Monitor className="w-5 h-5" />
                        </div>
                        <h2 className="text-base font-semibold text-foreground mb-3">Station Information</h2>
                        <div className="space-y-2.5">
                            {[
                                { label: 'Station ID', value: 'POS-01' },
                                { label: 'Location', value: 'Main Hall' },
                                { label: 'Version', value: 'v2.0.0' },
                            ].map((item) => (
                                <div key={item.label} className="flex justify-between text-sm py-1.5 border-b border-card-border last:border-0">
                                    <span className="text-foreground-muted">{item.label}</span>
                                    <span className="font-mono font-medium text-foreground">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Keyboard Shortcuts */}
                    <div className="bg-card p-5 rounded-xl border border-card-border">
                        <div className="p-2.5 bg-primary-muted text-primary rounded-xl w-fit mb-4">
                            <Keyboard className="w-5 h-5" />
                        </div>
                        <h2 className="text-base font-semibold text-foreground mb-3">Keyboard Shortcuts</h2>
                        <div className="space-y-2">
                            {shortcuts.map((s) => (
                                <div key={s.key} className="flex items-center justify-between py-1.5">
                                    <span className="text-sm text-foreground-muted">{s.desc}</span>
                                    <kbd className="text-[11px] font-mono bg-background-tertiary text-foreground px-2 py-1 rounded border border-card-border">{s.key}</kbd>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Account Card */}
                    <div className="bg-card p-5 rounded-xl border border-card-border">
                        <div className="flex items-center gap-4 mb-5">
                            <div className="p-3 bg-background-tertiary text-foreground-muted rounded-full">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-foreground">{user?.name || 'Cashier'}</h2>
                                <p className="text-sm text-foreground-muted capitalize">{user?.role || 'Staff'}</p>
                                {user?.email && (
                                    <p className="text-xs text-foreground-subtle font-mono mt-0.5">{user.email}</p>
                                )}
                            </div>
                        </div>
                        {showLogoutConfirm ? (
                            <div className="space-y-2">
                                <p className="text-sm text-foreground-muted text-center">Are you sure you want to log out?</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowLogoutConfirm(false)}
                                        className="flex-1 h-10 bg-background-tertiary border border-card-border text-foreground text-sm font-medium rounded-lg hover:bg-card-hover transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="flex-1 h-10 bg-destructive-muted text-destructive text-sm font-medium rounded-lg hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                className="w-full h-10 bg-destructive-muted text-destructive text-sm font-medium rounded-lg hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </main>

            <ReceiptModal
                isOpen={showTestReceipt}
                onClose={() => setShowTestReceipt(false)}
                order={testOrder}
                autoPrint={true}
            />
        </div>
    );
}
