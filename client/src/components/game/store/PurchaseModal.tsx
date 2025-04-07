import React from 'react';
import { usePurchaseStore } from '@/lib/stores/usePurchaseStore';
import { PurchaseItem, VirtualCurrencyPackage } from '@/lib/types';

export function PurchaseModal() {
  const { 
    selectedItem, 
    closePurchaseModal, 
    processPurchase,
    loading
  } = usePurchaseStore();

  if (!selectedItem) return null;

  const product = selectedItem.product;
  const isCurrencyPackage = !('type' in product);
  
  const title = 'title' in product ? product.title : '';
  const price = 'formattedPrice' in product ? product.formattedPrice : '';
  const description = 'description' in product ? product.description : '';
  const benefits = 'benefits' in product ? product.benefits : [];
  const amount = 'amount' in product ? product.amount : '';

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-b from-gray-900 to-black max-w-md w-full rounded-2xl border border-gray-800 shadow-xl p-6 transform transition-all animate-scale-up">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">
            Confirm Purchase
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-yellow-400 to-amber-300 rounded-full mx-auto mt-2"></div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
            {isCurrencyPackage ? (
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">
                {amount} Cash
              </p>
            ) : (
              <p className="text-gray-300 text-sm">{description}</p>
            )}
            
            {benefits && benefits.length > 0 && (
              <div className="mt-3 space-y-1">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <div className="text-green-400 mr-2 text-lg">•</div>
                    <p className="text-gray-300 text-sm">{benefit}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="text-center p-3 bg-gray-800/40 rounded-xl border border-gray-700/30">
            <p className="text-sm text-gray-400">Total Price</p>
            <p className="text-2xl font-bold text-white">{price}</p>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={closePurchaseModal}
            className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 font-medium transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={processPurchase}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 rounded-lg text-black font-medium transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
                <span className="ml-2">Processing...</span>
              </div>
            ) : (
              'Buy Now'
            )}
          </button>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          By completing this purchase, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}