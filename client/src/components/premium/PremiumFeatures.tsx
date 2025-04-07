// PremiumFeatures.tsx - Component for managing premium features and subscriptions
import React, { useState, useEffect } from 'react';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { usePurchaseStore } from '@/lib/stores/usePurchaseStore';
import { PRODUCT_IDS } from '@/lib/services/googlePlayService';
import RewardedAdButton from '../ads/RewardedAdButton';

interface PremiumFeaturesProps {
  className?: string;
}

const PremiumFeatures: React.FC<PremiumFeaturesProps> = ({ className = '' }) => {
  const [remainingTime, setRemainingTime] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);
  
  const gameStore = useRapperGame();
  const purchaseStore = usePurchaseStore();
  
  const { 
    isSubscribed, 
    subscriptionType,
    expiresAt 
  } = gameStore.subscriptionInfo;
  
  // Format subscription type to be more readable
  const formattedType = subscriptionType 
    ? subscriptionType.charAt(0).toUpperCase() + subscriptionType.slice(1) 
    : 'None';
    
  // Update remaining time for subscription
  useEffect(() => {
    if (!isSubscribed || !expiresAt) {
      setRemainingTime('');
      return;
    }
    
    const updateRemainingTime = () => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      
      if (now >= expiry) {
        setRemainingTime('Expired');
        return;
      }
      
      const diffMs = expiry.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      setRemainingTime(`${diffDays}d ${diffHours}h`);
    };
    
    // Update immediately
    updateRemainingTime();
    
    // Then update every hour
    const interval = setInterval(updateRemainingTime, 1000 * 60 * 60);
    
    return () => clearInterval(interval);
  }, [isSubscribed, expiresAt]);
  
  // Get premium benefits based on subscription type
  const getPremiumBenefits = () => {
    const benefits = [];
    
    // Common premium benefits
    benefits.push('No Ads');
    benefits.push('Weekly Cash Bonus');
    
    if (subscriptionType === 'standard') {
      benefits.push('Weekly $5,000 Bonus');
      benefits.push('10% Creative Bonus');
      benefits.push('Access to Tier 4 Songs');
    }
    
    if (subscriptionType === 'premium' || subscriptionType === 'platinum') {
      benefits.push('Weekly $15,000 Bonus');
      benefits.push('20% Creative Bonus');
      benefits.push('Access to Tier 4 & 5 Songs');
      benefits.push('Fan Base Customization');
    }
    
    if (subscriptionType === 'platinum') {
      benefits.push('Weekly $50,000 Bonus');
      benefits.push('30% Creative Bonus');
      benefits.push('Exclusive Platinum Features');
    }
    
    return benefits;
  };
  
  // Handle rewarded ad callback
  const handleRewardEarned = (amount: number) => {
    // The actual cash is added in the adService, but we can show a message here
    console.log(`Rewarded ad completed! Earned $${amount.toLocaleString()}`);
  };
  
  // Subscription status display
  const renderSubscriptionStatus = () => {
    if (!isSubscribed) {
      return (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold">Free Account</h3>
          <p className="text-sm mt-2">
            Upgrade to Premium for exclusive features, no ads, and weekly bonuses!
          </p>
          
          <div className="mt-4 grid grid-cols-1 gap-4">
            <button 
              onClick={() => window.location.href = '/store'}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            >
              View Premium Plans
            </button>
            
            <RewardedAdButton 
              buttonText="Watch Ad for $5,000"
              rewardAmount={5000}
              onRewardEarned={handleRewardEarned}
              className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded"
            />
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-purple-100 p-4 rounded">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold">{formattedType} Subscription</h3>
            {remainingTime && (
              <p className="text-sm text-gray-600">
                Expires in: {remainingTime}
              </p>
            )}
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-purple-700 text-sm underline"
          >
            {showDetails ? 'Hide Details' : 'View Details'}
          </button>
        </div>
        
        {showDetails && (
          <div className="mt-4">
            <h4 className="font-semibold text-sm">Your Premium Benefits:</h4>
            <ul className="list-disc list-inside mt-2 text-sm">
              {getPremiumBenefits().map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`premium-features ${className}`}>
      {renderSubscriptionStatus()}
    </div>
  );
};

export default PremiumFeatures;