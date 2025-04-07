import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { useAudio } from '@/lib/stores/useAudio';
import { Heart, MessageCircle, Repeat2, Share2, MoreHorizontal, Image, MapPin, Smile, Calendar, BarChart2, Home, Search, Bell, Mail, User, Check, Pin, Sparkles, Bookmark, Verified, Settings, HelpCircle, ArrowLeft, HelpCircleIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatNumber, formatMoney } from '@/lib/utils';

// Interface for tweet type
interface Tweet {
  id: string;
  user: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
  };
  content: {
    text: string;
    images?: string[];
    quoteTweet?: Tweet;
    createdAt: Date;
  };
  engagement: {
    likes: number;
    retweets: number;
    replies: number;
    liked: boolean;
    retweeted: boolean;
  };
  isRetweet?: {
    user: {
      name: string;
      handle: string;
    };
  };
  isPinned?: boolean;
}

// Format timestamp similar to Twitter
const formatTimestamp = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h`;
  } else {
    // Format like "Jun 15" or if current year is different, include year "Jun 15, 2022"
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric'
    };
    
    if (date.getFullYear() !== now.getFullYear()) {
      options.year = 'numeric';
    }
    
    return date.toLocaleDateString('en-US', options);
  }
};

// Tweet Component
const TweetComponent = ({ tweet, showTwitterThreadLine = false }: { tweet: Tweet, showTwitterThreadLine?: boolean }) => {
  const [liked, setLiked] = useState(tweet.engagement.liked);
  const [retweeted, setRetweeted] = useState(tweet.engagement.retweeted);
  
  // Calculate like & retweet counts with current state
  const likeCount = liked 
    ? (tweet.engagement.liked ? tweet.engagement.likes : tweet.engagement.likes + 1)
    : (tweet.engagement.liked ? tweet.engagement.likes - 1 : tweet.engagement.likes);
    
  const retweetCount = retweeted
    ? (tweet.engagement.retweeted ? tweet.engagement.retweets : tweet.engagement.retweets + 1)
    : (tweet.engagement.retweeted ? tweet.engagement.retweets - 1 : tweet.engagement.retweets);

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleRetweet = () => {
    setRetweeted(!retweeted);
  };

  return (
    <div className={`border-b border-gray-200 px-4 py-3 ${showTwitterThreadLine ? 'relative ml-6' : ''}`}>
      {/* Twitter thread line */}
      {showTwitterThreadLine && (
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" style={{ left: '-8px', top: '24px', bottom: 0 }}></div>
      )}
      
      {/* Retweet indicator */}
      {tweet.isRetweet && (
        <div className="flex items-center text-gray-500 text-xs mb-1 ml-12">
          <Repeat2 size={14} className="mr-2" />
          <span>{tweet.isRetweet.user.name} Retweeted</span>
        </div>
      )}
      
      {/* Pinned tweet indicator */}
      {tweet.isPinned && (
        <div className="flex items-center text-gray-500 text-xs mb-1 ml-12">
          <Pin size={14} className="mr-2" />
          <span>Pinned Tweet</span>
        </div>
      )}
      
      {/* Main tweet content */}
      <div className="flex">
        {/* User avatar */}
        <div className="mr-3 flex-shrink-0">
          <Avatar className="h-12 w-12">
            <img src={tweet.user.avatar} alt={tweet.user.name} className="object-cover" />
          </Avatar>
        </div>
        
        {/* Tweet content */}
        <div className="flex-1 min-w-0">
          {/* User info and timestamp */}
          <div className="flex items-center mb-1">
            <span className="font-bold truncate">{tweet.user.name}</span>
            {tweet.user.verified && (
              <Badge className="ml-1 h-4 w-4 bg-blue-500 p-0 flex items-center justify-center rounded-full">
                <Check className="h-3 w-3 text-white" />
              </Badge>
            )}
            <span className="ml-1 text-gray-500 truncate">@{tweet.user.handle}</span>
            <span className="mx-1 text-gray-500">·</span>
            <span className="text-gray-500">{formatTimestamp(tweet.content.createdAt)}</span>
            <button className="ml-auto text-gray-500">
              <MoreHorizontal size={18} />
            </button>
          </div>
          
          {/* Tweet text */}
          <div className="mb-2 whitespace-pre-wrap">
            {tweet.content.text}
          </div>
          
          {/* Tweet images grid */}
          {tweet.content.images && tweet.content.images.length > 0 && (
            <div className={`grid gap-2 mb-2 ${
              tweet.content.images.length === 1 ? 'grid-cols-1' : 
              tweet.content.images.length === 2 ? 'grid-cols-2' : 
              tweet.content.images.length === 3 ? 'grid-cols-2' : 
              'grid-cols-2'
            }`}>
              {tweet.content.images.map((img, index) => (
                <div 
                  key={index} 
                  className={`overflow-hidden rounded-xl ${
                    tweet.content.images!.length === 3 && index === 0 ? 'row-span-2' : ''
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`Tweet image ${index + 1}`} 
                    className="w-full h-full object-cover"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Quote tweet */}
          {tweet.content.quoteTweet && (
            <div className="border border-gray-200 rounded-xl p-3 mb-2">
              <div className="flex items-center mb-1">
                <Avatar className="h-5 w-5 mr-2">
                  <img src={tweet.content.quoteTweet.user.avatar} alt={tweet.content.quoteTweet.user.name} className="object-cover" />
                </Avatar>
                <span className="font-bold text-sm">{tweet.content.quoteTweet.user.name}</span>
                {tweet.content.quoteTweet.user.verified && (
                  <Badge className="ml-1 h-3 w-3 bg-blue-500 p-0 flex items-center justify-center rounded-full">
                    <Check className="h-2 w-2 text-white" />
                  </Badge>
                )}
                <span className="ml-1 text-gray-500 text-sm">@{tweet.content.quoteTweet.user.handle}</span>
                <span className="mx-1 text-gray-500 text-sm">·</span>
                <span className="text-gray-500 text-sm">{formatTimestamp(tweet.content.quoteTweet.content.createdAt)}</span>
              </div>
              <div className="text-sm">{tweet.content.quoteTweet.content.text}</div>
            </div>
          )}
          
          {/* Engagement buttons */}
          <div className="flex justify-between mt-3 text-gray-500">
            <button className="flex items-center hover:text-blue-500 group">
              <div className="p-2 rounded-full group-hover:bg-blue-50">
                <MessageCircle size={18} />
              </div>
              {tweet.engagement.replies > 0 && <span className="ml-1 text-sm">{formatNumber(tweet.engagement.replies)}</span>}
            </button>
            
            <button 
              className={`flex items-center ${retweeted ? 'text-green-500' : 'hover:text-green-500 group'}`}
              onClick={handleRetweet}
            >
              <div className={`p-2 rounded-full ${retweeted ? 'bg-green-50' : 'group-hover:bg-green-50'}`}>
                <Repeat2 size={18} />
              </div>
              {retweetCount > 0 && <span className="ml-1 text-sm">{formatNumber(retweetCount)}</span>}
            </button>
            
            <button 
              className={`flex items-center ${liked ? 'text-pink-600' : 'hover:text-pink-600 group'}`}
              onClick={handleLike}
            >
              <div className={`p-2 rounded-full ${liked ? 'bg-pink-50' : 'group-hover:bg-pink-50'}`}>
                <Heart size={18} fill={liked ? "currentColor" : "none"} />
              </div>
              {likeCount > 0 && <span className="ml-1 text-sm">{formatNumber(likeCount)}</span>}
            </button>
            
            <button className="flex items-center hover:text-blue-500 group">
              <div className="p-2 rounded-full group-hover:bg-blue-50">
                <Share2 size={18} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Tweet Dialog Component
const CreateTweetDialog = ({ onTweet, onClose }: { onTweet: (text: string, images?: string[]) => void, onClose: () => void }) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const character = useRapperGame(state => state.character);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages([...images, event.target.result as string]);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleTweet = () => {
    onTweet(text, images.length > 0 ? images : undefined);
    setText('');
    setImages([]);
  };

  return (
    <div className="p-4">
      <div className="flex">
        <Avatar className="h-12 w-12 mr-3">
          <img 
            src={character?.image || "https://placekitten.com/200/200"} 
            alt="Profile" 
            className="object-cover" 
          />
        </Avatar>
        
        <div className="flex-1">
          <Textarea
            placeholder="What's happening?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[100px] border-none shadow-none resize-none text-xl placeholder:text-gray-500 focus-visible:ring-0"
          />
          
          {/* Image preview */}
          {images.length > 0 && (
            <div className={`grid gap-2 mb-3 ${
              images.length === 1 ? 'grid-cols-1' : 
              images.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'
            }`}>
              {images.map((img, index) => (
                <div key={index} className="relative rounded-xl overflow-hidden">
                  <img src={img} alt={`Upload ${index + 1}`} className="w-full object-cover h-32" />
                  <button 
                    className="absolute top-1 right-1 bg-black bg-opacity-70 text-white rounded-full h-6 w-6 flex items-center justify-center"
                    onClick={() => removeImage(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
            <div className="flex space-x-1">
              <button 
                className="text-blue-500 p-2 rounded-full hover:bg-blue-50"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image size={20} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
              
              <button className="text-blue-500 p-2 rounded-full hover:bg-blue-50">
                <Smile size={20} />
              </button>
              
              <button className="text-blue-500 p-2 rounded-full hover:bg-blue-50">
                <Calendar size={20} />
              </button>
              
              <button className="text-blue-500 p-2 rounded-full hover:bg-blue-50">
                <MapPin size={20} />
              </button>
            </div>
            
            <Button 
              className="rounded-full px-4 py-1 h-9"
              disabled={!text.trim()}
              onClick={handleTweet}
            >
              Tweet
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Tab Component
const ProfileTab = () => {
  const character = useRapperGame(state => state.character);
  const socialMedia = useRapperGame(state => state.socialMedia);
  
  // Find Twitter platform data
  const twitterData = socialMedia.find(platform => platform.name === "Twitter");

  // Sample profile tweets (would come from game state)
  const profileTweets = dummyTweets.filter(tweet => tweet.user.handle === character?.artistName?.toLowerCase() || tweet.user.handle === "yourhandle");

  return (
    <div>
      {/* Profile header */}
      <div className="relative">
        {/* Banner image */}
        <div className="h-32 bg-blue-500">
          {character?.coverImage && (
            <img 
              src={character.coverImage} 
              alt="Profile banner" 
              className="w-full h-full object-cover" 
            />
          )}
        </div>
        
        {/* Profile avatar, positioned to overlap the banner */}
        <div className="absolute left-4 -bottom-16 border-4 border-white rounded-full">
          <Avatar className="h-32 w-32">
            <img 
              src={character?.image || "https://placekitten.com/200/200"} 
              alt="Profile" 
              className="object-cover" 
            />
          </Avatar>
        </div>
        
        {/* Edit profile button */}
        <div className="flex justify-end p-4">
          <Button variant="outline" className="rounded-full">Edit profile</Button>
        </div>
      </div>
      
      {/* Profile info */}
      <div className="mt-16 px-4 pb-4">
        <h1 className="font-bold text-xl">{character?.artistName || "Your Artist Name"}</h1>
        <div className="text-gray-500">@{character?.artistName?.toLowerCase().replace(/\s+/g, '') || "yourhandle"}</div>
        
        <div className="mt-3">{character?.about || "No bio yet"}</div>
        
        <div className="flex items-center mt-3 text-gray-500 text-sm space-x-4">
          <div className="flex items-center">
            <MapPin size={16} className="mr-1" />
            <span>Los Angeles, CA</span>
          </div>
          <div className="flex items-center">
            <Calendar size={16} className="mr-1" />
            <span>Joined March 2023</span>
          </div>
        </div>
        
        <div className="flex mt-3 space-x-5">
          <div>
            <span className="font-bold">245</span> <span className="text-gray-500">Following</span>
          </div>
          <div>
            <span className="font-bold">{formatNumber(twitterData?.followers || 0)}</span> <span className="text-gray-500">Followers</span>
          </div>
        </div>
      </div>
      
      {/* Profile tabs (Tweets, Tweets & replies, Media, Likes) */}
      <Tabs defaultValue="tweets">
        <TabsList className="w-full flex border-b border-gray-200 px-2">
          <TabsTrigger 
            value="tweets" 
            className="flex-1 hover:bg-gray-100 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-500"
          >
            Tweets
          </TabsTrigger>
          <TabsTrigger 
            value="replies" 
            className="flex-1 hover:bg-gray-100 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-500"
          >
            Replies
          </TabsTrigger>
          <TabsTrigger 
            value="media" 
            className="flex-1 hover:bg-gray-100 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-500"
          >
            Media
          </TabsTrigger>
          <TabsTrigger 
            value="likes" 
            className="flex-1 hover:bg-gray-100 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-500"
          >
            Likes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tweets">
          {profileTweets.map(tweet => (
            <TweetComponent key={tweet.id} tweet={tweet} />
          ))}
        </TabsContent>
        
        <TabsContent value="replies">
          <div className="p-8 text-center text-gray-500">
            No replies yet
          </div>
        </TabsContent>
        
        <TabsContent value="media">
          {profileTweets
            .filter(tweet => tweet.content.images && tweet.content.images.length > 0)
            .map(tweet => (
              <TweetComponent key={tweet.id} tweet={tweet} />
            ))}
        </TabsContent>
        
        <TabsContent value="likes">
          <div className="p-8 text-center text-gray-500">
            No likes yet
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Dummy data for the Twitter panel
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const dummyTweets: Tweet[] = [
  {
    id: "t1",
    user: {
      id: "u1",
      name: "kendricklamar",
      handle: "kendricklamar",
      avatar: "https://i.pravatar.cc/150?img=68",
      verified: true,
    },
    content: {
      text: "Album dropping next month. The wait is over.",
      createdAt: randomDate(new Date(Date.now() - 86400000 * 1), new Date())
    },
    engagement: {
      likes: 675432,
      retweets: 198765,
      replies: 45678,
      liked: false,
      retweeted: false
    }
  },
  {
    id: "t2",
    user: {
      id: "u2",
      name: "Drake",
      handle: "Drake",
      avatar: "https://i.pravatar.cc/150?img=65",
      verified: true,
    },
    content: {
      text: "Just wrote the hardest verse of my career. Can't wait for y'all to hear this 🦉",
      images: ["https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=1974&auto=format&fit=crop"],
      createdAt: randomDate(new Date(Date.now() - 86400000 * 2), new Date())
    },
    engagement: {
      likes: 423569,
      retweets: 89234,
      replies: 32456,
      liked: true,
      retweeted: false
    }
  },
  {
    id: "t3",
    user: {
      id: "u3",
      name: "Cardi B",
      handle: "iamcardib",
      avatar: "https://i.pravatar.cc/150?img=5",
      verified: true,
    },
    content: {
      text: "🗣️ NEW SINGLE DROPPING THIS FRIDAY!!! ARE YALL READY?! #cardib #newsingle",
      createdAt: randomDate(new Date(Date.now() - 86400000 * 3), new Date())
    },
    engagement: {
      likes: 183567,
      retweets: 45234,
      replies: 18734,
      liked: false,
      retweeted: true
    },
  },
  {
    id: "t4",
    user: {
      id: "u3",
      name: "Your Name",
      handle: "yourhandle",
      avatar: "https://i.pravatar.cc/150?img=33",
      verified: false,
    },
    isPinned: true,
    content: {
      text: "Just dropped my first single! Link in bio 🎵🔥 #newmusic #upandcoming",
      images: ["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop"],
      createdAt: randomDate(new Date(Date.now() - 86400000 * 7), new Date())
    },
    engagement: {
      likes: 345,
      retweets: 87,
      replies: 42,
      liked: false,
      retweeted: false
    },
  },
  {
    id: "t5",
    isRetweet: {
      user: {
        name: "Music Daily",
        handle: "musicdaily"
      }
    },
    user: {
      id: "u4",
      name: "Rolling Stone",
      handle: "RollingStone",
      avatar: "https://i.pravatar.cc/150?img=55",
      verified: true,
    },
    content: {
      text: "The 50 greatest hip-hop albums of all time, ranked: https://rol.st/top50hiphop",
      createdAt: randomDate(new Date(Date.now() - 86400000 * 5), new Date())
    },
    engagement: {
      likes: 12453,
      retweets: 5678,
      replies: 1234,
      liked: false,
      retweeted: false
    },
  },
  {
    id: "t6",
    user: {
      id: "u5",
      name: "Tyler, The Creator",
      handle: "tylerthecreator",
      avatar: "https://i.pravatar.cc/150?img=8",
      verified: true,
    },
    content: {
      text: "NEW ALBUM. JUNE 25TH.",
      quoteTweet: {
        id: "qt1",
        user: {
          id: "u5",
          name: "Tyler, The Creator",
          handle: "tylerthecreator",
          avatar: "https://i.pravatar.cc/150?img=8",
          verified: true,
        },
        content: {
          text: "TEASER: https://youtu.be/watch?v=example",
          createdAt: randomDate(new Date(Date.now() - 86400000 * 6), new Date(Date.now() - 86400000 * 6 + 3600000))
        },
        engagement: {
          likes: 98765,
          retweets: 34567,
          replies: 5678,
          liked: false,
          retweeted: false
        }
      },
      createdAt: randomDate(new Date(Date.now() - 86400000 * 6), new Date())
    },
    engagement: {
      likes: 245678,
      retweets: 87654,
      replies: 12345,
      liked: false,
      retweeted: false
    },
  }
];

// Trending Topics Component
const TrendingTopics = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <h2 className="font-bold text-xl mb-4">What's happening</h2>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-gray-500 flex items-center">Music · Trending</div>
              <div className="font-bold">Hip Hop Charts</div>
              <div className="text-xs text-gray-500">97.3K Tweets</div>
            </div>
            <button className="text-gray-500 hover:text-gray-800">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-gray-500 flex items-center">Entertainment · Trending</div>
              <div className="font-bold">#NewMusicFriday</div>
              <div className="text-xs text-gray-500">45.2K Tweets</div>
            </div>
            <button className="text-gray-500 hover:text-gray-800">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-gray-500 flex items-center">Grammy Awards · Live</div>
              <div className="font-bold">Nominees Announced</div>
              <div className="text-xs text-gray-500">203K Tweets</div>
            </div>
            <button className="text-gray-500 hover:text-gray-800">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-gray-500 flex items-center">Trending in Music</div>
              <div className="font-bold">Album of the Year</div>
              <div className="text-xs text-gray-500">34.8K Tweets</div>
            </div>
            <button className="text-gray-500 hover:text-gray-800">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
        
        <Button variant="ghost" className="text-blue-500 hover:bg-blue-50 w-full justify-start px-2 font-normal">
          Show more
        </Button>
      </div>
    </div>
  );
};

// Who To Follow Component
const WhoToFollow = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mt-4">
      <h2 className="font-bold text-xl mb-4">Who to follow</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <img src="https://i.pravatar.cc/150?img=33" alt="Suggested user" className="object-cover" />
            </Avatar>
            <div>
              <div className="flex items-center">
                <span className="font-bold text-sm">Lil Nas X</span>
                <Badge className="ml-1 h-4 w-4 bg-blue-500 p-0 flex items-center justify-center rounded-full">
                  <Check className="h-3 w-3 text-white" />
                </Badge>
              </div>
              <div className="text-gray-500 text-sm">@LilNasX</div>
            </div>
          </div>
          <Button variant="default" size="sm" className="rounded-full">
            Follow
          </Button>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <img src="https://i.pravatar.cc/150?img=37" alt="Suggested user" className="object-cover" />
            </Avatar>
            <div>
              <div className="flex items-center">
                <span className="font-bold text-sm">Doja Cat</span>
                <Badge className="ml-1 h-4 w-4 bg-blue-500 p-0 flex items-center justify-center rounded-full">
                  <Check className="h-3 w-3 text-white" />
                </Badge>
              </div>
              <div className="text-gray-500 text-sm">@DojaCat</div>
            </div>
          </div>
          <Button variant="default" size="sm" className="rounded-full">
            Follow
          </Button>
        </div>
        
        <Button variant="ghost" className="text-blue-500 hover:bg-blue-50 w-full justify-start px-2 font-normal">
          Show more
        </Button>
      </div>
    </div>
  );
};

// Main Twitter Panel Component
export function TwitterPanel() {
  const [activeTab, setActiveTab] = useState<"home" | "explore" | "notifications" | "messages" | "profile">("home");
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const character = useRapperGame(state => state.character);
  const socialMedia = useRapperGame(state => state.socialMedia);
  const postOnSocialMedia = useRapperGame(state => state.postOnSocialMedia);
  const { playSuccess } = useAudio();
  
  // Get Twitter followers count
  const twitterData = socialMedia.find(platform => platform.name === "Twitter");
  
  // Post a tweet to the game state
  const handleTweet = (text: string, images?: string[]) => {
    postOnSocialMedia("Twitter", text, images);
    playSuccess?.();
    setShowComposeDialog(false);
    
    // Show notification toast (this would be handled by the game state)
    // For demonstration, just show an alert
    setTimeout(() => {
      alert(`Tweet posted! You gained ${Math.floor((twitterData?.followers || 100) * 0.01)} new followers.`);
    }, 500);
  };

  return (
    <div className="flex flex-col md:flex-row w-full max-w-5xl mx-auto">
      {/* Left sidebar - desktop only */}
      <div className="hidden md:flex flex-col w-64 pr-4">
        <div className="sticky top-0 pt-4">
          <div className="mb-6">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-blue-500 fill-current">
              <g>
                <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path>
              </g>
            </svg>
          </div>
          
          <div className="space-y-4">
            <button className="flex items-center space-x-4 text-xl font-bold hover:bg-gray-200 rounded-full p-3 w-full">
              <Home size={28} />
              <span>Home</span>
            </button>
            
            <button className="flex items-center space-x-4 text-xl hover:bg-gray-200 rounded-full p-3 w-full">
              <Search size={28} />
              <span>Explore</span>
            </button>
            
            <button className="flex items-center space-x-4 text-xl hover:bg-gray-200 rounded-full p-3 w-full">
              <Bell size={28} />
              <span>Notifications</span>
            </button>
            
            <button className="flex items-center space-x-4 text-xl hover:bg-gray-200 rounded-full p-3 w-full">
              <Mail size={28} />
              <span>Messages</span>
            </button>
            
            <button className="flex items-center space-x-4 text-xl hover:bg-gray-200 rounded-full p-3 w-full">
              <Bookmark size={28} />
              <span>Bookmarks</span>
            </button>
            
            <button className="flex items-center space-x-4 text-xl hover:bg-gray-200 rounded-full p-3 w-full">
              <User size={28} />
              <span>Profile</span>
            </button>
            
            <button className="flex items-center space-x-4 text-xl hover:bg-gray-200 rounded-full p-3 w-full">
              <MoreHorizontal size={28} />
              <span>More</span>
            </button>
          </div>
          
          <Button className="mt-6 rounded-full w-full py-6 text-lg font-bold">
            Tweet
          </Button>
          
          <div className="mt-auto flex items-center p-3 rounded-full hover:bg-gray-200 cursor-pointer mt-6">
            <Avatar className="h-10 w-10 mr-3">
              <img src={character?.image || "https://placekitten.com/200/200"} alt="Profile" className="object-cover" />
            </Avatar>
            <div className="flex flex-col mr-2">
              <span className="font-bold text-sm">{character?.artistName || "Your Name"}</span>
              <span className="text-gray-500 text-sm">@{character?.artistName?.toLowerCase().replace(/\s+/g, '') || "yourhandle"}</span>
            </div>
            <MoreHorizontal size={20} className="ml-auto" />
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 border-x border-gray-200">
        <div className="sticky top-0 backdrop-blur-sm bg-white/80 border-b border-gray-200 z-10">
          <div className="flex items-center p-4">
            {activeTab === "profile" ? (
              <>
                <button className="mr-6">
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="font-bold text-xl">{character?.artistName || "Your Name"}</h1>
                  <span className="text-gray-500 text-sm">{formatNumber(twitterData?.followers || 0)} Tweets</span>
                </div>
              </>
            ) : (
              <>
                <h1 className="font-bold text-xl">Home</h1>
                <div className="ml-auto flex items-center">
                  <Sparkles size={20} className="text-blue-500" />
                </div>
              </>
            )}
          </div>
          
          {activeTab === "home" && (
            <div className="flex border-b">
              <button className="flex-1 py-4 font-bold hover:bg-gray-200 border-b-4 border-blue-500">
                For you
              </button>
              <button className="flex-1 py-4 text-gray-500 hover:bg-gray-200">
                Following
              </button>
            </div>
          )}
        </div>
        
        {activeTab === "home" && (
          <>
            {/* Tweet composer */}
            <div className="border-b border-gray-200 p-4 flex">
              <Avatar className="h-12 w-12 mr-3">
                <img 
                  src={character?.image || "https://placekitten.com/200/200"} 
                  alt="Profile" 
                  className="object-cover" 
                />
              </Avatar>
              <div className="flex-1">
                <button 
                  className="text-xl font-normal mb-6 outline-none w-full text-left text-gray-500"
                  onClick={() => setShowComposeDialog(true)}
                >
                  What's happening?
                </button>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-1">
                    <button className="text-blue-500 p-2 rounded-full hover:bg-blue-50">
                      <Image size={20} />
                    </button>
                    <button className="text-blue-500 p-2 rounded-full hover:bg-blue-50">
                      <Smile size={20} />
                    </button>
                    <button className="text-blue-500 p-2 rounded-full hover:bg-blue-50">
                      <Calendar size={20} />
                    </button>
                    <button className="text-blue-500 p-2 rounded-full hover:bg-blue-50">
                      <BarChart2 size={20} />
                    </button>
                    <button className="text-blue-500 p-2 rounded-full hover:bg-blue-50">
                      <MapPin size={20} />
                    </button>
                  </div>
                  <Button 
                    className="rounded-full px-4 py-1 h-9 opacity-50"
                    disabled={true}
                  >
                    Tweet
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Show a "new tweets" button */}
            <button className="w-full bg-gray-100/80 hover:bg-gray-200 text-blue-500 py-3 font-medium backdrop-blur-sm sticky top-32 z-10">
              Show 12 Tweets
            </button>
            
            {/* Tweets feed */}
            <div>
              {dummyTweets.map(tweet => (
                <TweetComponent key={tweet.id} tweet={tweet} />
              ))}
            </div>
            
            {/* Compose Tweet Dialog */}
            <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
              <DialogContent className="max-w-lg">
                <CreateTweetDialog onTweet={handleTweet} onClose={() => setShowComposeDialog(false)} />
              </DialogContent>
            </Dialog>
          </>
        )}
        
        {activeTab === "profile" && <ProfileTab />}
      </div>
      
      {/* Right sidebar - desktop only */}
      <div className="hidden md:block w-80 pl-6">
        <div className="sticky top-0 pt-4">
          {/* Search bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500" />
            </div>
            <input 
              type="text" 
              placeholder="Search Twitter" 
              className="bg-gray-100 w-full pl-10 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          
          {/* Trending topics */}
          <TrendingTopics />
          
          {/* Who to follow */}
          <WhoToFollow />
          
          {/* Footer links */}
          <div className="mt-4 text-xs text-gray-500 flex flex-wrap gap-2">
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Cookie Policy</a>
            <a href="#" className="hover:underline">Accessibility</a>
            <a href="#" className="hover:underline">Ads info</a>
            <a href="#" className="hover:underline">More...</a>
            <span>© 2025 X Corp.</span>
          </div>
        </div>
      </div>
      
      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-between items-center px-6 py-3">
        <button 
          onClick={() => setActiveTab("home")} 
          className={activeTab === "home" ? "text-blue-500" : "text-gray-500"}
        >
          <Home size={24} />
        </button>
        <button 
          onClick={() => setActiveTab("explore")} 
          className={activeTab === "explore" ? "text-blue-500" : "text-gray-500"}
        >
          <Search size={24} />
        </button>
        <button 
          onClick={() => setActiveTab("notifications")} 
          className={activeTab === "notifications" ? "text-blue-500" : "text-gray-500"}
        >
          <Bell size={24} />
        </button>
        <button 
          onClick={() => setActiveTab("messages")} 
          className={activeTab === "messages" ? "text-blue-500" : "text-gray-500"}
        >
          <Mail size={24} />
        </button>
        <button 
          onClick={() => setActiveTab("profile")} 
          className={activeTab === "profile" ? "text-blue-500" : "text-gray-500"}
        >
          <User size={24} />
        </button>
      </div>
    </div>
  );
}