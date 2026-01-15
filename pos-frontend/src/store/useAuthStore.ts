import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
    id: string;
    role: 'admin' | 'cashier';
    name: string;
    email: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    login: (user: User, token: string) => void;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            login: (user, token) => set({ user, token }),
            logout: async () => {
                try {
                    // Call backend logout endpoint to invalidate session
                    await api.post('/api/auth/logout');
                } catch (error) {
                    console.error('Logout API call failed:', error);
                    // Still proceed with local logout even if API fails
                } finally {
                    set({ user: null, token: null });
                }
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
