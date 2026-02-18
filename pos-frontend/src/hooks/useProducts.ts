import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Product } from '@/types/product';

export const useProducts = () => {
    return useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            // Backend returns: { products: Product[], count: number }
            const res = await api.get<{ products: Product[]; count: number }>('/api/products');
            return res.data;
        },
        staleTime: 5 * 60 * 1000,      // 5 min cache — products rarely change during a shift
        refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 min
    });
};

