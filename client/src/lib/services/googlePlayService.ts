// Google Play In-App Purchase Service
import { useRapperGame } from '../stores/useRapperGame';
import { usePurchaseStore } from '../stores/usePurchaseStore';
import { useEnergyStore } from '../stores/useEnergyStore';

// Define types for Google Play purchases
export interface GooglePlayPurchase {
  productId: string;
  purchaseToken: string;
  orderId: string;
  purchaseTime: number;
  purchaseState: number; // 0: purchased, 1: canceled, 2: pending
  acknowledged: boolean;
}

export interface GooglePlaySubscription extends GooglePlayPurchase {
  autoRenewing: boolean;
  expiryTimeMillis: number;
}

// Product IDs for in-app products
export const PRODUCT_IDS = {
  // One-time purchases
  SMALL_CASH_BUNDLE: 'com.rappersim.smallcash',
  MEDIUM_CASH_BUNDLE: 'com.rappersim.mediumcash',
  LARGE_CASH_BUNDLE: 'com.rappersim.largecash',
  XL_CASH_BUNDLE: 'com.rappersim.xlcash',
  
  // Energy purchases
  SMALL_ENERGY: 'com.rappersim.energy.small',  // 50 energy
  MEDIUM_ENERGY: 'com.rappersim.energy.medium', // 150 energy
  LARGE_ENERGY: 'com.rappersim.energy.large',  // 500 energy
  UNLIMITED_ENERGY_24H: 'com.rappersim.energy.unlimited24h', // Unlimited energy for 24 hours

  // Subscriptions
  STANDARD_SUBSCRIPTION: 'com.rappersim.standard.monthly',
  PREMIUM_SUBSCRIPTION: 'com.rappersim.premium.monthly',
  PLATINUM_SUBSCRIPTION: 'com.rappersim.platinum.monthly',
};

// Google Play IAP Service
class GooglePlayService {
  private billingClient: any = null;
  private productDetails: Map<string, any> = new Map();
  private isConnected: boolean = false;
  private isReady: boolean = false;
  private platformSupported: boolean = false;

  constructor() {
    // Check if we're running in a mobile environment with Google Play support
    this.platformSupported = 
      typeof window !== 'undefined' && 
      window.cordova !== undefined && 
      window.cordova.plugins?.inAppPurchase2 !== undefined;
    
    if (this.platformSupported) {
      this.initBillingClient();
    } else {
      console.log('Google Play Billing not supported in this environment');
    }
  }

  // Initialize the billing client
  private async initBillingClient(): Promise<void> {
    if (!this.platformSupported) return;

    try {
      const store = window.cordova.plugins.inAppPurchase2;

      // Setup the store
      store.verbosity = store.DEBUG;

      // Register products
      Object.values(PRODUCT_IDS).forEach(productId => {
        const isSubscription = productId.includes('.monthly');
        
        store.register({
          id: productId,
          type: isSubscription ? store.PAID_SUBSCRIPTION : store.CONSUMABLE
        });

        // Setup listeners for this product
        store.when(productId).approved(product => {
          this.handleProductApproved(product);
        });

        store.when(productId).verified(product => {
          console.log('Product verified:', product.id);
        });

        store.when(productId).finished(product => {
          console.log('Product finished:', product.id);
        });

        store.when(productId).owned(product => {
          if (isSubscription) {
            this.handleSubscriptionOwned(product);
          }
        });

        store.when(productId).error(error => {
          console.error('Product error:', error);
        });
      });

      // General error handler
      store.error(error => {
        console.error('Store error:', error);
      });

      // Initialize the store
      store.refresh();
      
      this.isConnected = true;
      this.isReady = true;
      console.log('Google Play Billing client initialized');
    } catch (error) {
      console.error('Failed to initialize Google Play Billing', error);
    }
  }

  // Check if the billing client is ready
  public isServiceReady(): boolean {
    return this.isReady;
  }

  // Get available products
  public async getProducts(): Promise<any[]> {
    if (!this.platformSupported || !this.isReady) {
      return [];
    }

    try {
      const store = window.cordova.plugins.inAppPurchase2;
      const products = [];

      for (const productId of Object.values(PRODUCT_IDS)) {
        const product = store.get(productId);
        if (product && product.state === store.VALID) {
          products.push(product);
        }
      }

      return products;
    } catch (error) {
      console.error('Failed to get products', error);
      return [];
    }
  }

  // Purchase a product
  public async purchaseProduct(productId: string): Promise<boolean> {
    if (!this.platformSupported || !this.isReady) {
      console.error('Google Play Billing not ready or supported');
      return false;
    }

    try {
      const store = window.cordova.plugins.inAppPurchase2;
      
      // Trigger the purchase flow
      store.order(productId);
      return true;
    } catch (error) {
      console.error('Failed to initiate purchase', error);
      return false;
    }
  }

  // Handle approved purchases
  private async handleProductApproved(product: any): Promise<void> {
    const store = window.cordova.plugins.inAppPurchase2;
    const purchaseStore = usePurchaseStore.getState();
    
    try {
      // Create purchase data to send to backend for verification
      const purchaseData = {
        productId: product.id,
        purchaseToken: product.transaction.receipt,
        orderId: product.transaction.id,
        purchaseTime: Date.now(),
        platform: 'google_play'
      };
      
      // Call our server to verify the purchase
      const response = await fetch('/api/purchases/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update local purchase state
        const isSubscription = product.id.includes('.monthly');
        const isEnergyPurchase = product.id.includes('energy');
        
        if (isSubscription) {
          const subscriptionType = 
            product.id === PRODUCT_IDS.STANDARD_SUBSCRIPTION ? 'standard' :
            product.id === PRODUCT_IDS.PREMIUM_SUBSCRIPTION ? 'premium' :
            product.id === PRODUCT_IDS.PLATINUM_SUBSCRIPTION ? 'platinum' : 'none';
          
          // Update subscription status in the game state
          const gameStore = useRapperGame.getState();
          gameStore.updateSubscription({
            isSubscribed: true,
            subscriptionType,
            subscriptionId: product.transaction.id,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            benefits: this.getSubscriptionBenefits(subscriptionType)
          });
          
          purchaseStore.addSubscription({
            id: product.transaction.id,
            productId: product.id,
            purchaseDate: new Date(),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            active: true,
            autoRenewing: true
          });
        } else if (isEnergyPurchase) {
          // Handle energy purchase
          const energyAmount = this.getEnergyAmountForProduct(product.id);
          
          if (energyAmount > 0) {
            // Import from useEnergyStore
            const energyStore = require('../stores/useEnergyStore').useEnergyStore.getState();
            
            // Add energy to the player's account
            energyStore.addEnergy(energyAmount);
            
            // Record the purchase
            purchaseStore.addPurchase({
              id: product.transaction.id,
              productId: product.id,
              purchaseDate: new Date(),
              amount: energyAmount,
              currency: 'Energy',
              status: 'completed'
            });
          }
        } else {
          // Handle one-time purchase (virtual currency or energy)
          if (product.id.includes('energy')) {
            // Handle energy purchase
            const energyAmount = this.getEnergyAmountForProduct(product.id);
            
            // Import from useEnergyStore
            const energyStore = require('../stores/useEnergyStore').useEnergyStore.getState();
            
            if (product.id.includes('unlimited24h')) {
              // Set unlimited energy for 24 hours
              const expiryTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours in milliseconds
              energyStore.setUnlimitedEnergyTimer(expiryTime);
            } else if (energyAmount > 0) {
              // Add energy to the player's account
              energyStore.addEnergy(energyAmount);
            }
            
            // Record the purchase
            purchaseStore.addPurchase({
              id: product.transaction.id,
              productId: product.id,
              purchaseDate: new Date(),
              amount: energyAmount,
              currency: 'Energy',
              status: 'completed'
            });
          } else {
            // Handle virtual currency purchase
            const cashAmount = this.getCashAmountForProduct(product.id);
            
            if (cashAmount > 0) {
              // Add cash to the player's account
              const gameStore = useRapperGame.getState();
              gameStore.addCash(cashAmount);
              
              // Record the purchase
              purchaseStore.addPurchase({
                id: product.transaction.id,
                productId: product.id,
                purchaseDate: new Date(),
                amount: cashAmount,
                currency: 'USD',
                status: 'completed'
              });
            }
          }
        }
        
        // Finish the transaction
        product.finish();
      } else {
        console.error('Purchase verification failed:', result.message);
        alert('Purchase could not be verified. Please try again later.');
      }
    } catch (error) {
      console.error('Error handling purchase', error);
      alert('There was an error processing your purchase. Please try again later.');
    }
  }

  // Handle owned subscriptions
  private handleSubscriptionOwned(product: any): void {
    const isSubscription = product.id.includes('.monthly');
    if (!isSubscription) return;
    
    const subscriptionType = 
      product.id === PRODUCT_IDS.STANDARD_SUBSCRIPTION ? 'standard' :
      product.id === PRODUCT_IDS.PREMIUM_SUBSCRIPTION ? 'premium' :
      product.id === PRODUCT_IDS.PLATINUM_SUBSCRIPTION ? 'platinum' : 'none';
    
    // Update subscription status in the game state
    const gameStore = useRapperGame.getState();
    gameStore.updateSubscription({
      isSubscribed: true,
      subscriptionType,
      subscriptionId: product.transaction?.id,
      expiresAt: product.expiryDate ? new Date(product.expiryDate) : undefined,
      benefits: this.getSubscriptionBenefits(subscriptionType)
    });
  }

  // Restore purchases
  public async restorePurchases(): Promise<boolean> {
    if (!this.platformSupported || !this.isReady) {
      console.error('Google Play Billing not ready or supported');
      return false;
    }

    try {
      const store = window.cordova.plugins.inAppPurchase2;
      store.refresh();
      return true;
    } catch (error) {
      console.error('Failed to restore purchases', error);
      return false;
    }
  }

  // Get cash amount for product
  private getCashAmountForProduct(productId: string): number {
    switch (productId) {
      case PRODUCT_IDS.SMALL_CASH_BUNDLE:
        return 10000; // $0.99
      case PRODUCT_IDS.MEDIUM_CASH_BUNDLE:
        return 50000; // $4.99
      case PRODUCT_IDS.LARGE_CASH_BUNDLE:
        return 150000; // $9.99
      case PRODUCT_IDS.XL_CASH_BUNDLE:
        return 500000; // $19.99
      default:
        return 0;
    }
  }
  
  // Get energy amount for product
  private getEnergyAmountForProduct(productId: string): number {
    switch (productId) {
      case PRODUCT_IDS.SMALL_ENERGY:
        return 50; // Small energy package
      case PRODUCT_IDS.MEDIUM_ENERGY:
        return 150; // Medium energy package
      case PRODUCT_IDS.LARGE_ENERGY:
        return 500; // Large energy package
      case PRODUCT_IDS.UNLIMITED_ENERGY_24H:
        return 0; // Unlimited energy is handled separately
      default:
        // Also handle cases where we get the raw ID string instead of the constant
        if (productId.includes('energy.small')) return 50;
        if (productId.includes('energy.medium')) return 150;
        if (productId.includes('energy.large')) return 500;
        return 0;
    }
  }

  // Get subscription benefits
  private getSubscriptionBenefits(subscriptionType: string): string[] {
    const benefits = [];

    // Common benefits
    benefits.push('No ads');
    benefits.push('Weekly cash bonus');

    if (subscriptionType === 'standard') {
      benefits.push('Weekly $5,000 bonus');
      benefits.push('10% creative bonus');
      benefits.push('Access to tier 4 songs');
    }
    
    if (subscriptionType === 'premium' || subscriptionType === 'platinum') {
      benefits.push('Weekly $15,000 bonus');
      benefits.push('20% creative bonus');
      benefits.push('Access to tier 4 & 5 songs');
      benefits.push('Fan base customization');
    }
    
    if (subscriptionType === 'platinum') {
      benefits.push('Weekly $50,000 bonus');
      benefits.push('30% creative bonus');
      benefits.push('Exclusive platinum features');
      benefits.push('Priority support');
    }

    return benefits;
  }
}

// Export a singleton instance
export const googlePlayService = new GooglePlayService();