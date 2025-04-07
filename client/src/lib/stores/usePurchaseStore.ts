// usePurchaseStore.ts
import { create } from 'zustand';

// Type definition for Google Play Product
interface GooglePlayProduct {
  productId: string;
  type: 'inapp' | 'subs';
  price: string;
  title: string;
  description: string;
  subscriptionPeriod?: string;
}

// Type definition for purchase history item
interface PurchaseHistoryItem {
  purchaseToken: string;
  productId: string;
  transactionDate: Date;
  status: 'pending' | 'completed' | 'refunded' | 'failed';
}

// Purchase store state interface
export interface PurchaseState {
  products: GooglePlayProduct[];
  purchaseHistory: PurchaseHistoryItem[];
  isLoadingProducts: boolean;
  isPurchasing: boolean;
  error: string | null;
  
  // Methods
  initializeStore: (userId: number) => Promise<boolean>;
  loadProducts: (productIds: string[]) => Promise<GooglePlayProduct[]>;
  makePurchase: (productId: string, userId: number) => Promise<boolean>;
  getPurchaseHistory: (userId: number) => Promise<PurchaseHistoryItem[]>;
  clearError: () => void;
}

export const usePurchaseStore = create<PurchaseState>((set, get) => ({
  products: [],
  purchaseHistory: [],
  isLoadingProducts: false,
  isPurchasing: false,
  error: null,
  
  // Initialize the purchase store
  initializeStore: async (userId: number) => {
    try {
      console.log('Initializing purchase store for user:', userId);
      // In a real app, this would connect to the app store
      // Simulate a successful initialization
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Load purchase history for this user
      const history = await get().getPurchaseHistory(userId);
      set({ purchaseHistory: history });
      
      return true;
    } catch (error) {
      console.error('Error initializing purchase store:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to initialize store' });
      return false;
    }
  },
  
  // Load products from the store
  loadProducts: async (productIds: string[]) => {
    set({ isLoadingProducts: true, error: null });
    
    try {
      // Simulate API call to load products
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create mock products based on the product IDs
      const mockProducts: GooglePlayProduct[] = productIds.map(id => {
        // Determine product type, pricing, and other details based on ID
        const isSub = id.includes('subscription');
        const tier = id.includes('premium') ? 'Premium' : 
                    id.includes('platinum') ? 'Platinum' : 'Standard';
        
        let price = '4.99';
        let title = 'Unknown Product';
        let description = 'Product description';
        let subscriptionPeriod = undefined;
        
        // Subscription products
        if (isSub) {
          if (id.includes('monthly')) {
            price = tier === 'Standard' ? '4.99' : tier === 'Premium' ? '9.99' : '19.99';
            subscriptionPeriod = 'P1M'; // 1 month
          } else if (id.includes('quarterly')) {
            price = tier === 'Standard' ? '12.99' : tier === 'Premium' ? '24.99' : '49.99';
            subscriptionPeriod = 'P3M'; // 3 months
          } else if (id.includes('yearly')) {
            price = tier === 'Standard' ? '39.99' : tier === 'Premium' ? '89.99' : '179.99';
            subscriptionPeriod = 'P1Y'; // 1 year
          }
          
          title = `${tier} ${subscriptionPeriod === 'P1M' ? 'Monthly' : 
                           subscriptionPeriod === 'P3M' ? 'Quarterly' : 'Yearly'} Subscription`;
          description = `${tier} tier subscription with exclusive benefits`;
        }
        
        // Virtual currency products
        else if (id.includes('currency')) {
          if (id.includes('small')) {
            price = '4.99';
            title = 'Small Cash Pack';
            description = '10,000 in-game currency';
          } else if (id.includes('medium')) {
            price = '9.99';
            title = 'Medium Cash Pack';
            description = '50,000 in-game currency + 5,000 bonus';
          } else if (id.includes('large')) {
            price = '19.99';
            title = 'Large Cash Pack';
            description = '200,000 in-game currency + 30,000 bonus';
          } else if (id.includes('xl')) {
            price = '49.99';
            title = 'XL Cash Pack';
            description = '1,000,000 in-game currency + 200,000 bonus';
          }
        }
        
        // Energy products
        else if (id.includes('energy')) {
          if (id.includes('small')) {
            price = '1.99';
            title = 'Small Energy Pack';
            description = '50 energy units';
          } else if (id.includes('medium')) {
            price = '4.99';
            title = 'Medium Energy Pack';
            description = '150 energy units + 20 bonus';
          } else if (id.includes('large')) {
            price = '9.99';
            title = 'Large Energy Pack';
            description = '500 energy units + 100 bonus';
          } else if (id.includes('unlimited24h')) {
            price = '4.99';
            title = '24h Unlimited Energy';
            description = 'Unlimited energy for 24 hours';
          }
        }
        
        // Ad removal
        else if (id.includes('noads')) {
          price = '2.99';
          title = 'Remove Ads';
          description = 'Permanently remove all advertisements';
        }
        
        // Featured content
        else if (id.includes('feature')) {
          if (id.includes('exlusive_beats')) {
            price = '7.99';
            title = 'Premium Beats Collection';
            description = 'Unlock exclusive premium beats';
          } else if (id.includes('platinum_songs')) {
            price = '14.99';
            title = 'Platinum Song Templates';
            description = 'Access platinum-tier song templates';
          } else if (id.includes('advanced_marketing')) {
            price = '9.99';
            title = 'Advanced Marketing Tools';
            description = 'Professional marketing strategies and tools';
          }
        }
        
        return {
          productId: id,
          type: isSub ? 'subs' : 'inapp',
          price,
          title,
          description,
          subscriptionPeriod
        };
      });
      
      set({ products: mockProducts, isLoadingProducts: false });
      return mockProducts;
    } catch (error) {
      console.error('Error loading products:', error);
      set({ 
        isLoadingProducts: false, 
        error: error instanceof Error ? error.message : 'Failed to load products' 
      });
      return [];
    }
  },
  
  // Make a purchase
  makePurchase: async (productId: string, userId: number) => {
    set({ isPurchasing: true, error: null });
    
    try {
      // In a real app, this would connect to the app store's purchase API
      // Simulate a successful purchase
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Generate a unique purchase token
      const purchaseToken = `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create purchase history item
      const purchaseItem: PurchaseHistoryItem = {
        purchaseToken,
        productId,
        transactionDate: new Date(),
        status: 'completed',
      };
      
      // Update purchase history
      set({ 
        purchaseHistory: [...get().purchaseHistory, purchaseItem],
        isPurchasing: false
      });
      
      console.log(`Purchase completed for ${productId}:`, purchaseItem);
      
      // In a real app, we would verify the purchase with the backend here
      // await verifyPurchase(userId, purchaseToken, productId);
      
      return true;
    } catch (error) {
      console.error('Purchase error:', error);
      set({ 
        isPurchasing: false, 
        error: error instanceof Error ? error.message : 'Purchase failed' 
      });
      return false;
    }
  },
  
  // Get purchase history for a user
  getPurchaseHistory: async (userId: number) => {
    try {
      // In a real app, this would fetch from the backend
      // For demo purposes, return the current state or empty array
      return get().purchaseHistory;
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch purchase history' });
      return [];
    }
  },
  
  // Clear any error
  clearError: () => set({ error: null })
}));