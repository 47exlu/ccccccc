import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { useAudio } from '@/lib/stores/useAudio.ts';
import { useEnergyStore } from '@/lib/stores/useEnergyStore';
import { MusicIcon, ShopIcon } from '@/assets/icons';
import { Lock } from 'lucide-react';
import { SongTier, ActualSongTier } from '@/lib/types';
import { SONG_TIER_INFO } from '@/lib/gameData';

export function MusicProduction() {
  const { 
    songs, 
    stats, 
    aiRappers, 
    shopItems,
    createSong, 
    buySongFromShop,
    setScreen,
    checkSubscriptionFeatureAccess,
    showSubscriptionPrompt
  } = useRapperGame();
  const { playSuccess } = useAudio();
  const { useEnergy } = useEnergyStore();
  
  const [songTitle, setSongTitle] = useState('');
  const [selectedTier, setSelectedTier] = useState<SongTier>(3);
  const [featuringArtists, setFeaturingArtists] = useState<string[]>([]);
  const [energyError, setEnergyError] = useState<boolean>(false);
  
  // Get tier info for the selected tier
  const tierInfo = SONG_TIER_INFO[selectedTier];
  
  // Calculate energy cost based on song tier
  const getEnergyCost = (tier: SongTier): number => {
    // Higher tier songs cost more energy
    switch(tier) {
      case 0: return 10; // Free random song
      case 1: return 10; // Basic song
      case 2: return 15; // Better quality
      case 3: return 20; // Good quality
      case 4: return 25; // Hit song
      case 5: return 30; // Banger
      default: return 10;
    }
  };
  
  // Handle song creation
  const handleCreateSong = () => {
    // Reset any previous energy error
    setEnergyError(false);
    
    // Check subscription for high tier songs (4 & 5)
    if (selectedTier === 4 && !checkSubscriptionFeatureAccess('tier4_songs')) {
      showSubscriptionPrompt('tier4_songs');
      return;
    }
    
    if (selectedTier === 5 && !checkSubscriptionFeatureAccess('tier5_songs')) {
      showSubscriptionPrompt('tier5_songs');
      return;
    }
    
    // Check if player has enough energy
    const energyCost = getEnergyCost(selectedTier);
    if (!useEnergy(energyCost)) {
      // Not enough energy, show error
      setEnergyError(true);
      return;
    }
    
    // If energy and subscription checks pass, create the song
    // The store will handle the logic for randomizing free tier songs
    createSong(songTitle, selectedTier, featuringArtists);
    playSuccess();
    setSongTitle('');
    setFeaturingArtists([]);
  };
  
  // Handle shop item purchase
  const handleBuyFromShop = (itemId: string) => {
    buySongFromShop(itemId);
    playSuccess();
  };
  
  // Toggle featuring artist selection
  const toggleFeaturingArtist = (rapperId: string) => {
    if (featuringArtists.includes(rapperId)) {
      setFeaturingArtists(featuringArtists.filter(id => id !== rapperId));
    } else {
      setFeaturingArtists([...featuringArtists, rapperId]);
    }
  };
  
  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };
  
  // Get tier badge color
  const getTierColor = (tier: SongTier) => {
    switch (tier) {
      case 1: return 'bg-gray-600';
      case 2: return 'bg-blue-600';
      case 3: return 'bg-purple-600';
      case 4: return 'bg-amber-600';
      case 5: return 'bg-pink-600';
    }
  };
  
  // Sort songs by release date (newest first)
  const sortedSongs = [...songs].sort((a, b) => b.releaseDate - a.releaseDate);
  
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-indigo-900 to-black text-white p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <MusicIcon size={32} className="mr-3 text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold">Music Studio</h1>
            <p className="text-sm text-gray-400">Create and release your tracks</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="secondary"
            className="bg-gradient-to-r from-orange-900 to-red-900 text-white hover:from-orange-800 hover:to-red-800 border-none"
            onClick={() => setScreen('unreleased_songs')}
          >
            Unreleased Songs
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-transparent border-gray-600 hover:bg-gray-800"
            onClick={() => setScreen('career_dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="bg-indigo-950 border border-indigo-800">
          <TabsTrigger value="create" className="data-[state=active]:bg-indigo-800">Create Song</TabsTrigger>
          <TabsTrigger value="catalog" className="data-[state=active]:bg-indigo-800">Your Catalog</TabsTrigger>
          <TabsTrigger value="shop" className="data-[state=active]:bg-indigo-800">Song Shop</TabsTrigger>
        </TabsList>
        
        {/* Create Song Tab */}
        <TabsContent value="create" className="space-y-4">
          <Card className="bg-indigo-950/50 border-indigo-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MusicIcon size={18} className="mr-2 text-indigo-400" />
                Create New Track
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="songTitle">Song Title</Label>
                <Input 
                  id="songTitle"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder="Enter song title (or leave blank for random)"
                  className="bg-indigo-900/40 border-indigo-700 mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="songTier">Song Tier</Label>
                <Select 
                  value={selectedTier.toString()} 
                  onValueChange={(value) => setSelectedTier(parseInt(value) as SongTier)}
                >
                  <SelectTrigger className="bg-indigo-900/40 border-indigo-700 mt-1">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent className="bg-indigo-950 border-indigo-800 text-white">
                    <SelectItem value="0">
                      Free Creation - Random Quality
                    </SelectItem>
                    <SelectItem value="1">
                      Tier 1: Bad - ${formatNumber(SONG_TIER_INFO[1].cost)}
                    </SelectItem>
                    <SelectItem value="2">
                      Tier 2: Mid - ${formatNumber(SONG_TIER_INFO[2].cost)}
                    </SelectItem>
                    <SelectItem value="3">
                      Tier 3: Normal - ${formatNumber(SONG_TIER_INFO[3].cost)}
                    </SelectItem>
                    <SelectItem value="4" className="flex items-center">
                      <div className="flex items-center">
                        <span>Tier 4: Hit - ${formatNumber(SONG_TIER_INFO[4].cost)}</span>
                        <span className="ml-2 text-xs text-amber-500 flex items-center">
                          <Lock className="h-3 w-3 mr-1" /> Premium
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="5" className="flex items-center">
                      <div className="flex items-center">
                        <span>Tier 5: Banger - ${formatNumber(SONG_TIER_INFO[5].cost)}</span>
                        <span className="ml-2 text-xs text-pink-500 flex items-center">
                          <Lock className="h-3 w-3 mr-1" /> Premium+
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="mt-2 text-sm text-gray-400">
                  {selectedTier === 0 ? (
                    <>
                      <p>Create a song for free with random quality!</p>
                      <p>Chance for each tier: Tier 1 (40%), Tier 2 (40%), Tier 3 (15%), Tier 4 (4%), Tier 5 (1%)</p>
                      <p>Cost: FREE</p>
                    </>
                  ) : (
                    <>
                      <p>{tierInfo.description}</p>
                      <p>Success Chance: {tierInfo.successChance * 100}%</p>
                      <p>
                        Popularity Duration: 
                        {tierInfo.popularityWeeks === -1 
                          ? " Permanent" 
                          : ` ${tierInfo.popularityWeeks} weeks`}
                      </p>
                      <p>Cost: ${formatNumber(tierInfo.cost)}</p>
                      
                      {selectedTier === 4 && (
                        <p className="text-amber-500 flex items-center mt-1">
                          <Lock className="h-3 w-3 mr-1" /> 
                          Requires Standard or Premium subscription
                        </p>
                      )}
                      
                      {selectedTier === 5 && (
                        <p className="text-pink-500 flex items-center mt-1">
                          <Lock className="h-3 w-3 mr-1" /> 
                          Requires Premium or Platinum subscription
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <Label>Featured Artists (Optional)</Label>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {aiRappers
                    .filter(rapper => (rapper.relationshipStatus || rapper.relationship) !== "enemy")
                    .map(rapper => (
                      <div 
                        key={rapper.id}
                        className={`flex items-center justify-between p-2 rounded border ${
                          featuringArtists.includes(rapper.id) 
                            ? 'bg-indigo-800 border-indigo-600' 
                            : 'bg-indigo-900/30 border-indigo-800 hover:bg-indigo-900/60'
                        } cursor-pointer transition-colors`}
                        onClick={() => toggleFeaturingArtist(rapper.id)}
                      >
                        <div>
                          <div className="font-medium">{rapper.name}</div>
                          <div className="text-xs text-gray-400">
                            {formatNumber(rapper.monthlyListeners)} monthly listeners
                          </div>
                        </div>
                        <Badge className={`${
                          (rapper.relationshipStatus || rapper.relationship) === "friend" ? 'bg-green-600' : 'bg-gray-600'
                        }`}>
                          {(rapper.relationshipStatus || rapper.relationship) === "friend" ? "Friend" : "Neutral"}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              {energyError && (
                <div className="w-full p-2 bg-red-900/50 border border-red-700 rounded text-center text-white">
                  Not enough energy! You need {getEnergyCost(selectedTier)} energy to create this song.
                </div>
              )}
              <Button 
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                onClick={handleCreateSong}
              >
                {selectedTier === 0 ? 'Create Free Song' : `Create Song ($${formatNumber(tierInfo?.cost || 0)})`}
              </Button>
              <div className="text-xs text-amber-400 text-center">
                Energy Cost: {getEnergyCost(selectedTier)} units
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Catalog Tab */}
        <TabsContent value="catalog" className="space-y-4">
          <Card className="bg-indigo-950/50 border-indigo-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MusicIcon size={18} className="mr-2 text-indigo-400" />
                Your Song Catalog
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedSongs.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  You haven't created any songs yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedSongs.map(song => (
                    <div 
                      key={song.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-3 rounded bg-indigo-900/30 border border-indigo-800"
                    >
                      <div className="mb-2 md:mb-0">
                        <div className="font-medium flex items-center">
                          {song.title}
                          <Badge className={`ml-2 ${getTierColor(song.tier)}`}>
                            Tier {song.tier}
                          </Badge>
                          {!song.isActive && (
                            <Badge className="ml-2 bg-gray-600">Inactive</Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-400 mt-1">
                          Released: Week {song.releaseDate}
                          {song.featuring.length > 0 && (
                            <span className="ml-2">
                              Featuring: {song.featuring.map(id => {
                                const artist = aiRappers.find(r => r.id === id);
                                return artist ? artist.name : '';
                              }).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-amber-400">
                          {formatNumber(song.streams)} streams
                        </div>
                        <div className="text-xs text-gray-400">
                          ${formatNumber(Math.floor(song.streams * 0.004))} revenue
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Shop Tab */}
        <TabsContent value="shop" className="space-y-4">
          <Card className="bg-indigo-950/50 border-indigo-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <ShopIcon size={18} className="mr-2 text-indigo-400" />
                Premium Song Shop
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shopItems.map(item => (
                  <Card 
                    key={item.id}
                    className={`bg-indigo-900/30 border-indigo-800 ${
                      item.purchased ? 'opacity-50' : ''
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold">{item.name}</h3>
                        <Badge className={getTierColor(item.tier)}>
                          Tier {item.tier}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-4">
                        {item.description}
                      </p>
                      
                      <div className="text-right text-xl font-bold text-amber-400">
                        ${formatNumber(item.cost)}
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        className="w-full bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900"
                        disabled={item.purchased || stats.wealth < item.cost}
                        onClick={() => handleBuyFromShop(item.id)}
                      >
                        {item.purchased 
                          ? 'Purchased' 
                          : stats.wealth < item.cost 
                            ? 'Not Enough Money' 
                            : 'Buy Now'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
