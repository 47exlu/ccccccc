import React, { useState, useEffect, useRef } from "react";
import { useRapperGame } from "@/lib/stores/useRapperGame";
import { SocialMediaPost } from "@/lib/types";
import { toast } from "sonner"; 
import { 
  EmptyPostState,
  formatNumber 
} from "./SocialMediaBase";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Home, 
  Search, 
  Plus, 
  Inbox, 
  User,
  Music, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Upload,
  Video,
  ChevronUp,
  Sparkles,
  X,
  Camera,
  Settings,
  ArrowLeft,
  BellPlus,
  MoreVertical,
  KeyRound,
  Clock,
  Flame,
  TrendingUp,
  Mail,
  Store,
  Hash,
  Mic,
  FileText,
  Lock,
  Bell
} from "lucide-react";

// TikTok Video Component
interface TikTokVideoProps {
  post: SocialMediaPost;
  character: any;
  isActive: boolean;
  onVideoEnd: () => void;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  onBookmark: (id: string) => void;
  onFollow: (username: string) => void;
}

const TikTokVideo: React.FC<TikTokVideoProps> = ({ 
  post, 
  character, 
  isActive,
  onVideoEnd,
  onLike, 
  onComment, 
  onShare, 
  onBookmark,
  onFollow
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isPlaying, setIsPlaying] = useState(isActive);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate avatar and username from post or use character info
  const userName = post.username || character?.artistName || "User";
  const userHandle = post.handle || userName.toLowerCase().replace(/\s+/g, '');
  const avatarUrl = post.avatar || character?.image;
  const verified = post.verified !== undefined ? post.verified : true;
  
  // Simulate video progress when active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 0.5;
          if (newProgress >= 100) {
            clearInterval(interval);
            onVideoEnd();
            return 0;
          }
          return newProgress;
        });
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [isActive, isPlaying, onVideoEnd]);
  
  // Reset progress when active state changes
  useEffect(() => {
    if (isActive) {
      setProgress(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [isActive]);
  
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Animate heart button
    const target = e.currentTarget as HTMLButtonElement;
    target.classList.add('animate-pop');
    setTimeout(() => {
      target.classList.remove('animate-pop');
    }, 300);
    
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike(post.id);
  };
  
  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    onBookmark(post.id);
  };
  
  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCommentOpen(true);
    onComment(post.id);
  };
  
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(post.id);
  };
  
  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFollowing(!isFollowing);
    onFollow(userHandle);
  };
  
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };
  
  // Calculate video aspect ratio - TikTok videos are typically 9:16
  const aspectRatio = 9 / 16;
  const maxHeight = window.innerHeight;
  const idealWidth = maxHeight * aspectRatio;

  return (
    <>
      <div 
        ref={containerRef}
        className="relative h-full w-full flex items-center justify-center bg-black"
        onClick={togglePlay}
      >
        {/* Video Content */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          {post.image ? (
            <div className="h-full w-full relative">
              <img src={post.image} alt="TikTok video" className="h-full w-full object-cover" />
              {/* Play/Pause button */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 bg-black/30 rounded-full flex items-center justify-center">
                    <Play size={32} className="text-white ml-1" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#FE2C55] to-[#25F4EE] p-6 text-center">
              <p className="text-white text-lg font-medium">{post.content}</p>
              {!isPlaying && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="h-16 w-16 bg-black/30 rounded-full flex items-center justify-center">
                    <Play size={32} className="text-white ml-1" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-500/30 z-10">
          <div 
            className="h-full bg-white transition-[width]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Sidebar Controls */}
        <div className="absolute right-2 bottom-20 flex flex-col items-center space-y-5 z-10">
          <div className="flex flex-col items-center">
            <Avatar className="h-12 w-12 border-2 border-white mb-3">
              <AvatarImage src={avatarUrl} alt={userName} className="object-cover" />
              <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="bg-[#FE2C55] rounded-full h-6 w-6 flex items-center justify-center mb-2">
              <Plus size={16} className="text-white" />
            </div>
          </div>
          
          <button 
            className={`flex flex-col items-center text-white`}
            onClick={handleLike}
          >
            <div 
              className={`h-12 w-12 rounded-full flex items-center justify-center bg-black/10 backdrop-blur-md mb-1 ${isLiked ? 'bg-[#FE2C55]/20' : ''}`}
            >
              <Heart size={30} fill={isLiked ? '#FE2C55' : 'none'} stroke={isLiked ? '#FE2C55' : 'white'} strokeWidth={2} />
            </div>
            <span className="text-xs font-semibold">{formatNumber(likesCount)}</span>
          </button>
          
          <button 
            className="flex flex-col items-center text-white"
            onClick={handleCommentClick}
          >
            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-black/10 backdrop-blur-md mb-1">
              <MessageCircle size={30} stroke="white" strokeWidth={2} />
            </div>
            <span className="text-xs font-semibold">{formatNumber(post.comments)}</span>
          </button>
          
          <button 
            className="flex flex-col items-center text-white"
            onClick={handleBookmark}
          >
            <div 
              className={`h-12 w-12 rounded-full flex items-center justify-center bg-black/10 backdrop-blur-md mb-1 ${isBookmarked ? 'bg-yellow-500/20' : ''}`}
            >
              <Bookmark size={30} fill={isBookmarked ? 'white' : 'none'} stroke="white" strokeWidth={2} />
            </div>
            <span className="text-xs font-semibold">Save</span>
          </button>
          
          <button 
            className="flex flex-col items-center text-white"
            onClick={handleShare}
          >
            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-black/10 backdrop-blur-md mb-1">
              <Share2 size={30} stroke="white" strokeWidth={2} />
            </div>
            <span className="text-xs font-semibold">Share</span>
          </button>
          
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-black/10 backdrop-blur-md p-1 overflow-hidden border border-white">
            <div className="h-full w-full bg-[#25F4EE] rounded-full flex items-center justify-center animate-spin-slow">
              <Music size={18} className="text-white" />
            </div>
          </div>
        </div>
        
        {/* Bottom Info */}
        <div className="absolute left-3 right-20 bottom-4 text-white z-10">
          <div className="mb-2">
            <div className="flex items-center mb-1">
              <span className="font-bold text-lg text-white">@{userHandle}</span>
              {verified && (
                <Badge className="ml-1 bg-[#25F4EE] text-white border-0 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="white"/>
                  </svg>
                </Badge>
              )}
              <button 
                className={`ml-2 px-3 py-1 text-xs ${isFollowing ? 'border border-white/50 text-white' : 'bg-[#FE2C55] text-white'} rounded-sm font-medium`}
                onClick={handleFollow}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
            
            <div className="mb-2">
              {post.content.length > 80 && !showFullCaption ? (
                <>
                  <p className="text-sm mr-1 line-clamp-2">{post.content}</p>
                  <button 
                    className="text-xs text-white/70" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFullCaption(true);
                    }}
                  >
                    Read more
                  </button>
                </>
              ) : (
                <p className="text-sm">{post.content}</p>
              )}
            </div>
          </div>
          
          {/* Song Info */}
          <div className="flex items-center">
            <Music size={16} className="mr-2 text-white" />
            <div className="flex-1 overflow-hidden">
              <div className="whitespace-nowrap overflow-hidden text-sm animate-marquee">
                <span className="mr-4">Original Sound - {userName}</span>
                <span>Original Sound - {userName}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Top Actions */}
        <div className="absolute top-3 right-3 flex space-x-4 text-white z-10">
          <button
            className="h-10 w-10 rounded-full flex items-center justify-center bg-black/10 backdrop-blur-md"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>
      
      {/* Comments Slide-up Dialog */}
      <Dialog open={isCommentOpen} onOpenChange={setIsCommentOpen}>
        <DialogContent className="top-[initial] bottom-0 translate-y-0 max-h-[90vh] p-0 rounded-t-xl rounded-b-none">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-center flex-1">Comments</h3>
              <button onClick={() => setIsCommentOpen(false)} className="text-gray-500">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex flex-col mt-4 max-h-[60vh] overflow-y-auto">
              {Array.from({ length: Math.floor(Math.random() * 5) + 2 }).map((_, index) => (
                <div key={index} className="flex items-start mb-4">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={`/assets/profiles/profile${(index % 6) + 1}.svg`} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <span className="font-semibold text-sm mr-1">user{index + 1}</span>
                      <span className="text-gray-500 text-xs">2d</span>
                    </div>
                    <p className="text-sm">
                      {index === 0 
                        ? `This beat is fire 🔥` 
                        : index === 1 
                          ? `Love your music! When's the next drop?` 
                          : `Amazing content! Keep it up 👏`}
                    </p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <button className="mr-3 flex items-center">
                        <Heart size={12} className="mr-1" />
                        <span>{Math.floor(Math.random() * 100)}</span>
                      </button>
                      <button>Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Comment input */}
            <div className="flex items-center mt-4 pt-2 border-t border-gray-200 dark:border-gray-800">
              <Input 
                placeholder="Add comment..." 
                className="flex-1 mr-2 bg-gray-100 dark:bg-gray-800 border-0"
              />
              <Button 
                className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white px-3"
              >
                Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// TikTok Feed Component
interface TikTokFeedProps {
  posts: SocialMediaPost[];
  character: any;
  feedType: 'foryou' | 'following';
}

const TikTokFeed: React.FC<TikTokFeedProps> = ({ posts, character, feedType }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);
  
  // Handle scroll to change active video
  useEffect(() => {
    const handleScroll = () => {
      if (feedRef.current) {
        const scrollTop = feedRef.current.scrollTop;
        const height = feedRef.current.clientHeight;
        
        // Calculate which video is most visible
        const index = Math.round(scrollTop / height);
        if (index !== activeIndex && index >= 0 && index < posts.length) {
          setActiveIndex(index);
        }
        
        setScrollPosition(scrollTop);
      }
    };
    
    const feedElement = feedRef.current;
    if (feedElement) {
      feedElement.addEventListener('scroll', handleScroll);
      
      return () => {
        feedElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, [activeIndex, posts.length]);
  
  const handleVideoEnd = () => {
    // Move to next video when current one ends
    if (activeIndex < posts.length - 1) {
      if (feedRef.current) {
        feedRef.current.scrollTo({
          top: (activeIndex + 1) * feedRef.current.clientHeight,
          behavior: 'smooth'
        });
      }
    } else {
      // Loop back to first video
      if (feedRef.current) {
        feedRef.current.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }
  };
  
  const handleLike = (id: string) => {
    console.log(`Liked video: ${id}`);
    
    // Update state in local posts if found
    if (typeof setTiktokPosts === 'function') {
      setTiktokPosts((prevPosts: SocialMediaPost[]) => 
        prevPosts.map((post: SocialMediaPost) => {
          if (post.id === id) {
            // Toggle like state and update count
            const liked = post.liked || false;
            return {
              ...post,
              likes: liked ? Math.max(0, post.likes - 1) : post.likes + 1,
              liked: !liked
            };
          }
          return post;
        })
      );
    }
    
    // Play heart animation sound
    const audio = new Audio("/assets/sounds/pop.mp3");
    audio.volume = 0.2;
    audio.play().catch(e => console.log("Audio play prevented:", e));
    
    // Show success notification
    toast.success("Video liked!", {
      position: "bottom-center",
      duration: 1000,
      className: "bg-[#FE2C55] text-white"
    });
  };
  
  const handleComment = (id: string) => {
    console.log(`Comment on video: ${id}`);
    
    // Update state in local posts if found to increment comment count
    if (typeof setTiktokPosts === 'function') {
      setTiktokPosts((prevPosts: SocialMediaPost[]) => 
        prevPosts.map((post: SocialMediaPost) => {
          if (post.id === id) {
            return {
              ...post,
              comments: post.comments + 1
            };
          }
          return post;
        })
      );
    }
    
    // Show success notification
    toast.success("Comment added!", {
      position: "bottom-center",
      duration: 1200
    });
  };
  
  const handleShare = (id: string) => {
    console.log(`Share video: ${id}`);
    
    // Show success notification with share options
    toast.success("Video shared!", {
      position: "bottom-center",
      duration: 1500,
      description: "Shared to your followers"
    });
  };
  
  const handleBookmark = (id: string) => {
    console.log(`Bookmarked video: ${id}`);
    
    // Update state in local posts if found
    if (typeof setTiktokPosts === 'function') {
      setTiktokPosts((prevPosts: SocialMediaPost[]) => 
        prevPosts.map((post: SocialMediaPost) => {
          if (post.id === id) {
            return {
              ...post,
              saved: !(post.saved || false),
              bookmarks: post.bookmarks ? (post.saved ? post.bookmarks - 1 : post.bookmarks + 1) : 1
            };
          }
          return post;
        })
      );
    }
    
    // Show success notification
    toast.success("Video saved to favorites!", {
      position: "bottom-center",
      duration: 1000
    });
  };
  
  const handleFollow = (username: string) => {
    console.log(`Follow user: ${username}`);
    
    // Show success notification
    toast.success(`Following @${username}`, {
      position: "bottom-center",
      duration: 1500,
      description: "You'll see their videos in your feed"
    });
  };

  if (posts.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <Video size={48} className="mx-auto mb-4 text-[#FE2C55]" />
          <h3 className="text-xl font-semibold mb-2">No videos yet</h3>
          <p className="text-gray-400 mb-6">Create your first TikTok video!</p>
          <Button className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white font-medium px-6">
            Create Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={feedRef}
      className="h-full w-full overflow-y-auto snap-y snap-mandatory"
      style={{ scrollSnapType: 'y mandatory' }}
    >
      {posts.map((post, index) => (
        <div 
          key={post.id || index}
          className="h-full w-full snap-start snap-always"
        >
          <TikTokVideo 
            post={post}
            character={character}
            isActive={index === activeIndex}
            onVideoEnd={handleVideoEnd}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            onBookmark={handleBookmark}
            onFollow={handleFollow}
          />
        </div>
      ))}
    </div>
  );
};

// Create Video Dialog
interface CreateVideoDialogProps {
  onPost: (content: string, image?: string) => void;
  character: any;
  onClose: () => void;
}

const CreateVideoDialog: React.FC<CreateVideoDialogProps> = ({ onPost, character, onClose }) => {
  const [videoCaption, setVideoCaption] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsLoading(true);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          // Simulate loading delay
          setTimeout(() => {
            setSelectedVideo(event.target?.result as string);
            setIsLoading(false);
          }, 1500);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handleSubmit = () => {
    if ((videoCaption.trim() || selectedVideo)) {
      onPost(videoCaption, selectedVideo || undefined);
      setVideoCaption('');
      setSelectedVideo(null);
      onClose();
    }
  };
  
  const handleBack = () => {
    if (selectedVideo) {
      setSelectedVideo(null);
    } else {
      onClose();
    }
  };
  
  // Trending sounds for selection
  const trendingSounds = [
    { id: '1', name: 'Original Sound - Studio Session', creator: 'Your Music', uses: '245K' },
    { id: '2', name: 'Beat Drop Challenge', creator: 'Producer XYZ', uses: '189K' },
    { id: '3', name: 'Flow Switch Remix', creator: 'DJ Beats', uses: '132K' },
    { id: '4', name: 'Viral Rap Beat 2025', creator: 'Trap Nation', uses: '98K' },
    { id: '5', name: 'Studio Vibes', creator: 'Music Producer', uses: '76K' },
  ];
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <button onClick={handleBack} className="p-2">
          <ArrowLeft size={20} />
        </button>
        
        <h2 className="flex-1 text-center font-semibold">
          {!selectedVideo ? 'New video' : 'Add details'}
        </h2>
        
        {selectedVideo ? (
          <button 
            onClick={handleSubmit} 
            className="text-[#FE2C55] font-medium"
            disabled={isLoading}
          >
            Post
          </button>
        ) : (
          <div className="w-10"></div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {!selectedVideo ? (
          <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-2 p-0 h-12">
              <TabsTrigger value="upload" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FE2C55]">
                Upload
              </TabsTrigger>
              <TabsTrigger value="camera" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FE2C55]">
                Camera
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="flex-1 flex flex-col m-0 data-[state=active]:mt-0">
              <div 
                className="flex-1 flex flex-col items-center justify-center p-6 text-center"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-4">
                  <Upload size={30} className="text-[#FE2C55]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Select video to upload</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Or drag and drop a file
                </p>
                <ul className="text-xs text-gray-500 space-y-1 mb-4">
                  <li>MP4 or WebM</li>
                  <li>720x1280 resolution or higher</li>
                  <li>Up to 60 seconds</li>
                </ul>
                <Button className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white">
                  Select file
                </Button>
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleVideoSelect} 
                  accept="video/*,image/*" // For demo purposes, accept images too
                />
              </div>
            </TabsContent>
            
            <TabsContent value="camera" className="flex-1 m-0 data-[state=active]:mt-0">
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-4">
                  <Camera size={30} className="text-[#FE2C55]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Record a video</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Create and edit clips right in the app
                </p>
                <Button className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white">
                  Record
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-col lg:flex-row h-full">
            {/* Video Preview */}
            <div className="lg:w-1/2 p-4 flex items-center justify-center">
              <div className="aspect-[9/16] max-h-[70vh] bg-black rounded-md overflow-hidden">
                {isLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-[#FE2C55] border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <img 
                    src={selectedVideo} 
                    alt="Video preview" 
                    className="h-full w-full object-contain"
                  />
                )}
              </div>
            </div>
            
            {/* Details Form */}
            <div className="lg:w-1/2 p-4 overflow-y-auto">
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <div className="font-semibold">Caption</div>
                  <div className="ml-auto text-xs text-gray-500">
                    {videoCaption.length}/150
                  </div>
                </div>
                <Textarea
                  placeholder="Add a caption..."
                  value={videoCaption}
                  onChange={e => setVideoCaption(e.target.value)}
                  rows={3}
                  maxLength={150}
                  className="w-full resize-none"
                />
              </div>
              
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <div className="font-semibold">Cover</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div 
                      key={index} 
                      className={`aspect-[9/16] rounded-md overflow-hidden border-2 ${index === 0 ? 'border-[#FE2C55]' : 'border-transparent'}`}
                    >
                      <img 
                        src={selectedVideo} 
                        alt={`Cover option ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-2">
                <div className="font-semibold mb-2">Music</div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-md">
                  <div className="flex items-center p-3">
                    <div className="h-10 w-10 bg-[#FE2C55] rounded-full flex items-center justify-center mr-3">
                      <Music size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Add sound</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="p-2 max-h-40 overflow-y-auto">
                  {trendingSounds.map(sound => (
                    <div 
                      key={sound.id}
                      className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer"
                    >
                      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mr-3">
                        <Music size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{sound.name}</p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <span className="truncate">{sound.creator}</span>
                          <span className="mx-1">•</span>
                          <span>{sound.uses}</span>
                        </p>
                      </div>
                      <button className="ml-2 text-[#FE2C55]">
                        <Play size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="font-medium">Who can view this video</div>
                  <div className="text-sm">Public</div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="font-medium">Allow comments</div>
                  <div className="h-5 w-9 bg-[#FE2C55] rounded-full relative">
                    <div className="absolute right-0.5 top-0.5 h-4 w-4 bg-white rounded-full"></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="font-medium">Allow Duet and Stitches</div>
                  <div className="h-5 w-9 bg-[#FE2C55] rounded-full relative">
                    <div className="absolute right-0.5 top-0.5 h-4 w-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Discover Component
const DiscoverPage: React.FC = () => {
  const categories = [
    { id: '1', name: 'Rap', icon: <Mic /> },
    { id: '2', name: 'Trending', icon: <TrendingUp /> },
    { id: '3', name: 'New Artists', icon: <User /> },
    { id: '4', name: 'Beats', icon: <Music /> },
    { id: '5', name: 'Studio', icon: <FileText /> },
    { id: '6', name: 'Music', icon: <Music /> },
    { id: '7', name: 'Hip Hop', icon: <Hash /> },
    { id: '8', name: 'Lyrics', icon: <FileText /> },
  ];
  
  const trendingHashtags = [
    { name: '#rapgame', count: '2.5B views' },
    { name: '#newmusic', count: '4.2B views' },
    { name: '#hiphop', count: '8.7B views' },
    { name: '#producer', count: '1.3B views' },
    { name: '#recordingstudio', count: '756M views' },
    { name: '#lyrics', count: '3.1B views' },
    { name: '#rapbattle', count: '890M views' },
    { name: '#musicproducer', count: '1.7B views' },
  ];
  
  return (
    <div className="flex-1 bg-white dark:bg-black overflow-y-auto">
      <div className="p-4">
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-500" />
          </div>
          <Input 
            placeholder="Search" 
            className="pl-10 bg-gray-100 dark:bg-gray-900 border-0 rounded-full"
          />
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Discover</h3>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {categories.map(category => (
              <div 
                key={category.id}
                className="rounded-lg bg-gray-100 dark:bg-gray-900 aspect-square flex flex-col items-center justify-center p-2"
              >
                <div className="h-8 w-8 rounded-full bg-[#FE2C55] text-white flex items-center justify-center mb-2">
                  {category.icon}
                </div>
                <span className="text-xs text-center">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Trending Hashtags</h3>
            <button className="text-[#FE2C55] text-sm">See all</button>
          </div>
          <div className="space-y-3">
            {trendingHashtags.map((tag, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-900 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#FE2C55] to-[#25F4EE] flex items-center justify-center mr-3">
                    <Hash size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="font-medium">{tag.name}</div>
                    <div className="text-xs text-gray-500">{tag.count}</div>
                  </div>
                </div>
                <button className="text-[#FE2C55]">
                  <Play size={20} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Inbox Component
const InboxPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  const notifications = [
    { 
      id: '1', 
      type: 'like', 
      user: 'musicfan22', 
      avatar: '/assets/profiles/profile1.svg',
      content: 'liked your video',
      time: '15m ago'
    },
    { 
      id: '2', 
      type: 'follow', 
      user: 'producer_beats', 
      avatar: '/assets/profiles/profile2.svg',
      content: 'started following you',
      time: '2h ago'
    },
    { 
      id: '3', 
      type: 'comment', 
      user: 'rapper101', 
      avatar: '/assets/profiles/profile3.svg',
      content: 'commented: "Fire lyrics 🔥"',
      time: '1d ago'
    },
    { 
      id: '4', 
      type: 'mention', 
      user: 'hiphop_daily', 
      avatar: '/assets/profiles/profile4.svg',
      content: 'mentioned you in a comment',
      time: '2d ago'
    },
    { 
      id: '5', 
      type: 'like', 
      user: 'beatmaker', 
      avatar: '/assets/profiles/profile5.svg',
      content: 'liked your video',
      time: '3d ago'
    },
  ];
  
  const notificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart size={16} className="text-[#FE2C55]" />;
      case 'follow':
        return <User size={16} className="text-[#25F4EE]" />;
      case 'comment':
        return <MessageCircle size={16} className="text-[#FE2C55]" />;
      case 'mention':
        return <Hash size={16} className="text-[#25F4EE]" />;
      default:
        return <BellPlus size={16} className="text-[#FE2C55]" />;
    }
  };
  
  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === activeTab);
  
  return (
    <div className="flex-1 bg-white dark:bg-black overflow-hidden flex flex-col">
      <div className="p-3 border-b border-gray-200 dark:border-gray-800">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 bg-gray-100 dark:bg-gray-900 p-1 rounded-full h-auto">
            <TabsTrigger 
              value="all" 
              className="rounded-full h-8 text-xs data-[state=active]:bg-[#FE2C55] data-[state=active]:text-white"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="like" 
              className="rounded-full h-8 text-xs data-[state=active]:bg-[#FE2C55] data-[state=active]:text-white"
            >
              Likes
            </TabsTrigger>
            <TabsTrigger 
              value="comment" 
              className="rounded-full h-8 text-xs data-[state=active]:bg-[#FE2C55] data-[state=active]:text-white"
            >
              Comments
            </TabsTrigger>
            <TabsTrigger 
              value="follow" 
              className="rounded-full h-8 text-xs data-[state=active]:bg-[#FE2C55] data-[state=active]:text-white"
            >
              Followers
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id}
              className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800"
            >
              <Avatar className="h-12 w-12 mr-3">
                <AvatarImage src={notification.avatar} alt={notification.user} />
                <AvatarFallback>{notification.user.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="font-semibold text-sm mr-1">
                    {notification.user}
                  </div>
                  <div className="text-xs text-gray-500">
                    {notification.time}
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <div className="mr-1">{notification.content}</div>
                  <div>{notificationIcon(notification.type)}</div>
                </div>
              </div>
              
              <div className="w-12 h-16 bg-gray-100 dark:bg-gray-900 rounded-md overflow-hidden">
                <div className="h-full w-full bg-gradient-to-br from-[#FE2C55] to-[#25F4EE]"></div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center mb-4">
              <Bell size={24} className="text-gray-400" />
            </div>
            <h3 className="font-semibold mb-2">No notifications yet</h3>
            <p className="text-sm text-gray-500">
              When you get notifications, they'll show up here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Profile Component
const ProfilePage: React.FC<{ character: any; posts: SocialMediaPost[] }> = ({ character, posts }) => {
  const [activeTab, setActiveTab] = useState('videos');
  
  const stats = {
    followers: 10500,
    following: 350,
    likes: 45600,
  };
  
  return (
    <div className="flex-1 bg-white dark:bg-black overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button>
            <KeyRound size={20} />
          </button>
          <div className="font-semibold">
            {character?.artistName || "Username"}
          </div>
          <button>
            <Settings size={20} />
          </button>
        </div>
        
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-24 w-24 mb-3">
            <AvatarImage src={character?.image} alt={character?.artistName} className="object-cover" />
            <AvatarFallback>{(character?.artistName || "User").charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-lg font-bold mb-1">@{character?.artistName?.toLowerCase().replace(/\s+/g, '') || "username"}</div>
          <div className="grid grid-cols-3 w-full max-w-sm mt-3">
            <div className="flex flex-col items-center">
              <div className="font-semibold">{formatNumber(posts.length)}</div>
              <div className="text-xs text-gray-500">Videos</div>
            </div>
            <div className="flex flex-col items-center border-x border-gray-200 dark:border-gray-800">
              <div className="font-semibold">{formatNumber(stats.followers)}</div>
              <div className="text-xs text-gray-500">Followers</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="font-semibold">{formatNumber(stats.likes)}</div>
              <div className="text-xs text-gray-500">Likes</div>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-4">
            <Button className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white px-6">
              Edit profile
            </Button>
            <Button variant="outline" className="border-gray-300 dark:border-gray-700">
              <Share2 size={18} />
            </Button>
          </div>
          
          <div className="w-full mt-4">
            <div className="text-center text-sm mb-2">
              {character?.artistName} • Rapper 🎤 • Producer 🎧
            </div>
            <div className="text-center text-sm">
              New album dropping soon! 🔥
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-800">
        <Tabs defaultValue="videos" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full bg-transparent p-0 h-auto">
            <TabsTrigger 
              value="videos" 
              className="py-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white"
            >
              <Video size={18} />
            </TabsTrigger>
            <TabsTrigger 
              value="liked" 
              className="py-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white"
            >
              <Heart size={18} />
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="videos" className="m-0 data-[state=active]:mt-0">
            {posts.length > 0 ? (
              <div className="grid grid-cols-3 gap-[1px]">
                {posts.map((post, index) => (
                  <div key={post.id || index} className="aspect-[9/16] bg-gray-100 dark:bg-gray-900 overflow-hidden">
                    {post.image ? (
                      <img 
                        src={post.image} 
                        alt={`Post ${index}`} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-[#FE2C55] to-[#25F4EE] flex items-center justify-center p-1">
                        <p className="text-white text-[8px] font-medium text-center truncate">{post.content}</p>
                      </div>
                    )}
                    <div className="absolute bottom-1 left-1">
                      <div className="flex items-center text-white text-xs">
                        <Play size={12} fill="white" className="mr-0.5" />
                        <span>{formatNumber(post.views || Math.floor(Math.random() * 5000) + 1000)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center mx-auto mb-4">
                  <Video size={24} className="text-gray-400" />
                </div>
                <h3 className="font-semibold mb-2">No videos yet</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Your videos will appear here
                </p>
                <Button className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white px-6">
                  Upload a video
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="liked" className="m-0 data-[state=active]:mt-0">
            <div className="p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center mx-auto mb-4">
                <Lock size={24} className="text-gray-400" />
              </div>
              <h3 className="font-semibold mb-2">Your liked videos are private</h3>
              <p className="text-sm text-gray-500 mb-4">
                Videos you've liked will appear here
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Main TikTok Panel Component
interface TikTokPanelProps {
  onBack?: () => void;
}

const TikTokPanel: React.FC<TikTokPanelProps> = ({ onBack }) => {
  const { character, postOnSocialMedia, socialMedia, socialMediaStats, aiRappers, currentWeek } = useRapperGame();
  const [tiktokPosts, setTiktokPosts] = useState<SocialMediaPost[]>([]);
  const [isCreateVideoOpen, setIsCreateVideoOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [feedType, setFeedType] = useState<'foryou' | 'following'>('foryou');
  
  // Get TikTok data from store
  useEffect(() => {
    // Try to get posts from socialMediaStats first (new structure)
    const tiktokPlatform = socialMedia.find(p => p.name === "TikTok");
    
    if (socialMediaStats?.tiktok?.videos) {
      setTiktokPosts(socialMediaStats.tiktok.videos);
    } else {
      // Fallback to looking at viralPosts in old structure
      if (tiktokPlatform?.viralPosts) {
        setTiktokPosts(tiktokPlatform.viralPosts);
      } else {
        // If no posts found, use empty array
        setTiktokPosts([]);
      }
    }
    
    // If there are few or no posts, generate AI content
    if ((!socialMediaStats?.tiktok?.videos || socialMediaStats?.tiktok?.videos.length < 3) && 
        (!tiktokPlatform?.viralPosts || tiktokPlatform?.viralPosts.length < 3)) {
      generateAIContent();
    }
  }, [socialMedia, socialMediaStats]);
  
  // Generate AI-based content for TikTok videos
  const generateAIContent = () => {
    // Only generate if we have AI rappers data
    if (!aiRappers || aiRappers.length === 0) return;
    
    // Select a few random AI rappers
    const selectedRappers = aiRappers
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
      
    // Create placeholders for videos (using images with play icon as a visual placeholder)
    const placeholderVideos = [
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80"
    ];
      
    // Generate placeholder posts for them
    const aiGeneratedPosts: SocialMediaPost[] = selectedRappers.map((rapper, index) => {
      // Content topics based on rapper's style
      const topics = [
        `Watch till the end 🔥 #${rapper.style.replace(/\s+/g, '')} #FYP`,
        `POV: When the beat drops 👀 #ViralSounds #Music`,
        `How I write my lyrics 🎵 #BehindTheScenes #RapLife`,
        `Rate this flow 1-10 💯 #NewMusic #TrendingSounds`,
        `Studio session with @${character?.artistName?.toLowerCase().replace(/\s+/g, '')} 🎤 #Collab`,
        `Dance tutorial to my latest track #DanceChallenge`,
        `Showing my fans love 🙏 #FanLove #Grateful`
      ];
      
      // Pick a random content topic
      const randomContent = topics[Math.floor(Math.random() * topics.length)];
      const randomVideo = placeholderVideos[Math.floor(Math.random() * placeholderVideos.length)];
      
      return {
        id: `ai-${rapper.id}-${Date.now()}-${index}`,
        platformName: "TikTok",
        content: randomContent,
        postWeek: Math.max(1, currentWeek - Math.floor(Math.random() * 3)),
        video: randomVideo,
        thumbnail: randomVideo,
        likes: Math.floor(rapper.popularity * 500 + Math.random() * 5000),
        comments: Math.floor(rapper.popularity * 50 + Math.random() * 300),
        shares: Math.floor(rapper.popularity * 100 + Math.random() * 500),
        bookmarks: Math.floor(rapper.popularity * 30 + Math.random() * 200),
        viralStatus: "not_viral",
        viralMultiplier: 1,
        followerGain: 0,
        reputationGain: 0,
        wealthGain: 0,
        username: rapper.name,
        handle: rapper.name.toLowerCase().replace(/\s+/g, ''),
        avatar: rapper.image,
        verified: rapper.popularity > 60,
        musicTitle: `Original Sound - ${rapper.name}`,
        duration: 15 + Math.floor(Math.random() * 45)
      };
    });
    
    // Add these to the current posts
    setTiktokPosts(prevVideos => [...aiGeneratedPosts, ...prevVideos]);
  };

  // Handle post creation
  const handlePost = (content: string, video?: string) => {
    // Use the store's postOnSocialMedia method to post to TikTok
    postOnSocialMedia("TikTok", content, video ? [video] : undefined);
    setIsCreateVideoOpen(false);
  };

  // Go back to dashboard or social media hub
  const handleBackToDashboard = () => {
    if (onBack) {
      // Use the provided onBack function if available
      onBack();
    } else {
      // Navigate to social media hub instead of career dashboard
      useRapperGame.setState({ screen: 'social_media_hub' });
    }
  };
  
  // Render appropriate header based on active tab
  const renderHeader = () => {
    if (activeTab === 'home') {
      return (
        <div className="flex items-center justify-center p-3 bg-black text-white z-10">
          <button 
            className={`px-4 py-1 ${feedType === 'following' ? 'font-medium text-white' : 'text-gray-400'}`}
            onClick={() => setFeedType('following')}
          >
            Following
          </button>
          <button 
            className={`px-4 py-1 ${feedType === 'foryou' ? 'font-medium text-white' : 'text-gray-400'}`}
            onClick={() => setFeedType('foryou')}
          >
            For You
          </button>
          <button 
            className="absolute left-2 text-white p-2 rounded-full flex items-center gap-1 bg-black/30 hover:bg-black/50"
            onClick={handleBackToDashboard}
          >
            <ArrowLeft size={18} className="text-white" />
            <span className="text-sm font-medium hidden sm:inline">Back to Dashboard</span>
          </button>
          <button className="absolute right-2 text-white p-2 rounded-full">
            <Search size={20} />
          </button>
        </div>
      );
    } else if (activeTab === 'discover') {
      return (
        <div className="p-3 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 flex items-center">
          <div className="text-lg font-semibold text-center w-full">Discover</div>
        </div>
      );
    } else if (activeTab === 'inbox') {
      return (
        <div className="p-3 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 flex items-center">
          <div className="text-lg font-semibold text-center w-full">Inbox</div>
          <button className="absolute right-2 p-2">
            <Settings size={20} />
          </button>
        </div>
      );
    } else if (activeTab === 'profile') {
      return (
        <div className="p-3 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 flex items-center">
          <div className="text-lg font-semibold text-center w-full">Profile</div>
          <button className="absolute right-2 p-2">
            <MoreVertical size={20} />
          </button>
        </div>
      );
    }
    return null;
  };
  
  // Render content based on active tab
  const renderContent = () => {
    if (activeTab === 'home') {
      return <TikTokFeed posts={tiktokPosts} character={character} feedType={feedType} />;
    } else if (activeTab === 'discover') {
      return <DiscoverPage />;
    } else if (activeTab === 'inbox') {
      return <InboxPage />;
    } else if (activeTab === 'profile') {
      return <ProfilePage character={character} posts={tiktokPosts} />;
    }
    return null;
  };

  return (
    <div className="h-full w-full flex flex-col bg-black">
      {/* Header */}
      {renderHeader()}
      
      {/* Main Content */}
      {renderContent()}
      
      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-2 flex justify-between items-center">
        <button 
          className={`flex flex-col items-center justify-center px-3 ${activeTab === 'home' ? 'text-black dark:text-white' : 'text-gray-500'}`}
          onClick={() => setActiveTab('home')}
        >
          <Home className={`h-6 w-6 ${activeTab === 'home' ? 'fill-current' : ''}`} />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>
        
        <button 
          className={`flex flex-col items-center justify-center px-3 ${activeTab === 'discover' ? 'text-black dark:text-white' : 'text-gray-500'}`}
          onClick={() => setActiveTab('discover')}
        >
          <Search className="h-6 w-6" />
          <span className="text-[10px] mt-0.5">Discover</span>
        </button>
        
        <button 
          className="rounded-md -mt-5 relative"
          onClick={() => setIsCreateVideoOpen(true)}
        >
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Plus className="h-6 w-6 text-black" />
          </div>
          <div className="w-12 h-6 bg-[#25F4EE]"></div>
          <div className="w-12 h-6 bg-[#FE2C55] -mt-2 ml-1"></div>
        </button>
        
        <button 
          className={`flex flex-col items-center justify-center px-3 ${activeTab === 'inbox' ? 'text-black dark:text-white' : 'text-gray-500'}`}
          onClick={() => setActiveTab('inbox')}
        >
          <Inbox className="h-6 w-6" />
          <span className="text-[10px] mt-0.5">Inbox</span>
        </button>
        
        <button 
          className={`flex flex-col items-center justify-center px-3 ${activeTab === 'profile' ? 'text-black dark:text-white' : 'text-gray-500'}`}
          onClick={() => setActiveTab('profile')}
        >
          <User className="h-6 w-6" />
          <span className="text-[10px] mt-0.5">Profile</span>
        </button>
      </div>
      
      {/* Create Video Dialog */}
      <Dialog open={isCreateVideoOpen} onOpenChange={setIsCreateVideoOpen}>
        <DialogContent className="p-0 max-w-3xl h-[90vh]">
          <CreateVideoDialog 
            onPost={handlePost} 
            character={character} 
            onClose={() => setIsCreateVideoOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Add animation classes to tailwind
const style = document.createElement('style');
style.textContent = `
  @keyframes marquee {
    0% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(-50%);
    }
  }
  
  .animate-marquee {
    animation: marquee 10s linear infinite;
  }
  
  @keyframes spin-slow {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  
  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
  
  @keyframes pop {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }
  
  .animate-pop {
    animation: pop 0.3s ease-in-out;
  }
`;
document.head.appendChild(style);

export default TikTokPanel;