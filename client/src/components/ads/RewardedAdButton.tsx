// RewardedAdButton.tsx - Component for showing rewarded ads
import React, { useState } from 'react';
import { adService } from '@/lib/services/adService';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { useAdStore } from '@/lib/stores/useAdStore';

interface RewardedAdButtonProps {
  buttonText?: string;
  rewardAmount?: number;
  onRewardEarned?: (amount: number) => void;
  className?: string;
}

const RewardedAdButton: React.FC<RewardedAdButtonProps> = ({
  buttonText = 'Watch Ad for Cash',
  rewardAmount = 5000,
  onRewardEarned,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const gameStore = useRapperGame();
  const adStore = useAdStore();
  
  // Check if user has premium subscription (premium users don't see ads)
  const isPremium = gameStore.subscriptionInfo?.isSubscribed || false;
  
  // Check if rewarded ads are ready to show
  const adReady = adStore.rewardedAdReady && !isPremium;
  
  const handleClick = async () => {
    if (!adReady || loading) return;
    
    setLoading(true);
    
    try {
      const success = await adService.showRewarded(() => {
        // This callback is called when the reward is earned
        // The actual adding of cash happens in the adService
        if (onRewardEarned) {
          onRewardEarned(rewardAmount);
        }
      });
      
      if (!success) {
        console.log('Failed to show rewarded ad');
      }
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Button text based on state
  const getButtonText = () => {
    if (loading) return 'Loading Ad...';
    if (isPremium) return 'Available with Free Version';
    if (!adReady) return 'Ad Not Available';
    return buttonText;
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={!adReady || loading || isPremium}
      className={`${className} ${
        !adReady || loading || isPremium
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-blue-700'
      }`}
      aria-label="Watch an ad to earn in-game currency"
    >
      {getButtonText()}
    </button>
  );
};

export default RewardedAdButton;