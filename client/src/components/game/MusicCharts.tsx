import { useState, useMemo, useEffect } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip as UITooltip } from '@/components/ui/tooltip';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  LineChart, 
  Line, 
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  MusicIcon, 
  SpotifyIcon, 
  StarIcon 
} from '@/assets/icons';
import { 
  Trophy as TrophyIcon, 
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  Award as AwardIcon, 
  Star as StarIcon2,
  Users as UsersIcon,
  Info as InfoIcon,
  Crown as CrownIcon,
  Radio as RadioIcon,
  Headphones as HeadphonesIcon
} from 'lucide-react';
import { Song as BaseSong, AIRapper, SongPerformanceType, StreamingPlatform } from '@/lib/types';
import { formatNumber, formatMoney } from '@/lib/utils';

// Extended Song type with additional properties for the charts
interface Song extends BaseSong {
  isPlayerSong?: boolean;
  artistName?: string;
  artistImage?: string;
  genre?: string;
  weeklyChange?: number;
  color?: string;
  ranking?: number;
  previousRanking?: number;
  popularity?: number; // 0-100 scale for song popularity
  revenue?: number;
  platformStreamDistribution?: Record<string, number>; // Platform-specific stream distribution
}

// Define different chart types
type ChartType = 'weekly' | 'allTime' | 'genre' | 'platform';
type ChartPeriod = 'thisWeek' | 'lastMonth' | 'allTime';

// Timeframe for the charts
interface ChartTimeframe {
  label: string;
  value: ChartPeriod;
}

const timeframes: ChartTimeframe[] = [
  { label: 'This Week', value: 'thisWeek' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'All Time', value: 'allTime' },
];

// Helper to get color based on chart position
const getPositionColor = (position: number): string => {
  switch (position) {
    case 1: return 'text-yellow-400';
    case 2: return 'text-gray-300';
    case 3: return 'text-amber-600';
    default: return 'text-white';
  }
};

// Helper to get background based on chart position
const getPositionBackground = (position: number): string => {
  switch (position) {
    case 1: return 'bg-yellow-950/30 border-yellow-800/50';
    case 2: return 'bg-gray-800/30 border-gray-700/50';
    case 3: return 'bg-amber-950/30 border-amber-800/50';
    default: return 'bg-gray-900/20 border-gray-800/50';
  }
};

// Helper to get badge color based on performance type
const getPerformanceColor = (type: SongPerformanceType): string => {
  switch (type) {
    case 'viral': return 'bg-green-500/20 text-green-400 border-green-600/30';
    case 'flop': return 'bg-red-500/20 text-red-400 border-red-600/30';
    case 'comeback': return 'bg-blue-500/20 text-blue-400 border-blue-600/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-600/30';
  }
};

// Helper to get performance badge text
const getPerformanceText = (type: SongPerformanceType): string => {
  switch (type) {
    case 'viral': return 'Viral';
    case 'flop': return 'Flopping';
    case 'comeback': return 'Comeback';
    default: return 'Stable';
  }
};

// Helper to render the weekly change indicator
const WeeklyChangeIndicator = ({ change }: { change?: number }) => {
  if (change === undefined) return <span className="text-gray-500">-</span>;
  
  if (change > 0) {
    return <span className="text-green-500">+{change}</span>;
  } else if (change < 0) {
    return <span className="text-red-500">{change}</span>;
  } else {
    return <span className="text-gray-500">-</span>;
  }
};

export function MusicCharts() {
  const { songs, aiRappers, character, streamingPlatforms, currentWeek, stats } = useRapperGame();
  const [selectedTab, setSelectedTab] = useState<ChartType>('weekly');
  const [timeframe, setTimeframe] = useState<ChartPeriod>('thisWeek');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>(streamingPlatforms[0]?.name || 'Spotify');
  
  // Get unique genres from AI rappers
  const genres = useMemo(() => {
    const genreSet = new Set<string>();
    aiRappers.forEach(rapper => {
      const style = rapper.style.toLowerCase();
      if (style.includes('trap')) genreSet.add('Trap');
      else if (style.includes('drill')) genreSet.add('Drill');
      else if (style.includes('old school')) genreSet.add('Old School');
      else if (style.includes('melodic')) genreSet.add('Melodic');
      else genreSet.add('Other');
    });
    return ['all', ...Array.from(genreSet)];
  }, [aiRappers]);
  
  const { toast } = useToast();

  // Calculate player's position in overall rankings
  const playerRanking = useMemo(() => {
    // Calculate total streams across all platforms
    const totalPlayerStreams = songs.filter(s => s.released).reduce((sum, song) => sum + song.streams, 0);
    
    // Get total AI streams for comparison
    const aiRapperStreams = aiRappers.map(rapper => ({
      id: rapper.id,
      name: rapper.name,
      streams: rapper.totalStreams,
      monthlyListeners: rapper.monthlyListeners,
      image: rapper.image
    }));
    
    // Add player data
    const allArtists = [
      {
        id: 'player',
        name: character?.artistName || 'You',
        streams: totalPlayerStreams,
        monthlyListeners: streamingPlatforms.reduce((sum, platform) => sum + platform.listeners, 0),
        image: character?.image
      },
      ...aiRapperStreams
    ].sort((a, b) => b.streams - a.streams);
    
    // Find player's ranking
    const playerRankIndex = allArtists.findIndex(a => a.id === 'player');
    const ranking = playerRankIndex + 1;
    
    return {
      ranking,
      totalArtists: allArtists.length,
      percentile: Math.round(((allArtists.length - ranking) / allArtists.length) * 100),
      topArtist: allArtists[0],
      nearbyArtists: allArtists.slice(Math.max(0, playerRankIndex - 1), playerRankIndex + 2)
    };
  }, [songs, aiRappers, character, streamingPlatforms]);

  // Get all songs (both player's and AI rappers')
  const allSongs = useMemo(() => {
    // Start with player's released songs
    const playerSongs = songs.filter(s => s.released).map(song => {
      // Calculate a reasonable weekly change based on song performance
      let weeklyChange = 0;
      if (song.performanceType === 'viral') {
        weeklyChange = Math.floor(Math.random() * 3) + 1; // +1 to +3
      } else if (song.performanceType === 'flop') {
        weeklyChange = -Math.floor(Math.random() * 3) - 1; // -1 to -3
      } else if (song.performanceType === 'comeback') {
        weeklyChange = Math.floor(Math.random() * 4) + 1; // +1 to +4
      } else {
        weeklyChange = Math.floor(Math.random() * 3) - 1; // -1 to +1
      }
      
      // Calculate popularity score (0-100)
      const popularity = Math.min(100, Math.round((song.streams / 10000) * 20) + 
        (song.featuring.length * 5) + 
        (song.performanceType === 'viral' ? 20 : 0) +
        (song.performanceType === 'comeback' ? 10 : 0) +
        (song.performanceType === 'flop' ? -15 : 0)
      );
      
      // Calculate per-song revenue
      const averageRatePerStream = 0.004; // $0.004 per stream on average
      const revenue = song.streams * averageRatePerStream;
      
      // If the song doesn't already have platform distribution, generate it
      let platformStreamDistribution = song.platformStreamDistribution || {};
      
      if (Object.keys(platformStreamDistribution).length === 0) {
        // Define platform market shares for consistency with AI rappers
        const platformMarketShare = {
          'Spotify': 0.55,            // Highest - Spotify is always #1 (55%)
          'YouTube Music': 0.28,      // Second highest - YT Music always #2 (28%)
          'iTunes': 0.12,             // Third place - iTunes always #3 (12%)  
          'SoundCloud': 0.05,         // Lowest - SoundCloud always last (5%)
          'Amazon Music': 0.10,       // Medium tier platform (10%)
          'Deezer': 0.03,             // Minor platform (3%)
          'Tidal': 0.02,              // Minor platform (2%)
          'Other': 0.08,              // All others combined (8%)
        };
        
        // Generate a unique, deterministic seed for this song
        const songSeed = song.id.charCodeAt(0) + (song.title ? song.title.charCodeAt(0) : 0);
        
        // Create platform distribution
        const tempPlatformDistribution: Record<string, number> = {};
        let distributedStreams = 0;
        
        // Get platforms this song was released on
        const availablePlatforms = song.releasePlatforms || streamingPlatforms.map(p => p.name);
        
        // Generate platform-specific streams
        availablePlatforms.forEach((platformName, index) => {
          // Get market share for this platform
          const marketShare = platformMarketShare[platformName as keyof typeof platformMarketShare] || 0.05;
          
          // Create deterministic bias: some songs do better on specific platforms
          const titleSeed = song.title ? song.title.charCodeAt(0) : 0;
          const platformSeed = platformName.charCodeAt(0) + platformName.length;
          
          // Deterministic platform bias
          const biasBase = ((titleSeed + platformSeed + songSeed) % 100) / 100;
          const platformBias = 0.7 + (biasBase * 0.6); // 0.7-1.3 range
          
          // Apply bias to market share
          const adjustedMarketShare = marketShare * platformBias;
          
          // Add randomness based on song attributes
          const randomSeed = (songSeed + index) / 10;
          const randomComponent = Math.sin(randomSeed) * 0.4; // -0.4 to 0.4 range
          
          // Combined factor for distribution
          const platformFactor = adjustedMarketShare * (1 + randomComponent);
          
          // Calculate streams for this platform
          let platformStreams = Math.max(10, Math.floor(song.streams * platformFactor));
          
          // Ensure unique values
          const currentValues = Object.values(tempPlatformDistribution);
          while (currentValues.includes(platformStreams)) {
            platformStreams += 1;
          }
          
          tempPlatformDistribution[platformName] = platformStreams;
          distributedStreams += platformStreams;
        });
        
        // Adjust to match original total
        const adjustmentFactor = song.streams / distributedStreams;
        Object.keys(tempPlatformDistribution).forEach(platform => {
          platformStreamDistribution[platform] = Math.floor(tempPlatformDistribution[platform] * adjustmentFactor);
        });
      }
      
      return {
        ...song,
        isPlayerSong: true,
        artistName: character?.artistName || 'You',
        artistImage: character?.image,
        genre: 'Player',
        weeklyChange,
        popularity,
        revenue,
        color: '#ff9500',
        ranking: Math.floor(Math.random() * 10) + 1, // Simulated ranking
        previousRanking: Math.floor(Math.random() * 20) + 1,
        platformStreamDistribution, // Add platform-specific streams
      };
    });
    
    // Add AI rapper songs (simulated)
    const aiSongs: Song[] = [];
    
    // Create a few songs for each AI rapper
    aiRappers.forEach(rapper => {
      // Determine genre based on rapper style
      let genre = 'Other';
      const style = rapper.style.toLowerCase();
      if (style.includes('trap')) genre = 'Trap';
      else if (style.includes('drill')) genre = 'Drill';
      else if (style.includes('old school')) genre = 'Old School';
      else if (style.includes('melodic')) genre = 'Melodic';
      
      // Realistic stream distribution - more popular rappers have more streams
      const baseStreams = rapper.monthlyListeners * (0.1 + (Math.random() * 0.3));
      
      // Create 2-5 songs per rapper based on popularity
      const songCount = Math.floor(rapper.popularity / 25) + 2;
      
      for (let i = 0; i < songCount; i++) {
        // Generate song titles
        const prefixes = ['Money', 'Streets', 'Life', 'Flex', 'Boss', 'Grind', 'Dream', 'Hustle'];
        const suffixes = ['Talk', 'Season', 'Chronicles', 'Life', 'Time', 'Wave', 'Gang', 'World'];
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const title = `${prefix} ${suffix}`;
        
        // Add featuring info sometimes (25% chance)
        const hasFeaturing = Math.random() < 0.25;
        const featuredArtistIndex = Math.floor(Math.random() * aiRappers.length);
        const featuring = hasFeaturing && featuredArtistIndex !== aiRappers.indexOf(rapper) 
          ? [aiRappers[featuredArtistIndex].id] 
          : [];
        
        // Decay streams based on index (first songs have more streams)
        const streamMultiplier = 1 / Math.pow(i + 1, 0.5);
        const streams = Math.floor(baseStreams * streamMultiplier * (0.8 + Math.random() * 0.4));
        
        // Determine performance type
        let performanceType: SongPerformanceType = 'normal';
        const rand = Math.random();
        if (rand > 0.9) performanceType = 'viral';
        else if (rand < 0.1) performanceType = 'flop';
        else if (rand > 0.8 && rand <= 0.9) performanceType = 'comeback';
        
        // Calculate a reasonable weekly change based on song performance
        let weeklyChange = 0;
        if (performanceType === 'viral') {
          weeklyChange = Math.floor(Math.random() * 3) + 1; // +1 to +3
        } else if (performanceType === 'flop') {
          weeklyChange = -Math.floor(Math.random() * 3) - 1; // -1 to -3
        } else if (performanceType === 'comeback') {
          weeklyChange = Math.floor(Math.random() * 4) + 1; // +1 to +4
        } else {
          weeklyChange = Math.floor(Math.random() * 3) - 1; // -1 to +1
        }
        
        // Calculate popularity score (0-100)
        const popularity = Math.min(100, Math.round((streams / 5000) * 15) + 
          (featuring.length * 5) + 
          (performanceType === 'viral' ? 20 : 0) +
          (performanceType === 'comeback' ? 10 : 0) +
          (performanceType === 'flop' ? -15 : 0)
        );
        
        // Calculate per-song revenue
        const averageRatePerStream = 0.004; // $0.004 per stream on average
        const revenue = streams * averageRatePerStream;
        
        // Calculate rankings
        const previousRanking = Math.floor(Math.random() * 40) + 1;
        const currentRanking = Math.max(1, Math.min(50, previousRanking + weeklyChange));
        
        // Generate a unique song identifier based on rapper's name and song title
        const songSeed = (rapper.name.charCodeAt(0) + title.charCodeAt(0)) % 1000;
        
        // Create platform-specific stream distributions, just like for player songs
        // Define platform market shares based on real-world streaming platform dominance
        const platformMarketShare = {
          'Spotify': 0.55,            // Highest - Spotify is always #1 (55%)
          'YouTube Music': 0.28,      // Second highest - YT Music always #2 (28%)
          'iTunes': 0.12,             // Third place - iTunes always #3 (12%)  
          'SoundCloud': 0.05,         // Lowest - SoundCloud always last (5%)
          'Amazon Music': 0.10,       // Medium tier platform (10%)
          'Deezer': 0.03,             // Minor platform (3%)
          'Tidal': 0.02,              // Minor platform (2%)
          'Other': 0.08,              // All others combined (8%)
        };
        
        // Each artist has unique platform biases based on their style and fanbase
        // Create a deterministic platform distribution for this AI rapper
        let platformStreamMap: Record<string, number> = {};
        let distributedStreams = 0;
        
        // Get all available platforms from the game
        const availablePlatforms = streamingPlatforms.map(p => p.name);
        
        // Generate different stream counts for each platform
        availablePlatforms.forEach((platformName, index) => {
          // Get base market share for this platform
          const marketShare = platformMarketShare[platformName as keyof typeof platformMarketShare] || 0.05;
          
          // Create deterministic bias: some artists naturally do better on specific platforms
          // Based on artist name, platform and song characteristics
          const artistNameSeed = rapper.name.charCodeAt(0);
          const platformSeed = platformName.charCodeAt(0) + platformName.length;
          
          // Deterministic bias (consistent for this artist/platform combination)
          const biasBase = ((artistNameSeed + platformSeed + songSeed) % 100) / 100;
          
          // Calculate bias factor (0.6-1.4 range)
          const artistPlatformBias = 0.6 + (biasBase * 0.8);
          
          // Apply bias to market share
          const adjustedMarketShare = marketShare * artistPlatformBias;
          
          // Add randomness based on song seed and platform index
          const randomSeed = (songSeed + index) / 10;
          const randomComponent = Math.sin(randomSeed) * 0.5; // -0.5 to 0.5 range
          
          // Combined factor creates different distributions
          const platformFactor = adjustedMarketShare * (1 + randomComponent);
          
          // Calculate platform-specific streams
          let platformStreams = Math.max(10, Math.floor(streams * platformFactor));
          
          // Make sure values are unique between platforms to create distinct distributions
          const currentMapValues = Object.values(platformStreamMap);
          while (currentMapValues.includes(platformStreams)) {
            platformStreams += 1;
          }
          
          platformStreamMap[platformName] = platformStreams;
          distributedStreams += platformStreams;
        });
        
        // Adjust totals to match original stream count (maintain consistency)
        const adjustmentFactor = streams / distributedStreams;
        Object.keys(platformStreamMap).forEach(platform => {
          platformStreamMap[platform] = Math.floor(platformStreamMap[platform] * adjustmentFactor);
        });
        
        aiSongs.push({
          id: `ai-song-${rapper.id}-${i}`,
          title,
          tier: Math.min(5, Math.max(1, Math.floor(rapper.popularity / 20))) as 1|2|3|4|5,
          quality: 50 + Math.floor(Math.random() * 50),
          completed: true,
          productionStartWeek: Math.max(1, currentWeek - Math.floor(Math.random() * 50)),
          productionProgress: 100,
          released: true,
          releaseDate: Math.max(1, currentWeek - Math.floor(Math.random() * 20)),
          streams,
          isActive: true,
          releasePlatforms: streamingPlatforms.map(p => p.name),
          featuring,
          performanceType,
          performanceStatusWeek: currentWeek,
          aiRapperOwner: rapper.id,
          isPlayerSong: false,
          artistName: rapper.name,
          artistImage: rapper.image,
          genre,
          weeklyChange,
          popularity,
          revenue,
          ranking: currentRanking,
          previousRanking,
          color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
          platformStreamDistribution: platformStreamMap, // Store platform-specific streams
        });
      }
    });
    
    return [...playerSongs, ...aiSongs];
  }, [songs, aiRappers, character, currentWeek, streamingPlatforms]);
  
  // Filter songs based on selected tab and timeframe
  const filteredSongs = useMemo(() => {
    let filtered = [...allSongs];
    
    // Filter by timeframe
    switch (timeframe) {
      case 'thisWeek':
        filtered = filtered.filter(s => s.releaseDate && currentWeek - s.releaseDate <= 4);
        break;
      case 'lastMonth':
        filtered = filtered.filter(s => s.releaseDate && currentWeek - s.releaseDate <= 12);
        break;
      // allTime - no additional filtering
    }
    
    // Filter by tab
    switch (selectedTab) {
      case 'genre':
        if (selectedGenre !== 'all') {
          filtered = filtered.filter(s => s.genre === selectedGenre);
        }
        break;
      case 'platform':
        // Use platform-specific stream distribution if available, otherwise simulate it
        filtered = filtered.map(song => {
          // If we have platform-specific stream data, use it
          if (song.platformStreamDistribution && song.platformStreamDistribution[selectedPlatform]) {
            // Return with platform-specific streams
            return {
              ...song,
              streams: song.platformStreamDistribution[selectedPlatform]
            };
          } else {
            // Fallback to the previous method for backwards compatibility
            // Deterministic randomization based on song ID and platform
            const songSeed = song.id.charCodeAt(0) + selectedPlatform.charCodeAt(0);
            const randomFactor = 0.7 + (Math.sin(songSeed) + 1) * 0.3; // 0.7-1.3x
            return {
              ...song,
              streams: Math.floor(song.streams * randomFactor)
            };
          }
        });
        break;
    }
    
    // Sort by streams (descending)
    return filtered.sort((a, b) => b.streams - a.streams).slice(0, 50);
  }, [allSongs, selectedTab, timeframe, selectedGenre, selectedPlatform, currentWeek]);
  
  // Create charts data
  const chartData = useMemo(() => {
    // For simplicity, use top 10 songs
    return filteredSongs.slice(0, 10).map((song, index) => ({
      name: song.title.length > 12 ? song.title.substring(0, 12) + '...' : song.title,
      artist: song.artistName,
      streams: song.streams,
      position: index + 1,
      color: song.color,
      weeklyChange: song.weeklyChange || 0
    }));
  }, [filteredSongs]);
  
  // Create trending data for line chart
  const trendingChartData = useMemo(() => {
    // Create weekly trend data (simulated)
    const topSongs = filteredSongs.slice(0, 5);
    const weeksToShow = 8;
    
    return Array.from({ length: weeksToShow }).map((_, i) => {
      const weekNum = currentWeek - (weeksToShow - i - 1);
      const dataPoint: Record<string, any> = { week: `Week ${weekNum}` };
      
      // Add data for each top song with realistic trend
      topSongs.forEach((song, songIndex) => {
        // Create a more realistic curve - songs start with fewer streams and peak
        let factor = 1;
        const songAge = currentWeek - (song.releaseDate || currentWeek - 1);
        const normalizedWeek = i - (weeksToShow - songAge);
        
        // Songs trend up at first, then plateau, then decline
        if (normalizedWeek < 0) {
          // Before release
          factor = 0;
        } else if (normalizedWeek <= 2) {
          // Growth phase
          factor = normalizedWeek * 0.5;
        } else if (normalizedWeek <= 4) {
          // Peak
          factor = 1;
        } else {
          // Decline
          factor = Math.max(0.3, 1 - ((normalizedWeek - 4) * 0.15));
        }
        
        // Apply performance type modifiers
        if (song.performanceType === 'viral') {
          factor *= 1.5;
        } else if (song.performanceType === 'flop') {
          factor *= 0.6;
        } else if (song.performanceType === 'comeback' && normalizedWeek > 3) {
          factor *= 1.2; // Comeback after initial decline
        }
        
        dataPoint[song.title] = Math.floor(song.streams * factor);
      });
      
      return dataPoint;
    });
  }, [filteredSongs, currentWeek]);
  
  // Weekly Hot Songs
  const WeeklyHotSongs = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold flex items-center">
          <TrophyIcon size={20} className="mr-2 text-yellow-500" />
          Top 50 Charts
        </h3>
        
        <Select value={timeframe} onValueChange={(val) => setTimeframe(val as ChartPeriod)}>
          <SelectTrigger className="w-[160px] bg-black/40 border-gray-700">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            {timeframes.map((tf) => (
              <SelectItem key={tf.value} value={tf.value}>
                {tf.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Charts visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-gray-900/30 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <BarChartIcon size={16} className="mr-2 text-blue-400" />
              Top Songs by Streams
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(value) => formatNumber(value)} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value) => formatNumber(Number(value))} />
                  <Bar 
                    dataKey="streams" 
                    fill="#8884d8" 
                    isAnimationActive={true}
                    label={{ position: 'right', formatter: (item: any) => `#${item.position}` }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/30 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <LineChartIcon size={16} className="mr-2 text-green-400" />
              Streaming Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendingChartData} margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis tickFormatter={(value) => formatNumber(value)} />
                  <Tooltip formatter={(value) => formatNumber(Number(value))} />
                  <Legend />
                  {filteredSongs.slice(0, 5).map((song, index) => (
                    <Line
                      key={song.id}
                      type="monotone"
                      dataKey={song.title}
                      name={song.title.length > 15 ? song.title.substring(0, 15) + '...' : song.title}
                      stroke={song.color || `hsl(${index * 70}, 70%, 50%)`}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Top 50 list */}
      <div className="space-y-2">
        {filteredSongs.map((song, index) => (
          <div 
            key={song.id}
            className={`flex items-center p-3 rounded-lg border ${getPositionBackground(index + 1)} transition-all hover:bg-gray-800/40 ${song.isPlayerSong ? 'bg-gradient-to-r from-amber-950/30 to-transparent' : ''}`}
            onClick={() => {
              if (song.revenue) {
                toast({
                  title: `💰 ${song.title} Revenue`,
                  description: `This song has earned ${formatMoney(song.revenue)}.`,
                  variant: "default"
                });
              }
            }}
          >
            <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 mr-4 font-bold ${getPositionColor(index + 1)}`}>
              {index + 1}
            </div>
            
            <div className="flex items-center flex-1 min-w-0">
              {song.artistImage ? (
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3 relative">
                  <img src={song.artistImage} alt={song.artistName} className="w-full h-full object-cover" />
                  {song.isPlayerSong && (
                    <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full w-4 h-4 flex items-center justify-center border border-black">
                      <StarIcon2 size={10} className="text-black" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center mr-3 relative">
                  <span className="text-sm font-bold">{song.artistName?.charAt(0)}</span>
                  {song.isPlayerSong && (
                    <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full w-4 h-4 flex items-center justify-center border border-black">
                      <StarIcon2 size={10} className="text-black" />
                    </div>
                  )}
                </div>
              )}
              
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate flex items-center">
                  {song.title}
                  {song.isPlayerSong && (
                    <span className="ml-2 text-yellow-500 text-xs">YOUR SONG</span>
                  )}
                </div>
                <div className="text-gray-400 text-sm truncate flex items-center">
                  {song.artistName}
                  {song.featuring && song.featuring.length > 0 && (
                    <span> feat. {song.featuring.map(id => {
                      const artist = aiRappers.find(r => r.id === id);
                      return artist ? artist.name : 'Unknown';
                    }).join(', ')}</span>
                  )}
                  
                  {song.genre && (
                    <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0 h-4 bg-gray-800/50">
                      {song.genre}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end ml-4">
              <div className="text-sm font-medium flex items-center">
                {formatNumber(song.streams)} 
                <HeadphonesIcon size={12} className="ml-1 text-gray-400" />
                {song.popularity && (
                  <div className="ml-2 flex items-center" title={`Popularity: ${song.popularity}/100`}>
                    <div className="h-1.5 w-10 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          song.popularity > 80 ? 'bg-green-500' : 
                          song.popularity > 60 ? 'bg-blue-500' : 
                          song.popularity > 40 ? 'bg-yellow-500' : 
                          song.popularity > 20 ? 'bg-orange-500' : 'bg-red-500'
                        }`} 
                        style={{ width: `${song.popularity}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={`text-xs ${getPerformanceColor(song.performanceType)}`}>
                  {getPerformanceText(song.performanceType)}
                </Badge>
                
                {song.revenue && song.isPlayerSong && (
                  <Badge variant="outline" className="text-xs bg-emerald-900/20 text-emerald-400 border-emerald-700/30">
                    {formatMoney(song.revenue)}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="ml-4 flex flex-col items-center justify-center space-y-1">
              <div className="text-center">
                <WeeklyChangeIndicator change={song.weeklyChange} />
              </div>
              {song.previousRanking && song.previousRanking !== index + 1 && (
                <div className="text-xs text-gray-400">
                  from #{song.previousRanking}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  // Genre-based charts
  const GenreCharts = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold flex items-center">
          <MusicIcon size={20} className="mr-2 text-indigo-500" />
          Genre Charts
        </h3>
        
        <div className="flex gap-2">
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-[160px] bg-black/40 border-gray-700">
              <SelectValue placeholder="Select genre" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre === 'all' ? 'All Genres' : genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeframe} onValueChange={(val) => setTimeframe(val as ChartPeriod)}>
            <SelectTrigger className="w-[160px] bg-black/40 border-gray-700">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              {timeframes.map((tf) => (
                <SelectItem key={tf.value} value={tf.value}>
                  {tf.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Genre distribution pie chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <Card className="bg-gray-900/30 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <RadioIcon size={16} className="mr-2 text-purple-400" />
              Genre Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[250px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={(() => {
                      const genreCounts: Record<string, number> = {};
                      allSongs.forEach(song => {
                        if (song.genre) {
                          genreCounts[song.genre] = (genreCounts[song.genre] || 0) + 1;
                        }
                      });
                      return Object.entries(genreCounts).map(([name, value]) => ({
                        name,
                        value,
                        color: name === 'Player' ? '#ff9500' : `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
                      }));
                    })()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {(() => {
                      const genreCounts: Record<string, number> = {};
                      allSongs.forEach(song => {
                        if (song.genre) {
                          genreCounts[song.genre] = (genreCounts[song.genre] || 0) + 1;
                        }
                      });
                      return Object.entries(genreCounts).map(([name], index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={name === 'Player' ? '#ff9500' : `hsl(${(index * 137) % 360}, 70%, 50%)`} 
                        />
                      ));
                    })()}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} songs`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/30 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <BarChartIcon size={16} className="mr-2 text-blue-400" />
              Top Genre Streams
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={(() => {
                    const genreStreams: Record<string, number> = {};
                    allSongs.forEach(song => {
                      if (song.genre) {
                        genreStreams[song.genre] = (genreStreams[song.genre] || 0) + song.streams;
                      }
                    });
                    return Object.entries(genreStreams)
                      .map(([name, value]) => ({ name, streams: value }))
                      .sort((a, b) => b.streams - a.streams)
                      .slice(0, 5);
                  })()}
                  layout="vertical"
                  margin={{ left: 20, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(value) => formatNumber(value)} />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip formatter={(value) => formatNumber(Number(value))} />
                  <Bar 
                    dataKey="streams" 
                    fill="#8884d8" 
                    isAnimationActive={true}
                  >
                    {(() => {
                      const genreStreams: Record<string, number> = {};
                      allSongs.forEach(song => {
                        if (song.genre) {
                          genreStreams[song.genre] = (genreStreams[song.genre] || 0) + song.streams;
                        }
                      });
                      return Object.entries(genreStreams)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([name], index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={name === 'Player' ? '#ff9500' : `hsl(${(index * 137) % 360}, 70%, 50%)`} 
                          />
                        ));
                    })()}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Top songs by genre - same list as Weekly but filtered by genre */}
      <div className="space-y-2">
        {filteredSongs.map((song, index) => (
          <div 
            key={song.id}
            className={`flex items-center p-3 rounded-lg border ${getPositionBackground(index + 1)} transition-all hover:bg-gray-800/40 ${song.isPlayerSong ? 'bg-gradient-to-r from-amber-950/30 to-transparent' : ''}`}
            onClick={() => {
              if (song.revenue) {
                toast({
                  title: `💰 ${song.title} Revenue`,
                  description: `This song has earned ${formatMoney(song.revenue)}.`,
                  variant: "default"
                });
              }
            }}
          >
            <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 mr-4 font-bold ${getPositionColor(index + 1)}`}>
              {index + 1}
            </div>
            
            <div className="flex items-center flex-1 min-w-0">
              {song.artistImage ? (
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3 relative">
                  <img src={song.artistImage} alt={song.artistName} className="w-full h-full object-cover" />
                  {song.isPlayerSong && (
                    <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full w-4 h-4 flex items-center justify-center border border-black">
                      <StarIcon2 size={10} className="text-black" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center mr-3 relative">
                  <span className="text-sm font-bold">{song.artistName?.charAt(0)}</span>
                  {song.isPlayerSong && (
                    <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full w-4 h-4 flex items-center justify-center border border-black">
                      <StarIcon2 size={10} className="text-black" />
                    </div>
                  )}
                </div>
              )}
              
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate flex items-center">
                  {song.title}
                  {song.isPlayerSong && (
                    <span className="ml-2 text-yellow-500 text-xs">YOUR SONG</span>
                  )}
                </div>
                <div className="text-gray-400 text-sm truncate flex items-center">
                  {song.artistName}
                  {song.featuring && song.featuring.length > 0 && (
                    <span> feat. {song.featuring.map(id => {
                      const artist = aiRappers.find(r => r.id === id);
                      return artist ? artist.name : 'Unknown';
                    }).join(', ')}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end ml-4">
              <div className="text-sm font-medium flex items-center">
                {formatNumber(song.streams)} 
                <HeadphonesIcon size={12} className="ml-1 text-gray-400" />
                {song.popularity && (
                  <div className="ml-2 flex items-center" title={`Popularity: ${song.popularity}/100`}>
                    <div className="h-1.5 w-10 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          song.popularity > 80 ? 'bg-green-500' : 
                          song.popularity > 60 ? 'bg-blue-500' : 
                          song.popularity > 40 ? 'bg-yellow-500' : 
                          song.popularity > 20 ? 'bg-orange-500' : 'bg-red-500'
                        }`} 
                        style={{ width: `${song.popularity}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={`text-xs ${getPerformanceColor(song.performanceType)}`}>
                  {getPerformanceText(song.performanceType)}
                </Badge>
                
                {song.revenue && song.isPlayerSong && (
                  <Badge variant="outline" className="text-xs bg-emerald-900/20 text-emerald-400 border-emerald-700/30">
                    {formatMoney(song.revenue)}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="ml-4 px-2 py-1 rounded bg-gradient-to-r from-indigo-900/40 to-purple-900/40 flex items-center">
              <RadioIcon size={12} className="mr-1 text-indigo-400" />
              <span className="text-xs">{song.genre}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  // Platform-specific charts
  const PlatformCharts = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold flex items-center">
          <SpotifyIcon size={20} className="mr-2 text-green-500" />
          Platform Charts
        </h3>
        
        <div className="flex gap-2">
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-[160px] bg-black/40 border-gray-700">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              {streamingPlatforms.map((platform) => (
                <SelectItem key={platform.name} value={platform.name}>
                  {platform.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeframe} onValueChange={(val) => setTimeframe(val as ChartPeriod)}>
            <SelectTrigger className="w-[160px] bg-black/40 border-gray-700">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              {timeframes.map((tf) => (
                <SelectItem key={tf.value} value={tf.value}>
                  {tf.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Platform info */}
      <Card className="bg-black/30 border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-lg font-bold">{selectedPlatform} Top 50</h3>
              <p className="text-sm text-gray-400">
                The most streamed tracks on {selectedPlatform} right now
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">
                {formatNumber(streamingPlatforms.find(p => p.name === selectedPlatform)?.listeners || 0)}
              </div>
              <p className="text-sm text-gray-400">Monthly Listeners</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Platform-specific top songs - same list as Weekly but filtered by platform */}
      <div className="space-y-2">
        {filteredSongs.map((song, index) => (
          <div 
            key={song.id}
            className={`flex items-center p-3 rounded-lg border ${getPositionBackground(index + 1)} transition-all hover:bg-gray-800/40 ${song.isPlayerSong ? 'bg-gradient-to-r from-amber-950/30 to-transparent' : ''}`}
            onClick={() => {
              if (song.revenue) {
                toast({
                  title: `💰 ${song.title} Revenue`,
                  description: `This song has earned ${formatMoney(song.revenue)}.`,
                  variant: "default"
                });
              }
            }}
          >
            <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 mr-4 font-bold ${getPositionColor(index + 1)}`}>
              {index + 1}
            </div>
            
            <div className="flex items-center flex-1 min-w-0">
              {song.artistImage ? (
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3 relative">
                  <img src={song.artistImage} alt={song.artistName} className="w-full h-full object-cover" />
                  {song.isPlayerSong && (
                    <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full w-4 h-4 flex items-center justify-center border border-black">
                      <StarIcon2 size={10} className="text-black" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center mr-3 relative">
                  <span className="text-sm font-bold">{song.artistName?.charAt(0)}</span>
                  {song.isPlayerSong && (
                    <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full w-4 h-4 flex items-center justify-center border border-black">
                      <StarIcon2 size={10} className="text-black" />
                    </div>
                  )}
                </div>
              )}
              
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate flex items-center">
                  {song.title}
                  {song.isPlayerSong && (
                    <span className="ml-2 text-yellow-500 text-xs">YOUR SONG</span>
                  )}
                </div>
                <div className="text-gray-400 text-sm truncate flex items-center">
                  {song.artistName}
                  {song.featuring && song.featuring.length > 0 && (
                    <span> feat. {song.featuring.map(id => {
                      const artist = aiRappers.find(r => r.id === id);
                      return artist ? artist.name : 'Unknown';
                    }).join(', ')}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end ml-4">
              <div className="text-sm font-medium flex items-center">
                {formatNumber(song.streams)} 
                <HeadphonesIcon size={12} className="ml-1 text-gray-400" />
                {song.popularity && (
                  <div className="ml-2 flex items-center" title={`Popularity: ${song.popularity}/100`}>
                    <div className="h-1.5 w-10 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          song.popularity > 80 ? 'bg-green-500' : 
                          song.popularity > 60 ? 'bg-blue-500' : 
                          song.popularity > 40 ? 'bg-yellow-500' : 
                          song.popularity > 20 ? 'bg-orange-500' : 'bg-red-500'
                        }`} 
                        style={{ width: `${song.popularity}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={`text-xs ${getPerformanceColor(song.performanceType)}`}>
                  {getPerformanceText(song.performanceType)}
                </Badge>
                
                {song.revenue && song.isPlayerSong && (
                  <Badge variant="outline" className="text-xs bg-emerald-900/20 text-emerald-400 border-emerald-700/30">
                    {formatMoney(song.revenue)}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="ml-4 flex flex-col items-center justify-center space-y-1">
              <div className="text-center">
                <WeeklyChangeIndicator change={song.weeklyChange} />
              </div>
              {song.previousRanking && song.previousRanking !== index + 1 && (
                <div className="text-xs text-gray-400">
                  from #{song.previousRanking}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  // Effect to show a message when player's song enters the charts
  // We need to track if we've already shown notifications to prevent them from re-appearing
  // when just opening the charts
  const [shownTop3Notification, setShownTop3Notification] = useState(false);
  const [shownTop10Notification, setShownTop10Notification] = useState(false);
  
  useEffect(() => {
    // Check if any player song is in the top 10
    const playerInTop10 = filteredSongs.findIndex(s => s.isPlayerSong && s.streams > 5000) < 10;
    const playerInTop3 = filteredSongs.findIndex(s => s.isPlayerSong && s.streams > 10000) < 3;
    
    // Only show notifications for new achievements, not when just viewing the charts
    if (playerInTop3 && !shownTop3Notification) {
      setShownTop3Notification(true);
      // After a slight delay to allow the UI to render first
      const timer = setTimeout(() => {
        toast({
          title: "🏆 Chart Achievement!",
          description: "One of your songs has reached the Top 3! Your fans are going wild!",
          variant: "default",
          duration: 5000,
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (playerInTop10 && !playerInTop3 && !shownTop10Notification) {
      setShownTop10Notification(true);
      // After a slight delay to allow the UI to render first
      const timer = setTimeout(() => {
        toast({
          title: "📈 Chart Success!",
          description: "Your music is in the Top 10! Your career is taking off!",
          variant: "default",
          duration: 3000,
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [filteredSongs, timeframe, selectedTab, toast, shownTop3Notification, shownTop10Notification]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-indigo-950 to-black text-white p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <BarChartIcon size={32} className="mr-3 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold">Music Charts</h1>
            <p className="text-sm text-gray-400">See what's trending across the industry</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="bg-transparent border-gray-600 hover:bg-gray-800"
          onClick={() => useRapperGame.getState().setScreen('career_dashboard')}
        >
          Back to Dashboard
        </Button>
      </div>
      
      {/* Player Ranking Stats Card */}
      <Card className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-purple-800 mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-bold flex items-center mb-2">
                <CrownIcon size={18} className="mr-2 text-yellow-400" />
                Your Industry Position
              </h3>
              
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Artist Ranking:</span>
                  <span className="font-bold text-white">
                    #{playerRanking.ranking} of {playerRanking.totalArtists}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Industry Percentile:</span>
                  <span className={`font-bold ${playerRanking.percentile > 75 ? 'text-green-400' : playerRanking.percentile > 50 ? 'text-yellow-400' : 'text-gray-400'}`}>
                    Top {100 - playerRanking.percentile}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Leader:</span>
                  <span className="font-bold text-white">
                    {playerRanking.topArtist.name} ({formatNumber(playerRanking.topArtist.streams)} streams)
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Your Songs in Top 50:</span>
                  <span className="font-bold text-white">
                    {filteredSongs.filter(s => s.isPlayerSong).length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Best Chart Position:</span>
                  <span className="font-bold text-white">
                    #{Math.min(
                      ...filteredSongs
                        .filter(s => s.isPlayerSong)
                        .map((_, i) => i + 1),
                      51
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="col-span-1 bg-black/20 rounded-md p-3 flex flex-col justify-center">
              <h4 className="text-sm font-semibold text-gray-300 mb-1 flex items-center">
                <InfoIcon size={14} className="mr-1 text-blue-400" />
                Industry Insights
              </h4>
              <p className="text-xs text-gray-400 mb-2">
                {playerRanking.percentile > 90 
                  ? "You're a dominant force in the industry! Leverage your fame for brand deals and business opportunities."
                  : playerRanking.percentile > 70
                  ? "You're becoming a major player! Focus on maintaining momentum with quality releases."
                  : playerRanking.percentile > 50
                  ? "You're making a name for yourself. Consider collaborations to expand your audience."
                  : playerRanking.percentile > 30
                  ? "You're on the rise, but still building your fanbase. Keep consistent with your social media presence."
                  : "You're still establishing yourself. Focus on creating your unique sound and growing your core audience."}
              </p>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={() => toast({
                  title: "Industry Report",
                  description: "Your detailed industry analysis has been sent to your team!",
                  variant: "default"
                })}
              >
                <UsersIcon size={14} className="mr-1" />
                Get Industry Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs 
        defaultValue="weekly" 
        value={selectedTab} 
        onValueChange={(value) => setSelectedTab(value as ChartType)}
        className="flex-1"
      >
        <TabsList className="grid grid-cols-3 mb-4 bg-gray-900/30">
          <TabsTrigger value="weekly" className="data-[state=active]:bg-indigo-900/50">
            <TrendingUpIcon size={16} className="mr-2" />
            Weekly Charts
          </TabsTrigger>
          <TabsTrigger value="genre" className="data-[state=active]:bg-indigo-900/50">
            <MusicIcon size={16} className="mr-2" />
            By Genre
          </TabsTrigger>
          <TabsTrigger value="platform" className="data-[state=active]:bg-indigo-900/50">
            <SpotifyIcon size={16} className="mr-2" />
            By Platform
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="weekly" className="flex-1 mt-0">
          <WeeklyHotSongs />
        </TabsContent>
        
        <TabsContent value="genre" className="flex-1 mt-0">
          <GenreCharts />
        </TabsContent>
        
        <TabsContent value="platform" className="flex-1 mt-0">
          <PlatformCharts />
        </TabsContent>
      </Tabs>
    </div>
  );
}
