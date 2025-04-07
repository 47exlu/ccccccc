import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  color?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  showValue = false,
  size = "md",
  label,
  color,
  className,
  ...props
}: ProgressBarProps) {
  // Ensure value is between 0 and max
  const clampedValue = Math.max(0, Math.min(value, max));
  const percentage = (clampedValue / max) * 100;
  
  // Determine height based on size
  const heightClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };
  
  // Determine text size based on size
  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };
  
  // Determine color based on value
  const getColorClass = () => {
    // If color is provided, use that
    if (color) return color;
    
    // Otherwise, determine based on percentage
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    if (percentage >= 20) return "bg-orange-500";
    return "bg-red-500";
  };
  
  return (
    <div className={cn("w-full", className)} {...props}>
      {label && (
        <div className="flex justify-between mb-1">
          <span className={cn("font-medium", textSizeClasses[size])}>
            {label}
          </span>
          {showValue && (
            <span className={cn("text-gray-400", textSizeClasses[size])}>
              {Math.round(clampedValue)}/{max}
            </span>
          )}
        </div>
      )}
      <div className={cn("w-full bg-gray-700 rounded-full overflow-hidden", heightClasses[size])}>
        <div
          className={cn("transition-all duration-300 ease-in-out", getColorClass())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {!label && showValue && (
        <div className={cn("text-gray-400 mt-1 text-right", textSizeClasses[size])}>
          {Math.round(clampedValue)}/{max}
        </div>
      )}
    </div>
  );
}