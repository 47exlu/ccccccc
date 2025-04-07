import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressBar } from '@/components/ui/progressbar';
import { Button } from '@/components/ui/button';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { SpotifyIcon, SoundCloudIcon, ITunesIcon, YouTubeIcon, VevoIcon, MusicIcon } from '@/assets/icons';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Type definitions for the impact dashboard
interface PlatformImpactData {
  name: string;
  color: string;
  icon: React.ReactNode;
  influence: number;  // 0-100 scale
  growth: number;     // percentage growth
  audienceReach: number;
  fanEngagement: number;
  revenueContribution: number;
  trendingScore: number;
}

interface AudienceMetric {
  platformName: string;
  color: string;
  value: number;
  percentage: number;
}

// Helper function to format numbers nicely
const formatNumber = (num: number): string => {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Format money with dollar sign
const formatMoney = (amount: number): string => {
  return '$' + formatNumber(amount);
};

export function StreamingImpactDashboard() {
  const { streamingPlatforms, videosPlatforms, songs, stats, character, setScreen } = useRapperGame();
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [selectedMetric, setSelectedMetric] = useState<'influence' | 'growth' | 'revenue'>('influence');
  
  // Get platform data
  const spotify = streamingPlatforms.find(p => p.name === 'Spotify');
  const soundCloud = streamingPlatforms.find(p => p.name === 'SoundCloud');
  const iTunes = streamingPlatforms.find(p => p.name === 'iTunes');
  const youtubeMusic = streamingPlatforms.find(p => p.name === 'YouTube Music');
  const youtube = videosPlatforms.find(p => p.name === 'YouTube');
  const vevo = videosPlatforms.find(p => p.name === 'VEVO');
  
  // Calculate total streams and revenue across all platforms
  const totalStreams = streamingPlatforms.reduce((acc, platform) => acc + platform.totalStreams, 0);
  const totalRevenue = streamingPlatforms.reduce((acc, platform) => acc + platform.revenue, 0);
  
  // Calculate weekly growth rates and set view properties for video platforms
  // This ensures backward compatibility with existing data
  const platforms = [...streamingPlatforms];
  const videoPlats = [...videosPlatforms];
  
  // Calculate estimated weekly growth for platforms that don't have it
  platforms.forEach(platform => {
    if (platform.weeklyGrowth === undefined) {
      // Estimate weekly growth as ~2-5% of total streams
      platform.weeklyGrowth = Math.round(platform.totalStreams * (0.02 + Math.random() * 0.03));
    }
  });
  
  // Set views property equal to totalViews and add weekly growth and revenue for video platforms
  videoPlats.forEach(platform => {
    // Set views as alias for totalViews
    platform.views = platform.totalViews;
    
    // Set weekly growth if not defined
    if (platform.weeklyGrowth === undefined) {
      // Estimate weekly growth as ~1-3% of total views
      platform.weeklyGrowth = Math.round(platform.totalViews * (0.01 + Math.random() * 0.02));
    }
    
    // Set revenue if not defined (YouTube/VEVO typically earn similar to streaming platforms)
    if (platform.revenue === undefined) {
      // Calculate estimated revenue (roughly $0.001-0.004 per view)
      platform.revenue = Math.round(platform.totalViews * (0.001 + Math.random() * 0.003));
    }
  });
  
  // Set total fans if not defined
  if (!stats.totalFans) {
    // Roughly estimate total fans as 20-30% of total streams
    stats.totalFans = Math.round(totalStreams * (0.2 + Math.random() * 0.1));
  }
  
  // Generate platform impact data based on streaming data
  const platformImpactData: PlatformImpactData[] = [
    {
      name: 'Spotify',
      color: '#1DB954',
      icon: <SpotifyIcon size={20} className="text-[#1DB954]" />,
      influence: spotify ? Math.min(100, (spotify.listeners / (stats.totalFans || 1)) * 100) : 0,
      growth: spotify && spotify.weeklyGrowth ? (spotify.weeklyGrowth / (spotify.totalStreams || 1)) * 100 : 0,
      audienceReach: spotify ? (spotify.listeners / (stats.totalFans || 1)) * 100 : 0,
      fanEngagement: 78,
      revenueContribution: spotify ? (spotify.revenue / (totalRevenue || 1)) * 100 : 0,
      trendingScore: 85
    },
    {
      name: 'SoundCloud',
      color: '#FF5500',
      icon: <SoundCloudIcon size={20} className="text-[#FF5500]" />,
      influence: soundCloud ? Math.min(100, (soundCloud.listeners / (stats.totalFans || 1)) * 100) : 0,
      growth: soundCloud && soundCloud.weeklyGrowth ? (soundCloud.weeklyGrowth / (soundCloud.totalStreams || 1)) * 100 : 0,
      audienceReach: soundCloud ? (soundCloud.listeners / (stats.totalFans || 1)) * 100 : 0,
      fanEngagement: 62,
      revenueContribution: soundCloud ? (soundCloud.revenue / (totalRevenue || 1)) * 100 : 0,
      trendingScore: 72
    },
    {
      name: 'iTunes',
      color: '#FB5BC5',
      icon: <ITunesIcon size={20} className="text-[#FB5BC5]" />,
      influence: iTunes ? Math.min(100, (iTunes.listeners / (stats.totalFans || 1)) * 100) : 0,
      growth: iTunes && iTunes.weeklyGrowth ? (iTunes.weeklyGrowth / (iTunes.totalStreams || 1)) * 100 : 0,
      audienceReach: iTunes ? (iTunes.listeners / (stats.totalFans || 1)) * 100 : 0,
      fanEngagement: 65,
      revenueContribution: iTunes ? (iTunes.revenue / (totalRevenue || 1)) * 100 : 0,
      trendingScore: 68
    },
    {
      name: 'YouTube Music',
      color: '#FF0000',
      icon: <YouTubeIcon size={20} className="text-[#FF0000]" />,
      influence: youtubeMusic ? Math.min(100, (youtubeMusic.listeners / (stats.totalFans || 1)) * 100) : 0,
      growth: youtubeMusic && youtubeMusic.weeklyGrowth ? (youtubeMusic.weeklyGrowth / (youtubeMusic.totalStreams || 1)) * 100 : 0,
      audienceReach: youtubeMusic ? (youtubeMusic.listeners / (stats.totalFans || 1)) * 100 : 0,
      fanEngagement: 82,
      revenueContribution: youtubeMusic ? (youtubeMusic.revenue / (totalRevenue || 1)) * 100 : 0,
      trendingScore: 88
    },
    {
      name: 'YouTube',
      color: '#FF0000',
      icon: <YouTubeIcon size={20} className="text-[#FF0000]" />,
      influence: youtube && youtube.views ? Math.min(100, (youtube.views / (totalStreams || 1)) * 75) : 0, // Videos generally have less views but more impact
      growth: youtube && youtube.weeklyGrowth && youtube.views ? (youtube.weeklyGrowth / (youtube.views || 1)) * 100 : 0,
      audienceReach: youtube && youtube.views ? (youtube.views / (totalStreams || 1)) * 100 : 0,
      fanEngagement: 90,
      revenueContribution: youtube && youtube.revenue ? (youtube.revenue / (totalRevenue || 1)) * 100 : 0,
      trendingScore: 92
    },
    {
      name: 'VEVO',
      color: '#FF0000',
      icon: <VevoIcon size={20} className="text-[#FF0000]" />,
      influence: vevo && vevo.views ? Math.min(100, (vevo.views / (totalStreams || 1)) * 85) : 0, // VEVO has high impact due to professional nature
      growth: vevo && vevo.weeklyGrowth && vevo.views ? (vevo.weeklyGrowth / (vevo.views || 1)) * 100 : 0,
      audienceReach: vevo && vevo.views ? (vevo.views / (totalStreams || 1)) * 100 : 0,
      fanEngagement: 75,
      revenueContribution: vevo && vevo.revenue ? (vevo.revenue / (totalRevenue || 1)) * 100 : 0,
      trendingScore: 80
    }
  ];

  // Sort platforms by selected metric
  const sortedPlatforms = [...platformImpactData].sort((a, b) => {
    if (selectedMetric === 'influence') return b.influence - a.influence;
    if (selectedMetric === 'growth') return b.growth - a.growth;
    return b.revenueContribution - a.revenueContribution;
  });

  // Calculate audience demographics
  const audienceByPlatform: AudienceMetric[] = platformImpactData.map(platform => {
    const platformStreams = platform.name === 'Spotify' ? spotify?.totalStreams || 0 :
                          platform.name === 'SoundCloud' ? soundCloud?.totalStreams || 0 :
                          platform.name === 'iTunes' ? iTunes?.totalStreams || 0 :
                          platform.name === 'YouTube Music' ? youtubeMusic?.totalStreams || 0 :
                          platform.name === 'YouTube' ? youtube?.views || 0 :
                          platform.name === 'VEVO' ? vevo?.views || 0 : 0;
    
    return {
      platformName: platform.name,
      color: platform.color,
      value: platformStreams,
      percentage: totalStreams > 0 ? (platformStreams / totalStreams) * 100 : 0
    };
  }).sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 to-black text-white p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-400">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
            <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
          </svg>
          <div>
            <h1 className="text-2xl font-bold">Streaming Platform Impact</h1>
            <p className="text-sm text-gray-400">Analyze your performance across streaming services</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={(value: 'weekly' | 'monthly' | 'yearly') => setTimeframe(value)}>
            <SelectTrigger className="w-32 h-8 bg-transparent border-gray-700 text-sm">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="bg-transparent border-gray-700 hover:bg-gray-800 text-sm py-1 h-8"
              onClick={() => setScreen('streaming_platforms')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M7 17l9.2-9.2M17 17V7H7"/>
              </svg>
              Back to Platforms
            </Button>
            <Button 
              variant="outline" 
              className="bg-transparent border-gray-700 hover:bg-gray-800 text-sm py-1 h-8"
              onClick={() => setScreen('career_dashboard')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="m12 19-7-7 7-7"/>
                <path d="M19 12H5"/>
              </svg>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-400">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Overall Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {formatNumber(totalStreams)}
              <span className="text-sm font-normal text-gray-400 ml-2">Total Streams</span>
            </div>
            <div className="text-xl font-semibold text-green-400 mb-4">
              {formatMoney(totalRevenue)}
              <span className="text-sm font-normal text-gray-400 ml-2">Revenue</span>
            </div>
            <div className="space-y-2">
              {audienceByPlatform.slice(0, 3).map((platform, idx) => (
                <div key={idx} className="flex items-center">
                  <div className="w-24 text-sm text-gray-400">{platform.platformName}</div>
                  <div className="flex-1 mx-2">
                    <div className="h-2 rounded-full bg-gray-700 w-full">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${platform.percentage}%`, 
                          backgroundColor: platform.color 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm">{Math.round(platform.percentage)}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-400">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              Fan Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {formatNumber(stats.totalFans || 0)}
              <span className="text-sm font-normal text-gray-400 ml-2">Total Fans</span>
            </div>
            <div className="text-xl font-semibold text-blue-400 mb-4">
              {formatNumber(
                streamingPlatforms.reduce((acc, platform) => acc + platform.listeners, 0)
              )}
              <span className="text-sm font-normal text-gray-400 ml-2">Monthly Listeners</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {platformImpactData.slice(0, 4).map((platform, idx) => (
                <div key={idx} className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    {platform.icon}
                    <span className="text-sm font-medium ml-1">{platform.name}</span>
                  </div>
                  <div className="text-lg font-bold">{platform.fanEngagement}%</div>
                  <div className="text-xs text-gray-400">Engagement Rate</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-purple-400">
                <path d="M12 20v-6M6 20V10M18 20V4"/>
              </svg>
              Platform Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {formatNumber(
                streamingPlatforms.reduce((acc, platform) => acc + (platform.weeklyGrowth || 0), 0)
              )}
              <span className="text-sm font-normal text-gray-400 ml-2">Weekly Growth</span>
            </div>
            <div className="text-xl font-semibold text-purple-400 mb-4">
              {formatNumber(
                Math.round(songs.filter(s => s.released).length * (stats.popularity || 1) / 10)
              )}
              <span className="text-sm font-normal text-gray-400 ml-2">New Listeners</span>
            </div>
            
            <div className="space-y-2">
              {platformImpactData
                .sort((a, b) => b.growth - a.growth)
                .slice(0, 3)
                .map((platform, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center">
                      {platform.icon}
                      <span className="text-sm ml-1">{platform.name}</span>
                    </div>
                    <div className="text-sm">
                      <span className={platform.growth > 0 ? "text-green-400" : "text-red-400"}>
                        {platform.growth > 0 ? '+' : ''}{platform.growth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Platform Performance Metrics</CardTitle>
            <Select value={selectedMetric} onValueChange={(value: 'influence' | 'growth' | 'revenue') => setSelectedMetric(value)}>
              <SelectTrigger className="w-40 h-8 bg-transparent border-gray-700 text-sm">
                <SelectValue placeholder="Metric" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="influence">Influence</SelectItem>
                <SelectItem value="growth">Growth</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {sortedPlatforms.map((platform, idx) => {
              const metricValue = selectedMetric === 'influence' ? platform.influence : 
                               selectedMetric === 'growth' ? platform.growth : 
                               platform.revenueContribution;
              
              const metricLabel = selectedMetric === 'influence' ? 'Influence Score' : 
                               selectedMetric === 'growth' ? 'Growth Rate' : 
                               'Revenue Share';
              
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      {platform.icon}
                      <span className="ml-2 font-medium">{platform.name}</span>
                    </div>
                    <div className="text-sm font-medium">
                      {metricValue.toFixed(1)}%
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${metricValue}%`, 
                        backgroundColor: platform.color 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{metricLabel}</span>
                    <span className="flex items-center">
                      {selectedMetric === 'influence' ? (
                        <>Trending Score: {platform.trendingScore}</>
                      ) : selectedMetric === 'growth' ? (
                        <>Audience Reach: {platform.audienceReach.toFixed(1)}%</>
                      ) : (
                        <>{formatMoney(platform.name === 'Spotify' ? spotify?.revenue || 0 : 
                                     platform.name === 'SoundCloud' ? soundCloud?.revenue || 0 : 
                                     platform.name === 'iTunes' ? iTunes?.revenue || 0 : 
                                     platform.name === 'YouTube Music' ? youtubeMusic?.revenue || 0 : 
                                     platform.name === 'YouTube' ? youtube?.revenue || 0 : 
                                     platform.name === 'VEVO' ? vevo?.revenue || 0 : 0)}</>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg">Platform-Specific Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="spotify" className="w-full">
            <TabsList className="grid grid-cols-3 lg:grid-cols-6 bg-gray-700">
              <TabsTrigger value="spotify" className="data-[state=active]:bg-[#1DB954] data-[state=active]:text-black">
                <SpotifyIcon size={16} className="mr-1" /> Spotify
              </TabsTrigger>
              <TabsTrigger value="soundcloud" className="data-[state=active]:bg-[#FF5500] data-[state=active]:text-white">
                <SoundCloudIcon size={16} className="mr-1" /> SoundCloud
              </TabsTrigger>
              <TabsTrigger value="itunes" className="data-[state=active]:bg-[#FB5BC5] data-[state=active]:text-white">
                <ITunesIcon size={16} className="mr-1" /> iTunes
              </TabsTrigger>
              <TabsTrigger value="youtubemusic" className="data-[state=active]:bg-[#FF0000] data-[state=active]:text-white">
                <YouTubeIcon size={16} className="mr-1" /> YT Music
              </TabsTrigger>
              <TabsTrigger value="youtube" className="data-[state=active]:bg-[#FF0000] data-[state=active]:text-white">
                <YouTubeIcon size={16} className="mr-1" /> YouTube
              </TabsTrigger>
              <TabsTrigger value="vevo" className="data-[state=active]:bg-[#FF0000] data-[state=active]:text-white">
                <VevoIcon size={16} className="mr-1" /> VEVO
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="spotify" className="bg-[#121212] rounded-b-lg p-4 border border-[#282828] mt-1">
              <h3 className="text-lg font-bold mb-2">Spotify Optimization</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="bg-[#1DB954] rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Create playlist-friendly tracks</p>
                    <p className="text-sm text-gray-400">Tracks between 2-4 minutes perform best on Spotify playlists.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#1DB954] rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Focus on quality metadata</p>
                    <p className="text-sm text-gray-400">Complete artist profile, genre tags, and high-quality artwork increase discoverability.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#1DB954] rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Pre-save campaigns</p>
                    <p className="text-sm text-gray-400">Run pre-save campaigns before releases to boost initial algorithm ranking.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="soundcloud" className="bg-white text-black rounded-b-lg p-4 border border-gray-200 mt-1">
              <h3 className="text-lg font-bold mb-2">SoundCloud Strategy</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="bg-[#FF5500] rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Engage with the community</p>
                    <p className="text-sm text-gray-500">Comment, like, and repost other artists' tracks to build network.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#FF5500] rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Release exclusive content</p>
                    <p className="text-sm text-gray-500">SoundCloud users value exclusive remixes, demos, and behind-the-scenes content.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#FF5500] rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Join SoundCloud Repost</p>
                    <p className="text-sm text-gray-500">Monetize and distribute your tracks through the SoundCloud ecosystem.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="itunes" className="bg-gradient-to-b from-pink-100 to-white text-black rounded-b-lg p-4 border border-gray-200 mt-1">
              <h3 className="text-lg font-bold mb-2">Apple Music & iTunes Strategy</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="bg-[#FB5BC5] rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Optimize for high-quality audio</p>
                    <p className="text-sm text-gray-600">Apple Music supports lossless and Spatial Audio - optimize your masters.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#FB5BC5] rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Focus on album releases</p>
                    <p className="text-sm text-gray-600">Apple Music users favor complete album experiences over singles.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#FB5BC5] rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Create branded artist page</p>
                    <p className="text-sm text-gray-600">Complete Apple Music for Artists profile with custom artwork and bio.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="youtubemusic" className="bg-black rounded-b-lg p-4 border border-gray-800 mt-1">
              <h3 className="text-lg font-bold mb-2">YouTube Music Strategy</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="bg-[#FF0000] rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Create "Art Tracks"</p>
                    <p className="text-sm text-gray-400">Auto-generated videos with static images can boost visibility.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#FF0000] rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Cross-promote with main YouTube</p>
                    <p className="text-sm text-gray-400">Sync content across YouTube and YouTube Music for maximum reach.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#FF0000] rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Detailed metadata is key</p>
                    <p className="text-sm text-gray-400">Complete all fields in YouTube Studio for better discoverability.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="youtube" className="bg-black rounded-b-lg p-4 border border-gray-800 mt-1">
              <h3 className="text-lg font-bold mb-2">YouTube Video Strategy</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="bg-[#FF0000] rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Invest in high-quality visuals</p>
                    <p className="text-sm text-gray-400">Professional music videos perform significantly better than audio-only.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#FF0000] rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Create content ecosystem</p>
                    <p className="text-sm text-gray-400">Supplement music videos with behind-the-scenes, lyric videos, and vlogs.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#FF0000] rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Optimize for search</p>
                    <p className="text-sm text-gray-400">Use keywords in titles, descriptions, and tags for better discoverability.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="vevo" className="bg-black rounded-b-lg p-4 border border-gray-800 mt-1">
              <h3 className="text-lg font-bold mb-2">VEVO Strategy</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="bg-[#FF0000] rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Invest in premium production</p>
                    <p className="text-sm text-gray-400">VEVO viewers expect high-quality, professionally produced videos.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#FF0000] rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Release VEVO Originals</p>
                    <p className="text-sm text-gray-400">Partner for exclusive VEVO original content for greater exposure.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#FF0000] rounded-full p-1 mr-3 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Promote to TV platforms</p>
                    <p className="text-sm text-gray-400">VEVO videos appear on connected TVs, optimize for large-screen viewing.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}