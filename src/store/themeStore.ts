import { useEffect } from 'react';
import { Appearance } from 'react-native';
import { create } from 'zustand';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { LIGHT, DARK } from '../constants/theme';

type Mode = 'light' | 'dark';
const STORAGE_KEY = 'hh-theme-mode';

interface ThemeStore {
  mode: Mode;
  hydrated: boolean;
  setMode: (m: Mode) => void;
  toggle: () => void;
  hydrate: () => Promise<void>;
}

// Zustand is the single source of truth for the active theme. Because every
// screen subscribes to `mode` through `useTheme()`, toggling re-renders the tree
// and swaps the `C` palette deterministically — no dependence on the native
// appearance, which is what made the previous toggle unreliable.
export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',
  hydrated: false,

  setMode: (mode) => {
    set({ mode });
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {});
  },

  toggle: () => {
    const next: Mode = get().mode === 'dark' ? 'light' : 'dark';
    set({ mode: next });
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  },

  hydrate: async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') set({ mode: saved });
    } finally {
      set({ hydrated: true });
    }
  },
}));

// Mirror our store into NativeWind so any `dark:` className variants stay in sync
// with the runtime palette. Mounted once at the root.
export function useThemeSync() {
  const mode = useThemeStore((s) => s.mode);
  const hydrate = useThemeStore((s) => s.hydrate);
  const { setColorScheme } = useNativeWindColorScheme();

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    try {
      setColorScheme(mode);
    } catch (e) {
      // Ignore if NativeWind cache is stale and fails to recognize darkMode: 'class'
    }
  }, [mode, setColorScheme]);
}

// Primary hook used by every screen.
export function useTheme() {
  const mode = useThemeStore((s) => s.mode);
  const toggle = useThemeStore((s) => s.toggle);
  const setMode = useThemeStore((s) => s.setMode);
  const isDark = mode === 'dark';
  return { isDark, mode, C: isDark ? DARK : LIGHT, toggle, setMode };
}
