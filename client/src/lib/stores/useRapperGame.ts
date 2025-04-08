import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { 
  AIRapper,
  Album,
  AlbumType,
  Beef,
  CharacterInfo,
  Concert,
  Controversy,
  ControversySeverity, 
  ControversyType,
  FeatureRequest,
  GameScreen,
  GameState,
  HypeEvent,
  MarketTrend,
  MediaEvent,
  MerchandiseItem,
  MerchandiseWeeklySales,
  MusicVideo,
  PlayerStats,
  RandomEvent,
  ReleaseType,
  ShopItem,
  Skill,
  SkillName,
  SkillTraining,
  SocialMediaPlatform,
  SocialMediaPost,
  SocialMediaStats,
  SongIcon,
  Song,
  SongPerformanceType,
  SongTier,
  StreamingPlatform,
  Tour,
  Venue,
  VenueSize,
  VideosPlatform,
  ViralStatus,
  WeeklyStats,
  TrendType
} from '../types';
import { useAudio } from './useAudio';
import { useEnergyStore } from './useEnergyStore';
import { DEFAULT_AI_RAPPERS, DEFAULT_SHOP_ITEMS, DEFAULT_SKILLS, DEFAULT_VENUES, SOCIAL_MEDIA_COSTS, SONG_TIER_INFO } from '../gameData';
import { getRandomEventForWeek } from '../utils/randomEvents';
// Import all game calculations functions
import { 
  calculateCareerLevel,
  calculateFeatureAcceptanceChance,
  calculateInitialStreams,
  calculateMonthlyListenerDecay,
  calculatePromotionImpact,
  calculateSocialMediaGrowth,
  calculateSongStreamGrowth,
  calculateStreamingRevenue,
  calculateTotalMonthlyListeners,
  checkSongViralStatus,
  generateSongTitle
} from '../utils/gameCalculations';

// Import calculateAIFeatureRequestChance separately to avoid any bundling issues
import { calculateAIFeatureRequestChance } from '../utils/gameCalculations';
import { getLocalStorage, setLocalStorage } from '../utils';

// Helper function to safely handle relationship status changes
function getNewRelationshipStatus(
  current: "neutral" | "friend" | "rival" | "enemy", 
  condition: boolean,
  trueValue: "neutral" | "friend" | "rival" | "enemy",
  falseValue: "neutral" | "friend" | "rival" | "enemy"
): "neutral" | "friend" | "rival" | "enemy" {
  return condition ? trueValue : falseValue;
}

// Define actions for the game
interface RapperGameActions {
  // Game navigation
  setScreen: (screen: GameScreen) => void;
  
  // Character creation
  createCharacter: (characterInfo: CharacterInfo) => void;
  updateCharacter: (characterInfo: Partial<CharacterInfo>) => void;
  updateFanbaseName: (name: string) => void;
  
  // Game progression
  advanceWeek: () => void;
  
  // Music production
  createSong: (title: string, tier: SongTier, featuring: string[]) => void;
  buySongFromShop: (shopItemId: string) => void;
  releaseSong: (songId: string, title: string, icon: SongIcon, platforms: string[]) => void;
  promoteSong: (songId: string, budget: number, promotionType: string) => void;
  
  // Music video production
  createMusicVideo: (video: MusicVideo, updatedSong: Song, cost: number) => void;
  updateMusicVideo: (updatedVideo: MusicVideo) => void;
  
  // Image management
  updateSongCoverArt: (songId: string, coverArt: string) => void;
  updateVideoThumbnail: (videoId: string, thumbnail: string) => void;
  updateProfileImage: (image: string) => void;
  
  // Album management
  createAlbum: (title: string, type: AlbumType, coverArt: string, songIds: string[]) => string;
  releaseAlbum: (albumId: string) => void;
  createDeluxeAlbum: (parentAlbumId: string, title: string, coverArt: string, additionalSongIds: string[]) => string;
  createRemixAlbum: (parentAlbumId: string, title: string, coverArt: string, remixArtists: string[]) => string;
  updateAlbumCover: (albumId: string, coverArt: string) => void;
  
  // Social media
  postOnSocialMedia: (platform: string, content?: string, images?: string[]) => void;
  addSocialMediaPost: (platform: string, post: SocialMediaPost) => void;
  updateSocialMediaStats: (stats: Record<string, any>) => void;
  createBurnerAccount: (platform: string, handle: string, displayName?: string, bio?: string) => string;
  postFromBurnerAccount: (platform: string, burnerAccountHandle: string, content: string, images?: string[]) => void;
  deleteBurnerAccount: (platform: string, burnerAccountHandle: string) => void;
  generateMusicChartPost: (accountId: string, content: string, image?: string) => void;
  
  // Collaboration
  requestFeature: (rapperId: string, songTier: SongTier) => void;
  respondToFeatureRequest: (rapperId: string, accept: boolean) => void;
  
  // Beef system
  startBeef: (rapperId: string, trackTitle?: string, lyrics?: string) => string;
  respondToBeef: (beefId: string, trackTitle: string, lyrics: string) => void;
  resolveBeef: (beefId: string) => void;
  
  // Random events
  resolveRandomEvent: (eventId: string, optionIndex: number) => void;
  
  // Subscription management
  updateSubscriptionStatus: (
    isSubscribed: boolean, 
    subscriptionType: 'none' | 'standard' | 'premium' | 'platinum', 
    subscriptionId?: string, 
    expiresAt?: Date
  ) => void;
  checkSubscriptionFeatureAccess: (feature: string) => boolean;
  showSubscriptionPrompt: (feature: string) => boolean;
  
  // Hype system
  createHypeEvent: (type: ReleaseType, name: string, targetReleaseWeek: number) => string;
  updateHypeLevel: (hypeEventId: string, increaseAmount: number) => void;
  announceRelease: (hypeEventId: string) => void;
  completeRelease: (hypeEventId: string) => void;
  
  // Controversy system
  generateControversy: (type: ControversyType, severity: ControversySeverity) => string;
  respondToControversy: (controversyId: string, responseIndex: number) => void;
  
  // Tour and concert management
  createTour: (name: string, venues: string[], startWeek: number) => string;
  confirmTour: (tourId: string) => void; // Add the confirmTour function
  cancelTour: (tourId: string) => void;
  scheduleConcert: (venueId: string, week: number, ticketPrice: number, setlist: string[]) => string;
  cancelConcert: (concertId: string) => void;
  bookVenue: (venueId: string) => void; // Added missing bookVenue function
  
  // Skills training
  startSkillTraining: (skillName: SkillName, trainingType: string, duration: number) => string;
  completeSkillTraining: (trainingId: string) => void;
  trainSkill: (skillName: string) => void;
  
  // Merchandise management
  addMerchandiseItem: (merchandiseItem: MerchandiseItem) => boolean;
  updateMerchandiseItem: (itemId: string, updates: Partial<MerchandiseItem>) => boolean;
  deleteMerchandiseItem: (itemId: string) => boolean;
  processMerchandiseSales: () => void;
  
  // Save/load
  saveGame: (slotId: string, name: string) => string;
  loadGame: (gameState: GameState) => void;
  resetGame: () => void;
  
  // Media events system
  createMediaEvent: (mediaEvent: MediaEvent) => string;
  receiveMediaInvitation: (mediaEventId: string) => void;
  confirmMediaEvent: (mediaEventId: string) => void;
  completeMediaEvent: (mediaEventId: string, performanceQuality?: number) => void;
  cancelMediaEvent: (mediaEventId: string) => void;
  completeMediaEventPreparationTask: (mediaEventId: string, taskId: string) => void;
  
  // Market trends system
  generateMarketTrend: () => string;
  processMarketTrends: () => void;
  updateTwitterTrends: () => void;
  getTrendEffect: (platformName: string) => number;
}

// Combine state and actions
type RapperGameStore = GameState & RapperGameActions;

// Initial default state
const initialState: GameState = {
  screen: "main_menu",
  previousScreen: null,
  character: null,
  currentWeek: 1,
  songs: [],
  musicVideos: [], // Added empty music videos array
  albums: [], // Added empty albums array
  socialMediaStats: {
    instagram: {
      followers: 30,
      posts: [],
      handle: 'yourartistname',
      verified: false,
      engagement: 5,
      burnerAccounts: []
    },
    twitter: {
      followers: 50,
      tweets: [],
      handle: 'yourartistname',
      verified: false,
      engagement: 8,
      burnerAccounts: [],
      trends: [
        {
          id: '1',
          name: '#NewMusic',
          category: 'Music',
          tweetCount: 12500,
          trending: true,
          description: 'Music fans are talking about new releases this week'
        },
        {
          id: '2',
          name: '#RapBattle',
          category: 'Music',
          tweetCount: 8700,
          trending: true,
          description: 'Rap battles trending in the music scene'
        },
        {
          id: '3',
          name: '#GrammyNominations',
          category: 'Entertainment',
          tweetCount: 21000,
          trending: true,
          description: 'Discussion about Grammy Award nominations'
        },
        {
          id: '4',
          name: '#StudioSession',
          category: 'Music',
          tweetCount: 5400,
          trending: true,
          description: 'Artists sharing their studio sessions'
        },
        {
          id: '5',
          name: '#HipHopNews',
          category: 'Music',
          tweetCount: 9800,
          trending: true,
          description: 'Latest news in the hip hop world'
        }
      ],
      musicChartAccounts: [
        {
          id: '1',
          accountName: 'PopBase',
          handle: 'popbase',
          verified: true,
          avatar: '/public/assets/profiles/profile1.svg',
          tweets: [],
          followers: 2400000
        },
        {
          id: '2',
          accountName: 'RapCrave',
          handle: 'rapcrave',
          verified: true,
          avatar: '/public/assets/profiles/profile2.svg',
          tweets: [],
          followers: 1800000
        },
        {
          id: '3',
          accountName: 'MusicCharts',
          handle: 'musiccharts',
          verified: true,
          avatar: '/public/assets/profiles/profile3.svg',
          tweets: [],
          followers: 3200000
        },
        {
          id: '4',
          accountName: 'HipHopFeed',
          handle: 'hiphopfeed',
          verified: true,
          avatar: '/public/assets/profiles/profile4.svg',
          tweets: [],
          followers: 1500000
        }
      ]
    },
    tiktok: {
      followers: 20,
      videos: [],
      handle: 'yourartistname',
      verified: false,
      engagement: 10,
      burnerAccounts: []
    }
  },
  socialMedia: [
    {
      name: "Twitter",
      followers: 50,
      posts: 0,
      engagement: 5,
      lastPostWeek: 0
    },
    {
      name: "Instagram",
      followers: 30,
      posts: 0,
      engagement: 8,
      lastPostWeek: 0
    },
    {
      name: "TikTok",
      followers: 20,
      posts: 0,
      engagement: 12,
      lastPostWeek: 0
    }
  ],
  streamingPlatforms: [
    {
      name: "Spotify",
      listeners: 0,
      totalStreams: 0,
      revenue: 0,
      isUnlocked: true,
      logo: "spotify-logo.png"
    },
    {
      name: "SoundCloud",
      listeners: 0,
      totalStreams: 0,
      revenue: 0,
      isUnlocked: true,
      logo: "soundcloud-logo.png"
    },
    {
      name: "iTunes",
      listeners: 0,
      totalStreams: 0,
      revenue: 0,
      isUnlocked: true,
      logo: "itunes-logo.png"
    },
    {
      name: "YouTube Music",
      listeners: 0,
      totalStreams: 0,
      revenue: 0,
      isUnlocked: true,
      logo: "youtube-music-logo.png"
    },
    {
      name: "YouTube",
      listeners: 0,
      totalStreams: 0,
      revenue: 0,
      isUnlocked: true,
      logo: "youtube-logo.png"
    },
    {
      name: "YouTube Vevo",
      listeners: 0,
      totalStreams: 0,
      revenue: 0,
      isUnlocked: true,
      logo: "vevo-logo.png"
    }
  ],
  videosPlatforms: [
    {
      name: "YouTube",
      subscribers: 0,
      totalViews: 0,
      videos: 0
    },
    {
      name: "VEVO",
      subscribers: 0,
      totalViews: 0,
      videos: 0
    }
  ],
  aiRappers: DEFAULT_AI_RAPPERS,
  stats: {
    careerLevel: 1,
    reputation: 5,
    wealth: 1000,
    creativity: 20,
    marketing: 10,
    networking: 5,
    fanLoyalty: 10
  },
  // Initialize with no subscription
  subscriptionInfo: {
    isSubscribed: false,
    subscriptionType: 'none',
    benefits: []
  },
  activeRandomEvents: [],
  resolvedRandomEvents: [],
  collaborationRequests: [],
  shopItems: DEFAULT_SHOP_ITEMS,
  weeklyStats: [], // Initialize empty array for weekly statistics
  // New features
  venues: DEFAULT_VENUES,
  tours: [],
  concerts: [],
  beefs: [], // Initialize empty array for beef system
  skills: DEFAULT_SKILLS,
  activeSkillTrainings: [],
  completedSkillTrainings: [],
  // Hype and controversy systems
  activeHypeEvents: [],
  pastHypeEvents: [],
  activeControversies: [],
  pastControversies: [],
  // Merchandise system
  merchandiseItems: [],
  merchandiseSales: [],
  // Media events system
  upcomingMediaEvents: [],
  invitedMediaEvents: [],
  confirmedMediaEvents: [],
  completedMediaEvents: [],
  missedMediaEvents: [],
  
  // Market trends system
  activeMarketTrends: [],
  pastMarketTrends: []
};

// Create the store with combined state and actions
export const useRapperGame = create<RapperGameStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,
    
    // Added properties for premium store
    week: initialState.currentWeek,
    userId: 1, // Default user ID
    cash: initialState.stats.wealth,
    premiumUser: initialState.subscriptionInfo.isSubscribed,
    subscriptionActive: initialState.subscriptionInfo.isSubscribed,
    subscriptionTier: initialState.subscriptionInfo.subscriptionType,
    
    // Update game state helper function
    updateGameState: (updates: Partial<GameState>) => {
      set(state => ({
        ...state,
        ...updates,
        // Update derived properties
        week: updates.currentWeek ?? state.currentWeek,
        cash: updates.stats?.wealth ?? state.stats.wealth,
        premiumUser: updates.subscriptionInfo?.isSubscribed ?? state.subscriptionInfo.isSubscribed,
        subscriptionActive: updates.subscriptionInfo?.isSubscribed ?? state.subscriptionInfo.isSubscribed,
        subscriptionTier: updates.subscriptionInfo?.subscriptionType ?? state.subscriptionInfo.subscriptionType
      }));
    },
    
    // Market Trends System
    generateMarketTrend: () => {
      const currentState = get();
      const trendId = uuidv4();
      
      // Define possible trend types
      const trendTypes: TrendType[] = ['rising', 'falling', 'hot', 'stable'];
      
      // Define possible trend names based on type
      const trendNames = {
        rising: [
          'Viral Challenges',
          'Short-form Content Surge',
          'Algorithm Shift',
          'Platform Integration',
          'Collaborative Playlists'
        ],
        falling: [
          'Streaming Royalty Dispute',
          'Platform Policy Change',
          'Market Saturation',
          'Subscription Price Increase',
          'Content Moderation Wave'
        ],
        hot: [
          'Cross-Platform Promotion',
          'Podcast Integration',
          'Social Media Verification',
          'AI-Generated Content',
          'Interactive Music Experiences'
        ],
        stable: [
          'Seasonal Listening Habits',
          'Platform Redesign',
          'Industry Standardization',
          'Premium Content Features',
          'Offline Listening Tools'
        ]
      };
      
      // Define possible trend descriptions based on type
      const trendDescriptions = {
        rising: [
          'Short-form video challenges featuring music clips are trending, driving discovery.',
          'Platform algorithm changes are favoring indie artists with authentic content.',
          'Cross-platform music sharing features have increased engagement.',
          'User-created playlists are gaining prominence over editorial content.',
          'New demographics are adopting streaming platforms, expanding audience reach.'
        ],
        falling: [
          'Artists are boycotting platforms due to royalty payment disputes.',
          'New policy changes have reduced song visibility in recommendation engines.',
          'Market saturation in certain genres is decreasing individual stream shares.',
          'Price increases for premium subscriptions are driving users to free tiers with fewer streams.',
          'Content moderation algorithms are reducing discovery for explicit content.'
        ],
        hot: [
          'Integration between podcasts and music is creating new promotional opportunities.',
          'Verification features for artists are increasing trust and engagement with official content.',
          'AI tools are creating personalized listening experiences that boost streams.',
          'Cross-platform promotion deals are creating viral momentum across services.',
          'Interactive music experiences are increasing time spent on platforms.'
        ],
        stable: [
          'Seasonal listening patterns remain predictable, with consistent engagement.',
          'Platform redesigns have maintained current engagement levels while improving UX.',
          'Industry standardization efforts are creating more consistent experiences.',
          'Premium content features are attracting a steady flow of new subscribers.',
          'Offline listening tools continue to be popular for mobile users.'
        ]
      };
      
      // All available streaming platforms
      const allPlatforms = currentState.streamingPlatforms?.map(p => p.name) || [
        "Spotify", "SoundCloud", "iTunes", "YouTube Music", "YouTube", "YouTube Vevo"
      ];
      
      // Randomly select a trend type
      const selectedType = trendTypes[Math.floor(Math.random() * trendTypes.length)];
      
      // Randomly select a name from the corresponding list
      const nameOptions = trendNames[selectedType];
      const selectedName = nameOptions[Math.floor(Math.random() * nameOptions.length)];
      
      // Randomly select a description from the corresponding list
      const descriptionOptions = trendDescriptions[selectedType];
      const selectedDescription = descriptionOptions[Math.floor(Math.random() * descriptionOptions.length)];
      
      // Randomly select 1-3 platforms to be affected
      const platformCount = Math.floor(Math.random() * 3) + 1;
      const shuffledPlatforms = [...allPlatforms].sort(() => 0.5 - Math.random());
      const selectedPlatforms = shuffledPlatforms.slice(0, platformCount);
      
      // Generate a random impact factor (1-10)
      const impactFactor = Math.floor(Math.random() * 10) + 1;
      
      // Generate a random duration (2-8 weeks)
      const duration = Math.floor(Math.random() * 7) + 2;
      
      // Create the new trend
      const newTrend: MarketTrend = {
        id: trendId,
        name: selectedName,
        description: selectedDescription,
        type: selectedType,
        affectedPlatforms: selectedPlatforms,
        impactFactor: impactFactor,
        duration: duration,
        startWeek: currentState.currentWeek
      };
      
      // Add the new trend to active trends
      set(state => ({
        ...state,
        activeMarketTrends: [...(state.activeMarketTrends || []), newTrend]
      }));
      
      return trendId;
    },
    
    processMarketTrends: () => {
      const currentState = get();
      const updatedState: Partial<GameState> = {};
      
      if (!currentState.activeMarketTrends || currentState.activeMarketTrends.length === 0) {
        return;
      }
      
      // Process active trends
      const { updatedActiveTrends, expiredTrends } = currentState.activeMarketTrends.reduce(
        (acc, trend) => {
          // Calculate remaining weeks
          const remainingWeeks = trend.startWeek + trend.duration - currentState.currentWeek;
          
          if (remainingWeeks <= 0) {
            // Trend has expired, add to expired trends
            acc.expiredTrends.push({
              ...trend,
              endWeek: currentState.currentWeek
            });
          } else {
            // Trend is still active
            acc.updatedActiveTrends.push(trend);
          }
          
          return acc;
        },
        { updatedActiveTrends: [] as MarketTrend[], expiredTrends: [] as MarketTrend[] }
      );
      
      // Update state with processed trends
      updatedState.activeMarketTrends = updatedActiveTrends;
      updatedState.pastMarketTrends = [
        ...(currentState.pastMarketTrends || []),
        ...expiredTrends
      ];
      
      // Apply trend effects to streaming platforms (this would be implemented in advanceWeek)
      // This is just a placeholder for the actual implementation
      
      set(updatedState);
    },
    
    getTrendEffect: (platformName: string): number => {
      const currentState = get();
      
      if (!currentState.activeMarketTrends || currentState.activeMarketTrends.length === 0) {
        return 1.0; // No effect if no active trends
      }
      
      // Find trends affecting this platform
      const relevantTrends = currentState.activeMarketTrends.filter(trend => 
        trend.affectedPlatforms.includes(platformName)
      );
      
      if (relevantTrends.length === 0) {
        return 1.0; // No effect if no relevant trends
      }
      
      // Calculate combined effect
      return relevantTrends.reduce((totalEffect, trend) => {
        // Base multiplier depends on trend type
        let trendMultiplier = 1.0;
        
        switch (trend.type) {
          case 'rising':
            trendMultiplier = 1.0 + (trend.impactFactor * 0.03); // +3% to +30%
            break;
          case 'falling':
            trendMultiplier = Math.max(0.7, 1.0 - (trend.impactFactor * 0.03)); // -3% to -30% (min 0.7)
            break;
          case 'hot':
            trendMultiplier = 1.0 + (trend.impactFactor * 0.05); // +5% to +50%
            break;
          case 'stable':
            // Stable trends have minimal impact on growth but reduce volatility
            trendMultiplier = 1.0 + (trend.impactFactor * 0.01); // +1% to +10%
            break;
        }
        
        return totalEffect * trendMultiplier;
      }, 1.0);
    },
    
    // Game navigation
    setScreen: (screen) => {
      const currentState = get();
      set({ 
        screen,
        previousScreen: currentState.screen
      });
    },
    
    // Character creation
    createCharacter: (characterInfo) => {
      const currentState = get();
      set({
        character: characterInfo,
        screen: "career_dashboard",
        previousScreen: currentState.screen,
        currentWeek: 1
      });
    },
    
    // Update character profile
    updateCharacter: (characterInfo) => {
      const currentState = get();
      if (!currentState.character) return;
      
      set({
        character: {
          ...currentState.character,
          ...characterInfo
        }
      });
    },
    
    // Update fanbase name
    updateFanbaseName: (name) => {
      const currentState = get();
      if (!currentState.character) return;
      
      set({
        character: {
          ...currentState.character,
          fanbaseName: name
        }
      });
      
      // Give a small boost to fan loyalty because they feel more connected
      set(state => ({
        stats: {
          ...state.stats,
          fanLoyalty: Math.min(100, state.stats.fanLoyalty + 3)
        }
      }));
      
      // Show confirmation toast
      alert(`Your fans will now be known as "${name}"!`);
    },
    
    // Game progression
    advanceWeek: () => {
      const currentState = get();
      const newWeek = currentState.currentWeek + 1;
      
      // Create a copy of the current state
      const updatedState: Partial<GameState> = {
        currentWeek: newWeek
      };
      
      // Process market trends first
      // This function will update activeMarketTrends and pastMarketTrends in updatedState
      get().processMarketTrends();
      
      // Random chance to generate a new market trend (15% chance each week)
      if (Math.random() < 0.15) {
        get().generateMarketTrend();
      }
      
      // STANDARDIZED MARKET SHARE - Define the same market share values used everywhere
      // This must match the exact values in releaseSong and respondToFeatureRequest
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
      
      // Check and update song performance statuses first (viral/flop/comeback)
      const songsWithUpdatedStatus = currentState.songs.map(song => {
        // Only check performance for released songs
        if (song.released && song.isActive) {
          // Check if the song's performance status should change
          const newPerformanceType = checkSongViralStatus(song, newWeek, currentState.stats);
          
          // If the performance status changed, update it with the current week
          if (newPerformanceType !== song.performanceType) {
            // Show a notification for important status changes
            if (newPerformanceType === 'viral' && song.performanceType !== 'viral') {
              alert(`Your song "${song.title}" just went viral! Streams are exploding!`);
            } else if (newPerformanceType === 'flop' && song.performanceType !== 'flop') {
              alert(`Your song "${song.title}" is flopping! Fans aren't connecting with it.`);
            } else if (newPerformanceType === 'comeback') {
              alert(`Your song "${song.title}" is making a comeback! It's gaining popularity again.`);
            }
            
            return {
              ...song,
              performanceType: newPerformanceType,
              performanceStatusWeek: newWeek
            };
          }
        }
        return song;
      });
      
      // Update song streams with the new performance statuses
      // Calculate all song growths first before applying them
      const songGrowths = songsWithUpdatedStatus.map(song => {
        if (song.isActive && song.released) {
          return calculateSongStreamGrowth(song, newWeek, currentState.stats);
        }
        return 0;
      });
      
      // Apply calculated growth to songs
      updatedState.songs = songsWithUpdatedStatus.map((song, index) => {
        if (song.released) {
          // For all released songs, apply growth if the song is active
          const growth = song.isActive ? songGrowths[index] : 0;
          
          // Debug logging to help track song growth
          console.log(`Song "${song.title}" - Current streams: ${song.streams}, Growth: ${growth}, Tier: ${song.tier}, Performance: ${song.performanceType}`);
          
          // A song stays active if:
          // 1. It has positive growth this week, OR
          // 2. It's a recent viral/comeback song that's still in its active period
          // SIGNIFICANTLY IMPROVED song activity logic to prevent songs from going inactive too quickly
          // This fix makes songs stay active much longer, especially for viral/hype songs
          const releaseAge = newWeek - (song.releaseDate || 0);
          
          // First, all new songs stay active for minimum weeks regardless of performance
          const minimumActiveWeeks = song.tier * 8; // 8-40 weeks based on tier (dramatically increased)
          
          // For viral or hype songs, they get an extended active window
          const hasHype = song.hype && song.hype > 0;
          const isViral = song.performanceType === 'viral' || song.performanceType === 'comeback';
          
          // Active duration multiplier based on performance type
          const activeMultiplier = 
            song.performanceType === 'viral' ? 3.0 :   // Viral songs last 3x longer
            song.performanceType === 'comeback' ? 2.5 : // Comeback songs last 2.5x longer
            song.performanceType === 'flop' ? 0.5 :    // Flops die quickly
            1.0;                                       // Normal songs, standard duration
          
          // Hype bonus adds 2 weeks per hype point
          const hypeBonus = hasHype ? song.hype * 2 : 0;
          
          // Calculate guaranteed active window (much longer than before)
          const guaranteedActiveWindow = Math.ceil(minimumActiveWeeks * activeMultiplier) + hypeBonus;
          
          // Songs stay active if any of these conditions are true:
          const shouldStayActive = 
            // 1. Always active during the guaranteed window, regardless of growth
            releaseAge < guaranteedActiveWindow ||
            
            // 2. Much more generous requirement - any song with any growth stays active
            growth > 0 ||
            
            // 3. Mid-tier songs (tier 2) stay active longer with minimal growth
            (song.tier === 2 && growth > 0) ||
            
            // 4. Special case: viral or high-tier songs stay active even with no growth for a while
            (isViral || song.tier >= 3) ||
            
            // 5. Songs with hype always stay active while hype lasts
            (hasHype && song.hype > 0);
          
          // Track if any song status change happened
          if (song.isActive !== shouldStayActive) {
            console.log(`Song "${song.title}" status changed: ${song.isActive ? 'active' : 'inactive'} → ${shouldStayActive ? 'active' : 'inactive'}`);
          }
          
          return {
            ...song,
            streams: song.streams + growth,
            isActive: shouldStayActive
          };
        }
        return song;
      });
      
      // Define platform market share is done at the beginning of the function
      
      // Helper function to create realistic platform-specific trends
      // Some platforms consistently perform better/worse for certain artists
      const getPlatformTrendFactor = (platformName: string): number => {
        // Each artist will have a "natural" platform that performs better
        // We'll use a deterministic random based on the current week to ensure consistency
        const artistSeed = (currentState.character?.artistName || 'default').charCodeAt(0);
        const platformSeed = platformName.charCodeAt(0) + platformName.length;
        const combinedSeed = artistSeed + platformSeed;
        
        // Generate a consistent trend factor (0.7-1.5 range)
        // This gives each platform a "natural" performance level for each artist
        // Creating the real-world effect where some artists do better on certain platforms
        const baseTrendFactor = 0.7 + ((combinedSeed % 80) / 100);
        
        // Add a small week-to-week variation (±20%) to create natural fluctuations 
        const weekVariation = 0.8 + (Math.random() * 0.4);
        
        // If this is the artist's "best platform", give it a significant boost
        const isBestPlatform = (combinedSeed % currentState.streamingPlatforms.length) === 
                              currentState.streamingPlatforms.findIndex(p => p.name === platformName);
        
        // Best platform gets a 30% bonus
        const bestPlatformBonus = isBestPlatform ? 1.3 : 1.0;
        
        return baseTrendFactor * weekVariation * bestPlatformBonus;
      };
      
      // Create a mapping of song streams to their release platforms
      const platformStreamMap: Record<string, number> = {};
      
      // DIRECT PLATFORM ALLOCATION: Explicitly assign different streaming values to platforms
      // This ensures platforms have completely different stream counts
      updatedState.songs?.forEach((song, index) => {
        if (song.released && song.isActive && song.releasePlatforms) {
          // Get the total growth for this song
          const totalGrowth = songGrowths[index];
          
          // Skip if no growth
          if (totalGrowth <= 0) return;
          
          // Generate a seed unique to this song that stays consistent week-to-week
          const songSeed = song.id.charCodeAt(0) + (song.title ? song.title.charCodeAt(0) : 0);
          
          // FORCEFULLY ALLOCATE DIFFERENT VALUES to each platform
          // This is the key fix - we're directly assigning different values to platforms
          song.releasePlatforms.forEach((platformName, platformIndex) => {
            // Generate a unique platform multiplier for this song+platform combination
            // This ensures consistent but different performance across platforms
            const platformSeed = platformName.charCodeAt(0) + platformName.length;
            const combinedSeed = (songSeed + platformSeed + platformIndex) % 100;
            
            // Create a fixed bias between 0.4 and 1.6 that's unique to this song+platform
            // This will make certain platforms consistently perform better/worse for specific songs
            const platformBias = 0.4 + (combinedSeed / 100) * 1.2;
            
            // Add weekly variation (±30%) so platforms don't grow in perfect proportion
            const weeklyVariation = 0.7 + (Math.random() * 0.6);
            
            // Add performance type multiplier (viral songs perform dramatically better on certain platforms)
            let performanceMultiplier = 1.0;
            if (song.performanceType === 'viral') {
              // Viral songs have 1-2 platforms where they perform exceptionally well
              const isViralPlatform = (combinedSeed % 3) === (platformIndex % 3);
              performanceMultiplier = isViralPlatform ? 2.5 : 1.2;
            } else if (song.performanceType === 'flop') {
              // Flops still perform okay on certain platforms (actual fans still listen)
              const isSupportivePlatform = (combinedSeed % 4) === (platformIndex % 4);
              performanceMultiplier = isSupportivePlatform ? 0.5 : 0.2;
            }
            
            // Calculate market share
            const marketShare = platformMarketShare[platformName as keyof typeof platformMarketShare] || 0.05;
            
            // Calculate this platform's portion of growth
            // This creates dramatically different values - especially for viral hits
            const platformGrowthShare = totalGrowth * (marketShare * platformBias * weeklyVariation * performanceMultiplier);
            
            // This is key - we must force values to be different between platforms
            // Add a small fixed randomizer based on platform index
            const forceVariation = 1.0 + (platformIndex * 0.02);
            const finalPlatformGrowth = platformGrowthShare * forceVariation;
            
            // Use integer division to ensure different values
            const roundedGrowth = Math.floor(finalPlatformGrowth);
            
            // Log for debugging
            console.log(`Song ${song.title}: Platform ${platformName} growth: ${roundedGrowth} (bias: ${platformBias.toFixed(2)}, variation: ${weeklyVariation.toFixed(2)}, perf: ${performanceMultiplier.toFixed(2)})`);
            
            // Add to platform map
            platformStreamMap[platformName] = (platformStreamMap[platformName] || 0) + roundedGrowth;
          });
        }
      });
      
      // Count active songs for listener decay calculation
      const activeSongs = updatedState.songs?.filter(song => song.isActive && song.released).length || 0;
      const totalReleasedSongs = updatedState.songs?.filter(song => song.released).length || 0;
      
      // FOOL-PROOF FIX: Force all platforms to have different stream counts in the UI
      // Initialize finalStreamsMap at this scope so it's available throughout the function
      const finalStreamsMap: Record<string, number> = {};
      
      // First, ensure streamingPlatforms exists and has elements
      if (!currentState.streamingPlatforms || currentState.streamingPlatforms.length === 0) {
        // Initialize empty streaming platforms if none exist
        updatedState.streamingPlatforms = [];
      } else {
        // Safely get platform names, ensuring we always have an array
        const allPlatformNames = currentState.streamingPlatforms?.map(p => p.name) || [];
        const platformGrowthSet = new Set();
        
        // Process platform growth values
        if (allPlatformNames.length > 0) {
          allPlatformNames.forEach(platformName => {
            let growth = platformStreamMap[platformName] || 0;
            
            // Make sure each growth value is unique
            while (platformGrowthSet.has(growth) && growth > 0) {
              growth += 1 + Math.floor(Math.random() * 5);
            }
            
            // Add this unique growth to our Set and update the map
            platformGrowthSet.add(growth);
            platformStreamMap[platformName] = growth;
          });
        }
        
        // Calculate initial values
        if (allPlatformNames.length > 0) {
          allPlatformNames.forEach(platformName => {
            const platform = currentState.streamingPlatforms?.find(p => p.name === platformName);
            if (platform) {
              finalStreamsMap[platformName] = platform.totalStreams + (platformStreamMap[platformName] || 0);
            }
          });
          
          // Ensure no duplicate values
          const finalStreamsSet = new Set();
          allPlatformNames.forEach(platformName => {
            let totalStreams = finalStreamsMap[platformName];
            
            if (totalStreams !== undefined) {
              while (finalStreamsSet.has(totalStreams)) {
                totalStreams += 1 + Math.floor(Math.random() * 5);
              }
              
              finalStreamsSet.add(totalStreams);
              finalStreamsMap[platformName] = totalStreams;
            }
          });
        }
      }
      
      // NOW update each platform with guaranteed unique values
      updatedState.streamingPlatforms = currentState.streamingPlatforms.map(platform => {
        // Get the forced unique streams allocated to this platform
        const updatedStreams = finalStreamsMap[platform.name] || platform.totalStreams;
        
        // For new players, platforms start with small numbers, then accelerate
        // Calculate base monthly listeners from streams with better progression curve
        
        // First scale for small numbers (0-100K streams)
        if (updatedStreams < 100000) {
          // Early game: More generous listener ratio (1:3) to make progress feel rewarding
          let baseListeners = Math.ceil(updatedStreams / 3);
          
          // Apply listener decay based on active songs ratio
          const listenerDecay = calculateMonthlyListenerDecay(
            platform.listeners, 
            activeSongs, 
            totalReleasedSongs
          );
          
          // Make sure listeners don't drop too drastically
          const minListeners = Math.floor(platform.listeners * 0.85); // Never lose more than 15% of listeners
          
          // Final listeners is the maximum of: baseListeners, minListeners, or (current listeners - decay)
          const updatedListeners = Math.max(
            baseListeners,
            minListeners, 
            Math.floor(platform.listeners - listenerDecay)
          );
          
          return {
            ...platform,
            totalStreams: updatedStreams,
            listeners: updatedListeners,
            revenue: calculateStreamingRevenue(updatedStreams)
          };
        }
        
        // Mid game (100K-10M streams)
        if (updatedStreams < 10000000) {
          // Mid game: Moderate listener ratio (1:5)
          let baseListeners = Math.ceil(updatedStreams / 5);
          
          // Apply listener decay based on active songs ratio
          const listenerDecay = calculateMonthlyListenerDecay(
            platform.listeners, 
            activeSongs, 
            totalReleasedSongs
          );
          
          // Make sure listeners don't drop too drastically
          const minListeners = Math.floor(platform.listeners * 0.9); // Never lose more than 10% of listeners
          
          // Final listeners is the maximum of: baseListeners, minListeners, or (current listeners - decay)
          const updatedListeners = Math.max(
            baseListeners,
            minListeners, 
            Math.floor(platform.listeners - listenerDecay)
          );
          
          return {
            ...platform,
            totalStreams: updatedStreams,
            listeners: updatedListeners,
            revenue: calculateStreamingRevenue(updatedStreams)
          };
        }
        
        // Late game (>10M streams)
        // Calculate base monthly listeners from streams - use variable ratio based on platform size
        // Bigger platforms have higher streams-to-listeners ratio (more passive listeners)
        const platformMultiplier = Math.max(8, 15 - (platform.listeners / 1000000) * 0.5); // Ranges from 8-15
        let baseListeners = Math.ceil(updatedStreams / platformMultiplier);
        
        // Apply listener decay based on active songs ratio
        const listenerDecay = calculateMonthlyListenerDecay(
          platform.listeners, 
          activeSongs, 
          totalReleasedSongs
        );
        
        // Make sure listeners don't drop too drastically for established artists
        const minListeners = Math.floor(platform.listeners * 0.95); // Established artists retain 95% minimum
        
        // Final listeners is the maximum of: baseListeners, minListeners, or (current listeners - decay)
        const updatedListeners = Math.max(
          baseListeners,
          minListeners, 
          Math.floor(platform.listeners - listenerDecay)
        );
        
        // Calculate revenue using the platform-specific rate
        return {
          ...platform,
          totalStreams: updatedStreams,
          listeners: updatedListeners,
          revenue: calculateStreamingRevenue(updatedStreams, platform.name)
        };
      });
      
      // Update AI rappers' profiles with their song performances
      // This ensures featured artists continue to gain benefits from songs they're on
      const updatedRappers = currentState.aiRappers.map(rapper => {
        // Find songs where this rapper is featured by the player
        const featuredSongs = updatedState.songs?.filter(
          song => song.released && song.featuring.includes(rapper.id) && !song.aiRapperOwner
        ) || [];
        
        // Find songs owned by this AI rapper that feature the player
        const rapperOwnedSongs = updatedState.songs?.filter(
          song => song.released && song.aiRapperOwner === rapper.id && song.aiRapperFeaturesPlayer
        ) || [];
        
        // Calculate ongoing benefits from featured songs (when rapper is featured by player)
        let streamBenefit = 0;
        let listenerBenefit = 0;
        
        featuredSongs.forEach(song => {
          // Active songs continue to benefit the featured artist
          if (song.isActive) {
            const songIndex = updatedState.songs?.findIndex(s => s.id === song.id) || -1;
            if (songIndex !== -1) {
              const songGrowth = songGrowths[songIndex];
              // Featured artist gets a percentage of song growth
              const growthShare = songGrowth * (0.2 + (song.tier / 20)); // 20-45% based on tier
              streamBenefit += growthShare;
              
              // Monthly listener benefit
              listenerBenefit += Math.floor(growthShare / 10);
            }
          }
        });
        
        // Calculate growth for rapper's own songs (including those featuring the player)
        rapperOwnedSongs.forEach(song => {
          if (song.isActive) {
            // For songs owned by the AI rapper, update their streams directly
            const songIndex = updatedState.songs?.findIndex(s => s.id === song.id) || -1;
            if (songIndex !== -1) {
              // Calculate AI rapper song growth (simpler than player songs)
              const rapperPopularityFactor = rapper.popularity / 50; // 0.5-2.0
              const tierFactor = song.tier / 3; // Higher tier songs last longer
              const weeksSinceRelease = newWeek - song.releaseDate;
              const decayFactor = Math.max(0.1, 1 - (weeksSinceRelease * 0.05));
              
              // Base growth for AI rapper song
              const songGrowth = song.streams * 0.15 * decayFactor * rapperPopularityFactor * tierFactor;
              
              // Apply special performance types
              let finalGrowth = songGrowth;
              if (song.performanceType === 'viral') {
                finalGrowth *= 2.5;
              } else if (song.performanceType === 'flop') {
                finalGrowth *= 0.4;
              }
              
              // Update the song in the songs array
              if (updatedState.songs) {
                updatedState.songs[songIndex] = {
                  ...song,
                  streams: song.streams + Math.floor(finalGrowth),
                  isActive: 
                    // Low-tier flops (tier 1-2) lose listeners quickly - only active for 2 weeks
                    (song.tier <= 2 && song.performanceType === 'flop')
                      ? weeksSinceRelease < 2
                      : finalGrowth > 10 || weeksSinceRelease < 40 // Other AI songs stay active longer
                };
              }
              
              // Add to rapper's overall stream count
              streamBenefit += finalGrowth;
              listenerBenefit += Math.floor(finalGrowth / 8);
              
              // Calculate player's share of streams from this AI rapper song featuring them
              if (song.aiRapperFeaturesPlayer && updatedState.streamingPlatforms) {
                // Player gets 20-30% of song growth, based on tier
                const playerGrowthShare = finalGrowth * (0.2 + (song.tier / 20));
                
                // Distribute to player's platforms
                updatedState.streamingPlatforms = updatedState.streamingPlatforms.map(platform => {
                  // Only add streams to platforms where the song is released
                  if (song.releasePlatforms.includes(platform.name)) {
                    // Apply platform-specific market share and randomization
                    const platformMarketShare = {
                      'Spotify': 0.31,            // ~31% market share
                      'YouTube Music': 0.25,      // ~25% market share
                      'Apple Music': 0.15,        // ~15% market share  
                      'SoundCloud': 0.05,         // ~5% market share
                      'Amazon Music': 0.12,       // ~12% market share
                      'Deezer': 0.03,             // ~3% market share
                      'Tidal': 0.02,              // ~2% market share
                      'Other': 0.07,              // ~7% market share for all others
                    };
                    
                    // Get market share for this platform
                    const marketShare = platformMarketShare[platform.name as keyof typeof platformMarketShare] || 0.05;
                    
                    // Add more randomness (±40%)
                    const randomFactor = 0.6 + (Math.random() * 0.8);
                    
                    // Calculate weighted share with randomness
                    const platformShare = playerGrowthShare * marketShare * randomFactor;
                    
                    return {
                      ...platform,
                      totalStreams: platform.totalStreams + Math.floor(platformShare),
                      revenue: platform.revenue + calculateStreamingRevenue(platformShare, platform.name) // Platform-specific rate
                    };
                  }
                  return platform;
                });
              }
            }
          }
        });
        
        // Calculate a more stable monthly listener value
        // Reduced natural decay from 5% to 2% for more stability
        const currentDecay = Math.floor(rapper.monthlyListeners * 0.02);
        
        // Create a smoothing effect so changes aren't too dramatic
        const smoothedListeners = Math.max(
          // Add benefit, subtract smaller decay
          rapper.monthlyListeners + Math.floor(listenerBenefit) - currentDecay,
          // Establish a stable floor based on total streams but with a higher divisor
          // This prevents dramatic shifts from the floor value
          Math.ceil((rapper.totalStreams + Math.floor(streamBenefit)) / 25)
        );
        
        // Apply an additional stability constraint: maximum change of 15% per week
        const maxIncrease = rapper.monthlyListeners * 1.15;
        const maxDecrease = rapper.monthlyListeners * 0.85;
        
        // Constrain the monthly listeners within these bounds
        const stableMonthlyListeners = Math.min(
          maxIncrease,
          Math.max(maxDecrease, smoothedListeners)
        );
        
        return {
          ...rapper,
          totalStreams: rapper.totalStreams + Math.floor(streamBenefit),
          monthlyListeners: Math.floor(stableMonthlyListeners)
        };
      });
      
      // Update the AI rappers in state
      updatedState.aiRappers = updatedRappers;
      
      // Update album streams
      if (currentState.albums && currentState.albums.length > 0) {
        const releasedAlbums = currentState.albums.filter(album => album.released);
        
        if (releasedAlbums.length > 0) {
          // Create updated albums array with new streams
          updatedState.albums = currentState.albums.map(album => {
            // Only update streams for released albums
            if (album.released) {
              try {
                // Calculate weeks since release - ensure proper default values
                const releaseDate = album.releaseDate || newWeek;
                const weeksSinceRelease = newWeek - releaseDate;
                
                // Calculate album growth factors
                const recentReleaseFactor = Math.max(0.2, 1 - (weeksSinceRelease * 0.03)); // Newer albums grow faster
                
                // Make sure we're using actual numbers for ratings with proper defaults
                const criticalRating = typeof album.criticalRating === 'number' && !isNaN(album.criticalRating) ? album.criticalRating : 5;
                const fanRating = typeof album.fanRating === 'number' && !isNaN(album.fanRating) ? album.fanRating : 5;
                const qualityFactor = (criticalRating + fanRating) / 20; // 0.5-1.0 based on ratings
                
                // Ensure album has a songIds array to prevent errors
                const songIds = album.songIds || [];
                const songCountFactor = Math.min(1.5, songIds.length / 7); // More songs = higher growth, up to 1.5x
                
                // Log current album state for debugging
                console.log(`Updating album "${album.title}" - Current streams: ${album.streams}, Weeks since release: ${weeksSinceRelease}`);
                console.log(`Current platformStreams:`, album.platformStreams);
                
                // Calculate streams growth - FURTHER reduced growth rate (0.5-1.5% for newer albums, decaying over time)
                // Previous rates were way too high (15-25%), causing exponential growth issues
                const growthRate = 0.005 + (recentReleaseFactor * 0.01 * qualityFactor * songCountFactor);
                
                // Apply a minimum growth rate for very new albums (first 8 weeks) - but keep it reasonable
                const minGrowthRate = weeksSinceRelease <= 8 ? 0.01 : 0.002;
                const effectiveGrowthRate = Math.max(minGrowthRate, growthRate);
                
                // Calculate new streams with some randomness
                // Ensure album has valid streams to prevent NaN errors
                const baseStreams = typeof album.streams === 'number' && !isNaN(album.streams) ? album.streams : 0;
                
                // Add a maximum cap for album streams based on quality and time
                // Even the best albums eventually slow down their growth
                // Reduced the cap to prevent albums growing too large - quality albums now cap at 5-10M
                const streamCap = 5000000 * (qualityFactor * 2) * songCountFactor; 
                
                // Stronger cap effect - when an album reaches 80% of its cap, growth slows drastically
                const capRatio = baseStreams / streamCap;
                const capFactor = capRatio >= 0.8 ? 
                  Math.max(0.05, 1 - capRatio) : // Strong slowdown when near cap (95% reduction at cap)
                  Math.max(0.2, 1 - (baseStreams / streamCap)); // Normal slowdown otherwise
                
                // IMPORTANT: Ensure sensible stream growth for active albums
                // Reduced minimum growth rate to 0.2% for more reasonable long-term values
                const minStreamGrowth = Math.max(
                  weeksSinceRelease <= 4 ? 500 : 100, // Minimum 500 streams for new albums, 100 for older ones
                  Math.floor(baseStreams * 0.002) // At least 0.2% growth
                );
                
                // Apply standard growth calculation with cap factor to slow growth as it approaches cap
                const calculatedGrowth = Math.floor(baseStreams * effectiveGrowthRate * capFactor * (0.8 + Math.random() * 0.4));
                
                // If we're at or over the cap, severely limit growth
                const isCapped = baseStreams >= streamCap * 0.95;
                
                // Use the larger of calculated or minimum growth, but respect the cap
                // Cap growth at 0.05% when near the cap (1/20 of regular growth)
                const streamGrowth = isCapped ? 
                  Math.min(500, Math.floor(baseStreams * 0.0005)) : // Minimal growth when capped (0.05% or max 500)
                  Math.max(minStreamGrowth, calculatedGrowth);
                
                console.log(`Album "${album.title}" growth rate: ${effectiveGrowthRate.toFixed(2)}, Stream growth: ${streamGrowth}`);
                
                // Calculate additional streams for albums - platform-specific growth
                // This ensures the album shows up on each platform and doesn't stay at 0
                let platformSpecificStreams: Record<string, number> = {};
                currentState.streamingPlatforms.forEach(platform => {
                  if (platform.isUnlocked) {
                    const platformName = platform.name;
                    const marketShare = platformMarketShare[platformName as keyof typeof platformMarketShare] || 0.05;
                    
                    // Ensure unique values per platform with a small random variation
                    const platformVariation = 0.9 + (Math.random() * 0.2);
                    const platformStreams = Math.floor(streamGrowth * marketShare * platformVariation);
                    
                    // Don't enforce a fixed minimum that would cap growth - instead make sure it's proportional
                    // Use at least 50% of the potential growth but don't cap the upper end
                    const minPlatformGrowth = Math.floor(streamGrowth * marketShare * 0.5);
                    
                    // Use the larger of calculated or minimum platform growth
                    platformSpecificStreams[platformName] = Math.max(minPlatformGrowth, platformStreams);
                  }
                });
                
                // Make sure we have valid platform streams to update
                const existingPlatformStreams = album.platformStreams || {};
                
                // Create updated platform streams
                const updatedPlatformStreams: Record<string, number> = {};
                
                // Update each platform's streams
                Object.keys(platformSpecificStreams).forEach(platform => {
                  const existingStreams = existingPlatformStreams[platform] || 0;
                  const newStreams = platformSpecificStreams[platform] || 0;
                  updatedPlatformStreams[platform] = existingStreams + newStreams;
                });
                
                // Get songs from this album to update their streams too
                const songs = currentState.songs.filter(song => album.songIds.includes(song.id));
                
                // If this album has songs, distribute the streams among them based on song quality
                if (songs.length > 0) {
                  const totalQuality = songs.reduce((sum, song) => sum + (song.quality || 50), 0);
                  const averageQuality = totalQuality / songs.length;
                  
                  // Make sure updatedState.songs exists before trying to update songs
                  if (!updatedState.songs) {
                    // If updatedState.songs doesn't exist yet, initialize it with a copy of the current songs
                    updatedState.songs = [...currentState.songs];
                  }
                  
                  // Update each song's streams - songs need stream counts for Popular section
                  songs.forEach(song => {
                    // Find song in the updatedState to update it
                    const songIndex = updatedState.songs.findIndex(s => s.id === song.id);
                    if (songIndex !== -1) {
                      // Allocate streams based on song's relative quality
                      const qualityFactor = (song.quality || 50) / averageQuality;
                      // Each song gets a share of streams based on quality + random factor
                      const songStreamGrowth = Math.floor(streamGrowth / songs.length * qualityFactor * (0.8 + Math.random() * 0.4));
                      
                      // Update song streams
                      updatedState.songs[songIndex] = {
                        ...updatedState.songs[songIndex],
                        streams: (updatedState.songs[songIndex].streams || 0) + songStreamGrowth
                      };
                    }
                  });
                }
                
                // Update album data safely with proper defaults
                return {
                  ...album,
                  streams: baseStreams + streamGrowth,
                  sales: (album.sales || 0) + Math.floor(streamGrowth * 0.01), // About 1% of new streams convert to sales
                  revenue: (album.revenue || 0) + calculateStreamingRevenue(streamGrowth),
                  platformStreams: {
                    ...existingPlatformStreams,
                    ...updatedPlatformStreams
                  }
                };
              } catch (error) {
                console.error("Error updating album streams:", error);
                // Return album unchanged if there was an error
                return album;
              }
            }
            return album;
          });
        }
      }

      // Update social media followers
      updatedState.socialMedia = currentState.socialMedia.map(platform => {
        const followerGrowth = calculateSocialMediaGrowth(
          platform.followers,
          platform.posts,
          platform.engagement,
          platform.lastPostWeek,
          newWeek
        );
        
        return {
          ...platform,
          followers: platform.followers + followerGrowth
        };
      });
      
      // Sum up all updated platform streams from albums and update platform totals
      // Fix: Need to update platform totalStreams based on album stream increases
      const updatedPlatformStreams: Record<string, number> = {};
      
      // First, calculate the new streams that were added to each platform from albums
      // Add null check for updatedState.albums
      if (updatedState.albums) {
        updatedState.albums.forEach(album => {
          if (album.platformStreams && album.released) {
            // For each platform, add its streams to the platform total
            Object.entries(album.platformStreams).forEach(([platformName, streams]) => {
              // Initialize if not exists
              if (!updatedPlatformStreams[platformName]) {
                updatedPlatformStreams[platformName] = 0;
              }
              // Add this album's streams to the platform total
              updatedPlatformStreams[platformName] += streams;
            });
          }
        });
      }
      
      // Now update the streaming platforms with these totals
      updatedState.streamingPlatforms = updatedState.streamingPlatforms.map(platform => {
        const platformTotal = updatedPlatformStreams[platform.name] || 0;
        const lastWeekTotal = currentState.streamingPlatforms.find(p => p.name === platform.name)?.totalStreams || 0;
        
        // Calculate new streams this week
        const newStreams = platformTotal - lastWeekTotal;
        
        // Calculate revenue from new streams
        const platformRevenue = calculateStreamingRevenue(newStreams, platform.name);
        
        console.log(`Platform ${platform.name} - New streams: ${newStreams}, Revenue generated: $${platformRevenue.toFixed(2)}`);
        
        // Return updated platform
        return {
          ...platform,
          totalStreams: platformTotal, // Update with accurate total from albums
          revenue: platform.revenue + platformRevenue
        };
      });
      
      // Calculate total streams across all platforms for career level
      const allStreams = (updatedState.streamingPlatforms || [])
        .reduce((total, platform) => total + platform.totalStreams, 0);
      
      // Calculate this week's revenue from all platforms
      const weeklyRevenue = (updatedState.streamingPlatforms || [])
        .reduce((total, platform) => {
          const lastWeekPlatform = currentState.streamingPlatforms.find(p => p.name === platform.name);
          if (!lastWeekPlatform) return total;
          
          // Calculate new streams this week
          const newStreams = platform.totalStreams - lastWeekPlatform.totalStreams;
          
          // Calculate revenue from new streams using platform-specific rates
          const platformRevenue = calculateStreamingRevenue(newStreams, platform.name);
          
          return total + platformRevenue;
        }, 0);
        
      console.log(`Total weekly revenue: $${weeklyRevenue.toFixed(2)}`);
      
      // Update career stats
      updatedState.stats = {
        ...currentState.stats,
        careerLevel: calculateCareerLevel(allStreams),
        // Add weekly revenue to wealth
        wealth: currentState.stats.wealth + weeklyRevenue,
        // Small natural increase in creativity each week
        creativity: Math.min(100, currentState.stats.creativity + 0.2),
      };
      
      // Generate random events (15% chance per week)
      const randomEvent = getRandomEventForWeek(
        currentState.activeRandomEvents,
        currentState.resolvedRandomEvents.map(e => e.id)
      );
      
      if (randomEvent) {
        updatedState.activeRandomEvents = [...currentState.activeRandomEvents, randomEvent];
      }
      
      // AI rappers might send feature requests based on their popularity and the player's status
      const newCollaborationRequests = [...currentState.collaborationRequests];
      
      // Get player's career stats
      const careerLevel = calculateCareerLevel(
        updatedState.streamingPlatforms.reduce((total, platform) => total + platform.totalStreams, 0)
      );
      
      const totalMonthlyListeners = calculateTotalMonthlyListeners(updatedState.streamingPlatforms);
      
      currentState.aiRappers.forEach(rapper => {
        // Calculate the chance of this rapper requesting a feature
        const requestChance = calculateAIFeatureRequestChance(
          rapper,
          currentState.stats.reputation,
          totalMonthlyListeners,
          careerLevel
        );
        
        // Check if they send a request
        if (Math.random() < requestChance) {
          // Determine tier based on rapper popularity and player status
          let requestTier: SongTier;
          
          if (rapper.popularity >= 90) {
            // Top-tier artists (90+ popularity)
            if (currentState.stats.reputation >= 80 && totalMonthlyListeners > 5000000) {
              // High reputation + 5M+ listeners can get tier 5 requests from top artists
              requestTier = Math.random() < 0.1 ? 5 : 4;
            } else {
              // Otherwise always tier 4 for very popular artists
              requestTier = 4;
            }
          } else if (rapper.popularity >= 70) {
            // Mid-high tier artists (70-89 popularity)
            if (currentState.stats.reputation >= 60 && totalMonthlyListeners > 1000000) {
              // Good reputation + 1M+ listeners might get tier 4
              requestTier = Math.random() < 0.3 ? 4 : 3;
            } else {
              // Otherwise tier 3
              requestTier = 3;
            }
          } else {
            // Lower tier artists (below 70 popularity)
            requestTier = 3; // Always tier 3
          }
          
          newCollaborationRequests.push({
            rapperId: rapper.id,
            songTier: requestTier,
            weekOffered: newWeek,
            accepted: null
          });
        }
      });
      
      updatedState.collaborationRequests = newCollaborationRequests;
      
      // Calculate followers and listeners for weekly stats
      const totalFollowers = (updatedState.socialMedia || [])
        .reduce((total, platform) => total + platform.followers, 0);
      
      const totalListeners = (updatedState.streamingPlatforms || [])
        .reduce((total, platform) => total + platform.listeners, 0);
      
      // Create weekly stats entry
      const releasedSongs = currentState.songs.filter(song => 
        song.releaseDate === currentState.currentWeek
      );
      
      const weeklyEntry: WeeklyStats = {
        week: newWeek,
        totalStreams: allStreams,
        totalFollowers,
        totalListeners,
        wealth: updatedState.stats?.wealth || currentState.stats.wealth,
        reputation: updatedState.stats?.reputation || currentState.stats.reputation,
        songsReleased: releasedSongs.length,
        songIds: releasedSongs.map(song => song.id)
      };
      
      // Add weekly stats to state
      updatedState.weeklyStats = [...(currentState.weeklyStats || []), weeklyEntry];
      
      // Update hype levels for active hype events (decay over time)
      if (currentState.activeHypeEvents && currentState.activeHypeEvents.length > 0) {
        updatedState.activeHypeEvents = currentState.activeHypeEvents.map(hypeEvent => {
          // Calculate new hype level based on decay rate
          const newHypeLevel = Math.max(0, hypeEvent.hypeLevel - hypeEvent.decayRate);
          
          // If target release week has passed and not released, add to decay rate
          const extraDecay = (newWeek > hypeEvent.targetReleaseWeek && !hypeEvent.released) ? 10 : 0;
          
          return {
            ...hypeEvent,
            hypeLevel: Math.max(0, newHypeLevel - extraDecay)
          };
        });
      }
      
      // Process merchandise sales
      if (currentState.merchandiseItems && currentState.merchandiseItems.length > 0) {
        // Call the merchandise sales processing function
        get().processMerchandiseSales();
      }
      
      // Chance to generate random controversies based on player's fame and career level
      const controversyChance = Math.min(
        5, // Max 5% chance per week (reduced from 20%)
        (currentState.stats.careerLevel * 0.2) + // 0.2% per career level (reduced from 0.5%)
        (currentState.stats.reputation * 0.05)   // 0.05% per reputation point (reduced from 0.1%)
      );
      
      // Roll for controversy
      if (Math.random() * 100 < controversyChance) {
        // Determine severity based on career level and randomness
        let severityRoll = Math.random() * 100;
        let severity: ControversySeverity;
        
        if (currentState.stats.careerLevel <= 3) {
          // Early career: mostly minor controversies
          severity = severityRoll < 80 ? 'minor' : 
                   severityRoll < 95 ? 'moderate' : 'major';
        } else if (currentState.stats.careerLevel <= 7) {
          // Mid career: mix of minor and moderate
          severity = severityRoll < 50 ? 'minor' : 
                   severityRoll < 85 ? 'moderate' : 
                   severityRoll < 97 ? 'major' : 'severe';
        } else {
          // Late career: more serious controversies
          severity = severityRoll < 30 ? 'minor' : 
                   severityRoll < 65 ? 'moderate' : 
                   severityRoll < 90 ? 'major' : 'severe';
        }
        
        // Select random controversy type
        const controversyTypes: ControversyType[] = [
          'offensive_tweet',
          'leaked_audio',
          'public_feud',
          'relationship_drama',
          'inappropriate_comments',
          'substance_abuse',
          'legal_trouble',
          'conspiracy_theory'
        ];
        
        const randomType = controversyTypes[Math.floor(Math.random() * controversyTypes.length)];
        
        // Generate the controversy
        // (But only if we don't already have an active one)
        if (!currentState.activeControversies || currentState.activeControversies.length === 0) {
          const controversyId = get().generateControversy(randomType, severity);
          console.log(`Generated new controversy: ${controversyId} (${randomType}, ${severity})`);
        }
      }
      
      // Update views for music videos based on song performance
      if (updatedState.musicVideos && updatedState.musicVideos.length > 0 && updatedState.songs) {
        updatedState.musicVideos = updatedState.musicVideos.map(video => {
          // Find the corresponding song for this video
          const song = updatedState.songs?.find(s => s.id === video.songId);
          
          if (song && song.isActive) {
            // Base view growth depends on song streams and viral status
            let viewGrowth = 0;
            
            // Calculate view growth based on song performance type
            if (song.performanceType === 'viral') {
              // Viral songs get massive view boosts (30-50% of streams)
              const viralBoost = Math.random() * 0.2 + 0.3; // 30-50%
              viewGrowth = Math.floor(song.streams * viralBoost);
            } else if (song.performanceType === 'comeback') {
              // Comeback songs get good view boosts (15-30% of streams)
              const comebackBoost = Math.random() * 0.15 + 0.15; // 15-30%
              viewGrowth = Math.floor(song.streams * comebackBoost);
            } else if (song.performanceType === 'flop') {
              // Flop songs get minimal views (0-5% of streams)
              const flopRate = Math.random() * 0.05; // 0-5%
              viewGrowth = Math.floor(song.streams * flopRate);
            } else {
              // Normal songs get moderate view growth (5-15% of streams)
              const normalRate = Math.random() * 0.1 + 0.05; // 5-15%
              viewGrowth = Math.floor(song.streams * normalRate);
            }
            
            // Quality multiplier - premium videos get more views
            const qualityMultiplier = video.quality === "premium" ? 1.5 : 1.0;
            viewGrowth = Math.floor(viewGrowth * qualityMultiplier);
            
            // Video age affects growth (older videos get fewer views)
            const videoAge = newWeek - video.releaseDate;
            const ageDecay = Math.max(0.1, 1 - (videoAge / 10)); // Gradual decay over 10 weeks
            viewGrowth = Math.floor(viewGrowth * ageDecay);
            
            // Calculate likes (between 4-12% of new views)
            const likeRate = (Math.random() * 0.08) + 0.04; // 4-12%
            const newLikes = Math.floor(viewGrowth * likeRate);
            
            // Update the video with new views and likes
            return {
              ...video,
              views: video.views + viewGrowth,
              likes: video.likes + newLikes
            };
          }
          
          return video;
        });
        
        // Update total views on video platforms and calculate revenue
        if (updatedState.videosPlatforms && updatedState.musicVideos) {
          updatedState.videosPlatforms = updatedState.videosPlatforms.map(platform => {
            // Sum all views for this platform
            const platformVideos = updatedState.musicVideos?.filter(v => v.platform === platform.name) || [];
            const totalViews = platformVideos.reduce((sum, video) => sum + video.views, 0);
            
            // Calculate revenue from views (using standard CPM rates)
            // YouTube: $0.0012 per view (or $1.20 per 1000 views)
            // VEVO: $0.0018 per view (or $1.80 per 1000 views)
            const revenueRate = platform.name === "VEVO" ? 0.0018 : 0.0012;
            const calculatedRevenue = Math.floor(totalViews * revenueRate);
            
            return {
              ...platform,
              totalViews: totalViews,
              revenue: calculatedRevenue
            };
          });
        }
      }
      
      // Process scheduled concerts for this week
      if (currentState.concerts) {
        const concertsThisWeek = currentState.concerts.filter(
          concert => concert.week === currentState.currentWeek && concert.status === "scheduled"
        );
        
        if (concertsThisWeek.length > 0) {
          // Process each concert that's happening this week
          const processedConcerts = concertsThisWeek.map(concert => {
            const venue = currentState.venues?.find(v => v.id === concert.venueId);
            if (!venue) return concert;
            
            // Calculate performance quality based on player stats
            // Factors: stagePower, creativity, tier of songs in setlist
            const stagePower = currentState.stats.stagePower || 
                              (currentState.stats.creativity * 0.3 + 
                               currentState.stats.marketing * 0.3 + 
                               currentState.stats.networking * 0.4);
            
            // Calculate setlist quality
            const setlistSongs = concert.setlist.map(songId => 
              currentState.songs.find(s => s.id === songId)
            ).filter(s => s !== undefined) as Song[];
            
            const averageSongTier = setlistSongs.length > 0 
              ? setlistSongs.reduce((sum, song) => sum + song.tier, 0) / setlistSongs.length
              : 1;
            
            // Calculate performance quality (0-100)
            const performanceQuality = Math.min(100, Math.floor(
              (stagePower * 0.5) + 
              (currentState.stats.reputation * 0.3) + 
              (averageSongTier * 5) +
              (Math.random() * 10) // Random factor
            ));
            
            // Calculate attendance based on venue capacity, reputation, and performance quality
            const baseAttendance = Math.min(
              venue.capacity,
              Math.floor(venue.capacity * (currentState.stats.fanLoyalty / 100) * 0.5 + 
                        venue.capacity * (currentState.stats.reputation / 100) * 0.5)
            );
            
            // Add some randomness to attendance (±15%)
            const randomFactor = 0.85 + (Math.random() * 0.3);
            const finalAttendance = Math.min(venue.capacity, Math.floor(baseAttendance * randomFactor));
            
            // Calculate revenue from ticket sales
            const concertRevenue = finalAttendance * concert.ticketPrice;
            
            // Calculate profit
            const profit = concertRevenue - venue.cost;
            
            // Determine audience satisfaction based on performance quality
            let audienceSatisfaction;
            let performance;
            
            if (performanceQuality >= 85) {
              audienceSatisfaction = "excellent";
              performance = "excellent";
            } else if (performanceQuality >= 70) {
              audienceSatisfaction = "good";
              performance = "good";
            } else if (performanceQuality >= 50) {
              audienceSatisfaction = "average";
              performance = "average";
            } else {
              audienceSatisfaction = "poor";
              performance = "poor";
            }
            
            // Calculate reputation gain based on performance quality and venue size
            const venueReputationBonus = 
              venue.size === 'small' ? 1 : 
              venue.size === 'medium' ? 2 : 
              venue.size === 'large' ? 3 : 4; // Arena gets highest bonus
              
            const reputationGain = Math.floor(
              (performanceQuality / 20) * venueReputationBonus
            );
            
            // Update the concert with performance results
            return {
              ...concert,
              ticketsSold: finalAttendance,
              revenue: concertRevenue,
              profit: profit,
              performanceQuality: performanceQuality,
              audienceSatisfaction: audienceSatisfaction,
              reputationGain: reputationGain,
              status: "completed"
            };
          });
          
          // Add processed concerts to the state update
          updatedState.concerts = (currentState.concerts || []).map(
            concert => {
              const processed = processedConcerts.find(c => c.id === concert.id);
              return processed || concert;
            }
          );
          
          // Add to past shows for tracking
          const pastShows = (processedConcerts).map(concert => {
            const venue = currentState.venues?.find(v => v.id === concert.venueId);
            return {
              venueId: concert.venueId,
              week: concert.week,
              revenue: concert.revenue,
              attendance: concert.ticketsSold,
              performance: concert.audienceSatisfaction
            } as PastShow;
          });
          
          // Add to player stats: wealth, reputation, fanLoyalty
          const totalRevenue = processedConcerts.reduce((sum, c) => sum + c.revenue, 0);
          const averageReputationGain = processedConcerts.reduce((sum, c) => sum + c.reputationGain, 0) / processedConcerts.length;
          
          updatedState.stats = {
            ...updatedState.stats,
            wealth: updatedState.stats.wealth + totalRevenue,
            reputation: Math.min(100, updatedState.stats.reputation + averageReputationGain),
            fanLoyalty: Math.min(100, updatedState.stats.fanLoyalty + (averageReputationGain / 2)),
            // Improve stage power with each performance
            stagePower: Math.min(100, (updatedState.stats.stagePower || 35) + 0.5)
          };
          
          // Add past shows to state
          updatedState.pastShows = [...(currentState.pastShows || []), ...pastShows];
          
          // Alert the player about their performances
          if (processedConcerts.length === 1) {
            const concert = processedConcerts[0];
            const venue = currentState.venues?.find(v => v.id === concert.venueId);
            alert(`Your concert at ${venue?.name} is complete! You sold ${concert.ticketsSold} tickets and earned $${concert.revenue}. The audience thought your performance was ${concert.audienceSatisfaction}!`);
          } else {
            alert(`${processedConcerts.length} of your concerts happened this week, earning you a total of $${totalRevenue}!`);
          }
        }
      }
      
      // Process active tours
      if (currentState.tours && currentState.tours.length > 0) {
        const activeTours = currentState.tours.filter(tour => 
          tour.status === "active" || (tour.status === "planning" && tour.startWeek === currentState.currentWeek)
        );
        
        if (activeTours.length > 0) {
          const updatedTours = activeTours.map(tour => {
            // If tour is just starting this week
            if (tour.status === "planning" && tour.startWeek === currentState.currentWeek) {
              return {
                ...tour,
                status: "active",
                currentVenueIndex: 0
              };
            }
            
            // If tour is already active, advance to next venue
            if (tour.status === "active") {
              const newVenueIndex = tour.currentVenueIndex + 1;
              
              // Check if tour is complete
              if (newVenueIndex >= tour.venues.length) {
                return {
                  ...tour,
                  status: "completed",
                  currentVenueIndex: tour.venues.length
                };
              }
              
              return {
                ...tour,
                currentVenueIndex: newVenueIndex
              };
            }
            
            return tour;
          });
          
          // Update tours in state
          updatedState.tours = (currentState.tours || []).map(
            tour => {
              const updated = updatedTours.find(t => t.id === tour.id);
              return updated || tour;
            }
          );
          
          // For newly completed tours, give the player a bonus
          const newlyCompleted = updatedTours.filter(tour => 
            tour.status === "completed" && 
            !currentState.tours.find(t => t.id === tour.id)?.status === "completed"
          );
          
          if (newlyCompleted.length > 0) {
            // Calculate tour completion bonuses
            const totalBonus = newlyCompleted.reduce((sum, tour) => {
              // Bonus based on tour length and venues
              const tourBonus = tour.venues.length * 1000;
              return sum + tourBonus;
            }, 0);
            
            // Add bonus to player stats
            updatedState.stats = {
              ...updatedState.stats,
              wealth: updatedState.stats.wealth + totalBonus,
              reputation: Math.min(100, updatedState.stats.reputation + 5),
              fanLoyalty: Math.min(100, updatedState.stats.fanLoyalty + 3)
            };
            
            // Alert player about tour completion
            if (newlyCompleted.length === 1) {
              alert(`Your "${newlyCompleted[0].name}" tour is complete! You earned a bonus of $${totalBonus} and gained reputation!`);
            } else {
              alert(`${newlyCompleted.length} of your tours completed this week, earning you a total bonus of $${totalBonus}!`);
            }
          }
        }
      }
      
      // Set the updated state
      set(updatedState);
      
      // Process market trends
      get().processMarketTrends();
      
      // Update Twitter trends
      get().updateTwitterTrends();
      
      // Reset energy
      useEnergyStore.getState().resetEnergy();
    },
    
    // Music production
    createSong: (title: string, tier: SongTier, featuring: string[]) => {
      const currentState = get();
      
      // Handle free tier (0) differently
      if (tier === 0) {
        // Generate a song title if none provided
        const songTitle = title.trim() || generateSongTitle();
        
        // Create the new song with a random tier based on the specified probabilities
        const randomValue = Math.random();
        let actualTier: 1 | 2 | 3 | 4 | 5;
        
        if (randomValue < 0.4) {
          actualTier = 1; // 40% chance for tier 1
        } else if (randomValue < 0.8) {
          actualTier = 2; // 40% chance for tier 2
        } else if (randomValue < 0.95) {
          actualTier = 3; // 15% chance for tier 3
        } else if (randomValue < 0.99) {
          actualTier = 4; // 4% chance for tier 4
        } else {
          actualTier = 5; // 1% chance for tier 5
        }
        
        // If the random tier is 4 or 5, check subscription access
        if ((actualTier === 4 && !currentState.checkSubscriptionFeatureAccess('tier4_songs')) || 
            (actualTier === 5 && !currentState.checkSubscriptionFeatureAccess('tier5_songs'))) {
          
          // If user doesn't have access to premium tiers, cap at tier 3
          actualTier = 3;
        }
        
        const newSong: Song = {
          id: uuidv4(),
          title: songTitle,
          tier: actualTier,
          releaseDate: 0, // 0 indicates unreleased
          streams: 0, // No streams until released
          isActive: false, // Not active until released
          featuring,
          released: false, // New song starts as unreleased
          icon: "default", // Default icon
          releasePlatforms: [] // No platforms until released
        };
        
        // Update state with new song (no cost for free tier)
        set({
          songs: [...currentState.songs, newSong],
          stats: {
            ...currentState.stats,
            // Creating songs increases creativity
            creativity: Math.min(100, currentState.stats.creativity + 1)
          }
        });
        
        return;
      }
      
      // For regular tiers
      // Check if the tier requires a subscription
      if (tier === 4 && !currentState.checkSubscriptionFeatureAccess('tier4_songs')) {
        // Show subscription prompt for tier 4 songs
        if (currentState.showSubscriptionPrompt('tier4_songs')) {
          return;
        }
      }
      
      if (tier === 5 && !currentState.checkSubscriptionFeatureAccess('tier5_songs')) {
        // Show subscription prompt for tier 5 songs
        if (currentState.showSubscriptionPrompt('tier5_songs')) {
          return;
        }
      }
      
      // Check if player can afford to create this song
      const cost = SONG_TIER_INFO[tier].cost;
      if (currentState.stats.wealth < cost) {
        alert("You don't have enough money to create this song!");
        return;
      }
      
      // Generate a song title if none provided
      const songTitle = title.trim() || generateSongTitle();
      
      // Create the new song (unreleased)
      const newSong: Song = {
        id: uuidv4(),
        title: songTitle,
        tier,
        releaseDate: 0, // 0 indicates unreleased
        streams: 0, // No streams until released
        isActive: false, // Not active until released
        featuring,
        released: false, // New song starts as unreleased
        icon: "default", // Default icon
        releasePlatforms: [] // No platforms until released
      };
      
      // Update state with new song and reduced wealth
      set({
        songs: [...currentState.songs, newSong],
        stats: {
          ...currentState.stats,
          wealth: currentState.stats.wealth - cost,
          // Creating songs increases creativity
          creativity: Math.min(100, currentState.stats.creativity + 2)
        }
      });
    },
    
    buySongFromShop: (shopItemId: string) => {
      const currentState = get();
      const shopItem = currentState.shopItems.find(item => item.id === shopItemId);
      
      if (!shopItem || shopItem.purchased) return;
      
      // Check if player can afford the item
      if (currentState.stats.wealth < shopItem.cost) {
        alert("You don't have enough money to buy this item!");
        return;
      }
      
      // Create a new song from the shop item (unreleased)
      const newSong: Song = {
        id: uuidv4(),
        title: shopItem.name,
        tier: shopItem.tier,
        releaseDate: 0, // 0 indicates unreleased
        streams: 0, // No streams until released
        isActive: false, // Not active until released
        featuring: [],
        released: false, // New song starts as unreleased
        icon: "default", // Default icon
        releasePlatforms: [] // No platforms until released
      };
      
      // Mark item as purchased and update state
      set({
        songs: [...currentState.songs, newSong],
        stats: {
          ...currentState.stats,
          wealth: currentState.stats.wealth - shopItem.cost
        },
        shopItems: currentState.shopItems.map(item => 
          item.id === shopItemId 
            ? { ...item, purchased: true } 
            : item
        )
      });
    },
    
    // Social media
    updateSocialMediaStats: (stats) => {
      const currentState = get();
      set({
        socialMediaStats: {
          ...currentState.socialMediaStats,
          ...stats
        }
      });
    },

    // Create a new burner account for a specific platform
    createBurnerAccount: (platform, handle, displayName, bio) => {
      const currentState = get();
      const lowerCasePlatform = platform.toLowerCase();

      // Check if handle is already taken
      let platformData;
      
      if (lowerCasePlatform === 'twitter' && currentState.socialMediaStats?.twitter) {
        platformData = currentState.socialMediaStats.twitter;
      } else if (lowerCasePlatform === 'instagram' && currentState.socialMediaStats?.instagram) {
        platformData = currentState.socialMediaStats.instagram;
      } else if (lowerCasePlatform === 'tiktok' && currentState.socialMediaStats?.tiktok) {
        platformData = currentState.socialMediaStats.tiktok;
      }

      if (!platformData) return '';

      // Check if handle already exists in main account or burner accounts
      if (platformData.handle === handle || 
          platformData.burnerAccounts?.some(account => account.handle === handle)) {
        alert('This username is already taken!');
        return '';
      }

      // Create new burner account
      const newBurnerAccount = {
        handle,
        displayName: displayName || handle,
        bio: bio || '',
        followers: Math.floor(Math.random() * 20) + 5, // Start with 5-25 followers
        posts: [],
        verified: false,
        engagement: Math.floor(Math.random() * 5) + 3, // 3-8% engagement rate
        isBurner: true,
        creationWeek: currentState.currentWeek
      };

      // Update the platform with the new burner account
      const updatedStats = { ...currentState.socialMediaStats };
      
      if (lowerCasePlatform === 'twitter' && updatedStats.twitter) {
        updatedStats.twitter.burnerAccounts = [
          ...(updatedStats.twitter.burnerAccounts || []),
          newBurnerAccount
        ];
      } else if (lowerCasePlatform === 'instagram' && updatedStats.instagram) {
        updatedStats.instagram.burnerAccounts = [
          ...(updatedStats.instagram.burnerAccounts || []),
          newBurnerAccount
        ];
      } else if (lowerCasePlatform === 'tiktok' && updatedStats.tiktok) {
        updatedStats.tiktok.burnerAccounts = [
          ...(updatedStats.tiktok.burnerAccounts || []),
          newBurnerAccount
        ];
      }

      // Update state
      set({ socialMediaStats: updatedStats });
      return handle;
    },

    // Post from a burner account
    postFromBurnerAccount: (platform, burnerAccountHandle, content, images = []) => {
      const currentState = get();
      const lowerCasePlatform = platform.toLowerCase();
      
      // Get platform data and burner accounts
      let platformData;
      let burnerAccounts;
      
      if (lowerCasePlatform === 'twitter' && currentState.socialMediaStats?.twitter) {
        platformData = currentState.socialMediaStats.twitter;
        burnerAccounts = platformData.burnerAccounts || [];
      } else if (lowerCasePlatform === 'instagram' && currentState.socialMediaStats?.instagram) {
        platformData = currentState.socialMediaStats.instagram;
        burnerAccounts = platformData.burnerAccounts || [];
      } else if (lowerCasePlatform === 'tiktok' && currentState.socialMediaStats?.tiktok) {
        platformData = currentState.socialMediaStats.tiktok;
        burnerAccounts = platformData.burnerAccounts || [];
      } else {
        return; // Platform not found
      }
      
      // Find the burner account
      const accountIndex = burnerAccounts.findIndex(acc => acc.handle === burnerAccountHandle);
      if (accountIndex === -1) return; // Account not found
      
      const account = burnerAccounts[accountIndex];
      
      // Calculate post metrics - these are smaller than main account posts
      const baseEngagement = Math.max(account.followers * (account.engagement / 100), 5);
      const likes = Math.floor(baseEngagement * (0.5 + Math.random() * 0.5));
      const comments = Math.floor(baseEngagement * (0.1 + Math.random() * 0.2));
      const shares = Math.floor(baseEngagement * (0.05 + Math.random() * 0.1));
      
      // Calculate viral chance (lower than main account)
      let viralStatus: ViralStatus = "not_viral";
      let viralMultiplier = 1;
      
      // Base chance of going viral is affected by account's existing follower count
      const baseViralChance = 0.02 + (account.followers / 10000) * 0.1;
      
      // Additional factors: content length, images, etc.
      const contentBonus = content.length > 50 ? 0.03 : 0;
      const imageBonus = images.length > 0 ? 0.05 : 0;
      
      // Calculate final chance
      const viralChance = baseViralChance + contentBonus + imageBonus;
      const roll = Math.random();
      
      if (roll < viralChance * 0.2) {
        viralStatus = "super_viral";
        viralMultiplier = 8 + Math.random() * 12; // 8-20x multiplier
      } else if (roll < viralChance * 0.5) {
        viralStatus = "viral";
        viralMultiplier = 3 + Math.random() * 5; // 3-8x multiplier
      } else if (roll < viralChance) {
        viralStatus = "trending";
        viralMultiplier = 1.5 + Math.random() * 1.5; // 1.5-3x multiplier
      }
      
      // Calculate follower and reputation gains
      const baseFollowerGain = Math.floor(likes * 0.08); // Lower than main account (0.1)
      const followerGain = Math.floor(baseFollowerGain * viralMultiplier);
      
      // Burner account posts don't directly affect main reputation
      const reputationGain = 0;
      
      // Create the post
      const newPost: SocialMediaPost = {
        id: uuidv4(),
        platformName: platform,
        content,
        images: images.length > 0 ? images : undefined,
        postWeek: currentState.currentWeek,
        date: new Date(),
        likes,
        comments,
        shares,
        viralStatus,
        viralMultiplier,
        followerGain,
        reputationGain,
        wealthGain: 0 // Burner accounts don't generate revenue
      };
      
      // Update the burner account
      const updatedAccount = {
        ...account,
        followers: account.followers + followerGain,
        posts: [newPost, ...account.posts]
      };
      
      // Update state with the modified burner account
      const updatedStats = { ...currentState.socialMediaStats };
      const updatedBurnerAccounts = [...burnerAccounts];
      updatedBurnerAccounts[accountIndex] = updatedAccount;
      
      if (lowerCasePlatform === 'twitter' && updatedStats.twitter) {
        updatedStats.twitter.burnerAccounts = updatedBurnerAccounts;
      } else if (lowerCasePlatform === 'instagram' && updatedStats.instagram) {
        updatedStats.instagram.burnerAccounts = updatedBurnerAccounts;
      } else if (lowerCasePlatform === 'tiktok' && updatedStats.tiktok) {
        updatedStats.tiktok.burnerAccounts = updatedBurnerAccounts;
      }
      
      // Play success sound if post goes viral
      if (viralStatus !== "not_viral") {
        useAudio.getState().playSuccess();
      }
      
      // Update state
      set({ socialMediaStats: updatedStats });
    },

    // Delete a burner account
    deleteBurnerAccount: (platform, burnerAccountHandle) => {
      const currentState = get();
      const lowerCasePlatform = platform.toLowerCase();
      
      // Get platform data
      const updatedStats = { ...currentState.socialMediaStats };
      
      if (lowerCasePlatform === 'twitter' && updatedStats.twitter) {
        updatedStats.twitter.burnerAccounts = 
          updatedStats.twitter.burnerAccounts?.filter(acc => acc.handle !== burnerAccountHandle) || [];
      } else if (lowerCasePlatform === 'instagram' && updatedStats.instagram) {
        updatedStats.instagram.burnerAccounts = 
          updatedStats.instagram.burnerAccounts?.filter(acc => acc.handle !== burnerAccountHandle) || [];
      } else if (lowerCasePlatform === 'tiktok' && updatedStats.tiktok) {
        updatedStats.tiktok.burnerAccounts = 
          updatedStats.tiktok.burnerAccounts?.filter(acc => acc.handle !== burnerAccountHandle) || [];
      }
      
      // Update state
      set({ socialMediaStats: updatedStats });
    },
    
    // Update Twitter trends and music chart posts (separated from market trends)
    updateTwitterTrends: () => {
      const currentState = get();
      
      // Local variables for trend management
      let keepTrendsLocal: any[] = [];
      let newTrendsCountLocal = 0;
      
      // Update social media trends
      if (currentState.socialMediaStats?.twitter?.trends) {
        // Create new trending topics (some stay, some fade out, some new ones appear)
        const existingTrends = [...currentState.socialMediaStats.twitter.trends];
        
        // Randomly select trends to keep (60% chance to keep a trend)
        keepTrendsLocal = existingTrends.filter(() => Math.random() > 0.4);
        
        // Create some new trending topics
        newTrendsCountLocal = Math.floor(Math.random() * 3) + 1; // 1-3 new trends
      }
      
      const musicTrendOptions = [
        { name: '#NewMusic', category: 'Music', description: 'Music fans are talking about new releases this week' },
        { name: '#RapGame', category: 'Music', description: 'Discussions about rap and hip hop culture' },
        { name: '#MusicVideo', category: 'Music', description: 'Trending music videos this week' },
        { name: '#AlbumOfTheYear', category: 'Music', description: 'Fans discussing the best albums of the year' },
        { name: '#LiveMusic', category: 'Music', description: 'Conversations about concerts and live performances' },
        { name: '#HipHopHeadlines', category: 'Music', description: 'Breaking news in the hip hop community' },
        { name: '#BillboardHot100', category: 'Music', description: 'Chart discussions and predictions' },
        { name: '#SoundcloudRapper', category: 'Music', description: 'Emerging talent from Soundcloud' },
        { name: '#ProducerLife', category: 'Music', description: 'Behind the scenes of music production' },
        { name: '#MusicIndustry', category: 'Music', description: 'Business news and discussions about the music industry' }
      ];
      
      const entertainmentTrendOptions = [
        { name: '#AwardsSeason', category: 'Entertainment', description: 'Buzz around upcoming award shows' },
        { name: '#TVPremiere', category: 'Entertainment', description: 'New shows starting this week' },
        { name: '#CelebrityNews', category: 'Entertainment', description: 'Latest gossip and celebrity updates' },
        { name: '#MovieTrailer', category: 'Entertainment', description: 'Reactions to newly released movie trailers' },
        { name: '#Streaming', category: 'Entertainment', description: 'Discussions about streaming platforms and shows' }
      ];
      
      const newsTrendOptions = [
        { name: '#BreakingNews', category: 'News', description: 'Current events and breaking stories' },
        { name: '#Politics', category: 'News', description: 'Political discussions and news' },
        { name: '#TechNews', category: 'News', description: 'Technology industry updates and announcements' },
        { name: '#Economy', category: 'News', description: 'Economic news and discussions' },
        { name: '#SocialMovement', category: 'News', description: 'Activism and social movements' }
      ];
      
      // Create new trends based on random selections from these options
      const newTrends = [];
      for (let i = 0; i < newTrendsCountLocal; i++) {
        const randomCategory = Math.random();
        let trendPool;
        
        if (randomCategory < 0.6) {
          // 60% chance of music trend
          trendPool = musicTrendOptions;
        } else if (randomCategory < 0.9) {
          // 30% chance of entertainment trend
          trendPool = entertainmentTrendOptions;
        } else {
          // 10% chance of general news trend
          trendPool = newsTrendOptions;
        }
        
        const randomTrend = trendPool[Math.floor(Math.random() * trendPool.length)];
        
        // Create a new trend with a random tweet count
        newTrends.push({
          id: uuidv4(),
          name: randomTrend.name,
          category: randomTrend.category as 'Music' | 'Entertainment' | 'News' | 'Gaming' | 'Sports',
          tweetCount: Math.floor(Math.random() * 20000) + 5000,
          trending: true,
          description: randomTrend.description
        });
      }
      
      // Combine existing and new trends, making sure no duplicates
      const allTrends = [...keepTrendsLocal];
      
      // Add new trends avoiding duplicates
      newTrends.forEach(newTrend => {
        if (!allTrends.some(trend => trend.name === newTrend.name)) {
          allTrends.push(newTrend);
        }
      });
      
      // Update the tweetCount for existing trends
      const updatedTrends = allTrends.map(trend => {
        // Random change in tweet count (-20% to +50%)
        const changePercent = -20 + Math.random() * 70;
        const newCount = Math.max(1000, Math.floor(trend.tweetCount * (1 + changePercent / 100)));
        
        return {
          ...trend,
          tweetCount: newCount
        };
      });
      
      // Sort by tweet count (highest first)
      updatedTrends.sort((a, b) => b.tweetCount - a.tweetCount);
      
      // Limit to max 10 trends
      const finalTrends = updatedTrends.slice(0, 10);
      
      // Update the state
      set({
        socialMediaStats: {
          ...currentState.socialMediaStats,
          twitter: {
            ...currentState.socialMediaStats.twitter,
            trends: finalTrends
          }
        }
      });
      
      // Maybe generate music chart posts too (30% chance each week)
      if (Math.random() < 0.3 && currentState.socialMediaStats?.twitter?.musicChartAccounts) {
        // Get a random music chart account
        const musicChartAccounts = currentState.socialMediaStats.twitter.musicChartAccounts;
        if (musicChartAccounts && musicChartAccounts.length > 0) {
          const randomAccountIndex = Math.floor(Math.random() * musicChartAccounts.length);
          const accountId = musicChartAccounts[randomAccountIndex].id;
          
          // Generate a post about a trending music topic
          const chartTopics = [
            "This week's top streaming tracks are in! 🎵",
            "Breaking: New artist rankings just released! 📊",
            "Chart Update: The hottest songs this week 🔥",
            "Who's climbing the charts this week? Let's take a look! 📈",
            "Music Charts: This week's biggest movers and shakers 🌟"
          ];
          
          const randomTopic = chartTopics[Math.floor(Math.random() * chartTopics.length)];
          
          // Use the store function to generate the post
          get().generateMusicChartPost(accountId, randomTopic);
        }
      }
    },
    
    // Generate a post from a music chart account
    generateMusicChartPost: (accountId, customContent?, customImage?) => {
      const currentState = get();
      
      if (!currentState.socialMediaStats?.twitter?.musicChartAccounts) return;
      
      // Find the specific music chart account
      const accountIndex = currentState.socialMediaStats.twitter.musicChartAccounts.findIndex(
        account => account.id === accountId
      );
      
      if (accountIndex === -1) return;
      
      // Get player character name for personalized posts
      const playerName = currentState.character?.artistName || 'Unknown Artist';
      
      // Post templates for music chart accounts if no custom content provided
      const contentTemplates = customContent ? [customContent] : [
        // Chart rankings
        `${playerName} debuts at #12 on this week's Hot 100 chart with their latest single! 📈🔥`,
        `${playerName}'s album is currently sitting at #3 on the Billboard 200. Impressive for a new release! 💿`,
        `This week's Top 10 most streamed artists include newcomer ${playerName} at #7!`,
        
        // News and rumors
        `BREAKING: ${playerName} reportedly in talks for a major collaboration with a top industry artist. Who do you think it could be? 👀`,
        `REPORT: ${playerName} expected to announce a world tour soon, according to industry insiders.`,
        `${playerName} becomes the most talked about artist this week after their viral hit took over social media.`,
        
        // Reviews
        `Album REVIEW: ${playerName}'s latest project gets a strong 8/10 from our critics. "Innovative and fresh" 🎵`,
        `NEW MUSIC: ${playerName} delivers one of the year's most compelling tracks with their latest single.`,
        `${playerName}'s production quality has grown tremendously. Their latest release showcases a polished sound. 🔊`,
        
        // Achievements
        `${playerName} has broken the record for most streams in a 24-hour period for a debut artist! 🏆`,
        `${playerName} is trending worldwide after their surprise music video drop yesterday.`,
        `${playerName} becomes the fastest rising artist to reach 1M followers this year! 📱`
      ];
      
      // Random selection of content if multiple options
      const selectedContent = contentTemplates[Math.floor(Math.random() * contentTemplates.length)];
      
      // Random image selection if no custom image
      let selectedImage = customImage;
      if (!selectedImage && Math.random() < 0.7) {
        const coverImages = [
          '/assets/covers/cover1.svg',
          '/assets/covers/cover2.svg',
          '/assets/covers/cover3.svg',
          '/assets/covers/cover4.svg',
          '/assets/covers/cover5.svg',
          '/assets/covers/cover6.svg'
        ];
        selectedImage = coverImages[Math.floor(Math.random() * coverImages.length)];
      }
      
      // Create the new post
      const newPost: SocialMediaPost = {
        id: uuidv4(),
        platformName: "Twitter",
        content: selectedContent,
        image: selectedImage,
        postWeek: currentState.currentWeek,
        date: new Date(),
        likes: Math.floor(Math.random() * 50000) + 10000,
        comments: Math.floor(Math.random() * 5000) + 1000,
        shares: Math.floor(Math.random() * 20000) + 5000,
        views: Math.floor(Math.random() * 500000) + 100000,
        viralStatus: Math.random() < 0.3 ? "trending" : "not_viral",
        viralMultiplier: 1,
        followerGain: 0,
        reputationGain: 0,
        type: 'regular',
        wealthGain: 0
      };
      
      // Clone the musicChartAccounts array
      const updatedAccounts = [...currentState.socialMediaStats.twitter.musicChartAccounts];
      
      // Update the specific account with the new post
      updatedAccounts[accountIndex] = {
        ...updatedAccounts[accountIndex],
        tweets: [newPost, ...updatedAccounts[accountIndex].tweets].slice(0, 10) // Keep only the 10 most recent tweets
      };
      
      // Update the state
      set({
        socialMediaStats: {
          ...currentState.socialMediaStats,
          twitter: {
            ...currentState.socialMediaStats.twitter,
            musicChartAccounts: updatedAccounts
          }
        }
      });
    },
    
    postOnSocialMedia: (platformName, content = "", images = []) => {
      const currentState = get();
      const platformIndex = currentState.socialMedia.findIndex(p => p.name === platformName);
      
      if (platformIndex === -1) return;
      
      const platform = currentState.socialMedia[platformIndex];
    },
    
    // Add a social media post directly 
    addSocialMediaPost: (platformName, post) => {
      const currentState = get();
      // Update appropriate platform in socialMediaStats based on platform name
      const lowerCasePlatform = platformName.toLowerCase();
      const updatedStats = { ...currentState.socialMediaStats };
      
      // Twitter post
      if (lowerCasePlatform === 'twitter' && updatedStats.twitter) {
        updatedStats.twitter = {
          ...updatedStats.twitter,
          tweets: [...(updatedStats.twitter.tweets || []), post],
          followers: updatedStats.twitter.followers + (post.followerGain || 0)
        };
      } 
      // Instagram post
      else if (lowerCasePlatform === 'instagram' && updatedStats.instagram) {
        updatedStats.instagram = {
          ...updatedStats.instagram,
          posts: [...(updatedStats.instagram.posts || []), post],
          followers: updatedStats.instagram.followers + (post.followerGain || 0)
        };
      } 
      // TikTok post (video)
      else if (lowerCasePlatform === 'tiktok' && updatedStats.tiktok) {
        updatedStats.tiktok = {
          ...updatedStats.tiktok,
          videos: [...(updatedStats.tiktok.videos || []), post],
          followers: updatedStats.tiktok.followers + (post.followerGain || 0)
        };
      }
      
      // Update state with new social media stats
      set({ socialMediaStats: updatedStats });
      
      // If this is a viral post, show a notification
      if (post.viralStatus === 'viral' || post.viralStatus === 'super_viral') {
        // In a real implementation, we would use a toast notification here
        console.log(`Your ${platformName} post went viral! You gained ${post.followerGain} new followers.`);
      }
      
      // Also update the player's stats if needed
      if (post.reputationGain > 0 || post.wealthGain > 0) {
        set(state => ({
          stats: {
            ...state.stats,
            reputation: Math.min(100, state.stats.reputation + (post.reputationGain || 0)),
            wealth: state.stats.wealth + (post.wealthGain || 0)
          }
        }));
      }
    },
    
    // Original postOnSocialMedia implementation continues for backward compatibility
    _oldPostOnSocialMedia: (platformName, content = "", images = []) => {
      const currentState = get();
      const platformIndex = currentState.socialMedia.findIndex(p => p.name === platformName);
      
      if (platformIndex === -1) return;
      
      const platform = currentState.socialMedia[platformIndex];
      const costInfo = SOCIAL_MEDIA_COSTS[platform.name as keyof typeof SOCIAL_MEDIA_COSTS];
      
      if (!costInfo) return;
      
      // All social media posts are now free
      // Note: We've kept the costInfo structure for engagement calculations
      
      // Calculate engagement rate for this post
      const [minEngagement, maxEngagement] = costInfo.postEngagementRange;
      const postEngagement = Math.floor(minEngagement + Math.random() * (maxEngagement - minEngagement));
      
      // Calculate likes, comments, shares based on followers and engagement
      const baseEngagement = Math.max(platform.followers * (postEngagement / 100), 10);
      const likes = Math.floor(baseEngagement * (0.5 + Math.random() * 0.5));
      const comments = Math.floor(baseEngagement * (0.1 + Math.random() * 0.2));
      const shares = Math.floor(baseEngagement * (0.05 + Math.random() * 0.1));
      
      // Determine viral status based on platform, influence, quality of content, and luck
      let viralStatus: ViralStatus = "not_viral";
      let viralMultiplier = 1;
      
      // Base chance of going viral is affected by marketing stat and reputation
      const baseViralChance = 0.05 + 
        (currentState.stats.marketing / 100) * 0.15 + 
        (currentState.stats.reputation / 100) * 0.10;
      
      // Additional factors: content length, images, etc.
      const contentBonus = content.length > 50 ? 0.05 : 0;
      const imageBonus = images.length > 0 ? 0.1 : 0;
      
      // Calculate final chance
      const viralChance = baseViralChance + contentBonus + imageBonus;
      const roll = Math.random();
      
      if (roll < viralChance * 0.2) {
        viralStatus = "super_viral";
        viralMultiplier = 10 + Math.random() * 20; // 10-30x multiplier
      } else if (roll < viralChance * 0.5) {
        viralStatus = "viral";
        viralMultiplier = 5 + Math.random() * 5; // 5-10x multiplier
      } else if (roll < viralChance) {
        viralStatus = "trending";
        viralMultiplier = 2 + Math.random() * 3; // 2-5x multiplier
      }
      
      // Calculate follower and reputation gains based on viral status
      const baseFollowerGain = Math.floor(likes * 0.1); // Base follower gain
      const followerGain = Math.floor(baseFollowerGain * viralMultiplier);
      
      // Calculate reputation gain
      const baseReputationGain = Math.floor(shares * 0.05);
      const reputationGain = Math.floor(baseReputationGain * viralMultiplier);
      
      // Calculate wealth gain (from monetization, if applicable)
      const baseWealthGain = platform.followers > 10000 ? Math.floor(likes * 0.01) : 0;
      const wealthGain = Math.floor(baseWealthGain * viralMultiplier);
      
      // Create new social media post
      const newPost: SocialMediaPost = {
        id: uuidv4(),
        platformName,
        content: content || "Posted new content!",
        images: images.length > 0 ? images : undefined,
        postWeek: currentState.currentWeek,
        likes,
        comments,
        shares,
        viralStatus,
        viralMultiplier,
        followerGain,
        reputationGain,
        wealthGain
      };
      
      // Update platform with new post
      const updatedSocialMedia = [...currentState.socialMedia];
      const updatedPlatform = {
        ...platform,
        followers: platform.followers + followerGain,
        posts: platform.posts + 1,
        engagement: Math.floor((platform.engagement + postEngagement) / 2), // Average with existing engagement
        lastPostWeek: currentState.currentWeek,
        viralPosts: [...(platform.viralPosts || []), newPost].filter(post => 
          // Only keep viral posts and limit to most recent 10
          post.viralStatus !== "not_viral"
        ).slice(-10)
      };
      
      updatedSocialMedia[platformIndex] = updatedPlatform;
      
      // Play success sound if post goes viral
      if (viralStatus !== "not_viral") {
        useAudio.getState().playSuccess();
      }
      
      // Update state
      set({
        socialMedia: updatedSocialMedia,
        stats: {
          ...currentState.stats,
          wealth: currentState.stats.wealth + wealthGain, // No cost deducted, posts are free
          marketing: Math.min(100, currentState.stats.marketing + 1), // Posting improves marketing skill
          reputation: Math.min(100, currentState.stats.reputation + reputationGain)
        }
      });
    },
    
    // Collaboration
    requestFeature: (rapperId, songTier) => {
      const currentState = get();
      const rapper = currentState.aiRappers.find(r => r.id === rapperId);
      
      if (!rapper) return;
      
      // Calculate chance of acceptance
      const totalMonthlyListeners = calculateTotalMonthlyListeners(currentState.streamingPlatforms);
      const acceptanceChance = calculateFeatureAcceptanceChance(
        rapper,
        currentState.stats.reputation,
        totalMonthlyListeners,
        songTier
      );
      
      // Determine if request is accepted
      const isAccepted = Math.random() < acceptanceChance;
      
      if (isAccepted) {
        // Create collaboration song (unreleased)
        const newSong: Song = {
          id: uuidv4(),
          title: `${generateSongTitle()} (feat. ${rapper.name})`,
          tier: songTier,
          releaseDate: 0, // 0 indicates unreleased
          streams: 0, // No streams until released
          isActive: false, // Not active until released
          featuring: [rapper.id],
          released: false, // New song starts as unreleased
          icon: "default", // Default icon
          releasePlatforms: [] // No platforms until released
        };
        
        // Update relationship status positively
        const updatedRappers = currentState.aiRappers.map(r => 
          r.id === rapperId
            ? { ...r, relationshipStatus: getNewRelationshipStatus(r.relationshipStatus, r.relationshipStatus === "enemy", "neutral", "friend") }
            : r
        );
        
        // Update state
        set({
          songs: [...currentState.songs, newSong],
          aiRappers: updatedRappers,
          stats: {
            ...currentState.stats,
            networking: Math.min(100, currentState.stats.networking + 5)
          }
        });
        
        alert(`${rapper.name} accepted your feature request!`);
      } else {
        alert(`${rapper.name} declined your feature request.`);
        
        // Small networking gain for trying
        set({
          stats: {
            ...currentState.stats,
            networking: Math.min(100, currentState.stats.networking + 1)
          }
        });
      }
    },
    
    // Image management
    // Create a music video for a song
    createMusicVideo: (video: MusicVideo, updatedSong: Song, cost: number) => {
      const currentState = get();
      
      // Find the song in the songs array
      const songIndex = currentState.songs.findIndex(s => s.id === updatedSong.id);
      if (songIndex === -1) return;
      
      // Check if user has enough money
      if (currentState.stats.wealth < cost) {
        alert('Not enough money to create this music video!');
        return;
      }
      
      // Update the song to mark it as having a video
      const updatedSongs = [...currentState.songs];
      updatedSongs[songIndex] = updatedSong;
      
      // Update the videos platform stats
      const updatedVideosPlatforms = currentState.videosPlatforms.map(platform => {
        if (platform.name === video.platform) {
          return {
            ...platform,
            videos: platform.videos + 1,
            // Initial subscriber boost based on song popularity
            subscribers: platform.subscribers + Math.floor(updatedSong.streams / 100)
          };
        }
        return platform;
      });
      
      // Add the video to the music videos array
      const updatedMusicVideos = [...currentState.musicVideos, video];
      
      // Update stats (wealth decreases by cost)
      const updatedStats = {
        ...currentState.stats,
        wealth: currentState.stats.wealth - cost,
        marketing: Math.min(100, currentState.stats.marketing + 2) // Video production boosts marketing skills
      };
      
      // Update all state
      set({
        songs: updatedSongs,
        musicVideos: updatedMusicVideos,
        videosPlatforms: updatedVideosPlatforms,
        stats: updatedStats
      });
      
      // Show success message
      alert(`Music video for "${updatedSong.title}" has been created and published on ${video.platform}!`);
    },
    
    updateSongCoverArt: (songId, coverArt) => {
      const currentState = get();
      const songIndex = currentState.songs.findIndex(s => s.id === songId);
      
      if (songIndex === -1) return;
      
      const updatedSongs = [...currentState.songs];
      updatedSongs[songIndex] = {
        ...updatedSongs[songIndex],
        coverArt
      };
      
      set({ songs: updatedSongs });
    },
    
    updateMusicVideo: (updatedVideo) => {
      const currentState = get();
      const videoIndex = currentState.musicVideos.findIndex(v => v.id === updatedVideo.id);
      
      if (videoIndex === -1) return;
      
      const updatedVideos = [...currentState.musicVideos];
      updatedVideos[videoIndex] = updatedVideo;
      
      set({ musicVideos: updatedVideos });
    },

    updateVideoThumbnail: (videoId, thumbnail) => {
      const currentState = get();
      const videoIndex = currentState.musicVideos.findIndex(v => v.id === videoId);
      
      if (videoIndex === -1) return;
      
      const updatedVideos = [...currentState.musicVideos];
      updatedVideos[videoIndex] = {
        ...updatedVideos[videoIndex],
        thumbnail
      };
      
      set({ musicVideos: updatedVideos });
    },
    
    updateProfileImage: (image) => {
      const currentState = get();
      if (!currentState.character) return;
      
      set({
        character: {
          ...currentState.character,
          image
        }
      });
    },
    
    // Album management functions
    createAlbum: (title, type, coverArt, songIds) => {
      const currentState = get();
      const { character, currentWeek } = currentState;
      
      if (!character) return '';

      // Initialize platform streams with 0 for each unlocked platform
      const initialPlatformStreams: Record<string, number> = {};
      console.log("Available streaming platforms for new album:", currentState.streamingPlatforms);
      
      // Ensure we always have entries for all platforms, even if not explicitly unlocked
      currentState.streamingPlatforms.forEach(platform => {
        // Add all platforms, both unlocked and locked with 0 streams
        initialPlatformStreams[platform.name] = 0;
        console.log(`Added platform ${platform.name} to new album's platform streams`);
      });
      
      console.log("Initial platformStreams for new album:", initialPlatformStreams);

      const albumId = uuidv4();
      const newAlbum: Album = {
        id: albumId,
        title,
        artistId: character.id,
        type,
        coverArt,
        announced: false,
        released: false,
        songIds,
        streams: 0,
        sales: 0,
        revenue: 0,
        features: [],
        criticalRating: undefined, // Will be set upon release
        fanRating: undefined, // Will be set upon release
        platformStreams: initialPlatformStreams, // Initialize with 0 streams for each platform
        chartPosition: undefined // Will be set during weekly updates
      };
      
      // Update the store with the new album
      set({
        albums: [...(currentState.albums || []), newAlbum]
      });
      
      return albumId;
    },
    
    releaseAlbum: (albumId) => {
      const currentState = get();
      const { albums, currentWeek, streamingPlatforms, songs } = currentState;
      
      // Simplified album release function to fix bugs
      
      // Find the album to release
      const albumToRelease = albums?.find(album => album.id === albumId);
      if (!albumToRelease) {
        console.error("Album not found:", albumId);
        alert("Error: Album not found");
        return;
      }
      
      try {
        console.log("Releasing album:", albumToRelease.title);
        
        // Get all songs in the album
        const albumSongs = songs.filter(song => 
          albumToRelease.songIds.includes(song.id)
        );
        
        if (albumSongs.length === 0) {
          console.error("Album has no songs:", albumToRelease);
          alert("Cannot release an album with no songs!");
          return;
        }
        
        // Calculate average quality from the songs
        const songQualities = albumSongs.map(song => typeof song.quality === 'number' ? song.quality : 50);
        const avgSongQuality = songQualities.length > 0 
          ? songQualities.reduce((sum, quality) => sum + quality, 0) / songQualities.length
          : 50;
        
        // Calculate initial streams - simplified formula
        const baseStreams = 10000 + Math.floor(avgSongQuality * 100);
        
        // Create platform distribution (simplified)
        const platformStreamsDistribution: Record<string, number> = {};
        
        // Get all available platforms
        const availablePlatforms = streamingPlatforms.filter(p => p.isUnlocked);
        
        // Simple distribution across platforms
        availablePlatforms.forEach(platform => {
          platformStreamsDistribution[platform.name] = Math.floor(baseStreams / availablePlatforms.length);
        });
        
        // If no platforms are available, use a default
        if (Object.keys(platformStreamsDistribution).length === 0) {
          platformStreamsDistribution["Spotify"] = baseStreams;
        }
        
        // Update songs - mark them as released and active
        const updatedSongs = songs.map(song => {
          if (albumToRelease.songIds.includes(song.id)) {
            return {
              ...song,
              released: true,
              isActive: true,
              streams: (song.streams || 0) + Math.floor(baseStreams / albumSongs.length)
            };
          }
          return song;
        });
        
        // Update the album
        const updatedAlbums = albums.map(album => {
          if (album.id === albumId) {
            return {
              ...album,
              released: true,
              releaseDate: currentWeek,
              criticalRating: Math.floor(avgSongQuality / 10),
              fanRating: Math.floor(avgSongQuality / 12 + 2),
              streams: baseStreams,
              sales: Math.floor(baseStreams * 0.02),
              revenue: baseStreams * 0.004, // Approximate revenue
              platformStreams: {...platformStreamsDistribution},
              chartPosition: 90 - Math.floor(avgSongQuality / 2) // Higher quality = better position
            };
          }
          return album;
        });
        
        // Update streaming platforms with simplified logic
        const updatedStreamingPlatforms = streamingPlatforms.map(platform => {
          const platformStreams = platformStreamsDistribution[platform.name] || 0;
          return {
            ...platform,
            totalStreams: platform.totalStreams + platformStreams,
            listeners: platform.listeners + 1000, // Simple boost
            revenue: platform.revenue + (platformStreams * 0.004)
          };
        });
        
        console.log("Successfully prepared album release. Updating state...");
        
        // Update state with all changes
        set({ 
          albums: updatedAlbums,
          songs: updatedSongs,
          streamingPlatforms: updatedStreamingPlatforms
        });
        
        alert(`Your album "${albumToRelease.title}" has been released!`);
        
      } catch (error) {
        console.error("Error releasing album:", error);
        alert("There was an error releasing your album. Please try again.");
      }
    },
    
    createDeluxeAlbum: (parentAlbumId, title, coverArt, additionalSongIds) => {
      const currentState = get();
      const { albums, character } = currentState;
      
      if (!albums || !character) return '';
      
      // Find the parent album
      const parentAlbum = albums.find(album => album.id === parentAlbumId);
      if (!parentAlbum) return '';
      
      // Create a deluxe edition including songs from parent album
      const allSongIds = [...parentAlbum.songIds, ...additionalSongIds];
      
      const albumId = uuidv4();
      // Initialize platform streams with 0 for each unlocked platform
      const initialPlatformStreams: Record<string, number> = {};
      currentState.streamingPlatforms.forEach(platform => {
        if (platform.isUnlocked) {
          initialPlatformStreams[platform.name] = 0;
        }
      });

      const newAlbum: Album = {
        id: albumId,
        title,
        artistId: character.id,
        type: 'deluxe',
        coverArt,
        announced: false,
        released: false,
        songIds: allSongIds,
        streams: 0,
        sales: 0,
        revenue: 0,
        features: parentAlbum.features || [],
        parentAlbumId,
        exclusiveTracks: additionalSongIds,
        platformStreams: initialPlatformStreams
      };
      
      // Update the store with the new deluxe album
      set({
        albums: [...(currentState.albums || []), newAlbum]
      });
      
      return albumId;
    },
    
    createRemixAlbum: (parentAlbumId, title, coverArt, remixArtists) => {
      const currentState = get();
      const { albums, character } = currentState;
      
      if (!albums || !character) return '';
      
      // Find the parent album
      const parentAlbum = albums.find(album => album.id === parentAlbumId);
      if (!parentAlbum) return '';
      
      const albumId = uuidv4();
      
      // Initialize platform streams with 0 for each unlocked platform
      const initialPlatformStreams: Record<string, number> = {};
      currentState.streamingPlatforms.forEach(platform => {
        if (platform.isUnlocked) {
          initialPlatformStreams[platform.name] = 0;
        }
      });
      
      const newAlbum: Album = {
        id: albumId,
        title,
        artistId: character.id,
        type: 'remix',
        coverArt,
        announced: false,
        released: false,
        songIds: parentAlbum.songIds, // Same songs, but remixed
        streams: 0,
        sales: 0,
        revenue: 0,
        features: parentAlbum.features || [],
        parentAlbumId,
        remixArtists,
        platformStreams: initialPlatformStreams
      };
      
      // Update the store with the new remix album
      set({
        albums: [...(currentState.albums || []), newAlbum]
      });
      
      return albumId;
    },
    
    updateAlbumCover: (albumId, coverArt) => {
      const currentState = get();
      const { albums } = currentState;
      
      if (!albums) return;
      
      // Update the album cover
      const updatedAlbums = albums.map(album => {
        if (album.id === albumId) {
          return {
            ...album,
            coverArt
          };
        }
        return album;
      });
      
      set({ albums: updatedAlbums });
    },
    
    promoteSong: (songId, budget, promotionType) => {
      const currentState = get();
      const songIndex = currentState.songs.findIndex(s => s.id === songId);
      
      if (songIndex === -1) return;
      
      // Make sure song is released and active
      const song = currentState.songs[songIndex];
      if (!song.released || !song.isActive) {
        alert("You can only promote released, active songs.");
        return;
      }
      
      // Check if player has enough money
      if (currentState.stats.wealth < budget) {
        alert("You don't have enough money for this promotion.");
        return;
      }
      
      // Calculate promotion impact
      const promotionImpact = calculatePromotionImpact(
        promotionType as 'social' | 'radio' | 'tour' | 'influencer' | 'all',
        budget / 1000, // Scale budget to intensity (1000 = intensity of 1)
        song.tier,
        currentState.stats.marketing
      );
      
      // Apply stream multiplier to the song
      const updatedSong = {
        ...song,
        // Add multiplier to song's popularity for future stream calculations
        // This is a simplified version - in a real game we'd have a more complex promotion system
        // that applies effects over multiple weeks
        hype: (song.hype || 0) + Math.ceil(promotionImpact.streamMultiplier * 2),
      };
      
      // Update platform-specific stats
      const updatedStreamingPlatforms = currentState.streamingPlatforms.map(platform => {
        const platformBoost = promotionImpact.platformReach[platform.name] || 0;
        return {
          ...platform,
          // Small immediate boost to listener count
          listeners: platform.listeners + Math.floor(promotionImpact.listeners * platformBoost / 5)
        };
      });
      
      // Update social media followers
      const updatedSocialMedia = currentState.socialMedia.map(platform => {
        // Social media promotion gives more followers, others give fewer
        const followerMultiplier = promotionType === 'social' ? 1.0 : 
                                  promotionType === 'influencer' ? 0.8 : 0.3;
        
        return {
          ...platform,
          followers: platform.followers + Math.floor(promotionImpact.followerGain * followerMultiplier)
        };
      });
      
      // Update player stats
      set({
        songs: currentState.songs.map((s, i) => i === songIndex ? updatedSong : s),
        streamingPlatforms: updatedStreamingPlatforms,
        socialMedia: updatedSocialMedia,
        stats: {
          ...currentState.stats,
          wealth: currentState.stats.wealth - budget,
          // Small reputation gain from promotions
          reputation: currentState.stats.reputation + (budget / 5000),
          // Small marketing skill gain
          marketing: Math.min(100, currentState.stats.marketing + (budget / 10000))
        }
      });
      
      // Notify the player
      alert(`Promotion campaign started for "${song.title}"! The effects will be visible as the song gains more streams.`);
    },
    
    releaseSong: (songId, title, icon, platforms) => {
      const currentState = get();
      const songIndex = currentState.songs.findIndex(s => s.id === songId);
      
      if (songIndex === -1) return;
      
      const song = currentState.songs[songIndex];
      
      // Can only release unreleased songs
      if (song.released) return;
      
      // When a song is released, it should start with 0 streams
      // Streams will be calculated when the week advances
      const featureCount = song.featuring.length;
      
      // Setting initial streams to 0
      const totalSongStreams = 0;
      
      // Determine initial performance type - small chance to go viral on release
      let initialPerformanceType: SongPerformanceType = 'normal';
      const viralChance = 0.02 + (song.tier / 100); // 2-7% chance based on tier
      const flopChance = 0.05 - (song.tier / 100); // 5-0% chance based on tier
      
      const randomValue = Math.random();
      if (randomValue < viralChance) {
        initialPerformanceType = 'viral';
        alert(`Your song "${title || song.title}" is going viral from day one! Huge success!`);
      } else if (randomValue > (1 - flopChance)) {
        initialPerformanceType = 'flop';
        alert(`Your song "${title || song.title}" is flopping on release. Fans don't seem to connect with it.`);
      }
      
      // Update the song to be released
      const updatedSongs = [...currentState.songs];
      updatedSongs[songIndex] = {
        ...song,
        title: title || song.title, // Update title if provided
        icon: icon || song.icon, // Update icon if provided
        releaseDate: currentState.currentWeek,
        released: true,
        isActive: true,
        streams: totalSongStreams,
        releasePlatforms: platforms,
        performanceType: initialPerformanceType,
        performanceStatusWeek: currentState.currentWeek
      };
      
      // Distribute streams across selected platforms
      const updatedStreamingPlatforms = [...currentState.streamingPlatforms];
      
      // Define platform market share based on real-world streaming platform dominance
      // These will be used to create more realistic distribution of streams
      // STRICTLY STANDARDIZED MARKET SHARE - This ensures consistent platform rankings
      // This is synchronized with the same values used in advanceWeek for consistency
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
      
      // Calculate total weight combining market share and current platform popularity
      const totalPlatformWeight = platforms.reduce((sum, platformName) => {
        const platform = updatedStreamingPlatforms.find(p => p.name === platformName);
        // Weight based on market share AND existing listeners
        const marketShare = platformMarketShare[platformName as keyof typeof platformMarketShare] || 0.05;
        const listenerFactor = platform ? Math.log10(platform.listeners + 1000) / 5 : 0.1; // Logarithmic scaling to prevent any one platform from dominating
        
        // Combined weight: market share is primary factor, listener count is secondary
        const weight = (marketShare * 0.7) + (listenerFactor * 0.3);
        return sum + weight;
      }, 0);
      
      console.log(`Total platform weight: ${totalPlatformWeight}`);
      
      // Track the total streams distributed to ensure we match the song's total streams
      let distributedStreams = 0;
      
      // Calculate a unique random seed for this song
      const songSeed = title ? title.charCodeAt(0) + title.charCodeAt(title.length-1) : Math.floor(Math.random() * 1000);
      
      // DIRECT ALLOCATION APPROACH: Explicitly assign different streaming values
      // This ensures no two platforms ever get the same number of streams
      const platformStreamAllocations = platforms.map((platformName, index) => {
        const platform = updatedStreamingPlatforms.find(p => p.name === platformName);
        
        // Get market share for this platform
        const marketShare = platformMarketShare[platformName as keyof typeof platformMarketShare] || 0.05;
        
        // Base allocation is market share plus index-based variation (makes each platform different)
        // Add more randomness based on artist name and platform name
        const artistNameSeed = (currentState.character?.artistName || 'default').charCodeAt(0);
        const platformSeed = platformName.charCodeAt(0) + platformName.length;
        
        // Create a deterministic bias: some artists naturally do better on certain platforms
        // This produces consistent platform performance for a particular artist
        const biasBase = ((artistNameSeed + platformSeed + songSeed) % 100) / 100;
        
        // Calculate bias factor (0.6-1.4 range) - this ensures artists consistently perform
        // better or worse on specific platforms
        const artistPlatformBias = 0.6 + (biasBase * 0.8);
        
        // Apply the bias to market share
        const adjustedMarketShare = marketShare * artistPlatformBias;
        
        // Introduce major randomization to create dramatic differences between platforms
        // Using songSeed + index ensures consistent but varied distribution
        const randomSeed = (songSeed + index) / 10;
        const randomComponent = Math.sin(randomSeed) * 0.5; // -0.5 to 0.5 range
        
        // Combined factor creates dramatically different distributions
        const platformFactor = adjustedMarketShare * (1 + randomComponent);
        
        // Scale to ensure we're allocating the full song streams
        const platformStreams = Math.max(10, Math.floor(totalSongStreams * platformFactor));
        
        console.log(`Platform ${platformName}: Market ${marketShare.toFixed(2)}, Bias ${artistPlatformBias.toFixed(2)}, Random ${randomComponent.toFixed(2)}, Streams ${platformStreams}`);
        
        return { platformName, platformStreams, platformFactor };
      });
      
      // Calculate total distributed streams
      distributedStreams = platformStreamAllocations.reduce((sum, allocation) => sum + allocation.platformStreams, 0);
      
      // Adjust if we've over/under allocated (maintain total song streams)
      const adjustmentFactor = distributedStreams > 0 ? totalSongStreams / distributedStreams : 1;
      
      // Apply the streams to each platform - ENSURE DIFFERENT VALUES
      let platformSet = new Set(); // Track unique values to prevent duplicates
      
      // No immediate streams upon release - song already set to 0 streams
      // Just register platforms for the song but don't add any streams yet
      platforms.forEach(platformName => {
        const platformIndex = updatedStreamingPlatforms.findIndex(p => p.name === platformName);
        if (platformIndex !== -1) {
          const platform = updatedStreamingPlatforms[platformIndex];
          
          // Set platformStreams to 0 - streams will be calculated on week advance
          const platformStreams = 0;
          const updatedStreams = platform.totalStreams; // No change
          
          console.log(`Song registered on ${platformName}, waiting for week advance for streams`);
          
          // Listener calculation still happens
          const platformMultiplier = Math.max(5, 10 - (platform.listeners / 1000000) * 5); // Ranges from 5-10
          const baseListeners = 0; // No base listeners from streams yet
          
          // When releasing a new song, listeners increase more dramatically
          // based on song quality and features
          const listenerBoost = (song.tier / 5) * 0.5; // 0-50% boost based on tier (increased from 30%)
          
          // Features have bigger impact on listener growth
          const featureListenerBoost = featureCount === 0 ? 0 : 
                                     featureCount === 1 ? 0.15 : 
                                     featureCount === 2 ? 0.25 : 0.4; // Up to 40% for 3+ features
          
          // Apply boosts to monthly listeners
          const listenerMultiplier = 1 + listenerBoost + featureListenerBoost;
          const boostedListeners = Math.max(
            baseListeners,
            Math.floor(platform.listeners * listenerMultiplier)
          );
          
          // Apply a FINAL uniqueness check for totalStreams
          // This is our last defense against identical values in the UI
          let finalTotalStreams = updatedStreams;
          platformSet.clear(); // Clear to check only total streams
          
          // Check against other platforms
          for (const p of updatedStreamingPlatforms) {
            if (p.name !== platformName && p.totalStreams === finalTotalStreams) {
              finalTotalStreams += 1 + Math.floor(Math.random() * 5); // Make it different
            }
            platformSet.add(p.totalStreams);
          }
          
          // Update the platform with guaranteed different values
          updatedStreamingPlatforms[platformIndex] = {
            ...platform,
            totalStreams: finalTotalStreams,
            listeners: boostedListeners,
            revenue: calculateStreamingRevenue(finalTotalStreams)
          };
        }
      });
      
      // Update AI rappers' stats for songs they're featured on
      // But don't give streams yet since the song hasn't accumulated any streams
      const updatedRappers = [...currentState.aiRappers];
      
      // No stream benefits for featured artists yet since the song starts with 0 streams
      // Relationship improvements still happen though
      
      // Update state
      set({
        songs: updatedSongs,
        streamingPlatforms: updatedStreamingPlatforms,
        aiRappers: updatedRappers,
        stats: {
          ...currentState.stats,
          reputation: Math.min(100, currentState.stats.reputation + (song.tier / 2)) // Reputation boost based on song tier
        }
      });
    },
    
    respondToFeatureRequest: (rapperId: string, accept: boolean) => {
      const currentState = get();
      const requestIndex = currentState.collaborationRequests.findIndex(
        req => req.fromRapperId === rapperId && req.status === "pending"
      );
      
      if (requestIndex === -1) return;
      
      const request = currentState.collaborationRequests[requestIndex];
      const rapper = currentState.aiRappers.find(r => r.id === rapperId);
      
      if (!rapper) return;
      
      // Update request status
      const updatedRequests = [...currentState.collaborationRequests];
      updatedRequests[requestIndex] = {
        ...request,
        status: accept ? "accepted" : "rejected"
      };
      
      if (accept) {
        // Update relationship status positively
        const updatedRappers = currentState.aiRappers.map(r => 
          r.id === rapperId
            ? { 
                ...r, 
                relationshipStatus: getNewRelationshipStatus(r.relationshipStatus, r.relationshipStatus === "enemy", "neutral", "friend"),
              }
            : r
        );
        
        // Calculate payment for feature (based on tier and rapper popularity)
        const basePay = request.tier * 1000;
        const popularityMultiplier = rapper.popularity / 50; // 0.5 to 2.0
        const featurePayment = Math.floor(basePay * popularityMultiplier);
        
        // Generate a song title with the player as a feature
        const prefixes = ['Hustle', 'Money', 'Streets', 'Dreams', 'Flow', 'Vibe', 'Life', 'Boss', 'Grind', 'Fame'];
        const suffixes = ['Season', 'Chronicles', 'Anthem', 'Life', 'Time', 'Movement', 'Gang', 'Ways', 'Talk', 'Energy'];
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const songTitle = `${prefix} ${suffix} (feat. ${currentState.character?.artistName || "You"})`;
        
        // For AI rappers featuring the player, we'll start with 0 streams too
        // Streams will get calculated on week advance for consistency
        
        // Create a new AI rapper featured song that includes the player
        const newSong: Song = {
          id: `ai-${rapperId}-ft-player-${Date.now()}`,
          title: songTitle,
          tier: request.tier,
          releaseDate: currentState.currentWeek,
          streams: 0, // Start with 0 streams
          isActive: true,
          featuring: [], // This is an AI rapper's song featuring the player, not the other way around
          released: true,
          icon: 'microphone' as SongIcon,
          releasePlatforms: ["Spotify", "SoundCloud", "iTunes", "YouTube Music"],
          performanceType: Math.random() < 0.1 ? 'viral' : 'normal',
          performanceStatusWeek: currentState.currentWeek,
          aiRapperOwner: rapperId, // New property to track that this is an AI rapper's song
          aiRapperFeaturesPlayer: true // New property to track that this song features the player
        };
        
        // Add the song to the player's list for display purposes
        const updatedSongs = [...currentState.songs, newSong];
        
        // Player will get streams when the week advances
        const playerStreamShare = 0;
        
        // Distribute player's stream share across platforms
        const updatedStreamingPlatforms = currentState.streamingPlatforms.map(platform => {
          // Calculate total listeners across all platforms (with safety check for zero)
          const totalPlatformListeners = currentState.streamingPlatforms.reduce((sum, p) => sum + p.listeners, 0);
          
          // STANDARDIZED MARKET SHARE - This ensures consistent platform rankings everywhere
          // This uses the same exact proportions as other market share definitions for consistency
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
          
          // Base weight from existing listener base
          const listenerWeight = totalPlatformListeners > 0 
            ? platform.listeners / totalPlatformListeners 
            : 1 / currentState.streamingPlatforms.length;
          
          // Get market share weight for this platform
          const marketShare = platformMarketShare[platform.name as keyof typeof platformMarketShare] || 0.05;
          
          // Combine weights (70% market share, 30% listener base)
          const combinedWeight = (marketShare * 0.7) + (listenerWeight * 0.3);
          
          // Add randomness factor (±35%)
          const randomFactor = 0.65 + (Math.random() * 0.7);
          
          const platformStreams = Math.floor(playerStreamShare * combinedWeight * randomFactor);
          
          // Calculate new monthly listeners from feature (smaller boost than releasing own song)
          const listenerBoost = (request.tier / 10) * rapper.popularity / 100; // 0-5% boost based on tier and rapper popularity
          const newListeners = Math.floor(platform.listeners * (1 + listenerBoost));
          
          return {
            ...platform,
            totalStreams: platform.totalStreams + platformStreams,
            listeners: newListeners,
            revenue: platform.revenue + calculateStreamingRevenue(platformStreams, platform.name) // Platform-specific rate
          };
        });
        
        // Boost stats for accepting feature
        set({
          collaborationRequests: updatedRequests,
          aiRappers: updatedRappers,
          songs: updatedSongs,
          streamingPlatforms: updatedStreamingPlatforms,
          stats: {
            ...currentState.stats,
            wealth: currentState.stats.wealth + featurePayment,
            reputation: Math.min(100, currentState.stats.reputation + 3),
            networking: Math.min(100, currentState.stats.networking + 5)
          }
        });
        
        alert(`You accepted the feature request from ${rapper.name} and earned $${featurePayment}! The song "${songTitle}" has been released and will start generating streams next week.`);
      } else {
        // Declining has minor negative effect on relationship
        const updatedRappers = currentState.aiRappers.map(r => {
          if (r.id === rapperId) {
            // If they're a friend, go back to neutral. Otherwise no change.
            return { 
              ...r, 
              relationshipStatus: getNewRelationshipStatus(r.relationshipStatus, r.relationshipStatus === "friend", "neutral", r.relationshipStatus) 
            };
          }
          return r;
        });
        
        set({
          collaborationRequests: updatedRequests,
          aiRappers: updatedRappers
        });
        
        alert(`You declined the feature request from ${rapper.name}.`);
      }
    },
    
    // Random events
    resolveRandomEvent: (eventId, optionIndex) => {
      const currentState = get();
      const eventIndex = currentState.activeRandomEvents.findIndex(event => event.id === eventId);
      
      if (eventIndex === -1) return;
      
      const event = currentState.activeRandomEvents[eventIndex];
      const option = event.options[optionIndex];
      
      if (!option) return;
      
      // Apply the effect function to update the state
      const resolvedEvent = {
        ...event,
        resolved: true,
        selectedOption: optionIndex
      };
      
      let updatedState = { ...currentState };
      
      // Apply the effect if it exists
      if (option.effect && typeof option.effect === 'function') {
        updatedState = option.effect(currentState);
      } 
      // Apply simple results if no effect function but there are results
      else if (option.results) {
        const { results } = option;
        
        // Update player stats based on results
        if (updatedState.stats) {
          updatedState.stats = {
            ...updatedState.stats,
            ...(results.reputation !== undefined && { reputation: Math.max(0, Math.min(100, updatedState.stats.reputation + results.reputation)) }),
            ...(results.wealth !== undefined && { wealth: updatedState.stats.wealth + results.wealth }),
            ...(results.creativity !== undefined && { creativity: Math.max(0, Math.min(100, updatedState.stats.creativity + results.creativity)) }),
            ...(results.marketing !== undefined && { marketing: Math.max(0, Math.min(100, updatedState.stats.marketing + results.marketing)) }),
            ...(results.networking !== undefined && { networking: Math.max(0, Math.min(100, updatedState.stats.networking + results.networking)) }),
            ...(results.fanLoyalty !== undefined && { fanLoyalty: Math.max(0, Math.min(100, updatedState.stats.fanLoyalty + results.fanLoyalty)) }),
          };
        }
        
        // Apply follower changes if specified
        if (results.followers && updatedState.socialMedia) {
          updatedState.socialMedia = updatedState.socialMedia.map(platform => {
            const platformName = platform.name.toLowerCase();
            const followerChange = results.followers?.[platformName];
            
            if (followerChange !== undefined) {
              return {
                ...platform,
                followers: Math.max(0, platform.followers + followerChange)
              };
            }
            
            return platform;
          });
        }
        
        // Apply stream changes if specified
        if (results.streams !== undefined && updatedState.songs.length > 0) {
          // Apply streams to latest song
          const latestIndex = updatedState.songs.length - 1;
          updatedState.songs = [
            ...updatedState.songs.slice(0, latestIndex),
            {
              ...updatedState.songs[latestIndex],
              streams: Math.max(0, updatedState.songs[latestIndex].streams + results.streams)
            },
            ...updatedState.songs.slice(latestIndex + 1)
          ];
        }
      }
      
      // Remove the resolved event from active events and add to resolved events
      const updatedActiveEvents = currentState.activeRandomEvents.filter(e => e.id !== eventId);
      
      set({
        ...updatedState,
        activeRandomEvents: updatedActiveEvents,
        resolvedRandomEvents: [...currentState.resolvedRandomEvents, resolvedEvent]
      });
    },
    
    // Tour and concert management
    createTour: (name, venues, startWeek) => {
      const currentState = get();
      const id = uuidv4();
      
      // Calculate end week based on venues (1 week per venue)
      const endWeek = startWeek + venues.length;
      
      // Validate start week isn't in the past
      if (startWeek < currentState.currentWeek) {
        alert("You can't schedule a tour in the past!");
        return "";
      }
      
      const newTour: Tour = {
        id,
        name,
        startWeek,
        endWeek,
        currentVenueIndex: 0,
        venues,
        status: "planning",
        ticketsSold: 0,
        totalRevenue: 0,
        expenses: 0,
        profit: 0
      };
      
      // Calculate total cost of booking the venues
      const venueCost = venues.reduce((total, venueId) => {
        const venue = currentState.venues?.find(v => v.id === venueId);
        return total + (venue ? venue.cost : 0);
      }, 0);
      
      // Check if player can afford the tour
      if (currentState.stats.wealth < venueCost) {
        alert("You don't have enough money to book these venues for the tour!");
        return "";
      }
      
      // Add the tour and deduct costs
      set({
        tours: [...(currentState.tours || []), newTour],
        stats: {
          ...currentState.stats,
          wealth: currentState.stats.wealth - venueCost
        }
      });
      
      return id;
    },
    
    confirmTour: (tourId) => {
      const currentState = get();
      
      // Find the tour
      const tour = currentState.tours?.find(t => t.id === tourId);
      if (!tour) {
        alert("Tour not found!");
        return;
      }
      
      // Can only confirm if it's still in planning status
      if (tour.status !== "planning") {
        alert("This tour is already confirmed or in progress!");
        return;
      }
      
      // Verify player meets requirements for all venues
      let playerMeetsRequirements = true;
      let requiredReputation = 0;
      
      for (const venueId of tour.venues) {
        const venue = currentState.venues?.find(v => v.id === venueId);
        if (venue && venue.reputationRequired > currentState.stats.reputation) {
          playerMeetsRequirements = false;
          requiredReputation = Math.max(requiredReputation, venue.reputationRequired);
        }
      }
      
      if (!playerMeetsRequirements) {
        alert(`You need at least ${requiredReputation} reputation to confirm this tour. Build your reputation and try again later.`);
        return;
      }
      
      // Update tour status to "active"
      set({
        tours: currentState.tours?.map(t => 
          t.id === tourId 
            ? { ...t, status: "active" } 
            : t
        )
      });
      
      alert(`Tour "${tour.name}" has been confirmed and is now active! It will begin in week ${tour.startWeek}.`);
    },
    
    cancelTour: (tourId) => {
      const currentState = get();
      
      // Find the tour
      const tour = currentState.tours?.find(t => t.id === tourId);
      if (!tour) return;
      
      // Can only cancel if it's still in planning or just started
      if (tour.status !== "planning" && tour.currentVenueIndex > 1) {
        alert("This tour is already in progress and can't be canceled!");
        return;
      }
      
      // Refund 50% of venue costs
      const venueCost = tour.venues.reduce((total, venueId) => {
        const venue = currentState.venues?.find(v => v.id === venueId);
        return total + (venue ? venue.cost : 0);
      }, 0);
      
      const refund = Math.floor(venueCost * 0.5);
      
      // Update tour status and give partial refund
      set({
        tours: currentState.tours?.map(t => 
          t.id === tourId 
            ? { ...t, status: "cancelled" } 
            : t
        ),
        stats: {
          ...currentState.stats,
          wealth: currentState.stats.wealth + refund
        }
      });
      
      alert(`Tour canceled! You received a ${refund} refund.`);
    },
    
    scheduleConcert: (venueId, week, ticketPrice, setlist) => {
      const currentState = get();
      const id = uuidv4();
      
      // Find the venue
      const venue = currentState.venues?.find(v => v.id === venueId);
      if (!venue) return "";
      
      // Check if player can afford the venue
      if (currentState.stats.wealth < venue.cost) {
        alert("You don't have enough money to book this venue!");
        return "";
      }
      
      // Check if player meets reputation requirements
      if (currentState.stats.reputation < venue.reputationRequired) {
        alert("Your reputation isn't high enough to book this venue!");
        return "";
      }
      
      // Check if setlist has valid songs
      if (setlist.length === 0) {
        alert("You need at least one song in your setlist!");
        return "";
      }
      
      const newConcert: Concert = {
        id,
        venueId,
        week,
        ticketPrice,
        ticketsSold: 0,
        maxTickets: venue.capacity,
        revenue: 0,
        expenses: venue.cost,
        profit: -venue.cost,
        performanceQuality: 0,
        audienceSatisfaction: 0,
        reputationGain: 0,
        setlist,
        status: "scheduled"
      };
      
      // Add the concert and deduct the venue cost
      set({
        concerts: [...(currentState.concerts || []), newConcert],
        stats: {
          ...currentState.stats,
          wealth: currentState.stats.wealth - venue.cost
        }
      });
      
      return id;
    },
    
    cancelConcert: (concertId) => {
      const currentState = get();
      
      // Find the concert
      const concert = currentState.concerts?.find(c => c.id === concertId);
      if (!concert || concert.status !== "scheduled") return;
      
      // Find the venue
      const venue = currentState.venues?.find(v => v.id === concert.venueId);
      if (!venue) return;
      
      // Calculate refund (25% of venue cost)
      const refund = Math.floor(venue.cost * 0.25);
      
      // Update concert status and give partial refund
      set({
        concerts: currentState.concerts?.map(c => 
          c.id === concertId 
            ? { ...c, status: "cancelled" } 
            : c
        ),
        stats: {
          ...currentState.stats,
          wealth: currentState.stats.wealth + refund
        }
      });
      
      alert(`Concert canceled! You received a ${refund} refund.`);
    },
    
    // Book a venue for a future concert
    bookVenue: (venueId) => {
      const currentState = get();
      
      // Find the venue
      const venue = currentState.venues?.find(v => v.id === venueId);
      if (!venue) return;
      
      // Check if player can afford the venue
      if (currentState.stats.wealth < venue.cost) {
        alert("You don't have enough money to book this venue!");
        return;
      }
      
      // Check if player meets reputation requirements
      if (currentState.stats.reputation < venue.reputationRequired) {
        alert("Your reputation isn't high enough to book this venue!");
        return;
      }
      
      // Schedule a generic concert one week from now with default ticket price
      const newConcertId = currentState.scheduleConcert(
        venueId, 
        currentState.currentWeek + 1, 
        Math.ceil(venue.cost / (venue.capacity * 0.7)), // Target 70% capacity to break even
        currentState.songs
          .filter(s => s.released && s.isActive)
          .slice(0, 5) // Top 5 released songs by default
          .map(s => s.id)
      );
      
      if (newConcertId) {
        alert(`You've booked ${venue.name} for next week!`);
      }
    },
    
    // Beef system
    startBeef: (rapperId, trackTitle, lyrics) => {
      const currentState = get();
      const id = uuidv4();
      
      // Find the targeted rapper
      const targetRapper = currentState.aiRappers.find(r => r.id === rapperId);
      if (!targetRapper) return "";
      
      // Use default title and lyrics if not provided
      const beefTitle = trackTitle || `Diss on ${targetRapper.name}`;
      const beefLyrics = lyrics || `This is a diss track aimed at ${targetRapper.name}`;
      
      // Calculate initial quality based on player's skills
      const quality = Math.floor(
        (currentState.stats.creativity * 0.6) + 
        (currentState.stats.marketing * 0.2) + 
        (currentState.stats.networking * 0.2) + 
        (Math.random() * 20)
      );
      
      // Create the new beef object
      const newBeef: Beef = {
        id,
        initiatorId: "player", // Player is always the initiator
        targetId: rapperId,
        status: "waiting", // Waiting for target to respond
        startWeek: currentState.currentWeek,
        initiatorTrack: {
          title: beefTitle,
          lyrics: beefLyrics,
          quality: quality,
          responseWeek: currentState.currentWeek
        },
        publicReaction: {
          initiatorFavor: 50, // Neutral to start
          targetFavor: 50 // Neutral to start
        },
        impact: {
          initiatorRepGain: 0,
          targetRepGain: 0,
          initiatorFollowerGain: 0,
          targetFollowerGain: 0
        }
      };
      
      // Update state by adding the new beef
      set({
        beefs: [...(currentState.beefs || []), newBeef]
      });
      
      // Also update AI rapper relationship status to more negative
      set({
        aiRappers: currentState.aiRappers.map(rapper => {
          if (rapper.id === rapperId) {
            // Make relationship more negative
            let newRelationship = rapper.relationship;
            
            // Move relationship in a negative direction
            if (rapper.relationship === "neutral") {
              newRelationship = "rival";
            } else if (rapper.relationship === "friend") {
              newRelationship = "neutral";
            } else if (rapper.relationship === "rival") {
              newRelationship = "enemy";
            }
            
            return {
              ...rapper,
              relationship: newRelationship
            };
          }
          return rapper;
        })
      });
      
      return id;
    },
    
    respondToBeef: (beefId, trackTitle, lyrics) => {
      const currentState = get();
      
      // Find the beef
      const beef = currentState.beefs?.find(b => b.id === beefId);
      if (!beef || beef.status !== "waiting") return;
      
      // Can only respond to beef directed at player
      if (beef.targetId !== "player" && beef.initiatorId !== "player") return;
      
      // Calculate track quality based on player skills
      const quality = Math.floor(
        (currentState.stats.creativity * 0.7) + 
        (currentState.stats.marketing * 0.1) + 
        (currentState.stats.networking * 0.2) + 
        (Math.random() * 20)
      );
      
      // Update the beef with player's response
      set({
        beefs: currentState.beefs?.map(b => {
          if (b.id === beefId) {
            // If player is the initiator, update initiator track
            if (b.initiatorId === "player") {
              return {
                ...b,
                initiatorTrack: {
                  title: trackTitle,
                  lyrics: lyrics,
                  quality: quality,
                  responseWeek: currentState.currentWeek
                },
                status: "ongoing"
              };
            } 
            // If player is the target, update target track
            else if (b.targetId === "player") {
              return {
                ...b,
                targetTrack: {
                  title: trackTitle,
                  lyrics: lyrics,
                  quality: quality,
                  responseWeek: currentState.currentWeek
                },
                status: "ongoing"
              };
            }
          }
          return b;
        })
      });
      
      // Player responded, so update the beef status
      const updatedBeef = get().beefs?.find(b => b.id === beefId);
      if (updatedBeef && updatedBeef.status === "ongoing") {
        // If both tracks are ready, resolve the beef
        if (updatedBeef.initiatorTrack && updatedBeef.targetTrack) {
          // Resolve the beef automatically after both responses are in
          get().resolveBeef(beefId);
        }
      }
    },
    
    resolveBeef: (beefId) => {
      const currentState = get();
      
      // Find the beef
      const beef = currentState.beefs?.find(b => b.id === beefId);
      if (!beef || beef.status === "won" || beef.status === "lost" || beef.status === "draw") return;
      
      // Only resolve if both tracks exist
      if (!beef.initiatorTrack || !beef.targetTrack) return;
      
      // Calculate who won based on track quality
      const initiatorQuality = beef.initiatorTrack.quality;
      const targetQuality = beef.targetTrack.quality;
      const qualityDifference = initiatorQuality - targetQuality;
      
      // Determine public reaction based on quality difference
      let initiatorFavor = 50;
      let targetFavor = 50;
      
      if (qualityDifference > 20) {
        // Initiator strongly won
        initiatorFavor = 80;
        targetFavor = 20;
      } else if (qualityDifference > 10) {
        // Initiator moderately won
        initiatorFavor = 70;
        targetFavor = 30;
      } else if (qualityDifference > 0) {
        // Initiator slightly won
        initiatorFavor = 60;
        targetFavor = 40;
      } else if (qualityDifference === 0) {
        // Draw
        initiatorFavor = 50;
        targetFavor = 50;
      } else if (qualityDifference > -10) {
        // Target slightly won
        initiatorFavor = 40;
        targetFavor = 60;
      } else if (qualityDifference > -20) {
        // Target moderately won
        initiatorFavor = 30;
        targetFavor = 70;
      } else {
        // Target strongly won
        initiatorFavor = 20;
        targetFavor = 80;
      }
      
      // Calculate reputation and follower impacts
      // Determine who won
      let status: "won" | "lost" | "draw";
      let initiatorRepGain = 0;
      let targetRepGain = 0;
      let initiatorFollowerGain = 0;
      let targetFollowerGain = 0;
      
      if (qualityDifference > 10) {
        // Initiator won
        status = "won";
        initiatorRepGain = Math.floor(10 + (qualityDifference / 5));
        targetRepGain = Math.floor(-5 - (qualityDifference / 10));
        initiatorFollowerGain = Math.floor(1000 + (qualityDifference * 100));
        targetFollowerGain = Math.floor(-500);
      } else if (qualityDifference < -10) {
        // Target won
        status = "lost";
        initiatorRepGain = Math.floor(-5 + (qualityDifference / 10));
        targetRepGain = Math.floor(10 - (qualityDifference / 5));
        initiatorFollowerGain = Math.floor(-500);
        targetFollowerGain = Math.floor(1000 - (qualityDifference * 100));
      } else {
        // Draw
        status = "draw";
        initiatorRepGain = 5;
        targetRepGain = 5;
        initiatorFollowerGain = 300;
        targetFollowerGain = 300;
      }
      
      // Update the beef with results
      set({
        beefs: currentState.beefs?.map(b => {
          if (b.id === beefId) {
            return {
              ...b,
              status,
              endWeek: currentState.currentWeek,
              publicReaction: {
                initiatorFavor,
                targetFavor
              },
              impact: {
                initiatorRepGain,
                targetRepGain,
                initiatorFollowerGain,
                targetFollowerGain
              }
            };
          }
          return b;
        })
      });
      
      // Apply impacts if player is involved
      const resolvedBeef = get().beefs?.find(b => b.id === beefId);
      if (!resolvedBeef) return;
      
      // Apply reputation and follower changes
      if (resolvedBeef.initiatorId === "player") {
        // Player is initiator
        set({
          stats: {
            ...currentState.stats,
            reputation: currentState.stats.reputation + resolvedBeef.impact.initiatorRepGain
          },
          socialMedia: currentState.socialMedia.map(platform => ({
            ...platform,
            followers: platform.followers + Math.floor(resolvedBeef.impact.initiatorFollowerGain / currentState.socialMedia.length)
          }))
        });
        
        // Show appropriate message
        if (resolvedBeef.status === "won") {
          alert(`You won the beef against ${currentState.aiRappers.find(r => r.id === resolvedBeef.targetId)?.name}! Your reputation increased by ${resolvedBeef.impact.initiatorRepGain} and you gained ${resolvedBeef.impact.initiatorFollowerGain} followers.`);
        } else if (resolvedBeef.status === "lost") {
          alert(`You lost the beef against ${currentState.aiRappers.find(r => r.id === resolvedBeef.targetId)?.name}. Your reputation decreased by ${-resolvedBeef.impact.initiatorRepGain} and you lost ${-resolvedBeef.impact.initiatorFollowerGain} followers.`);
        } else {
          alert(`Your beef with ${currentState.aiRappers.find(r => r.id === resolvedBeef.targetId)?.name} ended in a draw. You both gained some reputation and followers.`);
        }
      } else if (resolvedBeef.targetId === "player") {
        // Player is target
        set({
          stats: {
            ...currentState.stats,
            reputation: currentState.stats.reputation + resolvedBeef.impact.targetRepGain
          },
          socialMedia: currentState.socialMedia.map(platform => ({
            ...platform,
            followers: platform.followers + Math.floor(resolvedBeef.impact.targetFollowerGain / currentState.socialMedia.length)
          }))
        });
        
        // Show appropriate message
        if (resolvedBeef.status === "won") {
          alert(`${currentState.aiRappers.find(r => r.id === resolvedBeef.initiatorId)?.name} won the beef against you. Your reputation decreased by ${-resolvedBeef.impact.targetRepGain} and you lost ${-resolvedBeef.impact.targetFollowerGain} followers.`);
        } else if (resolvedBeef.status === "lost") {
          alert(`You won the beef against ${currentState.aiRappers.find(r => r.id === resolvedBeef.initiatorId)?.name}! Your reputation increased by ${resolvedBeef.impact.targetRepGain} and you gained ${resolvedBeef.impact.targetFollowerGain} followers.`);
        } else {
          alert(`Your beef with ${currentState.aiRappers.find(r => r.id === resolvedBeef.initiatorId)?.name} ended in a draw. You both gained some reputation and followers.`);
        }
      }
    },
    
    // Skills training
    startSkillTraining: (skillName, trainingType, duration) => {
      const currentState = get();
      const id = uuidv4();
      
      // Find the skill
      const skill = currentState.skills?.find(s => s.name === skillName);
      if (!skill) return "";
      
      // Calculate cost based on training type and duration
      let cost = skill.trainingCost;
      switch (trainingType) {
        case "mentor":
          cost *= 2; // Premium training costs more
          break;
        case "workshop":
          cost *= 1.5;
          break;
        case "practice":
          cost *= 0.7; // Practice is cheaper
          break;
        default: // "course"
          break;
      }
      
      // Adjust for duration (1-4 weeks)
      cost = Math.round(cost * (duration + (duration * 0.5)));
      
      // Check if player can afford the training
      if (currentState.stats.wealth < cost) {
        alert("You don't have enough money for this training!");
        return "";
      }
      
      // Create the training
      const newTraining: SkillTraining = {
        id,
        skillName,
        startWeek: currentState.currentWeek,
        endWeek: currentState.currentWeek + duration,
        level: skill.level + 1,
        completed: false,
        trainingType: trainingType as "course" | "mentor" | "practice" | "workshop",
        cost
      };
      
      // Add the training and deduct cost
      set({
        activeSkillTrainings: [...(currentState.activeSkillTrainings || []), newTraining],
        stats: {
          ...currentState.stats,
          wealth: currentState.stats.wealth - cost
        }
      });
      
      return id;
    },
    
    trainSkill: (skillName) => {
      const currentState = get();
      
      // Find the skill
      const skill = currentState.skills?.find(s => s.name === skillName);
      if (!skill) {
        return;
      }
      
      // Check if already at max level
      if (skill.level >= skill.maxLevel) {
        return;
      }
      
      // Check if player can afford the training
      if (currentState.stats.wealth < skill.trainingCost) {
        return;
      }
      
      // Update skills
      const updatedSkills = currentState.skills?.map(s => {
        if (s.name === skillName) {
          return {
            ...s,
            level: Math.min(s.maxLevel, s.level + 1)
          };
        }
        return s;
      });
      
      // Update player stats based on the skill trained
      let updatedStats = { ...currentState.stats };
      
      switch (skillName) {
        case "creativity":
          updatedStats.creativity = Math.min(100, updatedStats.creativity + 5);
          break;
        case "marketing":
          updatedStats.marketing = Math.min(100, updatedStats.marketing + 5);
          break;
        case "networking":
          updatedStats.networking = Math.min(100, updatedStats.networking + 5);
          break;
        case "performance":
          updatedStats.fanLoyalty = Math.min(100, updatedStats.fanLoyalty + 5);
          updatedStats.stagePower = Math.min(100, (updatedStats.stagePower || 30) + 8);
          break;
        case "production":
          updatedStats.creativity = Math.min(100, updatedStats.creativity + 3);
          break;
        case "business":
          updatedStats.marketing = Math.min(100, updatedStats.marketing + 3);
          updatedStats.networking = Math.min(100, updatedStats.networking + 3);
          break;
      }
      
      // Apply updates and deduct cost
      set({
        skills: updatedSkills,
        stats: {
          ...updatedStats,
          wealth: currentState.stats.wealth - skill.trainingCost
        }
      });
    },
    
    completeSkillTraining: (trainingId) => {
      const currentState = get();
      
      // Find the training
      const training = currentState.activeSkillTrainings?.find(t => t.id === trainingId);
      if (!training) return;
      
      // Update the skill level
      const updatedSkills = currentState.skills?.map(skill => {
        if (skill.name === training.skillName) {
          return {
            ...skill,
            level: Math.min(skill.maxLevel, training.level)
          };
        }
        return skill;
      });
      
      // Move training from active to completed
      set({
        skills: updatedSkills,
        activeSkillTrainings: currentState.activeSkillTrainings?.filter(t => t.id !== trainingId) || [],
        completedSkillTrainings: [...(currentState.completedSkillTrainings || []), {
          ...training,
          completed: true
        }]
      });
      
      // Apply skill benefits to player stats
      let statBonus = {};
      switch (training.skillName) {
        case "creativity":
          statBonus = { creativity: currentState.stats.creativity + 5 };
          break;
        case "marketing":
          statBonus = { marketing: currentState.stats.marketing + 5 };
          break;
        case "networking":
          statBonus = { networking: currentState.stats.networking + 5 };
          break;
        case "business":
          statBonus = { wealth: currentState.stats.wealth + 1000 }; // Bonus cash
          break;
        default:
          break;
      }
      
      set({
        stats: {
          ...currentState.stats,
          ...statBonus
        }
      });
      
      alert(`You've completed your ${training.skillName} training!`);
    },
    
    // Save/load game
    saveGame: (slotId, name) => {
      const currentState = get();
      const saveId = slotId || uuidv4();
      
      const savedGame = {
        id: saveId,
        name: name || `Save - Week ${currentState.currentWeek}`,
        date: Date.now(),
        gameState: currentState
      };
      
      // Get existing saves from localStorage or create empty array
      const existingSaves = getLocalStorage('rapperGameSaves') || [];
      
      // Add or update save
      const saveIndex = existingSaves.findIndex((save: any) => save.id === saveId);
      if (saveIndex !== -1) {
        existingSaves[saveIndex] = savedGame;
      } else {
        existingSaves.push(savedGame);
      }
      
      // Save to localStorage
      setLocalStorage('rapperGameSaves', existingSaves);
      
      return saveId;
    },
    
    loadGame: (gameState) => {
      set(gameState);
    },
    
    resetGame: () => {
      set(initialState);
    },
    
    // Hype system implementation
    createHypeEvent: (type, name, targetReleaseWeek) => {
      const currentState = get();
      const newHypeEvent: HypeEvent = {
        id: uuidv4(),
        type,
        name,
        hypeLevel: 0,
        targetReleaseWeek,
        announced: false,
        released: false,
        maxHype: 0,
        decayRate: 5, // Default decay rate of 5% per week
        createdWeek: currentState.currentWeek
      };
      
      // Set max hype based on type
      switch (type) {
        case 'single':
          newHypeEvent.maxHype = 60;
          break;
        case 'ep':
          newHypeEvent.maxHype = 80;
          break;
        case 'album':
          newHypeEvent.maxHype = 100;
          break;
        case 'deluxe':
          newHypeEvent.maxHype = 90;
          break;
        case 'tour':
          newHypeEvent.maxHype = 85;
          break;
        default:
          newHypeEvent.maxHype = 70;
      }
      
      set({
        activeHypeEvents: [
          ...currentState.activeHypeEvents || [], 
          newHypeEvent
        ]
      });
      
      return newHypeEvent.id;
    },
    
    updateHypeLevel: (hypeEventId, increaseAmount) => {
      const currentState = get();
      const hypeEvent = currentState.activeHypeEvents?.find(event => event.id === hypeEventId);
      
      if (!hypeEvent) return;
      
      // Limit hype level to the event's max hype
      const newHypeLevel = Math.min(
        hypeEvent.maxHype, 
        hypeEvent.hypeLevel + increaseAmount
      );
      
      // Update the hype event
      const updatedHypeEvents = currentState.activeHypeEvents?.map(event => 
        event.id === hypeEventId 
          ? { ...event, hypeLevel: newHypeLevel }
          : event
      );
      
      set({ activeHypeEvents: updatedHypeEvents });
    },
    
    announceRelease: (hypeEventId) => {
      const currentState = get();
      const hypeEvent = currentState.activeHypeEvents?.find(event => event.id === hypeEventId);
      
      if (!hypeEvent) return;
      
      // Announcing a release gives a boost to hype
      const announcementBoost = 15;
      const newHypeLevel = Math.min(
        hypeEvent.maxHype, 
        hypeEvent.hypeLevel + announcementBoost
      );
      
      // Update the hype event
      const updatedHypeEvents = currentState.activeHypeEvents?.map(event => 
        event.id === hypeEventId 
          ? { ...event, hypeLevel: newHypeLevel, announced: true }
          : event
      );
      
      set({ activeHypeEvents: updatedHypeEvents });
    },
    
    completeRelease: (hypeEventId) => {
      const currentState = get();
      const hypeEvent = currentState.activeHypeEvents?.find(event => event.id === hypeEventId);
      
      if (!hypeEvent) return;
      
      // Move to past events
      const updatedActiveEvents = currentState.activeHypeEvents?.filter(
        event => event.id !== hypeEventId
      ) || [];
      
      const completedEvent = {
        ...hypeEvent,
        released: true
      };
      
      set({
        activeHypeEvents: updatedActiveEvents,
        pastHypeEvents: [
          ...(currentState.pastHypeEvents || []),
          completedEvent
        ]
      });
      
      // Add streaming benefits based on hype level
      if (completedEvent.type !== 'tour') {
        // For music releases (not tours), hype translates to initial streams
        const hypeStreamMultiplier = completedEvent.hypeLevel / 10; // 0-10x multiplier
        
        alert(`Your release "${completedEvent.name}" launched with ${completedEvent.hypeLevel}% hype, giving you a ${hypeStreamMultiplier.toFixed(1)}x boost to initial streams!`);
      } else {
        // For tours, hype translates to ticket sales
        const hypeSalesMultiplier = 1 + (completedEvent.hypeLevel / 100); 
        
        alert(`Your tour "${completedEvent.name}" launched with ${completedEvent.hypeLevel}% hype, giving you a ${hypeSalesMultiplier.toFixed(2)}x boost to ticket sales!`);
      }
    },
    
    // Controversy system implementation
    generateControversy: (type, severity) => {
      const currentState = get();
      
      // Determine impact based on severity
      let reputationImpact = 0;
      let streamImpact = 0;
      let followerImpact = 0;
      
      switch (severity) {
        case 'minor':
          reputationImpact = -2;
          streamImpact = 10000; // Minor controversies can actually boost streams
          followerImpact = -1000;
          break;
        case 'moderate':
          reputationImpact = -5;
          streamImpact = 5000; // Small boost but also risk
          followerImpact = -3000;
          break;
        case 'major':
          reputationImpact = -10;
          streamImpact = -10000; // Starts hurting streams
          followerImpact = -8000;
          break;
        case 'severe':
          reputationImpact = -20;
          streamImpact = -50000; // Significant damage
          followerImpact = -20000;
          break;
      }
      
      // Create controversy title and description based on type
      let title = '';
      let description = '';
      
      switch (type) {
        case 'offensive_tweet':
          title = 'Controversial Tweet Surfaces';
          description = 'An offensive tweet from your account has gone viral, causing public backlash.';
          break;
        case 'leaked_audio':
          title = 'Leaked Studio Audio';
          description = 'Audio leaked from a studio session reveals you making questionable statements.';
          break;
        case 'public_feud':
          title = 'Public Feud Erupts';
          description = 'You\'ve been caught in a heated argument with another artist at a public event.';
          break;
        case 'relationship_drama':
          title = 'Relationship Drama';
          description = 'Your personal relationship issues have become public, drawing media attention.';
          break;
        case 'inappropriate_comments':
          title = 'Inappropriate Interview Comments';
          description = 'Comments you made during a recent interview are being criticized as inappropriate.';
          break;
        case 'substance_abuse':
          title = 'Substance Abuse Allegations';
          description = 'Reports are circulating about your alleged substance abuse issues.';
          break;
        case 'legal_trouble':
          title = 'Legal Issues Surface';
          description = 'You\'re facing legal trouble that has become public knowledge.';
          break;
        case 'conspiracy_theory':
          title = 'Conspiracy Theory';
          description = 'Wild conspiracy theories about you are spreading on social media.';
          break;
      }
      
      // Generate response options based on controversy type
      const responseOptions = [
        {
          text: 'Issue a public apology',
          reputationModifier: 5, // Recover some reputation
          streamModifier: -2000, // Small negative for streams
          followerModifier: 1000 // Recover some followers
        },
        {
          text: 'Deny the allegations',
          reputationModifier: -2, // Small further hit
          streamModifier: 0, // Neutral for streams
          followerModifier: -500 // Small follower loss
        },
        {
          text: 'Stay silent and wait for it to blow over',
          reputationModifier: -1, // Very small hit
          streamModifier: -5000, // Bigger hit to streams short term
          followerModifier: -2000 // More follower loss
        },
        {
          text: 'Turn it into a publicity stunt',
          reputationModifier: -3, // Reputation hit
          streamModifier: 15000, // Big stream boost
          followerModifier: 5000 // Follower gain but less loyal
        }
      ];
      
      // Create the controversy
      const newControversy: Controversy = {
        id: uuidv4(),
        type,
        title,
        description,
        severity,
        week: currentState.currentWeek,
        impactOnReputation: reputationImpact,
        impactOnStreams: streamImpact,
        impactOnFollowers: followerImpact,
        responseOptions,
        isActive: true
      };
      
      // Add to state
      set({
        activeControversies: [
          ...(currentState.activeControversies || []),
          newControversy
        ]
      });
      
      // Alert the player
      alert(`CONTROVERSY: ${title} - ${description}`);
      
      return newControversy.id;
    },
    
    respondToControversy: (controversyId, responseIndex) => {
      const currentState = get();
      const controversy = currentState.activeControversies?.find(c => c.id === controversyId);
      
      if (!controversy || responseIndex >= controversy.responseOptions.length) return;
      
      const response = controversy.responseOptions[responseIndex];
      
      // Apply response effects
      const stats = { ...currentState.stats };
      stats.reputation = Math.max(0, stats.reputation + response.reputationModifier);
      
      // Mark as resolved
      const resolvedControversy: Controversy = {
        ...controversy,
        resolvedWeek: currentState.currentWeek,
        selectedResponse: responseIndex,
        isActive: false
      };
      
      // Update state
      set({
        activeControversies: currentState.activeControversies?.filter(c => c.id !== controversyId) || [],
        pastControversies: [...(currentState.pastControversies || []), resolvedControversy],
        stats
      });
      
      // Apply platform-specific effects
      const streamingPlatforms = currentState.streamingPlatforms.map(platform => {
        // Each platform gets a share of the stream impact
        const platformStreamChange = response.streamModifier / currentState.streamingPlatforms.length;
        return {
          ...platform,
          totalStreams: Math.max(0, platform.totalStreams + platformStreamChange)
        };
      });
      
      // Apply social media effects
      const socialMedia = currentState.socialMedia.map(platform => {
        // Each platform gets a share of the follower impact
        const platformFollowerChange = response.followerModifier / currentState.socialMedia.length;
        return {
          ...platform,
          followers: Math.max(0, platform.followers + platformFollowerChange)
        };
      });
      
      // Update state with platform changes
      set({
        streamingPlatforms,
        socialMedia
      });
      
      // Notify the player of the outcome
      alert(`You chose to ${response.text.toLowerCase()}. This has affected your reputation by ${response.reputationModifier > 0 ? '+' : ''}${response.reputationModifier}.`);
    },
    
    // Subscription management
    updateSubscriptionStatus: (
      isSubscribed, 
      subscriptionType, 
      subscriptionId, 
      expiresAt
    ) => {
      const currentState = get();
      
      // Define benefits based on subscription type
      let benefits: string[] = [];
      
      switch (subscriptionType) {
        case 'standard':
          benefits = [
            'Ad-free experience',
            'Exclusive songs access',
            'Priority support',
            '2x progression rate',
            'Monthly bonus of 10,000 cash'
          ];
          break;
        case 'premium':
          benefits = [
            'All Standard features',
            'Premium songs and beats',
            'Advanced career statistics',
            '2x in-game currency rewards',
            'Tier 4-5 song production',
            '30% more streams on all songs'
          ];
          break;
        case 'platinum':
          benefits = [
            'All Premium features',
            'Exclusive platinum content',
            'Unlimited song recordings',
            '3x in-game currency rewards',
            'Early access to new features',
            '50% more streams on all songs',
            'Access to all premium music videos',
            'Exclusive collaborations with top artists'
          ];
          break;
        default:
          benefits = [];
      }
      
      set({
        subscriptionInfo: {
          isSubscribed,
          subscriptionType,
          subscriptionId,
          expiresAt,
          benefits
        }
      });
      
      // If subscribing, give immediate benefits
      if (isSubscribed) {
        const gameState = get();
        let cashBonus = 0;
        let creativityBonus = 0;
        let marketingBonus = 0;
        
        switch (subscriptionType) {
          case 'standard':
            cashBonus = 10000;
            creativityBonus = 5;
            marketingBonus = 5;
            break;
          case 'premium':
            cashBonus = 25000;
            creativityBonus = 10;
            marketingBonus = 10;
            break;
          case 'platinum':
            cashBonus = 50000;
            creativityBonus = 15;
            marketingBonus = 15;
            break;
        }
        
        // Apply immediate benefits
        set({
          stats: {
            ...gameState.stats,
            wealth: gameState.stats.wealth + cashBonus,
            creativity: Math.min(100, gameState.stats.creativity + creativityBonus),
            marketing: Math.min(100, gameState.stats.marketing + marketingBonus)
          }
        });
        
        // Show a welcome message
        alert(`Subscription activated! You received ${cashBonus} cash and stat boosts.`);
      }
    },
    
    // Check if user has access to a premium feature
    checkSubscriptionFeatureAccess: (feature) => {
      const { subscriptionInfo } = get();
      
      if (!subscriptionInfo.isSubscribed) {
        return false;
      }
      
      // Define feature access by subscription type
      const featureAccess: Record<string, Array<'none' | 'standard' | 'premium' | 'platinum'>> = {
        'tier5_songs': ['premium', 'platinum'],
        'tier4_songs': ['standard', 'premium', 'platinum'],
        'premium_videos': ['premium', 'platinum'],
        'exclusive_collabs': ['platinum'],
        'advanced_stats': ['premium', 'platinum'],
        'stream_multiplier': ['standard', 'premium', 'platinum'],
        'high_quality_videos': ['premium', 'platinum'],
        'unlimited_songs': ['platinum']
      };
      
      // Check if the user's subscription type allows the feature
      if (feature in featureAccess) {
        const allowedTypes = featureAccess[feature];
        return allowedTypes.includes(subscriptionInfo.subscriptionType);
      }
      
      return false;
    },
    
    // Show a subscription prompt for premium features
    showSubscriptionPrompt: (feature) => {
      const { subscriptionInfo } = get();
      
      // If already subscribed, no need to show prompt
      if (subscriptionInfo.isSubscribed) {
        // Check if current subscription level has access to this feature
        if (!get().checkSubscriptionFeatureAccess(feature)) {
          alert(`This feature requires a higher subscription level. Please upgrade to access ${feature}.`);
          return true; // Return true to indicate a prompt was shown
        }
        return false; // Already subscribed with correct level
      }
      
      // Feature-specific messages
      const featureMessages: Record<string, string> = {
        'tier5_songs': 'Creating Tier 5 songs requires a Premium or Platinum subscription.',
        'tier4_songs': 'Creating Tier 4 songs requires at least a Standard subscription.',
        'premium_videos': 'Premium music videos require a Premium or Platinum subscription.',
        'exclusive_collabs': 'Exclusive collaborations with top artists require a Platinum subscription.',
        'advanced_stats': 'Access to advanced career statistics requires a Premium or Platinum subscription.',
        'stream_multiplier': 'Stream multipliers require at least a Standard subscription.',
        'high_quality_videos': 'High-quality video production requires a Premium or Platinum subscription.',
        'unlimited_songs': 'Unlimited song recordings require a Platinum subscription.',
        'premium_merchandise': 'Premium merchandise items require at least a Standard subscription.'
      };
      
      // Show appropriate message
      const message = feature in featureMessages
        ? featureMessages[feature]
        : 'This feature requires a subscription. Please subscribe to unlock premium features.';
      
      // Show a confirmation dialog
      if (confirm(`${message}\n\nWould you like to view subscription options?`)) {
        // Navigate to subscription page
        window.location.href = '/subscribe';
      }
      
      return true; // Return true to indicate a prompt was shown
    },

    // Merchandise Management Functions
    addMerchandiseItem: (merchandiseItem: MerchandiseItem) => {
      const state = get();
      const existingItems = state.merchandiseItems || [];
      
      // Check if this is a premium-only item and user doesn't have access
      if (merchandiseItem.isPremiumOnly && !state.subscriptionInfo.isSubscribed) {
        return state.showSubscriptionPrompt('premium_merchandise');
      }
      
      // Check if player has enough money for production costs
      const initialProductionCost = merchandiseItem.cost * merchandiseItem.availableInventory;
      
      if (initialProductionCost > state.stats.wealth) {
        alert(`You don't have enough money to produce this merchandise. You need $${initialProductionCost.toLocaleString()}.`);
        return false;
      }
      
      // Deduct initial production cost
      set({
        stats: {
          ...state.stats,
          wealth: state.stats.wealth - initialProductionCost
        },
        merchandiseItems: [...existingItems, merchandiseItem]
      });
      
      return true;
    },

    updateMerchandiseItem: (itemId: string, updates: Partial<MerchandiseItem>) => {
      const state = get();
      const existingItems = state.merchandiseItems || [];
      
      // Find the item to update
      const itemToUpdate = existingItems.find(item => item.id === itemId);
      
      if (!itemToUpdate) {
        return false;
      }
      
      // Check if additional inventory is being added
      if (updates.availableInventory && updates.availableInventory > itemToUpdate.availableInventory) {
        const additionalUnits = updates.availableInventory - itemToUpdate.availableInventory;
        const additionalCost = additionalUnits * itemToUpdate.cost;
        
        // Check if player can afford the additional inventory
        if (additionalCost > state.stats.wealth) {
          alert(`You don't have enough money to produce ${additionalUnits} more units. You need $${additionalCost.toLocaleString()}.`);
          return false;
        }
        
        // Deduct cost of additional inventory
        set({
          stats: {
            ...state.stats,
            wealth: state.stats.wealth - additionalCost
          }
        });
      }
      
      // Update the item
      set({
        merchandiseItems: existingItems.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        )
      });
      
      return true;
    },

    deleteMerchandiseItem: (itemId: string) => {
      const state = get();
      const existingItems = state.merchandiseItems || [];
      
      set({
        merchandiseItems: existingItems.filter(item => item.id !== itemId)
      });
      
      return true;
    },

    // Process weekly merchandise sales in the advanceWeek function
    processMerchandiseSales: () => {
      const state = get();
      const currentWeek = state.currentWeek;
      const merchandiseItems = state.merchandiseItems || [];
      const existingSales = state.merchandiseSales || [];
      
      // Skip if no merchandise items
      if (merchandiseItems.length === 0) {
        return;
      }
      
      // Filter only active items
      const activeItems = merchandiseItems.filter(item => item.isActive);
      
      if (activeItems.length === 0) {
        return;
      }
      
      // Calculate sales for each item
      let totalItems = 0;
      let totalRevenue = 0;
      let totalProfit = 0;
      const itemsSold: Record<string, number> = {};
      
      const updatedItems = merchandiseItems.map(item => {
        // Skip inactive items
        if (!item.isActive) {
          return item;
        }
        
        // Calculate base sales figures based on reputation and marketing
        const fanBase = state.socialMedia.reduce((total, platform) => total + platform.followers, 0);
        const reputationFactor = state.stats.reputation / 100; // 0 to 1 based on reputation
        const marketingFactor = (state.stats.marketing + 50) / 150; // 0.33 to 1 based on marketing
        
        // Calculate sales conversion rate (0.1% to 2% of fans)
        const baseConversionRate = 0.001 + (reputationFactor * 0.019); // 0.1% to 2% conversion
        
        // Adjust for item type
        let typeMultiplier = 1.0;
        switch (item.type) {
          case 'clothing':
            typeMultiplier = 1.2;
            break;
          case 'accessories':
            typeMultiplier = 0.8;
            break;
          case 'collectibles':
            typeMultiplier = item.isLimited ? 2.0 : 0.6;
            break;
          case 'digital':
            typeMultiplier = 1.5;
            break;
          case 'limited':
            typeMultiplier = 3.0;
            break;
        }
        
        // Price sensitivity - higher prices reduce conversion
        const priceFactor = Math.max(0.3, 1 - (item.price / 200)); // Price sensitivity
        
        // Calculate final sales
        let salesVolume = Math.floor(
          fanBase * baseConversionRate * typeMultiplier * marketingFactor * priceFactor
        );
        
        // For limited items, cap at remaining inventory or limited quantity
        if (item.isLimited && item.limitedQuantity) {
          salesVolume = Math.min(salesVolume, item.limitedQuantity - item.totalSold, item.availableInventory);
        } else {
          salesVolume = Math.min(salesVolume, item.availableInventory);
        }
        
        // Random fluctuation (+/- 20%)
        const fluctuation = 0.8 + (Math.random() * 0.4);
        salesVolume = Math.max(0, Math.floor(salesVolume * fluctuation));
        
        // Calculate revenue and profit
        const salesRevenue = salesVolume * item.price;
        const salesProfit = salesVolume * (item.price - item.cost);
        
        // Update totals
        totalItems += salesVolume;
        totalRevenue += salesRevenue;
        totalProfit += salesProfit;
        itemsSold[item.id] = salesVolume;
        
        // Update the item
        return {
          ...item,
          availableInventory: item.availableInventory - salesVolume,
          totalSold: item.totalSold + salesVolume,
          revenue: item.revenue + salesRevenue,
          profit: item.profit + salesProfit
        };
      });
      
      // Create sales record for this week
      const weeklySales: MerchandiseWeeklySales = {
        week: currentWeek,
        totalItems,
        totalRevenue,
        totalProfit,
        itemsSold
      };
      
      // Update state
      set({
        merchandiseItems: updatedItems,
        merchandiseSales: [...existingSales, weeklySales],
        stats: {
          ...state.stats,
          wealth: state.stats.wealth + totalProfit
        },
        weeklyStats: state.weeklyStats.map(stat => 
          stat.week === currentWeek 
            ? { ...stat, revenue: stat.revenue + totalProfit } 
            : stat
        )
      });
    },
    
    // Media events system
    createMediaEvent: (mediaEvent) => {
      const id = uuidv4();
      const newEvent = {
        ...mediaEvent,
        id
      };
      
      // Add the event to the upcoming events list
      set(state => ({
        upcomingMediaEvents: [...(state.upcomingMediaEvents || []), newEvent]
      }));
      
      return id;
    },
    
    receiveMediaInvitation: (mediaEventId) => {
      const currentState = get();
      
      // Find the event from the upcoming events
      const event = currentState.upcomingMediaEvents?.find(e => e.id === mediaEventId);
      
      if (!event) return;
      
      // Move the event from upcoming to invited
      set(state => ({
        upcomingMediaEvents: (state.upcomingMediaEvents || []).filter(e => e.id !== mediaEventId),
        invitedMediaEvents: [...(state.invitedMediaEvents || []), {
          ...event,
          status: 'invited',
          invitationWeek: currentState.currentWeek
        }]
      }));
      
      // Send notification to the player
      alert(`You've been invited to appear at ${event.name}! Check your media events for details.`);
    },
    
    confirmMediaEvent: (mediaEventId) => {
      const currentState = get();
      
      // Find the event from the invited events
      const event = currentState.invitedMediaEvents?.find(e => e.id === mediaEventId);
      
      if (!event) return;
      
      // Check if the player can afford the cost (for festivals)
      if (event.cost > 0 && currentState.stats.wealth < event.cost) {
        alert(`You don't have enough money to participate in this event. It costs $${event.cost.toLocaleString()}.`);
        return;
      }
      
      // Check if the player meets the reputation requirement
      if (currentState.stats.reputation < event.reputationRequired) {
        alert(`You need at least ${event.reputationRequired} reputation to participate in this event.`);
        return;
      }
      
      // Deduct the cost if applicable
      if (event.cost > 0) {
        set(state => ({
          stats: {
            ...state.stats,
            wealth: state.stats.wealth - event.cost
          }
        }));
      }
      
      // Move the event from invited to confirmed
      set(state => ({
        invitedMediaEvents: (state.invitedMediaEvents || []).filter(e => e.id !== mediaEventId),
        confirmedMediaEvents: [...(state.confirmedMediaEvents || []), {
          ...event,
          status: 'confirmed'
        }]
      }));
      
      // Send confirmation to the player
      alert(`You've confirmed your participation at ${event.name}!`);
    },
    
    completeMediaEvent: (mediaEventId, performanceQuality = 0) => {
      const currentState = get();
      
      // Find the event from the confirmed events
      const event = currentState.confirmedMediaEvents?.find(e => e.id === mediaEventId);
      
      if (!event) return;
      
      // Calculate the event success
      const baseQuality = performanceQuality || Math.floor(50 + Math.random() * 30);
      const prepTasksCompleted = event.preparationTasks?.filter(t => t.completed).length || 0;
      const prepTaskBonus = prepTasksCompleted * 5; // Each completed task adds 5 to quality
      const totalQuality = Math.min(100, baseQuality + prepTaskBonus);
      
      // Calculate rewards based on quality
      const qualityMultiplier = totalQuality / 100;
      const reputationGain = Math.ceil(event.reputationGain * qualityMultiplier);
      const followerGain = Math.ceil(event.followerGain * qualityMultiplier);
      const streamBoost = event.streamBoost * qualityMultiplier;
      const payout = Math.ceil(event.payout * qualityMultiplier);
      
      // Apply rewards
      set(state => ({
        stats: {
          ...state.stats,
          reputation: Math.min(100, state.stats.reputation + reputationGain),
          wealth: state.stats.wealth + payout
        }
      }));
      
      // Add followers to social media platforms based on event size
      const socialMediaStatsCopy = {...currentState.socialMediaStats};
      
      if (socialMediaStatsCopy.instagram) {
        socialMediaStatsCopy.instagram.followers += Math.floor(followerGain * 0.3);
      }
      
      if (socialMediaStatsCopy.twitter) {
        socialMediaStatsCopy.twitter.followers += Math.floor(followerGain * 0.4);
      }
      
      if (socialMediaStatsCopy.tiktok) {
        socialMediaStatsCopy.tiktok.followers += Math.floor(followerGain * 0.3);
      }
      
      set({ socialMediaStats: socialMediaStatsCopy });
      
      // Apply stream boost to active songs if applicable
      if (streamBoost > 0) {
        set(state => ({
          songs: state.songs.map(song => {
            if (song.isActive && song.released) {
              return {
                ...song,
                hype: (song.hype || 0) + Math.ceil(streamBoost / 10) // Convert stream boost to hype points
              };
            }
            return song;
          })
        }));
      }
      
      // Move the event from confirmed to completed
      set(state => ({
        confirmedMediaEvents: (state.confirmedMediaEvents || []).filter(e => e.id !== mediaEventId),
        completedMediaEvents: [...(state.completedMediaEvents || []), {
          ...event,
          status: 'completed',
          performanceQuality: totalQuality,
          highlights: [
            `You received ${reputationGain} reputation`,
            `You gained ${followerGain} new followers across platforms`,
            `You earned $${payout.toLocaleString()} from the appearance`
          ]
        }]
      }));
      
      // Generate a social media post about the event
      if (currentState.socialMediaStats?.twitter) {
        const eventType = event.type === 'festival' ? 'performing at' : 
                         event.type === 'talk_show' ? 'appearing on' : 
                         'doing an interview with';
        
        const content = `Just finished ${eventType} ${event.name}! ${
          totalQuality > 80 ? "It was amazing! 🔥" : 
          totalQuality > 60 ? "Had a great time!" : 
          "Thanks for having me."
        }`;
        
        // Auto-post to Twitter
        const postData = {
          id: uuidv4(),
          platformName: 'Twitter',
          content,
          postWeek: currentState.currentWeek,
          date: new Date(),
          likes: Math.floor(followerGain * 0.5),
          comments: Math.floor(followerGain * 0.2),
          shares: Math.floor(followerGain * 0.1),
          viralStatus: totalQuality > 85 ? 'trending' : 'not_viral',
          viralMultiplier: totalQuality > 85 ? 1.5 : 1.0,
          followerGain: Math.floor(followerGain * 0.1),
          reputationGain: Math.floor(reputationGain * 0.1),
          wealthGain: 0
        };
        
        set(state => ({
          socialMediaStats: {
            ...state.socialMediaStats,
            twitter: {
              ...state.socialMediaStats?.twitter!,
              tweets: [...(state.socialMediaStats?.twitter?.tweets || []), postData]
            }
          }
        }));
      }
      
      // Notify the player about the event completion
      alert(`You completed your appearance at ${event.name}! Performance quality: ${totalQuality}/100`);
    },
    
    cancelMediaEvent: (mediaEventId) => {
      const currentState = get();
      
      // Find the event from both invited and confirmed events
      const invitedEvent = currentState.invitedMediaEvents?.find(e => e.id === mediaEventId);
      const confirmedEvent = currentState.confirmedMediaEvents?.find(e => e.id === mediaEventId);
      
      const event = invitedEvent || confirmedEvent;
      
      if (!event) return;
      
      // Apply small reputation penalty for cancelling a confirmed event
      if (confirmedEvent) {
        set(state => ({
          stats: {
            ...state.stats,
            reputation: Math.max(1, state.stats.reputation - 3)
          }
        }));
      }
      
      // Move the event to the missed events list
      set(state => ({
        invitedMediaEvents: (state.invitedMediaEvents || []).filter(e => e.id !== mediaEventId),
        confirmedMediaEvents: (state.confirmedMediaEvents || []).filter(e => e.id !== mediaEventId),
        missedMediaEvents: [...(state.missedMediaEvents || []), {
          ...event,
          status: 'cancelled'
        }]
      }));
      
      // Notify the player
      alert(`You've cancelled your participation at ${event.name}.${
        confirmedEvent ? ' Your reputation has taken a small hit.' : ''
      }`);
    },
    
    completeMediaEventPreparationTask: (mediaEventId, taskId) => {
      const currentState = get();
      
      // Find the event from confirmed events
      const event = currentState.confirmedMediaEvents?.find(e => e.id === mediaEventId);
      
      if (!event || !event.preparationTasks) return;
      
      // Find and mark the task as completed
      const updatedPreparationTasks = event.preparationTasks.map(task => {
        if (task.id === taskId) {
          // Apply immediate effects from completing the task
          if (task.effect) {
            // Apply follower boost
            if (task.effect.followerBoost) {
              const socialMediaStatsCopy = {...currentState.socialMediaStats};
              
              if (socialMediaStatsCopy.instagram) {
                socialMediaStatsCopy.instagram.followers += Math.floor(task.effect.followerBoost * 0.3);
              }
              
              if (socialMediaStatsCopy.twitter) {
                socialMediaStatsCopy.twitter.followers += Math.floor(task.effect.followerBoost * 0.4);
              }
              
              if (socialMediaStatsCopy.tiktok) {
                socialMediaStatsCopy.tiktok.followers += Math.floor(task.effect.followerBoost * 0.3);
              }
              
              set({ socialMediaStats: socialMediaStatsCopy });
            }
            
            // Apply reputation boost
            if (task.effect.reputationBoost) {
              set(state => ({
                stats: {
                  ...state.stats,
                  reputation: Math.min(100, state.stats.reputation + task.effect.reputationBoost)
                }
              }));
            }
            
            // Apply stream boost
            if (task.effect.streamBoost) {
              set(state => ({
                songs: state.songs.map(song => {
                  if (song.isActive && song.released) {
                    return {
                      ...song,
                      hype: (song.hype || 0) + Math.ceil(task.effect.streamBoost! / 20) // Convert stream boost to hype points
                    };
                  }
                  return song;
                })
              }));
            }
          }
          
          return {
            ...task,
            completed: true
          };
        }
        return task;
      });
      
      // Update the event with the completed task
      set(state => ({
        confirmedMediaEvents: (state.confirmedMediaEvents || []).map(e => {
          if (e.id === mediaEventId) {
            return {
              ...e,
              preparationTasks: updatedPreparationTasks
            };
          }
          return e;
        })
      }));
      
      // Notify the player
      alert(`You've completed preparation task: ${event.preparationTasks.find(t => t.id === taskId)?.description}`);
    }
  }))
);
