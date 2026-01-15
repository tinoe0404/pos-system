import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

interface RestockPayload {
    productId: string;
    quantity: number;
    notes?: string;
}

interface AdjustInventoryPayload {
    productId: string;
    adjustment: number;
    reason: string;
}

interface InventoryItem {
    id: string;
    productId: string;
    productName: string;
    sku: string;
    currentStock: number;
    lastUpdated: string;
}

interface InventoryResponse {
    inventory: InventoryItem[];
    count: number;
}

/**
 * Fetch inventory data (if separate from products)
 */
export const useInventory = () => {
    return useQuery({
        queryKey: ['inventory'],
        queryFn: async () => {
            const res = await api.get<InventoryResponse>('/api/inventory');
            return res.data;
        },
    });
};

/**
 * Add stock to a product
 */
export const useRestock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: RestockPayload) => {
            const res = await api.post('/api/inventory/restock', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'low-stock'] });
            toast.success('Stock added successfully');
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to add stock';
            toast.error(message);
        },
    });
};

/**
 * Adjust inventory levels (corrections, damages, etc.)
 */
export const useAdjustInventory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: AdjustInventoryPayload) => {
            const res = await api.put('/api/inventory/adjust', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'low-stock'] });
            toast.success('Inventory adjusted successfully');
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to adjust inventory';
            toast.error(message);
        },
    });
};
