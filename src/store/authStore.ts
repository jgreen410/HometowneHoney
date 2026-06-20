import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { Profile } from '../types/schema';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import type { HoneyApi } from '../services/HoneyApi';
import { MockApi, DEMO_SELLER_ID } from '../services/MockApi';
import { SupabaseApi } from '../services/SupabaseApi';

export type AuthMode = 'demo-buyer' | 'demo-seller' | 'authenticated' | null;

// Pick the backend for a mode directly here (instead of importing services/api)
// so authStore <-> api don't form a require cycle.
const apiFor = (mode: AuthMode): HoneyApi =>
  mode === 'authenticated' ? SupabaseApi : MockApi;

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  mode: AuthMode;
  loading: boolean;
  /** True while the session mode is one of the demo flavors. */
  isDemo: () => boolean;

  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  /** Returns true when a session was established, false when email confirmation is pending. */
  signUp: (email: string, password: string, asSeller: boolean) => Promise<boolean>;
  signOut: () => Promise<void>;
  enterDemo: (role: 'buyer' | 'seller') => Promise<void>;
  exitDemo: () => void;
  toggleSellerRole: () => Promise<void>;
  updateProfile: (patch: { name?: string; defaultZip?: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const demoProfile = (role: 'buyer' | 'seller'): Profile =>
  role === 'seller'
    ? { id: DEMO_SELLER_ID, name: 'Sarah Miller', defaultZip: '21211', isSeller: true }
    : { id: 'demo-buyer', name: 'Demo Buyer', defaultZip: '21211', isSeller: false };

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  mode: null,
  loading: true,

  isDemo: () => {
    const m = get().mode;
    return m === 'demo-buyer' || m === 'demo-seller';
  },

  init: async () => {
    if (!isSupabaseConfigured || !supabase) {
      // No backend configured — go straight to the login screen (demo only).
      set({ loading: false });
      return;
    }

    const { data } = await supabase.auth.getSession();
    if (data.session) {
      set({ session: data.session, mode: 'authenticated' });
      await get().refreshProfile();
    }
    set({ loading: false });

    supabase.auth.onAuthStateChange(async (_event, session) => {
      // Ignore auth events while exploring in demo mode.
      if (get().isDemo()) return;
      if (session) {
        set({ session, mode: 'authenticated' });
        await get().refreshProfile();
      } else {
        set({ session: null, profile: null, mode: null });
      }
    });
  },

  signIn: async (email, password) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // onAuthStateChange handles session + profile hydration.
  },

  signUp: async (email, password, asSeller) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (!data.session) return false; // email confirmation required

    set({ session: data.session, mode: 'authenticated' });
    if (asSeller) {
      // Trigger created the profile row; flip the seller flag + scaffold storefront.
      await apiFor('authenticated').setSellerRole(true);
    }
    await get().refreshProfile();
    return true;
  },

  signOut: async () => {
    if (supabase) await supabase.auth.signOut();
    set({ session: null, profile: null, mode: null });
  },

  enterDemo: async (role) => {
    set({ mode: role === 'seller' ? 'demo-seller' : 'demo-buyer', profile: demoProfile(role) });
    // Keep MockApi's in-memory profile in sync with the chosen role.
    await MockApi.setSellerRole(role === 'seller');
  },

  exitDemo: () => set({ mode: null, profile: null }),

  toggleSellerRole: async () => {
    const profile = get().profile;
    if (!profile) return;
    const next = !profile.isSeller;
    await apiFor(get().mode).setSellerRole(next);
    set({ profile: { ...profile, isSeller: next } });
  },

  updateProfile: async (patch) => {
    const profile = get().profile;
    await apiFor(get().mode).updateProfile(patch);
    if (profile) set({ profile: { ...profile, ...patch } });
  },

  refreshProfile: async () => {
    if (get().isDemo()) return;
    const profile = await apiFor(get().mode).getProfile();
    if (profile) set({ profile });
  },
}));
