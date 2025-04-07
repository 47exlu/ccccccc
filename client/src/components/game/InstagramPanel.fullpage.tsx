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
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import { 
  Heart, MessageCircle, Send, Search, Share, 
  MoreHorizontal, ImageIcon, Home, Bookmark, 
  PlusSquare, ExternalLink, User, Video, 
  ShoppingBag, Film, ChevronLeft
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

// Instagram Post Props
interface InstagramPostProps {
  post: SocialMediaPost;
  username: string;
  userAvatar?: string;
  verified?: boolean;
  location?: string;
  timestamp?: string;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onSave?: (postId: string) => void;
  playerPost?: boolean;
}

// Generate stories based on game state
const generateStories = (aiRappers: any[], character: any) => {
  const result = [];
  
  // Add player story first
  if (character) {
    result.push({
      id: "player",
      username: character.artistName,
      handle: character.artistName?.toLowerCase().replace(/\s+/g, '') || "artist",
      avatar: character.image || "/assets/profiles/profile1.svg",
      viewed: false,
      isPlayer: true
    });
  }
  
  // Add AI rapper stories (up to 10)
  const rapperCount = Math.min(aiRappers.length, 10);
  for (let i = 0; i < rapperCount; i++) {
    const rapper = aiRappers[i];
    result.push({
      id: rapper.id,
      username: rapper.name,
      handle: rapper.name.toLowerCase().replace(/\s+/g, ''),
      avatar: rapper.image || `/assets/profiles/profile${(i % 6) + 1}.svg`,
      viewed: Math.random() > 0.5,
      isPlayer: false
    });
  }
  
  // Fill with additional stories if needed
  if (result.length < 12) {
    const additionalCount = 12 - result.length;
    for (let i = 0; i < additionalCount; i++) {
      result.push({
        id: `generated_${i}`,
        username: ["musiclover", "beatmaker", "rapfan", "producer", "recordlabel", "fanbase"][i % 6],
        handle: ["musiclover", "beatmaker", "rapfan", "producer", "recordlabel", "fanbase"][i % 6],
        avatar: `/assets/profiles/profile${(i % 6) + 1}.svg`,
        viewed: Math.random() > 0.5,
        isPlayer: false
      });
    }
  }
  
  return result;
};

// Generate posts from game data and AI rappers
const generatePosts = (
  aiRappers: any[], 
  character: any, 
  twitterPosts: SocialMediaPost[],
  currentWeek: number
) => {
  let result: SocialMediaPost[] = [];
  
  // Convert Twitter posts to Instagram format for the player
  if (Array.isArray(twitterPosts)) {
    result = twitterPosts.map(post => ({
      ...post,
      platformName: "Instagram",
      // Keep other properties the same
    }));
  }
  
  // Generate AI rapper posts
  aiRappers.forEach(rapper => {
    // Each rapper has 30% chance to post
    if (Math.random() > 0.7) {
      const postCount = Math.floor(Math.random() * 2) + 1; // 1-2 posts
      
      for (let i = 0; i < postCount; i++) {
        const post = generateAIRapperPost(
          rapper,
          "Instagram",
          currentWeek,
          character
        );
        
        // Make sure almost all AI rapper posts have images (Instagram is visual)
        if (!post.image) {
          const imageNumber = Math.floor(Math.random() * 6) + 1;
          post.image = `/assets/covers/cover${imageNumber}.svg`;
        }
        
        result.push(post);
      }
    }
  });
  
  // Sort by most recent first
  result.sort((a, b) => {
    if (a.date && b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return b.postWeek - a.postWeek;
  });
  
  return result;
};

// Generate suggested accounts to follow based on game state
const generateSuggestedAccounts = (aiRappers: any[]) => {
  // Return 5 random AI rappers
  const shuffled = [...aiRappers].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
};

// Story Circle Component
const StoryCircle: React.FC<{
  story: {
    id: string;
    username: string;
    avatar: string;
    viewed: boolean;
    isPlayer?: boolean;
  };
  onClick?: () => void;
}> = ({ story, onClick }) => {
  return (
    <div className="flex flex-col items-center mr-4" onClick={onClick}>
      <div className={`${story.viewed ? 'border-gray-300' : 'border-gradient-instagram'} p-[2px] rounded-full`}>
        <Avatar className="h-16 w-16 border-2 border-white dark:border-gray-800">
          <AvatarImage src={story.avatar} alt={story.username} className="object-cover" />
          <AvatarFallback>{story.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        {story.isPlayer && (
          <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center border-2 border-white dark:border-black">
            <PlusSquare size={12} />
          </div>
        )}
      </div>
      <span className="text-xs mt-1 truncate w-16 text-center">{story.username}</span>
    </div>
  );
};

// Instagram Post Component
const InstagramPost: React.FC<InstagramPostProps> = ({
  post,
  username,
  userAvatar,
  verified = false,
  location,
  timestamp,
  onLike,
  onComment,
  onShare,
  onSave,
  playerPost = false
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  
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
  
  return (
    <div className="mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
      {/* Post header */}
      <div className="flex items-center p-3">
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={userAvatar || post.image} alt={username} />
          <AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center">
            <span className="font-semibold text-sm">{username}</span>
            {verified && (
              <span className="ml-1 text-blue-500">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
            {location && <span className="text-xs text-gray-500 ml-1">• {location}</span>}
          </div>
        </div>
        <button className="text-gray-700 dark:text-gray-300">
          <MoreHorizontal size={20} />
        </button>
      </div>
      
      {/* Post image */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        {post.image ? (
          <img src={post.image} alt={`Post by ${username}`} className="max-h-full max-w-full object-contain" />
        ) : (
          <div className="p-4 text-center">
            <p className="text-gray-800 dark:text-gray-200 font-medium whitespace-pre-wrap">{post.content}</p>
          </div>
        )}
      </div>
      
      {/* Post actions */}
      <div className="p-3">
        <div className="flex justify-between mb-2">
          <div className="flex space-x-4">
            <button 
              className={`${isLiked ? 'text-red-500' : 'text-black dark:text-white'}`}
              onClick={handleLike}
            >
              <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <button 
              className="text-black dark:text-white"
              onClick={() => onComment && onComment(post.id)}
            >
              <MessageCircle size={24} />
            </button>
            <button 
              className="text-black dark:text-white"
              onClick={() => onShare && onShare(post.id)}
            >
              <Send size={24} />
            </button>
          </div>
          <button 
            className={`${isSaved ? 'text-black dark:text-white' : 'text-black dark:text-white'}`}
            onClick={handleSave}
          >
            <Bookmark size={24} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        {/* Likes */}
        <div className="text-sm font-semibold mb-1">{formatNumber(likesCount)} likes</div>
        
        {/* Caption */}
        <div className="text-sm mb-1">
          <span className="font-semibold mr-1">{username}</span>
          {post.content}
        </div>
        
        {/* Comments link */}
        <button className="text-gray-500 text-sm">
          View all {formatNumber(post.comments)} comments
        </button>
        
        {/* Add comment section */}
        <div className="mt-2 flex items-center">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={playerPost ? userAvatar : "/assets/profiles/profile1.svg"} alt="Your profile" />
            <AvatarFallback>Y</AvatarFallback>
          </Avatar>
          <input 
            type="text" 
            placeholder="Add a comment..." 
            className="text-sm text-gray-500 bg-transparent border-none flex-1 focus:ring-0"
          />
          <button className="text-blue-500 font-semibold text-sm">Post</button>
        </div>
        
        {/* Timestamp */}
        <div className="text-gray-500 text-xs mt-2">{timestamp || formatDate(post.date)}</div>
      </div>
    </div>
  );
};

// Create Post Dialog
const CreatePostDialog: React.FC<{
  onPost: (text: string, image?: string) => void;
  isStory?: boolean;
}> = ({ onPost, isStory = false }) => {
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    if (selectedImage) {
      onPost(postText, selectedImage);
      setPostText('');
      setSelectedImage(null);
    }
  };
  
  return (
    <div className="w-full">
      <div className="mb-4">
        {selectedImage ? (
          <div className="relative aspect-square rounded bg-gray-100 dark:bg-gray-800 mb-3">
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
            className="aspect-square rounded bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center cursor-pointer mb-3"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-10 w-10 text-gray-400 mb-3" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">Click to upload a photo</p>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageSelect} 
              accept="image/*" 
            />
          </div>
        )}
        
        {!isStory && (
          <Textarea
            placeholder="Write a caption..."
            value={postText}
            onChange={e => setPostText(e.target.value)}
            rows={4}
            className="w-full"
          />
        )}
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={!selectedImage}
          className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white"
        >
          {isStory ? "Share to Story" : "Share"}
        </Button>
      </div>
    </div>
  );
};

// Explore Grid Component
const ExploreGrid: React.FC<{
  posts: SocialMediaPost[];
  onPostClick: (post: SocialMediaPost) => void;
}> = ({ posts, onPostClick }) => {
  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post) => (
        <div 
          key={post.id} 
          className="aspect-square bg-gray-100 dark:bg-gray-800 relative cursor-pointer"
          onClick={() => onPostClick(post)}
        >
          {post.image ? (
            <img src={post.image} alt="Post" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <ImageIcon size={24} />
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
            <div className="flex items-center space-x-2 text-white">
              <Heart size={20} fill="white" />
              <span className="font-semibold">{formatNumber(post.likes)}</span>
              <MessageCircle size={20} fill="white" className="ml-2" />
              <span className="font-semibold">{formatNumber(post.comments)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// User Profile Grid Component
const ProfileGrid: React.FC<{
  posts: SocialMediaPost[];
  onPostClick: (post: SocialMediaPost) => void;
}> = ({ posts, onPostClick }) => {
  return (
    <div className="grid grid-cols-3 gap-px bg-gray-200 dark:bg-gray-800">
      {posts.map((post) => (
        <div 
          key={post.id} 
          className="aspect-square bg-white dark:bg-black relative cursor-pointer"
          onClick={() => onPostClick(post)}
        >
          {post.image ? (
            <img src={post.image} alt="Post" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4 text-center text-gray-800 dark:text-gray-200 text-sm">
              {post.content.length > 100 ? `${post.content.substring(0, 100)}...` : post.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// StoryViewer component
const StoryViewer: React.FC<{
  stories: any[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}> = ({ stories, currentIndex, onClose, onNext, onPrevious }) => {
  const story = stories[currentIndex];
  
  // Progress timer
  const [progress, setProgress] = useState(0);
  
  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          onNext();
          return 0;
        }
        return prev + 1;
      });
    }, 50);
    
    return () => clearInterval(timer);
  }, [currentIndex, onNext]);
  
  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Close button */}
      <button 
        className="absolute top-4 right-4 text-white z-10"
        onClick={onClose}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800 z-10">
        <div 
          className="h-full bg-white"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      {/* Navigation */}
      <button 
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white z-10 h-12 w-12 flex items-center justify-center"
        onClick={onPrevious}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      <button 
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white z-10 h-12 w-12 flex items-center justify-center"
        onClick={onNext}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      {/* Story content */}
      <div className="max-h-full max-w-[400px] relative">
        <div className="max-h-full max-w-full">
          <img 
            src={story.avatar} 
            alt={story.username} 
            className="max-h-[80vh] w-auto object-contain"
          />
        </div>
        
        {/* User info */}
        <div className="absolute top-4 left-4 flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={story.avatar} alt={story.username} />
            <AvatarFallback>{story.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-white">
            <div className="text-sm font-semibold">{story.username}</div>
            <div className="text-xs opacity-75">1h ago</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Instagram Panel Component
export function InstagramPanelFullPage() {
  const [activeTab, setActiveTab] = useState<"home" | "explore" | "reels" | "shop" | "profile">("home");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isStoryComposeOpen, setIsStoryComposeOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SocialMediaPost | null>(null);
  const [isViewingStories, setIsViewingStories] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  
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
  
  // Get Instagram data from social media
  const instagramData = socialMedia.find(p => p.name === "Instagram") || {
    name: "Instagram",
    followers: 0,
    posts: 0,
    engagement: 0,
    lastPostWeek: 0
  };
  
  // Get Twitter posts to use for Instagram posts for the player
  const twitterData = socialMedia.find(p => p.name === "Twitter");
  const twitterPosts = Array.isArray(twitterData?.posts) ? twitterData.posts : [];
  
  // Generate stories
  const stories = generateStories(aiRappers, character);
  
  // Generate posts
  const [generatedPosts, setGeneratedPosts] = useState<SocialMediaPost[]>([]);
  
  React.useEffect(() => {
    if (generatedPosts.length === 0) {
      const posts = generatePosts(aiRappers, character, twitterPosts, currentWeek);
      setGeneratedPosts(posts);
    }
  }, [aiRappers, character, currentWeek, generatedPosts.length, twitterPosts]);
  
  // Generate suggested accounts
  const suggestedAccounts = generateSuggestedAccounts(aiRappers);
  
  // Handle post creation
  const handleCreatePost = (text: string, image?: string) => {
    postOnSocialMedia("Instagram", text, image ? [image] : undefined);
    playSuccess?.();
    setIsComposeOpen(false);
    
    // You could also add a function here to update the local state with the new post
  };
  
  // Handle story creation
  const handleCreateStory = (text: string, image?: string) => {
    // In a full implementation, this would create a story in the game state
    console.log("Creating story:", text, image);
    playSuccess?.();
    setIsStoryComposeOpen(false);
  };
  
  // Handle post interaction
  const handlePostClick = (post: SocialMediaPost) => {
    setSelectedPost(post);
  };
  
  // Story viewing handlers
  const openStoryViewer = (index: number) => {
    setCurrentStoryIndex(index);
    setIsViewingStories(true);
  };
  
  const closeStoryViewer = () => {
    setIsViewingStories(false);
  };
  
  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      closeStoryViewer();
    }
  };
  
  const previousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    }
  };
  
  // User profile for the player
  const userProfile = {
    username: character?.artistName || "Artist",
    handle: character?.artistName?.toLowerCase().replace(/\s+/g, '') || "artist",
    avatar: character?.image || "/assets/profiles/profile1.svg",
    bio: character?.about || "Musician/Artist",
    posts: generatedPosts.filter(post => !aiRappers.some(
      rapper => post.content.includes(rapper.name)
    )),
    followers: instagramData.followers,
    following: Math.floor(instagramData.followers / 10) || 100,
    verified: true
  };
  
  return (
    <div className="w-full bg-white dark:bg-black text-black dark:text-white min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBackToDashboard}
            className="mr-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-['Billabong', 'sans-serif'] transform scale-y-125">
            Instagram
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsComposeOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 12h20M12 2v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button>
            <Heart size={24} />
          </button>
          <button>
            <MessageCircle size={24} />
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToDashboard}
            className="ml-2 hidden sm:flex items-center"
          >
            Back to Dashboard
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="pb-16">
        {activeTab === "home" && (
          <div>
            {/* Stories */}
            <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-2">
              <ScrollArea className="w-full">
                <div className="flex py-2 min-w-max">
                  {/* Your Story */}
                  <div className="flex flex-col items-center mr-4" onClick={() => setIsStoryComposeOpen(true)}>
                    <div className="relative">
                      <Avatar className="h-16 w-16 border-2 border-white dark:border-gray-800">
                        <AvatarImage src={character?.image} alt="Your Story" className="object-cover" />
                        <AvatarFallback>{character?.artistName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center border-2 border-white dark:border-black">
                        <PlusSquare size={12} />
                      </div>
                    </div>
                    <span className="text-xs mt-1">Your Story</span>
                  </div>
                  
                  {/* Other Stories */}
                  {stories.filter(s => !s.isPlayer).map((story, index) => (
                    <StoryCircle 
                      key={story.id} 
                      story={story} 
                      onClick={() => openStoryViewer(index + 1)} // +1 to skip "Your Story"
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            {/* Feed Posts */}
            <div className="pb-20">
              {generatedPosts.length > 0 ? (
                generatedPosts.map((post) => {
                  // Find matching rapper for AI posts
                  const aiMatch = aiRappers.find(rapper => 
                    post.content.includes(rapper.name) || 
                    (post.content.includes('@') && post.content.includes(rapper.name.toLowerCase().replace(/\s+/g, '')))
                  );
                  
                  const isPlayerPost = !aiMatch;
                  
                  if (isPlayerPost) {
                    return (
                      <InstagramPost
                        key={post.id}
                        post={post}
                        username={character?.artistName || "Artist"}
                        userAvatar={character?.image}
                        verified={true}
                        playerPost={true}
                      />
                    );
                  } else {
                    return (
                      <InstagramPost
                        key={post.id}
                        post={post}
                        username={aiMatch?.name || "User"}
                        userAvatar={aiMatch?.image}
                        verified={aiMatch?.popularity ? aiMatch.popularity > 70 : false}
                      />
                    );
                  }
                })
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>No posts yet! Share your first photo or video.</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === "explore" && (
          <div>
            <div className="sticky top-14 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-10 p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg pl-10 pr-4 py-2 border-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
            </div>
            
            <div className="p-0.5">
              <ExploreGrid 
                posts={generatedPosts} 
                onPostClick={handlePostClick}
              />
            </div>
          </div>
        )}
        
        {activeTab === "profile" && (
          <div>
            {/* Profile Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex">
                <div className="mr-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={userProfile.avatar} alt={userProfile.username} />
                    <AvatarFallback>{userProfile.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-3">
                    <h2 className="text-xl font-semibold">{userProfile.username}</h2>
                    {userProfile.verified && (
                      <span className="text-blue-500">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    )}
                  </div>
                  
                  <div className="flex space-x-5 mb-3">
                    <div className="text-center">
                      <div className="font-semibold">{userProfile.posts.length}</div>
                      <div className="text-xs text-gray-500">posts</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{formatNumber(userProfile.followers)}</div>
                      <div className="text-xs text-gray-500">followers</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{formatNumber(userProfile.following)}</div>
                      <div className="text-xs text-gray-500">following</div>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <div className="font-semibold">{userProfile.username}</div>
                    <div className="text-gray-600 dark:text-gray-400">Musician/Artist</div>
                    <div>{userProfile.bio}</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex">
                <Button className="flex-1 mr-1 bg-gray-200 text-black hover:bg-gray-300 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
                  Edit profile
                </Button>
                <Button className="flex-1 ml-1 bg-gray-200 text-black hover:bg-gray-300 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
                  Share profile
                </Button>
              </div>
              
              {/* Stories Highlights */}
              <div className="mt-4">
                <div className="text-sm font-semibold mb-2">Story Highlights</div>
                <div className="flex space-x-4">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center">
                      <PlusSquare size={24} className="text-gray-400" />
                    </div>
                    <span className="text-xs mt-1">New</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Profile Tabs */}
            <div className="border-t border-gray-200 dark:border-gray-800">
              <Tabs defaultValue="posts" className="w-full">
                <TabsList className="w-full grid grid-cols-3 h-auto">
                  <TabsTrigger value="posts" className="py-3 data-[state=active]:border-t-2 data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:border-b-0 rounded-none">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </TabsTrigger>
                  <TabsTrigger value="videos" className="py-3 data-[state=active]:border-t-2 data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:border-b-0 rounded-none">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 10l5-5m0 0v5m0-5h-5M4 4l5 5m0 0H4m5 0V4m5 11l5 5m0 0h-5m5 0v-5m-16 5l5-5m0 0v5m0 0H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </TabsTrigger>
                  <TabsTrigger value="tagged" className="py-3 data-[state=active]:border-t-2 data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:border-b-0 rounded-none">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 8v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8m2-2h12m-9 0V4a1 1 0 011-1h3a1 1 0 011 1v2m-5 6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="posts" className="mt-0">
                  <ProfileGrid
                    posts={userProfile.posts}
                    onPostClick={handlePostClick}
                  />
                </TabsContent>
                <TabsContent value="videos" className="mt-0 p-8 text-center text-gray-500">
                  <Video size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold">No Videos Yet</h3>
                  <p className="mt-2">Share videos to have them appear here.</p>
                </TabsContent>
                <TabsContent value="tagged" className="mt-0 p-8 text-center text-gray-500">
                  <User size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold">No Tags Yet</h3>
                  <p className="mt-2">Photos and videos you're tagged in will appear here.</p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
        
        {activeTab === "reels" && (
          <div className="h-[calc(100vh-56px-56px)] flex items-center justify-center">
            <div className="text-center p-8">
              <Film size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold mb-2">Create Your First Reel</h3>
              <p className="text-gray-500 max-w-sm mb-4">
                Share short-form videos with your fans and followers to boost engagement.
              </p>
              <Button 
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white"
                onClick={() => setIsComposeOpen(true)}
              >
                Create Reel
              </Button>
            </div>
          </div>
        )}
        
        {activeTab === "shop" && (
          <div className="h-[calc(100vh-56px-56px)] flex items-center justify-center">
            <div className="text-center p-8">
              <ShoppingBag size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold mb-2">Shop Your Merchandise</h3>
              <p className="text-gray-500 max-w-sm mb-4">
                Sell merchandise directly to your fans through Instagram Shopping.
              </p>
              <Button className="bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                Set Up Shop
              </Button>
            </div>
          </div>
        )}
      </main>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 flex justify-between items-center px-6 py-3 z-10">
        <button 
          onClick={() => setActiveTab("home")}
          className={activeTab === "home" ? "text-black dark:text-white" : "text-gray-500"}
        >
          <Home size={24} />
        </button>
        <button 
          onClick={() => setActiveTab("explore")}
          className={activeTab === "explore" ? "text-black dark:text-white" : "text-gray-500"}
        >
          <Search size={24} />
        </button>
        <button onClick={() => setIsComposeOpen(true)}>
          <PlusSquare size={24} />
        </button>
        <button 
          onClick={() => setActiveTab("reels")}
          className={activeTab === "reels" ? "text-black dark:text-white" : "text-gray-500"}
        >
          <Film size={24} />
        </button>
        <button 
          onClick={() => setActiveTab("profile")}
          className={activeTab === "profile" ? "text-black dark:text-white" : "text-gray-500"}
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={character?.image} alt="Profile" />
            <AvatarFallback>{character?.artistName?.charAt(0)}</AvatarFallback>
          </Avatar>
        </button>
      </div>
      
      {/* Create Post Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new post</DialogTitle>
          </DialogHeader>
          <CreatePostDialog onPost={handleCreatePost} />
        </DialogContent>
      </Dialog>
      
      {/* Create Story Dialog */}
      <Dialog open={isStoryComposeOpen} onOpenChange={setIsStoryComposeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create story</DialogTitle>
          </DialogHeader>
          <CreatePostDialog onPost={handleCreateStory} isStory={true} />
        </DialogContent>
      </Dialog>
      
      {/* View Post Dialog */}
      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden max-h-[90vh]">
            <ScrollArea className="max-h-[90vh]">
              <div className="p-0">
                <InstagramPost
                  post={selectedPost}
                  username={
                    aiRappers.find(r => selectedPost.content.includes(r.name))?.name || 
                    character?.artistName || 
                    "User"
                  }
                  userAvatar={
                    aiRappers.find(r => selectedPost.content.includes(r.name))?.image || 
                    character?.image
                  }
                  verified={
                    aiRappers.find(r => selectedPost.content.includes(r.name))?.popularity ? 
                    aiRappers.find(r => selectedPost.content.includes(r.name))!.popularity > 70 : 
                    true
                  }
                  location="Music Studio"
                />
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Story Viewer */}
      {isViewingStories && (
        <StoryViewer
          stories={stories}
          currentIndex={currentStoryIndex}
          onClose={closeStoryViewer}
          onNext={nextStory}
          onPrevious={previousStory}
        />
      )}
    </div>
  );
}