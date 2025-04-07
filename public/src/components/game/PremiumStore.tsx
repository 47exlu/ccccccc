import React from 'react';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { ShopIcon, ArrowLeftIcon } from '@/assets/icons';
import { useLocation } from 'wouter';

export function PremiumStore() {
  const { setScreen, previousScreen } = useRapperGame();
  const [, setLocation] = useLocation();

  const goBack = () => {
    setScreen(previousScreen || 'career_dashboard');
  };
  
  const goToSubscribe = () => {
    setLocation('/subscribe');
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
      
      {/* Store content */}
      <div className="space-y-10">
        {/* Feature Banner */}
        <div className="bg-gradient-to-br from-indigo-800/80 to-purple-900/80 p-6 rounded-2xl border border-indigo-700/50 shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-2 text-white">Rapper Platinum Membership</h2>
          <p className="text-indigo-200 mb-4">Take your rap career to the next level with premium features and exclusive content</p>
          <ul className="mb-6 space-y-2">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-indigo-300 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Exclusive premium beats and samples</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-indigo-300 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>2x faster career progression</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-indigo-300 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>VIP collaborations with top artists</span>
            </li>
          </ul>
          <button 
            onClick={goToSubscribe}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-full"
          >
            Subscribe to Premium
          </button>
        </div>
        
        {/* Currency packages */}
        <div>
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300 flex items-center">
              <span className="bg-gradient-to-r from-yellow-500 to-amber-500 h-6 w-1 rounded mr-2"></span>
              In-Game Cash
            </h2>
            <div className="h-px flex-grow bg-gradient-to-r from-yellow-500/20 to-transparent ml-3"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div 
                key={idx}
                className="bg-gray-900/80 rounded-xl border border-gray-800 p-5 hover:shadow-lg transition-all duration-300 hover:border-amber-600/50 group"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="bg-amber-600/20 p-2 rounded-lg">
                    <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Package {idx + 1}</div>
                    <div className="text-xl font-bold">${(idx + 1) * 4.99}</div>
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">{["Starter", "Pro", "Platinum"][idx]} Cash Pack</h3>
                <p className="text-gray-400 text-sm mb-4">Get {[10000, 30000, 100000][idx].toLocaleString()} in-game currency instantly</p>
                <button
                  onClick={goToSubscribe}
                  className="w-full py-2.5 bg-amber-600/20 text-amber-400 rounded-lg font-medium hover:bg-amber-600 hover:text-white transition-colors duration-300 group-hover:bg-amber-600 group-hover:text-white"
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Membership options */}
        <div>
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300 flex items-center">
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 h-6 w-1 rounded mr-2"></span>
              Premium Memberships
            </h2>
            <div className="h-px flex-grow bg-gradient-to-r from-indigo-500/20 to-transparent ml-3"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                title: "Monthly Premium",
                price: 9.99,
                period: "month",
                features: ["Premium features", "No ads", "VIP support"]
              },
              {
                title: "Annual Premium",
                price: 89.99,
                period: "year",
                features: ["Premium features", "No ads", "VIP support", "2 months free"]
              }
            ].map((plan, idx) => (
              <div 
                key={idx}
                className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-xl border border-indigo-800/50 p-5 hover:shadow-lg transition-all duration-300"
              >
                <h3 className="font-bold text-xl mb-2">{plan.title}</h3>
                <div className="flex items-end mb-4">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-gray-400 ml-1">/{plan.period}</span>
                </div>
                <ul className="mb-6 space-y-2">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start">
                      <svg className="h-5 w-5 text-indigo-400 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={goToSubscribe}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                >
                  Subscribe Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}