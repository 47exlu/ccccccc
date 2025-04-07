import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  loadingAnimationsEnabled: boolean;
  toggleLoadingAnimations: () => void;
  highQualityGraphics: boolean;
  toggleHighQualityGraphics: () => void;
  autoSaveEnabled: boolean;
  toggleAutoSave: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      loadingAnimationsEnabled: true,
      highQualityGraphics: true,
      autoSaveEnabled: true,
      
      toggleLoadingAnimations: () => set((state) => ({ 
        loadingAnimationsEnabled: !state.loadingAnimationsEnabled 
      })),
      
      toggleHighQualityGraphics: () => set((state) => ({ 
        highQualityGraphics: !state.highQualityGraphics 
      })),
      
      toggleAutoSave: () => set((state) => ({ 
        autoSaveEnabled: !state.autoSaveEnabled 
      })),
    }),
    {
      name: 'game-settings',
    }
  )
);