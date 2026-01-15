import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface AnalyticsSummary {
    totalRevenue: string;
    totalTransactions: number;
    totalStock: number;
    date: string;
}

interface BestSeller {
    id: string;
    name: string;
    sku: string;
    totalSold: number;
    totalRevenue: string;
    category: string;
}

interface BestSellersResponse {
    products: BestSeller[];
    period: string;
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

export const useBestSellers = (limit = 5) => {
    return useQuery<BestSellersResponse>({
        queryKey: ['analytics', 'best-sellers', limit],
        queryFn: async () => {
            const res = await api.get(`/api/analytics/best-sellers?limit=${limit}`);
            return res.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    });
};
