// useEnergyStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EnergyState {
  energy: number;
  maxEnergy: number;
  unlimitedEnergyUntil: number | null;
  
  // Methods
  addEnergy: (amount: number) => void;
  useEnergy: (amount: number) => boolean;
  resetEnergy: () => void;
  checkForUnlimitedEnergy: () => boolean;
  setUnlimitedEnergyTimer: (expiryTime: number) => void;
}

export const useEnergyStore = create<EnergyState>()(
  persist(
    (set, get) => ({
      energy: 100,
      maxEnergy: 100,
      unlimitedEnergyUntil: null,
      
      // Add energy
      addEnergy: (amount: number) => {
        // If unlimited energy is active, don't need to add more
        if (get().checkForUnlimitedEnergy()) return;
        
        set((state) => ({ 
          energy: Math.min(state.energy + amount, state.maxEnergy)
        }));
      },
      
      // Use energy 
      useEnergy: (amount: number) => {
        // If unlimited energy is active, allow the action without reducing energy
        if (get().checkForUnlimitedEnergy()) return true;
        
        const currentEnergy = get().energy;
        
        // Check if enough energy
        if (currentEnergy < amount) {
          return false; // Not enough energy
        }
        
        // Reduce energy
        set((state) => ({ energy: state.energy - amount }));
        return true;
      },
      
      // Reset energy to full
      resetEnergy: () => {
        set((state) => ({ energy: state.maxEnergy }));
      },
      
      // Check if unlimited energy is active
      checkForUnlimitedEnergy: () => {
        const { unlimitedEnergyUntil } = get();
        
        if (!unlimitedEnergyUntil) return false;
        
        // Check if unlimited energy is still active
        const isActive = Date.now() < unlimitedEnergyUntil;
        
        // If timer expired, clear it
        if (!isActive && unlimitedEnergyUntil) {
          set({ unlimitedEnergyUntil: null });
        }
        
        return isActive;
      },
      
      // Set unlimited energy timer
      setUnlimitedEnergyTimer: (expiryTime: number) => {
        set({ unlimitedEnergyUntil: expiryTime });
      }
    }),
    {
      name: 'energy-storage',
    }
  )
);