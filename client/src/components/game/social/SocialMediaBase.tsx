import React, { ReactNode } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Bell, Mail, Search, User, Settings, MoreHorizontal } from 'lucide-react';

export interface SocialMediaHeaderProps {
  platformName: string;
  platformIcon: ReactNode;
  platformColor: string;
  onBackToDashboard: () => void;
  additionalIcons?: ReactNode;
}

export const SocialMediaHeader: React.FC<SocialMediaHeaderProps> = ({
  platformName,
  platformIcon,
  platformColor,
  onBackToDashboard,
  additionalIcons
}) => {
  // The function to go back to the main dashboard
  const handleBackClick = () => {
    console.log("Going back to dashboard");
    try {
      // Call the callback function
      onBackToDashboard();
    } catch (error) {
      console.error("Error navigating back:", error);
      
      // Fallback: Try to use the useRapperGame's setScreen directly
      try {
        const useRapperGame = require('@/lib/stores/useRapperGame').useRapperGame;
        useRapperGame.getState().setScreen('career_dashboard');
      } catch (fallbackError) {
        console.error("Failed to navigate with fallback:", fallbackError);
        
        // Last resort: Alert the user
        alert("Could not navigate back. Please use the main menu.");
      }
    }
  };

  return (
    <div className={`border-b ${platformColor === 'black' ? 'border-gray-800' : 'border-gray-200'} px-4 py-3 flex items-center sticky top-0 z-10 ${platformColor === 'black' ? 'bg-black text-white' : platformColor === 'gradient' ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-white' : 'bg-white text-black'}`}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleBackClick}
        className={`mr-2 ${platformColor === 'black' || platformColor === 'gradient' ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/10'}`}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="text-xl font-bold flex items-center">
        {platformIcon}
        <span className="ml-2">{platformName}</span>
      </div>
      <div className="ml-auto flex space-x-1">
        {additionalIcons}
      </div>
    </div>
  );
};

export interface SocialMediaFooterProps {
  platformColor: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  customTabs?: { id: string; icon: ReactNode; label: string }[];
}

export const SocialMediaFooter: React.FC<SocialMediaFooterProps> = ({
  platformColor,
  activeTab,
  onTabChange,
  customTabs
}) => {
  const defaultTabs = [
    { id: 'home', icon: <Home className="h-5 w-5" />, label: 'Home' },
    { id: 'search', icon: <Search className="h-5 w-5" />, label: 'Search' },
    { id: 'notifications', icon: <Bell className="h-5 w-5" />, label: 'Notifications' },
    { id: 'messages', icon: <Mail className="h-5 w-5" />, label: 'Messages' },
    { id: 'profile', icon: <User className="h-5 w-5" />, label: 'Profile' },
  ];

  const tabs = customTabs || defaultTabs;

  return (
    <div className={`border-t ${platformColor === 'black' ? 'border-gray-800 bg-black text-white' : platformColor === 'gradient' ? 'border-gray-200 bg-white text-black' : 'border-gray-200 bg-white text-black'} px-2 py-2 flex justify-between items-center sticky bottom-0 z-10`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-md ${
            activeTab === tab.id 
              ? (platformColor === 'black' 
                ? 'text-white bg-gray-800' 
                : platformColor === 'gradient' 
                  ? 'text-white bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500' 
                  : 'text-blue-500 bg-blue-50')
              : (platformColor === 'black' ? 'text-gray-400' : 'text-gray-500')
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon}
          <span className="text-xs mt-1">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

// Helper to format numbers in k, m format
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'm';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

// Post interface to share between platforms
export interface SocialMediaPostProps {
  id: string;
  username: string;
  handle: string;
  avatar?: string;
  content: string;
  image?: string;
  date: Date | string;
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  verified?: boolean;
  isRepost?: boolean;
  platformColor: string;
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
  onShare?: (id: string) => void;
}

// User profile card for social media
export interface UserProfileCardProps {
  username: string;
  handle: string;
  avatar?: string;
  verified?: boolean;
  followers: number;
  following?: number;
  posts: number;
  bio?: string;
  platformColor: string;
  onFollow?: () => void;
  isFollowing?: boolean;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  username,
  handle,
  avatar,
  verified = false,
  followers,
  following = 0,
  posts,
  bio,
  platformColor,
  onFollow,
  isFollowing = false
}) => {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
      <div className="flex justify-between items-start">
        <Avatar className="h-16 w-16">
          <AvatarImage src={avatar} alt={username} />
          <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <Button
          onClick={onFollow}
          className={`${
            isFollowing 
              ? 'bg-transparent text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700' 
              : platformColor === 'black' 
                ? 'bg-white text-black hover:bg-gray-200' 
                : platformColor === 'gradient' 
                  ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-white hover:opacity-90' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          size="sm"
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      </div>
      
      <div className="mt-3">
        <div className="flex items-center">
          <h3 className="font-bold text-lg">{username}</h3>
          {verified && (
            <Badge variant="outline" className="ml-1 bg-blue-500 text-white border-0 h-4 w-4 p-0 flex items-center justify-center rounded-full">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="white"/>
              </svg>
            </Badge>
          )}
        </div>
        <p className="text-gray-500 text-sm mb-2">@{handle}</p>
        {bio && <p className="mb-3 text-sm">{bio}</p>}
        
        <div className="flex space-x-4 text-sm">
          <div>
            <span className="font-semibold">{formatNumber(posts)}</span>{' '}
            <span className="text-gray-500">Posts</span>
          </div>
          <div>
            <span className="font-semibold">{formatNumber(followers)}</span>{' '}
            <span className="text-gray-500">Followers</span>
          </div>
          <div>
            <span className="font-semibold">{formatNumber(following)}</span>{' '}
            <span className="text-gray-500">Following</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Common layout for social media platforms
export interface SocialMediaLayoutProps {
  children: ReactNode;
  header: ReactNode;
  footer?: ReactNode;
}

export const SocialMediaLayout: React.FC<SocialMediaLayoutProps> = ({
  children,
  header,
  footer
}) => {
  return (
    <div className="flex flex-col h-full w-full">
      {header}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
      {footer}
    </div>
  );
};

// Loading skeleton for posts
export const PostSkeleton: React.FC = () => {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-800 animate-pulse">
      <div className="flex items-start space-x-3">
        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
          <div className="h-40 w-full bg-gray-200 dark:bg-gray-700 rounded mt-3"></div>
          <div className="flex mt-3 space-x-8">
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Empty state for when there are no posts
export const EmptyPostState: React.FC<{
  message: string;
  icon: ReactNode;
  action?: ReactNode;
}> = ({ message, icon, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 space-y-4 h-60">
      <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
        {icon}
      </div>
      <p>{message}</p>
      {action}
    </div>
  );
};