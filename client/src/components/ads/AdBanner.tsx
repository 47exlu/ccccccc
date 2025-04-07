// AdBanner.tsx - Component for displaying banner ads
import React, { useEffect, useState } from 'react';
import { adService } from '@/lib/services/adService';
import { useRapperGame } from '@/lib/stores/useRapperGame';

interface AdBannerProps {
  className?: string;
  position?: 'top' | 'bottom';
}

const AdBanner: React.FC<AdBannerProps> = ({
  className = '',
  position = 'bottom'
}) => {
  const [visible, setVisible] = useState(false);
  const gameStore = useRapperGame();
  
  // Check if user has premium subscription (premium users don't see ads)
  const isPremium = gameStore.subscriptionInfo?.isSubscribed || false;
  
  useEffect(() => {
    let mounted = true;
    
    // Only show ads to non-premium users
    if (isPremium) {
      return;
    }
    
    const loadAd = async () => {
      try {
        const success = await adService.showBanner();
        if (mounted) {
          setVisible(success);
        }
      } catch (error) {
        console.error('Error showing banner ad:', error);
      }
    };
    
    loadAd();
    
    // Clean up function to hide the ad when the component unmounts
    return () => {
      mounted = false;
      adService.hideBanner().catch(err => 
        console.error('Error hiding banner ad:', err)
      );
    };
  }, [isPremium]);
  
  // Don't render anything if premium user or ad not visible
  if (isPremium || !visible) {
    return null;
  }
  
  // When running in browser mode (not in Cordova/mobile), we just show a placeholder
  return (
    <div 
      className={`ad-banner ${position} ${className}`}
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        [position]: 0,
        height: '50px',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        fontSize: '12px',
        color: '#888',
      }}
    >
      {/* This is just a placeholder - real ads are shown via AdMob */}
      <div>Advertisement Banner (placeholder in browser)</div>
    </div>
  );
};

export default AdBanner;