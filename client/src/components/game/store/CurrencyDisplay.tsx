import React from 'react';
import { DollarIcon } from '@/assets/icons';

interface CurrencyDisplayProps {
  currency: number;
  className?: string;
}

export function CurrencyDisplay({ currency, className }: CurrencyDisplayProps) {
  // Format the currency with commas for thousands
  const formattedCurrency = new Intl.NumberFormat().format(currency);
  
  return (
    <div className={`bg-gray-800/80 rounded-full py-1.5 px-3 flex items-center border border-gray-700/50 shadow-inner ${className || ''}`}>
      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center mr-2 shadow-sm">
        <DollarIcon size={16} className="text-black" />
      </div>
      <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
        {formattedCurrency}
      </span>
    </div>
  );
}