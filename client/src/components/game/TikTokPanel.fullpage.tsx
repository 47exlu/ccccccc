import React, { useState, useRef } from "react";
import { useRapperGame } from "../../lib/stores/useRapperGame";
import { SocialMediaPost } from "../../lib/types";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  ChevronLeft, Heart, MessageCircle, Share, 
  MoreHorizontal, ImageIcon, Home, 
  User, Search, PlusSquare, Plus, Bell,
  Music, Play, Volume2, VolumeX,
  Pause, Bookmark, Sparkles
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

// Generate unique video ideas based on artist style
const generateVideoIdeas = (style?: string): string[] => {
  const baseIdeas = [
    "Studio session vibes",
    "Behind the scenes at the video shoot",
    "Freestyle challenge",
    "Fan Q&A",
    "Day in the life",
    "Reaction to new music",
    "Vocal warmup routine",
    "Writing process breakdown",
    "Producer collaboration",
    "Dance challenge to latest single"
  ];
  
  const trapIdeas = [
    "Beat making in the studio",
    "Jewelry collection showcase",
    "Car collection tour",
    "Sneaker collection review",
    "Studio equipment setup tour"
  ];
  
  const undergroundIdeas = [
    "Vinyl crate digging session",
    "Sampling techniques tutorial",
    "Local venue performance clips",
    "Lyric breakdown",
    "Culture influences discussion"
  ];
  
  const popIdeas = [
    "Choreography practice",
    "Outfit of the day",
    "Tour bus life",
    "Meet and greet highlights",
    "Vocal technique tips"
  ];
  
  let combinedIdeas = [...baseIdeas];
  
  if (style) {
    const lowerStyle = style.toLowerCase();
    if (lowerStyle.includes("trap") || lowerStyle.includes("drill")) {
      combinedIdeas = [...combinedIdeas, ...trapIdeas];
    } else if (lowerStyle.includes("underground") || lowerStyle.includes("conscious")) {
      combinedIdeas = [...combinedIdeas, ...undergroundIdeas];
    } else if (lowerStyle.includes("pop") || lowerStyle.includes("mainstream")) {
      combinedIdeas = [...combinedIdeas, ...popIdeas];
    }
  }
  
  // Shuffle ideas
  const shuffledIdeas = [...combinedIdeas].sort(() => 0.5 - Math.random());
  return shuffledIdeas.slice(0, 5);
};

// Generate mock data for trending sounds
const generateTrendingSounds = () => {
  return [
    { id: "1", name: "Original Sound - Studio Session", author: "rapper_beats", uses: 245000 },
    { id: "2", name: "Beat Drop Challenge", author: "producer_vibes", uses: 189000 },
    { id: "3", name: "Flow Switch Remix", author: "dj_tracks", uses: 132000 },
    { id: "4", name: "16 Bar Challenge", author: "rap_battles", uses: 98000 },
    { id: "5", name: "Studio Microphone Check", author: "sound_engineer", uses: 76000 },
  ];
};

// Generate effect ideas for TikTok videos
const generateEffects = () => {
  return [
    { id: "1", name: "Bass Boost", description: "Enhance the low frequencies of your track" },
    { id: "2", name: "Studio Reverb", description: "Add professional studio acoustics" },
    { id: "3", name: "Vocal Clarity", description: "Make your vocals cut through the mix" },
    { id: "4", name: "Beat Sync", description: "Sync visual effects to your beat" },
    { id: "5", name: "Lyric Overlay", description: "Automatically add synchronized lyrics" },
  ];
};

// TikTok Video Component
interface TikTokVideoProps {
  post: SocialMediaPost;
  username: string;
  userAvatar?: string;
  verified?: boolean;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onSave?: (postId: string) => void;
  isActive?: boolean;
  onVideoProgress?: (progress: number) => void;
}

const TikTokVideo: React.FC<TikTokVideoProps> = ({
  post,
  username,
  userAvatar,
  verified = false,
  onLike,
  onComment,
  onShare,
  onSave,
  isActive = false,
  onVideoProgress
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Simulate video progress when active
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 1;
          if (newProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          if (onVideoProgress) onVideoProgress(newProgress);
          return newProgress;
        });
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [isActive, isPlaying, onVideoProgress]);
  
  // Reset progress when active state changes
  React.useEffect(() => {
    if (isActive) {
      setProgress(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [isActive]);
  
  const handleLike = () => {
    if (isLiked) {
      setLikesCount(prev => prev - 1);
    } else {
      setLikesCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
    if (onLike) onLike(post.id);
  };
  
  const handleSave = () => {
    setIsSaved(!isSaved);
    if (onSave) onSave(post.id);
  };
  
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };
  
  return (
    <div className="relative h-full w-full flex items-center justify-center bg-black">
      {/* Video Content */}
      <div 
        className="relative h-full w-full flex items-center justify-center cursor-pointer"
        onClick={togglePlay}
      >
        {post.image ? (
          <div className="h-full w-full relative">
            <img src={post.image} alt="TikTok video" className="h-full w-full object-cover" />
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-500/50">
              <div 
                className="h-full bg-white"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            {/* Play/Pause button */}
            <div className="absolute inset-0 flex items-center justify-center">
              {!isPlaying && (
                <div className="h-16 w-16 bg-black/30 rounded-full flex items-center justify-center">
                  <Play size={32} className="text-white ml-1" />
                </div>
              )}
            </div>
            
            {/* Video content overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 pointer-events-none" />
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-center">
            <p className="text-white text-lg font-medium">{post.content}</p>
          </div>
        )}
      </div>
      
      {/* Sidebar Controls */}
      <div className="absolute right-3 bottom-20 flex flex-col items-center space-y-5">
        <button 
          className={`flex flex-col items-center text-white ${isLiked ? 'text-pink-500' : ''}`}
          onClick={handleLike}
        >
          <div className="h-10 w-10 bg-black/20 rounded-full flex items-center justify-center mb-1">
            <Heart size={28} className={isLiked ? 'fill-current' : ''} />
          </div>
          <span className="text-xs">{formatNumber(likesCount)}</span>
        </button>
        
        <button 
          className="flex flex-col items-center text-white"
          onClick={() => onComment && onComment(post.id)}
        >
          <div className="h-10 w-10 bg-black/20 rounded-full flex items-center justify-center mb-1">
            <MessageCircle size={26} />
          </div>
          <span className="text-xs">{formatNumber(post.comments)}</span>
        </button>
        
        <button 
          className="flex flex-col items-center text-white"
          onClick={() => onShare && onShare(post.id)}
        >
          <div className="h-10 w-10 bg-black/20 rounded-full flex items-center justify-center mb-1">
            <Share size={26} />
          </div>
          <span className="text-xs">{formatNumber(post.shares)}</span>
        </button>
        
        <button 
          className={`flex flex-col items-center text-white ${isSaved ? 'text-yellow-500' : ''}`}
          onClick={handleSave}
        >
          <div className="h-10 w-10 bg-black/20 rounded-full flex items-center justify-center mb-1">
            <Bookmark size={26} className={isSaved ? 'fill-current' : ''} />
          </div>
          <span className="text-xs">Save</span>
        </button>
      </div>
      
      {/* Bottom Info */}
      <div className="absolute left-3 right-16 bottom-4 text-white">
        <div className="mb-2">
          <div className="flex items-center">
            <span className="font-bold text-lg">@{username.toLowerCase().replace(/\s+/g, '')}</span>
            {verified && (
              <span className="ml-1 text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </div>
          <p className="text-sm mb-2">{post.content}</p>
        </div>
        
        {/* Song Info */}
        <div className="flex items-center">
          <Music size={16} className="mr-2" />
          <div className="flex-1 overflow-hidden">
            <div className="whitespace-nowrap overflow-hidden text-sm animate-marquee">
              Original Sound - {username} • Original Sound - {username}
            </div>
          </div>
        </div>
      </div>
      
      {/* Volume Control */}
      <button 
        className="absolute right-3 top-20 h-10 w-10 bg-black/20 rounded-full flex items-center justify-center text-white"
        onClick={toggleMute}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
      
      {/* User Avatar */}
      <div className="absolute right-3 bottom-[270px]">
        <Avatar className="h-12 w-12 ring-2 ring-white">
          <AvatarImage src={userAvatar} alt={username} />
          <AvatarFallback>{username.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-2 left-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
          +
        </div>
      </div>
    </div>
  );
};

// Create Video Dialog
const CreateVideoDialog: React.FC<{
  onPost: (text: string, image?: string) => void;
}> = ({ onPost }) => {
  const [videoText, setVideoText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const trendingSounds = generateTrendingSounds();
  const effectOptions = generateEffects();
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  
  const handleSubmit = () => {
    if (videoText || selectedImage) {
      onPost(videoText, selectedImage || undefined);
      setVideoText('');
      setSelectedImage(null);
      setSelectedSound(null);
      setSelectedEffect(null);
    }
  };
  
  return (
    <div className="w-full">
      <Tabs defaultValue="upload" className="w-full mb-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="template">Template</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <div className="mb-4">
            {selectedImage ? (
              <div className="relative aspect-[9/16] rounded bg-gray-100 dark:bg-gray-800 mb-3">
                <img src={selectedImage} className="w-full h-full object-cover rounded" alt="Upload preview" />
                <Button 
                  className="absolute top-2 right-2 bg-gray-800/70 hover:bg-gray-800 h-8 w-8 p-0 rounded-full"
                  onClick={() => setSelectedImage(null)}
                >
                  <span className="sr-only">Remove</span>
                  ✕
                </Button>
              </div>
            ) : (
              <div 
                className="aspect-[9/16] rounded bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center cursor-pointer mb-3"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-10 w-10 text-gray-400 mb-3" />
                <p className="text-gray-600 dark:text-gray-400 text-sm">Tap to upload</p>
                <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Videos up to 3 minutes</p>
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImageSelect} 
                  accept="image/*,video/*" 
                />
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="template">
          <div className="mb-4 grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map(i => (
              <div 
                key={i}
                className="aspect-[9/16] rounded bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center cursor-pointer relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <span className="text-white font-medium">Template {i}</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mb-4">
        <label className="text-sm font-medium mb-1 block">Caption</label>
        <Textarea
          placeholder="Describe your video..."
          value={videoText}
          onChange={e => setVideoText(e.target.value)}
          rows={2}
          className="w-full"
        />
      </div>
      
      <div className="mb-4">
        <label className="text-sm font-medium mb-1 block">Sounds</label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {trendingSounds.map(sound => (
            <div 
              key={sound.id}
              className={`p-2 rounded flex items-center cursor-pointer ${
                selectedSound === sound.id 
                  ? 'bg-pink-100 dark:bg-pink-900/30 border border-pink-300 dark:border-pink-800' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => setSelectedSound(sound.id)}
            >
              <div className="h-10 w-10 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                <Music size={18} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{sound.name}</div>
                <div className="text-xs text-gray-500">{sound.author} • {formatNumber(sound.uses)} videos</div>
              </div>
              {selectedSound === sound.id && (
                <div className="h-6 w-6 bg-pink-500 rounded-full flex items-center justify-center text-white">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <label className="text-sm font-medium mb-1 block">Effects</label>
        <div className="flex overflow-x-auto space-x-2 pb-2">
          {effectOptions.map(effect => (
            <div 
              key={effect.id}
              className={`p-2 rounded-lg min-w-[120px] flex flex-col items-center cursor-pointer ${
                selectedEffect === effect.id 
                  ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-800' 
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
              onClick={() => setSelectedEffect(effect.id)}
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-2">
                <Sparkles size={18} className="text-white" />
              </div>
              <div className="text-sm font-medium text-center">{effect.name}</div>
              <div className="text-xs text-gray-500 text-center mt-1">{effect.description}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-pink-500 to-red-500 hover:opacity-90 text-white"
        >
          Post
        </Button>
      </div>
    </div>
  );
};

// For You Video Feed
interface VideoFeedProps {
  posts: SocialMediaPost[];
  aiRappers: any[];
  character: any;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ posts, aiRappers, character }) => {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, clientHeight } = scrollRef.current;
      const newIndex = Math.round(scrollTop / clientHeight);
      if (newIndex !== activeVideoIndex) {
        setActiveVideoIndex(newIndex);
      }
    }
  };
  
  // Video handlers
  const handleLike = (postId: string) => {
    console.log("Liked video:", postId);
  };
  
  const handleComment = (postId: string) => {
    console.log("Comment on video:", postId);
  };
  
  const handleShare = (postId: string) => {
    console.log("Share video:", postId);
  };
  
  const handleSave = (postId: string) => {
    console.log("Save video:", postId);
  };
  
  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" && activeVideoIndex < posts.length - 1) {
        setActiveVideoIndex(prev => prev + 1);
        scrollRef.current?.scrollTo({
          top: (activeVideoIndex + 1) * scrollRef.current.clientHeight,
          behavior: "smooth"
        });
      } else if (e.key === "ArrowUp" && activeVideoIndex > 0) {
        setActiveVideoIndex(prev => prev - 1);
        scrollRef.current?.scrollTo({
          top: (activeVideoIndex - 1) * scrollRef.current.clientHeight,
          behavior: "smooth"
        });
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeVideoIndex, posts.length]);
  
  return (
    <div 
      className="h-full overflow-y-scroll snap-y snap-mandatory" 
      ref={scrollRef}
      onScroll={handleScroll}
    >
      {posts.map((post, index) => {
        // Find matching rapper for AI posts
        const aiMatch = aiRappers.find(rapper => 
          post.content.includes(rapper.name) || 
          (post.content.includes('@') && post.content.includes(rapper.name.toLowerCase().replace(/\s+/g, '')))
        );
        
        const isPlayerPost = !aiMatch;
        
        return (
          <div key={post.id} className="h-full w-full snap-start snap-always">
            <TikTokVideo
              post={post}
              username={isPlayerPost ? character?.artistName : (aiMatch?.name || "User")}
              userAvatar={isPlayerPost ? character?.image : aiMatch?.image}
              verified={isPlayerPost ? true : (aiMatch?.popularity ? aiMatch.popularity > 70 : false)}
              isActive={index === activeVideoIndex}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              onSave={handleSave}
            />
          </div>
        );
      })}
    </div>
  );
};

// Main TikTok Panel Component
export function TikTokPanelFullPage() {
  const [activeTab, setActiveTab] = useState<"for_you" | "following" | "discover" | "inbox" | "profile">("for_you");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [videoIdeas, setVideoIdeas] = useState<string[]>([]);
  
  const character = useRapperGame(state => state.character);
  const socialMedia = useRapperGame(state => state.socialMedia);
  const postOnSocialMedia = useRapperGame(state => state.postOnSocialMedia);
  const currentWeek = useRapperGame(state => state.currentWeek);
  const aiRappers = useRapperGame(state => state.aiRappers);
  const setScreen = useRapperGame(state => state.setScreen);
  const { playSuccess } = useAudio();
  
  const handleBackToDashboard = () => {
    setScreen('social_media');
  };
  
  // Get TikTok data from social media
  const tiktokData = socialMedia.find(p => p.name === "TikTok") || {
    name: "TikTok",
    followers: 0,
    posts: 0,
    engagement: 0,
    lastPostWeek: 0
  };
  
  // Generate video ideas based on character music style
  React.useEffect(() => {
    if (videoIdeas.length === 0) {
      const ideas = generateVideoIdeas(character?.musicStyle);
      setVideoIdeas(ideas);
    }
  }, [character?.musicStyle, videoIdeas.length]);
  
  // Generate posts for TikTok
  const [generatedPosts, setGeneratedPosts] = useState<SocialMediaPost[]>([]);
  
  React.useEffect(() => {
    if (generatedPosts.length === 0) {
      const posts = generateWeeklyAIPosts(aiRappers, "TikTok", currentWeek, character);
      
      // Make sure all posts have images
      const postsWithImages = posts.map(post => {
        if (!post.image) {
          const imageNumber = Math.floor(Math.random() * 6) + 1;
          return {
            ...post,
            image: `/assets/covers/cover${imageNumber}.svg`
          };
        }
        return post;
      });
      
      setGeneratedPosts(postsWithImages);
    }
  }, [aiRappers, character, currentWeek, generatedPosts.length]);
  
  // Handle video post creation
  const handleCreateVideo = (text: string, image?: string) => {
    postOnSocialMedia("TikTok", text, image ? [image] : undefined);
    playSuccess?.();
    setIsComposeOpen(false);
    
    // You could also add logic here to update the local state with the new post
  };
  
  // Get follower count
  const followerCount = tiktokData.followers || 0;
  
  return (
    <div className="w-full bg-white dark:bg-black min-h-screen text-black dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        {/* Back to Dashboard button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute left-2 z-20" 
          onClick={handleBackToDashboard}
        >
          <ChevronLeft className="h-6 w-6" />
          <span className="sr-only">Back to dashboard</span>
        </Button>
        
        {activeTab === "for_you" || activeTab === "following" ? (
          <div className="flex-1 flex justify-center">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-60">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="for_you">For You</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        ) : (
          <div className="flex-1 text-center font-medium">
            {activeTab === "discover" && "Discover"}
            {activeTab === "inbox" && "Inbox"}
            {activeTab === "profile" && character?.artistName}
          </div>
        )}
      </header>
      
      {/* Main Content */}
      <main className={`${activeTab === "for_you" || activeTab === "following" ? "h-[calc(100vh-112px)]" : "min-h-[calc(100vh-112px)]"}`}>
        {(activeTab === "for_you" || activeTab === "following") && (
          <VideoFeed 
            posts={generatedPosts}
            aiRappers={aiRappers}
            character={character}
          />
        )}
        
        {activeTab === "discover" && (
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg pl-10 pr-4 py-2 border-none focus:ring-1 focus:ring-gray-400"
              />
            </div>
            
            {/* Trending Hashtags */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">Trending Hashtags</h2>
              <div className="flex flex-wrap gap-2">
                {["#RapBattle", "#StudioLife", "#NewMusic", "#BehindTheScenes", "#ProducerLife", "#FreshBars", "#MusicProducer"].map(tag => (
                  <div key={tag} className="bg-gray-100 dark:bg-gray-800 py-1 px-3 rounded-full text-sm">
                    {tag}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Video Ideas */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">Content Ideas for Musicians</h2>
              <div className="space-y-2">
                {videoIdeas.map((idea, index) => (
                  <Card key={index} className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border-pink-200 dark:border-pink-800/30">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-500 dark:text-pink-400 mr-3">
                        <Sparkles size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{idea}</div>
                        <div className="text-xs text-gray-500">{Math.floor(Math.random() * 500) + 100}K videos</div>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-pink-500 hover:bg-pink-600 text-white rounded-full"
                        onClick={() => {
                          setIsComposeOpen(true);
                        }}
                      >
                        Create
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Trending Sounds */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">Popular Sounds</h2>
              <div className="space-y-2">
                {generateTrendingSounds().map(sound => (
                  <div key={sound.id} className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                      <Music size={24} className="text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{sound.name}</div>
                      <div className="text-sm text-gray-500">@{sound.author} • {formatNumber(sound.uses)} videos</div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full">
                      Use
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "profile" && (
          <div>
            {/* Profile Header */}
            <div className="p-4 text-center">
              <Avatar className="h-20 w-20 mx-auto mb-3">
                <AvatarImage src={character?.image} alt={character?.artistName} />
                <AvatarFallback>{character?.artistName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">@{character?.artistName?.toLowerCase().replace(/\s+/g, '')}</h2>
              
              {/* Stats */}
              <div className="flex justify-center space-x-6 my-4">
                <div className="text-center">
                  <div className="font-bold">{formatNumber(generatedPosts.length)}</div>
                  <div className="text-gray-500 text-sm">Videos</div>
                </div>
                <div className="text-center">
                  <div className="font-bold">{formatNumber(followerCount)}</div>
                  <div className="text-gray-500 text-sm">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-bold">{formatNumber(Math.floor(followerCount / 10))}</div>
                  <div className="text-gray-500 text-sm">Following</div>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm">{character?.about || 'Musician • Artist'}</p>
              </div>
              
              <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                Edit Profile
              </Button>
            </div>
            
            {/* Content Tabs */}
            <Tabs defaultValue="videos" className="w-full">
              <TabsList className="w-full grid grid-cols-3 h-auto">
                <TabsTrigger value="videos" className="py-3 data-[state=active]:border-t-2 data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:border-b-0 rounded-none">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </TabsTrigger>
                <TabsTrigger value="liked" className="py-3 data-[state=active]:border-t-2 data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:border-b-0 rounded-none">
                  <Heart size={24} />
                </TabsTrigger>
                <TabsTrigger value="private" className="py-3 data-[state=active]:border-t-2 data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:border-b-0 rounded-none">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 17v-2m0 0a5 5 0 100-10 5 5 0 000 10zm7 5H5a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="videos" className="mt-0">
                <div className="grid grid-cols-3 gap-1">
                  {generatedPosts.filter(post => !aiRappers.some(r => post.content.includes(r.name))).map((post) => (
                    <div key={post.id} className="aspect-[9/16] bg-gray-100 dark:bg-gray-800 relative">
                      {post.image ? (
                        <img src={post.image} alt="Video thumbnail" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <Play size={24} />
                        </div>
                      )}
                      <div className="absolute bottom-1 left-1 text-white text-xs font-medium">
                        {formatNumber(post.views || post.likes + post.shares)} views
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="liked" className="mt-0 p-8 text-center text-gray-500">
                <Heart size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold">No Liked Videos</h3>
                <p className="mt-2">Videos you've liked will appear here.</p>
              </TabsContent>
              <TabsContent value="private" className="mt-0 p-8 text-center text-gray-500">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 text-gray-400">
                  <path d="M12 17v-2m0 0a5 5 0 100-10 5 5 0 000 10zm7 5H5a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3 className="text-lg font-semibold">Private Videos</h3>
                <p className="mt-2">Videos visible only to you will appear here.</p>
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        {activeTab === "inbox" && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-8">
              <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold mb-2">Your Inbox</h3>
              <p className="text-gray-500 max-w-sm mb-4">
                All your activity and messages from followers will appear here.
              </p>
              <Button className="bg-red-500 hover:bg-red-600 text-white">
                View Activity
              </Button>
            </div>
          </div>
        )}
      </main>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 flex justify-between items-center px-8 py-3 z-10">
        <button 
          onClick={() => setActiveTab("for_you")}
          className={activeTab === "for_you" || activeTab === "following" ? "text-black dark:text-white" : "text-gray-500"}
        >
          <Home size={24} />
        </button>
        <button 
          onClick={() => setActiveTab("discover")}
          className={activeTab === "discover" ? "text-black dark:text-white" : "text-gray-500"}
        >
          <Search size={24} />
        </button>
        <button 
          onClick={() => setIsComposeOpen(true)}
          className="h-12 w-12 flex items-center justify-center rounded-md bg-red-500 text-white relative"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 bg-cyan-500"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <PlusSquare size={24} />
          </div>
        </button>
        <button 
          onClick={() => setActiveTab("inbox")}
          className={activeTab === "inbox" ? "text-black dark:text-white" : "text-gray-500"}
        >
          <MessageCircle size={24} />
        </button>
        <button 
          onClick={() => setActiveTab("profile")}
          className={activeTab === "profile" ? "text-black dark:text-white" : "text-gray-500"}
        >
          <User size={24} />
        </button>
      </div>
      
      {/* Create Video Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create new video</DialogTitle>
          </DialogHeader>
          <CreateVideoDialog onPost={handleCreateVideo} />
        </DialogContent>
      </Dialog>
    </div>
  );
}