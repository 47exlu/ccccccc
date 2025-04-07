import React from 'react';
import { usePurchaseStore } from '@/lib/stores/usePurchaseStore';
import { PurchaseItem } from '@/lib/types';
import { StarIcon } from '@/assets/icons';

interface FeaturedPurchaseProps {
  item: PurchaseItem;
}

export function FeaturedPurchase({ item }: FeaturedPurchaseProps) {
  const { openPurchaseModal } = usePurchaseStore();

  const handlePurchase = () => {
    openPurchaseModal(item);
  };

  // Get discount if available
  const hasDiscount = item.discountPercentage && item.discountPercentage > 0;
  const discountLabel = hasDiscount ? `${item.discountPercentage}% OFF` : null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-purple-800/30 to-indigo-800/30 rounded-2xl border border-purple-500/30 shadow-lg transition-all hover:shadow-purple-500/20 hover:border-purple-500/40 group">
      {/* Discount badge */}
      {hasDiscount && (
        <div className="absolute top-0 right-0">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-1 px-3 rounded-bl-lg rounded-tr-lg text-sm shadow-md">
            {discountLabel}
          </div>
        </div>
      )}
      
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Featured icon/image */}
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 mx-auto md:mx-0">
            <StarIcon size={32} className="text-white" />
          </div>
          
          {/* Content */}
          <div className="flex-grow space-y-3">
            <div>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
                {item.title}
              </h3>
              <p className="text-gray-300 mt-1">{item.description}</p>
            </div>
            
            {/* Benefits list */}
            <div className="space-y-2 my-4">
              {item.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <div className="text-purple-400 mr-2">•</div>
                  <p className="text-gray-300 text-sm">{benefit}</p>
                </div>
              ))}
            </div>
            
            {/* Call to action */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-white font-bold text-xl">
                {item.formattedPrice}
              </div>
              
              <button
                onClick={handlePurchase}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105"
              >
                Get Premium
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Animated gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
    </div>
  );
}