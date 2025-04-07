import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

// Subscription plan options
const SUBSCRIPTION_PLANS = [
  {
    id: 'rapper_standard_monthly',
    name: 'Rapper Standard',
    description: 'Monthly subscription with basic features',
    price: 4.99,
    period: 'monthly',
    features: [
      'Ad-free experience',
      'Exclusive content',
      'Priority support'
    ]
  },
  {
    id: 'rapper_premium_monthly',
    name: 'Rapper Premium',
    description: 'Monthly subscription with premium features',
    price: 9.99,
    period: 'monthly',
    features: [
      'All Standard features',
      'Premium songs and beats',
      'Advanced career statistics',
      '2x in-game currency rewards'
    ]
  },
  {
    id: 'rapper_platinum_yearly',
    name: 'Rapper Platinum',
    description: 'Yearly subscription with all features',
    price: 20.00,
    period: 'yearly',
    features: [
      'All Premium features',
      'Exclusive platinum content',
      'Unlimited song recordings',
      '3x in-game currency rewards',
      'Early access to new features'
    ],
    bestValue: true
  }
];

type PaymentMethod = 'paypal' | 'credit_card';

const SubscribePage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<typeof SUBSCRIPTION_PLANS[0] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paypal');
  const [promoCode, setPromoCode] = useState('');
  const [validPromoCode, setValidPromoCode] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [paypalClientId, setPaypalClientId] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
  
  // Credit card form state (simplified for demo)
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCvv] = useState('');
  
  // Call ensureTestUser when component mounts
  useEffect(() => {
    ensureTestUser();
  }, []);

  // Create or ensure a test user exists
  const ensureTestUser = async () => {
    try {
      const response = await apiRequest('POST', '/api/test-user', {});
      if (!response.ok) {
        throw new Error('Failed to create test user');
      }
      const data = await response.json();
      console.log('Test user available:', data.user);
      return data.user;
    } catch (error) {
      console.error('Error ensuring test user:', error);
      setErrorMsg('Could not create a test user. Please try again.');
      return null;
    }
  };

  // Handle plan selection
  const handleSelectPlan = (plan: typeof SUBSCRIPTION_PLANS[0]) => {
    setSelectedPlan(plan);
    // Reset promo code validation when changing plans
    setValidPromoCode(null);
    setPromoCode('');
    // Clear messages
    setErrorMsg(null);
    setSuccessMsg(null);
    
    // Ensure we have a test user ready
    ensureTestUser();
  };

  // Calculate price with discount if applicable
  const calculatePrice = (basePrice: number): number => {
    if (!validPromoCode) return basePrice;
    
    if (validPromoCode.discountType === 'percentage') {
      return basePrice * (1 - (validPromoCode.discountValue / 100));
    } else if (validPromoCode.discountType === 'amount') {
      return Math.max(0, basePrice - validPromoCode.discountValue);
    }
    
    return basePrice;
  };

  // Validate promo code
  const validatePromoCode = async () => {
    if (!promoCode.trim() || !selectedPlan) return;
    
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      
      const response = await apiRequest('POST', '/api/promo-codes/validate', {
        code: promoCode,
        productId: selectedPlan.id,
        userId: 1 // Hardcoded for demo, in a real app would get from current user
      });
      
      const data = await response.json();
      
      if (response.ok && data.valid) {
        setValidPromoCode(data);
        setSuccessMsg('Promo code applied! Your discount has been applied to the subscription.');
      } else {
        setValidPromoCode(null);
        setErrorMsg(data.error || 'The promo code you entered is not valid.');
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      setErrorMsg('Failed to validate promo code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle credit card subscription
  const handleCreditCardSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      setErrorMsg('Please select a subscription plan first.');
      return;
    }
    
    // Basic validation
    if (cardNumber.length < 16 || cardExpiry.length < 5 || cardCvv.length < 3 || !cardName) {
      setErrorMsg('Please enter valid credit card information.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      
      // Create subscription with credit card payment method
      const response = await apiRequest('POST', '/api/subscriptions', {
        userId: 1, // Hardcoded for demo
        planId: selectedPlan.id,
        billingPeriod: selectedPlan.period,
        paymentMethod: {
          type: 'credit_card',
          details: {
            // In a real app, you would use a secure payment processor 
            // instead of sending card details directly to your server
            cardholderName: cardName,
            // Only sending last 4 digits for demo purposes
            last4: cardNumber.slice(-4),
            expiryDate: cardExpiry
          }
        },
        promoCode: validPromoCode ? promoCode : undefined
      });
      
      if (!response.ok) {
        // Handle specific error cases
        const errorData = await response.json();
        
        if (errorData.error === "User not found") {
          // For demo purposes, show a special message about login requirement
          setSuccessMsg("This is a demo. In a real app, you would need to log in first to subscribe.");
          return;
        }
        
        throw new Error(errorData.error || 'Failed to create subscription');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccessMsg(`You've successfully subscribed to ${selectedPlan.name}.`);
        
        // Redirect to success page or dashboard
        setTimeout(() => {
          // Pass the subscription type to the success page
          const subscriptionType = selectedPlan.id.includes('premium') 
            ? 'premium' 
            : selectedPlan.id.includes('platinum') 
              ? 'platinum' 
              : 'standard';
          
          setLocation(`/subscription-success?type=${subscriptionType}`);
        }, 1500);
      } else {
        throw new Error(data.error || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      setErrorMsg(error instanceof Error ? error.message : 'Failed to process your subscription.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize PayPal subscription
  const initializePayPalSubscription = async () => {
    if (!selectedPlan) {
      setErrorMsg('Please select a subscription plan first.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      
      // Create pending subscription with PayPal payment method
      const response = await apiRequest('POST', '/api/subscriptions', {
        userId: 1, // Hardcoded for demo
        planId: selectedPlan.id,
        billingPeriod: selectedPlan.period,
        paymentMethod: {
          type: 'paypal',
          details: {}
        },
        promoCode: validPromoCode ? promoCode : undefined
      });
      
      if (!response.ok) {
        // Handle specific error cases
        const errorData = await response.json();
        
        if (errorData.error === "User not found") {
          // For demo purposes, show a special message about login requirement
          setSuccessMsg("This is a demo. In a real app, you would need to log in first to subscribe.");
          return;
        }
        
        throw new Error(errorData.error || 'Failed to initialize PayPal subscription');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Store subscription ID for later confirmation
        setSubscriptionId(data.subscription.id);
        
        // Get PayPal client ID from response
        if (data.paymentInfo && data.paymentInfo.clientId) {
          setPaypalClientId(data.paymentInfo.clientId);
        } else {
          throw new Error('PayPal client ID not received');
        }
      } else {
        throw new Error(data.error || 'Failed to initialize PayPal subscription');
      }
    } catch (error) {
      console.error('Error initializing PayPal subscription:', error);
      setErrorMsg(error instanceof Error ? error.message : 'Failed to initialize PayPal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format credit card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return value;
  };

  // Handle PayPal approval
  const handlePayPalApproval = async (data: any, actions: any) => {
    try {
      // Implement PayPal approval handling logic
      if (subscriptionId) {
        const response = await apiRequest('POST', `/api/subscriptions/${subscriptionId}/confirm`, {
          paypalOrderId: data.orderID
        });
        
        if (response.ok) {
          setSuccessMsg('PayPal subscription confirmed successfully!');
          setTimeout(() => {
            // Pass the subscription type to the success page
            const subscriptionType = selectedPlan?.id.includes('premium') 
              ? 'premium' 
              : selectedPlan?.id.includes('platinum') 
                ? 'platinum' 
                : 'standard';
            
            setLocation(`/subscription-success?type=${subscriptionType}`);
          }, 1500);
        } else {
          throw new Error('Failed to confirm subscription');
        }
      }
    } catch (error) {
      console.error('Error handling PayPal approval:', error);
      setErrorMsg(error instanceof Error ? error.message : 'Failed to confirm PayPal subscription.');
    }
  };

  return (
    <div className="bg-gradient-to-b from-background to-secondary/20 py-10">
      <div className="container max-w-6xl mx-auto px-4 pb-20">
        <div className="mb-6">
          <Link to="/" className="flex items-center text-primary hover:underline">
            <svg 
              className="h-5 w-5 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to App
          </Link>
        </div>
        
        <h1 className="text-4xl font-bold text-center mb-2">Choose Your Subscription</h1>
        <p className="text-center text-muted-foreground mb-8">Unlock premium features and take your rap career to the next level</p>
        
        {/* Error/Success Messages */}
        {errorMsg && (
          <div className="max-w-md mx-auto mb-6 p-4 border border-red-300 bg-red-50 text-red-700 rounded-md">
            {errorMsg}
          </div>
        )}
        
        {successMsg && (
          <div className="max-w-md mx-auto mb-6 p-4 border border-green-300 bg-green-50 text-green-700 rounded-md">
            {successMsg}
          </div>
        )}
        
        {/* Plan selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div 
              key={plan.id}
              className={`rounded-lg border border-border p-6 transition-all hover:shadow-lg cursor-pointer relative ${
                selectedPlan?.id === plan.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleSelectPlan(plan)}
            >
              {plan.bestValue && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs py-1 px-3 rounded-full font-bold">
                  BEST VALUE
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              <div className="text-3xl font-bold mb-4">
                ${calculatePrice(plan.price).toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground">/{plan.period}</span>
                {validPromoCode && selectedPlan?.id === plan.id && (
                  <div className="text-sm text-primary line-through font-normal">
                    ${plan.price.toFixed(2)}
                  </div>
                )}
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg 
                      className="h-5 w-5 text-primary mr-2 shrink-0" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-2 rounded-md font-medium transition-colors ${
                  selectedPlan?.id === plan.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
                onClick={() => handleSelectPlan(plan)}
              >
                {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
        
        {selectedPlan && (
          <>
            {/* Promo code */}
            <div className="max-w-md mx-auto mb-8">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  className="flex-1 border rounded-md px-3 py-2 text-black bg-white"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={isSubmitting}
                />
                <button
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium disabled:opacity-50"
                  onClick={validatePromoCode}
                  disabled={isSubmitting || !promoCode.trim()}
                >
                  Apply
                </button>
              </div>
              {validPromoCode && (
                <div className="text-green-600 text-sm mt-2">
                  Promo code applied! You'll save {
                    validPromoCode.discountType === 'percentage'
                      ? `${validPromoCode.discountValue}%`
                      : `$${validPromoCode.discountValue.toFixed(2)}`
                  }
                </div>
              )}
            </div>
            
            {/* Payment method selection */}
            <div className="max-w-md mx-auto mb-8">
              <h3 className="text-xl font-bold mb-4">Payment Method</h3>
              <div className="flex gap-4 mb-6">
                <button
                  className={`flex-1 py-3 rounded-md border transition-colors ${
                    paymentMethod === 'paypal' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-border'
                  }`}
                  onClick={() => setPaymentMethod('paypal')}
                >
                  <div className="flex justify-center items-center">
                    <span className="font-bold">PayPal</span>
                  </div>
                </button>
                <button
                  className={`flex-1 py-3 rounded-md border transition-colors ${
                    paymentMethod === 'credit_card' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-border'
                  }`}
                  onClick={() => setPaymentMethod('credit_card')}
                >
                  <div className="flex justify-center items-center">
                    <span className="font-bold">Credit Card</span>
                  </div>
                </button>
              </div>
              
              {/* Credit card form */}
              {paymentMethod === 'credit_card' && (
                <form onSubmit={handleCreditCardSubscription}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Card Number</label>
                      <input
                        type="text"
                        className="w-full border rounded-md px-3 py-2 text-black bg-white"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength={19}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        className="w-full border rounded-md px-3 py-2 text-black bg-white"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Expiry Date</label>
                        <input
                          type="text"
                          className="w-full border rounded-md px-3 py-2 text-black bg-white"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiryDate(e.target.value))}
                          maxLength={5}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">CVV</label>
                        <input
                          type="text"
                          className="w-full border rounded-md px-3 py-2 text-black bg-white"
                          placeholder="123"
                          value={cardCvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 rounded-md font-medium bg-primary text-primary-foreground disabled:opacity-50 mt-4"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Processing...' : `Subscribe for $${calculatePrice(selectedPlan.price).toFixed(2)}`}
                    </button>
                  </div>
                </form>
              )}
              
              {/* PayPal buttons */}
              {paymentMethod === 'paypal' && (
                <div className="mt-4">
                  {paypalClientId ? (
                    <PayPalScriptProvider options={{ clientId: paypalClientId || '' }}>
                      <PayPalButtons
                        style={{ layout: 'vertical', shape: 'rect' }}
                        createOrder={() => {
                          // Return a promise with an orderID from your server
                          return Promise.resolve('dummy-order-id');
                        }}
                        onApprove={handlePayPalApproval}
                        onError={(err) => {
                          console.error('PayPal error:', err);
                          setErrorMsg('There was an error processing your PayPal payment.');
                        }}
                      />
                    </PayPalScriptProvider>
                  ) : (
                    <button
                      className="w-full py-3 rounded-md font-medium bg-primary text-primary-foreground disabled:opacity-50"
                      onClick={initializePayPalSubscription}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Processing...' : 'Proceed with PayPal'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscribePage;