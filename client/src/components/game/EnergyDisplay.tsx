// EnergyDisplay.tsx - Component to display and manage player energy
import React, { useState, useEffect } from 'react';
import { useEnergyStore } from '../../lib/stores/useEnergyStore';

// Add energy product IDs to the existing PRODUCT_IDS
const ENERGY_PRODUCTS = {
  SMALL_ENERGY: 'com.rapempiresim.energy.small',  // 25 energy
  MEDIUM_ENERGY: 'com.rapempiresim.energy.medium', // 50 energy
  LARGE_ENERGY: 'com.rapempiresim.energy.large',  // 100 energy
};

interface EnergyDisplayProps {
  className?: string;
}

const EnergyDisplay: React.FC<EnergyDisplayProps> = ({ className = '' }) => {
  const [showEnergyShop, setShowEnergyShop] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  
  const energyStore = useEnergyStore();
  
  // Mock mobile store availability check for web-only development
  const mobileStoreAvailable = false;
  
  // Update energy over time - removed auto-update for now as it's not implemented in useEnergyStore
  useEffect(() => {
    // We'll leave this empty for now, auto-energy regeneration
    // will be implemented later if needed
    const interval = setInterval(() => {
      // Future implementation for auto energy regeneration
      // could go here
    }, 60000); // 1 minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate energy percentage for progress bar
  const energyPercentage = energyStore.energy / energyStore.maxEnergy * 100;
  
  // Format energy values
  const currentEnergy = Math.floor(energyStore.energy);
  const maxEnergy = energyStore.maxEnergy;
  
  // Handle energy purchase
  const handlePurchaseEnergy = async (productId: string, amount: number) => {
    setSelectedProduct(productId);
    setPurchasing(true);
    
    try {
      if (mobileStoreAvailable) {
        // Real purchase through Google Play
        console.log(`Initiating energy purchase for ${productId}`);
        
        // Access the Google Play Billing client through Cordova
        const billingClient = (window as any).cordova.plugins.inAppPurchase2;
        
        // Set up callbacks before purchase
        billingClient.when(productId).approved((product: any) => {
          console.log('Energy product approved:', product.id);
          // Add energy to player's account using the addEnergy method
          energyStore.addEnergy(amount);
        });
        
        billingClient.when(productId).error((error: Error) => {
          console.error('Energy purchase error:', error);
        });
        
        // Start the purchase flow
        billingClient.order(productId);
      } else {
        // Mock purchase for browser testing
        await new Promise(resolve => setTimeout(resolve, 1000));
        energyStore.addEnergy(amount);
        console.log(`Mock energy purchase: ${amount} energy`);
      }
    } catch (error) {
      console.error('Error purchasing energy:', error);
    } finally {
      setPurchasing(false);
      setSelectedProduct(null);
    }
  };
  
  // Define energy products
  const energyProducts = [
    { id: ENERGY_PRODUCTS.SMALL_ENERGY, name: 'Small Energy Boost', amount: 25, price: '$0.99' },
    { id: ENERGY_PRODUCTS.MEDIUM_ENERGY, name: 'Medium Energy Boost', amount: 50, price: '$1.99' },
    { id: ENERGY_PRODUCTS.LARGE_ENERGY, name: 'Large Energy Boost', amount: 100, price: '$2.99' }
  ];
  
  return (
    <div className={`energy-display bg-black/70 backdrop-blur-md rounded-full border border-indigo-600/40 shadow-lg ${className}`}>
      {/* Energy content with icon */}
      <div className="flex items-center p-2 px-3">
        {/* Energy icon */}
        <div className="flex-shrink-0 mr-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#8B5CF6" stroke="#8B5CF6" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        {/* Energy value */}
        <div className="text-base font-bold text-white mr-2">{currentEnergy}</div>
        
        {/* Buy button */}
        <button 
          onClick={() => setShowEnergyShop(!showEnergyShop)}
          className="ml-1 px-2 py-0.5 text-xs bg-indigo-600/60 hover:bg-indigo-600/80 text-white rounded-full transition-colors"
        >
          {showEnergyShop ? 'Close' : 'Buy'}
        </button>
      </div>
      
      {/* Energy Shop */}
      {showEnergyShop && (
        <div className="energy-shop absolute left-0 right-0 top-full mt-1 p-3 bg-black/95 backdrop-blur-md border border-indigo-600/30 rounded-lg shadow-2xl z-50 w-60">
          <h3 className="font-bold text-sm text-center mb-3 text-indigo-300">Energy Store</h3>
          
          <div className="grid grid-cols-1 gap-2">
            {energyProducts.map(product => (
              <div key={product.id} className="flex justify-between items-center p-2 rounded-lg bg-indigo-900/20 border border-indigo-800/50 hover:bg-indigo-900/30 transition-colors">
                <div className="flex items-center">
                  <div className="w-7 h-7 rounded-full bg-indigo-700/50 flex items-center justify-center mr-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#C4B5FD" stroke="#C4B5FD" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-white text-xs">{product.name}</div>
                    <div className="text-xs text-indigo-300">+{product.amount}</div>
                  </div>
                </div>
                <button
                  onClick={() => handlePurchaseEnergy(product.id, product.amount)}
                  disabled={purchasing}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-xs disabled:bg-gray-600 transition-colors"
                >
                  {purchasing && selectedProduct === product.id 
                    ? 'Buying...' 
                    : product.price}
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-3 pt-2 text-xs text-gray-400 text-center border-t border-indigo-900/50">
            Recharges 1 energy per minute
          </div>
        </div>
      )}
    </div>
  );
};

export default EnergyDisplay;