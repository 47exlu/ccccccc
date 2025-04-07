import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { useAudio } from '@/lib/stores/useAudio';
import { MusicChart, SocialMediaPost, TwitterTrend } from '@/lib/types';
import { 
  Image as ImageIcon, 
  Heart, 
  MessageCircle, 
  Repeat, 
  Share, 
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  User,
  MoreHorizontal,
  X,
  Sparkles
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

const formatDate = (date?: Date): string => {
  if (!date) return '';
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m`;
  
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h`;
  
  const days = Math.floor(diff / 86400000);
  return `${days}d`;
};

export function TwitterPanel() {
  const { socialMediaStats, socialMedia, postOnSocialMedia, character, currentWeek } = useRapperGame();
  const { playSuccess } = useAudio();
  const [tweetText, setTweetText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check if Twitter data exists
  if (!socialMediaStats?.twitter) {
    return (
      <Card className="bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-950 dark:to-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-4">
          <div className="text-center text-gray-500">X data not available</div>
        </CardContent>
      </Card>
    );
  }
  
  const twitterData = socialMediaStats.twitter;
  const trends = twitterData.trends || [];
  const musicChartAccounts = twitterData.musicChartAccounts || [];
  
  // Calculate engagement statistics
  const getEngagementStats = () => {
    const platform = socialMedia.find(p => p.name === "Twitter");
    if (!platform || !platform.posts || !Array.isArray(platform.posts) || platform.posts.length === 0) {
      return {
        engagementRate: "0%",
        avgLikes: 0,
        avgRetweets: 0,
        avgComments: 0,
        totalPosts: 0,
        bestPerforming: null
      };
    }
    
    const posts = platform.posts as SocialMediaPost[];
    const totalLikes = posts.reduce((sum: number, post: SocialMediaPost) => sum + post.likes, 0);
    const totalRetweets = posts.reduce((sum: number, post: SocialMediaPost) => sum + post.shares, 0);
    const totalComments = posts.reduce((sum: number, post: SocialMediaPost) => sum + post.comments, 0);
    const totalInteractions = totalLikes + totalRetweets + totalComments;
    
    // Find best performing post
    const bestPost = [...posts].sort((a: SocialMediaPost, b: SocialMediaPost) => 
      (b.likes + b.shares + b.comments) - (a.likes + a.shares + a.comments)
    )[0];
    
    const followers = typeof platform.followers === 'number' ? platform.followers : 0;
    
    return {
      engagementRate: `${((totalInteractions / (posts.length * followers || 1)) * 100).toFixed(2)}%`,
      avgLikes: Math.round(totalLikes / posts.length),
      avgRetweets: Math.round(totalRetweets / posts.length),
      avgComments: Math.round(totalComments / posts.length),
      totalPosts: posts.length,
      bestPerforming: bestPost
    };
  };
  
  const handleTweetSubmit = () => {
    if (tweetText.trim()) {
      const images = selectedImage ? [selectedImage] : [];
      postOnSocialMedia("Twitter", tweetText, images);
      playSuccess?.();
      setTweetText('');
      setSelectedImage(null);
      setIsComposeOpen(false);
    }
  };

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
    fileInputRef.current?.click();
  };
  
  // Helper function to render a tweet
  const renderTweet = (post: SocialMediaPost, account: MusicChart) => {
    return (
      <div key={post.id} className="p-4 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
        <div className="flex items-start">
          <Avatar className="w-10 h-10 mr-3">
            <AvatarImage src={account.avatar} alt={account.accountName} />
            <AvatarFallback>{account.accountName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="font-bold text-black dark:text-white">{account.accountName}</span>
              {account.verified && (
                <span className="flex items-center justify-center bg-blue-500 text-white rounded-full w-4 h-4 text-[10px]">
                  ✓
                </span>
              )}
              <span className="text-gray-500 text-sm">@{account.handle} · {formatDate(post.date)}</span>
              <button className="ml-auto text-gray-500 hover:text-gray-800 dark:hover:text-gray-300">
                <MoreHorizontal size={16} />
              </button>
            </div>
            <div className="mt-1 text-black dark:text-white">{post.content}</div>
            {post.image && (
              <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                <img src={post.image} alt="Tweet media" className="w-full h-auto" />
              </div>
            )}
            <div className="mt-3 flex justify-between text-gray-500 text-sm">
              <button className="flex items-center hover:text-blue-500 group">
                <div className="p-2 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 mr-1">
                  <MessageCircle size={16} />
                </div>
                <span>{formatNumber(post.comments)}</span>
              </button>
              <button className="flex items-center hover:text-green-500 group">
                <div className="p-2 rounded-full group-hover:bg-green-100 dark:group-hover:bg-green-900/30 mr-1">
                  <Repeat size={16} />
                </div>
                <span>{formatNumber(Math.floor(post.shares / 2))}</span>
              </button>
              <button className="flex items-center hover:text-pink-500 group">
                <div className="p-2 rounded-full group-hover:bg-pink-100 dark:group-hover:bg-pink-900/30 mr-1">
                  <Heart size={16} />
                </div>
                <span>{formatNumber(post.likes)}</span>
              </button>
              <button className="flex items-center hover:text-blue-500 group">
                <div className="p-2 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30">
                  <Share size={16} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden dark:bg-black bg-white border-0 shadow-md relative h-[600px]">
      <CardContent className="p-0 h-full flex">
        {/* Left Sidebar */}
        <div className="hidden md:flex w-16 lg:w-64 flex-col border-r border-gray-200 dark:border-gray-800 h-full p-2">
          <div className="p-3 flex items-center justify-center lg:justify-start mb-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
              <X size={18} />
            </div>
          </div>
          
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-4 font-normal">
              <Home className="h-5 w-5" />
              <span className="hidden lg:inline">Home</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-4 font-normal">
              <Search className="h-5 w-5" />
              <span className="hidden lg:inline">Explore</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-4 font-normal">
              <Bell className="h-5 w-5" />
              <span className="hidden lg:inline">Notifications</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-4 font-normal">
              <Mail className="h-5 w-5" />
              <span className="hidden lg:inline">Messages</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-4 font-normal">
              <Bookmark className="h-5 w-5" />
              <span className="hidden lg:inline">Bookmarks</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-4 font-normal">
              <User className="h-5 w-5" />
              <span className="hidden lg:inline">Profile</span>
            </Button>
          </div>
          
          <Button 
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
            onClick={() => setIsComposeOpen(true)}
          >
            <span className="hidden lg:inline">Post</span>
            <Sparkles className="h-5 w-5 lg:hidden" />
          </Button>
          
          <div className="mt-auto">
            <div className="flex items-center gap-3 p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer">
              <Avatar className="w-8 h-8">
                <AvatarImage src={character?.image} alt={character?.artistName} />
                <AvatarFallback>{character?.artistName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="hidden lg:block flex-1 min-w-0">
                <div className="font-bold truncate">{character?.artistName}</div>
                <div className="text-gray-500 text-sm truncate">@{twitterData.handle}</div>
              </div>
              <MoreHorizontal className="h-5 w-5 hidden lg:block text-gray-500" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="for-you" className="w-full flex-1 flex flex-col">
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur">
              <div className="flex items-center px-4 py-3">
                <Avatar className="w-8 h-8 md:hidden mr-3">
                  <AvatarImage src={character?.image} alt={character?.artistName} />
                  <AvatarFallback>{character?.artistName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-xl font-bold">Home</div>
              </div>
              <TabsList className="grid grid-cols-3 p-0 bg-transparent w-full">
                <TabsTrigger value="for-you" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none py-3 data-[state=active]:font-semibold">
                  For you
                </TabsTrigger>
                <TabsTrigger value="following" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none py-3 data-[state=active]:font-semibold">
                  Following
                </TabsTrigger>
                <TabsTrigger value="analytics" onClick={() => setShowAnalytics(true)} className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none py-3 data-[state=active]:font-semibold">
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center md:hidden">
              <Avatar className="w-10 h-10 mr-3">
                <AvatarImage src={character?.image} alt={character?.artistName} />
                <AvatarFallback>{character?.artistName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div
                className="flex-1 text-gray-500 rounded-full py-2 px-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsComposeOpen(true)}
              >
                What's happening?
              </div>
            </div>

            <ScrollArea className="flex-1">
              <TabsContent value="for-you" className="m-0 p-0 flex-1">
                {/* Feed content: Music charts, trends, and user posts */}
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {musicChartAccounts.map(account => (
                    <React.Fragment key={account.id}>
                      {account.tweets.map(tweet => renderTweet(tweet, account))}
                    </React.Fragment>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="following" className="m-0 p-0">
                <div className="p-4 py-10">
                  <div className="text-center text-gray-500">
                    <p className="text-lg font-bold mb-1">Start following accounts</p>
                    <p className="text-sm">When you do, their posts will show up here.</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="analytics" className="m-0 p-0">
                <div className="p-4">
                  {/* Analytics Dashboard */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Profile Header */}
                    <div className="relative">
                      <div className="h-32 bg-blue-500"></div>
                      <div className="absolute -bottom-12 left-4">
                        <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800">
                          <AvatarImage src={character?.image} alt={character?.artistName} />
                          <AvatarFallback className="text-xl">{character?.artistName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    
                    <div className="pt-14 pb-4 px-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold">{character?.artistName}</h2>
                          <p className="text-gray-500">@{twitterData.handle}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Verified Account
                        </Badge>
                      </div>
                      
                      <p className="mt-2 text-gray-700 dark:text-gray-300">
                        {character?.artistName} | Official Account | {character?.about || 'Making hits'}
                      </p>
                      
                      <div className="flex mt-4 space-x-6">
                        <div>
                          <span className="font-bold">{formatNumber(socialMedia.find(p => p.name === "Twitter")?.followers || 0)}</span>
                          <span className="text-gray-500 ml-1">Followers</span>
                        </div>
                        <div>
                          <span className="font-bold">{formatNumber(Math.floor((socialMedia.find(p => p.name === "Twitter")?.followers || 0) / 10))}</span>
                          <span className="text-gray-500 ml-1">Following</span>
                        </div>
                        <div>
                          <span className="font-bold">
                            {(() => {
                              const twitterData = socialMedia.find(p => p.name === "Twitter");
                              const posts = twitterData?.posts;
                              if (posts && Array.isArray(posts)) {
                                return formatNumber(posts.length);
                              }
                              return '0';
                            })()}
                          </span>
                          <span className="text-gray-500 ml-1">Posts</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Analytics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border-t border-gray-200 dark:border-gray-700">
                      {/* Engagement Rate */}
                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Engagement Rate</div>
                        <div className="text-2xl font-bold mt-1">{getEngagementStats().engagementRate}</div>
                        <div className="text-xs text-green-500 mt-1">+0.5% from last week</div>
                      </div>
                      
                      {/* Avg. Likes */}
                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Likes per Post</div>
                        <div className="text-2xl font-bold mt-1">{formatNumber(getEngagementStats().avgLikes)}</div>
                        <div className="text-xs text-green-500 mt-1">+12% from last week</div>
                      </div>
                      
                      {/* Avg. Retweets */}
                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Retweets</div>
                        <div className="text-2xl font-bold mt-1">{formatNumber(getEngagementStats().avgRetweets)}</div>
                        <div className="text-xs text-green-500 mt-1">+8% from last week</div>
                      </div>
                      
                      {/* Impressions */}
                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Impressions (30 days)</div>
                        <div className="text-2xl font-bold mt-1">{formatNumber((socialMedia.find(p => p.name === "Twitter")?.followers || 0) * 3)}</div>
                        <div className="text-xs text-green-500 mt-1">+25% from previous period</div>
                      </div>
                      
                      {/* Profile Visits */}
                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Profile Visits</div>
                        <div className="text-2xl font-bold mt-1">{formatNumber((socialMedia.find(p => p.name === "Twitter")?.followers || 0) / 5)}</div>
                        <div className="text-xs text-green-500 mt-1">+15% from last week</div>
                      </div>
                      
                      {/* New Followers */}
                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <div className="text-sm text-gray-500 dark:text-gray-400">New Followers (Week)</div>
                        <div className="text-2xl font-bold mt-1">+{formatNumber(Math.floor((socialMedia.find(p => p.name === "Twitter")?.followers || 0) * 0.05))}</div>
                        <div className="text-xs text-green-500 mt-1">Growing steadily</div>
                      </div>
                    </div>
                    
                    {/* Top Performing Post */}
                    {getEngagementStats().bestPerforming && (
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold mb-2">Top Performing Post</h3>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                          <div className="flex items-start">
                            <Avatar className="w-10 h-10 mr-3">
                              <AvatarImage src={character?.image} alt={character?.artistName} />
                              <AvatarFallback>{character?.artistName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="font-bold">{character?.artistName}</span>
                                <span className="flex items-center justify-center bg-blue-500 text-white rounded-full w-4 h-4 text-[10px]">✓</span>
                                <span className="text-gray-500 text-sm">@{twitterData.handle}</span>
                              </div>
                              <p className="mt-1">{getEngagementStats().bestPerforming?.content || ''}</p>
                              
                              <div className="mt-2 flex items-center text-gray-500 text-sm space-x-4">
                                <div className="flex items-center">
                                  <Heart size={14} className="mr-1" />
                                  <span>{formatNumber(getEngagementStats().bestPerforming?.likes || 0)}</span>
                                </div>
                                <div className="flex items-center">
                                  <Repeat size={14} className="mr-1" />
                                  <span>{formatNumber(getEngagementStats().bestPerforming?.shares || 0)}</span>
                                </div>
                                <div className="flex items-center">
                                  <MessageCircle size={14} className="mr-1" />
                                  <span>{formatNumber(getEngagementStats().bestPerforming?.comments || 0)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Right Sidebar - Trending */}
        <div className="hidden lg:flex w-80 flex-col border-l border-gray-200 dark:border-gray-800 h-full">
          <div className="sticky top-0 p-3">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-gray-100 dark:bg-gray-800 rounded-full pl-10 pr-4 py-2 border-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mb-4">
              <h3 className="font-bold text-xl mb-3">Trends for you</h3>
              {trends.map(trend => (
                <div key={trend.id} className="py-2 hover:bg-gray-200 dark:hover:bg-gray-700 -mx-4 px-4 cursor-pointer">
                  <div className="text-xs text-gray-500">{trend.category} · Trending</div>
                  <div className="font-semibold">#{trend.name}</div>
                  <div className="text-xs text-gray-500">{formatNumber(trend.tweetCount)} posts</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Compose Tweet Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create post</DialogTitle>
          </DialogHeader>
          <div className="flex gap-4 mt-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={character?.image} alt={character?.artistName} />
              <AvatarFallback>{character?.artistName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={tweetText}
                onChange={(e) => setTweetText(e.target.value)}
                placeholder="What's happening?"
                className="min-h-[120px] border-0 focus-visible:ring-0 resize-none text-lg"
              />
              {selectedImage && (
                <div className="relative mt-2 rounded-xl overflow-hidden">
                  <img src={selectedImage} alt="Uploaded" className="w-full max-h-[240px] object-cover" />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 w-8 h-8 rounded-full p-0"
                    onClick={() => setSelectedImage(null)}
                  >
                    ✕
                  </Button>
                </div>
              )}
              <div className="border-t mt-4 pt-2 flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    onClick={openGallery}
                  >
                    <ImageIcon size={20} />
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    accept="image/*" 
                  />
                </div>
                <Button
                  onClick={handleTweetSubmit}
                  disabled={!tweetText.trim()}
                  className="rounded-full bg-blue-500 hover:bg-blue-600"
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}