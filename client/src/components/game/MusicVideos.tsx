import { useState } from 'react';
import { useRapperGame } from '../../lib/stores/useRapperGame';
import { Song, MusicVideo, VideoQuality, VideoStyle, VideoSetting } from '../../lib/types';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useLoadingTransition } from '../ui/loading-transition';
import { Label } from '../ui/label';
import { MetricsCard } from '../ui/metrics-card';
import { VIDEO_COSTS } from '../../lib/gameData';
import { v4 as uuidv4 } from 'uuid';
import { ImageUploader } from '../ui/image-uploader';

/**
 * MusicVideos component for creating and managing music videos
 */
export function MusicVideos() {
  const gameState = useRapperGame();
  const { songs, musicVideos, videosPlatforms, stats, setScreen } = gameState;
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<"YouTube" | "VEVO">("YouTube");
  const [videoQuality, setVideoQuality] = useState<VideoQuality>("basic");
  const [videoStyle, setVideoStyle] = useState<VideoStyle>("performance");
  const [videoSetting, setVideoSetting] = useState<VideoSetting>("studio");

  // Filter for released songs that don't already have a music video
  const releasedSongsWithoutVideos = songs.filter(song => 
    song.released && !song.musicVideo
  );

  // Function to calculate the cost of creating a music video
  const calculateVideoCost = () => {
    if (!selectedPlatform) return 0;
    
    // Use the quality-specific cost directly instead of a base cost with multiplier
    const cost = videoQuality === "premium" 
      ? VIDEO_COSTS[selectedPlatform].premium 
      : VIDEO_COSTS[selectedPlatform].basic;
    
    return cost;
  };

  // Function to calculate expected views for a music video
  const calculateExpectedViews = () => {
    if (!selectedSong || !selectedPlatform) return { min: 0, max: 0 };
    
    const baseViewsMultiplier = videoQuality === "premium" 
      ? 2.0 // Premium videos get more views
      : 1.0;
    
    const platformMultiplier = selectedPlatform === "VEVO" 
      ? 1.25 // VEVO tends to get more views
      : 1.0;
    
    // Use song tier and total streams to calculate potential views
    const tierMultiplier = 0.8 + (selectedSong.tier * 0.2); // Higher tier songs get more views
    const songPopularity = Math.max(1000, selectedSong.streams);
    
    const baseViews = songPopularity * baseViewsMultiplier * platformMultiplier * tierMultiplier;
    
    // Add some randomness to the range
    return {
      min: Math.floor(baseViews * 0.7),
      max: Math.floor(baseViews * 1.3)
    };
  };

  // Create a new music video
  const createMusicVideo = () => {
    if (!selectedSong) return;
    
    const cost = calculateVideoCost();
    
    // Create video object
    const newVideo: MusicVideo = {
      id: uuidv4(),
      songId: selectedSong.id,
      platform: selectedPlatform,
      quality: videoQuality,
      style: videoStyle,
      setting: videoSetting,
      releaseDate: gameState.currentWeek,
      views: 0,
      likes: 0,
      isActive: true,
      streamMultiplier: videoQuality === "premium" ? 1.5 : 1.2
    };
    
    // Mark song as having a music video (use the video's ID)
    const updatedSong = {
      ...selectedSong,
      musicVideo: newVideo.id
    };
    
    // Use the game store to create the video
    gameState.createMusicVideo(newVideo, updatedSong, cost);
    
    // Reset selection
    setSelectedSong(null);
  };

  return (
    <div className="h-full p-6 bg-gradient-to-b from-black to-gray-900 text-white overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Music Video Production</h1>
        <Button 
          variant="outline" 
          onClick={() => setScreen('career_dashboard')}
          className="bg-transparent border-gray-600 hover:bg-gray-800"
        >
          Back to Dashboard
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Platform Stats Section */}
        <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {videosPlatforms.map(platform => (
            <MetricsCard
              key={platform.name}
              title={platform.name}
              value={platform.subscribers.toLocaleString()}
              icon={
                platform.name === "YouTube" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-3 17v-10l9 5.146-9 4.854z" />
                  </svg>
                )
              }
              footer={
                <div className="flex justify-between text-sm">
                  <span>{platform.videos} Videos</span>
                  <span>{platform.totalViews.toLocaleString()} Views</span>
                </div>
              }
            />
          ))}
        </div>
        
        {/* Create Video Section */}
        <div className="md:col-span-5">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Create New Music Video</CardTitle>
              <CardDescription>
                Boost your song's popularity by creating a music video
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(100vh-24rem)] pr-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="song-select">Select Song</Label>
                    <Select
                      value={selectedSong?.id || ""}
                      onValueChange={(value) => {
                        const song = songs.find(s => s.id === value);
                        setSelectedSong(song || null);
                      }}
                    >
                      <SelectTrigger id="song-select">
                        <SelectValue placeholder="Select a song" />
                      </SelectTrigger>
                      <SelectContent>
                        {releasedSongsWithoutVideos.length === 0 ? (
                          <SelectItem value="none" disabled>No eligible songs</SelectItem>
                        ) : (
                          releasedSongsWithoutVideos.map(song => (
                            <SelectItem key={song.id} value={song.id}>
                              {song.title} (Tier {song.tier})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="platform-select">Platform</Label>
                    <Select
                      value={selectedPlatform}
                      onValueChange={(value) => setSelectedPlatform(value as "YouTube" | "VEVO")}
                    >
                      <SelectTrigger id="platform-select">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YouTube">YouTube</SelectItem>
                        <SelectItem value="VEVO">VEVO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quality-select">Video Quality</Label>
                    <Select
                      value={videoQuality}
                      onValueChange={(value) => setVideoQuality(value as VideoQuality)}
                    >
                      <SelectTrigger id="quality-select">
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic (Lower Cost)</SelectItem>
                        <SelectItem value="premium">Premium (Higher Views)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="style-select">Video Style</Label>
                    <Select
                      value={videoStyle}
                      onValueChange={(value) => setVideoStyle(value as VideoStyle)}
                    >
                      <SelectTrigger id="style-select">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="story">Story-based</SelectItem>
                        <SelectItem value="artistic">Artistic</SelectItem>
                        <SelectItem value="animation">Animation</SelectItem>
                        <SelectItem value="lyric">Lyric Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="setting-select">Video Setting</Label>
                    <Select
                      value={videoSetting}
                      onValueChange={(value) => setVideoSetting(value as VideoSetting)}
                    >
                      <SelectTrigger id="setting-select">
                        <SelectValue placeholder="Select setting" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="city">City</SelectItem>
                        <SelectItem value="nature">Nature</SelectItem>
                        <SelectItem value="club">Club</SelectItem>
                        <SelectItem value="mansion">Mansion</SelectItem>
                        <SelectItem value="abstract">Abstract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedSong && (
                    <div className="pt-4 border-t mt-4">
                      <h3 className="font-semibold mb-2">Video Details</h3>
                      <p className="text-sm mb-1">Cost: ${calculateVideoCost().toLocaleString()}</p>
                      <p className="text-sm mb-1">Song: {selectedSong.title}</p>
                      <p className="text-sm mb-1">Expected Views: {calculateExpectedViews().min.toLocaleString()} - {calculateExpectedViews().max.toLocaleString()}</p>
                      <p className="text-sm">Stream Multiplier: {videoQuality === "premium" ? " 1.5x" : " 1.2x"}</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={createMusicVideo} 
                disabled={!selectedSong || stats.wealth < calculateVideoCost()}
                className="w-full"
              >
                Create Music Video (${calculateVideoCost().toLocaleString()})
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Your Videos Section */}
        <div className="md:col-span-7">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Your Music Videos</CardTitle>
              <CardDescription>
                View and manage your music video catalog
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Videos</TabsTrigger>
                  <TabsTrigger value="youtube">YouTube</TabsTrigger>
                  <TabsTrigger value="vevo">VEVO</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-0">
                  <ScrollArea className="h-[calc(100vh-22rem)]">
                    {musicVideos.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">
                        You haven't created any music videos yet.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {musicVideos.map(video => {
                          const song = songs.find(s => s.id === video.songId);
                          return song ? (
                            <VideoCard 
                              key={video.id} 
                              video={video} 
                              song={song} 
                            />
                          ) : null;
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="youtube" className="space-y-0">
                  <ScrollArea className="h-[calc(100vh-22rem)]">
                    {musicVideos.filter(v => v.platform === "YouTube").length === 0 ? (
                      <p className="text-center py-8 text-gray-500">
                        You haven't created any YouTube videos yet.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {musicVideos
                          .filter(v => v.platform === "YouTube")
                          .map(video => {
                            const song = songs.find(s => s.id === video.songId);
                            return song ? (
                              <VideoCard 
                                key={video.id} 
                                video={video} 
                                song={song} 
                              />
                            ) : null;
                          })
                        }
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="vevo" className="space-y-0">
                  <ScrollArea className="h-[calc(100vh-22rem)]">
                    {musicVideos.filter(v => v.platform === "VEVO").length === 0 ? (
                      <p className="text-center py-8 text-gray-500">
                        You haven't created any VEVO videos yet.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {musicVideos
                          .filter(v => v.platform === "VEVO")
                          .map(video => {
                            const song = songs.find(s => s.id === video.songId);
                            return song ? (
                              <VideoCard 
                                key={video.id} 
                                video={video} 
                                song={song} 
                              />
                            ) : null;
                          })
                        }
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Video Card component for displaying individual music videos
function VideoCard({ video, song }: { video: MusicVideo, song: Song }) {
  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  
  // Calculate like ratio
  const likeRatio = Math.round((video.likes / video.views) * 100);
  
  // Get week age of the video
  const gameState = useRapperGame();
  const videoAge = gameState.currentWeek - video.releaseDate;

  // Handle thumbnail selection
  const handleThumbnailSelect = (imageUrl: string) => {
    // Create a copy of the video with the new thumbnail
    const updatedVideo = {
      ...video,
      thumbnail: imageUrl
    };
    
    // Update the video in the game state
    gameState.updateMusicVideo(updatedVideo);
  };
  
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Video thumbnail */}
        <div className="w-full md:w-1/3 bg-black relative">
          {video.thumbnail ? (
            <div className="relative h-40 w-full bg-black">
              <img 
                src={video.thumbnail} 
                alt={`${song.title} thumbnail`} 
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <div 
              className={`h-40 w-full ${getVideoBackgroundClass(video.setting)} flex items-center justify-center`}
            >
              <div className="text-white text-center p-4">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${getVideoStyleClass(video.style)}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
            {getVideoDuration(song)}
          </div>
          {video.quality === "premium" && (
            <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500">
              Premium
            </Badge>
          )}
          <div className="absolute bottom-2 left-2">
            <ImageUploader 
              onImageSelected={handleThumbnailSelect} 
              buttonText="Set Thumbnail" 
              dialogTitle="Select Video Thumbnail"
              currentImage={video.thumbnail}
              imageType="video"
              aspectRatio="video"
              size="sm"
            />
          </div>
        </div>
        
        {/* Video details */}
        <div className="w-full md:w-2/3 p-4">
          <h3 className="font-bold text-lg truncate">{song.title} - Official {video.style.charAt(0).toUpperCase() + video.style.slice(1)} Video</h3>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
            <span>{video.platform === "YouTube" ? "YT" : "VEVO"}</span>
            <span>•</span>
            <span>{formatNumber(video.views)} views</span>
            <span>•</span>
            <span>{videoAge === 0 ? "Today" : videoAge === 1 ? "1 week ago" : `${videoAge} weeks ago`}</span>
          </div>
          
          <div className="mt-3 flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              <span>{formatNumber(video.likes)}</span>
            </div>
            
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${likeRatio > 90 ? 'bg-green-500' : likeRatio > 70 ? 'bg-blue-500' : 'bg-gray-500'}`}
                style={{ width: `${likeRatio}%` }}
              ></div>
            </div>
            
            <span className="text-xs">{likeRatio}%</span>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">{video.style}</Badge>
            <Badge variant="secondary">{video.setting}</Badge>
            <Badge variant="outline">{video.isActive ? 'Active' : 'Inactive'}</Badge>
            <Badge className="bg-blue-500 hover:bg-blue-600">{video.streamMultiplier}x Streams</Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Helper function to get a suitable background based on the video setting
function getVideoBackgroundClass(setting: VideoSetting): string {
  switch (setting) {
    case 'studio':
      return 'bg-gray-800';
    case 'city':
      return 'bg-gradient-to-br from-gray-700 to-gray-900';
    case 'nature':
      return 'bg-gradient-to-br from-green-700 to-green-900';
    case 'club':
      return 'bg-gradient-to-br from-purple-700 to-purple-900';
    case 'mansion':
      return 'bg-gradient-to-br from-amber-700 to-amber-900';
    case 'abstract':
      return 'bg-gradient-to-br from-blue-700 to-pink-900';
    default:
      return 'bg-gray-800';
  }
}

// Helper function to get a style class for the video play button
function getVideoStyleClass(style: VideoStyle): string {
  switch (style) {
    case 'performance':
      return 'bg-red-600';
    case 'story':
      return 'bg-blue-600';
    case 'artistic':
      return 'bg-purple-600';
    case 'animation':
      return 'bg-green-600';
    case 'lyric':
      return 'bg-amber-600';
    default:
      return 'bg-red-600';
  }
}

// Helper function to get a random but plausible video duration
function getVideoDuration(song: Song): string {
  // Higher tier songs tend to have longer videos
  const baseMinutes = 2 + Math.floor(song.tier / 2);
  const minutes = baseMinutes + Math.floor(Math.random() * 2);
  const seconds = Math.floor(Math.random() * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}