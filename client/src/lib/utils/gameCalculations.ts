import { AIRapper, GameState, Song, SongPerformanceType, SongTier, StreamingPlatform } from '../types';
import { CAREER_LEVELS, FEATURE_REQUEST_CHANCES, SONG_TIER_INFO } from '../gameData';

// Constants for viral and flop chances/multipliers
const VIRAL_CHANCE_BASE = 0.02; // 2% baseline chance for a song to go viral
const VIRAL_MULTIPLIER_MIN = 3; // Minimum viral multiplier (reduced from 5)
const VIRAL_MULTIPLIER_MAX = 8; // Maximum viral multiplier (reduced from 20)
const VIRAL_DURATION_WEEKS = 2; // How long viral status lasts

const FLOP_CHANCE_BASE = 0.05; // 5% baseline chance for a song to flop
const FLOP_MULTIPLIER = 0.2; // How much streams are reduced for flops (80% reduction)

const COMEBACK_CHANCE = 0.01; // 1% chance for a flopped song to make a comeback

// Growth caps to prevent insane stream counts
const WEEKLY_GROWTH_CAPS = {
  1: 5000,      // Tier 1: Max 5K streams per week
  2: 25000,     // Tier 2: Max 25K streams per week 
  3: 100000,    // Tier 3: Max 100K streams per week
  4: 500000,    // Tier 4: Max 500K streams per week
  5: 2000000    // Tier 5: Max 2M streams per week
};

// Function to check if a song should go viral
export const checkSongViralStatus = (
  song: Song, 
  currentWeek: number, 
  playerStats: GameState['stats']
): SongPerformanceType => {
  // Only unreleased songs or songs that aren't currently viral can go viral
  // Also handle undefined releaseDate to prevent NaN in calculations
  if (!song.released || !song.releaseDate || song.releaseDate === 0) return 'normal';
  
  const songAge = currentWeek - (song.releaseDate || currentWeek);
  
  // Songs can only go viral in their first few weeks
  const canGoViral = songAge <= 4;
  // Flopped songs can make a comeback at any time
  const isFlopped = song.performanceType === 'flop';
  // Viral status expires after VIRAL_DURATION_WEEKS
  const viralExpired = song.performanceType === 'viral' && 
                       song.performanceStatusWeek && 
                       (currentWeek - song.performanceStatusWeek) > VIRAL_DURATION_WEEKS;
  
  // If currently viral but expired, reset to normal
  if (viralExpired) return 'normal';
  
  // Keep existing status if not expired
  if (song.performanceType === 'viral' || song.performanceType === 'comeback') return song.performanceType;
  
  // Flop chance check - songs can flop on release week or if they're normal
  if (songAge === 1 || song.performanceType === 'normal') {
    // Flop chance reduced by reputation and creativity
    const flopChanceReduction = (playerStats.reputation + playerStats.creativity) / 500; // 0-0.4 reduction
    const flopChance = Math.max(0.01, FLOP_CHANCE_BASE - flopChanceReduction);
    
    if (Math.random() < flopChance) {
      return 'flop';
    }
  }
  
  // Comeback chance for flopped songs
  if (isFlopped) {
    // Comeback chance increases with marketing skill
    const comebackBoost = playerStats.marketing / 400; // 0-0.25 boost
    const comebackChance = COMEBACK_CHANCE + comebackBoost;
    
    if (Math.random() < comebackChance) {
      return 'comeback';
    }
    
    return 'flop'; // Stay as flop if no comeback
  }
  
  // Viral chance check for eligible songs
  if (canGoViral) {
    // Viral chance increases with tier, reputation, and marketing
    const tierBonus = (song.tier - 1) * 0.01; // 0-0.04 boost based on tier
    const reputationBonus = playerStats.reputation / 500; // 0-0.2 boost
    const marketingBonus = playerStats.marketing / 400; // 0-0.25 boost
    
    // Featured artists increase viral chance
    const featureBonus = song.featuring.length * 0.02;
    
    const viralChance = VIRAL_CHANCE_BASE + tierBonus + reputationBonus + marketingBonus + featureBonus;
    
    if (Math.random() < viralChance) {
      return 'viral';
    }
  }
  
  // Default normal performance
  return song.performanceType || 'normal';
};

// Calculate stream growth for a song based on its tier, age, and performance type
export const calculateSongStreamGrowth = (song: Song, currentWeek: number, playerStats: GameState['stats']): number => {
  // Safety checks to handle undefined or invalid release dates
  if (!song.releaseDate || song.releaseDate <= 0 || isNaN(song.releaseDate)) return 0;
  if (!song.released) return 0; // Only released songs should gain streams
  
  const songAge = currentWeek - song.releaseDate;
  const tierInfo = SONG_TIER_INFO[song.tier];
  
  // Check if song is still in its popularity window
  // For longer song life, multiply the popularity weeks by a factor based on tier
  // Lower-tier songs (Tier 1-2) that perform poorly should lose monthly listeners quickly
  const extendedPopularityWeeks = tierInfo.popularityWeeks === -1 ? -1 : 
    song.tier >= 4 ? tierInfo.popularityWeeks * 5 : 
    song.tier === 3 ? tierInfo.popularityWeeks * 3 : 
    // Tier 1-2 songs that are flopping lose popularity faster (1.5x multiplier instead of 2x)
    (song.tier <= 2 && song.performanceType === 'flop') ? tierInfo.popularityWeeks * 1.5 :
    song.tier === 2 ? tierInfo.popularityWeeks * 2 : 
    tierInfo.popularityWeeks;
    
  if (tierInfo.popularityWeeks === -1 || songAge <= extendedPopularityWeeks) {
    // Base weekly growth depends on current streams, tier and marketing skill
    // This creates a more realistic S-curve growth pattern:
    // - Slow start (discovery phase)
    // - Rapid growth (viral potential phase)
    // - Plateau and decline (saturation phase)
    
    // First, determine current phase based on song's lifetime and current streams
    let baseGrowth = 0;
    const maxStreams = tierInfo.maxStreams;
    const saturationPoint = maxStreams * 0.7; // When growth starts to slow
    
    // Discovery phase (first few weeks) - growth accelerates
    if (songAge <= 2) {
      // Early growth is slower but steady
      switch (song.tier) {
        case 1: // Bad
          baseGrowth = 10 + songAge * 50 + (song.streams * 0.05);
          break;
        case 2: // Mid
          baseGrowth = 100 + songAge * 200 + (song.streams * 0.1);
          break;
        case 3: // Normal
          baseGrowth = 500 + songAge * 1000 + (song.streams * 0.15);
          break;
        case 4: // Hit
          baseGrowth = 2000 + songAge * 5000 + (song.streams * 0.2);
          break;
        case 5: // Banger
          baseGrowth = 10000 + songAge * 20000 + (song.streams * 0.25);
          break;
      }
    } 
    // Viral potential phase (middle weeks) - fastest growth
    else if (song.streams < saturationPoint && songAge <= tierInfo.popularityWeeks * 0.6) {
      switch (song.tier) {
        case 1: // Bad
          baseGrowth = Math.max(20, song.streams * 0.1);
          break;
        case 2: // Mid
          baseGrowth = Math.max(200, song.streams * 0.15);
          break;
        case 3: // Normal
          baseGrowth = Math.max(1000, song.streams * 0.2);
          break;
        case 4: // Hit
          baseGrowth = Math.max(5000, song.streams * 0.25);
          break;
        case 5: // Banger
          baseGrowth = Math.max(20000, song.streams * 0.3);
          break;
      }
      
      // Add small randomness to make growth more natural
      baseGrowth *= 0.8 + (Math.random() * 0.4); // 80-120% of calculated growth
    } 
    // Saturation phase (later weeks) - slowing growth
    else {
      // Growth slows as song approaches its natural ceiling
      const saturationRatio = Math.min(1, song.streams / maxStreams);
      // Ensure slowdownFactor never goes below 0.1 to prevent growth from hitting 0 too quickly
      const slowdownFactor = Math.max(0.1, 1 - saturationRatio);
      
      switch (song.tier) {
        case 1: // Bad
          // Much higher minimum growth for all tiers to ensure they keep streaming
          baseGrowth = Math.max(50, song.streams * 0.05 * slowdownFactor);
          break;
        case 2: // Mid
          baseGrowth = Math.max(100, song.streams * 0.08 * slowdownFactor);
          break;
        case 3: // Normal
          baseGrowth = Math.max(400, song.streams * 0.1 * slowdownFactor);
          break;
        case 4: // Hit
          baseGrowth = Math.max(2000, song.streams * 0.12 * slowdownFactor);
          break;
        case 5: // Banger
          baseGrowth = Math.max(10000, song.streams * 0.15 * slowdownFactor);
          break;
      }
    }
    
    // Apply marketing skill multiplier (0.7 to 2.2)
    const marketingMultiplier = 0.7 + (playerStats.marketing / 100) * 1.5;
    
    // Apply fan loyalty multiplier (0.8 to 1.7)
    const loyaltyMultiplier = 0.8 + (playerStats.fanLoyalty / 100) * 0.9;
    
    // Apply song age decay (except for tier 5 bangers)
    let ageDecay = 1.0;
    if (song.tier !== 5 && tierInfo.popularityWeeks !== -1) {
      // Less decay for comeback songs
      const decayRate = song.performanceType === 'comeback' ? 0.4 : 0.8;
      ageDecay = Math.max(0.15, 1 - (songAge / tierInfo.popularityWeeks) * decayRate);
    }
    
    // Calculate featuring artist bonus (each feature adds 10-25% based on their popularity)
    let featuringBonus = 1.0;
    if (song.featuring && song.featuring.length > 0) {
      // We would need to look up each featuring artist's popularity
      // For now, estimate with a flat 15% per feature
      featuringBonus += song.featuring.length * 0.15;
    }
    
    // Apply performance type multipliers
    let performanceMultiplier = 1.0;
    switch (song.performanceType) {
      case 'viral':
        // Viral songs get a massive boost (5x-20x)
        performanceMultiplier = VIRAL_MULTIPLIER_MIN + 
          Math.random() * (VIRAL_MULTIPLIER_MAX - VIRAL_MULTIPLIER_MIN);
        break;
      case 'flop':
        // Flopped songs get significantly fewer streams
        // Make tier 1-2 flops lose popularity even faster
        performanceMultiplier = song.tier <= 2 ? FLOP_MULTIPLIER * 0.5 : FLOP_MULTIPLIER;
        break;
      case 'comeback':
        // Comeback songs get a 2x-4x boost
        performanceMultiplier = 2 + Math.random() * 2;
        break;
      default:
        // Normal songs get no modifier
        performanceMultiplier = 1.0;
    }
    
    // Apply all multipliers to get the final weekly growth
    const finalGrowth = Math.floor(baseGrowth * marketingMultiplier * loyaltyMultiplier * 
                     ageDecay * featuringBonus * performanceMultiplier);
    
    // Apply weekly growth cap to prevent insane stream counts
    const cappedGrowth = Math.min(finalGrowth, WEEKLY_GROWTH_CAPS[song.tier] || 100000);
    
    // Apply max stream cap check - if song is near max streams, reduce growth further
    const remainingHeadroom = maxStreams - song.streams;
    if (remainingHeadroom <= cappedGrowth) {
      // If we're very close to the max, only add what's needed to reach max
      return Math.max(0, remainingHeadroom);
    }
    
    return cappedGrowth;
  }
  
  // Song has passed its popularity window
  return 0;
};

// Calculate overall career level based on total streams
export const calculateCareerLevel = (totalStreams: number): number => {
  for (let i = CAREER_LEVELS.length - 1; i >= 0; i--) {
    if (totalStreams >= CAREER_LEVELS[i].totalStreamsRequired) {
      return CAREER_LEVELS[i].level;
    }
  }
  return 1; // Default to level 1
};

// Calculate the total monthly listeners across all streaming platforms (capped at 250M)
export const calculateTotalMonthlyListeners = (streamingPlatforms: StreamingPlatform[]): number => {
  const totalListeners = streamingPlatforms.reduce((total, platform) => total + platform.listeners, 0);
  // Cap at 250 million listeners
  return Math.min(totalListeners, 250000000);
};

// Calculate likelihood of an AI rapper accepting a feature request
export const calculateFeatureAcceptanceChance = (
  aiRapper: AIRapper, 
  playerReputation: number,
  playerMonthlyListeners: number,
  requestedTier: SongTier
): number => {
  // Base chance from the feature request chances table
  let fameLevel: 'low' | 'medium' | 'high';
  
  if (playerReputation < 30) {
    fameLevel = 'low';
  } else if (playerReputation < 70) {
    fameLevel = 'medium';
  } else {
    fameLevel = 'high';
  }
  
  let baseChance = 0;
  if (requestedTier === 3 && FEATURE_REQUEST_CHANCES[3][fameLevel]) {
    baseChance = FEATURE_REQUEST_CHANCES[3][fameLevel];
  } else if (requestedTier === 4 && FEATURE_REQUEST_CHANCES[4][fameLevel]) {
    baseChance = FEATURE_REQUEST_CHANCES[4][fameLevel];
  } else if (requestedTier === 5 && FEATURE_REQUEST_CHANCES[5][fameLevel]) {
    baseChance = FEATURE_REQUEST_CHANCES[5][fameLevel];
  }
  
  // Modify based on relationship status
  const relationshipModifier = 
    aiRapper.relationship === 'friend' ? 1.5 :
    aiRapper.relationship === 'rival' ? 0.5 :
    aiRapper.relationship === 'enemy' ? 0.1 :
    1.0; // neutral
  
  // Modify based on relative popularity
  const popularityRatio = Math.min(1, playerMonthlyListeners / aiRapper.monthlyListeners);
  const popularityModifier = 0.5 + popularityRatio * 0.5;
  
  // Calculate final chance
  return Math.min(1, baseChance * relationshipModifier * popularityModifier);
};

// Calculate chance of an AI rapper requesting a feature from the player
export const calculateAIFeatureRequestChance = (
  aiRapper: AIRapper,
  playerReputation: number,
  playerMonthlyListeners: number,
  careerLevel: number
): number => {
  // Base chance depends on AI rapper's popularity
  // Higher popularity = lower chance they'll reach out
  let baseChance: number;
  
  if (aiRapper.popularity >= 95) { // Legend tier artists (Jaye-Z, Emindeed, Drakke)
    baseChance = 0.001; // 0.1% base chance - extremely rare
  } else if (aiRapper.popularity >= 90) { // Superstars (Micki Nichaj, Post Baloney)
    baseChance = 0.002; // 0.2% base chance - very rare
  } else if (aiRapper.popularity >= 80) { // Stars (21 Sawage, Lil Druk)
    baseChance = 0.005; // 0.5% base chance - rare
  } else if (aiRapper.popularity >= 70) { // Established (Young Money, Capital Letters)
    baseChance = 0.01; // 1% base chance
  } else if (aiRapper.popularity >= 60) { // Mid-tier (MC Flow)
    baseChance = 0.02; // 2% base chance
  } else {
    baseChance = 0.03; // 3% base chance for lesser-known artists
  }
  
  // Modify based on player's reputation
  const reputationModifier = playerReputation / 25; // 0-4x multiplier based on reputation
  
  // Modify based on relationship status
  const relationshipModifier = 
    aiRapper.relationship === 'friend' ? 3.0 :
    aiRapper.relationship === 'rival' ? 0.2 :
    aiRapper.relationship === 'enemy' ? 0.0 : // Enemies never reach out
    1.0; // neutral
  
  // Modify based on relative popularity (if player is more popular, more likely to get requests)
  const popularityRatio = Math.min(5, playerMonthlyListeners / Math.max(1, aiRapper.monthlyListeners));
  const popularityModifier = Math.max(0.2, popularityRatio);
  
  // Career level modifier (higher career levels get more requests)
  const careerModifier = Math.min(5, careerLevel * 0.5); // 0.5-5x multiplier
  
  // Calculate final chance
  return Math.min(0.2, baseChance * reputationModifier * relationshipModifier * popularityModifier * careerModifier); // Cap at 20% per week
};

// Calculate revenue from streams
export const calculateStreamingRevenue = (totalStreams: number, platformName?: string): number => {
  // Different platforms have different payout rates per stream (increased by 3x for better game progression)
  const platformRates: Record<string, number> = {
    'Spotify': 0.012,          // $0.012 per stream (3x real-world rate)
    'Apple Music': 0.0225,     // $0.0225 per stream (3x real-world rate)
    'iTunes': 0.018,           // $0.018 per stream (3x real-world rate)
    'SoundCloud': 0.009,       // $0.009 per stream (3x real-world rate)
    'YouTube Music': 0.015,    // $0.015 per stream (3x real-world rate)
    'YouTube': 0.003,          // $0.003 per stream (3x real-world rate)
    'YouTube Vevo': 0.0165,    // $0.0165 per stream (3x real-world rate)
    'Amazon Music': 0.012,     // $0.012 per stream (3x real-world rate)
    'Tidal': 0.0252,           // $0.0252 per stream (3x real-world rate)
    'Deezer': 0.0105,          // $0.0105 per stream (3x real-world rate)
  };
  
  // Use platform-specific rate if provided, otherwise use average rate
  const ratePerStream = platformName && platformRates[platformName] 
    ? platformRates[platformName] 
    : 0.012; // Default average if platform not specified (3x previous default)
    
  return Math.floor(totalStreams * ratePerStream);
};

// Generate a random song title
export const generateSongTitle = (): string => {
  // Title patterns
  const patterns = [
    // Standard pattern
    () => {
      const prefixes = ["The", "My", "Your", "Our", "Their", "", "", "", ""];
      const adjectives = ["Hot", "Cold", "Dark", "Bright", "Wild", "Smooth", "Hard", "Soft", "Rich", "Lost", "Found", "Real", "Fake", "Crazy", "Savage", "Chill", "Dope", "Lit", "Wavy", "Trap", "Flex", "Boss"];
      const nouns = ["Life", "Love", "Money", "Streets", "Game", "Dreams", "Time", "Heart", "Soul", "Mind", "Hood", "City", "Night", "Day", "Grind", "Drip", "Hustle", "Vibe", "Zone", "Fame", "Throne", "Paper", "Cash", "Squad"];
      const suffixes = ["Flow", "Hustle", "Grind", "Vibes", "Story", "Tales", "Chronicles", "Anthem", "Rhymes", "Beats", "Season", "Lifestyle", "Code", "Way", "", "", ""];
      
      const usePrefix = Math.random() > 0.5;
      const useAdjective = Math.random() > 0.3;
      const useSuffix = Math.random() > 0.5;
      
      let title = "";
      
      if (usePrefix) {
        title += prefixes[Math.floor(Math.random() * prefixes.length)] + " ";
      }
      
      if (useAdjective) {
        title += adjectives[Math.floor(Math.random() * adjectives.length)] + " ";
      }
      
      title += nouns[Math.floor(Math.random() * nouns.length)];
      
      if (useSuffix) {
        title += " " + suffixes[Math.floor(Math.random() * suffixes.length)];
      }
      
      return title.trim();
    },
    
    // "X in the Y" pattern
    () => {
      const subjects = ["Money", "Dreams", "Love", "Pain", "Diamonds", "Secrets", "Ghosts", "Memories", "Stars", "Shadows", "Angels", "Demons", "Tears", "Lies", "Chains", "Scars"];
      const locations = ["Hood", "Club", "City", "Streets", "Sky", "Night", "Rain", "Dark", "Light", "Fire", "Game", "System", "Studio", "Heart", "Mind", "Trap"];
      
      return `${subjects[Math.floor(Math.random() * subjects.length)]} in the ${locations[Math.floor(Math.random() * locations.length)]}`;
    },
    
    // "X to Y" pattern
    () => {
      const starts = ["Nothing", "Rags", "Streets", "Bottom", "Zero", "Pain", "Struggle", "Hustle", "Grind", "Road", "Path", "Way", "Intro"];
      const ends = ["Riches", "Fame", "Glory", "Top", "Everything", "Success", "Millions", "Greatness", "Victory", "Stars", "Crown", "Throne", "Legacy"];
      
      return `${starts[Math.floor(Math.random() * starts.length)]} to ${ends[Math.floor(Math.random() * ends.length)]}`;
    },
    
    // "Don't X the Y" pattern
    () => {
      const verbs = ["Hate", "Stop", "Doubt", "Fade", "Test", "Forget", "Question", "Underestimate", "Trust", "Fear", "Chase", "Believe"];
      const objects = ["Grind", "Hustle", "Player", "Process", "Vision", "Dream", "Flex", "Vibe", "Journey", "Wave", "Drip", "Game", "Movement"];
      
      return `Don't ${verbs[Math.floor(Math.random() * verbs.length)]} the ${objects[Math.floor(Math.random() * objects.length)]}`;
    },
    
    // Single powerful word
    () => {
      const powerWords = ["Invincible", "Unstoppable", "Legendary", "Champion", "Immortal", "Notorious", "Legacy", "Dynasty", "Empire", "Greatness", "Royalty", "Ascension", "Genesis", "Revival", "Prophecy", "Destiny"];
      
      return powerWords[Math.floor(Math.random() * powerWords.length)];
    },
    
    // Number + Word
    () => {
      const numbers = ["24/7", "365", "100", "99", "24", "365", "4 Life", "5 Star", "1000", "Million", "Billion"];
      const nouns = ["Grind", "Hustle", "Problems", "Dreams", "Hours", "Days", "Nights", "Chances", "Reasons", "Ways", "Flows"];
      
      return `${numbers[Math.floor(Math.random() * numbers.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
    }
  ];
  
  // Randomly select a pattern
  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
  return selectedPattern();
};

// Calculate initial streams for a new song
export const calculateInitialStreams = (tier: SongTier, playerStats: GameState['stats']): number => {
  const tierInfo = SONG_TIER_INFO[tier];
  
  // Base range from tier info
  const minStreams = tierInfo.minStreams;
  const maxStreams = tierInfo.maxStreams;
  
  // Generate a value within that range - more weighted toward the higher end based on marketing skill
  const weightedRandom = Math.pow(Math.random(), 1 - (playerStats.marketing / 200)); // Higher marketing = more weight to higher values
  const baseStreams = Math.floor(minStreams + weightedRandom * (maxStreams - minStreams));
  
  // Apply marketing modifier (0.5 to 2.0)
  const marketingModifier = 0.5 + (playerStats.marketing / 100) * 1.5;
  
  // Apply creativity modifier (0.7 to 1.3)
  const creativityModifier = 0.7 + (playerStats.creativity / 100) * 0.6;
  
  // Apply reputation modifier (0.8 to 1.5) - more established artists get more initial streams
  const reputationModifier = 0.8 + (playerStats.reputation / 100) * 0.7;
  
  // Calculate final initial streams
  return Math.floor(baseStreams * marketingModifier * creativityModifier * reputationModifier);
};

// Calculate monthly listener decay when songs become inactive
export const calculateMonthlyListenerDecay = (
  listeners: number,
  activeSongs: number,
  totalSongs: number
): number => {
  // Using logarithmic scales for decay rates to create more stability
  // Base decay rate varies by listener count (larger fanbases decay more slowly)
  let decayPercentage;
  
  if (listeners < 1000) {
    // Very small fanbase - minimal decay to help new players
    decayPercentage = 0.03; // Reduced from 5% to 3% base decay
  } else if (listeners < 10000) {
    // Small fanbase - slightly higher decay
    decayPercentage = 0.04; // Reduced from 7% to 4% base decay
  } else if (listeners < 100000) {
    // Medium fanbase - moderate decay
    decayPercentage = 0.05; // Reduced from 10% to 5% base decay
  } else if (listeners < 1000000) {
    // Large fanbase - higher decay (harder to maintain)
    decayPercentage = 0.06; // Reduced from 12% to 6% base decay
  } else if (listeners < 10000000) {
    // Very large fanbase
    decayPercentage = 0.07; // Reduced from 15% to 7% base decay
  } else {
    // Massive fanbase - highest decay rate (requires constant hits)
    decayPercentage = 0.08; // Reduced from 15% to 8% base decay
  }
  
  // If there are no active songs, listeners will decay but more gradually
  if (activeSongs === 0) {
    // More forgiving decay for no active songs
    // Smaller fanbases lose less (10-15%), larger fanbases lose more (15-20%)
    const noSongsDecayRate = Math.min(0.2, 0.1 + (listeners / 20000000) * 0.1);
    return Math.floor(listeners * noSongsDecayRate);
  }
  
  // Basic decay rate improves with having more active songs
  const activeRatio = activeSongs / Math.max(1, totalSongs);
  
  // More active songs means less decay - improved bonus formula
  const activityBonus = Math.min(0.9, activeRatio * 0.9 + 0.1); // 10-90% reduction in decay
  
  // Final decay percentage after activity bonus is applied
  const finalDecayPercentage = decayPercentage * (1 - activityBonus);
  
  // Apply a floor to ensure minimal decay
  const minimumDecayPercentage = 0.01; // At least 1% decay
  
  // Calculate final decay amount
  return Math.floor(listeners * Math.max(minimumDecayPercentage, finalDecayPercentage));
};

// Calculate social media growth based on engagement and activity
export const calculateSocialMediaGrowth = (
  followers: number, 
  posts: number,
  engagement: number,
  lastPostWeek: number,
  currentWeek: number
): number => {
  // Base growth rate
  let baseGrowth = followers * 0.01; // 1% organic growth
  
  // Growth from engagement (higher engagement means faster growth)
  const engagementMultiplier = engagement / 100 * 2; // 0% to 30% engagement means 0x to 0.6x multiplier
  
  // Recency factor (posting recently boosts growth)
  const weeksSinceLastPost = Math.max(0, currentWeek - lastPostWeek);
  const recencyMultiplier = weeksSinceLastPost === 0 ? 2 : // Posted this week
                            weeksSinceLastPost === 1 ? 1.5 : // Posted last week
                            weeksSinceLastPost <= 4 ? 1 : // Posted in last month
                            0.5; // Inactive
  
  // Calculate final growth
  return Math.floor(baseGrowth * engagementMultiplier * recencyMultiplier);
};

export function calculatePromotionCost(
  promotionType: 'social' | 'radio' | 'tour' | 'influencer' | 'all',
  intensity: number,
  songTier: number
): number {
  // Base costs for different promotion types
  const baseCosts = {
    social: 500,
    radio: 1500,
    tour: 3000,
    influencer: 2000,
    all: 8000
  };

  // Intensity factor (10% to 100%)
  const intensityFactor = intensity / 50;
  
  // Tier factor (higher tier songs cost more to promote)
  const tierFactor = songTier / 2;
  
  // Calculate final cost
  return Math.round(baseCosts[promotionType] * intensityFactor * tierFactor);
}

export function calculatePromotionImpact(
  promotionType: 'social' | 'radio' | 'tour' | 'influencer' | 'all',
  intensity: number,
  songTier: number,
  marketingSkill: number
): {
  streamMultiplier: number;
  followerGain: number;
  listeners: number;
  platformReach: Record<string, number>;
} {
  // Base multipliers for each promotion type
  const baseMultipliers = {
    social: 1.2,
    radio: 1.4,
    tour: 1.6,
    influencer: 1.5,
    all: 2.0
  };

  // Each promotion type affects platforms differently
  const platformEffectiveness = {
    social: {
      'Spotify': 0.4,
      'SoundCloud': 0.6,
      'iTunes': 0.3,
      'YouTube Music': 0.5,
      'YouTube': 0.7,
      'YouTube Vevo': 0.5,
      'Deezer': 0.3,
      'Tidal': 0.3,
      'Amazon Music': 0.3,
    },
    radio: {
      'Spotify': 0.5,
      'SoundCloud': 0.2,
      'iTunes': 0.7,
      'YouTube Music': 0.4,
      'YouTube': 0.3,
      'YouTube Vevo': 0.4,
      'Deezer': 0.5,
      'Tidal': 0.6,
      'Amazon Music': 0.5,
    },
    tour: {
      'Spotify': 0.6,
      'SoundCloud': 0.5,
      'iTunes': 0.5,
      'YouTube Music': 0.5,
      'YouTube': 0.6,
      'YouTube Vevo': 0.7,
      'Deezer': 0.4,
      'Tidal': 0.4,
      'Amazon Music': 0.4,
    },
    influencer: {
      'Spotify': 0.5,
      'SoundCloud': 0.8,
      'iTunes': 0.4,
      'YouTube Music': 0.6,
      'YouTube': 0.9,
      'YouTube Vevo': 0.8,
      'Deezer': 0.3,
      'Tidal': 0.3,
      'Amazon Music': 0.3,
    },
    all: {
      'Spotify': 0.7,
      'SoundCloud': 0.7,
      'iTunes': 0.7,
      'YouTube Music': 0.7,
      'YouTube': 0.7,
      'YouTube Vevo': 0.7,
      'Deezer': 0.6,
      'Tidal': 0.6,
      'Amazon Music': 0.6,
    }
  };

  // Calculate intensity factor (10% to 100%)
  const intensityFactor = intensity / 50;
  
  // Marketing skill factor (0-100)
  const marketingFactor = 1 + (marketingSkill / 100);
  
  // Tier factor
  const tierFactor = (songTier / 3) * 1.2;
  
  // Calculate stream multiplier
  const streamMultiplier = baseMultipliers[promotionType] * intensityFactor * marketingFactor;
  
  // Calculate follower gain
  const baseFollowers = {
    social: 500,
    radio: 1000,
    tour: 2000,
    influencer: 3000,
    all: 8000
  };
  const followerGain = Math.round(baseFollowers[promotionType] * intensityFactor * marketingFactor * tierFactor);
  
  // Calculate listener increase
  const baseListeners = {
    social: 2000,
    radio: 5000,
    tour: 8000,
    influencer: 10000,
    all: 30000
  };
  const listeners = Math.round(baseListeners[promotionType] * intensityFactor * marketingFactor * tierFactor);
  
  // Calculate platform-specific reach
  const platformReach: Record<string, number> = {};
  
  for (const [platform, effectiveness] of Object.entries(platformEffectiveness[promotionType])) {
    platformReach[platform] = effectiveness * intensityFactor * marketingFactor;
  }
  
  return {
    streamMultiplier,
    followerGain,
    listeners,
    platformReach
  };
}
