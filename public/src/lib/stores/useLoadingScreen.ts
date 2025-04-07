import { create } from 'zustand';

type LoadingVariant = 'default' | 'record' | 'vinyl' | 'microphone' | 'random';

interface LoadingState {
  isLoading: boolean;
  message: string;
  variant: LoadingVariant;
  showLoading: (message?: string, variant?: LoadingVariant) => void;
  hideLoading: () => void;
}

export const useLoadingScreen = create<LoadingState>((set) => ({
  isLoading: false,
  message: '',
  variant: 'random',
  
  showLoading: (message = '', variant = 'random') => 
    set({ isLoading: true, message, variant }),
    
  hideLoading: () => set({ isLoading: false }),
}));