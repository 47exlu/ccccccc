import React, { useState } from "react";
import { useRapperGame } from "@/lib/stores/useRapperGame";
import { 
  Twitter, 
  Instagram as InstagramIcon, 
  Heart, 
  Repeat, 
  MessageCircle, 
  Share,
  TrendingUp,
  User,
  BarChart,
  ChevronLeft,
  Music,
  Tv,
  ArrowBigUp,
  PenSquare,
  Plus,
} from "lucide-react";
import { formatNumber } from "./social/SocialMediaBase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TwitterPanel from "./social/TwitterPanel";
import InstagramPanel from "./social/InstagramPanel";
import TikTokPanel from "./social/TikTokPanel";
import PostCreationWizard from "./social/PostCreationWizard";

// Platform selection screens
export const SocialMediaHub: React.FC = () => {
  const { socialMedia, socialMediaStats, character, screen, setScreen } = useRapperGame();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardPlatform, setWizardPlatform] = useState<string | undefined>(undefined);

  // Go back to dashboard
  const handleBackToDashboard = () => {
    // Reset selected platform first to avoid render issues
    setSelectedPlatform(null);
    setScreen('career_dashboard');
  };

  // Open a specific platform
  const openPlatform = (platformName: string) => {
    setSelectedPlatform(platformName);
  };
  
  // Go back to platform selection from a specific platform
  const handleBackToPlatforms = () => {
    setSelectedPlatform(null);
  };
  
  // Open post creation wizard
  const openPostCreationWizard = (platform?: string) => {
    setWizardPlatform(platform);
    setIsWizardOpen(true);
  };

  // If a platform is selected, show its panel with back handler
  if (selectedPlatform === "Twitter") {
    return <TwitterPanel onBack={handleBackToPlatforms} />;
  } else if (selectedPlatform === "Instagram") {
    return <InstagramPanel onBack={handleBackToPlatforms} />;
  } else if (selectedPlatform === "TikTok") {
    return <TikTokPanel onBack={handleBackToPlatforms} />;
  }

  // Get current stats for each platform
  const getStats = (platformName: string) => {
    if (socialMediaStats) {
      if (platformName === "Twitter") {
        return socialMediaStats.twitter || { followers: 0 };
      } else if (platformName === "Instagram") {
        return socialMediaStats.instagram || { followers: 0 };
      } else if (platformName === "TikTok") {
        return socialMediaStats.tiktok || { followers: 0 };
      }
    }
    
    // If not found in stats, look in the older structure
    const platform = socialMedia.find(p => p.name === platformName);
    return {
      followers: platform?.followers || 0
    };
  };

  // Platform cards for selection
  return (
    <div className="w-full h-full overflow-auto bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Mobile-friendly header */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-6 gap-3">
          <div className="flex items-center w-full sm:w-auto justify-between">
            <Button 
              variant="ghost" 
              className="flex items-center text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={handleBackToDashboard}
            >
              <ChevronLeft className="mr-1 h-5 w-5" />
              <span className="text-sm">Back</span>
            </Button>
            <h1 className="text-2xl font-bold text-white sm:hidden">Social Media</h1>
          </div>
          
          <h1 className="text-2xl font-bold text-white hidden sm:block">Social Media</h1>
          
          <div className="flex space-x-2 w-full sm:w-auto justify-end">
            <Button 
              variant="outline" 
              className="flex items-center bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
              size="sm"
            >
              <BarChart className="mr-1 h-4 w-4" />
              <span className="text-sm">Analytics</span>
            </Button>
            <Button 
              variant="default" 
              className="flex items-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:opacity-90"
              onClick={() => openPostCreationWizard()}
              size="sm"
            >
              <PenSquare className="mr-1 h-4 w-4" />
              <span className="text-sm">Create</span>
            </Button>
          </div>
        </div>

        {/* Social Media Platforms Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Twitter */}
          <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer bg-gray-800 border-gray-700 text-white" onClick={() => openPlatform("Twitter")}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Twitter className="h-8 w-8 text-blue-500" />
                <Badge variant="outline" className="text-blue-400 border-blue-700 bg-blue-900/30">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trending
                </Badge>
              </div>
              <CardTitle className="text-xl mt-2 text-white">Twitter</CardTitle>
              <CardDescription className="text-gray-400">
                Connect with your fans
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Followers</span>
                  <span className="font-semibold text-white">{formatNumber(getStats("Twitter").followers)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Following</span>
                  <span className="font-semibold text-white">{formatNumber(Math.floor(getStats("Twitter").followers * 0.1))}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Posts</span>
                  <span className="font-semibold text-white">{socialMediaStats?.twitter?.tweets?.length || 0}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <div className="flex justify-between w-full text-xs text-gray-400 mb-2">
                <div className="flex items-center">
                  <Heart className="h-3 w-3 mr-1" />
                  <span>Likes</span>
                </div>
                <div className="flex items-center">
                  <Repeat className="h-3 w-3 mr-1" />
                  <span>Retweets</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  <span>Replies</span>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full flex items-center justify-center text-xs bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  openPostCreationWizard("Twitter");
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Create Tweet
              </Button>
            </CardFooter>
          </Card>

          {/* Instagram */}
          <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer bg-gray-800 border-gray-700 text-white" onClick={() => openPlatform("Instagram")}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  <InstagramIcon className="h-5 w-5 text-white" />
                </div>
                <Badge variant="outline" className="text-purple-400 border-purple-700 bg-purple-900/30">
                  <User className="h-3 w-3 mr-1" />
                  Visual
                </Badge>
              </div>
              <CardTitle className="text-xl mt-2 text-white">Instagram</CardTitle>
              <CardDescription className="text-gray-400">
                Share your life through photos
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Followers</span>
                  <span className="font-semibold text-white">{formatNumber(getStats("Instagram").followers)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Following</span>
                  <span className="font-semibold text-white">{formatNumber(Math.floor(getStats("Instagram").followers * 0.15))}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Posts</span>
                  <span className="font-semibold text-white">{socialMediaStats?.instagram?.posts?.length || 0}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <div className="flex justify-between w-full text-xs text-gray-400 mb-2">
                <div className="flex items-center">
                  <Heart className="h-3 w-3 mr-1" />
                  <span>Likes</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  <span>Comments</span>
                </div>
                <div className="flex items-center">
                  <Share className="h-3 w-3 mr-1" />
                  <span>Share</span>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full flex items-center justify-center text-xs bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  openPostCreationWizard("Instagram");
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Create Post
              </Button>
            </CardFooter>
          </Card>

          {/* TikTok */}
          <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer bg-gray-800 border-gray-700 text-white" onClick={() => openPlatform("TikTok")}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="h-8 w-8 rounded-xl bg-black flex items-center justify-center">
                  <div className="relative">
                    <div className="h-5 w-5 rounded-full bg-[#25f4ee] absolute -left-0.5 -top-0.5 z-10 animate-ping opacity-30"></div>
                    <div className="h-5 w-5 rounded-full bg-[#fe2c55] absolute -right-0.5 -bottom-0.5 z-0 animate-ping opacity-30"></div>
                    <div className="text-white text-xs font-bold z-20 relative">TT</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-pink-400 border-pink-700 bg-pink-900/30">
                  <Music className="h-3 w-3 mr-1" />
                  Trending
                </Badge>
              </div>
              <CardTitle className="text-xl mt-2 text-white">TikTok</CardTitle>
              <CardDescription className="text-gray-400">
                Create viral short-form videos
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Followers</span>
                  <span className="font-semibold text-white">{formatNumber(getStats("TikTok").followers)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Following</span>
                  <span className="font-semibold text-white">{formatNumber(Math.floor(getStats("TikTok").followers * 0.05))}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Videos</span>
                  <span className="font-semibold text-white">{socialMediaStats?.tiktok?.videos?.length || 0}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <div className="flex justify-between w-full text-xs text-gray-400 mb-2">
                <div className="flex items-center">
                  <Heart className="h-3 w-3 mr-1" />
                  <span>Likes</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  <span>Comments</span>
                </div>
                <div className="flex items-center">
                  <ArrowBigUp className="h-3 w-3 mr-1" />
                  <span>For You</span>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full flex items-center justify-center text-xs bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  openPostCreationWizard("TikTok");
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Create Video
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Tips & analytics - mobile optimized */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white">Social Media Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
                <li>Post consistently to grow your audience</li>
                <li>Engage with other artists and fans to build community</li>
                <li>Use trending sounds and hashtags on TikTok</li>
                <li>Share snippets of your music on Instagram</li>
                <li>Announce new releases and events on Twitter</li>
                <li>Respond to comments to boost engagement</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white">Social Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-300">Twitter Growth</span>
                    <span className="text-xs text-green-400">+{formatNumber(Math.floor(getStats("Twitter").followers * 0.03))} new</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-300">Instagram Growth</span>
                    <span className="text-xs text-green-400">+{formatNumber(Math.floor(getStats("Instagram").followers * 0.05))} new</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-300">TikTok Growth</span>
                    <span className="text-xs text-green-400">+{formatNumber(Math.floor(getStats("TikTok").followers * 0.1))} new</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-pink-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Post Creation Wizard - made responsive */}
        <PostCreationWizard
          open={isWizardOpen}
          onOpenChange={setIsWizardOpen}
          initialPlatform={wizardPlatform}
        />
      </div>
    </div>
  );
};

export default SocialMediaHub;