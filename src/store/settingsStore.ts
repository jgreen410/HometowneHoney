import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Radius presets (miles) the Discovery screen lets you cycle through. */
export const RADIUS_PRESETS = [10, 25, 50, 100] as const;

interface SettingsState {
  /** How far around the phone's location Discovery zooms. Persisted. */
  discoveryRadiusMiles: number;
  setDiscoveryRadius: (miles: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      discoveryRadiusMiles: 25, // default
      setDiscoveryRadius: (miles) => set({ discoveryRadiusMiles: miles }),
    }),
    {
      name: 'hometowne-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
