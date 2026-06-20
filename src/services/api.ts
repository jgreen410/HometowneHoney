import { HoneyApi } from './HoneyApi';
import { MockApi } from './MockApi';
import { SupabaseApi } from './SupabaseApi';
import { useAuthStore } from '../store/authStore';

/**
 * Returns the active backend for the current session:
 *  - demo-buyer / demo-seller  → MockApi (in-memory, no network)
 *  - authenticated             → SupabaseApi (real backend)
 *
 * Use this from non-React code (stores, event handlers). In components prefer
 * `useApi()` so the screen re-renders if the mode changes.
 */
export function getApi(): HoneyApi {
  const mode = useAuthStore.getState().mode;
  return mode === 'authenticated' ? SupabaseApi : MockApi;
}

/** React hook flavor of `getApi()` — re-subscribes when the session mode changes. */
export function useApi(): HoneyApi {
  const mode = useAuthStore(s => s.mode);
  return mode === 'authenticated' ? SupabaseApi : MockApi;
}
