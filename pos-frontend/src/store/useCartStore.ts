import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string; // Product ID
    name: string;
    price: number;
    quantity: number;
    stock?: number; // Available stock for validation
}

interface CartState {
    items: CartItem[];
    addItem: (product: { id: string; name: string; price: number; stock?: number }) => boolean;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => boolean;
    clearCart: () => void;
    getTotal: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                const { items } = get();
                const existingItem = items.find((item) => item.id === product.id);
                const currentQty = existingItem ? existingItem.quantity : 0;
                const maxStock = product.stock ?? existingItem?.stock;

                // Stock validation: prevent exceeding available stock
                if (maxStock !== undefined && currentQty >= maxStock) {
                    return false; // Caller should show a toast
                }

                set((state) => {
                    const existing = state.items.find((item) => item.id === product.id);
                    if (existing) {
                        return {
                            items: state.items.map((item) =>
                                item.id === product.id
                                    ? { ...item, quantity: item.quantity + 1, stock: product.stock ?? item.stock }
                                    : item
                            ),
                        };
                    }
                    return {
                        items: [...state.items, { ...product, quantity: 1 }],
                    };
                });
                return true;
            },
            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                }));
            },
            updateQuantity: (id, quantity) => {
                const { items } = get();
                const item = items.find((i) => i.id === id);
                if (item?.stock !== undefined && quantity > item.stock) {
                    return false; // Caller should show a toast
                }
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
                    ),
                }));
                return true;
            },
            clearCart: () => set({ items: [] }),
            getTotal: () => {
                const { items } = get();
                return items.reduce((total, item) => total + item.price * item.quantity, 0);
            },
        }),
        {
            name: 'pos-cart-storage',
        }
    )
);
