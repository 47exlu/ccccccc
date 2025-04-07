import React from 'react';
import { usePurchaseStore } from '@/lib/stores/usePurchaseStore';
import { PurchaseItem } from '@/lib/types';
import { StarIcon } from '@/assets/icons';

interface PremiumMembershipProps {
  item: PurchaseItem;
}

export function PremiumMembership({ item }: PremiumMembershipProps) {
  const { openPurchaseModal } = usePurchaseStore();

  const handlePurchase = () => {
    openPurchaseModal(item);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-amber-800/30 to-yellow-900/30 rounded-xl border border-amber-500/30 hover:border-amber-500/50 shadow-md hover:shadow-amber-500/10 transition-all group">
      <div className="absolute top-0 right-0 bottom-0 w-1/3 bg-gradient-to-b from-amber-500/10 to-transparent -z-10"></div>
      
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
            <StarIcon size={24} className="text-black" />
          </div>
          
          {/* Content */}
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300 mb-1">
              {item.title}
            </h3>
            <p className="text-gray-300 text-sm mb-3">{item.description}</p>
            
            {/* Price */}
            <div className="flex items-baseline mb-4">
              <span className="text-xl font-bold text-white">{item.formattedPrice}</span>
              <span className="text-gray-400 text-sm ml-1">/ month</span>
            </div>
            
            {/* Benefits list */}
            <div className="space-y-2 mb-4">
              {item.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <div className="text-amber-400 mr-2">•</div>
                  <p className="text-gray-300 text-sm">{benefit}</p>
                </div>
              ))}
            </div>
            
            {/* Subscribe button */}
            <button
              onClick={handlePurchase}
              className="w-full py-2 mt-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-medium rounded-lg transition-all transform hover:scale-[1.02] shadow-md hover:shadow-lg"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
      
      {/* Decorative gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
    </div>
  );
}