import { useState } from 'react';
import { X, Search, Plus, User, FileText, ArrowUpRight, ArrowDownLeft, Wallet, Loader2, RefreshCw } from 'lucide-react';
import { useTabs, useTab, useCreateTab, useDepositToTab, useCloseTab } from '@/hooks/useTabs';
import { format } from 'date-fns';

interface TabsPanelProps {
    onClose: () => void;
    onSelectTab?: (tab: any) => void;
    isSelectionMode?: boolean;
}

type View = 'LIST' | 'NEW' | 'DETAILS';

export default function TabsPanel({ onClose, onSelectTab, isSelectionMode = false }: TabsPanelProps) {
    const [view, setView] = useState<View>('LIST');
    const [selectedTabId, setSelectedTabId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: tabs, isLoading: isLoadingTabs } = useTabs({
        q: searchQuery,
        status: 'ACTIVE'
    });

    const handleTabClick = (tab: any) => {
        if (isSelectionMode && onSelectTab) {
            onSelectTab(tab);
            onClose();
        } else {
            setSelectedTabId(tab.id);
            setView('DETAILS');
        }
    };

    return (
        <div className="w-full h-full bg-card flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-card-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    {view !== 'LIST' && (
                        <button
                            onClick={() => {
                                setView('LIST');
                                setSelectedTabId(null);
                            }}
                            className="p-1 hover:bg-background-tertiary rounded-lg transition-colors text-foreground-muted"
                        >
                            <ArrowUpRight className="w-5 h-5 rotate-180" />
                        </button>
                    )}
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Wallet className="w-5 h-5" />
                        {view === 'NEW' ? 'New Tab' : view === 'DETAILS' ? 'Tab Details' : isSelectionMode ? 'Select Tab' : 'Customer Tabs'}
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-foreground-muted hover:text-foreground hover:bg-background-tertiary rounded-lg transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {view === 'LIST' && (
                    <div className="p-4 space-y-4">
                        {/* Search & Action */}
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                                <input
                                    type="text"
                                    placeholder="Search tabs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-10 pl-9 pr-4 bg-background-secondary border border-input-border rounded-xl text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>
                            {!isSelectionMode && (
                                <button
                                    onClick={() => setView('NEW')}
                                    className="h-10 px-4 bg-primary text-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-2 text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    New
                                </button>
                            )}
                        </div>

                        {/* List */}
                        {isLoadingTabs ? (
                            <div className="flex items-center justify-center py-12 text-foreground-muted">
                                <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                        ) : tabs?.tabs?.length === 0 ? (
                            <div className="text-center py-12 text-foreground-muted">
                                <Wallet className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No active tabs found</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {tabs?.tabs?.map((tab: any) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabClick(tab)}
                                        className="w-full text-left p-4 bg-background-secondary border border-card-border rounded-xl hover:bg-card-hover transition-colors group"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {tab.customer_name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                        {tab.customer_name}
                                                    </p>
                                                    {tab.phone && <p className="text-xs text-foreground-muted">{tab.phone}</p>}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-foreground text-lg">
                                                    ${tab.balance.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-foreground-muted border-t border-card-border pt-2 mt-2">
                                            <span>Opened {format(new Date(tab.created_at), 'MMM d, h:mm a')}</span>
                                            <span className="flex items-center gap-1">
                                                By {tab.created_by.username} &bull; {tab.sales_count || 0} purchases
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {view === 'NEW' && (
                    <NewTabForm
                        onCancel={() => setView('LIST')}
                        onSuccess={() => setView('LIST')}
                    />
                )}

                {view === 'DETAILS' && selectedTabId && (
                    <TabDetails
                        tabId={selectedTabId}
                    />
                )}
            </div>
        </div>
    );
}

function NewTabForm({ onCancel, onSuccess }: { onCancel: () => void; onSuccess: () => void }) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [amount, setAmount] = useState('');
    const createTab = useCreateTab();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !amount) return;

        createTab.mutate(
            { customer_name: name, phone, deposit_amount: parseFloat(amount) },
            { onSuccess }
        );
    };

    return (
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-foreground-muted mb-1.5">Customer Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full h-11 pl-9 pr-4 bg-background-secondary border border-input-border rounded-xl text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground-muted mb-1.5">Phone Number (Optional)</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 234 567 8900"
                            className="w-full h-11 pl-9 pr-4 bg-background-secondary border border-input-border rounded-xl text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground-muted mb-1.5">Initial Deposit</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted font-bold">$</span>
                        <input
                            type="number"
                            required
                            min="0.01"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full h-11 pl-9 pr-4 bg-background-secondary border border-input-border rounded-xl text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 h-11 bg-background-tertiary text-foreground font-semibold rounded-xl hover:bg-card-hover transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={createTab.isPending}
                    className="flex-1 h-11 bg-primary text-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {createTab.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Tab'}
                </button>
            </div>
        </form>
    );
}

function TabDetails({ tabId }: { tabId: string }) {
    const { data: tab, isLoading } = useTab(tabId);
    const deposit = useDepositToTab();
    const close = useCloseTab();

    const [showDeposit, setShowDeposit] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [note, setNote] = useState('');

    if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-foreground-muted" /></div>;
    if (!tab) return <div className="text-center py-12 text-foreground-muted">Tab not found</div>;

    const handleDeposit = (e: React.FormEvent) => {
        e.preventDefault();
        deposit.mutate(
            { id: tabId, amount: parseFloat(depositAmount), note },
            {
                onSuccess: () => {
                    setShowDeposit(false);
                    setDepositAmount('');
                    setNote('');
                }
            }
        );
    };

    const handleClose = () => {
        if (confirm(`Are you sure you want to close this tab and return $${tab.balance.toFixed(2)} to the customer?`)) {
            close.mutate({ id: tabId });
        }
    };

    if (showDeposit) {
        return (
            <div className="p-5 space-y-4 animate-slide-in-right">
                <h3 className="font-semibold text-lg">Add Deposit</h3>
                <form onSubmit={handleDeposit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1.5">Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted font-bold">$</span>
                            <input
                                type="number"
                                required
                                min="0.01"
                                step="0.01"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                className="w-full h-11 pl-8 pr-4 bg-background-secondary border border-input-border rounded-xl text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1.5">Note</label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Checking deposit, etc."
                            className="w-full h-11 px-4 bg-background-secondary border border-input-border rounded-xl text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setShowDeposit(false)}
                            className="flex-1 h-11 bg-background-tertiary text-foreground font-semibold rounded-xl hover:bg-card-hover transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={deposit.isPending}
                            className="flex-1 h-11 bg-success text-success-foreground font-semibold rounded-xl hover:bg-success-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {deposit.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Deposit'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-5 border border-primary/20">
                <p className="text-primary font-medium mb-1">Current Balance</p>
                <div className="flex items-baseline justify-between">
                    <h3 className="text-4xl font-bold text-foreground">${tab.balance.toFixed(2)}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${tab.status === 'ACTIVE' ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {tab.status}
                    </span>
                </div>
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-foreground-muted">{tab.customer_name}</p>
                    <p className="text-sm text-foreground-muted">{tab.phone}</p>
                </div>

                {tab.status !== 'CLOSED' && (
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <button
                            onClick={() => setShowDeposit(true)}
                            className="h-10 bg-primary text-foreground font-semibold rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Top Up
                        </button>
                        <button
                            onClick={handleClose}
                            className="h-10 bg-background-tertiary text-foreground font-semibold rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <X className="w-4 h-4" />
                            Close Tab
                        </button>
                    </div>
                )}
            </div>

            {/* History */}
            <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Transaction History
                </h4>
                <div className="space-y-2">
                    {tab.transactions.map((t: any) => (
                        <div key={t.id} className="p-3 bg-background-secondary rounded-xl border border-card-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === 'DEPOSIT' ? 'bg-success/10 text-success' :
                                        t.type === 'PURCHASE' ? 'bg-destructive/10 text-destructive' :
                                            t.type === 'REFUND' ? 'bg-warning/10 text-warning' :
                                                'bg-foreground/10 text-foreground'
                                    }`}>
                                    {t.type === 'DEPOSIT' && <ArrowDownLeft className="w-4 h-4" />}
                                    {t.type === 'PURCHASE' && <ArrowUpRight className="w-4 h-4" />}
                                    {t.type === 'REFUND' && <RefreshCw className="w-4 h-4" />}
                                    {t.type === 'CASHOUT' && <ArrowUpRight className="w-4 h-4" />}
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-foreground">
                                        {t.type === 'DEPOSIT' ? 'Deposit' :
                                            t.type === 'PURCHASE' ? 'Purchase' :
                                                t.type === 'REFUND' ? 'Refund' : 'Cash Out'}
                                    </p>
                                    <p className="text-xs text-foreground-muted">{format(new Date(t.created_at), 'MMM d, h:mm a')}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold ${t.type === 'DEPOSIT' || t.type === 'REFUND' ? 'text-success' : 'text-foreground'
                                    }`}>
                                    {t.type === 'DEPOSIT' || t.type === 'REFUND' ? '+' : '-'}${t.amount.toFixed(2)}
                                </p>
                                {t.note && <p className="text-xs text-foreground-muted max-w-[120px] truncate">{t.note}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
