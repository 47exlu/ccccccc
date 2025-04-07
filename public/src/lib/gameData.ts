import { AIRapper, SongTier } from "./types";

// Default AI rappers in the game
export const DEFAULT_AI_RAPPERS: AIRapper[] = [
  {
    id: "rapper_1",
    name: "21 Sawage",
    popularity: 85,
    monthlyListeners: 12500000,
    totalStreams: 450000000, // Lifetime streams for established artist
    style: "Trap",
    relationshipStatus: "neutral"
  },
  {
    id: "rapper_2",
    name: "Lil Bhaby",
    popularity: 90,
    monthlyListeners: 15000000,
    totalStreams: 520000000,
    style: "Trap",
    relationshipStatus: "neutral"
  },
  {
    id: "rapper_3",
    name: "Drakke",
    popularity: 95,
    monthlyListeners: 40000000, 
    totalStreams: 1200000000, // Billion+ streams for top tier artist
    style: "Hip Hop/R&B",
    relationshipStatus: "neutral"
  },
  {
    id: "rapper_4",
    name: "Lil Druk",
    popularity: 80,
    monthlyListeners: 8000000,
    totalStreams: 320000000,
    style: "Trap/Mumble",
    relationshipStatus: "neutral"
  },
  {
    id: "rapper_5",
    name: "King Vhon",
    popularity: 75,
    monthlyListeners: 5000000,
    totalStreams: 180000000,
    style: "Drill",
    relationshipStatus: "neutral"
  },
  {
    id: "rapper_6",
    name: "MC Flow",
    popularity: 65,
    monthlyListeners: 2000000,
    totalStreams: 80000000,
    style: "Old School",
    relationshipStatus: "neutral"
  },
  {
    id: "rapper_7",
    name: "Young Money",
    popularity: 70,
    monthlyListeners: 3500000,
    totalStreams: 120000000,
    style: "Trap/Hip Hop",
    relationshipStatus: "neutral"
  },
  {
    id: "rapper_8",
    name: "Rhyme Master",
    popularity: 55,
    monthlyListeners: 1200000,
    totalStreams: 45000000,
    style: "Lyrical",
    relationshipStatus: "neutral"
  },
  {
    id: "rapper_9",
    name: "Post Baloney",
    popularity: 92,
    monthlyListeners: 38000000,
    totalStreams: 950000000,
    style: "Alternative/Hip Hop",
    relationshipStatus: "neutral"
  },
  {
    id: "rapper_10",
    name: "Jaye-Z",
    popularity: 98,
    monthlyListeners: 45000000,
    totalStreams: 1800000000, // Almost 2 billion streams for legend
    style: "Hip Hop/Business",
    relationshipStatus: "neutral"
  },
  {
    id: "rapper_11",
    name: "Emindeed",
    popularity: 94,
    monthlyListeners: 42000000,
    totalStreams: 1600000000, // 1.6 billion streams
    style: "Rap/Lyrical",
    relationshipStatus: "neutral"
  },
  {
    id: "rapper_12",
    name: "Chancy the Producer",
    popularity: 87,
    monthlyListeners: 30000000,
    totalStreams: 820000000,
    style: "Melodic Rap",
    relationshipStatus: "neutral"
  },
  {
    id: "rapper_13",
    name: "Doja Mouse",
    popularity: 89,
    monthlyListeners: 32000000,
    totalStreams: 880000000,
    style: "Pop/Rap",
    relationshipStatus: "neutral"
  },
  {
    id: "rapper_14",
    name: "Micki Nichaj",
    popularity: 93,
    monthlyListeners: 36000000,
    totalStreams: 980000000,
    style: "Female Rap",
    relationshipStatus: "neutral"
  },
  {
    id: "rapper_15",
    name: "Capital Letters",
    popularity: 78,
    monthlyListeners: 7000000,
    totalStreams: 250000000,
    style: "Grime/UK Rap",
    relationshipStatus: "neutral"
  },
  {
    id: "rapper_16",
    name: "Mack Lemur",
    popularity: 82,
    monthlyListeners: 9000000,
    totalStreams: 350000000,
    style: "Conscious Rap",
    relationshipStatus: "neutral"
  }
];

// Song tier information
export const SONG_TIER_INFO = {
  1: {
    name: "Bad",
    description: "Poor quality song with no success potential",
    successChance: 0,
    popularityWeeks: 0,
    cost: 500,
    minStreams: 0,
    maxStreams: 10000
  },
  2: {
    name: "Mid",
    description: "Average song with minimal success chance (1%)",
    successChance: 0.01,
    popularityWeeks: 2,
    cost: 1000,
    minStreams: 10000,
    maxStreams: 100000
  },
  3: {
    name: "Normal",
    description: "Decent song with moderate hit potential (25%)",
    successChance: 0.25,
    popularityWeeks: 4,
    cost: 2500,
    minStreams: 100000,
    maxStreams: 1000000
  },
  4: {
    name: "Hit",
    description: "Excellent song guaranteed for major success",
    successChance: 1.0,
    popularityWeeks: 104, // 2 years
    cost: 10000,
    minStreams: 1000000,
    maxStreams: 900000000
  },
  5: {
    name: "Banger",
    description: "Legendary song with permanent popularity",
    successChance: 1.0,
    popularityWeeks: -1, // Never expires
    cost: 25000,
    minStreams: 10000000,
    maxStreams: Number.MAX_SAFE_INTEGER
  }
} as Record<SongTier, {
  name: string;
  description: string;
  successChance: number;
  popularityWeeks: number;
  cost: number;
  minStreams: number;
  maxStreams: number;
}>;

// Default shop items (purchasable songs)
export const DEFAULT_SHOP_ITEMS = [
  {
    id: "shop_1",
    name: "Platinum Flow",
    description: "A pre-written hit song guaranteed to top the charts",
    cost: 10000,
    tier: 4 as SongTier,
    purchased: false
  },
  {
    id: "shop_2",
    name: "Diamond Rhymes",
    description: "A legendary banger that will cement your legacy",
    cost: 25000,
    tier: 5 as SongTier,
    purchased: false
  },
  {
    id: "shop_3", 
    name: "Golden Verses",
    description: "Solid lyrics that will give you a normal hit",
    cost: 2500,
    tier: 3 as SongTier,
    purchased: false
  },
  {
    id: "shop_4",
    name: "Silver Bars",
    description: "Decent but mid-level lyrics with minimal success chance",
    cost: 1000,
    tier: 2 as SongTier,
    purchased: false
  },
  {
    id: "shop_5",
    name: "Industry Anthem",
    description: "A powerful hit song crafted by top industry producers",
    cost: 12000,
    tier: 4 as SongTier,
    purchased: false
  },
  {
    id: "shop_6",
    name: "Viral Hooks",
    description: "Catchy hooks designed to go viral on social media",
    cost: 8000,
    tier: 4 as SongTier,
    purchased: false
  },
  {
    id: "shop_7",
    name: "Underground Classic",
    description: "A respected track that will gain cult following",
    cost: 5000,
    tier: 3 as SongTier,
    purchased: false
  },
  {
    id: "shop_8",
    name: "Summer Anthem",
    description: "The perfect track for summer playlists",
    cost: 7500,
    tier: 4 as SongTier,
    purchased: false
  },
  {
    id: "shop_9",
    name: "Timeless Flow",
    description: "A legendary flow that transcends generations",
    cost: 30000,
    tier: 5 as SongTier,
    purchased: false
  },
  {
    id: "shop_10",
    name: "Club Banger",
    description: "Perfect for nightclubs and parties",
    cost: 6000,
    tier: 3 as SongTier,
    purchased: false
  }
];

// Feature request chance by tier and fame level
export const FEATURE_REQUEST_CHANCES = {
  3: {
    low: 0.05,   // 5% chance for tier 3 feature if player is not famous
    medium: 0.2,  // 20% chance for tier 3 feature if player has medium fame
    high: 0.4     // 40% chance for tier 3 feature if player is famous
  },
  4: {
    low: 0.01,   // 1% chance for tier 4 feature if player is not famous
    medium: 0.1,  // 10% chance for tier 4 feature if player has medium fame
    high: 0.6     // 60% chance for tier 4 feature if player is famous
  },
  5: {
    low: 0.001,  // 0.1% chance for tier 5 feature if player is not famous
    medium: 0.005, // 0.5% chance for tier 5 feature if player has medium fame
    high: 0.01    // 1% chance for tier 5 feature if player is famous
  }
};

// Social media post costs and effects
export const SOCIAL_MEDIA_COSTS = {
  "Twitter": {
    postCost: 0,
    followerGainRange: [10, 1000],
    postEngagementRange: [1, 5]  // percent
  },
  "Instagram": {
    postCost: 0,  // Free (was 100)
    followerGainRange: [50, 2000],
    postEngagementRange: [3, 8]  // percent
  },
  "TikTok": {
    postCost: 0,  // Free (was 200)
    followerGainRange: [100, 5000],
    postEngagementRange: [5, 15] // percent
  }
};

// Music video costs and effects
export const VIDEO_COSTS = {
  "YouTube": {
    baseCost: 1000,
    basic: 1000,
    premium: 5000,
    viewsMultiplierBasic: [1, 2],
    viewsMultiplierPremium: [2, 5]
  },
  "VEVO": {
    baseCost: 2000,
    basic: 2000,
    premium: 10000,
    viewsMultiplierBasic: [1.5, 3],
    viewsMultiplierPremium: [3, 8]
  }
};

// Career level thresholds
export const CAREER_LEVELS = [
  { level: 1, name: "Unknown", totalStreamsRequired: 0 },
  { level: 2, name: "Local Artist", totalStreamsRequired: 100000 },
  { level: 3, name: "Rising Star", totalStreamsRequired: 1000000 },
  { level: 4, name: "Regional Act", totalStreamsRequired: 10000000 },
  { level: 5, name: "National Artist", totalStreamsRequired: 50000000 },
  { level: 6, name: "Mainstream", totalStreamsRequired: 100000000 },
  { level: 7, name: "Superstar", totalStreamsRequired: 500000000 },
  { level: 8, name: "Global Icon", totalStreamsRequired: 1000000000 },
  { level: 9, name: "Legend", totalStreamsRequired: 5000000000 },
  { level: 10, name: "GOAT", totalStreamsRequired: 10000000000 }
];

// Venues for concerts and tours
export const DEFAULT_VENUES = [
  {
    id: "venue_1",
    name: "The Basement",
    city: "New York",
    country: "USA",
    size: "small",
    capacity: 200,
    cost: 500,
    reputationRequired: 10,
    image: "/images/venues/small_venue.jpg"
  },
  {
    id: "venue_2",
    name: "Club Echo",
    city: "Los Angeles",
    country: "USA",
    size: "small",
    capacity: 350,
    cost: 800,
    reputationRequired: 20,
    image: "/images/venues/small_venue_2.jpg"
  },
  {
    id: "venue_3",
    name: "Urban Lounge",
    city: "Chicago",
    country: "USA",
    size: "medium",
    capacity: 800,
    cost: 2000,
    reputationRequired: 30,
    image: "/images/venues/medium_venue.jpg"
  },
  {
    id: "venue_4",
    name: "The Metro",
    city: "Atlanta",
    country: "USA",
    size: "medium",
    capacity: 1200,
    cost: 3500,
    reputationRequired: 40,
    image: "/images/venues/medium_venue_2.jpg"
  },
  {
    id: "venue_5",
    name: "House of Blues",
    city: "Miami",
    country: "USA",
    size: "large",
    capacity: 2500,
    cost: 8000,
    reputationRequired: 50,
    image: "/images/venues/large_venue.jpg"
  },
  {
    id: "venue_6",
    name: "Showbox Theater",
    city: "Seattle",
    country: "USA",
    size: "large",
    capacity: 3800,
    cost: 12000,
    reputationRequired: 60,
    image: "/images/venues/large_venue_2.jpg"
  },
  {
    id: "venue_7",
    name: "Crypto Arena",
    city: "Los Angeles",
    country: "USA",
    size: "arena",
    capacity: 15000,
    cost: 50000,
    reputationRequired: 70,
    image: "/images/venues/arena_venue.jpg"
  },
  {
    id: "venue_8",
    name: "Madison Square Garden",
    city: "New York",
    country: "USA",
    size: "arena",
    capacity: 20000,
    cost: 75000,
    reputationRequired: 80,
    image: "/images/venues/arena_venue_2.jpg"
  },
  {
    id: "venue_9",
    name: "SoFi Stadium",
    city: "Los Angeles",
    country: "USA",
    size: "stadium",
    capacity: 70000,
    cost: 250000,
    reputationRequired: 90,
    image: "/images/venues/stadium_venue.jpg"
  },
  {
    id: "venue_10",
    name: "MetLife Stadium",
    city: "New Jersey",
    country: "USA",
    size: "stadium",
    capacity: 82500,
    cost: 350000,
    reputationRequired: 95,
    image: "/images/venues/stadium_venue_2.jpg"
  }
];

// Default skills for training
export const DEFAULT_SKILLS = [
  {
    name: "creativity",
    displayName: "Creativity",
    level: 1,
    maxLevel: 10,
    description: "Ability to create unique and engaging music. Higher levels unlock better quality music production.",
    trainingCost: 1000
  },
  {
    name: "marketing",
    displayName: "Marketing",
    level: 1,
    maxLevel: 10,
    description: "Skills for promoting your music. Higher levels increase engagement and follower growth.",
    trainingCost: 1200
  },
  {
    name: "networking",
    displayName: "Networking",
    level: 1,
    maxLevel: 10,
    description: "Building connections in the industry. Higher levels improve chances of successful collaborations.",
    trainingCost: 1500
  },
  {
    name: "performance",
    displayName: "Performance",
    level: 1,
    maxLevel: 10,
    description: "Stage presence and live show skills. Higher levels improve concert revenue and audience satisfaction.",
    trainingCost: 2000
  },
  {
    name: "production",
    displayName: "Production",
    level: 1,
    maxLevel: 10,
    description: "Technical skills for creating beats and music. Higher levels improve song quality.",
    trainingCost: 1800
  },
  {
    name: "business",
    displayName: "Business Acumen",
    level: 1,
    maxLevel: 10,
    description: "Management and financial skills. Higher levels increase revenue and negotiation power.",
    trainingCost: 2500
  }
];
