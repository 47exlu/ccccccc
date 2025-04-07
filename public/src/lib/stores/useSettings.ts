import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // Animation settings
  loadingAnimationsEnabled: boolean;
  
  // Actions
  toggleLoadingAnimations: () => void;
}

/**
 * Store for managing user settings and preferences
 * Uses persist middleware to save settings to localStorage
 */
export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      // Default settings
      loadingAnimationsEnabled: true,
      
      // Actions
      toggleLoadingAnimations: () => set(state => ({ 
        loadingAnimationsEnabled: !state.loadingAnimationsEnabled 
      })),
    }),
    {
      name: 'rapper-sim-settings', // localStorage key
    }
  )
);