import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './card';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  footer?: React.ReactNode;
  className?: string;
}

export function MetricsCard({
  title,
  value,
  icon,
  trend,
  footer,
  className,
}: MetricsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
        
        <div className="flex items-end gap-2">
          <div className="text-2xl font-bold">{value}</div>
          
          {trend && (
            <div className={cn(
              "text-sm font-medium flex items-center",
              trend.direction === 'up' ? 'text-green-500' : 
              trend.direction === 'down' ? 'text-red-500' : 
              'text-gray-500'
            )}>
              {trend.direction === 'up' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              
              {trend.direction === 'down' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              
              {trend.value}%
            </div>
          )}
        </div>
        
        {footer && (
          <div className="mt-4 pt-4 text-sm text-gray-500 border-t border-gray-100">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
