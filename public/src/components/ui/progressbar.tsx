import React from 'react';
import { cn } from '@/lib/utils';

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
  label,
  showValue = false,
  size = 'md',
  color = 'default',
  className,
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-4',
  };
  
  const colorClasses = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
  };

  // Determine the appropriate color class
  const colorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.default;

  return (
    <div className={className} {...props}>
      {(label || showValue) && (
        <div className="flex justify-between mb-1 text-sm">
          {label && <span>{label}</span>}
          {showValue && <span>{value} / {max}</span>}
        </div>
      )}
      <div className="w-full bg-gray-700/50 rounded-full overflow-hidden">
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            sizeClasses[size],
            colorClass
          )}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
