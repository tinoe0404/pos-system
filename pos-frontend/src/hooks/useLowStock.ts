import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface LowStockProduct {
    id: string;
    name: string;
    sku: string;
    stock: number;
    category: string;
    price: string;
}

interface LowStockResponse {
    lowStockProducts: LowStockProduct[];
    count: number;
    threshold: number;
}

export const useLowStock = () => {
    return useQuery<LowStockResponse>({
        queryKey: ['notifications', 'low-stock'],
        queryFn: async () => {
            const res = await api.get('/api/notifications/low-stock');
            return res.data;
        },
        staleTime: 60000, // Cache for 1 minute
    });
};
