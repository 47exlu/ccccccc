import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  AIRapper,
  CharacterInfo,
  Concert,
  FeatureRequest,
  GameScreen,
  GameState,
  MusicVideo,
  PlayerStats,
  RandomEvent,
  ShopItem,
  Skill,
  SkillName,
  SkillTraining,
  SocialMediaPlatform,
  SocialMediaPost,
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
  WeeklyStats
} from '../types';
import { useAudio } from './useAudio';
import { DEFAULT_AI_RAPPERS, DEFAULT_SHOP_ITEMS, DEFAULT_SKILLS, DEFAULT_VENUES, SOCIAL_MEDIA_COSTS, SONG_TIER_INFO } from '../gameData';
import { v4 as uuidv4 } from 'uuid';
import { getRandomEventForWeek } from '../utils/randomEvents';
// Import all game calculations functions
import { 
  calculateCareerLevel,
  calculateFeatureAcceptanceChance,
  calculateInitialStreams,
  calculateMonthlyListenerDecay,
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
  
  // Game progression
  advanceWeek: () => void;
  
  // Music production
  createSong: (title: string, tier: SongTier, featuring: string[]) => void;
  buySongFromShop: (shopItemId: string) => void;
  releaseSong: (songId: string, title: string, icon: SongIcon, platforms: string[]) => void;
  
  // Music video production
  createMusicVideo: (video: MusicVideo, updatedSong: Song, cost: number) => void;
  
  // Image management
  updateSongCoverArt: (songId: string, coverArt: string) => void;
  updateVideoThumbnail: (videoId: string, thumbnail: string) => void;
  updateProfileImage: (image: string) => void;
  
  // Social media
  postOnSocialMedia: (platform: string, content?: string, images?: string[]) => void;
  
  // Collaboration
  requestFeature: (rapperId: string, songTier: SongTier) => void;
  respondToFeatureRequest: (rapperId: string, accept: boolean) => void;
  
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
  
  // Tour and concert management
  createTour: (name: string, venues: string[], startWeek: number) => string;
  cancelTour: (tourId: string) => void;
  scheduleConcert: (venueId: string, week: number, ticketPrice: number, setlist: string[]) => string;
  cancelConcert: (concertId: string) => void;
  
  // Skills training
  startSkillTraining: (skillName: SkillName, trainingType: string, duration: number) => string;
  completeSkillTraining: (trainingId: string) => void;
  trainSkill: (skillName: string) => void;
  
  // Save/load
  saveGame: (slotId: string, name: string) => string;
  loadGame: (gameState: GameState) => void;
  resetGame: () => void;
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
      revenue: 0
    },
    {
      name: "SoundCloud",
      listeners: 0,
      totalStreams: 0,
      revenue: 0
    },
    {
      name: "iTunes",
      listeners: 0,
      totalStreams: 0,
      revenue: 0
    },
    {
      name: "YouTube Music",
      listeners: 0,
      totalStreams: 0,
      revenue: 0
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
  skills: DEFAULT_SKILLS,
  activeSkillTrainings: [],
  completedSkillTrainings: []
};

// Create the store with combined state and actions
export const useRapperGame = create<RapperGameStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,
    
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
    
    // Game progression
    advanceWeek: () => {
      const currentState = get();
      const newWeek = currentState.currentWeek + 1;
      
      // Create a copy of the current state
      const updatedState: Partial<GameState> = {
        currentWeek: newWeek
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
        if (song.isActive && song.released) {
          const growth = songGrowths[index];
          return {
            ...song,
            streams: song.streams + growth,
            // Song becomes inactive if its popularity window has completely expired
            // Low-tier flops (tier 1-2) lose listeners quickly - only active for 2 weeks
            // Other songs stay active longer (up to 3 weeks of zero growth before deactivating)
            isActive: growth > 0 || (
              song.performanceStatusWeek && (
                // If it's a tier 1-2 flop, only stay active for 2 weeks max
                (song.tier <= 2 && song.performanceType === 'flop') 
                  ? newWeek - song.performanceStatusWeek < 2
                  : newWeek - song.performanceStatusWeek < 3
              )
            )
          };
        }
        return song;
      });
      
      // Create a mapping of song streams to their release platforms
      const platformStreamMap: Record<string, number> = {};
      
      // Calculate how streams are distributed across platforms based on song release platforms
      updatedState.songs?.forEach((song, index) => {
        if (song.released && song.isActive && song.releasePlatforms) {
          const growth = songGrowths[index];
          const growthPerPlatform = growth / song.releasePlatforms.length;
          
          song.releasePlatforms.forEach(platformName => {
            platformStreamMap[platformName] = (platformStreamMap[platformName] || 0) + growthPerPlatform;
          });
        }
      });
      
      // Count active songs for listener decay calculation
      const activeSongs = updatedState.songs?.filter(song => song.isActive && song.released).length || 0;
      const totalReleasedSongs = updatedState.songs?.filter(song => song.released).length || 0;
      
      // Update each platform with its specific stream growth from the map
      updatedState.streamingPlatforms = currentState.streamingPlatforms.map(platform => {
        // Get the streams allocated to this platform
        const platformGrowth = platformStreamMap[platform.name] || 0;
        const updatedStreams = platform.totalStreams + platformGrowth;
        
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
        
        return {
          ...platform,
          totalStreams: updatedStreams,
          listeners: updatedListeners,
          revenue: calculateStreamingRevenue(updatedStreams)
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
                    const platformShare = playerGrowthShare / song.releasePlatforms.length;
                    return {
                      ...platform,
                      totalStreams: platform.totalStreams + Math.floor(platformShare),
                      revenue: platform.revenue + (platformShare * 0.004) // $4 per 1000 streams
                    };
                  }
                  return platform;
                });
              }
            }
          }
        });
        
        return {
          ...rapper,
          totalStreams: rapper.totalStreams + Math.floor(streamBenefit),
          monthlyListeners: Math.max(
            rapper.monthlyListeners + Math.floor(listenerBenefit) - Math.floor(rapper.monthlyListeners * 0.05), // 5% natural decay
            Math.ceil(rapper.totalStreams / 20) // Base level from total streams
          )
        };
      });
      
      // Update the AI rappers in state
      updatedState.aiRappers = updatedRappers;
      
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
      
      // Calculate total streams across all platforms for career level
      const allStreams = (updatedState.streamingPlatforms || [])
        .reduce((total, platform) => total + platform.totalStreams, 0);
      
      // Update career stats
      updatedState.stats = {
        ...currentState.stats,
        careerLevel: calculateCareerLevel(allStreams),
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
      
      // Set the updated state
      set(updatedState);
    },
    
    // Music production
    createSong: (title, tier, featuring) => {
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
    
    buySongFromShop: (shopItemId) => {
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
    postOnSocialMedia: (platformName, content = "", images = []) => {
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
    
    releaseSong: (songId, title, icon, platforms) => {
      const currentState = get();
      const songIndex = currentState.songs.findIndex(s => s.id === songId);
      
      if (songIndex === -1) return;
      
      const song = currentState.songs[songIndex];
      
      // Can only release unreleased songs
      if (song.released) return;
      
      // Calculate initial streams based on the song's tier and player stats
      // Using the enhanced calculateInitialStreams formula
      const initialStreams = calculateInitialStreams(song.tier, currentState.stats);
      
      // Apply bonus for features - bigger boost based on number of features
      const featureCount = song.featuring.length;
      const featureBonus = featureCount === 0 ? 1.0 : 
                          featureCount === 1 ? 1.2 : 
                          featureCount === 2 ? 1.35 : 1.5; // Up to 50% boost for 3+ features
      
      // Apply marketing bonus
      const marketingBonus = 1.0 + (currentState.stats.marketing / 200); // 0-50% bonus based on marketing skill
      
      // Calculate total streams for this song
      const totalSongStreams = Math.floor(initialStreams * featureBonus * marketingBonus);
      
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
      
      // Distribute streams proportionally to platform popularity
      // This is more realistic than equal distribution
      const totalPlatformWeight = platforms.reduce((sum, platformName) => {
        const platform = updatedStreamingPlatforms.find(p => p.name === platformName);
        // Weight based on existing listeners (more popular platforms get more streams)
        return sum + (platform ? platform.listeners + 1000 : 1000); // +1000 to ensure new platforms get streams too
      }, 0);
      
      platforms.forEach(platformName => {
        const platformIndex = updatedStreamingPlatforms.findIndex(p => p.name === platformName);
        if (platformIndex !== -1) {
          const platform = updatedStreamingPlatforms[platformIndex];
          
          // Weight based on platform popularity
          const platformWeight = (platform.listeners + 1000) / totalPlatformWeight;
          const platformStreams = Math.floor(totalSongStreams * platformWeight);
          const updatedStreams = platform.totalStreams + platformStreams;
          
          // Calculate new base listeners - more realistic ratio based on platform
          // Larger platforms have a higher streams-to-listeners ratio
          const platformMultiplier = Math.max(5, 10 - (platform.listeners / 1000000) * 5); // Ranges from 5-10
          const baseListeners = Math.ceil(updatedStreams / platformMultiplier);
          
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
          
          updatedStreamingPlatforms[platformIndex] = {
            ...platform,
            totalStreams: updatedStreams,
            listeners: boostedListeners,
            revenue: calculateStreamingRevenue(updatedStreams)
          };
        }
      });
      
      // Update AI rappers' stats for songs they're featured on
      // This ensures featuring artists benefit from collaborations
      const updatedRappers = [...currentState.aiRappers];
      if (featureCount > 0) {
        song.featuring.forEach(featureId => {
          const rapperIndex = updatedRappers.findIndex(r => r.id === featureId);
          if (rapperIndex !== -1) {
            const rapper = updatedRappers[rapperIndex];
            
            // Calculate feature benefit based on song tier
            const streamBoost = totalSongStreams * (0.2 + (song.tier / 10)); // 20-70% of song streams
            const listenerBoost = Math.floor(rapper.monthlyListeners * (song.tier / 20)); // 5-25% listener boost
            
            updatedRappers[rapperIndex] = {
              ...rapper,
              totalStreams: rapper.totalStreams + streamBoost,
              monthlyListeners: rapper.monthlyListeners + listenerBoost
            };
          }
        });
      }
      
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
    
    respondToFeatureRequest: (rapperId, accept) => {
      const currentState = get();
      const requestIndex = currentState.collaborationRequests.findIndex(
        req => req.rapperId === rapperId && req.accepted === null
      );
      
      if (requestIndex === -1) return;
      
      const request = currentState.collaborationRequests[requestIndex];
      const rapper = currentState.aiRappers.find(r => r.id === rapperId);
      
      if (!rapper) return;
      
      // Update request status
      const updatedRequests = [...currentState.collaborationRequests];
      updatedRequests[requestIndex] = {
        ...request,
        accepted: accept
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
        const basePay = request.songTier * 1000;
        const popularityMultiplier = rapper.popularity / 50; // 0.5 to 2.0
        const featurePayment = Math.floor(basePay * popularityMultiplier);
        
        // Generate a song title with the player as a feature
        const prefixes = ['Hustle', 'Money', 'Streets', 'Dreams', 'Flow', 'Vibe', 'Life', 'Boss', 'Grind', 'Fame'];
        const suffixes = ['Season', 'Chronicles', 'Anthem', 'Life', 'Time', 'Movement', 'Gang', 'Ways', 'Talk', 'Energy'];
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const songTitle = `${prefix} ${suffix} (feat. ${currentState.character?.artistName || "You"})`;
        
        // Calculate initial streams based on the rapper's popularity and song tier
        const initialStreams = rapper.monthlyListeners * (request.songTier / 10) * (0.2 + Math.random() * 0.3);
        
        // Create a new AI rapper featured song that includes the player
        const newSong: Song = {
          id: `ai-${rapperId}-ft-player-${Date.now()}`,
          title: songTitle,
          tier: request.songTier,
          releaseDate: currentState.currentWeek,
          streams: Math.floor(initialStreams),
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
        
        // Calculate the player's stream share (20-30% of the song's streams)
        const playerStreamShare = initialStreams * (0.2 + (request.songTier / 10));
        
        // Distribute player's stream share across platforms
        const updatedStreamingPlatforms = currentState.streamingPlatforms.map(platform => {
          // Calculate total listeners across all platforms (with safety check for zero)
          const totalPlatformListeners = currentState.streamingPlatforms.reduce((sum, p) => sum + p.listeners, 0);
          
          // Each platform gets a share proportional to its existing listener base
          // If all platforms have 0 listeners, distribute evenly
          const platformWeight = totalPlatformListeners > 0 
            ? platform.listeners / totalPlatformListeners 
            : 1 / currentState.streamingPlatforms.length;
            
          const platformStreams = Math.floor(playerStreamShare * platformWeight);
          
          // Calculate new monthly listeners from feature (smaller boost than releasing own song)
          const listenerBoost = (request.songTier / 10) * rapper.popularity / 100; // 0-5% boost based on tier and rapper popularity
          const newListeners = Math.floor(platform.listeners * (1 + listenerBoost));
          
          return {
            ...platform,
            totalStreams: platform.totalStreams + platformStreams,
            listeners: newListeners,
            revenue: platform.revenue + (platformStreams * 0.004) // $4 per 1000 streams
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
        
        alert(`You accepted the feature request from ${rapper.name} and earned $${featurePayment}! The song "${songTitle}" has been released and is generating streams for you.`);
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
        resolved: true
      };
      
      // Apply the effect and update the state
      const newState = option.effect(currentState);
      
      // Remove the resolved event from active events and add to resolved events
      const updatedActiveEvents = currentState.activeRandomEvents.filter(e => e.id !== eventId);
      
      set({
        ...newState,
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
        'unlimited_songs': 'Unlimited song recordings require a Platinum subscription.'
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
    }
  }))
);
