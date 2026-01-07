import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Product } from '@/types/product';

export const useProducts = () => {
    return useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            // Backend returns: { products: Product[], count: number }
            const res = await api.get<{ products: Product[] }>('/api/products');
            return res.data.products || [];
        },
    });
};
