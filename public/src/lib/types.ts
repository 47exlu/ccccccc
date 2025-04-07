// Define game data types
export type GameScreen = 
  | "main_menu" 
  | "character_creation" 
  | "career_dashboard" 
  | "studio" 
  | "social_media" 
  | "streaming" 
  | "music_videos"
  | "beefs" // New screen for beefs
  | "shop"
  | "touring" // New screen for tours and concerts
  | "skills" // New screen for skills training
  | "music_production" // Music production screen
  | "unreleased_songs" // Unreleased songs screen
  | "streaming_platforms" // Streaming platforms screen
  | "collaborations" // Collaborations screen
  | "save_load" // Save/load game screen
  | "premium_store"; // Premium store screen

export interface CharacterInfo {
  id: string;
  artistName: string;
  image?: string;
  coverImage?: string;
  aboutBackgroundImage?: string;
  about?: string;
  musicStyle?: string;
  hometown?: string;
  background?: string;
}

export interface PlayerStats {
  careerLevel: number;
  reputation: number;
  wealth: number;
  creativity: number;
  marketing: number;
  networking: number;
  fanLoyalty: number;
  stagePower?: number; // Added for touring/concerts system
}

export interface WeeklyStats {
  week: number;
  newFollowers: number;
  newListeners: number;
  revenue: number;
  newSongs: number;
}

export type SongTier = 1 | 2 | 3 | 4 | 5;

export interface SongTierInfo {
  tier: SongTier;
  name: string;
  description: string;
  minQuality: number;
  cost: number;
  minCareerLevel?: number;
  baseProduction: number;
  productionTimeWeeks: number;
  chanceOfSuccess: number;
  fanGrowthMultiplier: number;
}

export type ViralStatus = "not_viral" | "trending" | "viral" | "super_viral";

export interface SocialMediaPost {
  id: string;
  platformName: string;
  content: string;
  images?: string[];
  postWeek: number;
  likes: number;
  comments: number;
  shares: number;
  viralStatus: ViralStatus;
  viralMultiplier: number;
  followerGain: number;
  reputationGain: number;
  wealthGain: number;
}

export type SocialMediaPlatform = {
  name: string;
  followers: number;
  posts: number;
  engagement: number;
  lastPostWeek: number;
  viralPosts?: SocialMediaPost[];
};

export interface StreamingPlatform {
  name: string;
  listeners: number;
  totalStreams: number;
  revenue: number;
}

export interface VideosPlatform {
  name: string;
  subscribers: number;
  totalViews: number;
  videos: number;
}

export type SongPerformanceType = "normal" | "viral" | "flop" | "comeback";

export type SongIcon = 
  | "microphone" 
  | "fire" 
  | "bolt" 
  | "heart" 
  | "star" 
  | "dollar" 
  | "globe"
  | "cloud";

export interface Song {
  id: string;
  title: string;
  tier: SongTier;
  quality: number;
  completed: boolean;
  productionStartWeek: number;
  productionProgress: number;
  released: boolean;
  releaseDate?: number;
  streams: number;
  isActive: boolean;
  icon?: SongIcon;
  releasePlatforms: string[];
  featuring: string[];
  performanceType: SongPerformanceType;
  performanceStatusWeek: number;
  coverArt?: string;
  aiRapperOwner?: string;
  aiRapperFeaturesPlayer?: boolean;
}

export interface MusicVideo {
  id: string;
  songId: string;
  title: string;
  description: string;
  quality: number;
  cost: number;
  budget: "low" | "medium" | "high" | "premium";
  concept: string;
  location: string;
  productionStartWeek: number;
  completed: boolean;
  released: boolean;
  releaseDate?: number;
  views: number;
  likes: number;
  platforms: string[];
  thumbnail?: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: "beat" | "lyrics" | "producer" | "feature" | "marketing";
  cost: number;
  tier: SongTier;
  quality: number;
  artistId?: string;
  purchased: boolean;
}

export interface RandomEvent {
  id: string;
  title: string;
  description: string;
  week: number;
  type: "opportunity" | "challenge" | "neutral" | "fan";
  options: {
    text: string;
    results: {
      reputation?: number;
      wealth?: number;
      creativity?: number;
      marketing?: number;
      networking?: number;
      fanLoyalty?: number;
      followers?: Record<string, number>;
      streams?: number;
    };
    requiresStats?: Partial<Record<keyof PlayerStats, number>>;
  }[];
  resolved: boolean;
  selectedOption?: number;
}

export interface FeatureRequest {
  id: string;
  fromRapperId?: string;
  toRapperId?: string;
  tier: SongTier;
  weekRequested: number;
  status: "pending" | "accepted" | "rejected" | "expired";
  expiresWeek: number;
}

export interface AIRapper {
  id: string;
  name: string;
  image: string;
  style: string;
  bio: string;
  popularity: number; // 1-100
  monthlyListeners: number;
  totalStreams: number;
  personality: "friendly" | "arrogant" | "mysterious" | "controversial" | "humble";
  featureCost: number;
  relationship?: "neutral" | "friend" | "rival" | "enemy";
  collabHistory?: {
    count: number;
    lastWeek: number;
    tracks: string[];
  };
  beefHistory?: {
    active: boolean;
    history: string[];
  };
}

// Beef system interfaces
export interface Beef {
  id: string;
  initiatorId: string;
  targetId: string;
  status: "ongoing" | "won" | "lost" | "draw" | "waiting";
  startWeek: number;
  endWeek?: number;
  initiatorTrack?: {
    title: string;
    lyrics: string;
    quality: number;
    responseWeek: number;
  };
  targetTrack?: {
    title: string;
    lyrics: string;
    quality: number;
    responseWeek: number;
  };
  publicReaction: {
    initiatorFavor: number;
    targetFavor: number;
  };
  impact: {
    initiatorRepGain: number;
    targetRepGain: number;
    initiatorFollowerGain: number;
    targetFollowerGain: number;
  };
}

// Tour and concert system interfaces
export type VenueSize = "small" | "medium" | "large" | "arena" | "stadium";

export interface Venue {
  id: string;
  name: string;
  city: string;
  country: string;
  size: VenueSize;
  capacity: number;
  cost: number;
  reputationRequired: number;
  image?: string;
}

export interface Tour {
  id: string;
  name: string;
  startWeek: number;
  endWeek: number;
  currentVenueIndex: number;
  venues: string[]; // venue ids
  status: "planning" | "active" | "completed" | "cancelled";
  ticketsSold: number;
  totalRevenue: number;
  expenses: number;
  profit: number;
}

export interface Concert {
  id: string;
  venueId: string;
  tourId?: string; // optional, can be a standalone concert
  week: number;
  ticketPrice: number;
  ticketsSold: number;
  maxTickets: number;
  revenue: number;
  expenses: number;
  profit: number;
  performanceQuality: number;
  audienceSatisfaction: number;
  reputationGain: number;
  setlist: string[]; // song ids
  status: "scheduled" | "performed" | "cancelled";
}

// Skill training system interfaces
export type SkillName = "creativity" | "marketing" | "networking" | "performance" | "production" | "business";

export interface Skill {
  name: SkillName;
  displayName: string;
  level: number;
  maxLevel: number;
  description: string;
  trainingCost: number;
}

export interface SkillTraining {
  id: string;
  skillName: SkillName;
  startWeek: number;
  endWeek: number;
  level: number;
  completed: boolean;
  trainingType: "course" | "mentor" | "practice" | "workshop";
  cost: number;
}

// Subscription info
export interface SubscriptionInfo {
  isSubscribed: boolean;
  subscriptionType: 'none' | 'standard' | 'premium' | 'platinum';
  subscriptionId?: string;
  expiresAt?: Date;
  benefits: string[];
}

// Main game state
export interface GameState {
  screen: GameScreen;
  previousScreen: GameScreen | null;
  character: CharacterInfo | null;
  currentWeek: number;
  songs: Song[];
  musicVideos: MusicVideo[];
  socialMedia: SocialMediaPlatform[];
  streamingPlatforms: StreamingPlatform[];
  videosPlatforms: VideosPlatform[];
  stats: PlayerStats;
  aiRappers: AIRapper[];
  beefs?: Beef[]; // Optional to maintain backward compatibility
  subscriptionInfo: SubscriptionInfo;
  activeRandomEvents: RandomEvent[];
  resolvedRandomEvents: RandomEvent[];
  collaborationRequests: FeatureRequest[];
  shopItems: ShopItem[];
  weeklyStats: WeeklyStats[];
  // New features
  venues?: Venue[];
  tours?: Tour[];
  concerts?: Concert[];
  skills?: Skill[];
  activeSkillTrainings?: SkillTraining[];
  completedSkillTrainings?: SkillTraining[];
}