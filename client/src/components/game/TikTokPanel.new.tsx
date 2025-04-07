import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { useAudio } from '@/lib/stores/useAudio';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark, 
  Home,
  Search,
  PlusSquare,
  MessageSquare,
  User,
  Music,
  Upload,
  Clock,
  PlaySquare
} from 'lucide-react';

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

// TikTok video component
const TikTokVideo = ({ 
  video 
}: { 
  video: { 
    id: string;
    username: string;
    userAvatar: string;
    verified: boolean;
    description: string;
    songName: string;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    imagePreview: string;
  } 
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  return (
    <div className="relative h-full w-full">
      {/* Video content (represented with an image in this simulation) */}
      <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
        <img src={video.imagePreview} alt="Video preview" className="h-full w-full object-cover" />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-black/50 flex items-center justify-center text-white">
            <PlaySquare size={32} />
          </div>
        </div>
      </div>
      
      {/* Video info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        {/* Creator info */}
        <div className="flex items-center mb-3">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={video.userAvatar} alt={video.username} />
            <AvatarFallback>{video.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="ml-2">
            <div className="flex items-center">
              <span className="font-semibold">@{video.username}</span>
              {video.verified && (
                <span className="ml-1 text-blue-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </div>
            <Button size="sm" variant="outline" className="h-7 mt-1 text-xs text-white border-white hover:bg-white/20 hover:text-white">
              Follow
            </Button>
          </div>
        </div>
        
        {/* Video description */}
        <p className="mb-2 text-sm">{video.description}</p>
        
        {/* Song info */}
        <div className="flex items-center mb-3">
          <Music size={14} className="mr-2" />
          <p className="text-xs font-medium">
            {video.songName}
          </p>
        </div>
      </div>
      
      {/* Interaction buttons */}
      <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center">
          <button 
            className="h-10 w-10 bg-gray-900/30 backdrop-blur-sm rounded-full flex items-center justify-center"
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart size={24} className={isLiked ? "text-red-500" : "text-white"} fill={isLiked ? "currentColor" : "none"} />
          </button>
          <span className="text-white text-xs mt-1">{formatNumber(isLiked ? video.likes + 1 : video.likes)}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <button className="h-10 w-10 bg-gray-900/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <MessageCircle size={24} className="text-white" />
          </button>
          <span className="text-white text-xs mt-1">{formatNumber(video.comments)}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <button 
            className="h-10 w-10 bg-gray-900/30 backdrop-blur-sm rounded-full flex items-center justify-center"
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            <Bookmark size={24} className="text-white" fill={isBookmarked ? "white" : "none"} />
          </button>
          <span className="text-white text-xs mt-1">{formatNumber(isBookmarked ? video.saves + 1 : video.saves)}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <button className="h-10 w-10 bg-gray-900/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Share size={24} className="text-white" />
          </button>
          <span className="text-white text-xs mt-1">{formatNumber(video.shares)}</span>
        </div>
      </div>
    </div>
  );
};

// Post dialog component
const CreateVideoDialog = ({ onPost }: { onPost: (text: string) => void }) => {
  const [description, setDescription] = useState('');
  
  const handleSubmit = () => {
    if (description.trim()) {
      onPost(description);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex items-center justify-center aspect-[9/16] mb-4">
        <div className="text-center">
          <Upload size={48} className="mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-500 mb-2">Upload a video</p>
          <p className="text-xs text-gray-400">In a real app, this would let you record or upload a video</p>
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium mb-1 block">Description</label>
        <Textarea
          placeholder="Describe your video..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-500">
          <Clock size={16} className="mr-1" />
          <span>Max 60s</span>
        </div>
        
        <Button onClick={handleSubmit} className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white">
          Post
        </Button>
      </div>
    </div>
  );
};

// Sample videos for the feed
const sampleVideos = [
  {
    id: "v1",
    username: "rapstar",
    userAvatar: "/public/assets/profiles/profile1.svg",
    verified: true,
    description: "Check out my latest freestyle 🔥 #rap #newmusic #hiphop",
    songName: "Original Sound - rapstar",
    likes: 125000,
    comments: 4800,
    shares: 21500,
    saves: 18700,
    imagePreview: "/public/assets/covers/cover3.svg"
  },
  {
    id: "v2",
    username: "producerlife",
    userAvatar: "/public/assets/profiles/profile2.svg",
    verified: false,
    description: "Making beats in the studio 🎧 #producer #beats #studio",
    songName: "BeatMaker Mix - producerlife",
    likes: 87500,
    comments: 2300,
    shares: 12700,
    saves: 9500,
    imagePreview: "/public/assets/covers/cover4.svg"
  }
];

export function TikTokPanel() {
  const [activeTab, setActiveTab] = useState<"home" | "discover" | "create" | "inbox" | "profile">("home");
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const character = useRapperGame(state => state.character);
  const socialMedia = useRapperGame(state => state.socialMedia);
  const postOnSocialMedia = useRapperGame(state => state.postOnSocialMedia);
  const { playSuccess } = useAudio();
  
  // Handle post to TikTok through game state
  const handlePost = (text: string) => {
    postOnSocialMedia("TikTok", text, []);
    playSuccess?.();
    setShowCreateDialog(false);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden dark:bg-black bg-white h-[600px] relative">
      <CardContent className="p-0 h-full">
        {/* Main content area */}
        {activeTab === "home" && (
          <div className="relative h-full">
            {/* TikTok video display */}
            <div className="h-full w-full">
              <TikTokVideo video={sampleVideos[activeVideoIndex]} />
            </div>
            
            {/* Video navigation controls */}
            <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white rounded-full bg-black/20 hover:bg-black/40"
                onClick={() => setActiveVideoIndex(Math.max(0, activeVideoIndex - 1))}
                disabled={activeVideoIndex === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </Button>
            </div>
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white rounded-full bg-black/20 hover:bg-black/40"
                onClick={() => setActiveVideoIndex(Math.min(sampleVideos.length - 1, activeVideoIndex + 1))}
                disabled={activeVideoIndex === sampleVideos.length - 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </Button>
            </div>
            
            {/* Top navigation */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between">
              <button className="text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <div className="space-x-2">
                <button className="text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </button>
                <button className="text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1"/>
                    <circle cx="19" cy="12" r="1"/>
                    <circle cx="5" cy="12" r="1"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <ScrollArea className="h-full">
            <div className="p-4">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-20 w-20 mb-3">
                  <AvatarImage src={character?.image} alt={character?.artistName} />
                  <AvatarFallback>{character?.artistName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-bold mb-1">@{character?.artistName?.toLowerCase().replace(/\s+/g, '_')}</h2>
                
                <div className="flex items-center space-x-6 my-3">
                  <div className="text-center">
                    <div className="font-bold">
                      {formatNumber(socialMedia.find(p => p.name === "TikTok")?.followers || 0)}
                    </div>
                    <div className="text-xs text-gray-500">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">200</div>
                    <div className="text-xs text-gray-500">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">
                      {formatNumber(socialMedia.find(p => p.name === "TikTok")?.posts || 0)}
                    </div>
                    <div className="text-xs text-gray-500">Likes</div>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-2 w-full">
                  <Button className="flex-1" variant="outline">Edit profile</Button>
                  <Button className="flex-1" variant="outline">Share profile</Button>
                </div>
              </div>
              
              <div className="border-b border-gray-200 dark:border-gray-800">
                <div className="flex">
                  <button className="flex-1 text-center py-3 border-b-2 border-black dark:border-white font-medium">
                    Videos
                  </button>
                  <button className="flex-1 text-center py-3 text-gray-500">
                    Liked
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-1 mt-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="aspect-[9/16] bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                    <PlaySquare size={24} className="text-gray-500" />
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
        
        {/* Create Video Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a video</DialogTitle>
            </DialogHeader>
            <CreateVideoDialog onPost={handlePost} />
          </DialogContent>
        </Dialog>
      </CardContent>
      
      {/* Bottom navigation bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black p-3 flex justify-around">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center ${activeTab === "home" ? "text-white" : "text-gray-400"}`}
        >
          <Home size={24} />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button
          onClick={() => setActiveTab("discover")}
          className={`flex flex-col items-center ${activeTab === "discover" ? "text-white" : "text-gray-400"}`}
        >
          <Search size={24} />
          <span className="text-xs mt-1">Discover</span>
        </button>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex flex-col items-center text-white bg-black"
        >
          <div className="w-12 h-8 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[#25F4EE] rounded-l-md" style={{ width: '50%' }}></div>
            <div className="absolute inset-0 bg-[#FE2C55] rounded-r-md ml-6" style={{ width: '50%' }}></div>
            <PlusSquare size={20} className="relative z-10" />
          </div>
        </button>
        <button
          onClick={() => setActiveTab("inbox")}
          className={`flex flex-col items-center ${activeTab === "inbox" ? "text-white" : "text-gray-400"}`}
        >
          <MessageSquare size={24} />
          <span className="text-xs mt-1">Inbox</span>
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center ${activeTab === "profile" ? "text-white" : "text-gray-400"}`}
        >
          <User size={24} />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </Card>
  );
}