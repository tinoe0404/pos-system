'use client';

import { useState } from 'react';
import { useUsers, useDeactivateUser } from '@/hooks/useUsers';
import { Search, Plus, User as UserIcon, Shield, Ban, CheckCircle, Loader2 } from 'lucide-react';
import UserModal from '@/components/admin/UserModal';
import { toast } from 'sonner';

export default function UsersPage() {
    const { data: usersData, isLoading } = useUsers();
    const deactivateUser = useDeactivateUser();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredUsers = usersData?.users.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleDeactivate = (id: string, username: string) => {
        if (window.confirm(`Are you sure you want to deactivate "${username}"? They will no longer be able to log in.`)) {
            deactivateUser.mutate(id, {
                onSuccess: () => toast.success(`User "${username}" deactivated`),
                onError: () => toast.error('Failed to deactivate user'),
            });
        }
    };

    return (
        <div className="p-4 lg:p-6 space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-foreground">Staff Management</h2>
                    <p className="text-sm text-foreground-muted mt-0.5">Manage cashier and admin accounts</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Staff
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="w-full h-11 pl-11 pr-4 bg-card border border-card-border rounded-xl text-sm text-foreground outline-none transition-all focus:border-input-focus focus:ring-2 focus:ring-primary-muted placeholder:text-foreground-subtle"
                />
            </div>

            {/* Users Table */}
            <div className="bg-card rounded-xl border border-card-border overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-foreground-muted text-sm">Loading users...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="bg-background-tertiary p-5 rounded-2xl">
                            <UserIcon className="w-8 h-8 text-foreground-subtle" />
                        </div>
                        <p className="text-foreground font-medium">
                            {searchQuery ? 'No users found' : 'No users yet'}
                        </p>
                        <p className="text-sm text-foreground-muted">
                            {searchQuery ? 'Try adjusting your search' : 'Add staff members to get started'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-background-secondary border-b border-card-border">
                                    <tr>
                                        {['User', 'Role', 'Status', 'Created', 'Actions'].map((h) => (
                                            <th key={h} className={`px-5 py-3 text-[11px] font-semibold text-foreground-subtle uppercase tracking-wider ${h === 'Actions' ? 'text-right' : ''}`}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-card-border">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-card-hover transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                                                        user.role === 'admin'
                                                            ? 'bg-primary-muted text-primary'
                                                            : 'bg-success-muted text-success'
                                                    }`}>
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-foreground text-sm">{user.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                                    user.role === 'admin'
                                                        ? 'bg-primary-muted text-primary'
                                                        : 'bg-success-muted text-success'
                                                }`}>
                                                    {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                                                    {user.role === 'admin' ? 'Admin' : 'Cashier'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {user.is_active ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-success-muted text-success">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-background-tertiary text-foreground-subtle">
                                                        <Ban className="w-3 h-3" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-foreground-muted">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                {user.is_active && (
                                                    <button
                                                        onClick={() => handleDeactivate(user.id, user.username)}
                                                        className="text-destructive hover:bg-destructive-muted px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                                        disabled={deactivateUser.isPending}
                                                    >
                                                        Deactivate
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card Layout */}
                        <div className="md:hidden divide-y divide-card-border">
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                                                user.role === 'admin' ? 'bg-primary-muted text-primary' : 'bg-success-muted text-success'
                                            }`}>
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground text-sm">{user.username}</p>
                                                <p className="text-xs text-foreground-subtle capitalize">{user.role}</p>
                                            </div>
                                        </div>
                                        {user.is_active ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-success-muted text-success">
                                                <CheckCircle className="w-3 h-3" />
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-background-tertiary text-foreground-subtle">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-foreground-subtle">
                                            Created {new Date(user.created_at).toLocaleDateString()}
                                        </span>
                                        {user.is_active && (
                                            <button
                                                onClick={() => handleDeactivate(user.id, user.username)}
                                                className="text-destructive hover:bg-destructive-muted px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                                disabled={deactivateUser.isPending}
                                            >
                                                Deactivate
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
