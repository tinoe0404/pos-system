import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface Receipt {
    id: string;
    saleId: string;
    receiptNumber: string;
    items: Array<{
        name: string;
        quantity: number;
        price: string;
        total: string;
    }>;
    subtotal: string;
    tax: string;
    total: string;
    paymentMethod: 'CASH' | 'ECOCASH';
    createdAt: string;
    cashierName?: string;
}

/**
 * Fetch receipt data for a specific sale
 * Used for reprinting receipts
 */
export const useReceipt = (saleId: string | null) => {
    return useQuery({
        queryKey: ['receipts', saleId],
        queryFn: async () => {
            if (!saleId) throw new Error('Sale ID is required');
            const res = await api.get<Receipt>(`/api/receipts/${saleId}`);
            return res.data;
        },
        enabled: !!saleId, // Only fetch when saleId is provided
        staleTime: Infinity, // Receipts don't change once created
    });
};
