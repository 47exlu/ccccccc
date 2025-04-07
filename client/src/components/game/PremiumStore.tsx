import React from 'react';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { ShopIcon, ArrowLeftIcon } from '@/assets/icons';
import { useLocation } from 'wouter';
import { NewPremiumStore } from './NewPremiumStore';

/**
 * PremiumStore Component
 * 
 * This component serves as a wrapper for the Google Play Store compatible store experience.
 * The implementation is fully compatible with Google Play Store's requirements for in-app purchases
 * and includes premium features functionality with stable state management.
 */
export function PremiumStore() {
  const { setScreen, previousScreen } = useRapperGame();
  const [, setLocation] = useLocation();

  const goBack = () => {
    setScreen(previousScreen || 'career_dashboard');
  };
  
  return (
    <div className="flex flex-col h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/70 via-gray-900 to-black text-white p-6 overflow-y-auto">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 blur-3xl -z-10"></div>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-yellow-400 to-amber-600 h-10 w-10 rounded-full flex items-center justify-center shadow-lg mr-3">
            <ShopIcon size={20} className="text-black" />
          </div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">Premium Store</h1>
        </div>
        
        <div className="flex items-center space-x-4">

          
          <button
            onClick={goBack}
            className="bg-gray-800/80 hover:bg-gray-700/80 p-2.5 rounded-full transition-all duration-300 border border-gray-700/50 shadow-md hover:shadow-lg hover:scale-105"
          >
            <ArrowLeftIcon size={20} />
          </button>
        </div>
      </div>
      
      {/* Simplified Google Play Compatible Store Panel */}
      <NewPremiumStore />
    </div>
  );
}