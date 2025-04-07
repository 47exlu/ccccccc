import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SocialMediaPost, ViralStatus } from '@/lib/types';
import { 
  Twitter, 
  Instagram, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Zap, 
  Award, 
  Star, 
  Flame, 
  UserMinus, 
  UserPlus, 
  ArrowLeft
} from 'lucide-react';
import { TwitterPanel } from './TwitterPanel.new';
import { InstagramPanel } from './InstagramPanel.new';
import { TikTokPanel } from './TikTokPanel.new';
import { BurnerAccountManager } from './BurnerAccountManager';
import { formatNumber, formatMoney } from '@/lib/utils';

// TikTok Icon component
const TiktokLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M9.37,11.2a3.07,3.07,0,0,0-1.5.39V8.66A4.91,4.91,0,0,1,9.37,8.4a4.87,4.87,0,0,1,1.5.23v2.93A3.05,3.05,0,0,0,9.37,11.2Zm12-5.52v2.43A7.34,7.34,0,0,1,17,8.11a7.4,7.4,0,0,1-3.15-2V15.5a5,5,0,0,1-5,5,5.07,5.07,0,0,1-1.83-.35,5,5,0,0,1,1.83-9.66v2.47a2.54,2.54,0,0,0-.91-.17,2.52,2.52,0,1,0,2.52,2.52V0h2.44A4.87,4.87,0,0,0,17,3.37,4.87,4.87,0,0,0,21.37,5.68Z"/>
  </svg>
);

// Viral Post Badge Component
const ViralPostBadge = ({ status }: { status: ViralStatus }) => {
  let color = '';
  let icon = null;
  let text = '';
  
  switch (status) {
    case 'trending':
      color = 'bg-blue-500 hover:bg-blue-600';
      icon = <TrendingUp className="w-3 h-3 mr-1" />;
      text = 'Trending';
      break;
    case 'viral':
      color = 'bg-pink-600 hover:bg-pink-700';
      icon = <Flame className="w-3 h-3 mr-1" />;
      text = 'Viral';
      break;
    case 'super_viral':
      color = 'bg-amber-500 hover:bg-amber-600';
      icon = <Zap className="w-3 h-3 mr-1" />;
      text = 'Super Viral';
      break;
    default:
      return null;
  }

  return (
    <Badge className={`${color} flex items-center px-2 py-1`}>
      {icon}
      {text}
    </Badge>
  );
};

// Viral Post Component
const ViralPost = ({ post }: { post: SocialMediaPost }) => {
  const getIcon = (platform: string) => {
    switch (platform) {
      case "Twitter":
        return <Twitter className="w-4 h-4 text-[#1DA1F2]" />;
      case "Instagram":
        return <Instagram className="w-4 h-4 text-[#E1306C]" />;
      case "TikTok":
        return <TiktokLogo />;
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            {getIcon(post.platformName)}
            <span className="ml-2 font-medium">{post.platformName}</span>
          </div>
          <ViralPostBadge status={post.viralStatus} />
        </div>
        
        <div className="mb-3">
          <p className="text-sm">{post.content}</p>
          {post.image && (
            <div className="mt-2 rounded-lg overflow-hidden h-32 bg-gray-100 dark:bg-gray-800">
              <img src={post.image} alt="Post media" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-4 text-sm text-gray-500 border-t pt-3">
          <div className="flex flex-col items-center">
            <span className="font-bold text-gray-700 dark:text-gray-300">{formatNumber(post.likes)}</span>
            <span className="text-xs">Likes</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-gray-700 dark:text-gray-300">{formatNumber(post.comments)}</span>
            <span className="text-xs">Comments</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-gray-700 dark:text-gray-300">{formatNumber(post.shares)}</span>
            <span className="text-xs">Shares</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-green-600">${formatNumber(post.wealthGain)}</span>
            <span className="text-xs">Revenue</span>
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <Users className="w-3 h-3 mr-1" />
            <span>+{formatNumber(post.followerGain)} followers</span>
          </div>
          <div className="flex items-center">
            <Star className="w-3 h-3 mr-1" />
            <span>+{post.reputationGain} reputation</span>
          </div>
          <div>{post.postWeek ? `Week ${post.postWeek}` : ''}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export function SocialMediaHub() {
  const [activeTab, setActiveTab] = useState<"twitter" | "instagram" | "tiktok" | "viral" | "burner">("twitter");
  const socialMedia = useRapperGame(state => state.socialMedia);
  const socialMediaStats = useRapperGame(state => state.socialMediaStats);
  const currentWeek = useRapperGame(state => state.currentWeek);
  const setScreen = useRapperGame(state => state.setScreen);
  
  // Get all viral posts across platforms
  const viralPosts = socialMedia.flatMap(platform => platform.viralPosts || [])
    .sort((a, b) => b.postWeek - a.postWeek); // Sort by most recent
  
  // Get total burner accounts count
  const getTotalBurnerAccounts = () => {
    let count = 0;
    if (socialMediaStats?.twitter?.burnerAccounts) {
      count += socialMediaStats.twitter.burnerAccounts.length;
    }
    if (socialMediaStats?.instagram?.burnerAccounts) {
      count += socialMediaStats.instagram.burnerAccounts.length;
    }
    if (socialMediaStats?.tiktok?.burnerAccounts) {
      count += socialMediaStats.tiktok.burnerAccounts.length;
    }
    return count;
  };

  const burnerAccountsCount = getTotalBurnerAccounts();
  
  const getPlatformFollowers = (platform: string) => {
    const platformData = socialMedia.find(p => p.name === platform);
    return platformData?.followers || 0;
  };
  
  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "Twitter":
        return "bg-black dark:bg-white dark:text-black";
      case "Instagram":
        return "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500";
      case "TikTok":
        return "bg-black";
      default:
        return "bg-gray-800";
    }
  };
  
  const handleBackToDashboard = () => {
    setScreen('career_dashboard');
  };
  
  const SocialMetricCard = ({ platform, icon, followers }: { platform: string, icon: React.ReactNode, followers: number }) => (
    <div className="flex flex-col h-full">
      <div className={`rounded-t-lg ${getPlatformColor(platform)} p-2`}>
        <div className="flex justify-between items-center text-white">
          <span className="font-medium">{platform}</span>
          <div className="w-6 h-6">{icon}</div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-3 rounded-b-lg shadow-sm flex-1">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Users size={16} />
          <span>Followers:</span>
          <span className="ml-auto font-bold">{formatNumber(followers)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
          <TrendingUp size={16} />
          <span>Engagement:</span>
          <span className="ml-auto font-bold">{(socialMedia.find(p => p.name === platform)?.engagement || 0)}%</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
          <DollarSign size={16} />
          <span>Value per post:</span>
          <span className="ml-auto font-bold">${Math.round(followers / 1000 * 2.5)}</span>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center p-3 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackToDashboard}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Social Media Management</h1>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <SocialMetricCard 
              platform="Twitter" 
              icon={<Twitter className="text-white" />} 
              followers={getPlatformFollowers("Twitter")} 
            />
            <SocialMetricCard 
              platform="Instagram" 
              icon={<Instagram className="text-white" />} 
              followers={getPlatformFollowers("Instagram")} 
            />
            <SocialMetricCard 
              platform="TikTok" 
              icon={<TiktokLogo />} 
              followers={getPlatformFollowers("TikTok")} 
            />
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-5 mb-4">
              <TabsTrigger value="twitter" className="flex items-center gap-2">
                <Twitter size={18} />
                <span>X</span>
              </TabsTrigger>
              <TabsTrigger value="instagram" className="flex items-center gap-2">
                <Instagram size={18} />
                <span>Instagram</span>
              </TabsTrigger>
              <TabsTrigger value="tiktok" className="flex items-center gap-2">
                <TiktokLogo />
                <span>TikTok</span>
              </TabsTrigger>
              <TabsTrigger value="viral" className="flex items-center gap-2">
                <Award size={18} />
                <span>Viral Content</span>
                {viralPosts.length > 0 && (
                  <Badge variant="destructive" className="ml-1">{viralPosts.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="burner" className="flex items-center gap-2">
                <UserPlus size={18} />
                <span>Burner Accounts</span>
                {burnerAccountsCount > 0 && (
                  <Badge variant="secondary" className="ml-1">{burnerAccountsCount}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="twitter" className="flex justify-center">
              <TwitterPanel />
            </TabsContent>
            
            <TabsContent value="instagram" className="flex justify-center">
              <InstagramPanel />
            </TabsContent>
            
            <TabsContent value="tiktok" className="flex justify-center">
              <TikTokPanel />
            </TabsContent>
            
            <TabsContent value="viral">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="mr-2 h-5 w-5 text-yellow-500" />
                    Viral Content Tracker
                  </CardTitle>
                  <CardDescription>
                    Track your best performing social media posts and their impact on your career
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {viralPosts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <TrendingUp className="mx-auto h-12 w-12 mb-3 opacity-50" />
                      <p className="text-lg font-medium">No viral content yet</p>
                      <p className="text-sm mt-1">Keep posting regularly for a chance to go viral!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {viralPosts.map(post => (
                        <ViralPost key={post.id} post={post} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="burner">
              <BurnerAccountManager />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}