import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './useCartStore';

export interface HeldOrder {
  id: string;
  items: CartItem[];
  note: string;
  heldAt: string;
  total: number;
}

interface HeldOrdersState {
  orders: HeldOrder[];
  addOrder: (items: CartItem[], note: string) => void;
  removeOrder: (id: string) => void;
  clearAll: () => void;
}

export const useHeldOrders = create<HeldOrdersState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (items, note) => {
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const order: HeldOrder = {
          id: `hold-${Date.now()}`,
          items,
          note,
          heldAt: new Date().toISOString(),
          total,
        };
        set((state) => ({ orders: [...state.orders, order] }));
      },
      removeOrder: (id) => {
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== id),
        }));
      },
      clearAll: () => set({ orders: [] }),
    }),
    { name: 'pos-held-orders' }
  )
);
