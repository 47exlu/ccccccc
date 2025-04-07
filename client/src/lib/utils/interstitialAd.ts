// interstitialAd.ts - Utility for showing interstitial ads at appropriate times
import { adService } from '../services/adService';
import { useRapperGame } from '../stores/useRapperGame';

// Track how often interstitial ads are shown
let lastInterstitialTime = 0;
const MIN_INTERSTITIAL_INTERVAL = 180000; // 3 minutes between interstitials

// Show interstitial ad with optional probability check
export async function showInterstitialAd(probability = 0.5): Promise<boolean> {
  // Check if user is premium (premium users don't see ads)
  const gameStore = useRapperGame.getState();
  if (gameStore.subscriptionInfo?.isSubscribed) {
    return false;
  }
  
  // Check if enough time has passed since the last interstitial
  const now = Date.now();
  if (now - lastInterstitialTime < MIN_INTERSTITIAL_INTERVAL) {
    return false;
  }
  
  // Probabilistic check (useful for not showing ads at every opportunity)
  if (Math.random() > probability) {
    return false;
  }
  
  // Show the ad
  const success = await adService.showInterstitial();
  
  if (success) {
    lastInterstitialTime = now;
  }
  
  return success;
}

// Helper for showing interstitial ads between game sections/weeks
export async function showGameProgressInterstitial(): Promise<boolean> {
  // We use a 30% chance to show an interstitial between game weeks
  // This provides a balance between monetization and user experience
  return showInterstitialAd(0.3);
}

// Helper for showing interstitial ads after important game events
export async function showEventInterstitial(): Promise<boolean> {
  // Higher probability for important events (50%)
  return showInterstitialAd(0.5);
}

// Helper for showing interstitial ads when returning to the game
export async function showReturnToGameInterstitial(): Promise<boolean> {
  // Higher probability when returning after being away (70%)
  return showInterstitialAd(0.7);
}

// Reset the interstitial timer (useful after app restarts)
export function resetInterstitialTimer(): void {
  lastInterstitialTime = 0;
}