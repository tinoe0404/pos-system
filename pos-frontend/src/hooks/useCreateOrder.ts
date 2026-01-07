import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { CartItem } from '@/store/useCartStore';

interface CreateOrderPayload {
    items: {
        productId: string;
        quantity: number;
        priceAtSale: number;
    }[];
    paymentMethod: 'CASH' | 'ECOCASH';
}

export const useCreateOrder = () => {
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
    });
};
