import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * True only when both env vars are present. Until the Supabase walkthrough is
 * done these are empty, so the app runs in DEMO mode only and never tries to
 * reach a backend. Screens should fall back to demo when this is false.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * The Supabase client, or `null` when not configured. `SupabaseApi` guards on
 * this and throws a friendly error if a real call is attempted without config.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

/** Narrowing helper: returns the client or throws if Supabase isn't configured. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env, then restart Expo.'
    );
  }
  return supabase;
}
