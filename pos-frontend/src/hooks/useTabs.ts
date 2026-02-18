import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTab, getTabs, getTabById, depositToTab, closeTab } from '@/lib/api';

export const useTabs = (filters?: { q?: string; status?: string }) => {
    return useQuery({
        queryKey: ['tabs', filters],
        queryFn: async () => {
            const res = await getTabs(filters);
            return res.data;
        },
    });
};

export const useTab = (id: string) => {
    return useQuery({
        queryKey: ['tabs', id],
        queryFn: async () => {
            const res = await getTabById(id);
            return res.data;
        },
        enabled: !!id,
    });
};

export const useCreateTab = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { customer_name: string; phone?: string; deposit_amount: number }) => {
            const res = await createTab(data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tabs'] });
        },
    });
};

export const useDepositToTab = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, amount, note }: { id: string; amount: number; note?: string }) => {
            const res = await depositToTab(id, amount, note);
            return res.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tabs'] });
            queryClient.invalidateQueries({ queryKey: ['tabs', variables.id] });
        },
    });
};

export const useCloseTab = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, note }: { id: string; note?: string }) => {
            const res = await closeTab(id, note);
            return res.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tabs'] });
            queryClient.invalidateQueries({ queryKey: ['tabs', variables.id] });
        },
    });
};
