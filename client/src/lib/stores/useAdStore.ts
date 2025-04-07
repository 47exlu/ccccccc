// useAdStore.ts
import { create } from 'zustand';

type AdRewardCallback = (amount: number, type: string) => void;

export interface AdState {
  isInitialized: boolean;
  adFreeUser: boolean;
  error: string | null;
  
  // Methods
  initializeAds: () => Promise<boolean>;
  watchRewardedAd: (placementId: string, onRewarded: AdRewardCallback) => void;
  setAdFreeStatus: (status: boolean) => void;
  clearError: () => void;
}

export const useAdStore = create<AdState>((set, get) => ({
  isInitialized: false,
  adFreeUser: false,
  error: null,
  
  // Initialize the ad system
  initializeAds: async () => {
    try {
      // Simulate initializing ad SDKs
      await new Promise(resolve => setTimeout(resolve, 600));
      
      set({ isInitialized: true });
      console.log('Ad system initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing ad system:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to initialize ads',
        isInitialized: false
      });
      return false;
    }
  },
  
  // Watch a rewarded ad
  watchRewardedAd: (placementId: string, onRewarded: AdRewardCallback) => {
    if (!get().isInitialized) {
      set({ error: 'Ad system not initialized' });
      return;
    }
    
    if (get().adFreeUser) {
      // If user has ad-free status, give them the reward without showing an ad
      console.log('User has ad-free status, rewarding without showing ad');
      // Calculate a random reward amount
      const rewardAmount = Math.floor(Math.random() * 5000) + 5000; // 5000-10000
      onRewarded(rewardAmount, 'coins');
      return;
    }
    
    console.log(`Showing rewarded ad for placement: ${placementId}`);
    
    // Simulate ad viewing experience
    setTimeout(() => {
      console.log('Ad completed successfully, delivering reward');
      
      // 90% chance of successful ad view
      if (Math.random() < 0.9) {
        // Calculate a random reward amount
        const rewardAmount = Math.floor(Math.random() * 5000) + 5000; // 5000-10000
        onRewarded(rewardAmount, 'coins');
      } else {
        // Simulate ad error
        set({ error: 'Ad failed to load. Please try again later.' });
      }
    }, 500); // In a real app, this would be after the ad is viewed
  },
  
  // Set ad-free status for a user
  setAdFreeStatus: (status: boolean) => {
    set({ adFreeUser: status });
    console.log(`User ad-free status set to: ${status}`);
  },
  
  // Clear any error
  clearError: () => set({ error: null })
}));