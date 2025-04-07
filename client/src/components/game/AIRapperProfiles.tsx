import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progressbar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MusicIcon, 
  StarIcon, 
  TwitterIcon, 
  InstagramIcon, 
  TikTokIcon,
  SpotifyIcon,
  MicrophoneIcon,
  UsersIcon
} from '@/assets/icons';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { AIRapper, Song } from '@/lib/types';

// Format number utility
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

export function AIRapperProfiles() {
  const { aiRappers, stats, songs, character } = useRapperGame();
  const [selectedRapperId, setSelectedRapperId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("tracks");
  
  // Find the selected rapper
  const selectedRapper = selectedRapperId 
    ? aiRappers.find(rapper => rapper.id === selectedRapperId)
    : null;
    
  // Random song titles for AI rappers - MOVED BEFORE USAGE TO FIX HOISTING ISSUE
  const getRandomSongTitle = (rapper: AIRapper, featuresPlayer: boolean = false) => {
    const prefixes = ['Hustle', 'Money', 'Streets', 'Dreams', 'Flow', 'Vibe', 'Life', 'Boss', 'Grind', 'Fame'];
    const suffixes = ['Season', 'Chronicles', 'Anthem', 'Life', 'Time', 'Movement', 'Gang', 'Ways', 'Talk', 'Energy'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    // Add player feature if specified
    if (featuresPlayer && character) {
      return `${prefix} ${suffix} (feat. ${character.artistName})`;
    }
    
    // Occasionally add "feat." with another AI rapper
    const hasFeature = Math.random() > 0.7;
    if (hasFeature) {
      const otherRappers = aiRappers.filter(r => r.id !== rapper.id);
      const featRapper = otherRappers[Math.floor(Math.random() * otherRappers.length)];
      return `${prefix} ${suffix} (feat. ${featRapper.name})`;
    }
    
    return `${prefix} ${suffix}`;
  };
    
  // Find songs where this AI rapper is featured by the player
  const getPlayerCollaborations = useMemo(() => {
    if (!selectedRapper) return [];
    
    return songs.filter(song => 
      song.released && 
      song.featuring.includes(selectedRapper.id)
    ).sort((a, b) => b.streams - a.streams);
  }, [selectedRapper, songs]);
  
  // Get real songs where the AI rapper features the player
  const getRealAIRapperPlayerFeatures = useMemo(() => {
    if (!selectedRapper || !character) return [];
    
    // Find songs owned by this AI rapper featuring the player
    return songs.filter(song => 
      song.released && 
      song.aiRapperOwner === selectedRapper.id && 
      song.aiRapperFeaturesPlayer
    ).sort((a, b) => b.streams - a.streams);
  }, [selectedRapper, songs, character]);
  
  // Get simulated songs for the AI rapper's own catalog (non-player features)
  const getAIRapperMainSongs = useMemo(() => {
    if (!selectedRapper || !character) return [];
    
    // Check if we have any real songs featuring the player
    const playerFeatureSongs = getRealAIRapperPlayerFeatures;
    
    // Generate realistic song data based on rapper stats
    // Base the number of songs on AI rapper's popularity and total streams
    // We'll show fewer simulated songs if we have real feature songs
    const realSongsCount = playerFeatureSongs.length;
    const songCount = Math.floor(selectedRapper.popularity / 15) + 2 - realSongsCount;
    const totalStreamShare = selectedRapper.totalStreams * 0.8; // 80% of streams go to top songs
    
    // Create songs with decreasing stream counts (power law distribution)
    const simulatedSongs = Array.from({ length: Math.max(0, songCount) }).map((_, index) => {
      // Create a realistic power law distribution of streams
      // First songs get more streams than later ones
      const powerFactor = 1.5;
      const position = index + 1;
      const streamShare = Math.pow(1 / position, powerFactor);
      
      return {
        id: `${selectedRapper.id}-song-${index}`,
        title: getRandomSongTitle(selectedRapper, false),
        streams: Math.floor(totalStreamShare * streamShare * (0.9 + Math.random() * 0.2)),
        releaseDate: Math.floor(Math.random() * 52), // Random week in the year
        isActive: index < 4 || Math.random() > 0.3, // Newer songs more likely to be active
        featuresPlayer: false,
        isRealSong: false
      };
    });
    
    // Add the real player feature songs with a flag to indicate they're real
    const enhancedRealSongs = playerFeatureSongs.map((song: Song) => ({
      id: song.id,
      title: song.title,
      streams: song.streams,
      releaseDate: song.releaseDate,
      isActive: song.isActive,
      featuresPlayer: true,
      isRealSong: true,
      tier: song.tier
    }));
    
    // Combine and sort by streams
    return [...enhancedRealSongs, ...simulatedSongs].sort((a, b) => b.streams - a.streams);
  }, [selectedRapper, character, getRealAIRapperPlayerFeatures]);
  
  // Get relationship color based on status
  const getRelationshipColor = (status?: string) => {
    switch (status) {
      case 'friend':
        return 'text-green-400';
      case 'rival':
        return 'text-orange-400';
      case 'enemy':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };
  
  // Get relationship emoji based on status
  const getRelationshipEmoji = (status?: string) => {
    switch (status) {
      case 'friend':
        return '👍';
      case 'rival':
        return '👊';
      case 'enemy':
        return '👎';
      default:
        return '😐';
    }
  };
  
  // Get personality description
  const getPersonalityDescription = (personality?: string) => {
    switch (personality) {
      case 'friendly':
        return 'Known for being approachable and collaborative. Likely to accept feature requests and maintain positive relationships.';
      case 'arrogant':
        return 'Has a high opinion of themselves and can be difficult to work with. May reject feature requests from less established artists.';
      case 'mysterious':
        return 'Rarely gives interviews or reveals personal details. Their decision-making can be unpredictable.';
      case 'controversial':
        return 'Often generates headlines for provocative statements or actions. Collaborating with them could boost visibility but may damage reputation.';
      case 'humble':
        return 'Despite their success, remains grounded and appreciative of their fans and fellow artists. Generally open to collaborations.';
      default:
        return 'Not much is known about their personality or working style.';
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      {/* Left side - Rapper list */}
      <div className="md:w-1/3 lg:w-1/4">
        <Card className="bg-black/30 border-gray-800 h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center">
                <StarIcon size={18} className="mr-2 text-yellow-500" />
                Top Artists
              </div>
              <Badge className="bg-gray-700">
                {aiRappers.length} Artists
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-3">
            <ScrollArea className="h-[600px] pr-3">
              <div className="space-y-1">
                {aiRappers
                  .sort((a, b) => b.popularity - a.popularity)
                  .map(rapper => (
                    <div 
                      key={rapper.id}
                      className={`p-2 rounded-md cursor-pointer transition-colors ${
                        selectedRapperId === rapper.id 
                          ? 'bg-gray-800 border border-gray-700' 
                          : 'hover:bg-gray-800/50'
                      }`}
                      onClick={() => setSelectedRapperId(rapper.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                          <span className="text-lg font-bold">{rapper.name.charAt(0)}</span>
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{rapper.name}</div>
                          <div className="text-xs text-gray-400 flex items-center">
                            <span className={getRelationshipColor(rapper.relationshipStatus || rapper.relationship)}>
                              {getRelationshipEmoji(rapper.relationshipStatus || rapper.relationship)}
                            </span>
                            <span className="ml-1 truncate">{rapper.style}</span>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-400">
                          {rapper.popularity}%
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
      {/* Right side - Spotify-style profile */}
      <div className="flex-1">
        {selectedRapper ? (
          <div className="h-full flex flex-col">
            {/* Spotify-style artist header */}
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-t-lg p-6">
              <div className="flex items-center gap-6">
                <div className="w-40 h-40 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center shadow-xl">
                  <span className="text-5xl font-bold">{selectedRapper.name.charAt(0)}</span>
                </div>
                
                <div>
                  <Badge className="mb-2 bg-black/30 text-white">Artist</Badge>
                  <h2 className="text-4xl font-bold mb-2">{selectedRapper.name}</h2>
                  <div className="text-sm text-gray-300">
                    {formatNumber(selectedRapper.monthlyListeners)} monthly listeners • {selectedRapper.style}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main content area */}
            <div className="flex-1 bg-gradient-to-b from-gray-900 to-black rounded-b-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Left content - Stats & popularity */}
                <div className="md:col-span-2 space-y-6">
                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center">
                        <SpotifyIcon size={16} className="mr-2 text-green-500" />
                        Artist Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Popularity</div>
                        <ProgressBar 
                          value={selectedRapper.popularity} 
                          max={100} 
                          color={selectedRapper.popularity > 70 ? "success" : "default"}
                          size="sm"
                        />
                      </div>
                      
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Monthly Listeners</div>
                        <div className="text-2xl font-bold">
                          {formatNumber(selectedRapper.monthlyListeners)}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Relationship</div>
                        <div className="flex items-center">
                          <span className={`text-lg ${getRelationshipColor(selectedRapper.relationshipStatus || selectedRapper.relationship)}`}>
                            {getRelationshipEmoji(selectedRapper.relationshipStatus || selectedRapper.relationship)}
                          </span>
                          <span className="ml-2 capitalize">{selectedRapper.relationshipStatus || selectedRapper.relationship || 'neutral'}</span>
                        </div>
                      </div>
                      
                      <Separator className="bg-gray-800" />
                      
                      {/* Social stats */}
                      <div className="space-y-2">
                        <div className="text-xs text-gray-400">Social following</div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex items-center">
                            <TwitterIcon size={14} className="mr-1 text-blue-400" />
                            <span className="text-xs">
                              {formatNumber(Math.floor(selectedRapper.monthlyListeners * 0.8))}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <InstagramIcon size={14} className="mr-1 text-pink-400" />
                            <span className="text-xs">
                              {formatNumber(Math.floor(selectedRapper.monthlyListeners * 1.2))}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <TikTokIcon size={14} className="mr-1 text-gray-200" />
                            <span className="text-xs">
                              {formatNumber(Math.floor(selectedRapper.monthlyListeners * 0.9))}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400"
                        size="sm"
                      >
                        Request Collaboration
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">About</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-300">
                      <p>
                        {selectedRapper.name} is known for {selectedRapper.style.toLowerCase()} style.
                        {selectedRapper.popularity > 80 
                          ? ` One of the biggest names in the game with a massive following.` 
                          : selectedRapper.popularity > 50 
                            ? ` A well-established artist with a solid fanbase.` 
                            : ` An up-and-coming artist gaining popularity.`
                        }
                      </p>
                      <p className="mt-2">
                        {selectedRapper.bio ? selectedRapper.bio : `${selectedRapper.name} is a ${selectedRapper.style.toLowerCase()} artist with a distinct style.`}
                      </p>
                      <p className="mt-2">
                        {(selectedRapper.relationshipStatus || selectedRapper.relationship) === 'friend'
                          ? `You have a good relationship with ${selectedRapper.name}. They're likely to accept your collaboration requests.`
                          : (selectedRapper.relationshipStatus || selectedRapper.relationship) === 'rival'
                            ? `You have a competitive relationship with ${selectedRapper.name}. Collaboration might be challenging but rewarding.`
                            : (selectedRapper.relationshipStatus || selectedRapper.relationship) === 'enemy'
                              ? `You have a negative relationship with ${selectedRapper.name}. They're unlikely to collaborate with you.`
                              : `Your relationship with ${selectedRapper.name} is neutral. Building a better connection could lead to future collaborations.`
                        }
                      </p>
                      {selectedRapper.personality && (
                        <p className="mt-2">
                          <span className="text-gray-400">Personality:</span> {getPersonalityDescription(selectedRapper.personality)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {/* Right content - Top tracks & collaborations */}
                <div className="md:col-span-3 space-y-6">
                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm flex items-center">
                          <MusicIcon size={16} className="mr-2 text-green-500" />
                          {selectedRapper.name}'s Discography
                        </CardTitle>
                        
                        {/* Add tabs for different song views */}
                        <Tabs defaultValue="tracks" className="w-auto" onValueChange={setCurrentTab}>
                          <TabsList className="bg-gray-800 h-7">
                            <TabsTrigger 
                              value="tracks" 
                              className="text-xs h-6 data-[state=active]:bg-gray-700"
                            >
                              Tracks
                            </TabsTrigger>
                            <TabsTrigger 
                              value="collabs" 
                              className="text-xs h-6 data-[state=active]:bg-gray-700"
                            >
                              Collabs <Badge className="ml-1 h-4 bg-green-800/40">{getPlayerCollaborations.length}</Badge>
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {currentTab === "tracks" && (
                        <div className="space-y-1">
                          {getAIRapperMainSongs
                            .map((song: any, index: number) => (
                              <div key={song.id} className="flex items-center py-2 hover:bg-gray-800/30 rounded px-2">
                                <div className="w-6 text-center text-gray-500">{index + 1}</div>
                                <div className="w-10 h-10 bg-gray-800 ml-2 mr-3 flex items-center justify-center">
                                  <MusicIcon size={16} className="text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">
                                    {song.title}
                                    {song.featuresPlayer && (
                                      <Badge className="ml-2 bg-purple-800/60 text-purple-300">You Featured</Badge>
                                    )}
                                    {song.isRealSong && (
                                      <Badge className="ml-2 bg-green-800/60 text-green-300">Real Track</Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {formatNumber(song.streams)} streams
                                  </div>
                                </div>
                                <div className="text-xs text-gray-400 ml-2">
                                  {song.isActive ? (
                                    <Badge className="bg-green-900/50 text-green-400">Active</Badge>
                                  ) : (
                                    <Badge className="bg-gray-800 text-gray-400">Inactive</Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                      
                      {currentTab === "collabs" && (
                        <div className="space-y-4">
                          {getPlayerCollaborations.length > 0 ? (
                            <>
                              <h3 className="text-sm text-gray-300 font-medium mb-2">Your Tracks featuring {selectedRapper.name}</h3>
                              {getPlayerCollaborations.map((song: any, index) => (
                                <div key={song.id} className="flex items-center py-2 hover:bg-gray-800/30 rounded px-2 border border-green-900/20">
                                  <div className="w-6 text-center text-gray-500">{index + 1}</div>
                                  <div className={`w-10 h-10 ml-2 mr-3 flex items-center justify-center ${
                                    !song.icon ? "bg-gray-800" :
                                    song.icon === "fire" ? "bg-gradient-to-br from-orange-600 to-red-600" :
                                    song.icon === "star" ? "bg-gradient-to-br from-yellow-400 to-yellow-600" :
                                    song.icon === "bolt" ? "bg-gradient-to-br from-blue-400 to-blue-600" :
                                    song.icon === "heart" ? "bg-gradient-to-br from-pink-400 to-purple-600" :
                                    song.icon === "dollar" ? "bg-gradient-to-br from-green-400 to-green-600" :
                                    "bg-gray-800"
                                  }`}>
                                    <MusicIcon size={16} className="text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">
                                      {song.title}
                                    </div>
                                    <div className="text-xs flex items-center">
                                      <span className="text-gray-400 mr-2">
                                        {formatNumber(song.streams)} streams
                                      </span>
                                      <Badge className="bg-gray-800/60">
                                        Tier {song.tier}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-400 ml-2">
                                    {song.isActive ? (
                                      <Badge className="bg-green-900/50 text-green-400">Active</Badge>
                                    ) : (
                                      <Badge className="bg-gray-800 text-gray-400">Inactive</Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                              
                              <div className="text-sm text-green-400 mt-3">
                                <div className="flex items-center gap-2">
                                  <UsersIcon size={14} />
                                  <span>Estimated gain for {selectedRapper.name} from your features: 
                                    {formatNumber(getPlayerCollaborations.reduce((total: number, song: any) => total + song.streams * 0.3, 0))} streams
                                  </span>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-10 text-gray-400">
                              <MicrophoneIcon size={32} className="mx-auto mb-3 opacity-40" />
                              <p>You haven't featured {selectedRapper.name} yet</p>
                              <Button 
                                className="mt-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400"
                                size="sm"
                              >
                                Feature on a Track
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Similar Artists</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {aiRappers
                          .filter(rapper => rapper.id !== selectedRapper.id)
                          .filter(rapper => rapper.style === selectedRapper.style || 
                                           Math.abs(rapper.popularity - selectedRapper.popularity) < 20)
                          .slice(0, 6)
                          .map(rapper => (
                            <div 
                              key={rapper.id}
                              className="flex items-center p-2 hover:bg-gray-800/50 rounded-md cursor-pointer"
                              onClick={() => setSelectedRapperId(rapper.id)}
                            >
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center mr-3">
                                <span className="font-bold">{rapper.name.charAt(0)}</span>
                              </div>
                              <div>
                                <div className="font-medium text-sm">{rapper.name}</div>
                                <div className="text-xs text-gray-400">Artist</div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Collaboration Potential</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Your reputation with this artist</div>
                          <ProgressBar 
                            value={Math.min(100, stats.reputation * 
                              ((selectedRapper.relationshipStatus || selectedRapper.relationship) === 'friend' ? 1.2 : 
                               (selectedRapper.relationshipStatus || selectedRapper.relationship) === 'rival' ? 0.8 : 
                               (selectedRapper.relationshipStatus || selectedRapper.relationship) === 'enemy' ? 0.5 : 1))}
                            max={100}
                            color={(selectedRapper.relationshipStatus || selectedRapper.relationship) === 'friend' ? "success" : 
                                  (selectedRapper.relationshipStatus || selectedRapper.relationship) === 'enemy' ? "danger" : "default"}
                            size="sm"
                          />
                        </div>
                        
                        <div className="text-sm text-gray-300">
                          <p>
                            {stats.reputation < 30 ? 
                              `You need to build your reputation before ${selectedRapper.name} will consider collaborating with you.` :
                             stats.reputation < 60 ?
                              `Your growing reputation gives you a chance to collaborate with ${selectedRapper.name}.` :
                              `Your strong reputation makes you an attractive collaboration partner for ${selectedRapper.name}.`
                            }
                          </p>
                          
                          <p className="mt-2">
                            {selectedRapper.popularity - stats.reputation > 30 ?
                              `This artist has a much higher popularity than you. They might be hesitant to collaborate.` :
                             Math.abs(selectedRapper.popularity - stats.reputation) <= 30 ?
                              `You and this artist have comparable popularity levels, making collaboration mutually beneficial.` :
                              `You have a higher popularity than this artist. They would likely be eager to collaborate.`
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Card className="h-full bg-black/30 border-gray-800 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                <StarIcon size={24} className="text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Select an Artist</h3>
              <p className="text-gray-400 max-w-md">
                Choose an artist from the list to view their detailed profile, 
                popular tracks, and collaboration potential.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}