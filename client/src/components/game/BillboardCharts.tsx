import React, { useState, useEffect } from 'react';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Trophy, Music, Disc, ArrowUp, ArrowDown, Minus, BarChart2, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { calculateTotalMonthlyListeners } from '@/lib/utils/gameCalculations';

// Types for chart entries
interface ChartEntry {
  id: string;
  title: string;
  artist: string;
  image?: string;
  position: number;
  previousPosition?: number;
  weeksOnChart: number;
  isPlayer: boolean;
  score?: number; // Score used for ranking calculation
}

interface ArtistRank {
  id: string;
  name: string;
  image?: string;
  score: number; // Monthly listeners count
  trend: 'up' | 'down' | 'same';
  isPlayer: boolean;
  rank?: number; // Global artist rank (1-500)
}

interface AlbumChartEntry {
  id: string;
  title: string;
  artist: string;
  image?: string;
  position: number;
  previousPosition?: number;
  weeksOnChart: number;
  isPlayer: boolean;
  score?: number; // Score used for ranking calculation
}

const BillboardCharts: React.FC = () => {
  const { setScreen, character, songs, albums, aiRappers } = useRapperGame();
  const [activeTab, setActiveTab] = useState<string>('hot100');
  const [hot100Chart, setHot100Chart] = useState<ChartEntry[]>([]);
  const [albumChart, setAlbumChart] = useState<AlbumChartEntry[]>([]);
  const [artistRankings, setArtistRankings] = useState<ArtistRank[]>([]);

  // Helper functions to generate random titles
  const generateSongTitle = (): string => {
    const prefixes = ['Trap', 'Money', 'Dream', 'Hustle', 'Street', 'City', 'Love', 'Pain', 'Night', 'Day'];
    const suffixes = ['Life', 'Flow', 'Grind', 'Vibes', 'Nights', 'Time', 'Game', 'World', 'Story', 'Dreams'];
    
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
  };
  
  const generateAlbumTitle = (): string => {
    const titles = [
      'The Blueprint', 'Life After Death', 'Ready to Die', 'Illmatic', 'All Eyez on Me',
      'The Chronic', 'Midnight Memories', 'Straight Outta Nowhere', 'King of the City',
      'Future Nostalgia', 'Back in Black', 'Legends Never Die', 'Trap House 5'
    ];
    
    return titles[Math.floor(Math.random() * titles.length)];
  };

  // Generate Hot 100 Songs chart
  const generateHot100Chart = () => {
    // Calculate player song scores based on streams, performance, stats, etc.
    const playerSongsCalculated = songs.filter(song => song.released).map(song => {
      // Calculate a score that determines chart position (higher is better)
      const baseScore = song.streams || 0;
      const performanceBonus = 
        song.performanceType === 'viral' ? 3 : 
        song.performanceType === 'comeback' ? 1.5 : 
        song.performanceType === 'flop' ? 0.5 : 1;
      
      // Random factor to add some variability
      const randomFactor = Math.random() * 0.4 + 0.8; // 0.8 to 1.2 multiplier
      
      const score = baseScore * performanceBonus * randomFactor;
      
      return {
        id: song.id,
        title: song.title,
        artist: character?.artistName || 'You',
        image: song.coverArt,
        score: score,
        position: 0, // Will be set after sorting
        previousPosition: Math.floor(Math.random() * 100) + 1,
        weeksOnChart: Math.floor(Math.random() * 10) + 1,
        isPlayer: true
      };
    });

    // Generate AI songs for the chart with persistence
    // Store in a ref to maintain consistency between renders
    const aiSongs: ChartEntry[] = [];
    
    // Each AI rapper has 1-5 songs on the chart based on their popularity
    aiRappers.forEach(rapper => {
      // More popular rappers have more songs on the chart
      const popularityFactor = rapper.popularity / 100; // 0 to 1
      const songCount = Math.floor(popularityFactor * 5) + 1; // 1 to 6 songs
      
      for (let i = 0; i < songCount; i++) {
        // Calculate base score from monthly listeners
        const baseScore = rapper.monthlyListeners * (Math.random() * 0.01 + 0.005); // 0.5% to 1.5% of monthly listeners
        
        // Add randomness but ensure higher popularity artists tend to chart higher
        const popularityBonus = rapper.popularity * 1000; // Add bonus based on popularity
        const randomFactor = Math.random() * 0.5 + 0.75; // 0.75 to 1.25 multiplier
        
        const score = (baseScore + popularityBonus) * randomFactor;
        
        aiSongs.push({
          id: `ai-song-${rapper.id}-${i}`,
          title: generateSongTitle(),
          artist: rapper.name,
          image: rapper.image,
          score: score,
          position: 0, // Will be set after sorting
          previousPosition: Math.floor(Math.random() * 100) + 1,
          weeksOnChart: Math.floor(Math.random() * 15) + 1,
          isPlayer: false
        });
      }
    });

    // Combine player and AI songs, sort by score (higher score = better position)
    const allSongs = [...playerSongsCalculated, ...aiSongs]
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map((song, index) => ({...song, position: index + 1})); // Reassign positions to be sequential

    setHot100Chart(allSongs.slice(0, 100)); // Limit to top 100
  };

  // Generate Album chart
  const generateAlbumChart = () => {
    // Calculate player album scores based on song inclusions, performance, stats, etc.
    const playerAlbumsCalculated = (albums || []).filter(album => album.released).map(album => {
      // Calculate a score for the album based on its popularity and songs
      // Use platform-specific streams if available, otherwise use total streams
      let totalAlbumStreams = album.streams || 0;
      
      // Add streams from specific platforms if available
      if (album.platformStreams) {
        const platformTotal = Object.values(album.platformStreams).reduce((sum, streams) => sum + streams, 0);
        // If platform streams are available but total is 0, use platform total
        if (platformTotal > 0) {
          totalAlbumStreams = platformTotal;
        }
      }
      
      // Use total streams with a base minimum to ensure all albums have some presence
      const baseScore = 50000 + totalAlbumStreams;
      
      // Newer albums tend to chart higher
      // Use album release week to determine recency, default to 0 if undefined
      const releaseWeek = album.releaseDate ?? 0;
      const currentWeek = useRapperGame.getState().currentWeek ?? 1; // Get currentWeek from game state
      const recencyBonus = Math.max(0, 20 - releaseWeek); // Newer releases get more points
      
      // Add randomness
      const randomFactor = Math.random() * 0.4 + 0.8; // 0.8 to 1.2 multiplier
      
      const score = baseScore * (1 + (recencyBonus * 0.05)) * randomFactor;
      
      // Calculate weeks on chart
      const weeksOnChart = releaseWeek > 0 ? 
        Math.max(1, Math.min(20, currentWeek - releaseWeek)) : 
        Math.floor(Math.random() * 10) + 1;
      
      return {
        id: album.id,
        title: album.title,
        artist: character?.artistName || 'You',
        image: album.coverArt,
        score: score,
        position: 0, // Will be set after sorting
        previousPosition: Math.floor(Math.random() * 100) + 1,
        weeksOnChart: weeksOnChart,
        isPlayer: true
      };
    });

    // Generate AI albums for the chart with persistence
    const aiAlbums: AlbumChartEntry[] = [];
    
    aiRappers.forEach(rapper => {
      // More popular rappers have more albums on the chart
      // Each rapper has 0-3 albums based on their career longevity/popularity
      const albumCount = Math.floor((rapper.popularity / 100) * 3); 
      
      for (let i = 0; i < albumCount; i++) {
        // Calculate base score from monthly listeners
        const baseScore = rapper.monthlyListeners * (Math.random() * 0.02 + 0.01); // 1% to 3% of monthly listeners
        
        // Add randomness but ensure higher popularity artists tend to chart higher
        const popularityBonus = rapper.popularity * 500; // Add bonus based on popularity
        const randomFactor = Math.random() * 0.5 + 0.75; // 0.75 to 1.25 multiplier
        
        // Older albums (higher i value) have less score
        const albumAgeMultiplier = 1 - (i * 0.2); // First album full score, second 0.8x, third 0.6x
        
        const score = (baseScore + popularityBonus) * randomFactor * albumAgeMultiplier;
        
        aiAlbums.push({
          id: `ai-album-${rapper.id}-${i}`,
          title: generateAlbumTitle(),
          artist: rapper.name,
          image: rapper.image,
          score: score,
          position: 0, // Will be set after sorting
          previousPosition: Math.floor(Math.random() * 100) + 1,
          weeksOnChart: Math.floor(Math.random() * 20) + 1,
          isPlayer: false
        });
      }
    });

    // Combine player and AI albums, sort by score (higher score = better position)
    const allAlbums = [...playerAlbumsCalculated, ...aiAlbums]
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map((album, index) => ({...album, position: index + 1})); // Reassign positions to be sequential

    setAlbumChart(allAlbums.slice(0, 100)); // Limit to top 100
  };

  // Generate Artist Rankings
  const generateArtistRankings = () => {
    // Get game state to access player stats and streaming platforms
    const gameState = useRapperGame.getState();
    
    // Calculate player's monthly listeners using the same function as ArtistProfile
    // This ensures consistency across the app
    const playerMonthlyListeners = calculateTotalMonthlyListeners(gameState.streamingPlatforms || []);
    
    // Determine trend direction based on recent performance
    // Default to "same" if we can't calculate a trend
    let playerTrend: 'up' | 'down' | 'same' = 'same';
    
    // If there are any viral songs, trend is up
    if (songs.some(song => song.released && song.isActive && song.performanceType === 'viral')) {
      playerTrend = 'up';
    } 
    // If more flops than normal songs, trend is down
    else if (songs.filter(song => song.released && song.isActive && song.performanceType === 'flop').length >
             songs.filter(song => song.released && song.isActive && !song.performanceType).length) {
      playerTrend = 'down';
    }
    
    // Player ranking object
    const playerRanking: ArtistRank = {
      id: 'player',
      name: character?.artistName || 'You',
      image: character?.image,
      score: playerMonthlyListeners,
      trend: playerTrend,
      isPlayer: true,
      rank: 0 // Will be set after sorting
    };

    // AI rapper rankings with consistent and realistic monthly listeners
    const aiRankings: ArtistRank[] = aiRappers.map(rapper => {
      // Monthly listeners directly from AI rapper definition
      const monthlyListeners = rapper.monthlyListeners;
      
      // Calculate trend based on their career stage
      // More established artists tend to have more stable listener counts
      const popularityFactor = rapper.popularity / 100; // 0 to 1
      
      // Higher popularity = more chance of stability or growth
      // Lower popularity = more volatility
      let trend: 'up' | 'down' | 'same';
      
      if (popularityFactor > 0.8) {
        // Very popular artists most likely stay stable or go up
        const trendRoll = Math.random();
        trend = trendRoll < 0.4 ? 'same' : (trendRoll < 0.8 ? 'up' : 'down');
      } else if (popularityFactor > 0.5) {
        // Medium popularity - more even distribution
        const trendRoll = Math.random();
        trend = trendRoll < 0.33 ? 'up' : (trendRoll < 0.66 ? 'same' : 'down');
      } else {
        // Lower popularity - more volatility
        const trendRoll = Math.random();
        trend = trendRoll < 0.4 ? 'down' : (trendRoll < 0.7 ? 'same' : 'up');
      }
      
      return {
        id: rapper.id,
        name: rapper.name,
        image: rapper.image,
        score: monthlyListeners,
        trend: trend,
        isPlayer: false,
        rank: 0 // Will be set after sorting
      };
    });

    // Combine and sort by score (higher score = better ranking)
    const allRankings = [playerRanking, ...aiRankings]
      .sort((a, b) => b.score - a.score)
      .map((artist, index) => ({...artist, rank: index + 1})); // Assign rankings

    setArtistRankings(allRankings);
  };

  // Renders chart movement indicator
  const renderTrendIndicator = (current: number, previous?: number) => {
    if (!previous) return <Minus className="text-gray-400 h-4 w-4" />;
    
    if (current < previous) {
      return <ArrowUp className="text-green-500 h-4 w-4" />;
    } else if (current > previous) {
      return <ArrowDown className="text-red-500 h-4 w-4" />;
    } else {
      return <Minus className="text-gray-400 h-4 w-4" />;
    }
  };

  // Generate Billboard charts data based on game state
  useEffect(() => {
    generateHot100Chart();
    generateAlbumChart();
    generateArtistRankings();
  }, [songs, albums, aiRappers]);

  return (
    <div className="p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-6 gap-2">
        <Button variant="ghost" size="sm" onClick={() => setScreen('career_dashboard')} className="p-1 sm:p-2">
          <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Back
        </Button>
        <h1 className="text-xl sm:text-3xl font-bold mx-auto sm:mx-0 leading-tight">Billboard Charts</h1>
        <div className="hidden sm:block w-[100px]"></div> {/* Spacer for better centering on desktop */}
      </div>
      
      <Tabs defaultValue="hot100" className="mb-3 sm:mb-6" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="hot100" className="text-[10px] xs:text-xs sm:text-sm px-1 sm:px-3 py-1 h-auto">
            <Music className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> 
            <span className="hidden xxs:inline">Hot</span> 100
          </TabsTrigger>
          <TabsTrigger value="albums" className="text-[10px] xs:text-xs sm:text-sm px-1 sm:px-3 py-1 h-auto">
            <Disc className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> 
            <span className="hidden xxs:inline">Billboard</span> 200
          </TabsTrigger>
          <TabsTrigger value="artists" className="text-[10px] xs:text-xs sm:text-sm px-1 sm:px-3 py-1 h-auto">
            <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> 
            <span className="hidden xxs:inline">Artist</span> Rankings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="hot100" className="p-2">
          <Card className="bg-gradient-to-r from-pink-500/20 to-orange-500/20 p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="flex items-center">
              <BarChart2 className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-pink-500" />
              <div>
                <h2 className="font-bold text-base sm:text-xl">Billboard Hot 100</h2>
                <p className="text-xs sm:text-sm text-gray-500">Top songs ranked by streaming, radio airplay and sales</p>
              </div>
            </div>
          </Card>
          
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-2">
              {hot100Chart.map((entry) => (
                <div 
                  key={entry.id}
                  className={`flex items-center border-b border-gray-200 dark:border-gray-800 p-1.5 sm:p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-md ${
                    entry.isPlayer ? 'bg-primary/5 border-primary/20' : ''
                  }`}
                >
                  {/* Position and trend indicators with smaller widths on mobile */}
                  <div className="text-sm sm:text-xl font-bold min-w-[16px] sm:min-w-[30px] w-4 sm:w-8 text-center">{entry.position}</div>
                  <div className="flex items-center min-w-[16px] sm:min-w-[30px] w-4 sm:w-8 justify-center">
                    {renderTrendIndicator(entry.position, entry.previousPosition)}
                  </div>
                  
                  {/* Album art with smaller dimensions on mobile */}
                  <div className="min-w-[28px] sm:min-w-[40px] w-7 sm:w-10 h-7 sm:h-10 bg-gray-200 rounded-md overflow-hidden mr-1 sm:mr-2">
                    {entry.image ? (
                      <img src={entry.image} alt={entry.title} className="w-full h-full object-cover" />
                    ) : (
                      <Music className="h-full w-full p-0.5 sm:p-2 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Song title and artist with improved display */}
                  <div className="flex-grow min-w-0 mr-1">
                    <div className="font-medium text-xs sm:text-base leading-tight truncate">{entry.title}</div>
                    <div className="text-[10px] sm:text-sm text-gray-500 flex items-center">
                      <span className="truncate max-w-[180px] sm:max-w-[300px] inline-block">{entry.artist}</span>
                      {entry.isPlayer && (
                        <Badge variant="outline" className="ml-1 text-[8px] sm:text-[10px] py-0 h-4 sm:h-auto">You</Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Weeks on chart info */}
                  <div className="text-[8px] sm:text-xs text-gray-500 text-right whitespace-nowrap flex-shrink-0">
                    <div className="flex flex-col sm:flex-row">
                      <span>{entry.weeksOnChart} {entry.weeksOnChart === 1 ? 'wk' : 'wks'}</span>
                      <span className="hidden sm:inline">&nbsp;on chart</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="albums" className="p-2">
          <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="flex items-center">
              <Disc className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-500" />
              <div>
                <h2 className="font-bold text-base sm:text-xl">Billboard 200</h2>
                <p className="text-xs sm:text-sm text-gray-500">Top albums ranked by sales and streaming</p>
              </div>
            </div>
          </Card>
          
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-2">
              {albumChart.map((entry) => (
                <div 
                  key={entry.id}
                  className={`flex items-center border-b border-gray-200 dark:border-gray-800 p-1.5 sm:p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-md ${
                    entry.isPlayer ? 'bg-primary/5 border-primary/20' : ''
                  }`}
                >
                  {/* Position and trend indicators with smaller widths on mobile */}
                  <div className="text-sm sm:text-xl font-bold min-w-[16px] sm:min-w-[30px] w-4 sm:w-8 text-center">{entry.position}</div>
                  <div className="flex items-center min-w-[16px] sm:min-w-[30px] w-4 sm:w-8 justify-center">
                    {renderTrendIndicator(entry.position, entry.previousPosition)}
                  </div>
                  
                  {/* Album art with smaller dimensions on mobile */}
                  <div className="min-w-[28px] sm:min-w-[40px] w-7 sm:w-10 h-7 sm:h-10 bg-gray-200 rounded-md overflow-hidden mr-1 sm:mr-2">
                    {entry.image ? (
                      <img src={entry.image} alt={entry.title} className="w-full h-full object-cover" />
                    ) : (
                      <Disc className="h-full w-full p-0.5 sm:p-2 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Album title and artist with improved display */}
                  <div className="flex-grow min-w-0 mr-1">
                    <div className="font-medium text-xs sm:text-base leading-tight truncate">{entry.title}</div>
                    <div className="text-[10px] sm:text-sm text-gray-500 flex items-center">
                      <span className="truncate max-w-[180px] sm:max-w-[300px] inline-block">{entry.artist}</span>
                      {entry.isPlayer && (
                        <Badge variant="outline" className="ml-1 text-[8px] sm:text-[10px] py-0 h-4 sm:h-auto">You</Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Weeks on chart info */}
                  <div className="text-[8px] sm:text-xs text-gray-500 text-right whitespace-nowrap flex-shrink-0">
                    <div className="flex flex-col sm:flex-row">
                      <span>{entry.weeksOnChart} {entry.weeksOnChart === 1 ? 'wk' : 'wks'}</span>
                      <span className="hidden sm:inline">&nbsp;on chart</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="artists" className="p-2">
          <Card className="bg-gradient-to-r from-yellow-500/20 to-green-500/20 p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="flex items-center">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-yellow-500" />
              <div>
                <h2 className="font-bold text-base sm:text-xl">Artist Rankings</h2>
                <p className="text-xs sm:text-sm text-gray-500">Top artists ranked by popularity and influence</p>
              </div>
            </div>
          </Card>
          
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-4">
              {artistRankings.map((artist, index) => (
                <Card 
                  key={artist.id}
                  className={`p-1.5 sm:p-3 ${artist.isPlayer ? 'bg-primary/5 border-primary/20' : ''}`}
                >
                  <div className="flex items-center">
                    {/* Ranking position number with responsive sizing */}
                    <div className="text-sm sm:text-2xl font-bold min-w-[20px] sm:min-w-[30px] w-5 sm:w-8 text-center">#{index + 1}</div>
                    
                    {/* Artist profile image with responsive sizing */}
                    <div className="min-w-[28px] sm:min-w-[40px] w-7 h-7 sm:w-14 sm:h-14 bg-gray-200 rounded-full overflow-hidden mx-1 sm:mx-3">
                      {artist.image ? (
                        <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                      ) : (
                        <Music className="h-full w-full p-0.5 sm:p-3 text-gray-400" />
                      )}
                    </div>
                    
                    {/* Artist information with improved mobile layout */}
                    <div className="flex-grow min-w-0">
                      <div className="font-bold text-[11px] sm:text-lg flex items-center flex-wrap leading-tight">
                        <span className="truncate max-w-[180px] sm:max-w-[350px] mr-1 inline-block">{artist.name}</span>
                        {artist.isPlayer && (
                          <Badge variant="outline" className="text-[8px] sm:text-xs py-0 h-4 sm:h-5">You</Badge>
                        )}
                      </div>
                      <div className="text-[10px] sm:text-sm flex items-center gap-1 flex-wrap leading-tight">
                        <span className="truncate inline-block">Listeners: {artist.score.toLocaleString()}</span>
                        <span className="flex items-center gap-1">
                          {artist.trend === 'up' && (
                            <>
                              <TrendingUp className="text-green-500 h-2.5 w-2.5 sm:h-4 sm:w-4" />
                              <span className="text-green-500 text-[8px] sm:text-xs">Viral</span>
                            </>
                          )}
                          {artist.trend === 'down' && (
                            <>
                              <ArrowDown className="text-red-500 h-2.5 w-2.5 sm:h-4 sm:w-4" />
                              <span className="text-red-500 text-[8px] sm:text-xs">Flopping</span>
                            </>
                          )}
                          {artist.trend === 'same' && (
                            <>
                              <Minus className="text-gray-400 h-2.5 w-2.5 sm:h-4 sm:w-4" />
                              <span className="text-gray-400 text-[8px] sm:text-xs">Stable</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillboardCharts;