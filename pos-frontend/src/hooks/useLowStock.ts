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
        queryKey: ['inventory', 'low-stock'],
        queryFn: async () => {
            const { data } = await api.get<any[]>('/api/inventory/low-stock');
            // Backend returns array of products
            return {
                lowStockProducts: data.map(p => ({
                    id: p.id,
                    name: p.name,
                    sku: p.sku,
                    stock: p.stock,
                    category: p.category || '',
                    price: p.price
                })),
                count: data.length,
                threshold: 10 // This should ideally come from backend or config
            };
        },
        staleTime: 60000, // Cache for 1 minute
    });
};
