'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2, Lock, Eye, EyeOff, AlertCircle, Store } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            setError('');
            const res = await api.post('/api/auth/login', { username, password });
            return res.data;
        },
        onSuccess: (data) => {
            login(data.user, data.token);
            if (data.user.role === 'cashier') {
                router.push('/pos');
            } else if (data.user.role === 'admin') {
                router.push('/admin/dashboard');
            } else {
                setError('Unknown user role');
            }
        },
        onError: (err: any) => {
            console.error(err);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            setError('Please fill in both fields');
            return;
        }
        mutate();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Subtle background gradient orb */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }}
            />

            <div className="w-full max-w-[420px] animate-scale-in relative z-10">
                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-14 h-14 bg-primary-muted rounded-2xl flex items-center justify-center mb-4 border border-card-border">
                        <Store className="w-7 h-7 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight text-balance">
                        RetailPOS
                    </h1>
                    <p className="text-foreground-muted text-sm mt-1">
                        Sign in to access the system
                    </p>
                </div>

                {/* Card */}
                <div className="bg-card border border-card-border rounded-2xl p-8 space-y-6">
                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-3 p-3 bg-destructive-muted text-destructive text-sm rounded-xl animate-fade-in">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username */}
                        <div className="space-y-2">
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-foreground-muted"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full h-12 px-4 bg-input-bg border border-input-border rounded-xl text-foreground text-base outline-none transition-all duration-200 placeholder:text-foreground-subtle focus:border-input-focus focus:ring-2 focus:ring-primary-muted disabled:opacity-50"
                                placeholder="Enter username"
                                disabled={isPending}
                                autoComplete="username"
                                autoFocus
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-foreground-muted"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-12 px-4 pr-12 bg-input-bg border border-input-border rounded-xl text-foreground text-base outline-none transition-all duration-200 placeholder:text-foreground-subtle focus:border-input-focus focus:ring-2 focus:ring-primary-muted disabled:opacity-50"
                                    placeholder="Enter password"
                                    disabled={isPending}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-foreground-subtle hover:text-foreground-muted transition-colors rounded-lg"
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-12 bg-primary text-foreground font-semibold rounded-xl hover:bg-primary-hover transition-all duration-200 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    <span>Sign In</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer hint */}
                <p className="text-center text-foreground-subtle text-xs mt-6">
                    Contact your administrator if you need access
                </p>
            </div>
        </div>
    );
}
