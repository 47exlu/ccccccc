import React from 'react';
import { cn } from '@/lib/utils';

interface SocialIconProps {
  platform: 'twitter' | 'instagram' | 'tiktok' | 'spotify' | 'soundcloud' | 'itunes' | 'youtube' | 'vevo';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'solid';
  className?: string;
  onClick?: () => void;
}

const platformClasses = {
  twitter: 'bg-[#1DA1F2] hover:bg-[#1a94df] border-[#1DA1F2] text-white',
  instagram: 'bg-[#E1306C] hover:bg-[#d02d65] border-[#E1306C] text-white',
  tiktok: 'bg-[#000000] hover:bg-[#333333] border-[#000000] text-white',
  spotify: 'bg-[#1DB954] hover:bg-[#1aa74b] border-[#1DB954] text-white',
  soundcloud: 'bg-[#ff5500] hover:bg-[#e54c00] border-[#ff5500] text-white',
  itunes: 'bg-[#fb5bc5] hover:bg-[#e752b4] border-[#fb5bc5] text-white',
  youtube: 'bg-[#FF0000] hover:bg-[#e50000] border-[#FF0000] text-white',
  vevo: 'bg-[#fd0e35] hover:bg-[#e50c2f] border-[#fd0e35] text-white',
};

const outlineClasses = {
  twitter: 'bg-transparent hover:bg-[#1DA1F2]/10 border-[#1DA1F2] text-[#1DA1F2]',
  instagram: 'bg-transparent hover:bg-[#E1306C]/10 border-[#E1306C] text-[#E1306C]',
  tiktok: 'bg-transparent hover:bg-[#000000]/10 border-[#000000] text-[#000000]',
  spotify: 'bg-transparent hover:bg-[#1DB954]/10 border-[#1DB954] text-[#1DB954]',
  soundcloud: 'bg-transparent hover:bg-[#ff5500]/10 border-[#ff5500] text-[#ff5500]',
  itunes: 'bg-transparent hover:bg-[#fb5bc5]/10 border-[#fb5bc5] text-[#fb5bc5]',
  youtube: 'bg-transparent hover:bg-[#FF0000]/10 border-[#FF0000] text-[#FF0000]',
  vevo: 'bg-transparent hover:bg-[#fd0e35]/10 border-[#fd0e35] text-[#fd0e35]',
};

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
};

export function SocialIcon({
  platform,
  size = 'md',
  variant = 'default',
  className,
  onClick,
}: SocialIconProps) {
  const IconComponent = () => {
    switch (platform) {
      case 'twitter':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
          </svg>
        );
      case 'instagram':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        );
      case 'tiktok':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
            <path d="M20 10c-1.5-1.5-3.5-2-5.5-1.5-.5-1.5-1.5-3-3.5-3.5-2-.5-4 0-5.5 1.5"></path>
            <path d="M20 10v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"></path>
            <path d="M14.5 15c-.5 0-1.5-.5-1.5-1.5v-7c0-.5.5-1.5 1.5-1.5 .97 0 1.89.45 2.5 1.2"></path>
          </svg>
        );
      case 'spotify':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 16.42c0 0 4-1.42 8-.42"></path>
            <path d="M8 12.42c0 0 4-1.42 8-.42"></path>
            <path d="M8 8.42c0 0 4-1.42 8-.42"></path>
          </svg>
        );
      case 'soundcloud':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12h2v6H2z"></path>
            <path d="M6 6h2v12H6z"></path>
            <path d="M10 8h2v10h-2z"></path>
            <path d="M14 4h2v14h-2z"></path>
            <path d="M18 5h4v12h-4z"></path>
          </svg>
        );
      case 'itunes':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M14 9v7"></path>
            <path d="M12 12a2 2 0 1 0 4 0 2 2 0 1 0-4 0"></path>
          </svg>
        );
      case 'youtube':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.5 49.5 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.5 49.5 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path>
            <path d="m10 15 5-3-5-3z"></path>
          </svg>
        );
      case 'vevo':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"></path>
            <path d="m10 9 5 3-5 3z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center rounded-full border-2 transition-colors',
        sizeClasses[size],
        variant === 'outline' ? outlineClasses[platform] : platformClasses[platform],
        className
      )}
    >
      <IconComponent />
    </button>
  );
}
