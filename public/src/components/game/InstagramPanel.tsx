import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { useAudio } from '@/lib/stores/useAudio';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, Image, SmilePlus, MapPin, ArrowUp, Send, Camera, Menu, Search, Home, Plus, Upload, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatNumber } from '@/lib/utils';

// Interface for post type
interface Post {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  content: {
    text: string;
    images: string[];
    location?: string;
    createdAt: Date;
  };
  engagement: {
    likes: number;
    comments: number;
    saved: boolean;
    liked: boolean;
  };
  comments?: {
    user: string;
    text: string;
    avatar: string;
  }[];
}

// Interface for story type
interface Story {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  seen: boolean;
}

// Story Component
const StoryCircle = ({ story }: { story: Story }) => {
  return (
    <div className="flex flex-col items-center mr-4">
      <div className={`rounded-full p-[2px] ${story.seen ? 'bg-gray-300' : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600'}`}>
        <Avatar className="h-16 w-16 border-2 border-white">
          <img src={story.user.avatar} alt={story.user.name} className="object-cover" />
        </Avatar>
      </div>
      <span className="text-xs mt-1 truncate w-16 text-center">{story.user.username}</span>
    </div>
  );
};

// Post Component
const InstagramPost = ({ post }: { post: Post }) => {
  const [liked, setLiked] = useState(post.engagement.liked);
  const [saved, setSaved] = useState(post.engagement.saved);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return `${Math.floor((now.getTime() - date.getTime()) / (1000 * 60))}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      return `${Math.floor(diffInHours / 24)}d`;
    }
  };

  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      {/* Post Header */}
      <div className="flex justify-between items-center px-4 py-2">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <img src={post.user.avatar} alt={post.user.name} className="object-cover" />
          </Avatar>
          <div>
            <div className="flex items-center">
              <span className="font-medium text-sm">{post.user.username}</span>
              {post.user.verified && (
                <Badge className="ml-1 h-4 w-4 bg-blue-500 p-0 flex items-center justify-center rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-white">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </Badge>
              )}
            </div>
            {post.content.location && (
              <span className="text-xs text-gray-500">{post.content.location}</span>
            )}
          </div>
        </div>
        <button className="text-gray-500">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Post Image */}
      <div className="relative">
        {post.content.images.length > 0 && (
          <img 
            src={post.content.images[0]} 
            alt="Post" 
            className="w-full object-cover" 
            style={{ maxHeight: '600px' }} 
          />
        )}
      </div>

      {/* Post Actions */}
      <div className="px-4 pt-2">
        <div className="flex justify-between">
          <div className="flex space-x-4">
            <button onClick={handleLike} className={liked ? "text-red-500" : "text-black"}>
              <Heart size={24} fill={liked ? "currentColor" : "none"} />
            </button>
            <button onClick={() => setShowComments(true)} className="text-black">
              <MessageCircle size={24} />
            </button>
            <button className="text-black">
              <Share2 size={24} />
            </button>
          </div>
          <button onClick={handleSave} className={saved ? "text-black" : "text-black"}>
            <Bookmark size={24} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Likes count */}
        <div className="mt-2">
          <span className="font-medium text-sm">{formatNumber(post.engagement.likes)} likes</span>
        </div>

        {/* Caption */}
        <div className="mt-1">
          <span className="text-sm">
            <span className="font-medium">{post.user.username}</span> {post.content.text}
          </span>
        </div>

        {/* Comments preview */}
        <button onClick={() => setShowComments(true)} className="text-gray-500 text-sm mt-1">
          View all {formatNumber(post.engagement.comments)} comments
        </button>

        {post.comments && post.comments.length > 0 && (
          <div className="mt-1">
            <div className="text-sm">
              <span className="font-medium">{post.comments[0].user}</span> {post.comments[0].text}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="mt-1">
          <span className="text-xs text-gray-500">{formatTimestamp(post.content.createdAt)}</span>
        </div>
      </div>

      {/* Comments dialog */}
      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogContent className="max-w-2xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          
          <div className="flex h-full">
            {/* Image on the left */}
            <div className="flex-1 hidden md:block bg-black flex items-center justify-center">
              {post.content.images.length > 0 && (
                <img 
                  src={post.content.images[0]} 
                  alt="Post" 
                  className="max-h-full max-w-full object-contain" 
                />
              )}
            </div>
            
            {/* Comments section on the right */}
            <div className="flex-1 flex flex-col h-full">
              {/* Post header */}
              <div className="flex items-center p-3 border-b">
                <Avatar className="h-8 w-8 mr-2">
                  <img src={post.user.avatar} alt={post.user.name} className="object-cover" />
                </Avatar>
                <span className="font-medium text-sm">{post.user.username}</span>
              </div>
              
              {/* Comments scroll area */}
              <ScrollArea className="flex-1 px-3 py-2">
                {/* Original post as a comment */}
                <div className="flex mb-4">
                  <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                    <img src={post.user.avatar} alt={post.user.name} className="object-cover" />
                  </Avatar>
                  <div>
                    <div className="text-sm">
                      <span className="font-medium">{post.user.username}</span> {post.content.text}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{formatTimestamp(post.content.createdAt)}</div>
                  </div>
                </div>
                
                {/* Actual comments */}
                {post.comments && post.comments.map((comment, index) => (
                  <div key={index} className="flex mb-4">
                    <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                      <img src={comment.avatar} alt={comment.user} className="object-cover" />
                    </Avatar>
                    <div>
                      <div className="text-sm">
                        <span className="font-medium">{comment.user}</span> {comment.text}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">2h</div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
              
              {/* Like section */}
              <div className="px-3 py-2 border-t">
                <div className="flex space-x-4 mb-2">
                  <button onClick={handleLike} className={liked ? "text-red-500" : "text-black"}>
                    <Heart size={24} fill={liked ? "currentColor" : "none"} />
                  </button>
                  <button className="text-black">
                    <MessageCircle size={24} />
                  </button>
                  <button className="text-black">
                    <Share2 size={24} />
                  </button>
                </div>
                <div className="font-medium text-sm">{formatNumber(post.engagement.likes)} likes</div>
                <div className="text-xs text-gray-500">{formatTimestamp(post.content.createdAt)}</div>
              </div>
              
              {/* Add comment */}
              <div className="px-3 py-2 border-t flex items-center">
                <SmilePlus size={24} className="text-gray-500 mr-2" />
                <input 
                  type="text" 
                  placeholder="Add a comment..." 
                  className="flex-1 border-none outline-none text-sm"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`text-blue-500 font-medium ${!commentText.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!commentText.trim()}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Create Post Dialog Component
const CreatePostDialog = ({ onPost }: { onPost: (text: string, image?: string) => void }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handlePost = () => {
    onPost(text, image || undefined);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        {image ? (
          <div className="relative">
            <img src={image} alt="Upload preview" className="w-full h-64 object-cover rounded-md" />
            <Button 
              variant="destructive" 
              size="sm" 
              className="absolute top-2 right-2 rounded-full h-8 w-8 p-0"
              onClick={() => setImage(null)}
            >
              ✕
            </Button>
          </div>
        ) : (
          <div 
            className="w-full h-64 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer bg-gray-50"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera size={48} className="text-gray-400" />
            <p className="text-gray-500 mt-2">Add a photo to your post</p>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageUpload} 
        />
      </div>

      <Textarea 
        placeholder="Write a caption..." 
        value={text} 
        onChange={(e) => setText(e.target.value)}
        className="min-h-[120px]"
      />

      <div className="flex items-center">
        <MapPin size={20} className="text-gray-500 mr-2" />
        <span className="text-sm text-gray-700">Add location</span>
      </div>

      <DialogFooter>
        <Button 
          className="w-full"
          onClick={handlePost}
          disabled={(!text.trim() && !image)}
        >
          Share
        </Button>
      </DialogFooter>
    </div>
  );
};

// Profile Tab Component
const ProfileTab = () => {
  const character = useRapperGame(state => state.character);
  const socialMedia = useRapperGame(state => state.socialMedia);
  
  // Find Instagram platform data
  const instagramData = socialMedia.find(platform => platform.name === "Instagram");

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center w-full px-4 py-4">
        <div className="flex w-full items-center">
          <Avatar className="h-20 w-20 border-2 border-white">
            <img src={character?.image || "https://placekitten.com/200/200"} alt="Profile" className="object-cover" />
          </Avatar>
          
          <div className="flex-1 ml-8">
            <div className="grid grid-cols-3 text-center">
              <div>
                <div className="font-semibold">{dummyPosts.length}</div>
                <div className="text-sm text-gray-500">Posts</div>
              </div>
              <div>
                <div className="font-semibold">{formatNumber(instagramData?.followers || 0)}</div>
                <div className="text-sm text-gray-500">Followers</div>
              </div>
              <div>
                <div className="font-semibold">521</div>
                <div className="text-sm text-gray-500">Following</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full mt-4">
          <h2 className="font-semibold">{character?.artistName || "Your Artist Name"}</h2>
          <p className="text-sm text-gray-500">Musician/Band</p>
          <p className="text-sm mt-1">{character?.about || "No bio yet"}</p>
        </div>
        
        <Button className="w-full mt-4" variant="outline">Edit Profile</Button>
      </div>
      
      {/* Post Grid */}
      <div className="grid grid-cols-3 gap-1 w-full mt-4">
        {dummyPosts.map((post, index) => (
          <div key={index} className="aspect-square">
            <img src={post.content.images[0]} alt="Post" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Dummy data for the Instagram panel
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const dummyStories: Story[] = [
  {
    id: "s1",
    user: {
      id: "u1",
      name: "Drake",
      username: "champagnepapi",
      avatar: "https://i.pravatar.cc/150?img=65"
    },
    seen: false
  },
  {
    id: "s2",
    user: {
      id: "u2",
      name: "Kendrick Lamar",
      username: "kendricklamar",
      avatar: "https://i.pravatar.cc/150?img=68"
    },
    seen: false
  },
  {
    id: "s3",
    user: {
      id: "u3",
      name: "Megan Thee Stallion",
      username: "theestallion",
      avatar: "https://i.pravatar.cc/150?img=5"
    },
    seen: true
  },
  {
    id: "s4",
    user: {
      id: "u4",
      name: "Tyler The Creator",
      username: "feliciathegoat",
      avatar: "https://i.pravatar.cc/150?img=8"
    },
    seen: true
  },
  {
    id: "s5",
    user: {
      id: "u5",
      name: "Billie Eilish",
      username: "billieeilish",
      avatar: "https://i.pravatar.cc/150?img=9"
    },
    seen: false
  }
];

const dummyPosts: Post[] = [
  {
    id: "p1",
    user: {
      id: "u1",
      name: "Drake",
      username: "champagnepapi",
      avatar: "https://i.pravatar.cc/150?img=65",
      verified: true
    },
    content: {
      text: "New studio session 🔥 #comingsoon",
      images: ["https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2058&auto=format&fit=crop"],
      location: "Toronto, Canada",
      createdAt: randomDate(new Date(Date.now() - 86400000 * 2), new Date())
    },
    engagement: {
      likes: 1243897,
      comments: 24893,
      saved: false,
      liked: false
    },
    comments: [
      {
        user: "liltunechi",
        text: "Let's collab again soon 🙌",
        avatar: "https://i.pravatar.cc/150?img=67"
      },
      {
        user: "future",
        text: "🔥🔥🔥",
        avatar: "https://i.pravatar.cc/150?img=69"
      }
    ]
  },
  {
    id: "p2",
    user: {
      id: "u2",
      name: "Kendrick Lamar",
      username: "kendricklamar",
      avatar: "https://i.pravatar.cc/150?img=68",
      verified: true
    },
    content: {
      text: "Real ones know. Album dropping soon.",
      images: ["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop"],
      createdAt: randomDate(new Date(Date.now() - 86400000 * 5), new Date())
    },
    engagement: {
      likes: 876543,
      comments: 12983,
      saved: false,
      liked: true
    },
    comments: [
      {
        user: "sza",
        text: "Can't wait! 🔥",
        avatar: "https://i.pravatar.cc/150?img=3"
      }
    ]
  },
  {
    id: "p3",
    user: {
      id: "u3",
      name: "Megan Thee Stallion",
      username: "theestallion",
      avatar: "https://i.pravatar.cc/150?img=5",
      verified: true
    },
    content: {
      text: "Hot girl summer never ends 💅🔥 #savage",
      images: ["https://images.unsplash.com/photo-1604256913043-22dada5c1260?q=80&w=1974&auto=format&fit=crop"],
      location: "Houston, TX",
      createdAt: randomDate(new Date(Date.now() - 86400000), new Date())
    },
    engagement: {
      likes: 543982,
      comments: 8732,
      saved: true,
      liked: true
    },
    comments: [
      {
        user: "beyonce",
        text: "Periodt! 👑",
        avatar: "https://i.pravatar.cc/150?img=7"
      }
    ]
  }
];

// Main Instagram Panel Component
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
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      <div className="bg-white text-black">
        {/* Instagram Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="text-xl font-semibold" style={{ fontFamily: 'Billabong, sans-serif' }}>
            Instagram
          </div>
          <div className="flex space-x-4">
            <button className="text-black">
              <Heart size={24} />
            </button>
            <button className="text-black">
              <MessageCircle size={24} />
            </button>
          </div>
        </div>
        
        <CardContent className="p-0">
          {/* Instagram Content based on active tab */}
          {activeFeed === "home" && (
            <div>
              {/* Stories */}
              <div className="px-4 pt-2 pb-2 border-b">
                <div className="overflow-x-auto">
                  <div className="flex py-2 min-w-max">
                    {/* Your Story */}
                    <div className="flex flex-col items-center mr-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16 border-2 border-white">
                          <img src={character?.image || "https://placekitten.com/200/200"} alt="Your Story" className="object-cover" />
                        </Avatar>
                        <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
                          <Plus size={16} />
                        </div>
                      </div>
                      <span className="text-xs mt-1">Your Story</span>
                    </div>
                    
                    {/* Other Stories */}
                    {dummyStories.map(story => (
                      <StoryCircle key={story.id} story={story} />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Feed Posts */}
              <div>
                {dummyPosts.map(post => (
                  <InstagramPost key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}
          
          {activeFeed === "profile" && <ProfileTab />}
          
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
        <div className="flex justify-between items-center px-6 py-3 border-t">
          <button onClick={() => setActiveFeed("home")} className={`${activeFeed === "home" ? "text-black" : "text-gray-500"}`}>
            <Home size={24} />
          </button>
          <button onClick={() => setActiveFeed("explore")} className={`${activeFeed === "explore" ? "text-black" : "text-gray-500"}`}>
            <Search size={24} />
          </button>
          <button onClick={() => setShowCreatePost(true)} className="text-black">
            <Plus size={28} className="border-2 border-black rounded" />
          </button>
          <button onClick={() => setActiveFeed("reels")} className={`${activeFeed === "reels" ? "text-black" : "text-gray-500"}`}>
            <Upload size={24} />
          </button>
          <button onClick={() => setActiveFeed("profile")} className={`${activeFeed === "profile" ? "text-black" : "text-gray-500"}`}>
            <Avatar className="h-6 w-6">
              <img src={character?.image || "https://placekitten.com/200/200"} alt="Profile" className="object-cover" />
            </Avatar>
          </button>
        </div>
      </div>
    </Card>
  );
}