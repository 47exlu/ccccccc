import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MusicIcon, MicrophoneIcon, DollarIcon, StarIcon } from "@/assets/icons";

interface RapperLoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "gold" | "platinum" | "diamond" | "default";
}

/**
 * A specialized rapper-themed loading animation
 */
export function RapperLoading({
  className,
  size = "md",
  variant = "default",
}: RapperLoadingProps) {
  const sizeClass = {
    sm: "w-32 h-32",
    md: "w-48 h-48",
    lg: "w-64 h-64",
  };
  
  // Different variants with their colors
  const getVariantStyles = () => {
    switch (variant) {
      case "gold":
        return {
          outer: "bg-gradient-to-r from-yellow-500 to-amber-500",
          inner: "bg-yellow-600",
          glow: "gold",
          icons: "text-yellow-300"
        };
      case "platinum":
        return {
          outer: "bg-gradient-to-r from-gray-300 to-gray-100",
          inner: "bg-gray-400",
          glow: "white",
          icons: "text-gray-200"
        };
      case "diamond":
        return {
          outer: "bg-gradient-to-r from-blue-300 to-purple-300",
          inner: "bg-blue-400",
          glow: "white",
          icons: "text-blue-200"
        };
      default:
        return {
          outer: "bg-gradient-to-r from-purple-600 to-indigo-600",
          inner: "bg-indigo-700",
          glow: "indigo",
          icons: "text-indigo-300"
        };
    }
  };
  
  const styles = getVariantStyles();

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Outer record spinning */}
      <motion.div
        className={cn(
          "rounded-full flex items-center justify-center relative",
          styles.outer,
          sizeClass[size]
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      >
        {/* Radial lines */}
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 border-t border-white/20 rounded-full"
            style={{ transform: `rotate(${i * (360 / 24)}deg)` }}
          />
        ))}
        
        {/* Center hole */}
        <div className={cn("w-1/3 h-1/3 rounded-full bg-black flex items-center justify-center")}>
          <div className="w-2/3 h-2/3 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
            <div className="w-1/3 h-1/3 rounded-full bg-white" />
          </div>
        </div>
        
        {/* Floating icons around the record */}
        <motion.div
          className="absolute"
          animate={{ rotate: -360 }} // Counter-rotate to stay upright
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          {[0, 90, 180, 270].map((angle, i) => {
            const icons = [
              <MusicIcon key="music" size={size === "sm" ? 16 : size === "md" ? 24 : 32} className={styles.icons} />,
              <MicrophoneIcon key="mic" size={size === "sm" ? 16 : size === "md" ? 24 : 32} className={styles.icons} />,
              <DollarIcon key="dollar" size={size === "sm" ? 16 : size === "md" ? 24 : 32} className={styles.icons} />,
              <StarIcon key="star" size={size === "sm" ? 16 : size === "md" ? 24 : 32} className={styles.icons} />
            ];
            
            return (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  transform: `rotate(${angle}deg) translateX(${size === "sm" ? 60 : size === "md" ? 80 : 100}px)`,
                }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  delay: i * 0.5 
                }}
              >
                {icons[i]}
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
      
      {/* Arm animation */}
      <motion.div
        className="absolute -right-4 top-1/2 transform -translate-y-1/2"
        initial={{ rotate: -30 }}
        animate={{ rotate: [-20, -25, -20] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className={cn(
          "w-12 h-2 bg-gray-700 rounded-r-full origin-left flex items-center",
          size === "sm" ? "w-8" : size === "lg" ? "w-16" : "w-12"
        )}>
          <div className="w-3/4 h-full bg-gray-600 rounded-r-full" />
        </div>
        <div className={cn(
          "absolute right-0 w-4 h-6 bg-gray-500 rounded-sm transform translate-x-1/2 -translate-y-1/2",
          size === "sm" ? "w-3 h-5" : size === "lg" ? "w-5 h-8" : "w-4 h-6"
        )} />
      </motion.div>
      
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-full opacity-20 blur-md" 
        style={{ 
          background: `radial-gradient(circle, ${styles.glow} 0%, transparent 70%)`,
          animation: "pulse 2s infinite"
        }}
      />
    </div>
  );
}

// This is a custom turntable loading animation
export function TurntableLoading({
  className,
  size = "md",
}: Omit<RapperLoadingProps, "variant">) {
  const sizeClass = {
    sm: "w-40 h-32",
    md: "w-60 h-48",
    lg: "w-80 h-64",
  };
  
  return (
    <div className={cn("relative", sizeClass[size], className)}>
      {/* Turntable base */}
      <div className="absolute inset-0 bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        {/* Control buttons */}
        <div className="absolute top-4 left-4 flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <div className="w-3 h-3 bg-green-500 rounded-full" />
        </div>
        
        {/* Turntable platter */}
        <div className="absolute w-3/5 h-3/4 top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
          <motion.div 
            className="w-full h-full bg-black rounded-full border-4 border-gray-800 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-2/3 h-2/3 rounded-full border border-gray-700 flex items-center justify-center">
              <div className="w-1/3 h-1/3 rounded-full bg-gray-800 flex items-center justify-center">
                <div className="w-1/2 h-1/2 rounded-full bg-gray-600" />
              </div>
              
              {/* Record grooves */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-0 border border-gray-800 rounded-full opacity-30"
                  style={{ 
                    transform: `scale(${0.4 + i * 0.05})` 
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Tonearm */}
        <motion.div 
          className="absolute top-1/3 right-[15%] origin-bottom"
          initial={{ rotate: -20 }}
          animate={{ rotate: [-15, -20, -15] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-1 h-20 bg-gray-600 origin-bottom" />
          <div className="absolute -top-1 -left-3 w-8 h-2 bg-gray-500" />
          <div className="absolute -top-1 -left-3 w-1 h-6 bg-gray-600 origin-top transform -rotate-20" />
        </motion.div>
        
        {/* Control knobs */}
        <div className="absolute bottom-4 right-4 flex space-x-3">
          <motion.div 
            className="w-5 h-5 rounded-full bg-gray-700"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-1 h-2 bg-gray-500 mx-auto" />
          </motion.div>
          <motion.div 
            className="w-5 h-5 rounded-full bg-gray-700"
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-1 h-2 bg-gray-500 mx-auto" />
          </motion.div>
        </div>
      </div>
      
      {/* Sound waves emanating */}
      <div className="absolute right-0 top-1/3">
        {[1, 2, 3].map(i => (
          <motion.div
            key={i}
            className="absolute w-8 h-8 border-2 border-indigo-500 rounded-full opacity-0"
            style={{ right: 0 }}
            animate={{
              opacity: [0, 0.5, 0],
              scale: [0.5, 1.5, 2],
              x: [0, 10, 20]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    </div>
  );
}