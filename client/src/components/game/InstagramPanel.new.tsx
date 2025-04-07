import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { useAudio } from '@/lib/stores/useAudio';
import { Textarea } from '@/components/ui/textarea';
import { SocialMediaPost } from '@/lib/types';
import { 
  Home, 
  Search, 
  PlusSquare, 
  Heart, 
  Send, 
  Image as ImageIcon,
  MoreHorizontal,
  Bookmark,
  MessageCircle,
  Repeat,
  Instagram as InstagramIcon,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

interface InstagramPostProps {
  post: {
    id: string;
    username: string;
    userAvatar: string;
    verified: boolean;
    location?: string;
    content: string;
    image?: string;
    likes: number;
    comments: number;
    timestamp?: string;
  };
}

// Helper functions
const formatNumber = (num: number): string => {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Generate dynamic stories based on game state
const generateStories = (socialMediaStats: any) => {
  if (!socialMediaStats?.instagram?.followers) return [];
  
  // Generate stories from follower data or collaborators
  const followers = [
    { id: 1, username: "musiclover", avatar: "/assets/profiles/profile1.svg", viewed: false },
    { id: 2, username: "beatmaker", avatar: "/assets/profiles/profile2.svg", viewed: false },
    { id: 3, username: "rapfan", avatar: "/assets/profiles/profile3.svg", viewed: true },
    { id: 4, username: "producer", avatar: "/assets/profiles/profile4.svg", viewed: true },
    { id: 5, username: "recordlabel", avatar: "/assets/profiles/profile5.svg", viewed: false },
    { id: 6, username: "fanbase", avatar: "/assets/profiles/profile6.svg", viewed: false },
  ];
  
  // Return follower data
  return followers;
};

// Generate dynamic posts based on game state
const generatePosts = (socialMediaStats: any) => {
  if (!socialMediaStats?.instagram?.topPosts) {
    // Default posts when no data is available
    return [
      {
        id: "p1",
        username: "musiclover",
        userAvatar: "/assets/profiles/profile1.svg",
        verified: true,
        location: "Music Festival",
        content: "This beat is fire! 🔥 #newmusic #rapper",
        image: "/assets/covers/cover1.svg",
        likes: 1250,
        comments: 48,
        timestamp: "2h"
      },
      {
        id: "p2",
        username: "beatmaker",
        userAvatar: "/assets/profiles/profile2.svg",
        verified: false,
        content: "Just dropped a new beat pack! Check it out in my bio.",
        image: "/assets/covers/cover2.svg",
        likes: 843,
        comments: 32,
        timestamp: "5h"
      }
    ];
  }
  
  // Use real data when available
  return socialMediaStats.instagram.topPosts;
};

// Story circle component
const StoryCircle = ({ story }: { story: { id: number, username: string, avatar: string, viewed: boolean } }) => {
  return (
    <div className="flex flex-col items-center mr-4">
      <div className={`${story.viewed ? 'border-gray-300' : 'border-gradient-instagram'} p-[2px] rounded-full`}>
        <Avatar className="h-16 w-16 border-2 border-white">
          <AvatarImage src={story.avatar} alt={story.username} className="object-cover" />
          <AvatarFallback>{story.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
      <span className="text-xs mt-1 truncate w-16 text-center">{story.username}</span>
    </div>
  );
};

// Instagram post component
const InstagramPost = ({ post }: InstagramPostProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  return (
    <div className="mb-5 border-b border-gray-200 dark:border-gray-800 pb-3">
      {/* Post header */}
      <div className="flex items-center p-3">
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={post.userAvatar} alt={post.username} />
          <AvatarFallback>{post.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center">
            <span className="font-semibold text-sm">{post.username}</span>
            {post.verified && (
              <span className="ml-1 text-blue-500">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </div>
          {post.location && <span className="text-xs text-gray-500">{post.location}</span>}
        </div>
        <button className="text-gray-700 dark:text-gray-300">
          <MoreHorizontal size={20} />
        </button>
      </div>
      
      {/* Post image */}
      {post.image && (
        <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <img src={post.image} alt={`Post by ${post.username}`} className="max-h-full object-cover" />
        </div>
      )}
      
      {/* Post actions */}
      <div className="p-3">
        <div className="flex justify-between mb-2">
          <div className="flex space-x-4">
            <button 
              className={`${isLiked ? 'text-red-500' : 'text-black dark:text-white'}`}
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <button className="text-black dark:text-white">
              <MessageCircle size={24} />
            </button>
            <button className="text-black dark:text-white">
              <Send size={24} />
            </button>
          </div>
          <button 
            className={`${isSaved ? 'text-black dark:text-white' : 'text-black dark:text-white'}`}
            onClick={() => setIsSaved(!isSaved)}
          >
            <Bookmark size={24} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        {/* Likes */}
        <div className="text-sm font-semibold mb-1">{formatNumber(post.likes)} likes</div>
        
        {/* Caption */}
        <div className="text-sm mb-1">
          <span className="font-semibold mr-1">{post.username}</span>
          {post.content}
        </div>
        
        {/* Comments link */}
        <button className="text-gray-500 text-sm">
          View all {formatNumber(post.comments)} comments
        </button>
        
        {/* Timestamp */}
        {post.timestamp && (
          <div className="text-gray-500 text-xs mt-1">{post.timestamp}</div>
        )}
      </div>
    </div>
  );
};

// Create post dialog component
const CreatePostDialog = ({ onPost }: { onPost: (text: string, image?: string) => void }) => {
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
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
    onPost(postText, selectedImage || undefined);
    setPostText('');
    setSelectedImage(null);
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
        
        <Textarea
          placeholder="Write a caption..."
          value={postText}
          onChange={e => setPostText(e.target.value)}
          rows={4}
          className="w-full"
        />
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={!selectedImage}
          className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white"
        >
          Share
        </Button>
      </div>
    </div>
  );
};

// Profile tab component
const ProfileTab = () => {
  const character = useRapperGame(state => state.character);
  const socialMedia = useRapperGame(state => state.socialMedia);
  // Find Instagram data from social media array
  const instagramData = socialMedia.find(p => p.name === "Instagram");
  
  // Create profile stats object from available data
  const profileStats = {
    handle: character?.artistName?.toLowerCase() || "user",
    verified: true,
    followers: instagramData?.followers || 0,
    following: 154, // Dummy value for now
    posts: Array.isArray(instagramData?.posts) ? instagramData.posts : []
  };
  
  if (!profileStats || !instagramData) {
    return <div className="p-5 text-center text-gray-500">Profile data not available</div>;
  }
  
  return (
    <div className="pb-20">
      {/* Profile header */}
      <div className="p-4">
        <div className="flex">
          <div className="mr-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={character?.image} alt={character?.artistName} />
              <AvatarFallback>{character?.artistName?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2 mb-3">
              <h2 className="text-xl font-semibold">{profileStats.handle}</h2>
              {profileStats.verified && (
                <span className="text-blue-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </div>
            
            <div className="flex space-x-5 mb-3">
              <div className="text-center">
                <div className="font-semibold">{profileStats.posts.length}</div>
                <div className="text-xs text-gray-500">posts</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{formatNumber(profileStats.followers)}</div>
                <div className="text-xs text-gray-500">followers</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">154</div>
                <div className="text-xs text-gray-500">following</div>
              </div>
            </div>
            
            <div className="text-sm">
              <div className="font-semibold">{character?.artistName}</div>
              <div className="text-gray-600 dark:text-gray-400">Musician/Artist</div>
              <div>Check out my latest release! 🎵 #music #rapper</div>
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
      </div>
      
      {/* Post grid */}
      <div className="grid grid-cols-3 gap-1">
        {profileStats.posts.map((post: any, index: number) => (
          <div key={post.id || index} className="aspect-square bg-gray-100 dark:bg-gray-800">
            {post.image ? (
              <img src={post.image} alt={`Post ${index}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <ImageIcon size={24} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export function InstagramPanel() {
  const [activeFeed, setActiveFeed] = useState<"home" | "explore" | "create" | "reels" | "profile">("home");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const character = useRapperGame(state => state.character);
  const socialMedia = useRapperGame(state => state.socialMedia);
  const postOnSocialMedia = useRapperGame(state => state.postOnSocialMedia);
  const { playSuccess } = useAudio();
  
  // Post to Instagram through game state
  const handlePost = (text: string, image?: string) => {
    postOnSocialMedia("Instagram", text, image ? [image] : undefined);
    playSuccess?.();
    setShowCreatePost(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden bg-white text-black dark:bg-black dark:text-white">
      <div className="h-[600px] flex flex-col">
        {/* Instagram Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-1">
            <div className="text-xl font-semibold font-['Billabong', 'sans-serif'] transform scale-y-125">
              Instagram
            </div>
          </div>
          <div className="flex space-x-4">
            <button>
              <Heart size={24} />
            </button>
            <button>
              <MessageSquare size={24} />
            </button>
          </div>
        </div>
        
        <CardContent className="p-0 flex-1 overflow-hidden">
          {/* Instagram Content based on active tab */}
          {activeFeed === "home" && (
            <ScrollArea className="h-full">
              <div>
                {/* Stories */}
                <div className="px-4 pt-2 pb-2 border-b border-gray-200 dark:border-gray-800">
                  <div className="overflow-x-auto">
                    <div className="flex py-2 min-w-max">
                      {/* Your Story */}
                      <div className="flex flex-col items-center mr-4">
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
                      {generateStories(socialMedia).map((story: any) => (
                        <StoryCircle key={story.id} story={story} />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Feed Posts */}
                <div>
                  {generatePosts(socialMedia).map((post: any) => (
                    <InstagramPost key={post.id} post={post} />
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}
          
          {activeFeed === "profile" && (
            <ScrollArea className="h-full">
              <ProfileTab />
            </ScrollArea>
          )}
          
          {/* Create Post Dialog */}
          <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create new post</DialogTitle>
              </DialogHeader>
              <CreatePostDialog onPost={handlePost} />
            </DialogContent>
          </Dialog>
        </CardContent>
        
        {/* Instagram Bottom Navigation */}
        <div className="flex justify-between items-center px-8 py-4 border-t border-gray-200 dark:border-gray-800">
          <button onClick={() => setActiveFeed("home")} className={`${activeFeed === "home" ? "text-black dark:text-white" : "text-gray-500"}`}>
            <Home size={24} />
          </button>
          <button onClick={() => setActiveFeed("explore")} className={`${activeFeed === "explore" ? "text-black dark:text-white" : "text-gray-500"}`}>
            <Search size={24} />
          </button>
          <button onClick={() => setShowCreatePost(true)} className="text-black dark:text-white">
            <PlusSquare size={24} />
          </button>
          <button onClick={() => setActiveFeed("reels")} className={`${activeFeed === "reels" ? "text-black dark:text-white" : "text-gray-500"}`}>
            <ExternalLink size={24} />
          </button>
          <button onClick={() => setActiveFeed("profile")} className={`${activeFeed === "profile" ? "text-black dark:text-white" : "text-gray-500"}`}>
            <Avatar className="h-6 w-6">
              <AvatarImage src={character?.image} alt="Profile" className="object-cover" />
              <AvatarFallback>{character?.artistName?.charAt(0)}</AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>
    </Card>
  );
}