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
        defaultValues: { role: 'cashier' },
    });

    const onSubmit = (data: CreateUserInput) => {
        createUser.mutate(data, {
            onSuccess: () => {
                toast.success('User created successfully');
                reset();
                onClose();
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Failed to create user');
            },
        });
    };

    if (!isOpen) return null;

    const inputClass = 'w-full h-11 px-4 bg-input-bg border border-input-border rounded-xl text-sm text-foreground outline-none transition-all focus:border-input-focus focus:ring-2 focus:ring-primary-muted placeholder:text-foreground-subtle';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-card-border">
                    <h2 className="text-lg font-semibold text-foreground">Add New Staff</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-foreground-muted hover:bg-background-tertiary rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
                    {/* Username */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground-muted">Username</label>
                        <input
                            {...register('username')}
                            type="text"
                            placeholder="e.g. cashier1"
                            className={inputClass}
                        />
                        {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground-muted">Password</label>
                        <div className="relative">
                            <input
                                {...register('password')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Min. 6 characters"
                                className={`${inputClass} pr-12`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-foreground-subtle hover:text-foreground-muted transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                    </div>

                    {/* Role */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground-muted">Role</label>
                        <select
                            {...register('role')}
                            className={`${inputClass} appearance-none`}
                        >
                            <option value="cashier">Cashier (POS Access)</option>
                            <option value="admin">Admin (Full Access)</option>
                        </select>
                        {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-11 bg-background-tertiary border border-card-border text-foreground font-medium rounded-xl hover:bg-card-hover transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createUser.isPending}
                            className="flex-1 h-11 bg-primary text-foreground font-semibold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 text-sm"
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
