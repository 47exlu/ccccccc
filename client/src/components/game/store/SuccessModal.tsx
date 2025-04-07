import React from 'react';
import { usePurchaseStore } from '@/lib/stores/usePurchaseStore';

export function SuccessModal() {
  const { 
    selectedItem, 
    lastPurchasedItem,
    closeSuccessModal 
  } = usePurchaseStore();

  const item = lastPurchasedItem || (selectedItem?.product && 'type' in selectedItem.product ? selectedItem.product : null);
  
  if (!item && !selectedItem) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-b from-gray-900 to-black max-w-md w-full rounded-2xl border border-gray-800 shadow-xl p-6 transform transition-all animate-scale-up">
        {/* Success animation */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-green-500/30 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-300">
            Purchase Successful!
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-green-400 to-teal-300 rounded-full mx-auto mt-2"></div>
          <p className="text-gray-300 mt-3">
            {item && 'type' in item && item.type === 'premium_feature' 
              ? 'Premium features have been activated for your account!'
              : item && 'type' in item && item.type === 'subscription'
                ? 'Your VIP membership is now active. Enjoy the benefits!'
                : 'The funds have been added to your account!'}
          </p>
        </div>
        
        <div className="mt-6">
          <button
            onClick={closeSuccessModal}
            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 rounded-lg text-white font-medium transition-all transform hover:scale-[1.02]"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}