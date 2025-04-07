import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface PremiumFeatureGateProps {
  children: React.ReactNode;
  feature: 'basic' | 'standard' | 'premium' | 'platinum';
  fallback?: React.ReactNode;
  description?: string;
  showUpgradeDialog?: boolean;
}

/**
 * PremiumFeatureGate
 * 
 * A component that renders its children only if the user has the required subscription level.
 * Otherwise, it shows a fallback UI or a locked indicator.
 * 
 * @param children The premium feature content to render if the user has access
 * @param feature The subscription level required to access this feature
 * @param fallback Optional fallback UI to show when feature is locked
 * @param description Description of the premium feature for the upgrade dialog
 * @param showUpgradeDialog Whether to show an upgrade dialog when clicking the locked feature
 */
const PremiumFeatureGate: React.FC<PremiumFeatureGateProps> = ({
  children,
  feature,
  fallback,
  description = "This feature requires a premium subscription.",
  showUpgradeDialog = true
}) => {
  const { subscriptionInfo } = useRapperGame();
  const { isSubscribed, subscriptionType } = subscriptionInfo;
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Logic for determining if user has access to the feature
  const hasAccess = () => {
    if (feature === 'basic') return true;
    if (!isSubscribed) return false;
    
    const tiers = {
      basic: 0,
      standard: 1,
      premium: 2,
      platinum: 3
    };
    
    const requiredTier = tiers[feature] || 0;
    const userTier = tiers[subscriptionType as keyof typeof tiers] || 0;
    
    return userTier >= requiredTier;
  };
  
  const openDialog = () => {
    if (showUpgradeDialog) {
      setDialogOpen(true);
    }
  };
  
  const closeDialog = () => {
    setDialogOpen(false);
  };
  
  const goToPremiumStore = () => {
    closeDialog();
    setLocation('/premium-store');
  };
  
  if (hasAccess()) {
    return <>{children}</>;
  }
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Default locked UI
  return (
    <>
      <div
        onClick={openDialog}
        className="relative border border-gray-200 p-4 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <div className="absolute inset-0 flex items-center justify-center z-10 backdrop-blur-[1px]">
          <div className="flex flex-col items-center p-4 rounded-lg">
            <div className="bg-gray-800/90 p-3 rounded-full mb-2">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <p className="text-center text-sm font-medium mb-1">Premium Feature</p>
            <p className="text-center text-xs text-gray-600 mb-2">
              {feature.charAt(0).toUpperCase() + feature.slice(1)} subscription required
            </p>
            <Button size="sm" variant="outline" className="mt-2">
              Upgrade
            </Button>
          </div>
        </div>
        
        <div className="opacity-30 pointer-events-none">
          {children}
        </div>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Premium Feature</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              This feature requires a {feature} subscription. Upgrade now to unlock this and many other premium features!
            </p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Unlock all {feature} tier features</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Support ongoing development</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Ad-free experience</span>
              </li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Later
            </Button>
            <Button onClick={goToPremiumStore}>
              View Subscription Options
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PremiumFeatureGate;