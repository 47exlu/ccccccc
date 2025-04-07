// ImprovedStorePanel.tsx - Fixed version without infinite update loop
import { useState, useEffect, useCallback } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertCircle, 
  AlertTriangle, 
  BarChart4, 
  Battery, 
  BatteryCharging, 
  Crown,
  DollarSign, 
  Gift, 
  Lock, 
  Package, 
  Rocket,
  ShieldCheck,
  ShoppingBag, 
  Star,
  Zap
} from 'lucide-react';

import { useRapperGame } from '@/lib/stores/useRapperGame';
import { usePurchaseStore } from '@/lib/stores/usePurchaseStore';
import { useAdStore } from '@/lib/stores/useAdStore';
import { useEnergyStore } from '@/lib/stores/useEnergyStore';
import { useAudio } from '@/lib/stores/useAudio';

// Type definition for Google Play Product
interface GooglePlayProduct {
  productId: string;
  type: 'inapp' | 'subs';
  price: string;
  title: string;
  description: string;
  subscriptionPeriod?: string;
}

// Type definition for featured content
interface FeaturedContent {
  title: string;
  description: string;
  icon: React.ReactNode;
  productId: string;
  tier: 'standard' | 'premium' | 'platinum';
  badgeText?: string;
}

// Type for notifications
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const ImprovedStorePanel = () => {
  // State management
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Simple notification system
  const showNotification = useCallback((title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, title, message, type }]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  // Get game state - Pure selector without transformations to prevent infinite update loops
  const gameState = useRapperGame(state => {
    // Access only what we need, don't transform the data
    return {
      week: state.currentWeek,
      userId: state.userId,
      cash: state.stats?.wealth,
      premiumUser: state.subscriptionInfo?.isSubscribed,
      subscriptionActive: state.subscriptionInfo?.isSubscribed,
      subscriptionTier: state.subscriptionInfo?.subscriptionType,
      // Important: Only pass the function reference, don't create a new one
      updateSubscriptionStatus: state.updateSubscriptionStatus
    };
  });
  
  // Get purchase store state
  const purchaseStore = usePurchaseStore(state => ({
    products: state.products,
    purchaseHistory: state.purchaseHistory,
    isLoadingProducts: state.isLoadingProducts,
    isPurchasing: state.isPurchasing,
    error: state.error,
    initializeStore: state.initializeStore,
    loadProducts: state.loadProducts,
    makePurchase: state.makePurchase,
    clearError: state.clearError
  }));
  
  // Get ad store state
  const adStore = useAdStore(state => ({
    isInitialized: state.isInitialized,
    adFreeUser: state.adFreeUser,
    error: state.error,
    initializeAds: state.initializeAds,
    watchRewardedAd: state.watchRewardedAd,
    setAdFreeStatus: state.setAdFreeStatus,
    clearError: state.clearError
  }));
  
  // Get energy store state
  const energyStore = useEnergyStore(state => ({
    addEnergy: state.addEnergy,
    setUnlimitedEnergyTimer: state.setUnlimitedEnergyTimer
  }));
  
  // Audio functionality
  const audio = useAudio();
  const playSuccessSound = useCallback(() => {
    try {
      if (audio && typeof audio.playSuccess === 'function') {
        audio.playSuccess();
      }
    } catch (err) {
      console.error("Could not play success sound:", err);
    }
  }, [audio]);
  
  // Product definitions
  const productIds = {
    subscriptions: [
      'com.rappersim.subscription.standard.monthly',
      'com.rappersim.subscription.premium.monthly',
      'com.rappersim.subscription.platinum.monthly',
      'com.rappersim.subscription.standard.quarterly',
      'com.rappersim.subscription.premium.quarterly',
      'com.rappersim.subscription.platinum.quarterly',
      'com.rappersim.subscription.standard.yearly',
      'com.rappersim.subscription.premium.yearly',
      'com.rappersim.subscription.platinum.yearly'
    ],
    virtualCurrency: [
      'com.rappersim.currency.small',
      'com.rappersim.currency.medium',
      'com.rappersim.currency.large',
      'com.rappersim.currency.xl'
    ],
    energy: [
      'com.rappersim.energy.small',
      'com.rappersim.energy.medium',
      'com.rappersim.energy.large',
      'com.rappersim.energy.unlimited24h'
    ],
    adRemoval: [
      'com.rappersim.feature.noads'
    ],
    featuredContent: [
      'com.rappersim.feature.exlusive_beats',
      'com.rappersim.feature.platinum_songs',
      'com.rappersim.feature.advanced_marketing'
    ]
  };
  
  // Initialize store and load products
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      
      try {
        // Initialize purchase store
        await purchaseStore.initializeStore(gameState.userId);
        
        // Initialize ad store
        await adStore.initializeAds();
        
        // Load product IDs for all tabs
        const allProductIds = [
          ...productIds.subscriptions,
          ...productIds.virtualCurrency,
          ...productIds.energy,
          ...productIds.adRemoval,
          ...productIds.featuredContent
        ];
        
        await purchaseStore.loadProducts(allProductIds);
      } catch (error) {
        console.error('Error initializing store:', error);
        showNotification('Store Error', 'Failed to initialize the store', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, []);
  
  // Display error messages
  useEffect(() => {
    if (purchaseStore.error) {
      showNotification('Purchase Error', purchaseStore.error, 'error');
      purchaseStore.clearError();
    }
    
    if (adStore.error) {
      showNotification('Ad Error', adStore.error, 'error');
      adStore.clearError();
    }
  }, [purchaseStore.error, adStore.error, showNotification]);
  
  // Handle purchase
  const handlePurchase = async (productId: string) => {
    try {
      const success = await purchaseStore.makePurchase(productId, gameState.userId);
      
      if (success) {
        // Play success sound
        playSuccessSound();
        
        // Show success notification
        showNotification('Purchase Successful', 'Your purchase has been processed successfully!', 'success');
        
        // Update game state based on the product purchased
        if (productId.includes('subscription')) {
          // Determine subscription tier
          let tier = 'standard';
          if (productId.includes('premium')) tier = 'premium';
          if (productId.includes('platinum')) tier = 'platinum';
          
          // Set ad-free status since all subscriptions include ad removal
          adStore.setAdFreeStatus(true);
          
          // Update game state with subscription info
          if (typeof gameState.updateGameState === 'function') {
            gameState.updateGameState({
              subscriptionInfo: {
                isSubscribed: true,
                subscriptionType: tier,
                benefits: [
                  'Ad-free experience',
                  tier === 'premium' || tier === 'platinum' ? 'Premium content access' : '',
                  tier === 'platinum' ? 'Exclusive platinum features' : ''
                ].filter(Boolean)
              }
            });
          }
        } else if (productId.includes('currency')) {
          // Determine currency amount
          let amount = 10000;
          if (productId.includes('medium')) amount = 50000;
          if (productId.includes('large')) amount = 200000;
          if (productId.includes('xl')) amount = 1000000;
          
          // Update game state
          if (typeof gameState.updateGameState === 'function') {
            gameState.updateGameState({
              stats: {
                ...gameState,
                wealth: (gameState.cash || 0) + amount
              }
            });
          }
          
          showNotification('Cash Added', `Added $${amount.toLocaleString()} to your account!`, 'success');
        } else if (productId.includes('energy')) {
          // Handle energy purchases
          if (productId.includes('unlimited24h')) {
            // Set unlimited energy for 24 hours
            const expiryTime = Date.now() + 24 * 60 * 60 * 1000;
            energyStore.setUnlimitedEnergyTimer(expiryTime);
            showNotification('Unlimited Energy', 'You now have unlimited energy for 24 hours!', 'success');
          } else {
            // Add specific energy amount
            let amount = 50; // Small package
            let bonus = 0;
            
            if (productId.includes('medium')) {
              amount = 150;
              bonus = 20;
            }
            if (productId.includes('large')) {
              amount = 500;
              bonus = 100;
            }
            
            // Add the energy with bonus
            energyStore.addEnergy(amount + bonus);
            showNotification('Energy Added', `Added ${amount + bonus} energy units to your account!`, 'success');
          }
        } else if (productId.includes('noads')) {
          // Handle ad-free status
          adStore.setAdFreeStatus(true);
          showNotification('Ads Removed', 'You will no longer see ads in the game!', 'success');
        } else if (productId.includes('feature')) {
          // Handle feature unlocks
          showNotification('Feature Unlocked', 'You have unlocked a premium feature!', 'success');
        }
      } else {
        // Show error notification
        showNotification('Purchase Failed', 'There was an error processing your purchase. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      showNotification('Purchase Error', error instanceof Error ? error.message : 'An unknown error occurred', 'error');
    }
  };
  
  // Handle watching a rewarded ad
  const handleWatchAd = () => {
    adStore.watchRewardedAd('dailyRewardedAd', (amount, type) => {
      // Handle the reward
      if (type === 'coins') {
        // Update game state with reward
        if (typeof gameState.updateGameState === 'function') {
          gameState.updateGameState({
            stats: {
              ...gameState,
              wealth: (gameState.cash || 0) + amount
            }
          });
        }
        
        // Play success sound
        playSuccessSound();
        
        // Show success notification
        showNotification('Reward Earned', `You've earned $${amount.toLocaleString()} for watching the ad!`, 'success');
      }
    });
  };
  
  // Filter products by subscription period
  const getSubscriptionsByPeriod = (products: GooglePlayProduct[], period: string): GooglePlayProduct[] => {
    return products.filter(product => 
      product.type === 'subs' && 
      product.productId.includes(period)
    );
  };
  
  // Format subscription period for display
  const formatSubscriptionPeriod = (subscriptionPeriod?: string): string => {
    if (!subscriptionPeriod) return '';
    
    switch (subscriptionPeriod) {
      case 'P1M': return 'Monthly';
      case 'P3M': return 'Quarterly';
      case 'P6M': return '6 Months';
      case 'P1Y': return 'Yearly';
      default: return subscriptionPeriod;
    }
  };
  
  // Get subscription benefits based on tier
  const getSubscriptionBenefits = (tier: string): string[] => {
    const benefits: Record<string, string[]> = {
      standard: [
        "Weekly cash bonus: $10,000",
        "10% creativity boost",
        "Access to exclusive standard features",
        "Ad-free experience"
      ],
      premium: [
        "Weekly cash bonus: $25,000",
        "25% creativity boost",
        "Access to exclusive premium features",
        "Early access to new content",
        "Ad-free experience"
      ],
      platinum: [
        "Weekly cash bonus: $50,000",
        "50% creativity boost",
        "Access to ALL exclusive features",
        "Priority early access to new content",
        "Exclusive platinum rewards",
        "Ad-free experience"
      ]
    };
    
    return benefits[tier.toLowerCase()] || [];
  };
  
  // Featured premium content
  const featuredContent: FeaturedContent[] = [
    {
      title: "Premium Beats Collection",
      description: "Access exclusive premium beats to elevate your songs' quality.",
      icon: <BarChart4 className="h-10 w-10 text-purple-600" />,
      productId: "com.rappersim.feature.exlusive_beats",
      tier: "premium",
      badgeText: "HOT SELLER"
    },
    {
      title: "Platinum Song Templates",
      description: "Unlock platinum-tier song templates and patterns for instant inspiration.",
      icon: <Crown className="h-10 w-10 text-amber-500" />,
      productId: "com.rappersim.feature.platinum_songs",
      tier: "platinum"
    },
    {
      title: "Advanced Marketing Tools",
      description: "Boost your career with professional marketing strategies and tools.",
      icon: <Rocket className="h-10 w-10 text-blue-600" />,
      productId: "com.rappersim.feature.advanced_marketing",
      tier: "premium"
    }
  ];
  
  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      {/* Notification area */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-0 
              ${notification.type === 'success' ? 'bg-green-100 border-green-500 text-green-800' : 
                notification.type === 'error' ? 'bg-red-100 border-red-500 text-red-800' : 
                'bg-blue-100 border-blue-500 text-blue-800'}`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' && <ShieldCheck className="h-5 w-5 text-green-500" />}
                {notification.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                {notification.type === 'info' && <AlertTriangle className="h-5 w-5 text-blue-500" />}
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">{notification.title}</h3>
                <div className="mt-1 text-sm">{notification.message}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Game Store</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">Current Cash:</div>
          <div className="font-bold text-green-600">${(gameState.cash || 0).toLocaleString()}</div>
        </div>
      </div>
      
      {gameState.premiumUser && gameState.subscriptionActive && (
        <Alert className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-blue-200">
          <Star className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Active Subscription</AlertTitle>
          <AlertDescription className="text-blue-700">
            You currently have an active {gameState.subscriptionTier || 'standard'} subscription.
            Enjoy your premium benefits!
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="virtualCurrency">Currency</TabsTrigger>
          <TabsTrigger value="energy">Energy</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="adRemoval">Remove Ads</TabsTrigger>
        </TabsList>
        
        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Monthly Subscriptions */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center">Monthly</h2>
              {isLoading || purchaseStore.isLoadingProducts ? (
                <div className="flex justify-center py-12">Loading subscriptions...</div>
              ) : (
                getSubscriptionsByPeriod(purchaseStore.products, 'monthly').map((product) => {
                  const tier = product.productId.includes('premium') ? 'premium' : 
                              product.productId.includes('platinum') ? 'platinum' : 'standard';
                  const benefits = getSubscriptionBenefits(tier);
                  
                  return (
                    <Card key={product.productId} className={`
                      ${tier === 'standard' ? 'border-blue-200' : ''}
                      ${tier === 'premium' ? 'border-purple-300' : ''}
                      ${tier === 'platinum' ? 'border-amber-300' : ''}
                    `}>
                      <CardHeader className={`
                        pb-2
                        ${tier === 'standard' ? 'bg-blue-50' : ''}
                        ${tier === 'premium' ? 'bg-purple-50' : ''}
                        ${tier === 'platinum' ? 'bg-amber-50' : ''}
                      `}>
                        <div className="flex justify-between items-center">
                          <CardTitle className="capitalize">{tier}</CardTitle>
                          <Badge variant="outline" className={`
                            ${tier === 'standard' ? 'bg-blue-100 text-blue-800' : ''}
                            ${tier === 'premium' ? 'bg-purple-100 text-purple-800' : ''}
                            ${tier === 'platinum' ? 'bg-amber-100 text-amber-800' : ''}
                          `}>
                            {formatSubscriptionPeriod(product.subscriptionPeriod)}
                          </Badge>
                        </div>
                        <CardDescription>{product.price} / month</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2 text-sm">
                          {benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start">
                              <Star className="h-4 w-4 mr-2 mt-0.5 text-yellow-500" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full"
                          onClick={() => handlePurchase(product.productId)}
                          disabled={
                            purchaseStore.isPurchasing ||
                            (gameState.premiumUser && 
                            gameState.subscriptionActive && 
                            gameState.subscriptionTier === tier)
                          }
                          variant={tier === 'standard' ? 'default' : 
                                  tier === 'premium' ? 'secondary' : 
                                  'outline'}
                        >
                          {purchaseStore.isPurchasing ? 'Processing...' : 
                           (gameState.premiumUser && 
                            gameState.subscriptionActive && 
                            gameState.subscriptionTier === tier) ? 'Current Plan' : 'Subscribe'}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })
              )}
            </div>
            
            {/* Yearly Subscriptions */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center">Yearly</h2>
              {isLoading || purchaseStore.isLoadingProducts ? (
                <div className="flex justify-center py-12">Loading subscriptions...</div>
              ) : (
                getSubscriptionsByPeriod(purchaseStore.products, 'yearly').map((product) => {
                  const tier = product.productId.includes('premium') ? 'premium' : 
                              product.productId.includes('platinum') ? 'platinum' : 'standard';
                  const benefits = getSubscriptionBenefits(tier);
                  
                  return (
                    <Card key={product.productId} className={`
                      ${tier === 'standard' ? 'border-blue-200' : ''}
                      ${tier === 'premium' ? 'border-purple-300' : ''}
                      ${tier === 'platinum' ? 'border-amber-300' : ''}
                    `}>
                      <CardHeader className={`
                        pb-2
                        ${tier === 'standard' ? 'bg-blue-50' : ''}
                        ${tier === 'premium' ? 'bg-purple-50' : ''}
                        ${tier === 'platinum' ? 'bg-amber-50' : ''}
                      `}>
                        <div className="flex justify-between items-center">
                          <CardTitle className="capitalize">{tier}</CardTitle>
                          <Badge variant="outline" className={`
                            ${tier === 'standard' ? 'bg-blue-100 text-blue-800' : ''}
                            ${tier === 'premium' ? 'bg-purple-100 text-purple-800' : ''}
                            ${tier === 'platinum' ? 'bg-amber-100 text-amber-800' : ''}
                          `}>
                            Yearly (Best Value)
                          </Badge>
                        </div>
                        <CardDescription>{product.price} / year</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2 text-sm">
                          {benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start">
                              <Star className="h-4 w-4 mr-2 mt-0.5 text-yellow-500" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full"
                          onClick={() => handlePurchase(product.productId)}
                          disabled={
                            purchaseStore.isPurchasing ||
                            (gameState.premiumUser && 
                            gameState.subscriptionActive && 
                            gameState.subscriptionTier === tier)
                          }
                          variant={tier === 'standard' ? 'default' : 
                                  tier === 'premium' ? 'secondary' : 
                                  'outline'}
                        >
                          {purchaseStore.isPurchasing ? 'Processing...' : 
                           (gameState.premiumUser && 
                            gameState.subscriptionActive && 
                            gameState.subscriptionTier === tier) ? 'Current Plan' : 'Subscribe'}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })
              )}
            </div>
            
            {/* Quarterly Subscriptions */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center">Quarterly</h2>
              {isLoading || purchaseStore.isLoadingProducts ? (
                <div className="flex justify-center py-12">Loading subscriptions...</div>
              ) : (
                getSubscriptionsByPeriod(purchaseStore.products, 'quarterly').map((product) => {
                  const tier = product.productId.includes('premium') ? 'premium' : 
                              product.productId.includes('platinum') ? 'platinum' : 'standard';
                  const benefits = getSubscriptionBenefits(tier);
                  
                  return (
                    <Card key={product.productId} className={`
                      ${tier === 'standard' ? 'border-blue-200' : ''}
                      ${tier === 'premium' ? 'border-purple-300' : ''}
                      ${tier === 'platinum' ? 'border-amber-300' : ''}
                    `}>
                      <CardHeader className={`
                        pb-2
                        ${tier === 'standard' ? 'bg-blue-50' : ''}
                        ${tier === 'premium' ? 'bg-purple-50' : ''}
                        ${tier === 'platinum' ? 'bg-amber-50' : ''}
                      `}>
                        <div className="flex justify-between items-center">
                          <CardTitle className="capitalize">{tier}</CardTitle>
                          <Badge variant="outline" className={`
                            ${tier === 'standard' ? 'bg-blue-100 text-blue-800' : ''}
                            ${tier === 'premium' ? 'bg-purple-100 text-purple-800' : ''}
                            ${tier === 'platinum' ? 'bg-amber-100 text-amber-800' : ''}
                          `}>
                            Quarterly
                          </Badge>
                        </div>
                        <CardDescription>{product.price} / quarter</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2 text-sm">
                          {benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start">
                              <Star className="h-4 w-4 mr-2 mt-0.5 text-yellow-500" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full"
                          onClick={() => handlePurchase(product.productId)}
                          disabled={
                            purchaseStore.isPurchasing ||
                            (gameState.premiumUser && 
                            gameState.subscriptionActive && 
                            gameState.subscriptionTier === tier)
                          }
                          variant={tier === 'standard' ? 'default' : 
                                  tier === 'premium' ? 'secondary' : 
                                  'outline'}
                        >
                          {purchaseStore.isPurchasing ? 'Processing...' : 
                           (gameState.premiumUser && 
                            gameState.subscriptionActive && 
                            gameState.subscriptionTier === tier) ? 'Current Plan' : 'Subscribe'}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Virtual Currency Tab */}
        <TabsContent value="virtualCurrency" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading || purchaseStore.isLoadingProducts ? (
              <div className="col-span-full flex justify-center py-12">Loading currency packages...</div>
            ) : (
              purchaseStore.products
                .filter(product => product.productId.includes('currency'))
                .map(product => (
                  <Card key={product.productId} className="border-emerald-200">
                    <CardHeader className="pb-2 bg-emerald-50">
                      <div className="flex justify-between items-center">
                        <CardTitle>{product.title}</CardTitle>
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                      </div>
                      <CardDescription>{product.price}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm">{product.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => handlePurchase(product.productId)}
                        disabled={purchaseStore.isPurchasing}
                        variant="default"
                      >
                        {purchaseStore.isPurchasing ? 'Processing...' : 'Purchase'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>
        
        {/* Energy Tab */}
        <TabsContent value="energy" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading || purchaseStore.isLoadingProducts ? (
              <div className="col-span-full flex justify-center py-12">Loading energy packages...</div>
            ) : (
              purchaseStore.products
                .filter(product => product.productId.includes('energy'))
                .map(product => (
                  <Card key={product.productId} className="border-blue-200">
                    <CardHeader className="pb-2 bg-blue-50">
                      <div className="flex justify-between items-center">
                        <CardTitle>{product.title}</CardTitle>
                        {product.productId.includes('unlimited') ? (
                          <BatteryCharging className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Battery className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <CardDescription>{product.price}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm">{product.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => handlePurchase(product.productId)}
                        disabled={purchaseStore.isPurchasing}
                        variant="secondary"
                      >
                        {purchaseStore.isPurchasing ? 'Processing...' : 'Purchase'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>
        
        {/* Featured Content Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading || purchaseStore.isLoadingProducts ? (
              <div className="col-span-full flex justify-center py-12">Loading premium features...</div>
            ) : (
              featuredContent.map(feature => {
                const product = purchaseStore.products.find(p => p.productId === feature.productId);
                
                return (
                  <Card key={feature.productId} className={`
                    ${feature.tier === 'standard' ? 'border-blue-200' : ''}
                    ${feature.tier === 'premium' ? 'border-purple-300' : ''}
                    ${feature.tier === 'platinum' ? 'border-amber-300' : ''}
                  `}>
                    <CardHeader className={`
                      pb-2
                      ${feature.tier === 'standard' ? 'bg-blue-50' : ''}
                      ${feature.tier === 'premium' ? 'bg-purple-50' : ''}
                      ${feature.tier === 'platinum' ? 'bg-amber-50' : ''}
                    `}>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{feature.title}</CardTitle>
                        {feature.badgeText && (
                          <Badge variant="outline" className="bg-red-100 text-red-800">
                            {feature.badgeText}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center mt-1">
                        <Badge variant="outline" className={`
                          ${feature.tier === 'standard' ? 'bg-blue-100 text-blue-800' : ''}
                          ${feature.tier === 'premium' ? 'bg-purple-100 text-purple-800' : ''}
                          ${feature.tier === 'platinum' ? 'bg-amber-100 text-amber-800' : ''}
                        `}>
                          {feature.tier.charAt(0).toUpperCase() + feature.tier.slice(1)}
                        </Badge>
                        <span className="ml-2">{product?.price || '5.99'}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex justify-center mb-4">
                        {feature.icon}
                      </div>
                      <p className="text-sm text-center">{feature.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => handlePurchase(feature.productId)}
                        disabled={purchaseStore.isPurchasing}
                        variant={feature.tier === 'standard' ? 'default' : 
                                feature.tier === 'premium' ? 'secondary' : 
                                'outline'}
                      >
                        {purchaseStore.isPurchasing ? 'Processing...' : 'Purchase'}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
        
        {/* Ad Removal Tab */}
        <TabsContent value="adRemoval" className="space-y-6">
          <div className="max-w-lg mx-auto">
            {isLoading || purchaseStore.isLoadingProducts ? (
              <div className="flex justify-center py-12">Loading ad removal options...</div>
            ) : (
              <>
                {adStore.adFreeUser ? (
                  <Alert className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Ad-Free Experience Active</AlertTitle>
                    <AlertDescription className="text-green-700">
                      You already have the ad-free experience enabled! Enjoy your gameplay without interruptions.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Card className="border-green-200">
                    <CardHeader className="pb-2 bg-green-50">
                      <div className="flex justify-between items-center">
                        <CardTitle>Remove Ads</CardTitle>
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                      </div>
                      <CardDescription>
                        {purchaseStore.products.find(p => p.productId.includes('noads'))?.price || '$2.99'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-center font-medium mb-4">Enjoy an ad-free experience!</p>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Star className="h-4 w-4 mr-2 mt-0.5 text-yellow-500" />
                          <span>Remove all advertisements permanently</span>
                        </li>
                        <li className="flex items-start">
                          <Star className="h-4 w-4 mr-2 mt-0.5 text-yellow-500" />
                          <span>Uninterrupted gameplay experience</span>
                        </li>
                        <li className="flex items-start">
                          <Star className="h-4 w-4 mr-2 mt-0.5 text-yellow-500" />
                          <span>One-time purchase, never expires</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => handlePurchase('com.rappersim.feature.noads')}
                        disabled={purchaseStore.isPurchasing || adStore.adFreeUser}
                        variant="default"
                      >
                        {purchaseStore.isPurchasing ? 'Processing...' : adStore.adFreeUser ? 'Already Purchased' : 'Remove All Ads'}
                      </Button>
                    </CardFooter>
                  </Card>
                )}
                
                {!adStore.adFreeUser && (
                  <div className="mt-6">
                    <Card className="border-gray-200">
                      <CardHeader className="pb-2 bg-gray-50">
                        <CardTitle>Watch Ad for Reward</CardTitle>
                        <CardDescription>Watch a short ad to earn in-game currency</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-center">Watch a rewarded ad to receive a cash bonus!</p>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full"
                          onClick={handleWatchAd}
                          variant="outline"
                        >
                          Watch Ad for Cash
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};