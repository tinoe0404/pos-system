import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Hook to validate the current auth session with the backend
 * Automatically logs out if token is invalid
 */
export const useAuthValidation = () => {
    const { token, logout } = useAuthStore();
    const router = useRouter();

    const query = useQuery({
        queryKey: ['auth', 'validate'],
        queryFn: async () => {
            const res = await api.get('/api/auth/me');
            return res.data;
        },
        enabled: !!token, // Only run if token exists
        retry: false,
        staleTime: 5 * 60 * 1000, // Check every 5 minutes
        refetchInterval: 5 * 60 * 1000, // Auto-revalidate every 5 minutes
    });

    // Handle authentication errors
    useEffect(() => {
        if (query.isError && token) {
            // Token invalid - force logout
            logout();
            router.push('/login');
        }
    }, [query.isError, token, logout, router]);

    return query;
};
