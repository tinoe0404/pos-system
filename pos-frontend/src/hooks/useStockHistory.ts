import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface StockMovement {
    id: string;
    product_id: string;
    type: 'RESTOCK' | 'ADJUSTMENT' | 'SALE' | 'VOID' | 'INITIAL';
    quantity_change: number;
    previous_stock: number;
    new_stock: number;
    reason?: string;
    reference_id?: string;
    created_by?: string;
    created_at: string;
    product: {
        name: string;
        sku: string;
    };
}

interface StockHistoryResponse {
    movements: StockMovement[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const useStockHistory = (productId?: string, page = 1, limit = 20) => {
    return useQuery<StockHistoryResponse>({
        queryKey: ['inventory', 'history', productId, page, limit],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });
            if (productId) {
                params.append('productId', productId);
            }

            const { data } = await api.get<StockHistoryResponse>(`/api/inventory/history?${params.toString()}`);
            return data;
        },
        enabled: true,
        staleTime: 5000, // 5 seconds cache
    });
};
