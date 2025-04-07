import { create } from 'zustand';
import { SaveGame } from '../types';
import { getLocalStorage, setLocalStorage } from '../utils';

interface SaveGameState {
  saves: SaveGame[];
  activeSaveId: string | null;
  
  // Actions
  loadSaves: () => void;
  deleteSave: (saveId: string) => void;
  setActiveSave: (saveId: string) => void;
}

export const useSaveGame = create<SaveGameState>((set, get) => ({
  saves: [],
  activeSaveId: null,
  
  loadSaves: () => {
    const saves = getLocalStorage('rapperGameSaves') || [];
    set({ saves });
  },
  
  deleteSave: (saveId) => {
    const { saves } = get();
    const filteredSaves = saves.filter(save => save.id !== saveId);
    
    set({ saves: filteredSaves });
    setLocalStorage('rapperGameSaves', filteredSaves);
    
    // If the active save was deleted, clear the active save id
    if (get().activeSaveId === saveId) {
      set({ activeSaveId: null });
    }
  },
  
  setActiveSave: (saveId) => {
    set({ activeSaveId: saveId });
  }
}));
