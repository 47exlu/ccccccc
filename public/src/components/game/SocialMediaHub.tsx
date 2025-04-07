import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { useAudio } from '@/lib/stores/useAudio';
import { Twitter, Instagram, DollarSign, Users, TrendingUp, Zap, Award, Star, Flame, TrendingUp as TrendingUpIcon } from 'lucide-react';
import { TwitterPanel } from './TwitterPanel';
import { InstagramPanel } from './InstagramPanel';
import { formatNumber, formatMoney } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { SocialMediaPost, ViralStatus } from '@/lib/types';

// TikTok Icon component as it's not available in Lucide
const TiktokLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M9.37,11.2a3.07,3.07,0,0,0-1.5.39V8.66A4.91,4.91,0,0,1,9.37,8.4a4.87,4.87,0,0,1,1.5.23v2.93A3.05,3.05,0,0,0,9.37,11.2Zm12-5.52v2.43A7.34,7.34,0,0,1,17,8.11a7.4,7.4,0,0,1-3.15-2V15.5a5,5,0,0,1-5,5,5.07,5.07,0,0,1-1.83-.35,5,5,0,0,1,1.83-9.66v2.47a2.54,2.54,0,0,0-.91-.17,2.52,2.52,0,1,0,2.52,2.52V0h2.44A4.87,4.87,0,0,0,17,3.37,4.87,4.87,0,0,0,21.37,5.68Z"/>
  </svg>
);

// TikTok Panel Component
const TikTokPanel = () => {
  const character = useRapperGame(state => state.character);
  const socialMedia = useRapperGame(state => state.socialMedia);
  const postOnSocialMedia = useRapperGame(state => state.postOnSocialMedia);
  const { playSuccess } = useAudio();
  
  // Find TikTok platform data
  const tiktokData = socialMedia.find(platform => platform.name === "TikTok");
  
  // Handle TikTok video upload
  const handleVideoUpload = () => {
    postOnSocialMedia("TikTok", "New trending video #music #rap #viral", []);
    playSuccess?.();
    alert("Video uploaded successfully!");
  };
  
  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden bg-black text-white">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <div className="text-xl font-bold">TikTok</div>
        <div className="flex space-x-4">
          <button className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </button>
          <button className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <CardContent className="p-0">
        <div className="flex flex-col items-center p-6">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
            <img 
              src={character?.image || "https://placekitten.com/200/200"} 
              alt="Profile" 
              className="w-full h-full object-cover" 
            />
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold">@{character?.artistName?.toLowerCase().replace(/\s+/g, '') || "yourhandle"}</div>
            <div className="text-gray-400 mt-1">{character?.artistName || "Your Name"}</div>
          </div>
          
          <div className="flex justify-between w-full mt-6">
            <div className="text-center">
              <div className="text-xl font-bold">{formatNumber(tiktokData?.followers || 0)}</div>
              <div className="text-gray-400 text-sm">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{formatNumber(tiktokData?.posts || 0)}</div>
              <div className="text-gray-400 text-sm">Videos</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{formatNumber((tiktokData?.followers || 0) * 5)}</div>
              <div className="text-gray-400 text-sm">Likes</div>
            </div>
          </div>
          
          <button 
            className="bg-[#fe2c55] text-white rounded-md w-full py-2 mt-6 font-bold"
            onClick={handleVideoUpload}
          >
            + Upload Video
          </button>
        </div>
        
        <div className="p-4 bg-gray-900 border-t border-gray-700">
          <div className="text-center text-gray-400">
            Post videos regularly to increase your chances of going viral.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Viral Post Badge Component
const ViralPostBadge = ({ status }: { status: ViralStatus }) => {
  let color = '';
  let icon = null;
  let text = '';
  
  switch (status) {
    case 'trending':
      color = 'bg-blue-500 hover:bg-blue-600';
      icon = <TrendingUpIcon className="w-3 h-3 mr-1" />;
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
  
  const formatMetric = (num: number) => {
    return formatNumber(num);
  };
  
  return (
    <Card className="mb-3 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            {getIcon(post.platformName)}
            <span className="ml-2 font-semibold">{post.platformName}</span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-gray-400 text-sm">Week {post.postWeek}</span>
          </div>
          <ViralPostBadge status={post.viralStatus} />
        </div>
        
        <div className="mb-3 text-sm line-clamp-2">{post.content}</div>
        
        {post.images && post.images.length > 0 && (
          <div className={`grid gap-2 mb-3 ${
            post.images.length === 1 ? 'grid-cols-1' : 
            post.images.length === 2 ? 'grid-cols-2' : 
            'grid-cols-3'
          }`}>
            {post.images.map((img, index) => (
              <div key={index} className="relative rounded-md overflow-hidden h-24">
                <img src={img} alt="Post" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
        
        <div className="grid grid-cols-3 text-center text-sm">
          <div>
            <div className="font-semibold">{formatMetric(post.likes)}</div>
            <div className="text-gray-500 text-xs">Likes</div>
          </div>
          <div>
            <div className="font-semibold">{formatMetric(post.comments)}</div>
            <div className="text-gray-500 text-xs">Comments</div>
          </div>
          <div>
            <div className="font-semibold">{formatMetric(post.shares)}</div>
            <div className="text-gray-500 text-xs">Shares</div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-3 text-center text-xs">
          <div>
            <div className="font-semibold text-green-600">+{formatMetric(post.followerGain)}</div>
            <div className="text-gray-500">Followers</div>
          </div>
          <div>
            <div className="font-semibold text-blue-600">+{post.reputationGain}</div>
            <div className="text-gray-500">Reputation</div>
          </div>
          <div>
            <div className="font-semibold text-amber-600">${formatMoney(post.wealthGain)}</div>
            <div className="text-gray-500">Revenue</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Social Media Hub Component
export function SocialMediaHub() {
  const [activeTab, setActiveTab] = useState<"twitter" | "instagram" | "tiktok" | "viral">("twitter");
  const socialMedia = useRapperGame(state => state.socialMedia);
  const currentWeek = useRapperGame(state => state.currentWeek);
  
  // Get all viral posts across platforms
  const viralPosts = socialMedia.flatMap(platform => platform.viralPosts || [])
    .sort((a, b) => b.postWeek - a.postWeek); // Sort by most recent
  
  const getPlatformFollowers = (platform: string) => {
    const platformData = socialMedia.find(p => p.name === platform);
    return platformData?.followers || 0;
  };
  
  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "Twitter":
        return "bg-[#1DA1F2]";
      case "Instagram":
        return "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500";
      case "TikTok":
        return "bg-black";
      default:
        return "bg-gray-800";
    }
  };
  
  const SocialMetricCard = ({ platform, icon, followers }: { platform: string, icon: React.ReactNode, followers: number }) => (
    <div className="flex flex-col">
      <div className={`rounded-t-lg ${getPlatformColor(platform)} p-2`}>
        <div className="flex justify-between items-center text-white">
          <span className="font-medium">{platform}</span>
          <div className="w-6 h-6">{icon}</div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-3 rounded-b-lg shadow">
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
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Social Media Management</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="twitter" className="flex items-center gap-2">
            <Twitter size={18} />
            <span>Twitter</span>
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
      </Tabs>
    </div>
  );
}