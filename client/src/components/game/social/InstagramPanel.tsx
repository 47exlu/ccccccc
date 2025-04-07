import React, { useState, useEffect, useRef } from "react";
import { useRapperGame } from "@/lib/stores/useRapperGame";
import { SocialMediaPost } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { 
  SocialMediaHeader, 
  SocialMediaFooter, 
  SocialMediaLayout,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  Home, 
  Search, 
  Film, 
  ShoppingBag, 
  User,
  Plus, 
  MoreHorizontal, 
  Image as ImageIcon,
  Grid,
  Compass,
  MessageSquare,
  Square,
  X,
  Smile,
  Maximize,
  Loader,
  Music,
  Settings,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Instagram Post Component with realistic styling
interface InstagramPostProps {
  post: SocialMediaPost;
  character: any;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  onSave: (id: string) => void;
}

const InstagramPost: React.FC<InstagramPostProps> = ({ 
  post, 
  character, 
  onLike, 
  onComment, 
  onShare, 
  onSave 
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDoubleTapLiked, setIsDoubleTapLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isCommentFocused, setIsCommentFocused] = useState(false);
  const likeRef = useRef<HTMLDivElement>(null);
  const doubleClickTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastClickTime = useRef<number>(0);
  
  const handleLike = () => {
    if (!isLiked) {
      setLikesCount(prev => prev + 1);
    } else {
      setLikesCount(prev => prev - 1);
    }
    setIsLiked(!isLiked);
    onLike(post.id);
  };
  
  const handleDoubleTap = () => {
    // Check if it's a double tap
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime.current;
    
    if (timeDiff < 300) { // 300ms threshold for double tap
      clearTimeout(doubleClickTimeout.current!);
      doubleClickTimeout.current = null;
      
      // Show heart animation
      if (!isLiked) {
        setShowHeartAnimation(true);
        setTimeout(() => setShowHeartAnimation(false), 1000);
        
        // Like the post if not already liked
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        onLike(post.id);
      }
    } else {
      doubleClickTimeout.current = setTimeout(() => {
        // Single tap logic if needed
      }, 300);
    }
    
    lastClickTime.current = currentTime;
  };
  
  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave(post.id);
  };
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(post.id);
      setCommentText("");
    }
  };
  
  // Generate avatar and username from post or use character info
  const userName = post.username || character?.artistName || "User";
  const userHandle = post.handle || userName.toLowerCase().replace(/\s+/g, '');
  const avatarUrl = post.avatar || character?.image;
  const verified = post.verified !== undefined ? post.verified : true;
  
  // Format date in Instagram style
  const formatDate = (date?: Date | string): string => {
    if (!date) return "";
    // Instagram shows dates like "2d" or "4w" instead of "2 days ago"
    const now = new Date();
    const postDate = typeof date === 'string' ? new Date(date) : date;
    const diffMs = now.getTime() - postDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return "TODAY";
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}m`;
    return `${Math.floor(diffDays / 365)}y`;
  };

  return (
    <div className="border-b border-gray-100 dark:border-gray-900 pb-3 mb-4">
      {/* Post header */}
      <div className="flex items-center p-3">
        <div className="flex-shrink-0">
          <div className="p-0.5 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
            <div className="bg-white dark:bg-black p-[2px] rounded-full">
              <Avatar className="h-8 w-8 rounded-full border-none">
                <AvatarImage src={avatarUrl} alt={userName} className="object-cover" />
                <AvatarFallback className="text-xs bg-gray-200">{userName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
        
        <div className="flex-1 ml-3">
          <div className="flex items-center">
            <span className="font-semibold text-sm text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
              {userName}
            </span>
            {verified && (
              <Badge className="ml-1 bg-blue-500 text-white border-0 h-4 w-4 p-0 flex items-center justify-center rounded-full">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="white"/>
                </svg>
              </Badge>
            )}
          </div>
        </div>
        
        <button className="text-black dark:text-white p-1">
          <MoreHorizontal size={20} strokeWidth={1.5} />
        </button>
      </div>
      
      {/* Post image (with double tap functionality) */}
      <div 
        className="relative select-none"
        onClick={handleDoubleTap}
        ref={likeRef}
      >
        {post.image ? (
          <div className="relative aspect-square bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
            <img 
              src={post.image} 
              alt={`Post by ${userName}`} 
              className="w-full h-full object-cover" 
              draggable="false"
            />
            
            {/* Heart animation on double tap */}
            {showHeartAnimation && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-scale-up">
                <Heart className="h-24 w-24 text-white filter drop-shadow-lg" fill="white" />
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-6">
            <p className="text-white font-medium whitespace-pre-wrap text-center text-lg">{post.content}</p>
            
            {/* Heart animation on double tap */}
            {showHeartAnimation && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-scale-up">
                <Heart className="h-24 w-24 text-white filter drop-shadow-lg" fill="white" />
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Post actions */}
      <div className="px-4 pt-2">
        <div className="flex justify-between mb-2">
          <div className="flex space-x-4">
            <button 
              className={`${isLiked ? 'text-red-500' : 'text-black dark:text-white'} p-1 -ml-1`}
              onClick={handleLike}
            >
              <Heart size={26} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={1.8} />
            </button>
            <button 
              className="text-black dark:text-white p-1"
              onClick={() => onComment(post.id)}
            >
              <MessageCircle size={26} strokeWidth={1.8} />
            </button>
            <button 
              className="text-black dark:text-white p-1"
              onClick={() => onShare(post.id)}
            >
              <Send size={26} strokeWidth={1.8} />
            </button>
          </div>
          <button 
            className={`${isSaved ? 'text-black dark:text-white' : 'text-black dark:text-white'} p-1`}
            onClick={handleSave}
          >
            <Bookmark size={26} fill={isSaved ? 'currentColor' : 'none'} strokeWidth={1.8} />
          </button>
        </div>
        
        {/* Likes */}
        <div className="text-sm font-semibold text-black dark:text-white mb-1">{formatNumber(likesCount)} likes</div>
        
        {/* Caption */}
        <div className="text-sm text-black dark:text-white mb-1">
          <span className="font-semibold mr-1">{userName}</span>
          <span className="inline text-black dark:text-white">{post.content}</span>
        </div>
        
        {/* Comments link */}
        {post.comments > 0 && (
          <button className="text-gray-500 dark:text-gray-400 text-sm mb-1">
            View all {formatNumber(post.comments)} comments
          </button>
        )}
        
        {/* Timestamp */}
        <div className="text-gray-400 dark:text-gray-500 text-[10px] uppercase font-medium tracking-wide mt-1 mb-2">
          {post.date ? formatDate(post.date instanceof Date ? post.date : new Date(post.date)) : 'JUST NOW'}
        </div>
        
        {/* Add comment section */}
        <div className={`flex items-center border-t border-gray-100 dark:border-gray-900 pt-3 ${isCommentFocused ? 'pb-3' : ''}`}>
          <form className="flex w-full items-center" onSubmit={handleCommentSubmit}>
            <Smile size={24} className="mr-2 text-black dark:text-white" />
            <input 
              type="text" 
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onFocus={() => setIsCommentFocused(true)}
              onBlur={() => setIsCommentFocused(false)}
              className="text-sm text-black dark:text-white bg-transparent border-none flex-1 focus:ring-0 placeholder-gray-500 dark:placeholder-gray-400"
            />
            {commentText.trim() && (
              <button 
                type="submit"
                className="text-blue-500 font-semibold text-sm"
              >
                Post
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

// Story Circle Component with Instagram-style animations
interface StoryCircleProps {
  story: {
    id: string;
    username: string;
    avatar: string;
    viewed: boolean;
  };
  onClick?: () => void;
  isActive?: boolean;
}

const StoryCircle: React.FC<StoryCircleProps> = ({ story, onClick, isActive }) => {
  const gradientBorder = !story.viewed 
    ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' 
    : 'bg-gray-300 dark:bg-gray-700';
    
  return (
    <div 
      className={`flex flex-col items-center mr-3 ${isActive ? 'opacity-100' : 'opacity-90'} cursor-pointer`} 
      onClick={onClick}
    >
      <div className={`${gradientBorder} p-[2px] rounded-full ${!story.viewed ? 'animate-pulse-slow' : ''}`}>
        <div className="bg-white dark:bg-black p-[2px] rounded-full">
          <Avatar className="h-16 w-16 border-none rounded-full">
            <AvatarImage src={story.avatar} alt={story.username} className="object-cover" />
            <AvatarFallback className="bg-gray-200 text-gray-700">{story.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <span className="text-xs mt-1 truncate w-16 text-center text-black dark:text-white">
        {story.username}
      </span>
    </div>
  );
};

// Story Viewer Component
interface StoryViewerProps {
  stories: Array<{
    id: string;
    username: string;
    avatar: string;
    viewed: boolean;
  }>;
  onClose: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ stories, onClose }) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const currentStory = stories[currentStoryIndex];
  
  useEffect(() => {
    // Reset progress when story changes
    setProgress(0);
    
    // Advance progress automatically
    const interval = setInterval(() => {
      if (!isPaused) {
        setProgress(prev => {
          if (prev >= 100) {
            // Move to next story when progress reaches 100%
            if (currentStoryIndex < stories.length - 1) {
              setCurrentStoryIndex(prev => prev + 1);
              return 0;
            } else {
              clearInterval(interval);
              onClose();
              return prev;
            }
          }
          return prev + 1;
        });
      }
    }, 50); // 5000ms total for one story
    
    return () => clearInterval(interval);
  }, [currentStoryIndex, isPaused, stories.length, onClose]);
  
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };
  
  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onClick={onClose}
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="absolute top-0 left-0 right-0 p-2 z-10 flex items-center">
        <div className="flex-1 flex space-x-1">
          {stories.map((_, index) => (
            <div key={index} className="h-0.5 bg-gray-500/40 rounded-full flex-1 overflow-hidden">
              {index === currentStoryIndex && (
                <div 
                  className="h-full bg-white" 
                  style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
                ></div>
              )}
              {index < currentStoryIndex && (
                <div className="h-full bg-white w-full"></div>
              )}
            </div>
          ))}
        </div>
        
        <button 
          className="ml-4 text-white p-2"
          onClick={onClose}
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="absolute top-16 left-0 right-0 p-4 z-10 flex items-center">
        <Avatar className="h-10 w-10 mr-3 border-2 border-white/20">
          <AvatarImage src={currentStory.avatar} alt={currentStory.username} />
          <AvatarFallback>{currentStory.username.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="text-white font-medium">{currentStory.username}</span>
        <span className="text-white/60 text-sm ml-2">12h</span>
      </div>
      
      {/* Story content (placeholder) */}
      <div className="relative w-full h-full max-w-lg mx-auto">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <div className="p-8 text-center">
              <p className="text-white text-xl font-medium mb-4">
                {currentStory.username}'s Story
              </p>
              <div className="text-white/80">
                Check out my latest music drop! 🎵
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Left/Right navigation areas */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1/3" 
        onClick={(e) => handlePrevious(e)}
      ></div>
      <div 
        className="absolute right-0 top-0 bottom-0 w-1/3" 
        onClick={(e) => handleNext(e)}
      ></div>
      
      {/* Optional UI controls */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center">
        <input 
          type="text" 
          placeholder="Send message"
          className="bg-white/10 text-white border-0 rounded-full px-5 py-3 w-[80%] max-w-lg focus:ring-0 placeholder-white/60"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

// Create Post Dialog Component with Instagram-style
interface CreatePostDialogProps {
  onPost: (content: string, image?: string) => void;
  character: any;
  onClose: () => void;
}

const CreatePostDialog: React.FC<CreatePostDialogProps> = ({ onPost, character, onClose }) => {
  const [stage, setStage] = useState<'select' | 'edit' | 'filters'>('select');
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setTimeout(() => {
            setSelectedImage(event.target?.result as string);
            setStage('edit');
            setIsUploading(false);
          }, 1500); // Simulate upload time
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handleSubmit = () => {
    if (selectedImage) {
      onPost(postContent, selectedImage);
      setPostContent('');
      setSelectedImage(null);
      setStage('select');
      onClose();
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        {stage === 'select' ? (
          <>
            <button onClick={onClose} className="text-black dark:text-white">
              <X size={24} />
            </button>
            <h2 className="text-center font-semibold text-lg">New Post</h2>
            <div className="w-6"></div> {/* Spacer for alignment */}
          </>
        ) : (
          <>
            <button onClick={() => setStage('select')} className="text-black dark:text-white">
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-center font-semibold text-lg">
              {stage === 'edit' ? 'Edit' : 'Filters'}
            </h2>
            <button 
              onClick={() => stage === 'edit' ? setStage('filters') : handleSubmit()}
              className="text-blue-500 font-semibold"
            >
              {stage === 'edit' ? 'Next' : 'Share'}
            </button>
          </>
        )}
      </div>
      
      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        {stage === 'select' && (
          <div className="flex flex-col h-full">
            {isUploading ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <Loader className="h-10 w-10 text-gray-400 animate-spin mb-3" />
                <p className="text-gray-500">Uploading...</p>
              </div>
            ) : (
              <div 
                className="flex-1 flex flex-col items-center justify-center p-8"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-full p-6 mb-4">
                  <ImageIcon className="h-10 w-10 text-blue-500" />
                </div>
                <p className="text-xl font-light text-gray-900 dark:text-gray-100 mb-2">
                  Drag photos and videos here
                </p>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                  Select from device
                </Button>
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImageSelect} 
                  accept="image/*" 
                />
              </div>
            )}
          </div>
        )}
        
        {stage === 'edit' && selectedImage && (
          <div className="flex flex-col">
            <div className="aspect-square w-full bg-black flex items-center justify-center">
              <img 
                src={selectedImage} 
                alt="Selected media" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            
            <div className="p-4">
              <div className="flex items-center mb-4">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={character?.image} alt={character?.artistName} />
                  <AvatarFallback>{character?.artistName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-black dark:text-white">{character?.artistName}</span>
              </div>
              
              <Textarea
                placeholder="Write a caption..."
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
                className="w-full resize-none border-0 p-0 text-black dark:text-white bg-transparent focus:ring-0 placeholder-gray-500 text-sm"
                rows={4}
              />
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-800 p-4">
              <div className="flex justify-between items-center text-sm mb-4">
                <span className="text-black dark:text-white">Tag People</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex justify-between items-center text-sm mb-4">
                <span className="text-black dark:text-white">Add Location</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-black dark:text-white">Advanced Settings</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        )}
        
        {stage === 'filters' && selectedImage && (
          <div className="flex flex-col">
            <div className="aspect-square w-full bg-black flex items-center justify-center">
              <img 
                src={selectedImage} 
                alt="Selected media" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            
            <div className="p-4 grid grid-cols-4 gap-4">
              <div className="flex flex-col items-center cursor-pointer">
                <div className="h-16 w-16 rounded-md overflow-hidden mb-1 bg-gray-100 border-2 border-blue-500">
                  <img src={selectedImage} alt="Original" className="h-full w-full object-cover" />
                </div>
                <span className="text-xs text-black dark:text-white">Original</span>
              </div>
              <div className="flex flex-col items-center cursor-pointer">
                <div className="h-16 w-16 rounded-md overflow-hidden mb-1 bg-gray-100">
                  <img src={selectedImage} alt="Clarendon" className="h-full w-full object-cover brightness-110 contrast-110" />
                </div>
                <span className="text-xs text-gray-500">Clarendon</span>
              </div>
              <div className="flex flex-col items-center cursor-pointer">
                <div className="h-16 w-16 rounded-md overflow-hidden mb-1 bg-gray-100">
                  <img src={selectedImage} alt="Gingham" className="h-full w-full object-cover brightness-125 saturate-50" />
                </div>
                <span className="text-xs text-gray-500">Gingham</span>
              </div>
              <div className="flex flex-col items-center cursor-pointer">
                <div className="h-16 w-16 rounded-md overflow-hidden mb-1 bg-gray-100">
                  <img src={selectedImage} alt="Moon" className="h-full w-full object-cover grayscale brightness-90" />
                </div>
                <span className="text-xs text-gray-500">Moon</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Explore Grid Component
const ExploreGrid: React.FC<{ posts: SocialMediaPost[] }> = ({ posts }) => {
  return (
    <div className="grid grid-cols-3 gap-[2px]">
      {posts.map((post, index) => (
        <div key={post.id || index} className="aspect-square bg-gray-100 dark:bg-gray-900 overflow-hidden">
          {post.image ? (
            <img 
              src={post.image} 
              alt={`Post ${index}`} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-2">
              <p className="text-white text-xs font-medium text-center truncate">{post.content}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Suggested Users Component
const SuggestedUsers: React.FC<{ users: any[]; onFollow: (id: string) => void }> = ({ users, onFollow }) => {
  return (
    <div className="px-4 pb-3">
      <div className="flex justify-between items-center mb-3">
        <span className="text-gray-500 font-semibold text-sm">Suggested for you</span>
        <button className="text-black dark:text-white text-xs font-semibold">See All</button>
      </div>
      
      <div className="flex space-x-3 overflow-x-auto pb-2">
        {users.map((user, index) => (
          <div key={user.id || index} className="flex flex-col items-center min-w-[135px] border border-gray-200 dark:border-gray-800 rounded-lg p-3">
            <Avatar className="h-16 w-16 mb-2">
              <AvatarImage src={user.image || user.avatar} alt={user.name} className="object-cover" />
              <AvatarFallback>{(user.name || "User").charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-black dark:text-white truncate max-w-full">{user.name}</span>
            <span className="text-xs text-gray-500 mb-2">Suggested for you</span>
            <Button 
              className="w-full text-xs h-8 bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => onFollow(user.id)}
            >
              Follow
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Reels Component
const ReelsView: React.FC<{ posts: SocialMediaPost[]; character: any }> = ({ posts, character }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const handleScroll = (e: React.WheelEvent) => {
    if (e.deltaY > 0 && activeIndex < posts.length - 1) {
      setActiveIndex(prev => prev + 1);
    } else if (e.deltaY < 0 && activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
    }
  };
  
  return (
    <div 
      className="h-full w-full flex flex-col overflow-hidden"
      onWheel={handleScroll}
    >
      {posts.length > 0 ? (
        <div className="flex-1 relative overflow-hidden">
          {posts.map((post, index) => (
            <div 
              key={post.id || index}
              className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                index === activeIndex ? 'translate-y-0 opacity-100' : 
                index < activeIndex ? '-translate-y-full opacity-0' : 'translate-y-full opacity-0'
              }`}
            >
              <div className="h-full w-full relative">
                {post.image ? (
                  <img 
                    src={post.image} 
                    alt={`Reel by ${post.username || character?.artistName}`}
                    className="h-full w-full object-cover absolute inset-0"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-purple-500 to-pink-500 absolute inset-0">
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      <p className="text-white text-xl font-medium text-center">{post.content}</p>
                    </div>
                  </div>
                )}
                
                {/* Controls overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 right-4 z-10 flex items-center">
                    <button className="text-white p-2 pointer-events-auto">
                      <Settings size={24} />
                    </button>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <div className="flex items-center mb-2">
                      <Avatar className="h-8 w-8 mr-2 border border-white">
                        <AvatarImage src={post.avatar || character?.image} alt={post.username || character?.artistName} />
                        <AvatarFallback>{(post.username || character?.artistName || "User").charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-white font-medium mr-2">{post.username || character?.artistName}</span>
                      <Button className="text-white text-xs bg-transparent border border-white hover:bg-white/20 h-7 px-3 rounded-md pointer-events-auto">
                        Follow
                      </Button>
                    </div>
                    
                    <p className="text-white mb-4 text-sm">{post.content}</p>
                    
                    <div className="flex items-center">
                      <div className="flex items-center">
                        <Music size={14} className="mr-1 text-white" />
                        <div className="text-white text-xs flex-1 whitespace-nowrap animate-marquee">
                          <span className="mr-8">Original Sound • {post.username || character?.artistName}</span>
                          <span>Original Sound • {post.username || character?.artistName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute right-4 bottom-20 flex flex-col items-center space-y-5">
                    <button className="text-white flex flex-col items-center pointer-events-auto">
                      <div className="h-10 w-10 bg-black/20 rounded-full flex items-center justify-center mb-1">
                        <Heart size={28} />
                      </div>
                      <span className="text-xs">{formatNumber(post.likes)}</span>
                    </button>
                    
                    <button className="text-white flex flex-col items-center pointer-events-auto">
                      <div className="h-10 w-10 bg-black/20 rounded-full flex items-center justify-center mb-1">
                        <MessageCircle size={26} />
                      </div>
                      <span className="text-xs">{formatNumber(post.comments)}</span>
                    </button>
                    
                    <button className="text-white flex flex-col items-center pointer-events-auto">
                      <div className="h-10 w-10 bg-black/20 rounded-full flex items-center justify-center mb-1">
                        <Send size={26} />
                      </div>
                      <span className="text-xs">Share</span>
                    </button>
                    
                    <button className="text-white flex flex-col items-center pointer-events-auto">
                      <div className="h-10 w-10 bg-black/20 rounded-full flex items-center justify-center mb-1">
                        <MoreHorizontal size={26} />
                      </div>
                    </button>
                    
                    <div className="h-10 w-10 rounded border-2 border-white overflow-hidden mt-2 pointer-events-auto">
                      {post.image ? (
                        <img src={post.image} alt="Audio cover" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <EmptyPostState
            message="No reels available yet."
            icon={<Film size={40} />}
            action={null}
          />
        </div>
      )}
    </div>
  );
};

// Profile View Component
const ProfileView: React.FC<{ character: any; posts: SocialMediaPost[] }> = ({ character, posts }) => {
  const [activeTab, setActiveTab] = useState('posts');
  
  return (
    <div className="flex flex-col h-full pb-12 md:pb-0 overflow-y-auto">
      {/* Profile header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex">
          <div className="p-1 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 mr-5">
            <div className="bg-white dark:bg-black p-0.5 rounded-full">
              <Avatar className="h-20 w-20 rounded-full border-none">
                <AvatarImage src={character?.image} alt={character?.artistName} className="object-cover" />
                <AvatarFallback className="text-lg">{(character?.artistName || "User").charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium text-black dark:text-white text-xl">{character?.artistName}</h2>
              <button className="md:hidden">
                <Settings size={24} />
              </button>
            </div>
            
            <div className="flex space-x-5 mb-3">
              <div className="text-center">
                <span className="font-semibold text-black dark:text-white">{posts.length}</span>
                <span className="block text-sm text-black dark:text-white">Posts</span>
              </div>
              <div className="text-center">
                <span className="font-semibold text-black dark:text-white">{formatNumber(character?.followers || 1000)}</span>
                <span className="block text-sm text-black dark:text-white">Followers</span>
              </div>
              <div className="text-center">
                <span className="font-semibold text-black dark:text-white">{formatNumber(character?.following || 500)}</span>
                <span className="block text-sm text-black dark:text-white">Following</span>
              </div>
            </div>
            
            <div className="hidden md:flex md:space-x-2">
              <Button className="flex-1 bg-gray-100 hover:bg-gray-200 text-black px-3 h-8 font-medium">
                Edit Profile
              </Button>
              <Button className="flex-1 bg-gray-100 hover:bg-gray-200 text-black px-3 h-8 font-medium">
                Share Profile
              </Button>
              <Button className="bg-gray-100 hover:bg-gray-200 text-black px-2 h-8 w-8">
                <User size={16} />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-3">
          <p className="font-medium text-black dark:text-white">{character?.artistName}</p>
          <p className="text-sm text-black dark:text-white">
            Rapper 🎤 | Producer 🎧 | Entrepreneur 💰
          </p>
          <p className="text-sm text-black dark:text-white">
            New album dropping soon! 🔥
          </p>
        </div>
        
        <div className="mt-3 md:hidden">
          <Button className="w-full bg-gray-100 hover:bg-gray-200 text-black font-medium">
            Edit Profile
          </Button>
        </div>
      </div>
      
      {/* Tabs for Posts/Reels/Tagged */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button 
          className={`flex-1 py-3 flex justify-center items-center ${activeTab === 'posts' ? 'border-b-2 border-black dark:border-white' : 'text-gray-500'}`}
          onClick={() => setActiveTab('posts')}
        >
          <Grid size={16} className="mr-1" />
          <span className="text-xs uppercase font-semibold">Posts</span>
        </button>
        <button 
          className={`flex-1 py-3 flex justify-center items-center ${activeTab === 'reels' ? 'border-b-2 border-black dark:border-white' : 'text-gray-500'}`}
          onClick={() => setActiveTab('reels')}
        >
          <Film size={16} className="mr-1" />
          <span className="text-xs uppercase font-semibold">Reels</span>
        </button>
        <button 
          className={`flex-1 py-3 flex justify-center items-center ${activeTab === 'tagged' ? 'border-b-2 border-black dark:border-white' : 'text-gray-500'}`}
          onClick={() => setActiveTab('tagged')}
        >
          <User size={16} className="mr-1" />
          <span className="text-xs uppercase font-semibold">Tagged</span>
        </button>
      </div>
      
      {/* Posts grid */}
      {activeTab === 'posts' && (
        posts.length > 0 ? (
          <div className="grid grid-cols-3 gap-[2px]">
            {posts.map((post, index) => (
              <div key={post.id || index} className="aspect-square bg-gray-100 dark:bg-gray-900 overflow-hidden">
                {post.image ? (
                  <img 
                    src={post.image} 
                    alt={`Post ${index}`} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-2">
                    <p className="text-white text-xs font-medium text-center truncate">{post.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <Square className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-medium text-black dark:text-white mb-2">Share Photos</h3>
            <p className="text-gray-500 mb-4">When you share photos, they will appear on your profile.</p>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-3">Share your first photo</Button>
          </div>
        )
      )}
      
      {/* Reels tab */}
      {activeTab === 'reels' && (
        <div className="p-10 text-center">
          <Film className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-medium text-black dark:text-white mb-2">No Reels Yet</h3>
          <p className="text-gray-500 mb-4">Reels are short, entertaining videos on Instagram.</p>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white px-3">Create a Reel</Button>
        </div>
      )}
      
      {/* Tagged tab */}
      {activeTab === 'tagged' && (
        <div className="p-10 text-center">
          <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-medium text-black dark:text-white mb-2">No Photos</h3>
          <p className="text-gray-500 mb-4">When people tag you in photos, they'll appear here.</p>
        </div>
      )}
    </div>
  );
};

// Main Instagram Panel Component - enhanced with multiple views
interface InstagramPanelProps {
  onBack?: () => void;
}

const InstagramPanel: React.FC<InstagramPanelProps> = ({ onBack }) => {
  const { character, postOnSocialMedia, socialMedia, socialMediaStats, aiRappers, currentWeek } = useRapperGame();
  const [instagramPosts, setInstagramPosts] = useState<SocialMediaPost[]>([]);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [activeStoryIndex, setActiveStoryIndex] = useState(-1);
  
  // Get Instagram data from store
  useEffect(() => {
    // Try to get posts from socialMediaStats first (new structure)
    const instagramPlatform = socialMedia.find(p => p.name === "Instagram");

    if (socialMediaStats?.instagram?.posts) {
      setInstagramPosts(socialMediaStats.instagram.posts);
    } else {
      // Fallback to looking at viralPosts in old structure
      if (instagramPlatform?.viralPosts) {
        setInstagramPosts(instagramPlatform.viralPosts);
      } else {
        // If no posts found, use empty array
        setInstagramPosts([]);
      }
    }
    
    // If there are few or no posts, generate AI content 
    if ((!socialMediaStats?.instagram?.posts || socialMediaStats?.instagram?.posts.length < 3) && 
        (!instagramPlatform?.viralPosts || instagramPlatform?.viralPosts.length < 3)) {
      generateAIContent();
    }
  }, [socialMedia, socialMediaStats]);
  
  // Generate AI-based content for Instagram feed
  const generateAIContent = () => {
    // Only generate if we have AI rappers data
    if (!aiRappers || aiRappers.length === 0) return;
    
    // Select a few random AI rappers
    const selectedRappers = aiRappers
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
      
    // Create placeholders for images
    const placeholderImages = [
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    ];
      
    // Generate placeholder posts for them
    const aiGeneratedPosts: SocialMediaPost[] = selectedRappers.map((rapper, index) => {
      // Content topics based on rapper's style
      const topics = [
        `Studio vibes 🎵 #${rapper.style.replace(/\s+/g, '')}`,
        `New merch dropping soon! Who's copping? 👕`,
        `Behind the scenes from my latest video shoot 📸`,
        `Throwback to last weekend's show 🔥`,
        `Can't wait to share what we've been working on! 👀`,
        `Link in bio for tickets to my upcoming tour! 🎫`,
        `Blessed for all the support on my latest project 🙏`
      ];
      
      // Pick a random content topic
      const randomContent = topics[Math.floor(Math.random() * topics.length)];
      const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
      
      return {
        id: `ai-${rapper.id}-${Date.now()}-${index}`,
        platformName: "Instagram",
        content: randomContent,
        postWeek: Math.max(1, currentWeek - Math.floor(Math.random() * 3)),
        images: [randomImage],
        likes: Math.floor(rapper.popularity * 200 + Math.random() * 2000),
        comments: Math.floor(rapper.popularity * 10 + Math.random() * 100),
        shares: Math.floor(rapper.popularity * 5 + Math.random() * 50),
        viralStatus: "not_viral",
        viralMultiplier: 1,
        followerGain: 0,
        reputationGain: 0,
        wealthGain: 0,
        username: rapper.name,
        handle: rapper.name.toLowerCase().replace(/\s+/g, ''),
        avatar: rapper.image,
        verified: rapper.popularity > 60
      };
    });
    
    // Add these to the current posts
    setInstagramPosts(prevPosts => [...aiGeneratedPosts, ...prevPosts]);
  };

  // Handle post creation
  const handlePost = (content: string, image?: string) => {
    // Use the store's postOnSocialMedia method to post to Instagram
    postOnSocialMedia("Instagram", content, image ? [image] : undefined);
    setIsCreatePostOpen(false);
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
  
  // Actions for posts with enhanced functionality
  const handleLike = (id: string) => {
    console.log(`Liked post: ${id}`);
    
    // Update state in local posts if found
    setInstagramPosts(prevPosts => 
      prevPosts.map(post => {
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
    
    // Play satisfying sound effect on like
    const audio = new Audio("/assets/sounds/pop.mp3");
    audio.volume = 0.2;
    audio.play().catch(e => console.log("Audio play prevented:", e));
    
    // Show success notification
    toast.success("Post liked!", {
      position: "bottom-center",
      duration: 1000,
      className: "bg-gradient-to-r from-pink-500 to-yellow-500"
    });
  };
  
  const handleComment = (id: string) => {
    console.log(`Comment on post: ${id}`);
    
    // For now just show a confirmation toast
    toast.success("Comment added!", {
      position: "bottom-center",
      duration: 1200
    });
    
    // Update state in local posts if found to increment comment count
    setInstagramPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === id) {
          return {
            ...post,
            comments: post.comments + 1
          };
        }
        return post;
      })
    );
  };
  
  const handleShare = (id: string) => {
    console.log(`Share post: ${id}`);
    
    // For now just show a confirmation toast with share options
    toast.success("Post shared!", {
      position: "bottom-center",
      duration: 1500,
      description: "Shared with your followers"
    });
    
    // Update state in local posts if found
    setInstagramPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === id) {
          return {
            ...post,
            shares: (post.shares || 0) + 1
          };
        }
        return post;
      })
    );
  };
  
  const handleSave = (id: string) => {
    console.log(`Saved post: ${id}`);
    
    // Update state in local posts if found
    setInstagramPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === id) {
          return {
            ...post,
            saved: !(post.saved || false)
          };
        }
        return post;
      })
    );
    
    // Show success notification
    toast.success("Post saved to collection!", {
      position: "bottom-center",
      duration: 1000
    });
  };
  
  const handleFollow = (id: string) => {
    console.log(`Follow user: ${id}`);
    
    // For now just show a confirmation toast
    toast.success("User followed!", {
      position: "bottom-center",
      duration: 1500,
      description: "You'll see their posts in your feed"
    });
  };
  
  // Generate stories based on game state
  const generateStories = () => {
    const stories = [];
    
    // Add player story first
    if (character) {
      stories.push({
        id: "player",
        username: character.artistName,
        avatar: character.image || "/assets/profiles/profile1.svg",
        viewed: false
      });
    }
    
    // Add AI rapper stories
    if (aiRappers && aiRappers.length > 0) {
      const rapperCount = Math.min(aiRappers.length, 10);
      for (let i = 0; i < rapperCount; i++) {
        const rapper = aiRappers[i];
        stories.push({
          id: rapper.id || `ai-rapper-${i}`,
          username: rapper.name,
          avatar: rapper.image || `/assets/profiles/profile${(i % 6) + 1}.svg`,
          viewed: Math.random() > 0.5
        });
      }
    }
    
    return stories;
  };
  
  const stories = generateStories();
  
  // Handler for opening story viewer
  const handleStoryClick = (index: number) => {
    setActiveStoryIndex(index);
    setIsStoryViewerOpen(true);
  };
  
  // Get suggested users
  const getSuggestedUsers = () => {
    if (!aiRappers || aiRappers.length === 0) return [];
    
    // Take a few random AI rappers to suggest
    return aiRappers
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
  };
  
  // Generate Instagram Header based on active tab
  const renderHeader = () => {
    if (activeTab === 'home') {
      return (
        <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between bg-white dark:bg-black">
          <div className="text-xl font-semibold text-black dark:text-white">
            Instagram
          </div>
          <div className="flex space-x-4">
            <button className="text-black dark:text-white">
              <Heart size={24} strokeWidth={1.8} />
            </button>
            <button className="text-black dark:text-white">
              <MessageCircle size={24} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      );
    } else if (activeTab === 'search') {
      return (
        <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 bg-white dark:bg-black">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <Input 
              placeholder="Search" 
              className="bg-gray-100 dark:bg-gray-800 border-0 pl-10 rounded-lg"
            />
          </div>
        </div>
      );
    } else if (activeTab === 'reels') {
      return (
        <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between bg-white dark:bg-black">
          <div className="text-xl font-semibold text-black dark:text-white">
            Reels
          </div>
          <button className="text-black dark:text-white">
            <Settings size={24} strokeWidth={1.8} />
          </button>
        </div>
      );
    } else if (activeTab === 'profile') {
      return (
        <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center bg-white dark:bg-black">
          <div className="flex-1 flex items-center justify-center text-black dark:text-white font-semibold">
            {character?.artistName}
            <ChevronRight className="h-4 w-4 ml-1" />
          </div>
          <button className="absolute right-4 text-black dark:text-white">
            <Plus className="h-6 w-6" strokeWidth={1.8} />
          </button>
        </div>
      );
    }
    
    return (
      <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between bg-white dark:bg-black">
        <Button 
          variant="ghost" 
          className="mr-2 text-black dark:text-white flex items-center gap-1" 
          onClick={handleBackToDashboard}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="hidden sm:inline font-medium">Back to Social Media</span>
        </Button>
        <div className="text-xl font-semibold text-black dark:text-white">
          Instagram
        </div>
        <div className="w-8"></div> {/* Empty space for alignment */}
      </div>
    );
  };
  
  // Content based on active tab
  const renderContent = () => {
    if (activeTab === 'home') {
      return (
        <div className="flex-1 overflow-y-auto bg-white dark:bg-black">
          {/* Stories */}
          <div className="border-b border-gray-100 dark:border-gray-900 py-4 px-2 overflow-x-auto">
            <div className="flex">
              {stories.map((story, index) => (
                <StoryCircle 
                  key={story.id} 
                  story={story} 
                  onClick={() => handleStoryClick(index)}
                />
              ))}
            </div>
          </div>
          
          {/* Posts Feed */}
          <div>
            {instagramPosts.length > 0 ? (
              instagramPosts.map((post) => (
                <InstagramPost 
                  key={post.id}
                  post={post}
                  character={character}
                  onLike={handleLike}
                  onComment={handleComment}
                  onShare={handleShare}
                  onSave={handleSave}
                />
              ))
            ) : (
              <EmptyPostState
                message="No posts yet. Create your first post!"
                icon={<ImageIcon size={24} />}
                action={
                  <Button 
                    className="mt-2 bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => setIsCreatePostOpen(true)}
                  >
                    Create Post
                  </Button>
                }
              />
            )}
          </div>
          
          {/* Suggested Users (after a few posts) */}
          {instagramPosts.length > 0 && (
            <SuggestedUsers 
              users={getSuggestedUsers()} 
              onFollow={handleFollow} 
            />
          )}
        </div>
      );
    } else if (activeTab === 'search') {
      return (
        <div className="flex-1 overflow-y-auto bg-white dark:bg-black">
          <ExploreGrid posts={instagramPosts.length > 0 ? instagramPosts : []} />
        </div>
      );
    } else if (activeTab === 'reels') {
      return (
        <ReelsView posts={instagramPosts.length > 0 ? instagramPosts : []} character={character} />
      );
    } else if (activeTab === 'profile') {
      return (
        <ProfileView character={character} posts={instagramPosts} />
      );
    }
    
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyPostState
          message="This section is under development"
          icon={<Settings size={24} />}
          action={null}
        />
      </div>
    );
  };
  
  const customTabs = [
    { id: 'home', icon: <Home className="h-6 w-6" />, label: '' },
    { id: 'search', icon: <Search className="h-6 w-6" />, label: '' },
    { id: 'create', icon: <Plus className="h-7 w-7 border-2 border-black dark:border-white rounded-md" />, label: '' },
    { id: 'reels', icon: <Film className="h-6 w-6" />, label: '' },
    { id: 'profile', icon: 
      <Avatar className="h-6 w-6">
        <AvatarImage src={character?.image} alt={character?.artistName} />
        <AvatarFallback>{character?.artistName?.charAt(0) || "U"}</AvatarFallback>
      </Avatar>, 
      label: '' 
    },
  ];

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-black">
      {/* Instagram Header */}
      {renderHeader()}
      
      {/* Main Content */}
      {renderContent()}
      
      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800 py-3 px-2 sticky bottom-0 z-10 bg-white dark:bg-black flex justify-between items-center">
        {customTabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex flex-col items-center justify-center px-3 py-1 rounded-md ${
              activeTab === tab.id ? 'text-black dark:text-white' : 'text-gray-500'
            }`}
            onClick={() => {
              if (tab.id === 'create') {
                setIsCreatePostOpen(true);
              } else {
                setActiveTab(tab.id);
              }
            }}
          >
            {tab.icon}
            {tab.label && <span className="text-xs mt-1">{tab.label}</span>}
          </button>
        ))}
      </div>
      
      {/* Create Post Dialog */}
      <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
        <DialogContent className="p-0 max-w-md rounded-lg overflow-hidden h-[80vh]">
          <CreatePostDialog 
            onPost={handlePost} 
            character={character} 
            onClose={() => setIsCreatePostOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Story Viewer */}
      {isStoryViewerOpen && (
        <StoryViewer 
          stories={stories}
          onClose={() => setIsStoryViewerOpen(false)}
        />
      )}
    </div>
  );
};

// Add Instagram-specific animations to tailwind
const style = document.createElement('style');
style.textContent = `
  @keyframes scale-up {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    70% {
      transform: scale(1.2);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }
  
  .animate-scale-up {
    animation: scale-up 1.5s ease-out forwards;
  }
  
  @keyframes pulse-slow {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
  
  .animate-pulse-slow {
    animation: pulse-slow 2s ease-in-out infinite;
  }
  
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
`;
document.head.appendChild(style);

export default InstagramPanel;