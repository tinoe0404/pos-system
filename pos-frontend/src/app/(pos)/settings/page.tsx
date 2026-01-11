'use client';

import { Printer, Monitor, User, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ReceiptModal from '@/components/pos/ReceiptModal';
import { CartItem } from '@/store/useCartStore';

export default function SettingsPage() {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [showTestReceipt, setShowTestReceipt] = useState(false);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    // Dummy data for test print
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

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <header className="px-6 py-4 bg-white border-b border-slate-200">
                <h1 className="text-xl font-bold text-slate-800">Settings</h1>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-auto p-6">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Printer Settings Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <Printer className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                <CheckCircle2 className="w-3 h-3" />
                                Ready
                            </div>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">Printer Setup</h2>
                        <p className="text-sm text-slate-500 mb-6">
                            Configure printer connection and test receipt printing.
                        </p>
                        <button
                            onClick={() => setShowTestReceipt(true)}
                            className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                        >
                            Test Print Receipt
                        </button>
                    </div>

                    {/* Station Info Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Monitor className="w-6 h-6" />
                            </div>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">Station Information</h2>
                        <div className="space-y-3 mb-2">
                            <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                                <span className="text-slate-500">Station ID</span>
                                <span className="font-mono font-medium text-slate-900">POS-01</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                                <span className="text-slate-500">Location</span>
                                <span className="font-medium text-slate-900">Main Hall</span>
                            </div>
                            <div className="flex justify-between text-sm py-2">
                                <span className="text-slate-500">Version</span>
                                <span className="font-mono font-medium text-slate-900">v1.2.0</span>
                            </div>
                        </div>
                    </div>

                    {/* Account Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 md:col-span-2">
                        <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-slate-100 text-slate-600 rounded-full">
                                    <User className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">{user?.name || 'Cashier'}</h2>
                                    <p className="text-sm text-slate-500">{user?.role || 'Staff Member'}</p>
                                    <p className="text-xs text-slate-400 mt-1 font-mono">{user?.email}</p>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="w-full md:w-auto px-8 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 hover:text-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Test Receipt Modal */}
            <ReceiptModal
                isOpen={showTestReceipt}
                onClose={() => setShowTestReceipt(false)}
                order={testOrder}
                autoPrint={true}
            />
        </div>
    );
}
