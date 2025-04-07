import React, { useState, useEffect, useMemo } from 'react';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { Song } from '@/lib/types';
import { calculatePromotionCost, calculatePromotionImpact } from '@/lib/utils/gameCalculations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ChevronUp, Music, Share2, Radio, Users, TrendingUp, Award } from 'lucide-react';

const SongPromotion: React.FC = () => {
  const { songs, stats, promoteSong, streamingPlatforms, socialMedia, socialMediaStats } = useRapperGame();
  const [selectedSongId, setSelectedSongId] = useState<string>('');
  const [promotionType, setPromotionType] = useState<'social' | 'radio' | 'tour' | 'influencer' | 'all'>('social');
  const [budget, setBudget] = useState<number>(1000);
  const [intensity, setIntensity] = useState<number>(20);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('strategy');
  
  const releasedSongs = songs.filter(song => song.released && song.isActive);
  const selectedSong = songs.find(song => song.id === selectedSongId);
  
  // Calculate promotion cost based on type and intensity
  const promotionCost = selectedSong 
    ? calculatePromotionCost(promotionType, intensity, selectedSong.tier) 
    : 0;
  
  // Calculate promotion impact for preview
  const promotionImpact = useMemo(() => {
    if (!selectedSong) return null;
    
    return calculatePromotionImpact(
      promotionType,
      intensity / 50, // Convert to 0-2 scale
      selectedSong.tier,
      stats.marketing
    );
  }, [promotionType, intensity, selectedSong, stats.marketing]);
  
  // Reset budget when changing promotion type
  useEffect(() => {
    setBudget(promotionCost);
  }, [promotionType, selectedSongId, intensity, promotionCost]);
  
  // Helper function to get platform name display with emoji
  const getPlatformDisplay = (platform: string) => {
    switch (platform) {
      case 'Spotify': return '🟢 Spotify';
      case 'SoundCloud': return '🟠 SoundCloud';
      case 'iTunes': return '🔴 iTunes';
      case 'YouTube Music': return '🔴 YouTube Music';
      case 'YouTube': return '🔴 YouTube';
      case 'YouTube Vevo': return '🔴 YouTube Vevo';
      default: return platform;
    }
  };
  
  // Get impact rating for display
  const getImpactRating = (value: number) => {
    if (value >= 0.7) return { text: 'Very High', color: 'bg-green-500' };
    if (value >= 0.5) return { text: 'High', color: 'bg-green-400' };
    if (value >= 0.3) return { text: 'Medium', color: 'bg-yellow-400' };
    return { text: 'Low', color: 'bg-gray-400' };
  };

  const handlePromote = () => {
    if (!selectedSongId || budget <= 0) return;
    promoteSong(selectedSongId, budget, promotionType);
    setShowSuccessMessage(true);
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);
  };
  
  const handleBackToDashboard = () => {
    useRapperGame.setState({ screen: 'career_dashboard' });
  };

  // Determine promotion effectiveness and social media content based on type
  const getPromotionContent = () => {
    if (!selectedSong) return null;
    
    switch (promotionType) {
      case 'social':
        return {
          icon: <Share2 className="h-5 w-5 mr-2" />,
          title: 'Social Media Campaign',
          description: `A focused social media push across all platforms to promote "${selectedSong.title}". Includes targeted ads, content creation, and community engagement.`,
          sampleContent: [
            `Check out my new track "${selectedSong.title}" - streaming everywhere now! #NewMusic #${selectedSong.title.replace(/\s+/g, '')}`,
            `Been working on this one for a while. "${selectedSong.title}" is finally out! Link in bio.`,
            `The response to "${selectedSong.title}" has been amazing! Thanks for all the support! Keep streaming!`
          ]
        };
      case 'radio':
        return {
          icon: <Radio className="h-5 w-5 mr-2" />,
          title: 'Radio Promotion',
          description: `Get "${selectedSong.title}" played on radio stations with a professional radio promotion campaign. Includes outreach to DJs and program directors.`,
          sampleContent: [
            `Just heard "${selectedSong.title}" on the radio for the first time! Surreal moment! 📻✨`,
            `Big thanks to all the radio stations supporting "${selectedSong.title}" this week! Keep requesting it!`,
            `Radio tour starts next week - coming to promote "${selectedSong.title}" in major cities!`
          ]
        };
      case 'tour':
        return {
          icon: <Music className="h-5 w-5 mr-2" />,
          title: 'Tour/Live Promotion',
          description: `Promote "${selectedSong.title}" through live performances, listening parties, and special events to connect directly with fans.`,
          sampleContent: [
            `Performing "${selectedSong.title}" live tonight! Come through! Tickets in bio.`,
            `The crowd went crazy when we dropped "${selectedSong.title}" last night! Can't wait for the next show.`,
            `Special listening party for "${selectedSong.title}" this weekend - limited spots available!`
          ]
        };
      case 'influencer':
        return {
          icon: <Users className="h-5 w-5 mr-2" />,
          title: 'Influencer Marketing',
          description: `Partner with social media influencers to promote "${selectedSong.title}" to their audiences through creative collaborations.`,
          sampleContent: [
            `So excited to have @influencer dancing to my track "${selectedSong.title}" - check out their page!`,
            `This TikTok challenge for "${selectedSong.title}" is blowing up! Keep the videos coming! #${selectedSong.title.replace(/\s+/g, '')}Challenge`,
            `Thanks to all the creators making amazing content to "${selectedSong.title}" - y'all are the real MVPs!`
          ]
        };
      case 'all':
        return {
          icon: <Award className="h-5 w-5 mr-2" />,
          title: 'Full Marketing Campaign',
          description: `A comprehensive promotion strategy for "${selectedSong.title}" that combines social media, radio, live events, and influencer partnerships.`,
          sampleContent: [
            `The full campaign for "${selectedSong.title}" launches today! Check socials, radio, and look for events near you!`,
            `"${selectedSong.title}" billboards are up in major cities! Tag yourself if you spot one! #${selectedSong.title.replace(/\s+/g, '')}`,
            `Overwhelmed by the response to "${selectedSong.title}" - thanks to everyone supporting the campaign!`
          ]
        };
    }
  };

  const promotionDetails = getPromotionContent();

  return (
    <div className="p-4 max-w-4xl mx-auto h-full overflow-y-auto bg-background">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-background z-10 py-2">
        <h1 className="text-3xl font-bold">Promote Your Music</h1>
        <Button 
          variant="outline" 
          onClick={handleBackToDashboard}
          className="flex items-center"
        >
          <span className="mr-1">←</span> Back to Dashboard
        </Button>
      </div>
      
      {showSuccessMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          <span>Promotion campaign for "{selectedSong?.title}" has been launched! The effects will be visible as the song gains more streams.</span>
          <button 
            onClick={() => setShowSuccessMessage(false)}
            className="absolute top-0 right-0 mr-2 mt-2 text-green-700 hover:text-green-800"
          >
            &times;
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Song to Promote</CardTitle>
            <CardDescription>Choose a released song to promote</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="song-select">Select Song</Label>
              <Select 
                value={selectedSongId}
                onValueChange={(value: string) => setSelectedSongId(value)}
              >
                <SelectTrigger id="song-select" className="mt-1">
                  <SelectValue placeholder="Select a song" />
                </SelectTrigger>
                <SelectContent>
                  {releasedSongs.length > 0 ? (
                    releasedSongs.map(song => (
                      <SelectItem key={song.id} value={song.id}>
                        {song.title} (Tier {song.tier}) - {song.streams.toLocaleString()} streams
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No released songs available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {selectedSong && (
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Current Streams:</span>
                  <span className="font-bold">{selectedSong.streams.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Performance:</span>
                  <Badge className={
                    selectedSong.performanceType === 'viral' ? 'bg-green-500' :
                    selectedSong.performanceType === 'comeback' ? 'bg-blue-500' :
                    selectedSong.performanceType === 'flop' ? 'bg-red-500' :
                    'bg-gray-500'
                  }>
                    {selectedSong.performanceType.charAt(0).toUpperCase() + selectedSong.performanceType.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Hype Level:</span>
                  <div className="flex items-center">
                    <Progress value={selectedSong.hype || 0} className="w-24 mr-2" />
                    <span>{selectedSong.hype || 0}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Release Date:</span>
                  <span>Week {selectedSong.releaseDate}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Promotion Strategy</CardTitle>
            <CardDescription>Select a promotion type and budget</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="promotion-type">Promotion Type</Label>
              <Select
                value={promotionType}
                onValueChange={(value: 'social' | 'radio' | 'tour' | 'influencer' | 'all') => setPromotionType(value)}
              >
                <SelectTrigger id="promotion-type" className="mt-1">
                  <SelectValue placeholder="Select promotion type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social">Social Media Campaign</SelectItem>
                  <SelectItem value="radio">Radio Promotion</SelectItem>
                  <SelectItem value="influencer">Influencer Marketing</SelectItem>
                  <SelectItem value="tour">Tour/Live Promotion</SelectItem>
                  <SelectItem value="all">Full Marketing Campaign</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {promotionDetails && (
              <div className="mb-4 p-3 bg-secondary/30 rounded-md">
                <div className="flex items-center mb-1">
                  {promotionDetails.icon}
                  <span className="font-medium">{promotionDetails.title}</span>
                </div>
                <p className="text-sm text-muted-foreground">{promotionDetails.description}</p>
              </div>
            )}
            
            <div className="my-4">
              <div className="flex justify-between">
                <Label htmlFor="intensity-slider">Campaign Intensity</Label>
                <span className="text-sm font-medium">{intensity}%</span>
              </div>
              <Slider
                id="intensity-slider"
                min={10}
                max={100}
                step={5}
                value={[intensity]}
                onValueChange={(value: number[]) => setIntensity(value[0])}
                className="my-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low Effort</span>
                <span>High Impact</span>
              </div>
            </div>
            
            <div className="my-4">
              <div className="flex justify-between">
                <Label htmlFor="budget">Promotion Budget</Label>
                <span className="text-sm font-medium">${budget.toLocaleString()}</span>
              </div>
              <Slider
                id="budget"
                min={promotionCost * 0.5}
                max={Math.min(stats.wealth, promotionCost * 2)}
                step={100}
                value={[budget]}
                onValueChange={(value: number[]) => setBudget(value[0])}
                className="my-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Current wealth: ${stats.wealth.toLocaleString()}</span>
                <span>Recommended: ${promotionCost.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                onClick={handlePromote} 
                disabled={!selectedSongId || budget > stats.wealth}
                className="w-full"
                size="lg"
              >
                Launch ${budget.toLocaleString()} Promotion Campaign
              </Button>
              {budget > stats.wealth && (
                <div className="flex items-center mt-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>You don't have enough money for this promotion.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="strategy" className="flex-1">Impact Preview</TabsTrigger>
          <TabsTrigger value="content" className="flex-1">Sample Content</TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="strategy" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Promotion Impact Preview</CardTitle>
              <CardDescription>Estimated impact of your promotion campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-3">
                  <h3 className="font-bold mb-2 flex items-center">
                    <Music className="h-4 w-4 mr-1" />
                    Platform Impact
                  </h3>
                  <p className="text-sm mb-2">Estimated boost to streams on each platform:</p>
                  
                  {promotionImpact && (
                    <ul className="text-sm space-y-2">
                      {Object.entries(promotionImpact.platformReach)
                        .filter(([platform]) => streamingPlatforms.some(p => p.name === platform))
                        .sort(([, valueA], [, valueB]) => valueB - valueA)
                        .map(([platform, value]) => {
                          const rating = getImpactRating(value);
                          return (
                            <li key={platform} className="flex items-center justify-between">
                              <span>{getPlatformDisplay(platform)}</span>
                              <div className="flex items-center">
                                <div className={`w-16 h-2 ${rating.color} rounded-full mr-2`}></div>
                                <span className="text-xs">{rating.text}</span>
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  )}
                </div>
                
                <div className="border rounded-lg p-3">
                  <h3 className="font-bold mb-2 flex items-center">
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Marketing Impact
                  </h3>
                  <p className="text-sm mb-2">Your marketing skill affects promotion success:</p>
                  
                  <div className="mb-3">
                    <span className="text-xs text-muted-foreground block mb-1">Marketing Skill</span>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${stats.marketing}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs">0</span>
                      <span className="text-xs font-medium">{stats.marketing}/100</span>
                      <span className="text-xs">100</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Effectiveness Multiplier:</span>
                      <span className="font-medium">{(1 + stats.marketing/100).toFixed(2)}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Skill Gain from Campaign:</span>
                      <span className="font-medium">+{(budget/10000).toFixed(2)} points</span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-3">
                  <h3 className="font-bold mb-2 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Estimated Results
                  </h3>
                  <p className="text-sm mb-2">Expected outcomes from this campaign:</p>
                  
                  {selectedSong && promotionImpact && (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span>Streaming Growth:</span>
                        <Badge variant="outline" className="font-medium">
                          +{Math.floor(promotionImpact.streamMultiplier * 100)}%
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>New Followers:</span>
                        <Badge variant="outline" className="font-medium">
                          ~{promotionImpact.followerGain.toLocaleString()}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>New Listeners:</span>
                        <Badge variant="outline" className="font-medium">
                          ~{promotionImpact.listeners.toLocaleString()}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Reputation Gain:</span>
                        <Badge variant="outline" className="font-medium">
                          +{(budget/5000).toFixed(1)}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Hype Level Increase:</span>
                        <Badge variant="outline" className="font-medium">
                          +{Math.ceil(promotionImpact.streamMultiplier * 2)}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sample Promotion Content</CardTitle>
              <CardDescription>Examples of content that will be created for your campaign</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedSong && promotionDetails && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border shadow-sm">
                      <CardHeader className="p-3 pb-0">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                            <span className="text-lg">T</span>
                          </div>
                          <div className="ml-2">
                            <p className="font-medium text-sm">@{socialMediaStats?.twitter?.handle || 'yourartistname'}</p>
                            <p className="text-xs text-muted-foreground">Twitter</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-2">
                        <p className="text-sm">{promotionDetails.sampleContent[0]}</p>
                      </CardContent>
                      <CardFooter className="p-3 pt-0">
                        <div className="flex text-xs text-muted-foreground space-x-3">
                          <span>❤️ {Math.floor(Math.random() * 100) + 20}</span>
                          <span>🔄 {Math.floor(Math.random() * 30) + 5}</span>
                          <span>💬 {Math.floor(Math.random() * 20) + 2}</span>
                        </div>
                      </CardFooter>
                    </Card>
                    
                    <Card className="border shadow-sm">
                      <CardHeader className="p-3 pb-0">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white">
                            <span className="text-lg">I</span>
                          </div>
                          <div className="ml-2">
                            <p className="font-medium text-sm">@{socialMediaStats?.instagram?.handle || 'yourartistname'}</p>
                            <p className="text-xs text-muted-foreground">Instagram</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-2">
                        <div className="w-full h-24 bg-gray-200 rounded-md mb-2 flex items-center justify-center">
                          <span className="text-xs text-gray-500">[Album Cover]</span>
                        </div>
                        <p className="text-sm">{promotionDetails.sampleContent[1]}</p>
                      </CardContent>
                      <CardFooter className="p-3 pt-0">
                        <div className="flex text-xs text-muted-foreground space-x-3">
                          <span>❤️ {Math.floor(Math.random() * 300) + 100}</span>
                          <span>💬 {Math.floor(Math.random() * 50) + 10}</span>
                        </div>
                      </CardFooter>
                    </Card>
                    
                    <Card className="border shadow-sm">
                      <CardHeader className="p-3 pb-0">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white">
                            <span className="text-lg">TT</span>
                          </div>
                          <div className="ml-2">
                            <p className="font-medium text-sm">@{socialMediaStats?.tiktok?.handle || 'yourartistname'}</p>
                            <p className="text-xs text-muted-foreground">TikTok</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-2">
                        <div className="w-full h-32 bg-gray-200 rounded-md mb-2 flex items-center justify-center">
                          <span className="text-xs text-gray-500">[Video]</span>
                        </div>
                        <p className="text-sm">{promotionDetails.sampleContent[2]}</p>
                      </CardContent>
                      <CardFooter className="p-3 pt-0">
                        <div className="flex text-xs text-muted-foreground space-x-3">
                          <span>❤️ {Math.floor(Math.random() * 500) + 200}</span>
                          <span>💬 {Math.floor(Math.random() * 100) + 20}</span>
                          <span>↪️ {Math.floor(Math.random() * 50) + 10}</span>
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                  
                  <div className="p-3 bg-secondary/30 rounded-md mt-4">
                    <p className="text-sm mb-2"><strong>Note:</strong> These are sample posts that will be created as part of your promotion campaign. The actual content, engagement, and reach will vary based on your marketing strategy and audience.</p>
                    <p className="text-sm">When you launch the campaign, similar content will be automatically posted across your social media platforms to promote your song.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Promotion Analytics</CardTitle>
              <CardDescription>Track the performance of your promotional campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Marketing Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-3">
                      <p className="text-muted-foreground text-sm mb-1">Marketing Skill</p>
                      <p className="text-2xl font-bold">{stats.marketing}<span className="text-sm text-muted-foreground">/100</span></p>
                      <Progress value={stats.marketing} className="mt-2" />
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <p className="text-muted-foreground text-sm mb-1">Fan Loyalty</p>
                      <p className="text-2xl font-bold">{stats.fanLoyalty}<span className="text-sm text-muted-foreground">/100</span></p>
                      <Progress value={stats.fanLoyalty} className="mt-2" />
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <p className="text-muted-foreground text-sm mb-1">Reputation</p>
                      <p className="text-2xl font-bold">{stats.reputation}<span className="text-sm text-muted-foreground">/100</span></p>
                      <Progress value={stats.reputation} className="mt-2" />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Social Media Growth</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {socialMediaStats && (
                      <>
                        <div className="border rounded-lg p-3">
                          <div className="flex items-center mb-2">
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs mr-2">T</div>
                            <p className="font-medium">Twitter</p>
                          </div>
                          <p className="text-2xl font-bold">{socialMediaStats.twitter?.followers.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground mt-1">Followers</p>
                          <div className="flex justify-between mt-2">
                            <span className="text-xs">{socialMediaStats.twitter?.tweets.length} tweets</span>
                            <span className="text-xs">{socialMediaStats.twitter?.engagement}% engagement</span>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-3">
                          <div className="flex items-center mb-2">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white text-xs mr-2">I</div>
                            <p className="font-medium">Instagram</p>
                          </div>
                          <p className="text-2xl font-bold">{socialMediaStats.instagram?.followers.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground mt-1">Followers</p>
                          <div className="flex justify-between mt-2">
                            <span className="text-xs">{socialMediaStats.instagram?.posts.length} posts</span>
                            <span className="text-xs">{socialMediaStats.instagram?.engagement}% engagement</span>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-3">
                          <div className="flex items-center mb-2">
                            <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white text-xs mr-2">TT</div>
                            <p className="font-medium">TikTok</p>
                          </div>
                          <p className="text-2xl font-bold">{socialMediaStats.tiktok?.followers.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground mt-1">Followers</p>
                          <div className="flex justify-between mt-2">
                            <span className="text-xs">{socialMediaStats.tiktok?.videos.length} videos</span>
                            <span className="text-xs">{socialMediaStats.tiktok?.engagement}% engagement</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Platform Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">Streaming Platforms</h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-muted-foreground">
                            <th className="pb-2">Platform</th>
                            <th className="pb-2 text-right">Listeners</th>
                            <th className="pb-2 text-right">Streams</th>
                          </tr>
                        </thead>
                        <tbody>
                          {streamingPlatforms.map((platform) => (
                            <tr key={platform.name}>
                              <td className="py-1">{platform.name}</td>
                              <td className="py-1 text-right">{platform.listeners.toLocaleString()}</td>
                              <td className="py-1 text-right">{platform.totalStreams.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2">Recent Promotions</h4>
                      <p className="text-center text-sm text-muted-foreground py-8">Promotion history will appear here after you launch campaigns.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SongPromotion;