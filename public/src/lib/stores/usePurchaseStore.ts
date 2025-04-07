import { create } from 'zustand';
import { PurchaseItem, VirtualCurrencyPackage, GameState, Song } from '@/lib/types';
import { useRapperGame } from './useRapperGame';
import { apiRequest } from '@/lib/queryClient';

// Define available products
const CURRENCY_PACKAGES: VirtualCurrencyPackage[] = [
  {
    id: 'cash_10k',
    productId: 'com.rappersim.cash.10k',
    title: "Starter Pack",
    amount: "10,000",
    price: "0.99",
    formattedPrice: "$0.99"
  },
  {
    id: 'cash_50k',
    productId: 'com.rappersim.cash.50k',
    title: "Producer Pack",
    amount: "50,000",
    price: "4.99",
    formattedPrice: "$4.99"
  },
  {
    id: 'cash_100k',
    productId: 'com.rappersim.cash.100k',
    title: "Artist Pack",
    amount: "100,000",
    price: "9.99",
    formattedPrice: "$9.99",
    isBestValue: true
  },
  {
    id: 'cash_500k',
    productId: 'com.rappersim.cash.500k',
    title: "Mogul Pack",
    amount: "500,000",
    price: "49.99",
    formattedPrice: "$49.99"
  },
  {
    id: 'cash_1m',
    productId: 'com.rappersim.cash.1m',
    title: "Empire Pack",
    amount: "1,000,000",
    price: "99.99",
    formattedPrice: "$99.99"
  }
];

const PREMIUM_ITEMS: PurchaseItem[] = [
  {
    id: 'platinum_producer',
    productId: 'com.rappersim.platinum_producer',
    title: "Platinum Producer Pack",
    description: "Unlock the full potential of your music production with premium tools and features.",
    price: "19.99",
    formattedPrice: "$19.99",
    type: "premium_feature",
    benefits: [
      "Unlock tier 5 song production",
      "Premium video production options",
      "Faster career progression",
      "More collaboration opportunities",
      "Exclusive studio options"
    ],
    discountPercentage: 20
  }
];

const SUBSCRIPTIONS: PurchaseItem[] = [
  {
    id: 'standard_subscription',
    productId: 'com.rappersim.standard_subscription',
    title: "Standard Subscription",
    description: "Get exclusive benefits and boosted career progression.",
    price: "4.99",
    formattedPrice: "$4.99",
    type: "subscription",
    benefits: [
      "Ad-free experience",
      "Exclusive songs access",
      "Priority support",
      "2x progression rate",
      "Monthly bonus of 10,000 cash"
    ]
  },
  {
    id: 'premium_subscription',
    productId: 'com.rappersim.premium_subscription',
    title: "Premium Subscription",
    description: "Elevate your career with premium features and bonuses.",
    price: "9.99",
    formattedPrice: "$9.99",
    type: "subscription",
    benefits: [
      "All Standard features",
      "Premium songs and beats",
      "Advanced career statistics",
      "2x in-game currency rewards",
      "Tier 4-5 song production",
      "30% more streams on all songs"
    ]
  },
  {
    id: 'platinum_subscription',
    productId: 'com.rappersim.platinum_subscription',
    title: "Platinum Subscription",
    description: "The ultimate experience with maximum benefits and exclusive content.",
    price: "19.99",
    formattedPrice: "$19.99",
    type: "subscription",
    benefits: [
      "All Premium features",
      "Exclusive platinum content",
      "Unlimited song recordings",
      "3x in-game currency rewards",
      "Early access to new features",
      "50% more streams on all songs",
      "Access to all premium music videos",
      "Exclusive collaborations with top artists"
    ]
  }
];

interface SelectedItemState {
  product: PurchaseItem | VirtualCurrencyPackage;
  imageUrl?: string;
  title?: string;        // Added for UI components
  description?: string;  // Added for UI components
  formattedPrice?: string; // Added for UI components
}

interface PurchaseState {
  // Products
  currencyPackages: VirtualCurrencyPackage[];
  premiumItems: PurchaseItem[];
  subscriptions: PurchaseItem[];
  
  // Purchase flow state
  selectedItem: SelectedItemState | null;
  lastPurchasedItem: PurchaseItem | null;
  showPurchaseConfirmation: boolean;
  showSuccessModal: boolean;
  showErrorModal: boolean;
  errorMessage: string | null;
  currentPurchaseError: string | null; // For backwards compatibility
  loading: boolean;
  
  // Actions
  openPurchaseModal: (item: PurchaseItem | VirtualCurrencyPackage) => void;
  closePurchaseModal: () => void;
  processPurchase: () => Promise<void>;
  purchaseCurrency: (pack: VirtualCurrencyPackage) => void;
  confirmPurchase: () => Promise<void>;
  cancelPurchase: () => void;
  closeSuccessModal: () => void;
  closeErrorModal: () => void;
}

// Helper to revitalize songs at maximum value
const revitalizeSong = (song: Song): Song => {
  // Only process songs that are released but no longer active (at max value/streams)
  if (song.released && !song.isActive) {
    return {
      ...song,
      isActive: true, // Reactivate the song
      performanceType: 'comeback', // Set it as a comeback to get a boost
      performanceStatusWeek: 0 // Reset the performance status week
    };
  }
  return song;
};

export const usePurchaseStore = create<PurchaseState>((set, get) => ({
  // Products
  currencyPackages: CURRENCY_PACKAGES,
  premiumItems: PREMIUM_ITEMS,
  subscriptions: SUBSCRIPTIONS,
  
  // Purchase flow state
  selectedItem: null,
  lastPurchasedItem: null,
  showPurchaseConfirmation: false,
  showSuccessModal: false,
  showErrorModal: false,
  errorMessage: null,
  loading: false,
  currentPurchaseError: null, // Deprecated, will be removed
  
  // Actions for UI components
  openPurchaseModal: (item: PurchaseItem | VirtualCurrencyPackage) => {
    set({ 
      selectedItem: { product: item },
      showPurchaseConfirmation: true
    });
  },
  
  closePurchaseModal: () => {
    set({ 
      showPurchaseConfirmation: false,
      selectedItem: null
    });
  },
  
  processPurchase: async () => {
    const { selectedItem } = get();
    if (!selectedItem) return;
    
    set({ loading: true });
    
    try {
      const product = selectedItem.product;
      const productId = 'productId' in product ? product.productId : '';
      
      // Generate a unique transaction ID
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Call server to verify the purchase (in production, this would include real payment details)
      const verificationResponse = await apiRequest('POST', '/api/purchases/verify', {
        productId,
        transactionId,
        platform: 'web', // In production app, this would be 'android' or 'ios'
        // In production, purchaseToken from Google Play or receiptData from App Store would be included
        metadata: {
          purchaseTime: new Date().toISOString()
        }
      });
      
      const verificationResult = await verificationResponse.json();
      
      if (!verificationResult.success || !verificationResult.verified) {
        throw new Error('Purchase verification failed');
      }
      
      // If verification succeeded, apply benefits based on purchase type
      const gameState = useRapperGame.getState();
      
      if ('type' in product) {
        // Handle premium item or subscription
        const item = product as PurchaseItem;
        
        if (item.type === 'premium_feature') {
          // Apply premium feature benefits
          const updatedState = {
            ...gameState,
            stats: {
              ...gameState.stats,
              creativity: Math.min(100, gameState.stats.creativity + 15),
              marketing: Math.min(100, gameState.stats.marketing + 10),
            },
            // Revitalize inactive songs (fix for songs at max value)
            songs: gameState.songs.map(revitalizeSong)
          };
          gameState.loadGame(updatedState);
        } 
        else if (item.type === 'subscription') {
          // Determine subscription type based on product ID
          let subscriptionType: 'standard' | 'premium' | 'platinum' = 'standard';
          
          if (item.productId.includes('premium')) {
            subscriptionType = 'premium';
          } else if (item.productId.includes('platinum')) {
            subscriptionType = 'platinum';
          }
          
          // Update subscription status in the game state
          gameState.updateSubscriptionStatus(
            true, 
            subscriptionType,
            `subscription_${Date.now()}`, // Mock subscription ID
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
          );
          
          // Revitalize inactive songs as part of the subscription perks
          const updatedState = {
            ...gameState,
            songs: gameState.songs.map(revitalizeSong)
          };
          
          gameState.loadGame(updatedState);
        }
        
        // Store last purchased item for success modal
        set({ lastPurchasedItem: item });
      } 
      else {
        // Handle currency package
        const currencyPack = product as VirtualCurrencyPackage;
        const amount = parseInt(currencyPack.amount.replace(/,/g, ''));
        
        const updatedState = {
          ...gameState,
          stats: {
            ...gameState.stats,
            wealth: gameState.stats.wealth + amount
          }
        };
        gameState.loadGame(updatedState);
      }
      
      // Show success modal
      set({ 
        showPurchaseConfirmation: false,
        showSuccessModal: true,
        loading: false
      });
      
    } catch (error) {
      // Handle error
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
      console.error('Purchase error:', errorMsg);
      
      set({ 
        showPurchaseConfirmation: false,
        showErrorModal: true,
        errorMessage: errorMsg,
        currentPurchaseError: errorMsg,
        loading: false
      });
    }
  },
  
  purchaseCurrency: (pack: VirtualCurrencyPackage) => {
    set({ 
      selectedItem: { product: pack },
      showPurchaseConfirmation: true
    });
  },
  
  // Legacy methods for compatibility
  initiatePurchase: (productId: string, imageUrl?: string) => {
    const { currencyPackages, premiumItems, subscriptions } = get();
    
    // Find the product across all product types
    const product = 
      currencyPackages.find(p => p.productId === productId) ||
      premiumItems.find(p => p.productId === productId) ||
      subscriptions.find(p => p.productId === productId);
    
    if (product) {
      set({ 
        selectedItem: { product, imageUrl },
        showPurchaseConfirmation: true
      });
    }
  },
  
  confirmPurchase: async () => {
    const { selectedItem } = get();
    
    if (!selectedItem) return;
    
    set({ loading: true });
    
    try {
      const product = selectedItem.product;
      const productId = 'productId' in product ? product.productId : '';
      
      // Generate a unique transaction ID
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Call server to verify the purchase (in production, this would include real payment details)
      const verificationResponse = await apiRequest('POST', '/api/purchases/verify', {
        productId,
        transactionId,
        platform: 'web', // In production app, this would be 'android' or 'ios'
        // In production, purchaseToken from Google Play or receiptData from App Store would be included
        metadata: {
          purchaseTime: new Date().toISOString(),
          method: 'confirmPurchase' // Track which purchase flow was used
        }
      });
      
      const verificationResult = await verificationResponse.json();
      
      if (!verificationResult.success || !verificationResult.verified) {
        throw new Error('Purchase verification failed');
      }
      
      // If verification succeeded, apply benefits based on purchase type
      const gameState = useRapperGame.getState();
      
      if ('type' in product) {
        // Handle premium item or subscription
        const item = product as PurchaseItem;
        
        if (item.type === 'premium_feature') {
          // Apply premium feature benefits
          const updatedState = {
            ...gameState,
            stats: {
              ...gameState.stats,
              creativity: Math.min(100, gameState.stats.creativity + 15),
              marketing: Math.min(100, gameState.stats.marketing + 10),
            },
            // Revitalize inactive songs (fix for songs at max value)
            songs: gameState.songs.map(revitalizeSong)
          };
          gameState.loadGame(updatedState);
        } 
        else if (item.type === 'subscription') {
          // Determine subscription type based on product ID
          let subscriptionType: 'standard' | 'premium' | 'platinum' = 'standard';
          
          if (item.productId.includes('premium')) {
            subscriptionType = 'premium';
          } else if (item.productId.includes('platinum')) {
            subscriptionType = 'platinum';
          }
          
          // Update subscription status in the game state
          gameState.updateSubscriptionStatus(
            true, 
            subscriptionType,
            `subscription_${Date.now()}`, // Mock subscription ID
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
          );
          
          // Revitalize inactive songs as part of the subscription perks
          const updatedState = {
            ...gameState,
            songs: gameState.songs.map(revitalizeSong)
          };
          
          gameState.loadGame(updatedState);
        }
      } 
      else {
        // Handle currency package
        const currencyPack = product as VirtualCurrencyPackage;
        const amount = parseInt(currencyPack.amount.replace(/,/g, ''));
        
        const updatedState = {
          ...gameState,
          stats: {
            ...gameState.stats,
            wealth: gameState.stats.wealth + amount
          }
        };
        gameState.loadGame(updatedState);
      }
      
      // Show success modal
      set({ 
        showPurchaseConfirmation: false,
        showSuccessModal: true,
        loading: false
      });
      
    } catch (error) {
      // Handle error
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
      console.error('Purchase confirmation error:', errorMsg);
      
      set({ 
        showPurchaseConfirmation: false,
        showErrorModal: true,
        errorMessage: errorMsg,
        currentPurchaseError: errorMsg,
        loading: false
      });
    }
  },
  
  cancelPurchase: () => {
    set({ 
      showPurchaseConfirmation: false,
      selectedItem: null
    });
  },
  
  closeSuccessModal: () => {
    set({ 
      showSuccessModal: false,
      selectedItem: null
    });
  },
  
  closeErrorModal: () => {
    set({ 
      showErrorModal: false,
      errorMessage: null,
      currentPurchaseError: null
    });
  }
}));