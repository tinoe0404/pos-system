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

    // Filter users based on search
    const filteredUsers = usersData?.users.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleDeactivate = (id: string, username: string) => {
        if (window.confirm(`Are you sure you want to deactivate "${username}"? They will no longer be able to log in.`)) {
            deactivateUser.mutate(id, {
                onSuccess: () => {
                    toast.success(`User "${username}" deactivated`);
                },
                onError: () => {
                    toast.error('Failed to deactivate user');
                },
            });
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Staff Management</h2>
                    <p className="text-slate-500">Manage cashier and admin accounts</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-5 h-5" />
                    Add New Staff
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search users..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserIcon className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500">
                            {searchQuery ? 'No users found matching your search' : 'No users found'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-slate-900">{user.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {user.role === 'admin' ? (
                                                    <Shield className="w-3 h-3" />
                                                ) : (
                                                    <UserIcon className="w-3 h-3" />
                                                )}
                                                {user.role === 'admin' ? 'Admin' : 'Cashier'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.is_active ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                                                    <Ban className="w-3 h-3" />
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {user.is_active && (
                                                <button
                                                    onClick={() => handleDeactivate(user.id, user.username)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
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
                )}
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
