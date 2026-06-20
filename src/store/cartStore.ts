import { create } from 'zustand';
import { Product, SellerProfile, CartItem } from '../types/schema';

// Re-export so existing imports (`from './cartStore'`) keep working.
export type { CartItem };

interface CartState {
  items: CartItem[];
  addItem: (product: Product, seller: SellerProfile) => void;
  removeItem: (cartId: string) => void;
  clearCart: () => void;
  // Computed helpers
  getTotalPrice: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product, seller) => {
    set((state) => ({
      items: [
        ...state.items,
        {
          ...product,
          cartId: Math.random().toString(36).substr(2, 9),
          sellerId: seller.id,
          sellerName: seller.storeName || seller.ownerName
        }
      ]
    }));
  },

  removeItem: (cartId) => {
    set((state) => ({
      items: state.items.filter((i) => i.cartId !== cartId)
    }));
  },

  clearCart: () => set({ items: [] }),

  getTotalPrice: () => get().items.reduce((total, item) => total + item.price, 0),
  getItemCount: () => get().items.length,
}));
