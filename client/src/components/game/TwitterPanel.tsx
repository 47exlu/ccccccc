import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { useAudio } from '@/lib/stores/useAudio';
import { TwitterIcon } from '@/assets/icons';
import { MusicChart, SocialMediaPost, TwitterTrend } from '@/lib/types';
import { 
  Camera, 
  Image as ImageIcon, 
  MapPin, 
  AtSign, 
  Calendar, 
  BarChart2, 
  Heart, 
  MessageCircle, 
  Repeat, 
  Share, 
  PenSquare 
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check if Twitter data exists
  if (!socialMediaStats?.twitter) {
    return (
      <Card className="bg-gradient-to-b from-blue-950/70 to-blue-950/30 border-blue-800">
        <CardContent className="p-4">
          <div className="text-center text-gray-400">Twitter data not available</div>
        </CardContent>
      </Card>
    );
  }
  
  const twitterData = socialMediaStats.twitter;
  const trends = twitterData.trends || [];
  const musicChartAccounts = twitterData.musicChartAccounts || [];
  
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
    // In a real implementation, this would open an image gallery modal
    // For now, we'll simulate by opening the file input
    fileInputRef.current?.click();
  };
  
  // Helper function to render a tweet
  const renderTweet = (post: SocialMediaPost, account: MusicChart) => {
    return (
      <div key={post.id} className="p-3 border border-blue-800/50 rounded-lg mb-3 bg-blue-950/20 hover:bg-blue-950/30 transition-colors">
        <div className="flex items-start">
          <Avatar className="w-10 h-10 mr-3">
            <AvatarImage src={account.avatar} alt={account.accountName} />
            <AvatarFallback>{account.accountName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center">
              <div className="font-bold text-white">{account.accountName}</div>
              {account.verified && (
                <Badge variant="outline" className="ml-1 text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                  ✓
                </Badge>
              )}
              <div className="ml-1 text-gray-500 text-sm">@{account.handle}</div>
              <div className="ml-auto text-xs text-gray-500">{formatDate(post.date)}</div>
            </div>
            <div className="mt-1 text-white">{post.content}</div>
            {post.image && (
              <div className="mt-2 rounded-lg overflow-hidden">
                <img src={post.image} alt="Tweet media" className="w-full h-auto" />
              </div>
            )}
            <div className="mt-2 flex justify-between text-gray-400 text-sm">
              <button className="flex items-center hover:text-blue-400">
                <MessageCircle size={16} className="mr-1" />
                <span>{formatNumber(post.comments)}</span>
              </button>
              <button className="flex items-center hover:text-green-400">
                <Repeat size={16} className="mr-1" />
                <span>{formatNumber(Math.floor(post.shares / 2))}</span>
              </button>
              <button className="flex items-center hover:text-red-400">
                <Heart size={16} className="mr-1" />
                <span>{formatNumber(post.likes)}</span>
              </button>
              <button className="flex items-center hover:text-blue-400">
                <Share size={16} className="mr-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Function to render user tweets
  const renderUserTweet = (post: SocialMediaPost) => {
    return (
      <div key={post.id} className="p-3 border border-blue-800/50 rounded-lg mb-3 bg-blue-950/20 hover:bg-blue-950/30 transition-colors">
        <div className="flex items-start">
          <Avatar className="w-10 h-10 mr-3">
            <AvatarImage src={character?.image || ""} alt={character?.artistName || "Artist"} />
            <AvatarFallback>{character?.artistName?.charAt(0) || "A"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center">
              <div className="font-bold text-white">{character?.artistName}</div>
              {twitterData.verified && (
                <Badge variant="outline" className="ml-1 text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                  ✓
                </Badge>
              )}
              <div className="ml-1 text-gray-500 text-sm">@{twitterData.handle}</div>
              <div className="ml-auto text-xs text-gray-500">{formatDate(post.date) || `${currentWeek - post.postWeek}w`}</div>
            </div>
            <div className="mt-1 text-white">{post.content}</div>
            {post.images && post.images.length > 0 && (
              <div className="mt-2 rounded-lg overflow-hidden">
                <img src={post.images[0]} alt="Tweet media" className="w-full h-auto" />
              </div>
            )}
            <div className="mt-2 flex justify-between text-gray-400 text-sm">
              <button className="flex items-center hover:text-blue-400">
                <MessageCircle size={16} className="mr-1" />
                <span>{formatNumber(post.comments)}</span>
              </button>
              <button className="flex items-center hover:text-green-400">
                <Repeat size={16} className="mr-1" />
                <span>{formatNumber(post.shares)}</span>
              </button>
              <button className="flex items-center hover:text-red-400">
                <Heart size={16} className="mr-1" />
                <span>{formatNumber(post.likes)}</span>
              </button>
              <button className="flex items-center hover:text-blue-400">
                <Share size={16} className="mr-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Twitter Header */}
      <div className="mb-6">
        <Card className="bg-gradient-to-b from-blue-950/70 to-blue-950/30 border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <TwitterIcon size={20} className="mr-2 text-[#1DA1F2]" />
                Twitter
              </div>
              <div className="text-sm font-normal text-blue-400">@{twitterData.handle}</div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-center py-2">
              <div>
                <div className="text-xl font-bold">{formatNumber(twitterData.followers)}</div>
                <div className="text-sm text-gray-400">Followers</div>
              </div>
              <div>
                <div className="text-xl font-bold">{twitterData.tweets.length}</div>
                <div className="text-sm text-gray-400">Tweets</div>
              </div>
              <div>
                <div className="text-xl font-bold">{twitterData.engagement}%</div>
                <div className="text-sm text-gray-400">Engagement</div>
              </div>
            </div>
            
            {/* Compose Tweet Button */}
            <Button
              className="w-full mt-3 bg-[#1DA1F2] hover:bg-[#1a91da] text-white"
              onClick={() => setIsComposeOpen(true)}
            >
              <PenSquare className="mr-2 h-4 w-4" />
              Compose Tweet
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Compose Tweet Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Compose Tweet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={character?.image || ""} alt={character?.artistName || "Artist"} />
                <AvatarFallback>{character?.artistName?.charAt(0) || "A"}</AvatarFallback>
              </Avatar>
              <Textarea
                value={tweetText}
                onChange={(e) => setTweetText(e.target.value)}
                placeholder="What's happening?"
                className="flex-1 resize-none"
                maxLength={280}
              />
            </div>
            
            {selectedImage && (
              <div className="relative mt-2 rounded-lg overflow-hidden">
                <img src={selectedImage} alt="Selected" className="w-full h-auto max-h-[200px] object-cover" />
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
            
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  className="text-[#1DA1F2]"
                  onClick={openGallery}
                >
                  <ImageIcon size={18} />
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  className="text-[#1DA1F2]"
                >
                  <MapPin size={18} />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-500">
                  {tweetText.length}/280
                </div>
                <Button
                  type="button"
                  disabled={!tweetText.trim()}
                  className="bg-[#1DA1F2] hover:bg-[#1a91da] text-white"
                  onClick={handleTweetSubmit}
                >
                  Tweet
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Timeline and Trending Tabs */}
      <Tabs defaultValue="timeline">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">
            Your Timeline
          </TabsTrigger>
          <TabsTrigger value="trending">
            Trending
          </TabsTrigger>
          <TabsTrigger value="musiccharts">
            Music Charts
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="mt-4">
          <ScrollArea className="h-[600px] pr-4">
            {twitterData.tweets.length > 0 ? (
              <div className="space-y-4">
                {twitterData.tweets.map((tweet) => renderUserTweet(tweet))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p>No tweets yet. Create your first tweet!</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="trending" className="mt-4">
          <Card className="bg-gradient-to-b from-blue-950/70 to-blue-950/30 border-blue-800">
            <CardContent className="pt-4">
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {trends.map((trend: TwitterTrend) => (
                    <div key={trend.id} className="flex items-start p-3 hover:bg-blue-900/20 rounded-md transition-colors">
                      <div className="flex-1">
                        <div className="font-medium text-white">{trend.name}</div>
                        <div className="text-xs text-gray-400">{formatNumber(trend.tweetCount)} tweets • {trend.category}</div>
                        {trend.description && (
                          <div className="mt-1 text-sm text-gray-300">{trend.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="musiccharts" className="mt-4">
          <Card className="bg-gradient-to-b from-blue-950/70 to-blue-950/30 border-blue-800">
            <CardContent className="pt-4">
              <ScrollArea className="h-[600px]">
                <div className="space-y-6">
                  {musicChartAccounts.map((account) => (
                    <div key={account.id} className="space-y-3">
                      <div className="flex items-center">
                        <Avatar className="w-8 h-8 mr-2">
                          <AvatarImage src={account.avatar} alt={account.accountName} />
                          <AvatarFallback>{account.accountName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center">
                            <div className="font-bold text-white">{account.accountName}</div>
                            {account.verified && (
                              <Badge variant="outline" className="ml-1 text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                                ✓
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">@{account.handle} • {formatNumber(account.followers)} followers</div>
                        </div>
                      </div>
                      
                      {account.tweets.length > 0 ? (
                        <div>
                          {account.tweets.map(tweet => renderTweet(tweet, account))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">No recent posts</div>
                      )}
                      
                      <Separator className="border-blue-800/50" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}