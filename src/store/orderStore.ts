import { create } from 'zustand';
import { CartItem, Order } from '../types/schema';
import { getApi } from '../services/api';

// Re-export so existing imports keep working.
export type { Order };

interface OrderState {
  orders: Order[];
  /** Load orders for the active session from the backend (demo or Supabase). */
  hydrate: () => Promise<void>;
  placeOrder: (items: CartItem[], total: number, customerName: string) => Promise<void>;
  markAsShipped: (orderId: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],

  hydrate: async () => {
    const orders = await getApi().getOrders();
    set({ orders });
  },

  placeOrder: async (items, total, customerName) => {
    const order = await getApi().placeOrder(items, total, customerName);
    set((state) => ({ orders: [order, ...state.orders] }));
  },

  markAsShipped: async (orderId) => {
    await getApi().markOrderShipped(orderId);
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'shipped' } : o
      ),
    }));
  },
}));
