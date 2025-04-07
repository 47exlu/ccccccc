import React from 'react';
import { usePurchaseStore } from '@/lib/stores/usePurchaseStore';
import { VirtualCurrencyPackage } from '@/lib/types';
import { DollarIcon } from '@/assets/icons';

interface CurrencyPackageProps {
  pack: VirtualCurrencyPackage;
}

export function CurrencyPackage({ pack }: CurrencyPackageProps) {
  const { purchaseCurrency } = usePurchaseStore();

  const handlePurchase = () => {
    purchaseCurrency(pack);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-gray-800/70 to-gray-900/70 rounded-xl border border-gray-700/30 hover:border-amber-500/30 shadow-md hover:shadow-amber-500/10 transition-all group">
      {/* Best value badge */}
      {pack.isBestValue && (
        <div className="absolute top-0 left-0 right-0">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-center font-bold py-1 text-xs uppercase tracking-wide shadow-md">
            Best Value
          </div>
        </div>
      )}
      
      <div className={`p-5 flex flex-col items-center ${pack.isBestValue ? 'pt-7' : ''}`}>
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 flex items-center justify-center mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center">
            <DollarIcon size={24} className="text-black" />
          </div>
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-1">{pack.title}</h3>
        
        {/* Amount */}
        <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300 mb-3">
          {pack.amount}
        </div>
        
        {/* Price button */}
        <button
          onClick={handlePurchase}
          className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-medium rounded-lg transition-all transform hover:scale-[1.03] group-hover:shadow-md"
        >
          {pack.formattedPrice}
        </button>
      </div>
      
      {/* Decorative gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
    </div>
  );
}