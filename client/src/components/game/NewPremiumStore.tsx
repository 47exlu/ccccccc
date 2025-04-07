import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  BarChart4, 
  Crown,
  Rocket,
  Star,
  DollarSign,
  Zap,
  ShoppingBag,
  Gift,
  ShieldCheck,
  Music,
  Sparkles,
  TrendingUp,
  Award,
  Check,
  Flame,
  Diamond,
  Wallet,
  PlusCircle,
  Coins
} from 'lucide-react';

// Import Google Play Billing integration
import { 
  initializeGooglePlayBilling, 
  queryGooglePlayProducts, 
  makeGooglePlayPurchase, 
  registerGooglePlayPurchaseListener,
  GooglePlayProduct
} from './GooglePlayIntegration';

// Modern Premium Store component with Google Play integration
export function NewPremiumStore() {
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [isLoading, setIsLoading] = useState(true);
  // Using 'as any' temporarily to handle type issues - in a real app we'd properly type this
  const [products, setProducts] = useState<any[]>([
    // Standard Monthly
    {
      productId: 'com.rappersim.subscription.standard.monthly',
      type: 'subs',
      title: 'Standard Monthly',
      price: '$4.99',
      description: 'Basic features access with monthly billing',
      price_amount_micros: 4990000,
      price_currency_code: 'USD',
      subscriptionPeriod: 'P1M'
    },
    // Premium Monthly
    {
      productId: 'com.rappersim.subscription.premium.monthly',
      type: 'subs',
      title: 'Premium Monthly',
      price: '$9.99',
      description: 'Enhanced features with monthly billing',
      subscriptionPeriod: 'P1M'
    },
    // Platinum Monthly
    {
      productId: 'com.rappersim.subscription.platinum.monthly',
      type: 'subs',
      title: 'Platinum Monthly',
      price: '$19.99',
      description: 'All premium features with monthly billing',
      subscriptionPeriod: 'P1M'
    },
    // Standard Yearly
    {
      productId: 'com.rappersim.subscription.standard.yearly',
      type: 'subs',
      title: 'Standard Yearly',
      price: '$39.99',
      description: 'Basic features access with yearly billing (save 33%)',
      subscriptionPeriod: 'P1Y'
    },
    // Premium Yearly
    {
      productId: 'com.rappersim.subscription.premium.yearly',
      type: 'subs',
      title: 'Premium Yearly',
      price: '$89.99',
      description: 'Enhanced features with yearly billing (save 25%)',
      subscriptionPeriod: 'P1Y'
    },
    // Platinum Yearly
    {
      productId: 'com.rappersim.subscription.platinum.yearly',
      type: 'subs',
      title: 'Platinum Yearly',
      price: '$179.99',
      description: 'All premium features with yearly billing (save 25%)',
      subscriptionPeriod: 'P1Y'
    },
    // Currency packages
    {
      productId: 'com.rappersim.currency.small',
      type: 'inapp',
      title: 'Small Cash Pack',
      price: '$4.99',
      description: '10,000 in-game currency'
    },
    {
      productId: 'com.rappersim.currency.medium',
      type: 'inapp',
      title: 'Medium Cash Pack',
      price: '$9.99',
      description: '50,000 in-game currency + 5,000 bonus'
    },
    {
      productId: 'com.rappersim.currency.large',
      type: 'inapp',
      title: 'Large Cash Pack',
      price: '$19.99',
      description: '200,000 in-game currency + 30,000 bonus'
    },
    {
      productId: 'com.rappersim.currency.xl',
      type: 'inapp',
      title: 'XL Cash Pack',
      price: '$49.99',
      description: '1,000,000 in-game currency + 200,000 bonus'
    },
    // Featured content
    {
      productId: 'com.rappersim.feature.exlusive_beats',
      type: 'inapp',
      title: 'Premium Beats Collection',
      price: '$7.99',
      description: 'Unlock exclusive premium beats'
    },
    {
      productId: 'com.rappersim.feature.platinum_songs',
      type: 'inapp',
      title: 'Platinum Song Templates',
      price: '$14.99',
      description: 'Access platinum-tier song templates'
    },
    {
      productId: 'com.rappersim.feature.advanced_marketing',
      type: 'inapp',
      title: 'Advanced Marketing Tools',
      price: '$9.99',
      description: 'Professional marketing strategies and tools'
    }
  ]);
  
  // Mocked state and methods
  const gameStateRef = useRef({
    userId: 1,
    cash: 5000,
    premiumUser: false,
    subscriptionActive: false,
    subscriptionTier: 'none',
    updateSubscriptionStatus: (isSubscribed: boolean, subscriptionType: 'none' | 'standard' | 'premium' | 'platinum') => {
      gameStateRef.current = {
        ...gameStateRef.current,
        premiumUser: isSubscribed,
        subscriptionActive: isSubscribed,
        subscriptionTier: subscriptionType
      };
    }
  });
  
  // Initialize Google Play Billing and load products
  useEffect(() => {
    const loadGooglePlayProducts = async () => {
      try {
        setIsLoading(true);
        
        // Initialize Google Play Billing
        await initializeGooglePlayBilling();
        
        // Product IDs to query
        const productIds = [
          // Subscriptions
          'com.rappersim.subscription.standard.monthly',
          'com.rappersim.subscription.premium.monthly',
          'com.rappersim.subscription.platinum.monthly',
          'com.rappersim.subscription.standard.yearly',
          'com.rappersim.subscription.premium.yearly',
          'com.rappersim.subscription.platinum.yearly',
          // Currency packages
          'com.rappersim.currency.small',
          'com.rappersim.currency.medium',
          'com.rappersim.currency.large',
          'com.rappersim.currency.xl',
          // Features
          'com.rappersim.feature.exlusive_beats',
          'com.rappersim.feature.platinum_songs',
          'com.rappersim.feature.advanced_marketing'
        ];
        
        // Query products from Google Play
        const googlePlayProducts = await queryGooglePlayProducts(productIds);
        
        // Update state with products
        setProducts(googlePlayProducts);
        
        // Register purchase listener
        registerGooglePlayPurchaseListener((purchase) => {
          console.log('Purchase completed:', purchase);
          
          try {
            // Handle different types of purchases
            if (purchase.productId.includes('subscription')) {
              // Handle subscription purchases
              let tier = 'standard';
              if (purchase.productId.includes('premium')) tier = 'premium';
              if (purchase.productId.includes('platinum')) tier = 'platinum';
              
              // Update subscription status
              gameStateRef.current.updateSubscriptionStatus(true, tier as 'standard' | 'premium' | 'platinum');
              
              // Show success message with a timeout to ensure it appears after the UI update
              setTimeout(() => {
                alert(`Your ${tier} subscription is now active! Enjoy your premium benefits.`);
              }, 500);
              
            } else if (purchase.productId.includes('currency')) {
              // Handle currency purchases
              let amount = 10000; // Default for small pack
              
              if (purchase.productId.includes('medium')) {
                amount = 55000; // 50,000 + 5,000 bonus
              } else if (purchase.productId.includes('large')) {
                amount = 230000; // 200,000 + 30,000 bonus
              } else if (purchase.productId.includes('xl')) {
                amount = 1200000; // 1,000,000 + 200,000 bonus
              }
              
              // In a real app, we would update the user's currency via the game state
              // For this demo, we'll just alert
              alert(`Added ${amount.toLocaleString()} in-game currency to your account!`);
              
            } else if (purchase.productId.includes('feature')) {
              // Handle feature purchases
              let featureName = "premium feature";
              
              if (purchase.productId.includes('beats')) {
                featureName = "Premium Beats Collection";
              } else if (purchase.productId.includes('songs')) {
                featureName = "Platinum Song Templates";
              } else if (purchase.productId.includes('marketing')) {
                featureName = "Advanced Marketing Tools";
              }
              
              // Show success message
              alert(`Successfully unlocked ${featureName}!`);
            }
          } catch (error) {
            console.error('Error processing purchase:', error);
            alert('There was an error processing your purchase. Please contact support.');
          } finally {
            // Refresh UI
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 100);
          }
        });
      } catch (error) {
        console.error('Failed to initialize Google Play Billing:', error);
        alert('Failed to connect to the store. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGooglePlayProducts();
  }, []);
  
  // Filter products by subscription period
  const getSubscriptionsByPeriod = useCallback((period: string) => {
    return products.filter(product => 
      product.type === 'subs' && 
      product.productId.includes(period)
    );
  }, [products]);
  
  // Get benefits by tier
  const getSubscriptionBenefits = useCallback((tier: string): string[] => {
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
  }, []);
  
  // Featured premium content
  const featuredContent = [
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
  
  // Handle purchase through Google Play
  const handlePurchase = async (productId: string) => {
    try {
      setIsLoading(true);
      
      // Launch Google Play billing flow
      const success = await makeGooglePlayPurchase(productId);
      
      if (success) {
        // Purchase will be handled by the purchase listener registered in useEffect
        console.log('Purchase initiated successfully');
      } else {
        console.error('Purchase failed');
        alert('Purchase failed. Please try again.');
      }
    } catch (error) {
      console.error('Error making purchase:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to process purchase'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      {/* Animated background elements */}
      <div className="absolute top-[15%] left-[10%] w-40 h-40 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute top-[40%] right-[10%] w-56 h-56 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-[10%] left-[20%] w-48 h-48 bg-amber-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      {/* Header with gradient */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Premium Store
          </h1>
          <div className="flex items-center space-x-4 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 shadow-xl border border-white/10">
            <DollarSign className="h-5 w-5 text-green-400" />
            <div className="font-semibold text-lg text-white">${gameStateRef.current.cash.toLocaleString()}</div>
          </div>
        </div>
        <p className="text-gray-300 text-sm max-w-2xl">
          Upgrade your rap career with premium features, boosts, and exclusive content. Choose from monthly or yearly subscription plans.
        </p>
      </div>
      
      {gameStateRef.current.premiumUser && gameStateRef.current.subscriptionActive && (
        <Alert className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-blue-200">
          <Star className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Active Subscription</AlertTitle>
          <AlertDescription className="text-blue-700">
            You currently have an active {gameStateRef.current.subscriptionTier || 'standard'} subscription.
            Enjoy your premium benefits!
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="virtualCurrency">Currency</TabsTrigger>
          <TabsTrigger value="features">Premium Features</TabsTrigger>
        </TabsList>
        
        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Subscriptions */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center">Monthly</h2>
              {isLoading ? (
                <div className="flex justify-center py-12">Loading subscriptions...</div>
              ) : (
                getSubscriptionsByPeriod('monthly').map((product) => {
                  const tier = product.productId.includes('premium') ? 'premium' : 
                              product.productId.includes('platinum') ? 'platinum' : 'standard';
                  const benefits = getSubscriptionBenefits(tier);
                  
                  return (
                    <Card key={product.productId} className={`
                      relative overflow-hidden transition-all duration-300 hover:shadow-xl
                      ${tier === 'standard' ? 'border-blue-300' : ''}
                      ${tier === 'premium' ? 'border-purple-400' : ''}
                      ${tier === 'platinum' ? 'border-amber-400' : ''}
                    `}>
                      {/* Background gradient effect */}
                      <div className={`absolute inset-0 opacity-10 
                        ${tier === 'standard' ? 'bg-gradient-to-br from-blue-300 to-blue-600' : ''}
                        ${tier === 'premium' ? 'bg-gradient-to-br from-purple-300 to-purple-600' : ''}
                        ${tier === 'platinum' ? 'bg-gradient-to-br from-amber-300 to-amber-600' : ''}
                      `}></div>
                      
                      {/* Tier icon */}
                      <div className="absolute top-2 right-2 opacity-10">
                        {tier === 'standard' && <ShieldCheck className="h-20 w-20 text-blue-500" />}
                        {tier === 'premium' && <Crown className="h-20 w-20 text-purple-500" />}
                        {tier === 'platinum' && <Diamond className="h-20 w-20 text-amber-500" />}
                      </div>
                      
                      <CardHeader className={`
                        relative pb-2 z-10
                        ${tier === 'standard' ? 'bg-gradient-to-r from-blue-50 to-blue-100/50' : ''}
                        ${tier === 'premium' ? 'bg-gradient-to-r from-purple-50 to-purple-100/50' : ''}
                        ${tier === 'platinum' ? 'bg-gradient-to-r from-amber-50 to-amber-100/50' : ''}
                      `}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {tier === 'standard' && <ShieldCheck className="h-5 w-5 mr-2 text-blue-600" />}
                            {tier === 'premium' && <Crown className="h-5 w-5 mr-2 text-purple-600" />}
                            {tier === 'platinum' && <Diamond className="h-5 w-5 mr-2 text-amber-600" />}
                            <CardTitle className="capitalize">{tier}</CardTitle>
                          </div>
                          <Badge variant="outline" className={`
                            ${tier === 'standard' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                            ${tier === 'premium' ? 'bg-purple-100 text-purple-800 border-purple-200' : ''}
                            ${tier === 'platinum' ? 'bg-amber-100 text-amber-800 border-amber-200' : ''}
                          `}>
                            Monthly
                          </Badge>
                        </div>
                        <CardDescription className="font-semibold mt-1 text-base">
                          {product.price} <span className="text-xs">/month</span>
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
                            (gameStateRef.current.premiumUser && 
                            gameStateRef.current.subscriptionActive && 
                            gameStateRef.current.subscriptionTier === tier)
                          }
                          variant={tier === 'standard' ? 'default' : 
                                  tier === 'premium' ? 'secondary' : 
                                  'outline'}
                        >
                          {(gameStateRef.current.premiumUser && 
                            gameStateRef.current.subscriptionActive && 
                            gameStateRef.current.subscriptionTier === tier) ? 'Current Plan' : 'Subscribe'}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })
              )}
            </div>
            
            {/* Yearly Subscriptions */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center">Yearly (Best Value)</h2>
              {isLoading ? (
                <div className="flex justify-center py-12">Loading subscriptions...</div>
              ) : (
                getSubscriptionsByPeriod('yearly').map((product) => {
                  const tier = product.productId.includes('premium') ? 'premium' : 
                              product.productId.includes('platinum') ? 'platinum' : 'standard';
                  const benefits = getSubscriptionBenefits(tier);
                  
                  return (
                    <Card key={product.productId} className={`
                      relative overflow-hidden transition-all duration-300 hover:shadow-xl
                      ${tier === 'standard' ? 'border-blue-300' : ''}
                      ${tier === 'premium' ? 'border-purple-400' : ''}
                      ${tier === 'platinum' ? 'border-amber-400' : ''}
                    `}>
                      {/* Savings badge */}
                      <div className="absolute -top-1 -right-1 z-20">
                        <div className={`
                          px-2 py-1 text-xs font-bold transform rotate-12 shadow-lg rounded
                          ${tier === 'standard' ? 'bg-blue-600 text-white' : ''}
                          ${tier === 'premium' ? 'bg-purple-600 text-white' : ''}
                          ${tier === 'platinum' ? 'bg-amber-600 text-white' : ''}
                        `}>
                          SAVE 25%
                        </div>
                      </div>
                      
                      {/* Background gradient effect */}
                      <div className={`absolute inset-0 opacity-10 
                        ${tier === 'standard' ? 'bg-gradient-to-br from-blue-300 to-blue-600' : ''}
                        ${tier === 'premium' ? 'bg-gradient-to-br from-purple-300 to-purple-600' : ''}
                        ${tier === 'platinum' ? 'bg-gradient-to-br from-amber-300 to-amber-600' : ''}
                      `}></div>
                      
                      {/* Tier icon */}
                      <div className="absolute top-2 right-2 opacity-10">
                        {tier === 'standard' && <ShieldCheck className="h-20 w-20 text-blue-500" />}
                        {tier === 'premium' && <Crown className="h-20 w-20 text-purple-500" />}
                        {tier === 'platinum' && <Diamond className="h-20 w-20 text-amber-500" />}
                      </div>
                      
                      <CardHeader className={`
                        relative pb-2 z-10
                        ${tier === 'standard' ? 'bg-gradient-to-r from-blue-50 to-blue-100/50' : ''}
                        ${tier === 'premium' ? 'bg-gradient-to-r from-purple-50 to-purple-100/50' : ''}
                        ${tier === 'platinum' ? 'bg-gradient-to-r from-amber-50 to-amber-100/50' : ''}
                      `}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {tier === 'standard' && <ShieldCheck className="h-5 w-5 mr-2 text-blue-600" />}
                            {tier === 'premium' && <Crown className="h-5 w-5 mr-2 text-purple-600" />}
                            {tier === 'platinum' && <Diamond className="h-5 w-5 mr-2 text-amber-600" />}
                            <CardTitle className="capitalize">{tier}</CardTitle>
                          </div>
                          <Badge variant="outline" className={`
                            ${tier === 'standard' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                            ${tier === 'premium' ? 'bg-purple-100 text-purple-800 border-purple-200' : ''}
                            ${tier === 'platinum' ? 'bg-amber-100 text-amber-800 border-amber-200' : ''}
                          `}>
                            Yearly
                          </Badge>
                        </div>
                        <CardDescription className="font-semibold mt-1 text-base">
                          {product.price} <span className="text-xs">/year</span>
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
                            (gameStateRef.current.premiumUser && 
                            gameStateRef.current.subscriptionActive && 
                            gameStateRef.current.subscriptionTier === tier)
                          }
                          variant={tier === 'standard' ? 'default' : 
                                  tier === 'premium' ? 'secondary' : 
                                  'outline'}
                        >
                          {(gameStateRef.current.premiumUser && 
                            gameStateRef.current.subscriptionActive && 
                            gameStateRef.current.subscriptionTier === tier) ? 'Current Plan' : 'Subscribe'}
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
            {isLoading ? (
              <div className="col-span-full flex justify-center py-12">Loading currency packages...</div>
            ) : (
              products
                .filter(product => product.productId.includes('currency'))
                .map(product => (
                  <Card key={product.productId} className="relative overflow-hidden transition-all duration-300 hover:shadow-xl border-emerald-300">
                    {/* Background gradient effect */}
                    <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-emerald-300 to-emerald-600"></div>
                    
                    {/* Currency icon */}
                    <div className="absolute top-2 right-2 opacity-5">
                      <DollarSign className="h-20 w-20 text-emerald-500" />
                    </div>
                    
                    <CardHeader className="relative pb-2 z-10 bg-gradient-to-r from-emerald-50 to-emerald-100/50">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Coins className="h-5 w-5 mr-2 text-emerald-600" />
                          <CardTitle>{product.title}</CardTitle>
                        </div>
                        {product.productId.includes('xl') && (
                          <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                            BEST VALUE
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="font-semibold mt-1 text-base">
                        {product.price}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 relative z-10">
                      <div className="flex justify-center items-center mb-4 text-2xl font-bold text-emerald-800">
                        <span className="text-sm text-emerald-600 mr-1">$</span>
                        {product.productId.includes('small') && '10,000'}
                        {product.productId.includes('medium') && '55,000'}
                        {product.productId.includes('large') && '230,000'}
                        {product.productId.includes('xl') && '1,200,000'}
                      </div>
                      <p className="text-sm text-center">{product.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800"
                        onClick={() => handlePurchase(product.productId)}
                      >
                        Purchase
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
            {isLoading ? (
              <div className="col-span-full flex justify-center py-12">Loading premium features...</div>
            ) : (
              featuredContent.map(feature => {
                const product = products.find(p => p.productId === feature.productId);
                
                return (
                  <Card key={feature.productId} className={`
                    relative overflow-hidden transition-all duration-300 hover:shadow-xl group
                    ${feature.tier === 'standard' ? 'border-blue-300' : ''}
                    ${feature.tier === 'premium' ? 'border-purple-400' : ''}
                    ${feature.tier === 'platinum' ? 'border-amber-400' : ''}
                  `}>
                    {/* Background gradient effect */}
                    <div className={`absolute inset-0 opacity-10 
                      ${feature.tier === 'standard' ? 'bg-gradient-to-br from-blue-300 to-blue-600' : ''}
                      ${feature.tier === 'premium' ? 'bg-gradient-to-br from-purple-300 to-purple-600' : ''}
                      ${feature.tier === 'platinum' ? 'bg-gradient-to-br from-amber-300 to-amber-600' : ''}
                    `}></div>
                    
                    {/* Card header */}
                    <CardHeader className={`
                      relative pb-2 z-10
                      ${feature.tier === 'standard' ? 'bg-gradient-to-r from-blue-50 to-blue-100/50' : ''}
                      ${feature.tier === 'premium' ? 'bg-gradient-to-r from-purple-50 to-purple-100/50' : ''}
                      ${feature.tier === 'platinum' ? 'bg-gradient-to-r from-amber-50 to-amber-100/50' : ''}
                    `}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          {feature.tier === 'standard' && <ShieldCheck className="h-5 w-5 mr-2 text-blue-600" />}
                          {feature.tier === 'premium' && <Crown className="h-5 w-5 mr-2 text-purple-600" />}
                          {feature.tier === 'platinum' && <Diamond className="h-5 w-5 mr-2 text-amber-600" />}
                          <CardTitle className="text-base font-bold">{feature.title}</CardTitle>
                        </div>
                        {feature.badgeText && (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                            {feature.badgeText}
                          </Badge>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <Badge variant="outline" className={`
                          ${feature.tier === 'standard' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                          ${feature.tier === 'premium' ? 'bg-purple-100 text-purple-800 border-purple-200' : ''}
                          ${feature.tier === 'platinum' ? 'bg-amber-100 text-amber-800 border-amber-200' : ''}
                        `}>
                          {feature.tier.charAt(0).toUpperCase() + feature.tier.slice(1)}
                        </Badge>
                        <CardDescription className="font-semibold">
                          {product?.price || '$5.99'}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    
                    {/* Card content */}
                    <CardContent className="pt-6 pb-8 relative z-10">
                      <div className="flex justify-center mb-6 transform transition-transform duration-500 group-hover:scale-110">
                        <div className={`
                          rounded-full p-4
                          ${feature.tier === 'standard' ? 'bg-blue-100' : ''}
                          ${feature.tier === 'premium' ? 'bg-purple-100' : ''}
                          ${feature.tier === 'platinum' ? 'bg-amber-100' : ''}
                        `}>
                          {feature.icon}
                        </div>
                      </div>
                      <p className="text-sm text-center px-4">{feature.description}</p>
                    </CardContent>
                    
                    {/* Card footer */}
                    <CardFooter className="pt-2 pb-4">
                      <Button 
                        className={`
                          w-full transition-all duration-300 
                          ${feature.tier === 'standard' ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800' : ''}
                          ${feature.tier === 'premium' ? 'bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800' : ''}
                          ${feature.tier === 'platinum' ? 'bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800' : ''}
                        `}
                        onClick={() => handlePurchase(feature.productId)}
                      >
                        Purchase
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}