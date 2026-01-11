import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { ProductFormData } from '@/schemas/product.schema';

// Create Product
export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: ProductFormData) => {
            const res = await api.post('/api/products', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product created successfully');
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to create product';
            toast.error(message);
        },
    });
};

// Update Product
export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<ProductFormData> }) => {
            const res = await api.put(`/api/products/${id}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product updated successfully');
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to update product';
            toast.error(message);
        },
    });
};

// Delete Product
export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/api/products/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product deleted successfully');
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Failed to delete product';
            toast.error(message);
        },
    });
};
