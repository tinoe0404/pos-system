import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface SaleItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
}

export interface Sale {
    id: string;
    items: SaleItem[];
    total: number;
    paymentMethod: 'CASH' | 'ECOCASH' | 'TAB';
    status: 'COMPLETED' | 'VOIDED';
    createdAt: string;
    updatedAt: string;
}

interface SalesResponse {
    sales: Sale[];
    count: number;
}

export const useSales = () => {
    return useQuery({
        queryKey: ['sales'],
        queryFn: async () => {
            // Fetch last 2 weeks of transactions
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
            const from = twoWeeksAgo.toISOString();
            const to = new Date().toISOString();

            const { data } = await api.get<any>('/api/sales', {
                params: { from, to, take: 500 },
            });
            // Transform snake_case API response to camelCase interface
            const transformedSales: Sale[] = data.sales.map((sale: any) => ({
                id: sale.id,
                items: sale.items.map((item: any) => ({
                    id: item.id,
                    productId: item.product_id,
                    productName: item.productName || item.product?.name || 'Unknown Product',
                    quantity: item.quantity,
                    price: Number(item.price_at_sale),
                })),
                total: Number(sale.total),
                paymentMethod: sale.payment_method,
                status: sale.status,
                createdAt: sale.created_at,
                updatedAt: sale.updated_at,
            }));

            return {
                sales: transformedSales,
                count: data.count,
            };
        },
        staleTime: 30 * 1000,           // 30 sec cache — sales need fresher data
        refetchInterval: 60 * 1000,     // Auto-refresh every 1 min
    });
};

