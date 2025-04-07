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
import { AlertCircle, AlertTriangle, DollarSign, Gift, Package, ShoppingBag, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

import { useRapperGame } from '@/lib/stores/useRapperGame';
import { usePurchaseStore } from '@/lib/stores/usePurchaseStore';
import { useAdStore } from '@/lib/stores/useAdStore';
import { useEnergyStore } from '@/lib/stores/useEnergyStore';
import { useAudio } from '@/lib/stores/useAudio';

import type { GooglePlayProduct } from '@/lib/services/googlePlayService';

export const StorePanel = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [isLoading, setIsLoading] = useState(true);
  
  // Get relevant game state
  const gameState = useRapperGame((state) => ({
    week: state.week,
    userId: state.userId || 1, // Default to user ID 1 if not set
    cash: state.cash,
    premiumUser: state.premiumUser,
    subscriptionActive: state.subscriptionActive,
    subscriptionTier: state.subscriptionTier,
    updateGameState: state.updateGameState,
  }));
  
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
  
  // Define product IDs for the different store tabs
  const productIds = {
    subscriptions: [
      'com.rapgame.standard.monthly',
      'com.rapgame.premium.monthly',
      'com.rapgame.platinum.monthly',
      'com.rapgame.standard.quarterly',
      'com.rapgame.premium.quarterly',
      'com.rapgame.platinum.quarterly',
      'com.rapgame.standard.yearly',
      'com.rapgame.premium.yearly',
      'com.rapgame.platinum.yearly'
    ],
    virtualCurrency: [
      'com.rapgame.smallcash',
      'com.rapgame.mediumcash',
      'com.rapgame.largecash',
      'com.rapgame.xlcash'
    ],
    energy: [
      'com.rapgame.energy.small',
      'com.rapgame.energy.medium',
      'com.rapgame.energy.large',
      'com.rapgame.energy.unlimited24h'
    ],
    adRemoval: [
      'com.rapgame.ad_removal'
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
      
      // Load products for the active tab
      if (activeTab && productIds[activeTab as keyof typeof productIds]) {
        await purchaseStore.loadProducts(productIds[activeTab as keyof typeof productIds]);
      }
      
      setIsLoading(false);
    };
    
    initialize();
  }, []);
  
  // Load products when tab changes
  useEffect(() => {
    if (activeTab && productIds[activeTab as keyof typeof productIds]) {
      purchaseStore.loadProducts(productIds[activeTab as keyof typeof productIds]);
    }
  }, [activeTab]);
  
  // Handle errors
  useEffect(() => {
    if (purchaseStore.error) {
      toast({
        title: 'Error',
        description: purchaseStore.error,
        variant: 'destructive'
      });
      purchaseStore.clearError();
    }
    
    if (adStore.error) {
      toast({
        title: 'Ad Error',
        description: adStore.error,
        variant: 'destructive'
      });
      adStore.clearError();
    }
  }, [purchaseStore.error, adStore.error, toast]);
  
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
          
          // Update game state
          gameState.updateGameState({
            premiumUser: true,
            subscriptionActive: true,
            subscriptionTier: tier,
          });
        } else if (productId.includes('currency')) {
          // Determine currency amount
          let amount = 10000;
          if (productId.includes('medium')) amount = 50000;
          if (productId.includes('large')) amount = 200000;
          if (productId.includes('huge')) amount = 1000000;
          
          // Update game state
          gameState.updateGameState({
            cash: gameState.cash + amount
          });
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
        } else if (productId.includes('ad_free')) {
          // Update ad free status
          adStore.setAdFreeStatus(true);
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
        gameState.updateGameState({
          cash: gameState.cash + amount
        });
        
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
  
  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Game Store</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">Current Cash:</div>
          <div className="font-bold text-green-600">${gameState.cash.toLocaleString()}</div>
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
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="virtualCurrency">Virtual Currency</TabsTrigger>
          <TabsTrigger value="energy">Energy</TabsTrigger>
          <TabsTrigger value="adRemoval">Ad Removal</TabsTrigger>
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
            {isLoading || purchaseStore.isLoadingProducts ? (
              <div className="flex justify-center py-12 col-span-2">Loading currency packages...</div>
            ) : (
              purchaseStore.products
                .filter(product => product.productId.includes('currency'))
                .map((product) => {
                  // Determine amount from the product ID
                  let amount = 10000;
                  if (product.productId.includes('medium')) amount = 50000;
                  if (product.productId.includes('large')) amount = 200000;
                  if (product.productId.includes('huge')) amount = 1000000;
                  
                  // Determine if there's a bonus
                  let bonus = 0;
                  if (product.productId.includes('medium')) bonus = 5000;
                  if (product.productId.includes('large')) bonus = 30000;
                  if (product.productId.includes('huge')) bonus = 200000;
                  
                  return (
                    <Card key={product.productId} className="relative overflow-hidden">
                      {bonus > 0 && (
                        <div className="absolute -right-8 top-6 transform rotate-45 bg-green-600 text-white px-10 py-1 text-xs font-bold">
                          +{(bonus / amount * 100).toFixed(0)}% BONUS
                        </div>
                      )}
                      
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center">
                          <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                          {product.title}
                        </CardTitle>
                        <CardDescription>{product.price}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-center text-green-600">
                          ${amount.toLocaleString()}
                        </div>
                        {bonus > 0 && (
                          <div className="text-sm text-center text-green-600 mt-1">
                            + ${bonus.toLocaleString()} bonus
                          </div>
                        )}
                        <Separator className="my-4" />
                        <div className="text-sm text-gray-600">
                          {product.description}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full"
                          onClick={() => handlePurchase(product.productId)}
                          disabled={purchaseStore.isPurchasing}
                        >
                          {purchaseStore.isPurchasing ? 'Processing...' : 'Purchase'}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })
            )}
          </div>
          
          {/* Free Currency Option (Rewarded Ad) */}
          <div className="mt-8">
            <Card className="border-dashed border-2 border-gray-300">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Gift className="h-5 w-5 mr-2 text-purple-600" />
                  Free Game Cash
                </CardTitle>
                <CardDescription>Watch a short ad to earn rewards</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">
                    Earn up to $100 per ad!
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    Watch a short advertisement to earn free in-game cash. Available every 5 minutes.
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  variant="outline"
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
                <Card className="relative overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
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
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                      onClick={() => handlePurchase('com.rapgame.energy.small')}
                      disabled={purchaseStore.isPurchasing}
                    >
                      {purchaseStore.isPurchasing ? 'Processing...' : 'Get'}
                    </Button>
                  </CardFooter>
                </Card>

                {/* Medium Energy Pack */}
                <Card className="relative overflow-hidden">
                  <div className="absolute -right-8 top-6 transform rotate-45 bg-blue-600 text-white px-10 py-1 text-xs font-bold">
                    +20 BONUS
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                      Medium Energy Pack
                    </CardTitle>
                    <CardDescription className="flex items-center">
                      Free
                      <Badge className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Google Play</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-center text-amber-500">
                      150 Energy Units
                      <div className="text-sm text-center text-blue-500 mt-1">
                        + 20 bonus
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="text-sm text-gray-600">
                      A medium boost of energy for your creative sessions.
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                      onClick={() => handlePurchase('com.rapgame.energy.medium')}
                      disabled={purchaseStore.isPurchasing}
                    >
                      {purchaseStore.isPurchasing ? 'Processing...' : 'Get'}
                    </Button>
                  </CardFooter>
                </Card>

                {/* Large Energy Pack */}
                <Card className="relative overflow-hidden">
                  <div className="absolute -right-8 top-6 transform rotate-45 bg-blue-600 text-white px-10 py-1 text-xs font-bold">
                    +100 BONUS
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                      Large Energy Pack
                    </CardTitle>
                    <CardDescription className="flex items-center">
                      Free
                      <Badge className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Google Play</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-center text-amber-500">
                      500 Energy Units
                      <div className="text-sm text-center text-blue-500 mt-1">
                        + 100 bonus
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="text-sm text-gray-600">
                      Large energy boost for extended studio sessions.
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                      onClick={() => handlePurchase('com.rapgame.energy.large')}
                      disabled={purchaseStore.isPurchasing}
                    >
                      {purchaseStore.isPurchasing ? 'Processing...' : 'Get'}
                    </Button>
                  </CardFooter>
                </Card>

                {/* Unlimited Energy */}
                <Card className="relative overflow-hidden">
                  <div className="absolute -right-8 top-6 transform rotate-45 bg-purple-600 text-white px-10 py-1 text-xs font-bold">
                    BEST VALUE
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                      Unlimited Energy (24 Hours)
                    </CardTitle>
                    <CardDescription className="flex items-center">
                      Free
                      <Badge className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Google Play</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-xl font-bold text-center text-amber-500">
                      UNLIMITED ENERGY
                      <div className="text-sm font-normal mt-1">For 24 hours</div>
                    </div>
                    <Separator className="my-4" />
                    <div className="text-sm text-gray-600">
                      Unlimited energy for 24 hours! Create as many songs as you want.
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                      onClick={() => handlePurchase('com.rapgame.energy.unlimited24h')}
                      disabled={purchaseStore.isPurchasing}
                    >
                      {purchaseStore.isPurchasing ? 'Processing...' : 'Get'}
                    </Button>
                  </CardFooter>
                </Card>
              </>
            )}
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
            <h3 className="text-lg font-semibold flex items-center mb-2">
              <AlertCircle className="h-5 w-5 mr-2 text-amber-600" />
              About Energy
            </h3>
            <p className="text-sm mb-2">
              Energy is required to create songs and perform other actions in the game. Each song requires different amounts of energy depending on its quality tier.
            </p>
            <p className="text-sm">
              Energy regenerates slowly over time, but you can purchase energy packs to instantly restore it or buy unlimited energy for 24 hours.
            </p>
          </div>
        </TabsContent>
        
        {/* Ad Removal Tab */}
        <TabsContent value="adRemoval" className="space-y-6">
          {adStore.adFreeUser ? (
            <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Ad-Free Experience Active</AlertTitle>
              <AlertDescription className="text-green-700">
                You already have the ad-free experience! Enjoy the game without interruptions.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Alert className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">Ads Support Game Development</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    Ads help us keep the game updated with new features. If you prefer an ad-free experience, 
                    you can purchase the option below or subscribe to any of our premium plans.
                  </AlertDescription>
                </Alert>
              </div>
              
              {isLoading || purchaseStore.isLoadingProducts ? (
                <div className="flex justify-center py-12 md:col-span-2">Loading ad removal options...</div>
              ) : (
                purchaseStore.products
                  .filter(product => product.productId.includes('ad_free'))
                  .map((product) => (
                    <Card key={product.productId} className="md:col-span-2 max-w-md mx-auto">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center">
                          <Package className="h-5 w-5 mr-2 text-blue-600" />
                          {product.title}
                        </CardTitle>
                        <CardDescription>One-time purchase: {product.price}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-4">
                          <div className="text-center text-lg font-medium">
                            Remove all advertisements permanently!
                          </div>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <Star className="h-4 w-4 mr-2 mt-0.5 text-yellow-500" />
                              <span>No banner ads</span>
                            </li>
                            <li className="flex items-start">
                              <Star className="h-4 w-4 mr-2 mt-0.5 text-yellow-500" />
                              <span>No interstitial ads</span>
                            </li>
                            <li className="flex items-start">
                              <Star className="h-4 w-4 mr-2 mt-0.5 text-yellow-500" />
                              <span>No video ads</span>
                            </li>
                            <li className="flex items-start">
                              <Star className="h-4 w-4 mr-2 mt-0.5 text-yellow-500" />
                              <span>Completely ad-free experience</span>
                            </li>
                            <li className="flex items-start">
                              <Star className="h-4 w-4 mr-2 mt-0.5 text-yellow-500" />
                              <span>Rewarded ads still available if you want to earn bonuses</span>
                            </li>
                          </ul>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full"
                          onClick={() => handlePurchase(product.productId)}
                          disabled={purchaseStore.isPurchasing}
                        >
                          {purchaseStore.isPurchasing ? 'Processing...' : 'Purchase Ad-Free Experience'}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
              )}
            </div>
          )}
          
          <div className="text-sm text-gray-500 mt-6">
            <p>* Ad removal is a one-time purchase that will permanently remove all non-rewarded advertisements.</p>
            <p>* Rewarded ads will still be available if you choose to watch them for in-game rewards.</p>
            <p>* All premium subscriptions also include ad removal as a benefit.</p>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Ad banner at the bottom */}
      {!adStore.adFreeUser && !gameState.premiumUser && (
        <div id="ad-container" className="mt-8 w-full">
          {/* This div will be populated by the ad system */}
          <div style={{
            width: '100%', 
            height: '50px', 
            backgroundColor: '#eee', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid #ccc', 
            borderRadius: '4px', 
            margin: '8px 0'
          }}>
            <span style={{color: '#666', fontSize: '12px'}}>AD PLACEHOLDER</span>
          </div>
        </div>
      )}
    </div>
  );
};