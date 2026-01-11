import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { CartItem } from '@/store/useCartStore';
import { Product } from '@/types/product';

interface CreateOrderPayload {
    items: {
        productId: string;
        quantity: number;
        priceAtSale: number;
    }[];
    paymentMethod: 'CASH' | 'ECOCASH';
}

interface ProductsResponse {
    products: Product[];
    count: number;
}

export const useCreateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ items, paymentMethod }: { items: CartItem[]; paymentMethod: 'CASH' | 'ECOCASH' }) => {
            const payload: CreateOrderPayload = {
                items: items.map((item) => ({
                    productId: item.id,
                    quantity: item.quantity,
                    priceAtSale: Number(item.price),
                })),
                paymentMethod,
            };
            const res = await api.post('/api/sales', payload);
            return res.data;
        },
        onMutate: async ({ items }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['products'] });

            // Snapshot the previous value
            const previousData = queryClient.getQueryData<ProductsResponse>(['products']);

            // Optimistically update to the new value
            queryClient.setQueryData<ProductsResponse>(['products'], (old) => {
                if (!old) return old;

                return {
                    ...old,
                    products: old.products.map((product) => {
                        const cartItem = items.find((item) => item.id === product.id);
                        if (cartItem) {
                            return {
                                ...product,
                                stock: product.stock - cartItem.quantity,
                            };
                        }
                        return product;
                    }),
                };
            });

            // Return a context with the previous and new todo
            return { previousData };
        },
        onError: (err, newTodo, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousData) {
                queryClient.setQueryData(['products'], context.previousData);
            }
        },
        onSettled: () => {
            // Delay invalidation to allow background worker to finish stock deduction
            // This prevents fetching stale data immediately after success
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['products'] });
            }, 2000);
        },
    });
};
