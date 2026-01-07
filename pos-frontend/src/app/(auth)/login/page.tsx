'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2, Lock } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            setError('');
            // Adjust the endpoint if necessary based on backend spec
            const res = await api.post('/api/auth/login', { username, password });
            return res.data;
        },
        onSuccess: (data) => {
            // Assuming data structure: { user: { ... }, token: string }
            login(data.user, data.token);

            // Redirect based on role
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
            setError("Please fill in both fields");
            return;
        }
        mutate();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm space-y-8">
                <div className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Beer POS Login</h1>
                    <p className="text-slate-500">Enter your credentials to access the system</p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-4 border border-slate-200 rounded-lg text-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Enter username"
                            disabled={isPending}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 border border-slate-200 rounded-lg text-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                            disabled={isPending}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full p-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Logging in...
                            </>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
