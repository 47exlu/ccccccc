// Google AdMob Service for Rap Empire Simulator
import { useAdStore } from '../stores/useAdStore';
import { useRapperGame } from '../stores/useRapperGame';

// Ad Unit Types
export enum AdUnitType {
  BANNER = 'banner',
  INTERSTITIAL = 'interstitial',
  REWARDED = 'rewarded'
}

// Test Ad Unit IDs (use these for development)
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';
const TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';

// Production Ad Unit IDs (replace these with your actual IDs)
const PROD_BANNER_ID = 'ca-app-pub-XXXXXXXXXXXXXXXX/NNNNNNNNNN';
const PROD_INTERSTITIAL_ID = 'ca-app-pub-XXXXXXXXXXXXXXXX/NNNNNNNNNN';
const PROD_REWARDED_ID = 'ca-app-pub-XXXXXXXXXXXXXXXX/NNNNNNNNNN';

// Use test ads in development and real ads in production
const USE_TEST_ADS = true; // Set to false for production

// AdMob Service
class AdService {
  private adMob: any = null;
  private isInitialized: boolean = false;
  private platformSupported: boolean = false;
  private lastInterstitialTime: number = 0;
  private interstitialCooldown: number = 60000; // 1 minute cooldown
  private rewardedAdReady: boolean = false;
  private bannerAdReady: boolean = false;
  private interstitialAdReady: boolean = false;

  constructor() {
    // Check if we're running in a mobile environment with AdMob support
    this.platformSupported = 
      typeof window !== 'undefined' && 
      window.cordova !== undefined && 
      window.admob !== undefined;
    
    if (this.platformSupported) {
      // Initialize after device is ready
      document.addEventListener('deviceready', this.initialize.bind(this), false);
    } else {
      console.log('AdMob not supported in this environment');
    }
  }

  // Initialize AdMob
  private async initialize(): Promise<void> {
    if (!this.platformSupported) return;

    try {
      this.adMob = window.admob;
      
      // Set AdMob options
      await this.adMob.start();
      
      // Initialize the ads
      await this.prepareInterstitial();
      await this.prepareRewarded();
      this.prepareBanner();
      
      this.isInitialized = true;
      console.log('AdMob initialized successfully');
      
      // Update the ad store
      const adStore = useAdStore.getState();
      adStore.setAdServiceInitialized(true);
    } catch (error) {
      console.error('Failed to initialize AdMob', error);
    }
  }

  // Prepare banner ad
  private async prepareBanner(): Promise<void> {
    if (!this.platformSupported || !this.adMob) return;

    try {
      const adId = USE_TEST_ADS ? TEST_BANNER_ID : PROD_BANNER_ID;
      
      // Create banner
      await this.adMob.banner.config({
        id: adId,
        isTesting: USE_TEST_ADS,
        autoShow: false,
        position: 'bottom',
      });
      
      this.bannerAdReady = true;
    } catch (error) {
      console.error('Failed to prepare banner ad', error);
    }
  }

  // Prepare interstitial ad
  private async prepareInterstitial(): Promise<void> {
    if (!this.platformSupported || !this.adMob) return;

    try {
      const adId = USE_TEST_ADS ? TEST_INTERSTITIAL_ID : PROD_INTERSTITIAL_ID;
      
      // Load interstitial
      await this.adMob.interstitial.load({
        id: adId,
        isTesting: USE_TEST_ADS
      });
      
      // Set up event listeners
      document.addEventListener('admob.interstitial.load', () => {
        console.log('Interstitial loaded');
        this.interstitialAdReady = true;
      });
      
      document.addEventListener('admob.interstitial.loadfail', (event: any) => {
        console.error('Interstitial failed to load', event);
        // Try to reload after some time
        setTimeout(() => this.prepareInterstitial(), 60000);
      });
      
      document.addEventListener('admob.interstitial.close', () => {
        console.log('Interstitial closed');
        // Reload interstitial after it's closed
        this.prepareInterstitial();
      });
    } catch (error) {
      console.error('Failed to prepare interstitial ad', error);
    }
  }

  // Prepare rewarded ad
  private async prepareRewarded(): Promise<void> {
    if (!this.platformSupported || !this.adMob) return;

    try {
      const adId = USE_TEST_ADS ? TEST_REWARDED_ID : PROD_REWARDED_ID;
      
      // Load rewarded ad
      await this.adMob.rewarded.load({
        id: adId,
        isTesting: USE_TEST_ADS
      });
      
      // Set up event listeners
      document.addEventListener('admob.rewarded.load', () => {
        console.log('Rewarded ad loaded');
        this.rewardedAdReady = true;
        
        // Update the ad store
        const adStore = useAdStore.getState();
        adStore.setRewardedAdReady(true);
      });
      
      document.addEventListener('admob.rewarded.loadfail', (event: any) => {
        console.error('Rewarded ad failed to load', event);
        // Try to reload after some time
        setTimeout(() => this.prepareRewarded(), 60000);
        
        // Update the ad store
        const adStore = useAdStore.getState();
        adStore.setRewardedAdReady(false);
      });
      
      document.addEventListener('admob.rewarded.reward', (event: any) => {
        console.log('Rewarded ad reward given', event);
        // Handle reward
        const gameStore = useRapperGame.getState();
        
        // Default reward: $5,000 virtual currency
        gameStore.addCash(5000);
        
        // Update stats
        const adStore = useAdStore.getState();
        adStore.incrementAdsWatched();
        adStore.addRewardedAdWatched();
      });
      
      document.addEventListener('admob.rewarded.close', () => {
        console.log('Rewarded ad closed');
        // Reload rewarded after it's closed
        this.prepareRewarded();
      });
    } catch (error) {
      console.error('Failed to prepare rewarded ad', error);
    }
  }

  // Show banner ad
  public async showBanner(): Promise<boolean> {
    if (!this.platformSupported || !this.adMob || !this.isInitialized) {
      console.log('AdMob not ready for showing banner');
      return false;
    }

    try {
      // Don't show ads for subscribers
      const gameStore = useRapperGame.getState();
      if (gameStore.subscriptionInfo.isSubscribed) {
        console.log('User is subscribed, not showing banner');
        return false;
      }
      
      if (!this.bannerAdReady) {
        await this.prepareBanner();
      }
      
      await this.adMob.banner.show();
      return true;
    } catch (error) {
      console.error('Failed to show banner ad', error);
      return false;
    }
  }

  // Hide banner ad
  public async hideBanner(): Promise<boolean> {
    if (!this.platformSupported || !this.adMob || !this.isInitialized) {
      return false;
    }

    try {
      await this.adMob.banner.hide();
      return true;
    } catch (error) {
      console.error('Failed to hide banner ad', error);
      return false;
    }
  }

  // Show interstitial ad
  public async showInterstitial(): Promise<boolean> {
    if (!this.platformSupported || !this.adMob || !this.isInitialized) {
      console.log('AdMob not ready for showing interstitial');
      return false;
    }

    // Don't show ads for subscribers
    const gameStore = useRapperGame.getState();
    if (gameStore.subscriptionInfo.isSubscribed) {
      console.log('User is subscribed, not showing interstitial');
      return false;
    }
    
    // Check cooldown period
    const now = Date.now();
    if (now - this.lastInterstitialTime < this.interstitialCooldown) {
      console.log('Interstitial ad on cooldown');
      return false;
    }

    try {
      if (!this.interstitialAdReady) {
        console.log('Interstitial not ready, preparing a new one');
        await this.prepareInterstitial();
        return false;
      }
      
      await this.adMob.interstitial.show();
      this.lastInterstitialTime = now;
      this.interstitialAdReady = false;
      
      // Update stats
      const adStore = useAdStore.getState();
      adStore.incrementAdsWatched();
      
      return true;
    } catch (error) {
      console.error('Failed to show interstitial ad', error);
      return false;
    }
  }

  // Show rewarded ad with callback
  public async showRewarded(onRewarded?: () => void): Promise<boolean> {
    if (!this.platformSupported || !this.adMob || !this.isInitialized) {
      console.log('AdMob not ready for showing rewarded ad');
      return false;
    }

    try {
      if (!this.rewardedAdReady) {
        console.log('Rewarded ad not ready, preparing a new one');
        await this.prepareRewarded();
        return false;
      }
      
      // Set up a one-time event listener for the reward callback
      if (onRewarded) {
        const rewardListener = (event: any) => {
          onRewarded();
          document.removeEventListener('admob.rewarded.reward', rewardListener);
        };
        document.addEventListener('admob.rewarded.reward', rewardListener);
      }
      
      await this.adMob.rewarded.show();
      this.rewardedAdReady = false;
      
      return true;
    } catch (error) {
      console.error('Failed to show rewarded ad', error);
      return false;
    }
  }

  // Check if rewarded ad is ready
  public isRewardedAdReady(): boolean {
    return this.rewardedAdReady;
  }

  // Check if the service is initialized
  public isServiceInitialized(): boolean {
    return this.isInitialized;
  }
}

// Export a singleton instance
export const adService = new AdService();