import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { MicrophoneIcon, MusicIcon } from "@/assets/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/lib/stores/useSettings";

// Array of rapper-themed loading quotes
const LOADING_QUOTES = [
  "Dropping beats...",
  "Mixing the track...",
  "Calling the producer...",
  "Preparing the studio...",
  "Setting up the mic...",
  "Waiting for inspiration...",
  "Finding the rhythm...",
  "Checking sound levels...",
  "Loading sample packs...",
  "Writing lyrics...",
  "Adjusting autotune...",
  "Mastering the track...",
  "Signing contracts...",
  "Counting stacks...",
  "Calling features...",
  "Scheduling studio time...",
  "Finding the perfect beat...",
  "Setting up the booth...",
  "Tuning instruments...",
  "Building the hype...",
];

interface LoadingScreenProps {
  isLoading: boolean;
  variant?: "default" | "record" | "vinyl" | "microphone" | "random";
  message?: string;
  className?: string;
  fullScreen?: boolean;
  onLoadComplete?: () => void;
  minDuration?: number; // Minimum duration to show the loading screen in ms
}

export function LoadingScreen({
  isLoading,
  variant = "default",
  message,
  className,
  fullScreen = true,
  onLoadComplete,
  minDuration = 1000,
}: LoadingScreenProps) {
  const [shouldShow, setShouldShow] = useState(isLoading);
  const [randomQuote, setRandomQuote] = useState("");
  const [actualVariant, setActualVariant] = useState(variant);
  const { loadingAnimationsEnabled } = useSettings();
  
  // If animations are disabled, use a shorter minDuration
  const effectiveMinDuration = loadingAnimationsEnabled ? minDuration : 300;
  
  // Set a random quote when loading starts
  useEffect(() => {
    if (isLoading) {
      setRandomQuote(LOADING_QUOTES[Math.floor(Math.random() * LOADING_QUOTES.length)]);
      
      // If variant is random, pick a random one
      if (variant === "random") {
        const variants = ["default", "record", "vinyl", "microphone"];
        setActualVariant(variants[Math.floor(Math.random() * variants.length)] as any);
      } else {
        setActualVariant(variant);
      }
    }
  }, [isLoading, variant]);
  
  // Handle minimum duration
  useEffect(() => {
    if (isLoading) {
      setShouldShow(true);
      
      // If loading becomes false before min duration, wait before hiding
      if (!isLoading && effectiveMinDuration > 0) {
        const timer = setTimeout(() => {
          setShouldShow(false);
          onLoadComplete?.();
        }, effectiveMinDuration);
        
        return () => clearTimeout(timer);
      }
    } else {
      // If not loading and past min duration, hide immediately
      setShouldShow(false);
      onLoadComplete?.();
    }
  }, [isLoading, effectiveMinDuration, onLoadComplete]);
  
  // Define different loading animations based on variant
  const renderLoadingAnimation = () => {
    switch (actualVariant) {
      case "record":
        return (
          <div className="relative">
            <motion.div 
              className="w-32 h-32 bg-black rounded-full flex items-center justify-center border-4 border-gray-800"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
              <div className="absolute inset-0 border-t-4 border-[#FF0000] rounded-full"></div>
            </motion.div>
          </div>
        );
        
      case "vinyl":
        return (
          <div className="relative">
            <motion.div 
              className="w-32 h-32 bg-gradient-to-r from-violet-500 to-purple-800 rounded-full flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
              <div className="absolute inset-0 opacity-10">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute inset-0 border-t border-white rounded-full" 
                    style={{ transform: `rotate(${i * 18}deg)` }} 
                  />
                ))}
              </div>
            </motion.div>
            <motion.div 
              className="absolute -right-10 top-1/2 w-24 h-2 bg-gray-600 rounded-full origin-left"
              animate={{ rotate: [10, -10, 10] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute right-0 w-3 h-6 bg-gray-400 rounded-sm transform translate-x-1 -translate-y-2" />
            </motion.div>
          </div>
        );
        
      case "microphone":
        return (
          <div className="relative">
            <motion.div 
              className="w-20 h-40 bg-gradient-to-b from-gray-200 to-gray-400 rounded-lg flex items-center justify-center"
              initial={{ y: 0 }}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-16 h-16 bg-gray-800 rounded-full mt-[-16px] flex items-center justify-center">
                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                  <motion.div
                    className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <motion.div
                      className="w-3 h-3 bg-indigo-500 rounded-full"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  </motion.div>
                </div>
              </div>
              <div className="absolute bottom-2 w-8 h-8 bg-gray-300 rounded-full" />
            </motion.div>
            <motion.div
              className="absolute -top-6 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            >
              <MicrophoneIcon size={48} className="text-gray-800" />
            </motion.div>
          </div>
        );
        
      case "default":
      default:
        return (
          <div className="relative">
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-3 h-12 bg-indigo-600 rounded-full"
                animate={{ height: [12, 24, 12] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="w-3 h-12 bg-purple-600 rounded-full"
                animate={{ height: [12, 32, 12] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
              />
              <motion.div
                className="w-3 h-12 bg-pink-600 rounded-full"
                animate={{ height: [12, 48, 12] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="w-3 h-12 bg-red-600 rounded-full"
                animate={{ height: [12, 36, 12] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }}
              />
              <motion.div
                className="w-3 h-12 bg-orange-600 rounded-full"
                animate={{ height: [12, 24, 12] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }}
              />
            </div>
            <motion.div
              className="absolute -top-6 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            >
              <MusicIcon size={24} className="text-white" />
            </motion.div>
          </div>
        );
    }
  };
  
  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "flex flex-col items-center justify-center bg-black text-white",
            fullScreen ? "fixed inset-0 z-50" : "w-full h-full min-h-[200px] rounded-lg",
            className
          )}
        >
          <div className="flex flex-col items-center gap-8">
            {loadingAnimationsEnabled ? (
              // Show full animation when enabled
              renderLoadingAnimation()
            ) : (
              // Show simple loading spinner when disabled
              <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            )}
            
            <div className="flex flex-col items-center gap-2">
              {loadingAnimationsEnabled ? (
                // Animated text when animations enabled
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-bold"
                >
                  {message || randomQuote}
                </motion.h3>
              ) : (
                // Simple text when animations disabled
                <h3 className="text-xl font-bold">Loading...</h3>
              )}
              
              {loadingAnimationsEnabled ? (
                // Animated progress bar when animations enabled
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full w-48"
                />
              ) : (
                // Simple progress bar when animations disabled
                <div className="h-1 bg-white/50 rounded-full w-48" />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}