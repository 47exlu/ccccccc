import React from 'react';
import { usePurchaseStore } from '@/lib/stores/usePurchaseStore';

export function ErrorModal() {
  const { 
    errorMessage,
    currentPurchaseError,
    closeErrorModal 
  } = usePurchaseStore();

  // Support both error fields for backward compatibility
  const error = errorMessage || currentPurchaseError || "An unknown error occurred";
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-b from-gray-900 to-black max-w-md w-full rounded-2xl border border-gray-800 shadow-xl p-6 transform transition-all animate-scale-up">
        {/* Error icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-red-500/30 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-300">
            Purchase Failed
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-red-400 to-pink-300 rounded-full mx-auto mt-2"></div>
          <p className="text-gray-300 mt-3">
            {error}
          </p>
        </div>
        
        <div className="mt-6">
          <button
            onClick={closeErrorModal}
            className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-lg text-white font-medium transition-all transform hover:scale-[1.02]"
          >
            Try Again
          </button>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          If this issue persists, please contact customer support.
        </p>
      </div>
    </div>
  );
}