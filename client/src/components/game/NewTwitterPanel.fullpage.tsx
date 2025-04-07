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
  ChevronLeft, 
  ArrowLeft, 
  Verified,
  Settings,
  BarChart2,
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
  const [likesCount, setLikesCount] = useState(post.likes);
  const [retweetsCount, setRetweetsCount] = useState(post.shares);
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

  const displayName = account?.accountName || playerName;
  const displayHandle = account?.handle || handle;
  
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
                  <span className="ml-0.5 text-blue-500">
                    <Verified size={16} className="inline" />
                  </span>
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
            <button className="text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800">
              <MoreHorizontal size={16} />
            </button>
          </div>
          
          <div className="mt-2">
            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap text-base">{post.content}</p>
            
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
              <span>{formatDate(post.date)} ago</span>
              <span className="mx-1">·</span>
              <span>{formatNumber(post.views || post.likes * 4)} views</span>
            </div>
            
            {/* Post engagement buttons */}
            <div className="flex mt-3 justify-between text-gray-500">
              <button 
                className="flex items-center hover:text-blue-500 transition duration-150 group"
                onClick={() => onReply && onReply(post.id)}
              >
                <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 mr-1">
                  <MessageCircle size={18} />
                </div>
                <span>{formatNumber(post.comments)}</span>
              </button>
              
              <button 
                className={`flex items-center group transition duration-150 ${retweeted ? 'text-green-500' : 'hover:text-green-500'}`}
                onClick={handleRetweet}
              >
                <div className={`p-2 rounded-full ${retweeted ? 'bg-green-50 dark:bg-green-900/20' : 'group-hover:bg-green-50 dark:group-hover:bg-green-900/20'} mr-1`}>
                  <Repeat size={18} className={retweeted ? 'text-green-500' : ''} />
                </div>
                <span>{formatNumber(retweetsCount)}</span>
              </button>
              
              <button 
                className={`flex items-center group transition duration-150 ${liked ? 'text-pink-500' : 'hover:text-pink-500'}`}
                onClick={handleLike}
              >
                <div className={`p-2 rounded-full ${liked ? 'bg-pink-50 dark:bg-pink-900/20' : 'group-hover:bg-pink-50 dark:group-hover:bg-pink-900/20'} mr-1`}>
                  <Heart size={18} className={liked ? 'fill-current text-pink-500' : ''} />
                </div>
                <span>{formatNumber(likesCount)}</span>
              </button>
              
              <button className="flex items-center hover:text-blue-500 transition duration-150 group">
                <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20">
                  <Share size={18} />
                </div>
              </button>
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
export function NewTwitterPanelFullPage() {
  const [activeTab, setActiveTab] = useState<"home" | "explore" | "notifications" | "messages" | "profile">("home");
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
  
  useEffect(() => {
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
      const imageArray = selectedImage ? [selectedImage] : undefined;
      postOnSocialMedia("Twitter", tweetText, imageArray);
      playSuccess?.();
      setTweetText("");
      setSelectedImage(null);
      setIsComposeOpen(false);
      
      // Generate random AI responses to player's tweet
      const shouldRespond = Math.random() > 0.7; // 30% chance of response
      
      if (shouldRespond) {
        const respondingRapper = aiRappers[Math.floor(Math.random() * aiRappers.length)];
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
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
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
      <div className="flex">
        {/* Left Sidebar - Navigation */}
        <div className="w-20 md:w-64 lg:w-72 border-r border-gray-200 dark:border-gray-800 p-2 hidden md:block">
          <div className="flex flex-col space-y-1 p-2">
            <button 
              onClick={() => setActiveTab("home")}
              className={`${
                activeTab === "home" 
                  ? "font-bold bg-gray-100 dark:bg-gray-800" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
              } flex items-center px-3 py-3 rounded-full transition-colors`}
            >
              <Home className="h-6 w-6 flex-shrink-0" />
              <span className="ml-4 text-lg">Home</span>
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
              <span className="ml-4 text-lg">Explore</span>
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
              <span className="ml-4 text-lg">Notifications</span>
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
              <span className="ml-4 text-lg">Messages</span>
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
              <span className="ml-4 text-lg">Profile</span>
            </button>
            
            <div className="mt-4">
              <Button 
                className="w-full rounded-full bg-blue-500 hover:bg-blue-600 text-white" 
                size="lg"
                onClick={() => setIsComposeOpen(true)}
              >
                Tweet
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 min-w-0 border-r border-gray-200 dark:border-gray-800">
          {activeTab === "home" && (
            <div>
              <div className="sticky top-14 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-10 p-4 border-b border-gray-200 dark:border-gray-800">
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
              
              <div className="overflow-auto max-h-[calc(100vh-150px)]">
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
            </div>
          )}
        </div>
        
        {/* Right Sidebar - Trends & Suggestions */}
        <div className="w-80 p-4 hidden lg:block">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-4">
            <h3 className="font-bold text-xl mb-2">Trends for you</h3>
            {trends.map(trend => (
              <div key={trend.id} className="py-2 hover:bg-gray-100 dark:hover:bg-gray-800 -mx-4 px-4 cursor-pointer">
                <div className="text-xs text-gray-500">{trend.category} · Trending</div>
                <div className="font-bold">#{trend.name}</div>
                <div className="text-sm text-gray-500">{formatNumber(trend.tweetCount)} Tweets</div>
              </div>
            ))}
            <button className="text-blue-500 hover:text-blue-600 text-sm mt-2">Show more</button>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
            <h3 className="font-bold text-xl mb-2">Who to follow</h3>
            {musicChartAccounts.slice(0, 3).map(account => (
              <div key={account.id} className="flex items-center py-3 hover:bg-gray-100 dark:hover:bg-gray-800 -mx-4 px-4 cursor-pointer">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={account.avatar} alt={account.accountName} />
                  <AvatarFallback>{account.accountName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <span className="font-bold truncate">{account.accountName}</span>
                    {account.verified && (
                      <span className="ml-0.5 text-blue-500">
                        <Verified size={14} />
                      </span>
                    )}
                  </div>
                  <div className="text-gray-500 text-sm truncate">@{account.handle}</div>
                </div>
                <Button className="rounded-full bg-black dark:bg-white text-white dark:text-black text-sm ml-2">Follow</Button>
              </div>
            ))}
            <button className="text-blue-500 hover:text-blue-600 text-sm mt-2">Show more</button>
          </div>
        </div>
      </div>
      
      {/* Compose Tweet Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={(open) => !open && setIsComposeOpen(false)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>
          <div className="flex">
            <Avatar className="h-12 w-12 mr-3">
              <AvatarImage src={character?.image} alt={character?.artistName} />
              <AvatarFallback>{character?.artistName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's happening?"
                className="resize-none border-0 focus-visible:ring-0 text-xl p-0 h-24"
                value={tweetText}
                onChange={(e) => setTweetText(e.target.value)}
              />
              {selectedImage && (
                <div className="relative mt-2 rounded-xl overflow-hidden border">
                  <img src={selectedImage} alt="Selected" className="max-h-60 w-full object-cover" />
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <Separator />
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2 text-blue-500">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
              />
              <button 
                className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={openGallery}
              >
                <ImageIcon size={20} />
              </button>
            </div>
            <Button 
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-4"
              disabled={!tweetText.trim()}
              onClick={handleTweetSubmit}
            >
              Tweet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}