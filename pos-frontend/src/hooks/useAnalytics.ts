import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface AnalyticsSummary {
    totalRevenue: string;
    totalTransactions: number;
    totalStock: number;
    date: string;
}

export const useAnalytics = () => {
    return useQuery<AnalyticsSummary>({
        queryKey: ['analytics', 'summary'],
        queryFn: async () => {
            const res = await api.get('/api/analytics/summary');
            return res.data;
        },
        staleTime: 60000, // Cache for 1 minute
        refetchInterval: 60000, // Auto-refresh every minute
    });
};
