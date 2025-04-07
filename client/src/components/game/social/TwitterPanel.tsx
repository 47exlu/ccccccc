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
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Twitter as TwitterIcon, 
  Home, 
  Bell, 
  Mail, 
  Search, 
  User, 
  Settings, 
  MoreHorizontal,
  MessageCircle,
  Repeat,
  Heart,
  Upload,
  Volume2,
  ArrowLeft,
  Bookmark,
  Share,
  TrendingUp,
  HashIcon,
  Image as ImageIcon,
  Calendar,
  MapPin,
  Smile,
  X
} from "lucide-react";

// Tweet Component with fully redesigned X-style
interface TweetProps {
  post: SocialMediaPost;
  character: any;
  onLike: (id: string) => void;
  onRetweet: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  onBookmark?: (id: string) => void;
}

const Tweet: React.FC<TweetProps> = ({ 
  post, 
  character, 
  onLike, 
  onRetweet, 
  onComment, 
  onShare,
  onBookmark 
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isRetweeted, setIsRetweeted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [retweetsCount, setRetweetsCount] = useState(post.shares);
  const [commentsCount, setCommentsCount] = useState(post.comments);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentText, setCommentText] = useState("");

  // Animation for like and retweet
  const likeButtonRef = useRef<HTMLButtonElement>(null);
  const retweetButtonRef = useRef<HTMLButtonElement>(null);

  const handleLike = () => {
    // Add heart animation
    if (likeButtonRef.current && !isLiked) {
      likeButtonRef.current.classList.add('animate-heartbeat');
      setTimeout(() => {
        if (likeButtonRef.current) {
          likeButtonRef.current.classList.remove('animate-heartbeat');
        }
      }, 800);
    }
    
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike(post.id);
  };

  const handleRetweet = () => {
    // Add retweet animation
    if (retweetButtonRef.current && !isRetweeted) {
      retweetButtonRef.current.classList.add('animate-spin-once');
      setTimeout(() => {
        if (retweetButtonRef.current) {
          retweetButtonRef.current.classList.remove('animate-spin-once');
        }
      }, 500);
    }
    
    setIsRetweeted(!isRetweeted);
    setRetweetsCount(prev => isRetweeted ? prev - 1 : prev + 1);
    onRetweet(post.id);
  };
  
  const handleCommentClick = () => {
    setIsCommentModalOpen(true);
    onComment(post.id);
  };
  
  const handleComment = () => {
    if (commentText.trim()) {
      setCommentsCount(prev => prev + 1);
      // In a real app we would add the comment to the database
      setCommentText("");
      setIsCommentModalOpen(false);
    }
  };
  
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    if (onBookmark) onBookmark(post.id);
  };

  // Generate avatar and username from post or character
  const userName = post.username || character?.artistName || "User";
  const userHandle = post.handle || userName.toLowerCase().replace(/\s+/g, '');
  const avatarUrl = post.avatar || character?.image;
  const verified = post.verified !== undefined ? post.verified : true;
  
  // Format date
  const formatDate = (date?: Date | string): string => {
    if (!date) return "";
    if (typeof date === 'string') {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    }
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <>
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/5 transition-colors">
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <Avatar className="h-10 w-10 rounded-full">
              <AvatarImage src={avatarUrl} alt={userName} className="object-cover" />
              <AvatarFallback className="bg-gray-300 text-gray-600">{userName.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center text-sm">
              <div className="flex items-center max-w-[180px] truncate">
                <span className="font-bold text-gray-900 dark:text-white hover:underline truncate">{userName}</span>
                {verified && (
                  <Badge className="ml-0.5 bg-[#1D9BF0] text-white border-0 h-4 w-4 p-0 flex items-center justify-center rounded-full">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="white"/>
                    </svg>
                  </Badge>
                )}
              </div>
              <div className="flex items-center text-gray-500 truncate ml-1">
                <span className="truncate">@{userHandle}</span>
                <span className="mx-1">·</span>
                <span className="whitespace-nowrap hover:underline">
                  {post.date ? formatDate(post.date instanceof Date ? post.date : new Date(post.date)) : 'just now'}
                </span>
              </div>
              <button className="ml-auto text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
                <MoreHorizontal size={16} />
              </button>
            </div>
            
            {/* Post content */}
            <div className="mt-1">
              <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap text-[15px] leading-normal">{post.content}</p>
              
              {post.image && (
                <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                  <img 
                    src={post.image} 
                    alt="Tweet media" 
                    className="w-full h-auto object-cover max-h-[510px]"
                    loading="lazy"
                  />
                </div>
              )}
              
              {/* Interaction buttons */}
              <div className="flex justify-between mt-3 text-sm text-gray-500 -ml-2">
                <button 
                  className="flex items-center hover:text-[#1D9BF0] transition-colors group"
                  onClick={handleCommentClick}
                >
                  <div className="p-2 rounded-full group-hover:bg-[#1D9BF0]/10 transition-colors">
                    <MessageCircle size={18} />
                  </div>
                  <span className="text-sm">{formatNumber(commentsCount)}</span>
                </button>
                
                <button 
                  ref={retweetButtonRef}
                  className={`flex items-center ${isRetweeted ? 'text-green-500' : 'hover:text-green-500'} transition-colors group`}
                  onClick={handleRetweet}
                >
                  <div className={`p-2 rounded-full ${isRetweeted ? 'bg-green-500/10' : 'group-hover:bg-green-500/10'} transition-colors`}>
                    <Repeat size={18} className={isRetweeted ? 'fill-green-500/10' : ''} />
                  </div>
                  <span className="text-sm">{formatNumber(retweetsCount)}</span>
                </button>
                
                <button 
                  ref={likeButtonRef}
                  className={`flex items-center ${isLiked ? 'text-pink-500' : 'hover:text-pink-500'} transition-colors group`}
                  onClick={handleLike}
                >
                  <div className={`p-2 rounded-full ${isLiked ? 'bg-pink-500/10' : 'group-hover:bg-pink-500/10'} transition-colors`}>
                    <Heart size={18} className={isLiked ? 'fill-pink-500' : ''} strokeWidth={2} />
                  </div>
                  <span className="text-sm">{formatNumber(likesCount)}</span>
                </button>
                
                <button 
                  className={`flex items-center ${isBookmarked ? 'text-[#1D9BF0]' : 'hover:text-[#1D9BF0]'} transition-colors group`}
                  onClick={handleBookmark}
                >
                  <div className={`p-2 rounded-full ${isBookmarked ? 'bg-[#1D9BF0]/10' : 'group-hover:bg-[#1D9BF0]/10'} transition-colors`}>
                    <Bookmark size={18} className={isBookmarked ? 'fill-[#1D9BF0]' : ''} />
                  </div>
                </button>
                
                <button 
                  className="flex items-center hover:text-[#1D9BF0] transition-colors group"
                  onClick={() => onShare(post.id)}
                >
                  <div className="p-2 rounded-full group-hover:bg-[#1D9BF0]/10 transition-colors">
                    <Upload size={18} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Comment Modal */}
      <Dialog open={isCommentModalOpen} onOpenChange={setIsCommentModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center">
              <button onClick={() => setIsCommentModalOpen(false)} className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-800">
                <X size={20} />
              </button>
            </div>
            
            {/* Original tweet - simplified version */}
            <div className="mt-4 flex space-x-3">
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={avatarUrl} alt={userName} />
                  <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="font-bold text-sm">{userName}</span>
                  {verified && (
                    <Badge className="ml-1 bg-[#1D9BF0] text-white border-0 h-4 w-4 p-0 flex items-center justify-center rounded-full">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="white"/>
                      </svg>
                    </Badge>
                  )}
                  <span className="text-gray-500 ml-1">@{userHandle}</span>
                </div>
                <p className="text-gray-900 dark:text-gray-100 text-sm mt-1">{post.content}</p>
                
                <div className="text-gray-500 text-sm mt-2">
                  <span>Replying to </span>
                  <span className="text-[#1D9BF0]">@{userHandle}</span>
                </div>
              </div>
            </div>
            
            {/* Comment input */}
            <div className="mt-4 flex">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={character?.image} alt={character?.artistName} />
                <AvatarFallback>{character?.artistName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 flex flex-col">
                <Textarea
                  placeholder="Post your reply"
                  className="border-0 bg-transparent text-lg placeholder:text-gray-500 focus-visible:ring-0 px-0 h-20"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                
                <div className="flex justify-between items-center mt-2">
                  <div className="flex space-x-2 text-[#1D9BF0]">
                    <button className="p-1 rounded-full hover:bg-[#1D9BF0]/10">
                      <ImageIcon size={18} />
                    </button>
                    <button className="p-1 rounded-full hover:bg-[#1D9BF0]/10">
                      <Smile size={18} />
                    </button>
                    <button className="p-1 rounded-full hover:bg-[#1D9BF0]/10">
                      <Calendar size={18} />
                    </button>
                    <button className="p-1 rounded-full hover:bg-[#1D9BF0]/10">
                      <MapPin size={18} />
                    </button>
                  </div>
                  
                  <Button 
                    onClick={handleComment}
                    disabled={!commentText.trim()}
                    className="bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white rounded-full px-4"
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Trending Topic Component with updated design
interface TrendingTopicProps {
  category: string;
  name: string;
  tweetCount: number;
}

const TrendingTopic: React.FC<TrendingTopicProps> = ({ category, name, tweetCount }) => {
  return (
    <div className="py-3 px-4 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group">
      <div className="flex justify-between">
        <div>
          <p className="text-xs text-gray-500">{category}</p>
          <p className="font-bold text-sm mt-0.5">{name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{formatNumber(tweetCount)} {tweetCount === 1 ? 'post' : 'posts'}</p>
        </div>
        <button className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-900 hover:bg-[#1D9BF0]/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
};

// Follow Suggestion Component with updated design
interface FollowSuggestionProps {
  name: string;
  handle: string;
  avatar?: string;
  verified?: boolean;
  onFollow: () => void;
}

const FollowSuggestion: React.FC<FollowSuggestionProps> = ({ name, handle, avatar, verified = false, onFollow }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  
  const handleFollowClick = () => {
    setIsFollowing(!isFollowing);
    onFollow();
  };
  
  return (
    <div className="py-3 px-4 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
      <div className="flex items-center">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={avatar} alt={name} className="object-cover" />
          <AvatarFallback className="bg-gray-300 text-gray-600">{name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0 mr-2">
          <div className="flex items-center">
            <span className="font-bold text-sm text-gray-900 dark:text-white hover:underline truncate max-w-[120px]">{name}</span>
            {verified && (
              <Badge className="ml-0.5 bg-[#1D9BF0] text-white border-0 h-4 w-4 p-0 flex items-center justify-center rounded-full">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="white"/>
                </svg>
              </Badge>
            )}
          </div>
          <p className="text-gray-500 text-sm truncate">@{handle}</p>
        </div>
        
        <Button 
          size="sm" 
          className={isFollowing 
            ? "rounded-full bg-transparent text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 hover:border-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 px-4 min-w-[82px]" 
            : "rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 px-4 min-w-[82px]"
          }
          onClick={handleFollowClick}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      </div>
    </div>
  );
};

// Main Twitter Panel Component - fully updated to match X design
interface TwitterPanelProps {
  onBack?: () => void;
}

const TwitterPanel: React.FC<TwitterPanelProps> = ({ onBack }) => {
  const { character, postOnSocialMedia, socialMedia, socialMediaStats, aiRappers, currentWeek } = useRapperGame();
  const [postText, setPostText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mobilePostText, setMobilePostText] = useState("");
  const [mobileSelectedImage, setMobileSelectedImage] = useState<string | null>(null);
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [twitterPosts, setTwitterPosts] = useState<SocialMediaPost[]>([]);
  const [activeTab, setActiveTab] = useState('for-you');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);
  
  // Get Twitter data from store
  useEffect(() => {
    // Try to get posts from socialMediaStats first (new structure)
    const twitterPlatform = socialMedia.find(p => p.name === "Twitter");

    if (socialMediaStats?.twitter?.tweets) {
      setTwitterPosts(socialMediaStats.twitter.tweets);
    } else {
      // Fallback to looking at viralPosts in old structure
      if (twitterPlatform?.viralPosts) {
        setTwitterPosts(twitterPlatform.viralPosts);
      } else {
        // If no posts found, use empty array
        setTwitterPosts([]);
      }
    }
    
    // If there are few or no posts, generate AI content from trending topics/music industry
    if ((!socialMediaStats?.twitter?.tweets || socialMediaStats?.twitter?.tweets.length < 3) && 
        (!twitterPlatform?.viralPosts || twitterPlatform?.viralPosts.length < 3)) {
      generateAIContent();
    }
  }, [socialMedia, socialMediaStats]);
  
  // Generate AI-based content for the timeline
  const generateAIContent = () => {
    // Only generate if we have AI rappers data
    if (!aiRappers || aiRappers.length === 0) return;
    
    // Select a few random AI rappers
    const selectedRappers = aiRappers
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
      
    // Generate placeholder posts for them
    const aiGeneratedPosts: SocialMediaPost[] = selectedRappers.map((rapper, index) => {
      // Content topics based on rapper's style
      const topics = [
        `Just dropped a new track! Check out my latest ${rapper.style} vibes 🔥 #NewMusic`,
        `Studio session was fire today. Can't wait for y'all to hear this new heat 🎵 #StudioLife`,
        `Who should I collab with next? Drop names below 👇 #Collaboration`,
        `Tickets for my upcoming tour are selling fast! Get yours now 🎫 #TourLife`,
        `Blessed to have reached ${formatNumber(Math.floor(rapper.monthlyListeners / 10))} followers! Love y'all 🙏 #Grateful`,
        `That moment when the beat drops just right ✨ #ProducerLife`,
        `Working on something special with @${character?.artistName?.toLowerCase().replace(/\s+/g, '')} 👀 #ComingSoon`
      ];
      
      // Pick a random content topic
      const randomContent = topics[Math.floor(Math.random() * topics.length)];
      
      return {
        id: `ai-${rapper.id}-${Date.now()}-${index}`,
        platformName: "Twitter",
        content: randomContent,
        postWeek: Math.max(1, currentWeek - Math.floor(Math.random() * 3)),
        likes: Math.floor(rapper.popularity * 100 + Math.random() * 1000),
        comments: Math.floor(rapper.popularity * 20 + Math.random() * 100),
        shares: Math.floor(rapper.popularity * 30 + Math.random() * 200),
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
    setTwitterPosts(prevPosts => [...aiGeneratedPosts, ...prevPosts]);
  };

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

  const handlePost = () => {
    if (!postText.trim() && !selectedImage) return;
    
    setIsLoading(true);
    
    // Use the store's postOnSocialMedia method to post to Twitter
    postOnSocialMedia("Twitter", postText, selectedImage ? [selectedImage] : undefined);
    
    // Reset the input
    setPostText("");
    setSelectedImage(null);
    setIsLoading(false);
  };
  
  // Handle mobile image selection
  const handleMobileImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setMobileSelectedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  // Handle mobile post
  const handleMobilePost = () => {
    if (!mobilePostText.trim() && !mobileSelectedImage) return;
    
    setIsLoading(true);
    
    // Use the store's postOnSocialMedia method to post to Twitter
    postOnSocialMedia("Twitter", mobilePostText, mobileSelectedImage ? [mobileSelectedImage] : undefined);
    
    // Reset the input
    setMobilePostText("");
    setMobileSelectedImage(null);
    setIsLoading(false);
    
    // Close the mobile dialog
    setMobileDialogOpen(false);
  };

  // Go back to dashboard or social media hub
  const handleBackToDashboard = () => {
    if (onBack) {
      // Use the provided onBack function if available
      onBack();
    } else {
      // Otherwise navigate to social media hub
      useRapperGame.setState({ screen: 'social_media_hub' });
    }
  };
  
  // Actions for tweets with enhanced functionality
  const handleLike = (id: string) => {
    console.log(`Liked tweet: ${id}`);
    
    // Update state in local posts if found
    setTwitterPosts(prevPosts => 
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
    if (typeof toast !== 'undefined') {
      toast.success("Tweet liked!", {
        position: "bottom-center",
        duration: 1000,
        className: "bg-[#1D9BF0] text-white"
      });
    }
  };
  
  const handleRetweet = (id: string) => {
    console.log(`Retweeted: ${id}`);
    
    // Update state in local posts if found
    setTwitterPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === id) {
          // Toggle retweet state
          const retweeted = post.retweeted || false;
          return {
            ...post,
            shares: retweeted ? Math.max(0, post.shares - 1) : post.shares + 1,
            retweeted: !retweeted
          };
        }
        return post;
      })
    );
    
    // Show success notification
    if (typeof toast !== 'undefined') {
      toast.success("Tweet retweeted!", {
        position: "bottom-center",
        duration: 1500,
        description: "Your followers will see this tweet"
      });
    }
  };
  
  const handleComment = (id: string) => {
    console.log(`Comment on tweet: ${id}`);
    
    // Update state in local posts if found to increment comment count
    setTwitterPosts(prevPosts => 
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
    
    // Show success notification
    if (typeof toast !== 'undefined') {
      toast.success("Comment added!", {
        position: "bottom-center",
        duration: 1200
      });
    }
  };
  
  const handleShare = (id: string) => {
    console.log(`Share tweet: ${id}`);
    
    // Show success notification with share options
    if (typeof toast !== 'undefined') {
      toast.success("Tweet shared!", {
        position: "bottom-center",
        duration: 1500,
        description: "Shared via direct message"
      });
    }
  };
  
  const handleBookmark = (id: string) => {
    console.log(`Bookmarked tweet: ${id}`);
    
    // Update state in local posts if found
    setTwitterPosts(prevPosts => 
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
    if (typeof toast !== 'undefined') {
      toast.success("Tweet bookmarked!", {
        position: "bottom-center",
        duration: 1000
      });
    }
  };
  
  const handleFollow = () => {
    console.log('Follow button clicked');
    
    // For now just show a confirmation toast
    if (typeof toast !== 'undefined') {
      toast.success("User followed!", {
        position: "bottom-center",
        duration: 1500,
        description: "You'll see their tweets in your feed"
      });
    }
  };

  // Get trending topics based on game state
  const getTrendingTopics = () => {
    // If we have trends in social media stats, use those
    if (socialMediaStats?.twitter?.trends) {
      return socialMediaStats.twitter.trends.map(trend => ({
        category: trend.category,
        name: trend.name,
        tweetCount: trend.tweetCount
      }));
    }
    
    // Otherwise generate some defaults based on music industry
    return [
      { category: 'Music', name: '#NewMusicFriday', tweetCount: 125000 },
      { category: 'Entertainment', name: '#GrammyAwards', tweetCount: 85000 },
      { category: 'Music', name: '#HipHopAwards', tweetCount: 52000 },
      { category: 'Trending', name: '#TopCharts', tweetCount: 42000 },
      { category: 'Entertainment', name: '#MusicIndustry', tweetCount: 38000 },
      { category: 'Music', name: '#BillboardHot100', tweetCount: 35000 },
      { category: 'Trending', name: '#RapGame', tweetCount: 28000 },
      { category: 'Entertainment', name: '#StudioSession', tweetCount: 18000 },
      { category: 'Music', name: '#ProducerLife', tweetCount: 15000 },
      { category: 'Trending', name: '#MusicProducers', tweetCount: 12000 },
    ];
  };
  
  // Get follow suggestions based on AI rappers
  const getFollowSuggestions = () => {
    if (!aiRappers || aiRappers.length === 0) return [];
    
    // Take a few random AI rappers to suggest
    return aiRappers
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .map(rapper => ({
        name: rapper.name,
        handle: rapper.name.toLowerCase().replace(/\s+/g, ''),
        avatar: rapper.image,
        verified: rapper.popularity > 60
      }));
  };

  const trendingTopics = getTrendingTopics();
  const followSuggestions = getFollowSuggestions();
  
  // Get Twitter stats
  const twitterStats = socialMediaStats?.twitter || {
    followers: 0,
    handle: character?.artistName?.toLowerCase().replace(/\s+/g, '') || 'user'
  };

  return (
    <div className="h-full w-full flex flex-col bg-white dark:bg-black text-black dark:text-white">
      {/* Twitter Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
        <div className="flex items-center space-x-4 w-full">
          <Avatar className="h-8 w-8 md:hidden">
            <AvatarImage src={character?.image} alt={character?.artistName} />
            <AvatarFallback>{character?.artistName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 flex justify-center md:justify-start">
            <TwitterIcon className="h-6 w-6 text-[#1D9BF0]" />
          </div>
          
          {/* Menu for settings and sound options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden text-[#1D9BF0] p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <MoreHorizontal size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="flex items-center gap-2">
                <Settings size={16} />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Volume2 size={16} />
                <span>Sound</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2" onClick={handleBackToDashboard}>
                <ArrowLeft size={16} />
                <span>Back to Dashboard</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="ghost" 
            className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 hidden md:flex items-center gap-2"
            onClick={handleBackToDashboard}
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Button>
        </div>
      </div>

      {/* Twitter Feed Layout */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Sidebar - visible on larger screens */}
        <div className="hidden md:flex md:w-64 lg:w-72 border-r border-gray-200 dark:border-gray-800 flex-col p-2 h-full">
          <div className="flex flex-col space-y-1 mt-2">
            <button className="flex items-center space-x-4 px-4 py-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-lg font-bold"
              onClick={handleBackToDashboard}>
              <ArrowLeft className="h-6 w-6" />
              <span>Back to Dashboard</span>
            </button>
            <button className="flex items-center space-x-4 px-4 py-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-lg">
              <Search className="h-6 w-6" />
              <span>Explore</span>
            </button>
            <button className="flex items-center space-x-4 px-4 py-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-lg">
              <Bell className="h-6 w-6" />
              <span>Notifications</span>
            </button>
            <button className="flex items-center space-x-4 px-4 py-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-lg">
              <Mail className="h-6 w-6" />
              <span>Messages</span>
            </button>
            <button className="flex items-center space-x-4 px-4 py-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-lg">
              <Bookmark className="h-6 w-6" />
              <span>Bookmarks</span>
            </button>
            <button className="flex items-center space-x-4 px-4 py-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-lg">
              <User className="h-6 w-6" />
              <span>Profile</span>
            </button>
          </div>
          
          <div className="mt-4">
            <Button 
              onClick={handlePost}
              disabled={(!postText.trim() && !selectedImage) || isLoading}
              className="bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white rounded-full py-3 w-full text-lg"
            >
              Post
            </Button>
          </div>
          
          <div className="mt-auto mb-4">
            <div className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer">
              <Avatar className="h-10 w-10">
                <AvatarImage src={character?.image} alt={character?.artistName} />
                <AvatarFallback>{character?.artistName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{character?.artistName}</div>
                <div className="text-gray-500 text-sm truncate">@{character?.artistName?.toLowerCase().replace(/\s+/g, '')}</div>
              </div>
              <MoreHorizontal size={20} className="text-gray-500" />
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Tab navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-800 sticky top-[53px] bg-white/95 dark:bg-black/95 backdrop-blur-sm z-10">
            <button 
              className={`flex-1 py-4 text-center font-bold relative ${activeTab === 'for-you' ? 'text-black dark:text-white' : 'text-gray-500'}`}
              onClick={() => setActiveTab('for-you')}
            >
              For you
              {activeTab === 'for-you' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-full bg-[#1D9BF0]"></div>
              )}
            </button>
            <button 
              className={`flex-1 py-4 text-center font-bold relative ${activeTab === 'following' ? 'text-black dark:text-white' : 'text-gray-500'}`}
              onClick={() => setActiveTab('following')}
            >
              Following
              {activeTab === 'following' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 rounded-full bg-[#1D9BF0]"></div>
              )}
            </button>
          </div>
          
          {/* Compose Tweet */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={character?.image} alt={character?.artistName} />
                <AvatarFallback>{character?.artistName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <Input
                  placeholder="What's happening?"
                  className="border-0 bg-transparent text-xl placeholder:text-gray-500 focus-visible:ring-0 px-0 min-h-[56px]"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                />
                
                {selectedImage && (
                  <div className="mt-3 relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                    <img 
                      src={selectedImage} 
                      alt="Selected media" 
                      className="w-full max-h-80 object-contain"
                    />
                    <button 
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full h-8 w-8 flex items-center justify-center"
                      onClick={() => setSelectedImage(null)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-3">
                  <div className="flex space-x-2 text-[#1D9BF0]">
                    <button 
                      className="p-2 rounded-full hover:bg-[#1D9BF0]/10"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon size={18} />
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                    </button>
                    <button className="p-2 rounded-full hover:bg-[#1D9BF0]/10">
                      <Smile size={18} />
                    </button>
                    <button className="p-2 rounded-full hover:bg-[#1D9BF0]/10">
                      <Calendar size={18} />
                    </button>
                    <button className="p-2 rounded-full hover:bg-[#1D9BF0]/10">
                      <MapPin size={18} />
                    </button>
                  </div>
                  
                  <Button 
                    onClick={handlePost}
                    disabled={(!postText.trim() && !selectedImage) || isLoading}
                    className="bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white rounded-full px-5 font-bold"
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tweets Feed */}
          <div className="flex-1 overflow-y-auto">
            {twitterPosts.length > 0 ? (
              twitterPosts.map((post) => (
                <Tweet 
                  key={post.id}
                  post={post}
                  character={character}
                  onLike={handleLike}
                  onRetweet={handleRetweet}
                  onComment={handleComment}
                  onShare={handleShare}
                  onBookmark={handleBookmark}
                />
              ))
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center h-48">
                <TwitterIcon size={40} className="text-[#1D9BF0] mb-4" />
                <h3 className="text-xl font-bold mb-2">Welcome to X!</h3>
                <p className="text-gray-500 max-w-md">
                  This is the best place to see what's happening in your world. Find some people and topics to follow now.
                </p>
                <Button 
                  className="bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white rounded-full px-5 font-bold mt-6"
                  onClick={handlePost}
                >
                  Create your first post
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column (Search, Trends, Suggestions) */}
        <div className="hidden lg:block lg:w-[350px] xl:w-[390px] p-1 border-l border-gray-200 dark:border-gray-800 overflow-y-auto">
          {/* Search */}
          <div className="sticky top-0 pt-2 bg-white dark:bg-black z-10">
            <div className="relative mb-4 mx-2">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-500" />
              </div>
              <Input 
                placeholder="Search" 
                className="pl-10 bg-gray-100 dark:bg-gray-800 border-0 rounded-full focus-visible:ring-1 focus-visible:ring-[#1D9BF0]"
              />
            </div>
          </div>
          
          {/* Premium Subscription Banner */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl m-2 p-4 mb-4">
            <h2 className="font-bold text-xl mb-2">Subscribe to Premium</h2>
            <p className="text-sm mb-3">Subscribe to unlock new features and if eligible, receive a share of ad revenue.</p>
            <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-full font-bold">
              Subscribe
            </Button>
          </div>
          
          {/* Trends */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl m-2 overflow-hidden mb-4">
            <h2 className="font-bold text-xl p-4">Trends for you</h2>
            {trendingTopics.slice(0, 5).map((topic, i) => (
              <TrendingTopic 
                key={i}
                category={topic.category}
                name={topic.name}
                tweetCount={topic.tweetCount}
              />
            ))}
            <div className="p-4 text-[#1D9BF0] hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
              Show more
            </div>
          </div>
          
          {/* Who to follow */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl m-2 overflow-hidden mb-4">
            <h2 className="font-bold text-xl p-4">Who to follow</h2>
            {followSuggestions.slice(0, 3).map((suggestion, i) => (
              <FollowSuggestion 
                key={i}
                name={suggestion.name}
                handle={suggestion.handle}
                avatar={suggestion.avatar}
                verified={suggestion.verified}
                onFollow={handleFollow}
              />
            ))}
            <div className="p-4 text-[#1D9BF0] hover:bg-gray-200/50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
              Show more
            </div>
          </div>
          
          {/* Footer links */}
          <div className="p-4 text-xs text-gray-500 flex flex-wrap gap-1">
            <span className="hover:underline cursor-pointer mr-2">Terms of Service</span>
            <span className="hover:underline cursor-pointer mr-2">Privacy Policy</span>
            <span className="hover:underline cursor-pointer mr-2">Cookie Policy</span>
            <span className="hover:underline cursor-pointer mr-2">Accessibility</span>
            <span className="hover:underline cursor-pointer mr-2">Ads info</span>
            <span className="hover:underline cursor-pointer mr-2">More...</span>
            <span className="block mt-1">© 2025 X Corp.</span>
          </div>
        </div>
      </div>
      
      {/* Mobile Footer */}
      <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black py-2 px-6 flex justify-between items-center sticky bottom-0">
        <button className="p-2 flex flex-col items-center" onClick={handleBackToDashboard}>
          <ArrowLeft className="h-6 w-6" />
          <span className="text-[10px] mt-0.5">Back</span>
        </button>
        <button className="p-2">
          <Search className="h-6 w-6" />
        </button>
        <button className="p-2">
          <Bell className="h-6 w-6" />
        </button>
        <button className="p-2">
          <Mail className="h-6 w-6" />
        </button>
      </div>
      
      {/* Mobile floating post button */}
      <div className="md:hidden fixed bottom-20 right-4 z-10">
        <Dialog open={mobileDialogOpen} onOpenChange={setMobileDialogOpen}>
          <DialogTrigger asChild>
            <button 
              className="h-14 w-14 rounded-full bg-[#1D9BF0] text-white flex items-center justify-center shadow-lg hover:bg-[#1A8CD8] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] p-4">
            <div className="flex">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={character?.image} alt={character?.artistName} />
                <AvatarFallback>{character?.artistName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <Textarea
                  placeholder="What's happening?"
                  className="border-0 bg-transparent text-xl placeholder:text-gray-500 focus-visible:ring-0 px-0 min-h-[100px] resize-none"
                  value={mobilePostText}
                  onChange={(e) => setMobilePostText(e.target.value)}
                />
                
                {mobileSelectedImage && (
                  <div className="mt-3 relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                    <img 
                      src={mobileSelectedImage} 
                      alt="Selected media" 
                      className="w-full max-h-80 object-contain"
                    />
                    <button 
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full h-8 w-8 flex items-center justify-center"
                      onClick={() => setMobileSelectedImage(null)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-3">
                  <div className="flex space-x-2 text-[#1D9BF0]">
                    <button 
                      className="p-2 rounded-full hover:bg-[#1D9BF0]/10"
                      onClick={() => mobileFileInputRef.current?.click()}
                    >
                      <ImageIcon size={18} />
                      <input 
                        type="file" 
                        ref={mobileFileInputRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={handleMobileImageSelect}
                      />
                    </button>
                    <button className="p-2 rounded-full hover:bg-[#1D9BF0]/10">
                      <Smile size={18} />
                    </button>
                  </div>
                  
                  <Button 
                    onClick={handleMobilePost}
                    disabled={(!mobilePostText.trim() && !mobileSelectedImage) || isLoading}
                    className="bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white rounded-full px-5 font-bold"
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Add animation classes to tailwind
const style = document.createElement('style');
style.textContent = `
  @keyframes heartbeat {
    0% {
      transform: scale(1);
    }
    25% {
      transform: scale(1.1);
    }
    50% {
      transform: scale(1);
    }
    75% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }
  
  @keyframes spin-once {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  
  .animate-heartbeat {
    animation: heartbeat 0.8s ease-in-out forwards;
  }
  
  .animate-spin-once {
    animation: spin-once 0.5s ease-in-out forwards;
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

export default TwitterPanel;