// NewStorePanel.tsx - Fully Google Play Store compatible store panel (revised)
import { useState, useEffect } from 'react';
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

export const NewStorePanel = () => {
  // Simplified notification system without using useToast
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{title: string; message: string; type: 'success' | 'error' | 'info'} | null>(null);
  
  // Simple toast function replacement
  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ title, message, type });
    // Auto hide after 3 seconds
    setTimeout(() => setNotification(null), 3000);
  };
  
  // Get relevant game state - Fixed to prevent infinite update loops
  const gameState = useRapperGame(state => {
    return {
      week: state.currentWeek || 1,
      userId: state.userId || 1, // Default to user ID 1 if not set
      cash: state.stats?.wealth || 1000, // Default to 1000 cash if not set
      premiumUser: state.subscriptionInfo?.isSubscribed ?? false,
      subscriptionActive: state.subscriptionInfo?.isSubscribed ?? false,
      subscriptionTier: state.subscriptionInfo?.subscriptionType || 'none',
      updateGameState: state.updateGameState,
    };
  });
  
  // Get purchase store state
  const purchaseStore = usePurchaseStore((state) => ({
    products: state.products,
    purchaseHistory: state.purchaseHistory,
    isLoadingProducts: state.isLoadingProducts,
    isPurchasing: state.isPurchasing,
    error: state.error,
    initializeStore: state.initializeStore,
    loadProducts: state.loadProducts,
    makePurchase: state.makePurchase,
    clearError: state.clearError,
  }));
  
  // Get ad store state
  const adStore = useAdStore((state) => ({
    isInitialized: state.isInitialized,
    adFreeUser: state.adFreeUser,
    error: state.error,
    initializeAds: state.initializeAds,
    watchRewardedAd: state.watchRewardedAd,
    setAdFreeStatus: state.setAdFreeStatus,
    clearError: state.clearError,
  }));
  
  // Get energy store state
  const energyStore = useEnergyStore((state) => ({
    addEnergy: state.addEnergy,
    setUnlimitedEnergyTimer: state.setUnlimitedEnergyTimer,
  }));
  
  // Get audio state with safer access pattern
  const audio = useAudio();
  const playSuccessSound = () => {
    // Safely try to play the success sound
    try {
      audio.playSuccess?.();
    } catch (err) {
      console.log("Could not play success sound:", err);
    }
  };
  
  // Define product IDs for the different store tabs - Now using Google Play naming conventions
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
      
      // Initialize purchase store
      await purchaseStore.initializeStore(gameState.userId);
      
      // Initialize ad store
      await adStore.initializeAds();
      
      try {
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
        console.error('Error loading products:', error);
      }
      
      setIsLoading(false);
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
  }, [purchaseStore.error, adStore.error]);
  
  // Handle purchase
  const handlePurchase = async (productId: string) => {
    try {
      const success = await purchaseStore.makePurchase(productId, gameState.userId);
      
      if (success) {
        // Play success sound
        playSuccessSound();
        
        // Show success toast
        toast({
          title: 'Purchase Successful',
          description: 'Your purchase has been processed successfully!',
          variant: 'default'
        });
        
        // Update game state based on the product purchased
        // This would be handled through the server in a real implementation,
        // but we'll simulate it here for demonstration purposes
        if (productId.includes('subscription')) {
          // Determine subscription tier
          let tier = 'standard';
          if (productId.includes('premium')) tier = 'premium';
          if (productId.includes('platinum')) tier = 'platinum';
          
          // Set ad-free status since all subscriptions include ad removal
          adStore.setAdFreeStatus(true);
          
          // Update game state
          if (typeof gameState.updateGameState === 'function') {
            gameState.updateGameState({
              premiumUser: true,
              subscriptionActive: true,
              subscriptionTier: tier,
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
              cash: (gameState.cash || 0) + amount
            });
          }
        } else if (productId.includes('energy')) {
          // Determine energy amount and apply it
          if (productId.includes('unlimited24h')) {
            // Set unlimited energy for 24 hours
            const expiryTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            energyStore.setUnlimitedEnergyTimer(expiryTime);
            
            // Play success sound
            playSuccessSound();
            
            toast({
              title: 'Unlimited Energy Activated',
              description: 'You have unlimited energy for the next 24 hours!',
              variant: 'default'
            });
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
            
            // Play success sound
            playSuccessSound();
            
            toast({
              title: 'Energy Added',
              description: `Added ${amount + bonus} energy units to your account!`,
              variant: 'default'
            });
          }
        } else if (productId.includes('noads')) {
          // Handle ad-free status using the adStore's setAdFreeStatus method
          adStore.setAdFreeStatus(true);
          
          // Show success toast
          toast({
            title: 'Ad-Free Status Activated',
            description: 'You will no longer see ads in the game!',
            variant: 'default'
          });
        } else if (productId.includes('feature')) {
          // Handle feature unlocks
          toast({
            title: 'Feature Unlocked',
            description: 'You have unlocked a premium feature!',
            variant: 'default'
          });
          
          // Additional logic based on the specific feature
          if (productId.includes('exlusive_beats')) {
            // Logic for unlocking exclusive beats
          } else if (productId.includes('platinum_songs')) {
            // Logic for unlocking platinum songs
          } else if (productId.includes('advanced_marketing')) {
            // Logic for unlocking advanced marketing
          }
        }
      } else {
        // Show error toast
        toast({
          title: 'Purchase Failed',
          description: 'There was an error processing your purchase. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Purchase error:', error);
      
      // Show error toast
      toast({
        title: 'Purchase Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
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
            cash: (gameState.cash || 0) + amount
          });
        }
        
        // Play success sound
        playSuccessSound();
        
        // Show success toast
        toast({
          title: 'Reward Earned',
          description: `You've earned $${amount.toLocaleString()} for watching the ad!`,
          variant: 'default'
        });
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
      case 'P1M':
        return 'Monthly';
      case 'P3M':
        return 'Quarterly';
      case 'P6M':
        return '6 Months';
      case 'P1Y':
        return 'Yearly';
      default:
        return subscriptionPeriod;
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
                            {formatSubscriptionPeriod(product.subscriptionPeriod)}
                          </Badge>
                        </div>
                        <CardDescription>
                          {product.price} (Save 15%)
                        </CardDescription>
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
                      relative overflow-hidden
                    `}>
                      {/* Best Value badge */}
                      <div className="absolute -right-8 top-6 transform rotate-45 bg-green-600 text-white px-10 py-1 text-xs font-bold">
                        BEST VALUE
                      </div>
                      
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
                        <CardDescription>
                          {product.price} (Save 30%)
                        </CardDescription>
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
          
          <div className="text-sm text-gray-500 mt-6">
            <p>* Subscriptions automatically renew unless auto-renew is turned off at least 24 hours before the end of the current period.</p>
            <p>* Account will be charged for renewal within 24 hours prior to the end of the current period.</p>
            <p>* Subscriptions may be managed by the user and auto-renewal may be turned off by going to the user's Account Settings after purchase.</p>
          </div>
        </TabsContent>
        
        {/* Virtual Currency Tab */}
        <TabsContent value="virtualCurrency" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Info alert about Google Play Store */}
            <Alert className="col-span-1 md:col-span-2 bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Google Play Store in-app purchases</AlertTitle>
              <AlertDescription className="text-blue-700">
                Virtual currency purchases will be processed through Google Play Store. Prices shown as Free (0.00) are placeholders - actual pricing will be applied at checkout.
              </AlertDescription>
            </Alert>
            
            {/* Small Cash Pack */}
            <Card className="border-l-4 border-l-green-400">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                  Small Cash Pack
                </CardTitle>
                <CardDescription className="flex items-center">
                  Free
                  <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Google Play</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-center text-green-500">
                  $10,000
                </div>
                <Separator className="my-4" />
                <div className="text-sm text-gray-600">
                  A small cash boost to jump-start your career.
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handlePurchase(productIds.virtualCurrency[0])}
                  disabled={purchaseStore.isPurchasing}
                >
                  {purchaseStore.isPurchasing ? 'Processing...' : 'Purchase'}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Medium Cash Pack */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Medium Cash Pack
                </CardTitle>
                <CardDescription className="flex items-center">
                  Free
                  <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Google Play</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-center text-green-600">
                  $50,000
                </div>
                <Separator className="my-4" />
                <div className="text-sm text-gray-600">
                  A decent cash boost to advance your career.
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handlePurchase(productIds.virtualCurrency[1])}
                  disabled={purchaseStore.isPurchasing}
                >
                  {purchaseStore.isPurchasing ? 'Processing...' : 'Purchase'}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Large Cash Pack */}
            <Card className="border-l-4 border-l-green-600">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-700" />
                  Large Cash Pack
                </CardTitle>
                <CardDescription className="flex items-center">
                  Free
                  <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Google Play</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-center text-green-700">
                  $200,000
                </div>
                <Separator className="my-4" />
                <div className="text-sm text-gray-600">
                  A significant cash boost to elevate your rap career.
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handlePurchase(productIds.virtualCurrency[2])}
                  disabled={purchaseStore.isPurchasing}
                >
                  {purchaseStore.isPurchasing ? 'Processing...' : 'Purchase'}
                </Button>
              </CardFooter>
            </Card>
            
            {/* XL Cash Pack */}
            <Card className="border-l-4 border-l-green-700 relative overflow-hidden">
              <div className="absolute -right-8 top-6 transform rotate-45 bg-green-600 text-white px-10 py-1 text-xs font-bold">
                BEST VALUE
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-800" />
                  Fortune Cash Pack
                </CardTitle>
                <CardDescription className="flex items-center">
                  Free
                  <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Google Play</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-center text-green-800">
                  $1,000,000
                </div>
                <Separator className="my-4" />
                <div className="text-sm text-gray-600">
                  A massive cash injection to become an industry mogul.
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handlePurchase(productIds.virtualCurrency[3])}
                  disabled={purchaseStore.isPurchasing}
                >
                  {purchaseStore.isPurchasing ? 'Processing...' : 'Purchase'}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Free Cash from Ads */}
            <Card className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Gift className="h-5 w-5 mr-2 text-blue-600" />
                  Free Cash Opportunity
                </CardTitle>
                <CardDescription>
                  Watch a short ad to earn free in-game cash
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Not ready to purchase? You can still earn free cash by watching a short advertisement!
                  </p>
                  <div className="text-xl font-bold text-blue-700">
                    Watch an ad to earn $5,000
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-center">
                <Button 
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  onClick={handleWatchAd}
                  disabled={!adStore.isInitialized}
                >
                  Watch Ad to Earn Cash
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="text-sm text-gray-500 mt-6">
            <p>* All purchases are final and non-refundable.</p>
            <p>* Virtual currency is for use in Rap Empire Simulator only and has no real-world value.</p>
          </div>
        </TabsContent>
        
        {/* Energy Tab */}
        <TabsContent value="energy" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Info alert about Google Play Store */}
            <Alert className="col-span-1 md:col-span-2 bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Google Play Store in-app purchases</AlertTitle>
              <AlertDescription className="text-blue-700">
                Energy purchases will be processed through Google Play Store. Prices shown as Free (0.00) are placeholders - actual pricing will be applied at checkout.
              </AlertDescription>
            </Alert>
            
            {isLoading || purchaseStore.isLoadingProducts ? (
              <div className="flex justify-center py-12 col-span-2">Loading energy packages...</div>
            ) : (
              <>
                {/* Small Energy Pack */}
                <Card className="relative overflow-hidden border-amber-200">
                  <CardHeader className="pb-2 bg-amber-50">
                    <CardTitle className="flex items-center">
                      <Battery className="h-5 w-5 mr-2 text-amber-500" />
                      Small Energy Pack
                    </CardTitle>
                    <CardDescription className="flex items-center">
                      Free
                      <Badge className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Google Play</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-center text-amber-500">
                      50 Energy Units
                    </div>
                    <Separator className="my-4" />
                    <div className="text-sm text-gray-600">
                      A small boost of energy to keep creating.
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-amber-500 hover:bg-amber-600"
                      onClick={() => handlePurchase(productIds.energy[0])}
                      disabled={purchaseStore.isPurchasing}
                    >
                      {purchaseStore.isPurchasing ? 'Processing...' : 'Purchase'}
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Medium Energy Pack */}
                <Card className="relative overflow-hidden border-amber-300">
                  <CardHeader className="pb-2 bg-amber-50">
                    <CardTitle className="flex items-center">
                      <Battery className="h-5 w-5 mr-2 text-amber-600" />
                      Medium Energy Pack
                    </CardTitle>
                    <CardDescription className="flex items-center">
                      Free
                      <Badge className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Google Play</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-center text-amber-600">
                      150 Energy Units
                      <div className="text-sm font-normal text-green-600 mt-1">+20 Bonus Energy</div>
                    </div>
                    <Separator className="my-4" />
                    <div className="text-sm text-gray-600">
                      A medium energy refill with bonus energy.
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-amber-500 hover:bg-amber-600"
                      onClick={() => handlePurchase(productIds.energy[1])}
                      disabled={purchaseStore.isPurchasing}
                    >
                      {purchaseStore.isPurchasing ? 'Processing...' : 'Purchase'}
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Large Energy Pack */}
                <Card className="relative overflow-hidden border-amber-400">
                  <CardHeader className="pb-2 bg-amber-50">
                    <CardTitle className="flex items-center">
                      <Battery className="h-5 w-5 mr-2 text-amber-700" />
                      Large Energy Pack
                    </CardTitle>
                    <CardDescription className="flex items-center">
                      Free
                      <Badge className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Google Play</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-center text-amber-700">
                      500 Energy Units
                      <div className="text-sm font-normal text-green-600 mt-1">+100 Bonus Energy</div>
                    </div>
                    <Separator className="my-4" />
                    <div className="text-sm text-gray-600">
                      A large energy refill with significant bonus energy.
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-amber-500 hover:bg-amber-600"
                      onClick={() => handlePurchase(productIds.energy[2])}
                      disabled={purchaseStore.isPurchasing}
                    >
                      {purchaseStore.isPurchasing ? 'Processing...' : 'Purchase'}
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Unlimited Energy */}
                <Card className="relative overflow-hidden border-amber-500">
                  <div className="absolute -right-8 top-6 transform rotate-45 bg-amber-600 text-white px-10 py-1 text-xs font-bold">
                    BEST VALUE
                  </div>
                  <CardHeader className="pb-2 bg-amber-50">
                    <CardTitle className="flex items-center">
                      <BatteryCharging className="h-5 w-5 mr-2 text-amber-800" />
                      Unlimited Energy (24h)
                    </CardTitle>
                    <CardDescription className="flex items-center">
                      Free
                      <Badge className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Google Play</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-center text-amber-800">
                      Unlimited Energy
                      <div className="text-sm font-normal text-amber-700 mt-1">For 24 Hours</div>
                    </div>
                    <Separator className="my-4" />
                    <div className="text-sm text-gray-600">
                      Create unlimited songs for a full day! No energy restrictions.
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      onClick={() => handlePurchase(productIds.energy[3])}
                      disabled={purchaseStore.isPurchasing}
                    >
                      {purchaseStore.isPurchasing ? 'Processing...' : 'Purchase'}
                    </Button>
                  </CardFooter>
                </Card>
              </>
            )}
          </div>
          
          <div className="text-sm text-gray-500 mt-6">
            <p>* Energy is consumed when creating new songs and performing certain actions in the game.</p>
            <p>* Standard accounts regenerate 5 energy units per hour, premium accounts regenerate 10 energy units per hour.</p>
            <p>* Energy purchases are non-refundable once consumed.</p>
          </div>
        </TabsContent>
        
        {/* Premium Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Premium features intro */}
            <div className="col-span-1 md:col-span-3">
              <Alert className="bg-purple-50 border-purple-200">
                <Rocket className="h-4 w-4 text-purple-600" />
                <AlertTitle className="text-purple-800">Premium Features</AlertTitle>
                <AlertDescription className="text-purple-700">
                  Unlock special features to enhance your gameplay experience without subscribing. Individual features can be purchased separately.
                </AlertDescription>
              </Alert>
            </div>
            
            {/* Featured content cards */}
            {featuredContent.map((item, index) => (
              <Card key={index} className={`
                ${item.tier === 'standard' ? 'border-blue-200' : 
                 item.tier === 'premium' ? 'border-purple-200' : 
                 'border-amber-200'}
                 relative overflow-hidden
              `}>
                {item.badgeText && (
                  <div className="absolute -right-8 top-6 transform rotate-45 bg-purple-600 text-white px-10 py-1 text-xs font-bold">
                    {item.badgeText}
                  </div>
                )}
                
                <CardHeader className={`
                  ${item.tier === 'standard' ? 'bg-blue-50' : 
                   item.tier === 'premium' ? 'bg-purple-50' : 
                   'bg-amber-50'}
                `}>
                  <div className="flex justify-between items-center">
                    <CardTitle>{item.title}</CardTitle>
                    <Badge variant="outline" className={`
                      ${item.tier === 'standard' ? 'bg-blue-100 text-blue-800' : 
                       item.tier === 'premium' ? 'bg-purple-100 text-purple-800' : 
                       'bg-amber-100 text-amber-800'}
                    `}>
                      {item.tier.charAt(0).toUpperCase() + item.tier.slice(1)}
                    </Badge>
                  </div>
                  <CardDescription>
                    Free
                    <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Google Play</Badge>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-4 flex items-center justify-center flex-col">
                  <div className="mb-4">
                    {item.icon}
                  </div>
                  <div className="text-sm text-gray-600 text-center">
                    {item.description}
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className={`
                      w-full
                      ${item.tier === 'standard' ? 'bg-blue-600 hover:bg-blue-700' : 
                       item.tier === 'premium' ? 'bg-purple-600 hover:bg-purple-700' : 
                       'bg-amber-600 hover:bg-amber-700'}
                    `}
                    onClick={() => handlePurchase(item.productId)}
                    disabled={purchaseStore.isPurchasing}
                  >
                    {purchaseStore.isPurchasing ? 'Processing...' : 'Unlock Feature'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {/* All features included in subscription */}
            <Card className="col-span-1 md:col-span-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-indigo-600" />
                  Get Everything With a Subscription
                </CardTitle>
                <CardDescription>
                  All premium features are included in our subscription plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="font-bold text-blue-700 mb-2 flex items-center">
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Standard Plan
                    </h3>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-start">
                        <Star className="h-3.5 w-3.5 mr-2 mt-0.5 text-yellow-500" />
                        <span>Weekly $10,000 bonus</span>
                      </li>
                      <li className="flex items-start">
                        <Star className="h-3.5 w-3.5 mr-2 mt-0.5 text-yellow-500" />
                        <span>10% creativity boost</span>
                      </li>
                      <li className="flex items-start">
                        <Star className="h-3.5 w-3.5 mr-2 mt-0.5 text-yellow-500" />
                        <span>Ad-free experience</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-purple-200">
                    <h3 className="font-bold text-purple-700 mb-2 flex items-center">
                      <Crown className="h-4 w-4 mr-2" />
                      Premium Plan
                    </h3>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-start">
                        <Star className="h-3.5 w-3.5 mr-2 mt-0.5 text-yellow-500" />
                        <span>All Standard benefits</span>
                      </li>
                      <li className="flex items-start">
                        <Star className="h-3.5 w-3.5 mr-2 mt-0.5 text-yellow-500" />
                        <span>Weekly $25,000 bonus</span>
                      </li>
                      <li className="flex items-start">
                        <Star className="h-3.5 w-3.5 mr-2 mt-0.5 text-yellow-500" />
                        <span>25% creativity boost</span>
                      </li>
                      <li className="flex items-start">
                        <Star className="h-3.5 w-3.5 mr-2 mt-0.5 text-yellow-500" />
                        <span>Early access to features</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-amber-200">
                    <h3 className="font-bold text-amber-700 mb-2 flex items-center">
                      <Zap className="h-4 w-4 mr-2" />
                      Platinum Plan
                    </h3>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-start">
                        <Star className="h-3.5 w-3.5 mr-2 mt-0.5 text-yellow-500" />
                        <span>All Premium benefits</span>
                      </li>
                      <li className="flex items-start">
                        <Star className="h-3.5 w-3.5 mr-2 mt-0.5 text-yellow-500" />
                        <span>Weekly $50,000 bonus</span>
                      </li>
                      <li className="flex items-start">
                        <Star className="h-3.5 w-3.5 mr-2 mt-0.5 text-yellow-500" />
                        <span>50% creativity boost</span>
                      </li>
                      <li className="flex items-start">
                        <Star className="h-3.5 w-3.5 mr-2 mt-0.5 text-yellow-500" />
                        <span>Exclusive platinum rewards</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  onClick={() => setActiveTab('subscriptions')}
                >
                  View Subscription Plans
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Ad Removal Tab */}
        <TabsContent value="adRemoval" className="space-y-6">
          {adStore.adFreeUser && (
            <Alert className="bg-green-50 border-green-200 mb-6">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Ad-Free Status Active</AlertTitle>
              <AlertDescription className="text-green-700">
                You currently have ad-free status. Enjoy your ad-free experience!
              </AlertDescription>
            </Alert>
          )}
          
          <Alert className="bg-blue-50 border-blue-200 mb-6">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Google Play Store in-app purchases</AlertTitle>
            <AlertDescription className="text-blue-700">
              Ad removal purchases will be processed through Google Play Store. Prices shown are examples - actual pricing will be applied at checkout.
            </AlertDescription>
          </Alert>
          
          <div className="max-w-md mx-auto">
            <Card className="border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center">
                  <ShieldCheck className="h-5 w-5 mr-2 text-green-600" />
                  Remove All Ads
                </CardTitle>
                <CardDescription className="flex items-center">
                  Free
                  <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Google Play</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="text-xl font-bold text-green-700 mb-2">
                    Ad-Free Experience
                  </div>
                  <p className="text-sm text-gray-600">
                    Remove all advertisements from the game permanently and enjoy an uninterrupted gaming experience.
                  </p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-green-800">Benefits:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start text-sm">
                      <Star className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                      <span>No more banner ads</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <Star className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                      <span>No more interstitial ads</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <Star className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                      <span>Smoother gameplay experience</span>
                    </li>
                    <li className="flex items-start text-sm">
                      <Star className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                      <span>Rewarded ads still available for bonuses</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handlePurchase(productIds.adRemoval[0])}
                  disabled={purchaseStore.isPurchasing || adStore.adFreeUser}
                >
                  {purchaseStore.isPurchasing ? 'Processing...' : 
                   adStore.adFreeUser ? 'Ads Already Removed' : 'Remove Ads'}
                </Button>
              </CardFooter>
            </Card>
            
            <div className="text-center mt-6 text-sm text-gray-500">
              <p>Note: All subscription plans already include ad removal as a benefit.</p>
              <p>This purchase is only necessary if you don't want a subscription but still want an ad-free experience.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewStorePanel;