import { create } from 'zustand';
import { SellerProfile } from '../types/schema';
import { getApi } from '../services/api';

interface FavesState {
  favorites: SellerProfile[];
  /** Load favorites for the active session from the backend (demo or Supabase). */
  hydrate: () => Promise<void>;
  toggleFavorite: (seller: SellerProfile) => void;
  isFavorite: (sellerId: string) => boolean;
}

export const useFavesStore = create<FavesState>((set, get) => ({
  favorites: [],

  hydrate: async () => {
    const favorites = await getApi().getFavorites();
    set({ favorites });
  },

  toggleFavorite: (seller) => {
    const current = get().favorites;
    const exists = current.find((s) => s.id === seller.id);
    // Optimistic local update for snappy UI...
    set({
      favorites: exists
        ? current.filter((s) => s.id !== seller.id)
        : [...current, seller],
    });
    // ...then persist via the active backend (fire-and-forget).
    getApi().toggleFavorite(seller).catch((e) => console.warn('toggleFavorite failed', e));
  },

  isFavorite: (sellerId) => !!get().favorites.find((s) => s.id === sellerId),
}));
