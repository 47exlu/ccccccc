import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { useAudio } from '@/lib/stores/useAudio';
import { SOCIAL_MEDIA_COSTS } from '@/lib/gameData';
import { SocialIcon } from '@/components/ui/social-icon';
import { TwitterIcon, InstagramIcon, TikTokIcon } from '@/assets/icons';

export function SocialMediaView() {
  const { socialMedia, stats, currentWeek, postOnSocialMedia, setScreen } = useRapperGame();
  const { playSuccess } = useAudio();
  
  // Get platform data
  const twitterData = socialMedia.find(p => p.name === 'Twitter');
  const instagramData = socialMedia.find(p => p.name === 'Instagram');
  const tiktokData = socialMedia.find(p => p.name === 'TikTok');
  
  // Handle posting to social media
  const handlePost = (platformName: string, content = "", images: string[] = []) => {
    postOnSocialMedia(platformName, content, images);
    playSuccess();
  };
  
  // Calculate weeks since last post
  const getWeeksSinceLastPost = (lastPostWeek: number) => {
    if (lastPostWeek === 0) return 'Never posted';
    if (currentWeek === lastPostWeek) return 'Posted this week';
    
    const diff = currentWeek - lastPostWeek;
    return diff === 1 ? '1 week ago' : `${diff} weeks ago`;
  };
  
  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + 'M';
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-900 to-black text-white p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <TwitterIcon size={32} className="mr-3 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold">Social Media</h1>
            <p className="text-sm text-gray-400">Connect with your fans and grow your following</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="bg-transparent border-gray-600 hover:bg-gray-800"
          onClick={() => setScreen('career_dashboard')}
        >
          Back to Dashboard
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Twitter Platform */}
        {twitterData && (
          <Card className="bg-gradient-to-b from-blue-950/70 to-blue-950/30 border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <TwitterIcon size={20} className="mr-2 text-[#1DA1F2]" />
                  Twitter
                </div>
                <div className="text-sm font-normal text-blue-400">Free</div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-3">
                <SocialIcon platform="twitter" size="lg" />
                
                <div className="mt-4 text-center">
                  <div className="text-2xl font-bold">{formatNumber(twitterData.followers)}</div>
                  <div className="text-sm text-gray-400">Followers</div>
                </div>
                
                <div className="w-full mt-4 grid grid-cols-2 gap-2 text-center text-sm">
                  <div>
                    <div className="text-lg font-semibold">{twitterData.posts}</div>
                    <div className="text-gray-400">Total Posts</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{twitterData.engagement}%</div>
                    <div className="text-gray-400">Engagement</div>
                  </div>
                </div>
                
                <div className="w-full mt-4 text-xs text-gray-400 text-center">
                  {getWeeksSinceLastPost(twitterData.lastPostWeek)}
                </div>
                
                <Button 
                  onClick={() => handlePost('Twitter')}
                  className="w-full mt-4 bg-[#1DA1F2] hover:bg-[#1a94df]"
                >
                  Post Tweet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Instagram Platform */}
        {instagramData && (
          <Card className="bg-gradient-to-b from-purple-950/70 to-purple-950/30 border-purple-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <InstagramIcon size={20} className="mr-2 text-[#E1306C]" />
                  Instagram
                </div>
                <div className="text-sm font-normal text-purple-400">Free</div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-3">
                <SocialIcon platform="instagram" size="lg" />
                
                <div className="mt-4 text-center">
                  <div className="text-2xl font-bold">{formatNumber(instagramData.followers)}</div>
                  <div className="text-sm text-gray-400">Followers</div>
                </div>
                
                <div className="w-full mt-4 grid grid-cols-2 gap-2 text-center text-sm">
                  <div>
                    <div className="text-lg font-semibold">{instagramData.posts}</div>
                    <div className="text-gray-400">Total Posts</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{instagramData.engagement}%</div>
                    <div className="text-gray-400">Engagement</div>
                  </div>
                </div>
                
                <div className="w-full mt-4 text-xs text-gray-400 text-center">
                  {getWeeksSinceLastPost(instagramData.lastPostWeek)}
                </div>
                
                <Button 
                  onClick={() => handlePost('Instagram')}
                  className="w-full mt-4 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:opacity-90"
                >
                  Post Photo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* TikTok Platform */}
        {tiktokData && (
          <Card className="bg-gradient-to-b from-gray-950/70 to-gray-950/30 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <TikTokIcon size={20} className="mr-2 text-white" />
                  TikTok
                </div>
                <div className="text-sm font-normal text-gray-400">Free</div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-3">
                <SocialIcon platform="tiktok" size="lg" />
                
                <div className="mt-4 text-center">
                  <div className="text-2xl font-bold">{formatNumber(tiktokData.followers)}</div>
                  <div className="text-sm text-gray-400">Followers</div>
                </div>
                
                <div className="w-full mt-4 grid grid-cols-2 gap-2 text-center text-sm">
                  <div>
                    <div className="text-lg font-semibold">{tiktokData.posts}</div>
                    <div className="text-gray-400">Total Posts</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{tiktokData.engagement}%</div>
                    <div className="text-gray-400">Engagement</div>
                  </div>
                </div>
                
                <div className="w-full mt-4 text-xs text-gray-400 text-center">
                  {getWeeksSinceLastPost(tiktokData.lastPostWeek)}
                </div>
                
                <Button 
                  onClick={() => handlePost('TikTok')}
                  className="w-full mt-4 bg-black hover:bg-gray-900 border border-gray-600"
                >
                  Post Video
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Social Media Tips */}
      <Card className="mt-8 bg-black/30 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg">Social Media Strategy Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-300 space-y-2">
          <p>
            <span className="font-semibold text-blue-400">Twitter</span> - Free to post, 
            generates modest follower growth but has lower engagement.
          </p>
          <p>
            <span className="font-semibold text-pink-400">Instagram</span> - Free to post, 
            generates better follower growth with higher engagement than Twitter.
          </p>
          <p>
            <span className="font-semibold text-gray-300">TikTok</span> - Free to post, 
            has the highest potential for viral growth and engagement.
          </p>
          <p className="text-xs text-gray-500 mt-4">
            Regular posting increases engagement and follower growth. Posts are more effective when 
            timed with new music releases.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
