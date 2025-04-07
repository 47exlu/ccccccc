import React, { useEffect, useState } from 'react';
import { LoadingScreen } from './loading-screen';
import { useLoadingScreen } from '@/lib/stores/useLoadingScreen';

interface LoadingTransitionProps {
  children: React.ReactNode;
}

/**
 * A wrapper component that displays loading screens during transitions
 * It listens to the global loading state and shows/hides the loading screen accordingly
 */
export function LoadingTransition({ children }: LoadingTransitionProps) {
  const { isLoading, message, variant, hideLoading } = useLoadingScreen();
  const [content, setContent] = useState<React.ReactNode>(children);
  
  // When children change while loading, wait for loading to complete before updating content
  useEffect(() => {
    if (!isLoading) {
      setContent(children);
    }
  }, [children, isLoading]);
  
  return (
    <>
      {content}
      <LoadingScreen 
        isLoading={isLoading}
        message={message}
        variant={variant}
        onLoadComplete={hideLoading}
      />
    </>
  );
}

/**
 * A hook to trigger loading transitions between screens
 * @param timeout The minimum duration to show the loading screen
 * @returns A function to trigger a loading transition
 */
export function useLoadingTransition(timeout: number = 1500) {
  const { showLoading } = useLoadingScreen();
  
  const triggerTransition = (
    onComplete: () => void, 
    message?: string, 
    variant?: 'default' | 'record' | 'vinyl' | 'microphone' | 'random'
  ) => {
    showLoading(message, variant);
    
    // Hide loading after minimum duration
    setTimeout(() => {
      onComplete();
    }, timeout);
  };
  
  return triggerTransition;
}