// PremiumStoreView.tsx - Google Play Store Integration for Rap Empire Simulator
import React, { useState, useEffect } from 'react';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { usePurchaseStore } from '@/lib/stores/usePurchaseStore';
import { useAdStore } from '@/lib/stores/useAdStore';
import { adService } from '@/lib/services/adService';
import { googlePlayService, PRODUCT_IDS } from '@/lib/services/googlePlayService';

const PremiumStoreView: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const gameStore = useRapperGame();
  const adStore = useAdStore();
  const purchaseStore = usePurchaseStore();
  
  // Check if service is available
  const mobileStoreAvailable = typeof window !== 'undefined' && 
                              window.cordova !== undefined && 
                              window.cordova.plugins?.inAppPurchase2 !== undefined;
  
  // Load products on component mount
  useEffect(() => {
    async function loadProducts() {
      try {
        if (mobileStoreAvailable && googlePlayService.isServiceReady()) {
          const availableProducts = await googlePlayService.getProducts();
          setProducts(availableProducts);
        } else {
          // When testing in browser, show mock products
          setProducts([
            { id: PRODUCT_IDS.SMALL_CASH_BUNDLE, title: 'Small Cash Bundle', description: '$10,000 in-game cash', price: '$0.99' },
            { id: PRODUCT_IDS.MEDIUM_CASH_BUNDLE, title: 'Medium Cash Bundle', description: '$50,000 in-game cash', price: '$4.99' },
            { id: PRODUCT_IDS.LARGE_CASH_BUNDLE, title: 'Large Cash Bundle', description: '$150,000 in-game cash', price: '$9.99' },
            { id: PRODUCT_IDS.XL_CASH_BUNDLE, title: 'XL Cash Bundle', description: '$500,000 in-game cash', price: '$19.99' },
            { id: PRODUCT_IDS.STANDARD_SUBSCRIPTION, title: 'Standard Monthly', description: 'No ads, weekly bonus, tier 4 songs', price: '$2.99/month' },
            { id: PRODUCT_IDS.PREMIUM_SUBSCRIPTION, title: 'Premium Monthly', description: 'All Standard features + fan base customization', price: '$4.99/month' },
            { id: PRODUCT_IDS.PLATINUM_SUBSCRIPTION, title: 'Platinum Monthly', description: 'All Premium features + 30% creative bonus', price: '$9.99/month' },
          ]);
        }
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Failed to load available products');
      } finally {
        setLoading(false);
      }
    }
    
    loadProducts();
  }, [mobileStoreAvailable]);
  
  // Purchase a product through Google Play Store
  const handlePurchase = async (productId: string) => {
    setSelectedProduct(productId);
    setPurchasing(true);
    setError(null);
    
    try {
      if (mobileStoreAvailable) {
        // Direct integration with Google Play Billing
        console.log(`Initiating Google Play purchase for ${productId}`);
        
        // Access the Google Play Billing client through Cordova
        const billingClient = window.cordova.plugins.inAppPurchase2;
        
        // Set up callbacks before purchase
        billingClient.when(productId).approved((product) => {
          console.log('Product approved:', product.id);
          // Process the purchase - handled by the service
        });
        
        billingClient.when(productId).error((error) => {
          console.error('Purchase error:', error);
          setError(`Purchase failed: ${error.message || 'Unknown error'}`);
        });
        
        // Start the purchase flow
        billingClient.order(productId);
      } else {
        // Mock purchase for browser testing
        await mockPurchase(productId);
      }
    } catch (err) {
      console.error('Purchase error:', err);
      setError('An error occurred during purchase. Please try again later.');
    } finally {
      setPurchasing(false);
      setSelectedProduct(null);
    }
  };
  
  // Mock purchase (for testing in browser)
  const mockPurchase = async (productId: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (productId.includes('monthly')) {
      // Handle subscription purchase
      const subscriptionType = 
        productId === PRODUCT_IDS.STANDARD_SUBSCRIPTION ? 'standard' :
        productId === PRODUCT_IDS.PREMIUM_SUBSCRIPTION ? 'premium' :
        productId === PRODUCT_IDS.PLATINUM_SUBSCRIPTION ? 'platinum' : 'none';
      
      // Update game state
      gameStore.updateSubscriptionStatus({
        isSubscribed: true,
        subscriptionType,
        subscriptionId: `mock-${Date.now()}`,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });
      
      // Add to purchase store
      purchaseStore.addSubscription({
        id: `mock-${Date.now()}`,
        productId,
        purchaseDate: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        active: true,
        autoRenewing: true
      });
      
      return true;
    } else {
      // Handle one-time purchase (virtual currency)
      let cashAmount = 0;
      
      switch (productId) {
        case PRODUCT_IDS.SMALL_CASH_BUNDLE:
          cashAmount = 10000;
          break;
        case PRODUCT_IDS.MEDIUM_CASH_BUNDLE:
          cashAmount = 50000;
          break;
        case PRODUCT_IDS.LARGE_CASH_BUNDLE:
          cashAmount = 150000;
          break;
        case PRODUCT_IDS.XL_CASH_BUNDLE:
          cashAmount = 500000;
          break;
        default:
          cashAmount = 1000;
      }
      
      // Add cash to player account
      gameStore.addCash(cashAmount);
      
      // Record the purchase
      purchaseStore.addPurchase({
        id: `mock-${Date.now()}`,
        productId,
        purchaseDate: new Date(),
        amount: cashAmount,
        currency: 'USD',
        status: 'completed'
      });
      
      return true;
    }
  };
  
  // Restore previous purchases
  const handleRestorePurchases = async () => {
    setRestoring(true);
    setError(null);
    
    try {
      if (mobileStoreAvailable) {
        // Real restore through Google Play
        await googlePlayService.restorePurchases();
      } else {
        // Mock restore for browser testing
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Purchases restored successfully (mock)');
      }
    } catch (err) {
      console.error('Restore error:', err);
      setError('An error occurred while restoring purchases');
    } finally {
      setRestoring(false);
    }
  };
  
  // Show rewarded ad
  const handleWatchAd = async () => {
    if (adService.isRewardedAdReady()) {
      await adService.showRewarded(() => {
        alert('Thanks for watching! You earned $5,000.');
      });
    } else {
      alert('No rewarded ads available right now. Please try again later.');
    }
  };
  
  // Group products by type for easier display
  const cashProducts = products.filter(p => 
    p.id === PRODUCT_IDS.SMALL_CASH_BUNDLE || 
    p.id === PRODUCT_IDS.MEDIUM_CASH_BUNDLE || 
    p.id === PRODUCT_IDS.LARGE_CASH_BUNDLE || 
    p.id === PRODUCT_IDS.XL_CASH_BUNDLE
  );
  
  const subscriptionProducts = products.filter(p => 
    p.id === PRODUCT_IDS.STANDARD_SUBSCRIPTION || 
    p.id === PRODUCT_IDS.PREMIUM_SUBSCRIPTION || 
    p.id === PRODUCT_IDS.PLATINUM_SUBSCRIPTION
  );
  
  // Format subscription products
  const formatSubscriptionProduct = (product: any) => {
    const isStandard = product.id === PRODUCT_IDS.STANDARD_SUBSCRIPTION;
    const isPremium = product.id === PRODUCT_IDS.PREMIUM_SUBSCRIPTION;
    const isPlatinum = product.id === PRODUCT_IDS.PLATINUM_SUBSCRIPTION;
    
    const features = [];
    
    // Common features
    features.push('No Ads');
    features.push('Weekly Cash Bonus');
    
    if (isStandard) {
      features.push('Weekly $5,000 Bonus');
      features.push('10% Creative Bonus');
      features.push('Access to Tier 4 Songs');
    }
    
    if (isPremium || isPlatinum) {
      features.push('Weekly $15,000 Bonus');
      features.push('20% Creative Bonus');
      features.push('Access to Tier 4 & 5 Songs');
      features.push('Fan Base Customization');
    }
    
    if (isPlatinum) {
      features.push('Weekly $50,000 Bonus');
      features.push('30% Creative Bonus');
      features.push('Exclusive Platinum Features');
    }
    
    return {
      ...product,
      features
    };
  };
  
  const formattedSubscriptions = subscriptionProducts.map(formatSubscriptionProduct);
  
  return (
    <div className="premium-store-container p-4">
      <h1 className="text-2xl font-bold mb-6">Rap Empire Store</h1>
      
      {/* Error display */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Loading state */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4">Loading store products...</p>
        </div>
      ) : (
        <div>
          {/* Subscriptions Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Premium Subscriptions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formattedSubscriptions.map(product => (
                <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-lg">{product.title}</h3>
                  <p className="text-green-600 font-bold my-2">{product.price}</p>
                  <ul className="list-disc list-inside mb-4 text-sm">
                    {product.features.map((feature: string, index: number) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handlePurchase(product.id)}
                    disabled={purchasing || gameStore.subscriptionInfo.isSubscribed}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {purchasing && selectedProduct === product.id 
                      ? 'Processing...' 
                      : gameStore.subscriptionInfo.isSubscribed 
                        ? 'Subscribed' 
                        : 'Subscribe'}
                  </button>
                </div>
              ))}
            </div>
          </section>
          
          {/* Cash Bundles Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Cash Bundles</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {cashProducts.map(product => (
                <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <h3 className="font-bold">{product.title}</h3>
                  <p className="text-green-600 font-bold my-2">{product.price}</p>
                  <p className="text-sm mb-4">{product.description}</p>
                  <button
                    onClick={() => handlePurchase(product.id)}
                    disabled={purchasing}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {purchasing && selectedProduct === product.id ? 'Processing...' : 'Buy'}
                  </button>
                </div>
              ))}
            </div>
          </section>
          
          {/* Free Cash Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Free Cash</h2>
            <div className="border rounded-lg p-4">
              <h3 className="font-bold">Watch an Ad</h3>
              <p className="my-2">Watch a video ad to earn $5,000 in-game cash</p>
              <button
                onClick={handleWatchAd}
                disabled={!adStore.rewardedAdReady || gameStore.subscriptionInfo.isSubscribed}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {gameStore.subscriptionInfo.isSubscribed 
                  ? 'Not Available (Subscribed)' 
                  : adStore.rewardedAdReady 
                    ? 'Watch Ad for Cash' 
                    : 'No Ads Available'}
              </button>
            </div>
          </section>
          
          {/* Restore Purchases Button */}
          <div className="text-center mt-8">
            <button
              onClick={handleRestorePurchases}
              disabled={restoring}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {restoring ? 'Restoring...' : 'Restore Purchases'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumStoreView;