import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

interface RestockPayload {
    productId: string;
    quantity: number;
}

export const useRestockProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: RestockPayload) => {
            const res = await api.post('/api/inventory/restock', data);
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['inventory', 'low-stock'] });
            queryClient.invalidateQueries({ queryKey: ['inventory', 'history'] });
            toast.success(`Restocked ${data.product.name} (+${data.product.new_stock - data.product.previous_stock})`);
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to restock product';
            toast.error(message);
        },
    });
};

interface AdjustStockPayload {
    productId: string;
    quantity: number;
    reason: string;
}

export const useAdjustStock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: AdjustStockPayload) => {
            const res = await api.put('/api/inventory/adjust', data);
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['inventory', 'low-stock'] });
            queryClient.invalidateQueries({ queryKey: ['inventory', 'history'] });
            toast.success(`Adjusted stock for ${data.product.name}`);
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to adjust stock';
            toast.error(message);
        },
    });
};
