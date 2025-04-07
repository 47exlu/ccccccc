import React, { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useRapperGame } from '@/lib/stores/useRapperGame';

const SubscriptionSuccessPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { updateSubscriptionStatus } = useRapperGame();
  
  useEffect(() => {
    // Get subscription type from URL query params if available
    const params = new URLSearchParams(window.location.search);
    const subscriptionType = params.get('type') || 'standard';
    
    // Update game state with subscription
    updateSubscriptionStatus(
      true, 
      subscriptionType as 'standard' | 'premium' | 'platinum',
      `subscription_${Date.now()}`, 
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    );
    
    // Redirect to game after 3 seconds
    const timer = setTimeout(() => {
      setLocation('/');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [updateSubscriptionStatus, setLocation]);
  
  return (
    <div className="bg-gradient-to-b from-background to-secondary/20 py-16 flex items-center justify-center min-h-screen">
      <div className="max-w-md w-full mx-auto px-4 text-center">
        <div className="mb-8 text-primary">
          <svg
            className="h-20 w-20 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-4">Subscription Successful!</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Thank you for subscribing to Rapper Life Simulator Premium. Your subscription has been activated and you now have access to all premium features.
        </p>
        <div className="bg-card border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">What's Next?</h2>
          <ul className="text-left space-y-3">
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Explore premium features</span>
            </li>
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Access exclusive content and premium songs</span>
            </li>
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Enjoy premium multipliers for in-game currency</span>
            </li>
          </ul>
        </div>
        <Link to="/">
          <button className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors">
            Return to Game
          </button>
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;