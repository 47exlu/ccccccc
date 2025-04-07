import React, { useState, useRef, useEffect } from "react";
import { useRapperGame } from "../../lib/stores/useRapperGame";
import { SocialMediaPost, TwitterTrend, MusicChart } from "../../lib/types";
import { useAudio } from "../../lib/stores/useAudio";
import {
  Card,
  CardContent,
} from "../ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

import { 
  Heart, 
  MessageCircle, 
  Repeat, 
  Search, 
  Share, 
  MoreHorizontal, 
  ImageIcon, 
  Home, 
  Bookmark, 
  Bell, 
  User, 
  Hash, 
  Mail, 
  HelpCircle, 
  ArrowLeft, 
  ChevronLeft,
  Sparkles,
  Globe,
  Settings,
  Calendar,
  BarChart2,
  Verified,
  Mic,
  Music,
  RefreshCw,
  X
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { generateAIRapperPost, generateWeeklyAIPosts } from "../../lib/utils/AIPostGenerator";

// Format numbers with k, m suffixes
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "m";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
};

// Format date in social media style
const formatDate = (date?: Date): string => {
  if (!date) return "";
  return formatDistanceToNow(date, { addSuffix: true });
};

// Tweet component
interface TweetProps {
  post: SocialMediaPost;
  account?: MusicChart;
  isVerified?: boolean;
  handle?: string;
  playerName?: string;
  onLike?: (postId: string) => void;
  onRetweet?: (postId: string) => void;
  onReply?: (postId: string) => void;
}

const Tweet: React.FC<TweetProps> = ({ 
  post, 
  account, 
  isVerified = false, 
  handle = "",
  playerName = "",
  onLike,
  onRetweet,
  onReply
}) => {
  const [liked, setLiked] = useState(false);
  const [retweeted, setRetweeted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [retweetsCount, setRetweetsCount] = useState(post.shares);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { playSuccess } = useAudio();

  const handleLike = () => {
    if (liked) {
      setLikesCount(prev => prev - 1);
    } else {
      setLikesCount(prev => prev + 1);
      playSuccess?.();
    }
    setLiked(!liked);
    if (onLike) onLike(post.id);
  };

  const handleRetweet = () => {
    if (retweeted) {
      setRetweetsCount(prev => prev - 1);
    } else {
      setRetweetsCount(prev => prev + 1);
      playSuccess?.();
    }
    setRetweeted(!retweeted);
    if (onRetweet) onRetweet(post.id);
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    if (!bookmarked) playSuccess?.();
  };

  const displayName = account?.accountName || playerName;
  const displayHandle = account?.handle || handle;
  
  // Show full post or truncated version based on content length
  const maxLength = 280;
  const shouldTruncate = post.content.length > maxLength && !isExpanded;
  const displayContent = shouldTruncate 
    ? `${post.content.substring(0, maxLength)}...` 
    : post.content;

  // Determine if post is high engagement (trending or viral)
  const isHighEngagement = post.viralStatus === 'trending' || post.viralStatus === 'viral' || post.viralStatus === 'super_viral';
  
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition duration-150">
      <div className="flex">
        <div className="mr-3">
          <Avatar className="w-12 h-12 rounded-full">
            <AvatarImage src={account?.avatar || post.image} alt={displayName} />
            <AvatarFallback>{(displayName?.charAt(0) || "").toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="font-bold hover:underline truncate">{displayName}</span>
                {isVerified && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-0.5 text-blue-500">
                        <Verified size={16} className="inline" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Verified Account</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                <span className="text-gray-500 ml-1 truncate">@{displayHandle}</span>
                <span className="text-gray-500 mx-1">·</span>
                <span className="text-gray-500 text-sm hover:underline">{formatDate(post.date)}</span>
              </div>
              
              {/* Display fan base relevance indicator for high engagement posts */}
              {isHighEngagement && (
                <div className="mt-1 flex items-center">
                  <span className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full flex items-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                    {post.viralStatus === 'super_viral' 
                      ? 'Going viral with your fans' 
                      : post.viralStatus === 'viral' 
                        ? 'Popular with your fans'
                        : 'Trending with your fans'}
                  </span>
                </div>
              )}
            </div>
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <MoreHorizontal size={16} />
              </Button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-1 w-56 rounded-md shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center" 
                      role="menuitem"
                      onClick={() => {
                        setBookmarked(!bookmarked);
                        setIsMenuOpen(false);
                      }}
                    >
                      <Bookmark size={16} className="mr-2" />
                      {bookmarked ? 'Remove bookmark' : 'Bookmark'}
                    </button>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center" 
                      role="menuitem"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Bell size={16} className="mr-2" />
                      {Math.random() > 0.5 ? 'Turn on notifications' : 'Turn off notifications'}
                    </button>
                    <Separator className="my-1" />
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center" 
                      role="menuitem"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <X size={16} className="mr-2" />
                      Not interested in this
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-2">
            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap text-base">
              {displayContent}
              {shouldTruncate && (
                <button 
                  onClick={() => setIsExpanded(true)}
                  className="text-blue-500 hover:underline ml-1"
                >
                  Show more
                </button>
              )}
            </p>
            
            {/* Media content display */}
            {post.image && (
              <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                <img 
                  src={post.image} 
                  alt="Post media" 
                  className="w-full object-cover max-h-96"
                  loading="lazy" 
                />
              </div>
            )}
            
            {/* Post metrics and time */}
            <div className="flex mt-2 text-xs text-gray-500">
              <span>{formatDistanceToNow(post.date || new Date())} ago</span>
              <span className="mx-1">·</span>
              <span>{formatNumber(post.views || post.likes * 4)} views</span>
            </div>
            
            {/* Post engagement buttons */}
            <div className="flex mt-3 justify-between text-gray-500">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="flex items-center hover:text-blue-500 transition duration-150 group"
                    onClick={() => onReply && onReply(post.id)}
                  >
                    <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 mr-1">
                      <MessageCircle size={18} />
                    </div>
                    <span>{formatNumber(post.comments)}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reply</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className={`flex items-center group transition duration-150 ${retweeted ? 'text-green-500' : 'hover:text-green-500'}`}
                    onClick={handleRetweet}
                  >
                    <div className={`p-2 rounded-full ${retweeted ? 'bg-green-50 dark:bg-green-900/20' : 'group-hover:bg-green-50 dark:group-hover:bg-green-900/20'} mr-1`}>
                      <Repeat size={18} className={retweeted ? 'text-green-500' : ''} />
                    </div>
                    <span>{formatNumber(retweetsCount)}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Retweet</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className={`flex items-center group transition duration-150 ${liked ? 'text-pink-500' : 'hover:text-pink-500'}`}
                    onClick={handleLike}
                  >
                    <div className={`p-2 rounded-full ${liked ? 'bg-pink-50 dark:bg-pink-900/20' : 'group-hover:bg-pink-50 dark:group-hover:bg-pink-900/20'} mr-1`}>
                      <Heart size={18} className={liked ? 'fill-current text-pink-500' : ''} />
                    </div>
                    <span>{formatNumber(likesCount)}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Like</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="flex items-center hover:text-blue-500 transition duration-150 group"
                    onClick={handleBookmark}
                  >
                    <div className={`p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 mr-1`}>
                      <Bookmark size={18} className={bookmarked ? 'fill-current text-blue-500' : ''} />
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{bookmarked ? 'Remove Bookmark' : 'Bookmark'}</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center hover:text-blue-500 transition duration-150 group">
                    <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20">
                      <Share size={18} />
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// AI-generated music chart accounts
const generateMusicChartAccounts = (): MusicChart[] => {
  return [
    {
      id: "1",
      accountName: "RapCaviar",
      handle: "rapcaviar",
      verified: true,
      avatar: "/assets/profiles/profile1.svg",
      tweets: [],
      followers: 3200000
    },
    {
      id: "2",
      accountName: "RapRadar",
      handle: "rapradar",
      verified: true,
      avatar: "/assets/profiles/profile2.svg",
      tweets: [],
      followers: 1800000
    },
    {
      id: "3",
      accountName: "HipHopDX",
      handle: "HipHopDX",
      verified: true,
      avatar: "/assets/profiles/profile3.svg",
      tweets: [],
      followers: 1500000
    },
    {
      id: "4",
      accountName: "Complex Music",
      handle: "ComplexMusic",
      verified: true,
      avatar: "/assets/profiles/profile4.svg",
      tweets: [],
      followers: 2700000
    },
    {
      id: "5",
      accountName: "XXL Magazine",
      handle: "XXL",
      verified: true,
      avatar: "/assets/profiles/profile5.svg",
      tweets: [],
      followers: 3900000
    }
  ];
};

// Generate trending topics based on game state
const generateTrends = (currentWeek: number): TwitterTrend[] => {
  return [
    {
      id: "trend1",
      name: "RapGame",
      category: "Music",
      tweetCount: 125000 + (currentWeek * 1000),
      trending: true,
      description: "People are talking about the latest happenings in rap"
    },
    {
      id: "trend2",
      name: "NewMusicFriday",
      category: "Music",
      tweetCount: 87000 + (currentWeek * 500),
      trending: true,
      description: "New releases this Friday"
    },
    {
      id: "trend3",
      name: "MusicProducers",
      category: "Entertainment",
      tweetCount: 45000 + (currentWeek * 300),
      trending: true
    },
    {
      id: "trend4",
      name: "StreamingWars",
      category: "Entertainment",
      tweetCount: 32000 + (currentWeek * 200),
      trending: false
    },
    {
      id: "trend5",
      name: "TourLife",
      category: "Music",
      tweetCount: 28000 + (currentWeek * 150),
      trending: true
    },
    {
      id: "trend6",
      name: "StudioSession",
      category: "Music",
      tweetCount: 19000 + (currentWeek * 100),
      trending: false
    }
  ];
};

// Main Twitter Panel Component 
export function TwitterPanelFullPage() {
  const [activeTab, setActiveTab] = useState<"home" | "explore" | "notifications" | "messages" | "profile" | "analytics" | "verified">("home");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [tweetText, setTweetText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const character = useRapperGame(state => state.character);
  const socialMedia = useRapperGame(state => state.socialMedia);
  const postOnSocialMedia = useRapperGame(state => state.postOnSocialMedia);
  const currentWeek = useRapperGame(state => state.currentWeek);
  const aiRappers = useRapperGame(state => state.aiRappers);
  const { playSuccess } = useAudio();
  
  // Get Twitter data from social media
  const twitterData = socialMedia.find(p => p.name === "Twitter") || {
    name: "Twitter",
    followers: 0,
    posts: 0,
    engagement: 0,
    lastPostWeek: 0
  };
  
  // AI-generated data
  const trends = generateTrends(currentWeek);
  const musicChartAccounts = generateMusicChartAccounts();
  
  // Generate AI posts if none exist
  const [aiPosts, setAiPosts] = useState<SocialMediaPost[]>([]);
  const setScreen = useRapperGame(state => state.setScreen);
  
  const handleBackToDashboard = () => {
    setScreen('social_media');
  };
  
  React.useEffect(() => {
    if (aiPosts.length === 0) {
      // Generate initial AI posts
      const generatedPosts = generateWeeklyAIPosts(
        aiRappers, 
        "Twitter", 
        currentWeek, 
        character
      );
      setAiPosts(generatedPosts);
    }
  }, [aiRappers, aiPosts.length, character, currentWeek]);
  
  // Format user posts
  const posts = React.useMemo(() => {
    // Combine player posts with AI-generated posts
    const allPosts = [...aiPosts];
    
    // Add real player posts if available
    if (twitterData && Array.isArray(twitterData.posts)) {
      allPosts.push(...(twitterData.posts as SocialMediaPost[]));
    }
    
    // Sort by postWeek or date, newest first
    return allPosts.sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return b.postWeek - a.postWeek;
    });
  }, [aiPosts, twitterData]);
  
  // Handle image upload for new tweets
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const openGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle tweet submission
  const handleTweetSubmit = () => {
    if (tweetText.trim()) {
      postOnSocialMedia("Twitter", tweetText, selectedImage ? [selectedImage] : undefined);
      playSuccess?.();
      setTweetText("");
      setSelectedImage(null);
      setIsComposeOpen(false);
      
      // Generate random AI responses to player's tweet
      const shouldRespond = Math.random() > 0.7; // 30% chance of response
      
      if (shouldRespond) {
        const respondingRapper = aiRappers[Math.floor(Math.random() * aiRappers.length)];
        const responseType = Math.random() > 0.7 ? 'positive' : (Math.random() > 0.5 ? 'negative' : 'neutral');
        const response = generateAIRapperPost(
          respondingRapper,
          "Twitter",
          currentWeek,
          character,
          true
        );
        
        // Add the response to AI posts
        setAiPosts(prev => [...prev, response]);
      }
    }
  };
  
  // Calculate analytics data
  const getEngagementStats = () => {
    // Calculate total engagement
    const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
    const totalRetweets = posts.reduce((sum, post) => sum + post.shares, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.comments, 0);
    
    // Calculate average engagement per post
    const avgLikes = posts.length > 0 ? Math.floor(totalLikes / posts.length) : 0;
    const avgRetweets = posts.length > 0 ? Math.floor(totalRetweets / posts.length) : 0;
    const avgComments = posts.length > 0 ? Math.floor(totalComments / posts.length) : 0;
    
    // Calculate engagement rate
    const totalEngagements = totalLikes + totalRetweets + totalComments;
    const engagementRate = twitterData.followers > 0
      ? ((totalEngagements / twitterData.followers) * 100).toFixed(2) + "%"
      : "0%";
    
    // Find best performing post
    const bestPerforming = posts.length > 0
      ? [...posts].sort((a, b) => (b.likes + b.shares + b.comments) - (a.likes + a.shares + a.comments))[0]
      : undefined;
    
    return {
      totalLikes,
      totalRetweets,
      totalComments,
      avgLikes,
      avgRetweets,
      avgComments,
      engagementRate,
      bestPerforming
    };
  };
  
  // Handle post interactions
  const handleLike = (postId: string) => {
    console.log("Liked post:", postId);
    // In a real implementation, this would update the game state
  };
  
  const handleRetweet = (postId: string) => {
    console.log("Retweeted post:", postId);
    // In a real implementation, this would update the game state
  };
  
  const handleReply = (postId: string) => {
    setSelectedPost(postId);
    setIsComposeOpen(true);
  };
  
  return (
    <div className="w-full bg-white dark:bg-black text-black dark:text-white min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBackToDashboard}
            className="mr-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <h1 className="text-xl font-bold">X</h1>
          </div>
        </div>
        <div className="flex items-center">
          <div className="relative mr-2">
            <Input
              placeholder="Search X"
              className="h-9 w-60 rounded-full bg-gray-100 dark:bg-gray-800 border-none pl-10 pr-4 text-sm"
            />
            <Search className="absolute left-3 top-2 h-5 w-5 text-gray-500" />
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="rounded-full text-sm px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white border-0"
            onClick={() => setIsComposeOpen(true)}
          >
            Post
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex h-[calc(100vh-60px)]">
        {/* Left Sidebar - Navigation */}
        <aside className="w-20 md:w-64 lg:w-72 border-r border-gray-200 dark:border-gray-800 flex flex-col sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto">
          <div className="flex flex-col space-y-1 p-2 flex-1">
            <button 
              onClick={() => setActiveTab("home")}
              className={`${
                activeTab === "home" 
                  ? "font-bold bg-gray-100 dark:bg-gray-800" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
              } flex items-center px-3 py-3 rounded-full transition-colors`}
            >
              <Home className="h-6 w-6 flex-shrink-0" />
              <span className="ml-4 text-lg hidden md:block">Home</span>
            </button>
            
            <button 
              onClick={() => setActiveTab("explore")}
              className={`${
                activeTab === "explore" 
                  ? "font-bold bg-gray-100 dark:bg-gray-800" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
              } flex items-center px-3 py-3 rounded-full transition-colors`}
            >
              <Hash className="h-6 w-6 flex-shrink-0" />
              <span className="ml-4 text-lg hidden md:block">Explore</span>
            </button>
            
            <button 
              onClick={() => setActiveTab("notifications")}
              className={`${
                activeTab === "notifications" 
                  ? "font-bold bg-gray-100 dark:bg-gray-800" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
              } flex items-center px-3 py-3 rounded-full transition-colors`}
            >
              <Bell className="h-6 w-6 flex-shrink-0" />
              <span className="ml-4 text-lg hidden md:block">Notifications</span>
            </button>
            
            <button 
              onClick={() => setActiveTab("messages")}
              className={`${
                activeTab === "messages" 
                  ? "font-bold bg-gray-100 dark:bg-gray-800" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
              } flex items-center px-3 py-3 rounded-full transition-colors`}
            >
              <Mail className="h-6 w-6 flex-shrink-0" />
              <span className="ml-4 text-lg hidden md:block">Messages</span>
            </button>
            
            <button 
              onClick={() => setActiveTab("profile")}
              className={`${
                activeTab === "profile" 
                  ? "font-bold bg-gray-100 dark:bg-gray-800" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
              } flex items-center px-3 py-3 rounded-full transition-colors`}
            >
              <User className="h-6 w-6 flex-shrink-0" />
              <span className="ml-4 text-lg hidden md:block">Profile</span>
            </button>
            
            <button 
              onClick={() => setActiveTab("analytics")}
              className={`${
                activeTab === "analytics" 
                  ? "font-bold bg-gray-100 dark:bg-gray-800" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
              } flex items-center px-3 py-3 rounded-full transition-colors`}
            >
              <svg className="h-6 w-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="ml-4 text-lg hidden md:block">Analytics</span>
            </button>
            
            <div className="flex-1"></div>
            
            <Button 
              className="w-full rounded-full bg-blue-500 hover:bg-blue-600 text-white hidden md:block mt-4" 
              size="lg"
              onClick={() => setIsComposeOpen(true)}
            >
              Tweet
            </Button>
          </div>
          
          {/* Profile Button */}
          <div className="mt-auto pt-2">
            <div className="flex items-center px-3 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
              <Avatar className="h-10 w-10">
                <AvatarImage src={character?.image} alt={character?.artistName} />
                <AvatarFallback>{character?.artistName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="ml-2 hidden md:block">
                <div className="font-bold text-sm">{character?.artistName}</div>
                <div className="text-gray-500 text-xs">@{character?.artistName?.toLowerCase().replace(/\s+/g, '')}</div>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main Content Area */}
        <div className="flex-1 min-w-0 border-r border-gray-200 dark:border-gray-800">
          {activeTab === "home" && (
            <div className="h-full">
              <div className="sticky top-14 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-10 p-4 border-b border-gray-200 dark:border-gray-800 flex items-center">
                <h2 className="text-xl font-bold">Home</h2>
              </div>
              
              <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex">
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarImage src={character?.image} alt={character?.artistName} />
                  <AvatarFallback>{character?.artistName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="What's happening?"
                    className="resize-none border-0 focus-visible:ring-0 text-lg p-0 h-12"
                    onClick={() => setIsComposeOpen(true)}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-2 text-blue-500">
                      <button className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={openGallery}>
                        <ImageIcon size={18} />
                      </button>
                    </div>
                    <Button
                      className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-4"
                      size="sm"
                      onClick={() => setIsComposeOpen(true)}
                    >
                      Tweet
                    </Button>
                  </div>
                </div>
              </div>
              
              <ScrollArea className="h-[calc(100vh-56px-60px-76px)]">
                <div>
                  {/* Feed Posts */}
                  {posts.length > 0 ? (
                    posts.map((post) => {
                      // Find matching rapper for AI posts
                      const aiMatch = aiRappers.find(rapper => 
                        post.content.includes(rapper.name) || 
                        (post.content.includes('@') && post.content.includes(rapper.name.toLowerCase().replace(/\s+/g, '')))
                      );
                      
                      const isPlayerPost = post.platformName === "Twitter" && !aiMatch;
                      
                      if (isPlayerPost) {
                        return (
                          <Tweet
                            key={post.id}
                            post={post}
                            isVerified={true}
                            handle={character?.artistName?.toLowerCase().replace(/\s+/g, '') || ""}
                            playerName={character?.artistName || ""}
                            onLike={handleLike}
                            onRetweet={handleRetweet}
                            onReply={handleReply}
                          />
                        );
                      } else if (aiMatch) {
                        return (
                          <Tweet
                            key={post.id}
                            post={post}
                            isVerified={aiMatch.popularity > 70}
                            handle={aiMatch.name.toLowerCase().replace(/\s+/g, '')}
                            playerName={aiMatch.name}
                            onLike={handleLike}
                            onRetweet={handleRetweet}
                            onReply={handleReply}
                          />
                        );
                      } else {
                        // Find a random music chart account
                        const randomAccount = musicChartAccounts[Math.floor(Math.random() * musicChartAccounts.length)];
                        return (
                          <Tweet
                            key={post.id}
                            post={post}
                            account={randomAccount}
                            onLike={handleLike}
                            onRetweet={handleRetweet}
                            onReply={handleReply}
                          />
                        );
                      }
                    })
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <p>No tweets yet! Start by posting something.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
          
          {activeTab === "profile" && (
            <div className="h-full">
              <div className="sticky top-14 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-10 p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center">
                  <button className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div>
                    <h2 className="text-xl font-bold">{character?.artistName}</h2>
                    <div className="text-gray-500 text-sm">{posts.length} Tweets</div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500">
                  {character?.coverImage && (
                    <img src={character.coverImage} alt="Cover" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="absolute left-4 -bottom-16 border-4 border-white dark:border-black rounded-full">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={character?.image} alt={character?.artistName} />
                    <AvatarFallback>{character?.artistName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute right-4 top-4 flex gap-2">
                  <Button variant="outline" className="rounded-full bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                    <span className="sr-only">Edit Profile</span>
                    Edit profile
                  </Button>
                </div>
              </div>
              
              <div className="pt-20 px-4">
                <div className="mb-4">
                  <h1 className="text-xl font-bold">{character?.artistName}</h1>
                  <div className="text-gray-500">@{character?.artistName?.toLowerCase().replace(/\s+/g, '')}</div>
                  <div className="flex items-center mt-1">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Verified Account
                    </Badge>
                  </div>
                  
                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    {character?.about || 'Making hits'}
                  </p>
                  
                  <div className="flex mt-4 space-x-6">
                    <div>
                      <span className="font-bold">{formatNumber(twitterData.followers)}</span>
                      <span className="text-gray-500 ml-1">Followers</span>
                    </div>
                    <div>
                      <span className="font-bold">{formatNumber(Math.floor(twitterData.followers / 10))}</span>
                      <span className="text-gray-500 ml-1">Following</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-b border-gray-200 dark:border-gray-800 mt-4 mb-1">
                  <div className="flex">
                    <button className="px-4 py-3 font-bold text-blue-500 border-b-2 border-blue-500">
                      Tweets
                    </button>
                    <button className="px-4 py-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      Tweets & replies
                    </button>
                    <button className="px-4 py-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      Media
                    </button>
                    <button className="px-4 py-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      Likes
                    </button>
                  </div>
                </div>
                
                <ScrollArea className="h-[calc(100vh-56px-48px-80px-175px-40px)]">
                  <div>
                    {/* Player's tweets */}
                    {posts.filter(post => post.platformName === "Twitter" && !aiRappers.some(rapper => 
                      post.content.includes(rapper.name) || 
                      (post.content.includes('@') && post.content.includes(rapper.name.toLowerCase().replace(/\s+/g, '')))
                    )).length > 0 ? (
                      posts.filter(post => post.platformName === "Twitter" && !aiRappers.some(rapper => 
                        post.content.includes(rapper.name) || 
                        (post.content.includes('@') && post.content.includes(rapper.name.toLowerCase().replace(/\s+/g, '')))
                      )).map(post => (
                        <Tweet
                          key={post.id}
                          post={post}
                          isVerified={true}
                          handle={character?.artistName?.toLowerCase().replace(/\s+/g, '') || ""}
                          playerName={character?.artistName || ""}
                          onLike={handleLike}
                          onRetweet={handleRetweet}
                          onReply={handleReply}
                        />
                      ))
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        <p>No tweets yet! Share your thoughts with the world.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
          
          {activeTab === "analytics" && (
            <div className="h-full">
              <div className="sticky top-14 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-10 p-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold">Analytics</h2>
              </div>
              
              <ScrollArea className="h-[calc(100vh-56px-48px)]">
                <div className="p-4">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">Account Summary</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Followers</div>
                        <div className="text-3xl font-bold mt-2">{formatNumber(twitterData.followers)}</div>
                        <div className="text-sm text-green-500 mt-1">+{formatNumber(Math.floor(twitterData.followers * 0.05))} this week</div>
                      </Card>
                      
                      <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Tweets</div>
                        <div className="text-3xl font-bold mt-2">{posts.filter(p => !aiRappers.some(r => p.content.includes(r.name))).length}</div>
                        <div className="text-sm text-gray-500 mt-1">Lifetime</div>
                      </Card>
                      
                      <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Engagement Rate</div>
                        <div className="text-3xl font-bold mt-2">{getEngagementStats().engagementRate}</div>
                        <div className="text-sm text-green-500 mt-1">Above industry average</div>
                      </Card>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">Engagement Metrics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Card className="p-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Likes per Tweet</div>
                        <div className="text-2xl font-bold mt-2">{formatNumber(getEngagementStats().avgLikes)}</div>
                        <div className="text-xs text-green-500 mt-1">+12% from last week</div>
                      </Card>
                      
                      <Card className="p-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Retweets</div>
                        <div className="text-2xl font-bold mt-2">{formatNumber(getEngagementStats().avgRetweets)}</div>
                        <div className="text-xs text-green-500 mt-1">+8% from last week</div>
                      </Card>
                      
                      <Card className="p-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Comments</div>
                        <div className="text-2xl font-bold mt-2">{formatNumber(getEngagementStats().avgComments)}</div>
                        <div className="text-xs text-green-500 mt-1">+15% from last week</div>
                      </Card>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">Audience Growth</h3>
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Follower Growth</div>
                          <div className="text-2xl font-bold mt-1">+{formatNumber(Math.floor(twitterData.followers * 0.05))}</div>
                        </div>
                        <div className="text-sm text-green-500">+15% from last week</div>
                      </div>
                      
                      {/* Simple bar chart */}
                      <div className="h-40 flex items-end space-x-2">
                        {Array.from({ length: 7 }).map((_, i) => {
                          const height = 30 + Math.random() * 70;
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center">
                              <div 
                                className="w-full bg-blue-500 dark:bg-blue-600 rounded-t" 
                                style={{ height: `${height}%` }}
                              ></div>
                              <div className="text-xs text-gray-500 mt-1">Day {i+1}</div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">Top Performing Tweet</h3>
                    {getEngagementStats().bestPerforming ? (
                      <Card className="p-4">
                        <Tweet 
                          post={getEngagementStats().bestPerforming as SocialMediaPost}
                          isVerified={true}
                          handle={character?.artistName?.toLowerCase().replace(/\s+/g, '') || ""}
                          playerName={character?.artistName || ""}
                        />
                      </Card>
                    ) : (
                      <Card className="p-6 text-center text-gray-500">
                        <p>No tweets to analyze yet!</p>
                      </Card>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
          
          {activeTab === "explore" && (
            <div className="h-full">
              <div className="sticky top-14 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-10 p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search Twitter"
                    className="w-full bg-gray-100 dark:bg-gray-800 rounded-full pl-10 pr-4 py-2 border-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <ScrollArea className="h-[calc(100vh-56px-72px)]">
                <div className="p-4">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">Trends for you</h3>
                    <Card className="divide-y divide-gray-200 dark:divide-gray-800">
                      {trends.map(trend => (
                        <div key={trend.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                          <div className="flex justify-between">
                            <div>
                              <div className="text-xs text-gray-500">{trend.category} · Trending</div>
                              <div className="font-bold mt-0.5">#{trend.name}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{formatNumber(trend.tweetCount)} tweets</div>
                            </div>
                            <button className="text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                          {trend.description && (
                            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">{trend.description}</div>
                          )}
                        </div>
                      ))}
                    </Card>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">Music Charts & Accounts</h3>
                    <Card className="divide-y divide-gray-200 dark:divide-gray-800">
                      {musicChartAccounts.map(account => (
                        <div key={account.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer flex items-center">
                          <Avatar className="h-12 w-12 mr-3">
                            <AvatarImage src={account.avatar} alt={account.accountName} />
                            <AvatarFallback>{account.accountName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <div className="font-bold">{account.accountName}</div>
                              {account.verified && (
                                <span className="ml-0.5 text-blue-500">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M22 4L12 14.01l-3-3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </span>
                              )}
                            </div>
                            <div className="text-gray-500 text-sm">@{account.handle}</div>
                            <div className="text-sm mt-1">{formatNumber(account.followers)} followers</div>
                          </div>
                          <Button variant="outline" size="sm" className="rounded-full">
                            Follow
                          </Button>
                        </div>
                      ))}
                    </Card>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">What's happening</h3>
                    <Card className="divide-y divide-gray-200 dark:divide-gray-800">
                      <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                        <div className="text-xs text-gray-500">Music · Last night</div>
                        <div className="font-bold mt-0.5">New album releases trending across the platform</div>
                        <div className="text-xs text-gray-500 mt-0.5">12.5K tweets</div>
                      </div>
                      <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                        <div className="text-xs text-gray-500">Entertainment · Trending</div>
                        <div className="font-bold mt-0.5">Major music awards announced for next month</div>
                        <div className="text-xs text-gray-500 mt-0.5">8.3K tweets</div>
                      </div>
                      <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer">
                        <div className="text-xs text-gray-500">Hip Hop · Trending</div>
                        <div className="font-bold mt-0.5">Rap battles heating up between major artists</div>
                        <div className="text-xs text-gray-500 mt-0.5">45.2K tweets</div>
                      </div>
                    </Card>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
          
          {(activeTab === "notifications" || activeTab === "messages") && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-8">
                <div className="mx-auto w-16 h-16 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                  {activeTab === "notifications" ? (
                    <Bell size={24} className="text-blue-500" />
                  ) : (
                    <Mail size={24} className="text-blue-500" />
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {activeTab === "notifications" ? "Notifications" : "Messages"}
                </h3>
                <p className="text-gray-500 max-w-sm">
                  {activeTab === "notifications" 
                    ? "Stay up to date with mentions, likes, and retweets from other artists and fans." 
                    : "Connect directly with other artists, producers, and industry professionals."}
                </p>
                <Button className="mt-4 rounded-full bg-blue-500 hover:bg-blue-600 text-white">
                  {activeTab === "notifications" ? "Enable notifications" : "Start a conversation"}
                </Button>
              </div>
            </div>
          )}
          
          {activeTab === "verified" && (
            <div className="h-full">
              <div className="sticky top-14 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-10 p-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold">Twitter Verified</h2>
              </div>
              
              <div className="p-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="M22 4L12 14.01l-3-3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">You're Verified!</h3>
                <p className="text-gray-500 max-w-md mb-4">
                  As a verified artist, you have access to additional features and increased visibility in the music community.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg max-w-md text-left mb-6">
                  <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Verified Benefits:</h4>
                  <ul className="list-disc pl-5 text-blue-700 dark:text-blue-300 space-y-1">
                    <li>Priority ranking in search results</li>
                    <li>Enhanced protection against impersonation</li>
                    <li>Access to analytics dashboard</li>
                    <li>Verified badge displayed on your profile</li>
                    <li>Extended character limits for tweets</li>
                  </ul>
                </div>
                <Button className="rounded-full bg-blue-500 hover:bg-blue-600 text-white">
                  Explore Verified Features
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Sidebar - Trends & Who to Follow */}
        <div className="hidden lg:block w-80 p-4 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
          <div className="mb-6">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search Twitter"
                className="w-full bg-gray-100 dark:bg-gray-800 rounded-full pl-10 pr-4 py-2 border-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <Card className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-4">
              <h3 className="font-bold text-xl mb-3">Trends for you</h3>
              {trends.slice(0, 5).map(trend => (
                <div key={trend.id} className="py-2 hover:bg-gray-100 dark:hover:bg-gray-800 -mx-4 px-4 cursor-pointer">
                  <div className="text-xs text-gray-500">{trend.category} · Trending</div>
                  <div className="font-semibold">#{trend.name}</div>
                  <div className="text-xs text-gray-500">{formatNumber(trend.tweetCount)} tweets</div>
                </div>
              ))}
              <button className="text-blue-500 hover:text-blue-600 text-sm mt-1 w-full text-left">
                Show more
              </button>
            </Card>
            
            <Card className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-4">
              <h3 className="font-bold text-xl mb-3">Who to follow</h3>
              {aiRappers.slice(0, 3).map(rapper => (
                <div key={rapper.id} className="py-2 flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={rapper.image} alt={rapper.name} />
                    <AvatarFallback>{rapper.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div className="font-bold truncate">{rapper.name}</div>
                      {rapper.popularity > 70 && (
                        <span className="ml-0.5 text-blue-500 flex-shrink-0">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 4L12 14.01l-3-3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      )}
                    </div>
                    <div className="text-gray-500 text-sm truncate">@{rapper.name.toLowerCase().replace(/\s+/g, '')}</div>
                  </div>
                  <Button className="ml-2 rounded-full" size="sm">
                    Follow
                  </Button>
                </div>
              ))}
              <button className="text-blue-500 hover:text-blue-600 text-sm mt-1 w-full text-left">
                Show more
              </button>
            </Card>
            
            <div className="text-xs text-gray-500 px-2">
              <div className="flex flex-wrap gap-x-2">
                <a href="#" className="hover:underline">Terms of Service</a>
                <a href="#" className="hover:underline">Privacy Policy</a>
                <a href="#" className="hover:underline">Cookie Policy</a>
                <a href="#" className="hover:underline">Accessibility</a>
                <a href="#" className="hover:underline">Ads info</a>
                <a href="#" className="hover:underline">More</a>
              </div>
              <div className="mt-1">© 2025 X Corp.</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Compose Tweet Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create post</DialogTitle>
          </DialogHeader>
          <div className="flex gap-4 mt-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={character?.image} alt={character?.artistName} />
              <AvatarFallback>{character?.artistName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={tweetText}
                onChange={(e) => setTweetText(e.target.value)}
                placeholder="What's happening?"
                className="min-h-[150px] border-0 focus-visible:ring-0 resize-none text-lg"
              />
              {selectedImage && (
                <div className="relative mt-3 rounded-xl overflow-hidden">
                  <img src={selectedImage} alt="Uploaded" className="w-full max-h-[300px] object-cover" />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 w-8 h-8 rounded-full p-0"
                    onClick={() => setSelectedImage(null)}
                  >
                    ✕
                  </Button>
                </div>
              )}
              <div className="border-t mt-4 pt-3 flex justify-between items-center">
                <div className="flex gap-2 text-blue-500">
                  <button 
                    className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onClick={openGallery}
                  >
                    <ImageIcon size={20} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    accept="image/*" 
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500">
                    {280 - tweetText.length} left
                  </div>
                  <Button
                    onClick={handleTweetSubmit}
                    disabled={!tweetText.trim()}
                    className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-5"
                  >
                    Tweet
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}