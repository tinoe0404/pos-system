'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createUserSchema, CreateUserInput } from '@/schemas/user.schema';
import { useCreateUser } from '@/hooks/useUsers';
import { toast } from 'sonner';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UserModal({ isOpen, onClose }: UserModalProps) {
    const [showPassword, setShowPassword] = useState(false);
    const createUser = useCreateUser();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateUserInput>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            role: 'cashier',
        },
    });

    const onSubmit = (data: CreateUserInput) => {
        createUser.mutate(data, {
            onSuccess: () => {
                toast.success('User created successfully');
                reset();
                onClose();
            },
            onError: (error: any) => {
                const message = error.response?.data?.message || 'Failed to create user';
                toast.error(message);
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">Add New Staff</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {/* Username */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Username</label>
                        <input
                            {...register('username')}
                            type="text"
                            placeholder="e.g. cashier1"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                        {errors.username && (
                            <p className="text-sm text-red-500">{errors.username.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Password</label>
                        <div className="relative">
                            <input
                                {...register('password')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="******"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-500">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Role */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Role</label>
                        <select
                            {...register('role')}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                        >
                            <option value="cashier">Cashier (POS Access)</option>
                            <option value="admin">Admin (Full Access)</option>
                        </select>
                        {errors.role && (
                            <p className="text-sm text-red-500">{errors.role.message}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-slate-600 bg-slate-50 font-medium rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createUser.isPending}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {createUser.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create User'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
