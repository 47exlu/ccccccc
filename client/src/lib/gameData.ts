import { AIRapper, SongTier } from "./types";

// Default AI rappers in the game
export const DEFAULT_AI_RAPPERS: AIRapper[] = [
  {
    id: "rapper_1",
    name: "21 Savvage", // Based on 21 Savage
    image: "/assets/covers/rapper_1.jpg",
    bio: "Known for his cold delivery and street tales, 21 Savvage rose from the Atlanta trap scene to become a household name. His authentic style and consistent output have earned him respect throughout the industry.",
    popularity: 85,
    monthlyListeners: 12500000,
    totalStreams: 450000000, // Lifetime streams for established artist
    style: "Trap",
    personality: "mysterious",
    featureCost: 75000,
    relationship: "neutral",
    collabHistory: {
      count: 0,
      lastWeek: 0,
      tracks: []
    }
  },
  {
    id: "rapper_2",
    name: "Lil Babby", // Based on Lil Baby
    image: "/assets/covers/rapper_2.jpg",
    bio: "In just a few years, Lil Babby has gone from recording in a makeshift studio to being one of rap's most consistent hitmakers. His melodic flow and relatable lyrics resonate with millions of fans worldwide.",
    popularity: 90,
    monthlyListeners: 15000000,
    totalStreams: 520000000,
    style: "Trap",
    personality: "friendly",
    featureCost: 85000,
    relationship: "neutral",
    collabHistory: {
      count: 0,
      lastWeek: 0,
      tracks: []
    }
  },
  {
    id: "rapper_3",
    name: "Drakke", // Based on Drake
    image: "/assets/covers/rapper_3.jpg",
    bio: "The undisputed king of streaming, Drakke has dominated charts for over a decade. His ability to blend rap with R&B and pop elements has made him the most commercially successful rapper of his generation.",
    popularity: 95,
    monthlyListeners: 40000000, 
    totalStreams: 1200000000, // Billion+ streams for top tier artist
    style: "Hip Hop/R&B",
    personality: "arrogant",
    featureCost: 250000,
    relationship: "neutral",
    collabHistory: {
      count: 0,
      lastWeek: 0,
      tracks: []
    }
  },
  {
    id: "rapper_4",
    name: "Lil Drukk", // Based on Lil Durk
    image: "/assets/covers/rapper_4.jpg",
    bio: "With his distinct vocal style and genre-bending approach, Lil Drukk has created a unique lane in modern rap. His experimental beats and atmospheric tracks have influenced countless artists.",
    popularity: 80,
    monthlyListeners: 8000000,
    totalStreams: 320000000,
    style: "Trap/Mumble",
    personality: "mysterious",
    featureCost: 65000,
    relationship: "neutral",
    collabHistory: {
      count: 0,
      lastWeek: 0,
      tracks: []
    }
  },
  {
    id: "rapper_5",
    name: "King Vonn", // Based on King Von
    image: "/assets/covers/rapper_5.jpg",
    bio: "Rising from Chicago's drill scene, King Vonn's raw storytelling and unflinching lyrics paint a vivid picture of street life. His drill anthems have become the soundtrack for a generation.",
    popularity: 75,
    monthlyListeners: 5000000,
    totalStreams: 180000000,
    style: "Drill",
    personality: "controversial",
    featureCost: 45000,
    relationship: "neutral",
    collabHistory: {
      count: 0,
      lastWeek: 0,
      tracks: []
    }
  },
  {
    id: "rapper_6",
    name: "Naas", // Based on Nas
    image: "/assets/covers/rapper_6.jpg",
    bio: "A veteran in the game, Naas represents the golden age of hip-hop. His complex rhyme schemes and storytelling abilities have earned him respect among purists who value lyrical craft above all.",
    popularity: 65,
    monthlyListeners: 2000000,
    totalStreams: 80000000,
    style: "Old School",
    personality: "humble",
    featureCost: 25000,
    relationship: "neutral",
    collabHistory: {
      count: 0,
      lastWeek: 0,
      tracks: []
    }
  },
  {
    id: "rapper_7",
    name: "Thugg", // Based on Young Thug
    image: "/assets/covers/rapper_7.jpg",
    bio: "Thugg combines catchy hooks with street credibility. His rise from local fame to national recognition proves his versatility and unique vocal approach in the competitive rap landscape.",
    popularity: 70,
    monthlyListeners: 3500000,
    totalStreams: 120000000,
    style: "Trap/Hip Hop",
    personality: "arrogant",
    featureCost: 35000,
    relationship: "neutral",
    collabHistory: {
      count: 0,
      lastWeek: 0,
      tracks: []
    }
  },
  {
    id: "rapper_8",
    name: "M.F. Gloom", // Based on MF DOOM
    image: "/assets/covers/rapper_8.jpg",
    bio: "An underground legend, M.F. Gloom prioritizes lyrical prowess over commercial success. His dedicated fanbase values his wordplay and philosophical insights that elevate rap to poetry.",
    popularity: 55,
    monthlyListeners: 1200000,
    totalStreams: 45000000,
    style: "Lyrical",
    personality: "humble",
    featureCost: 15000,
    relationship: "neutral",
    collabHistory: {
      count: 0,
      lastWeek: 0,
      tracks: []
    }
  },
  {
    id: "rapper_9",
    name: "Post Melon", // Based on Post Malone
    image: "/assets/covers/rapper_9.jpg",
    bio: "Blurring the lines between rap, rock, and pop, Post Melon has created a distinctive sound that appeals to fans across genres. His tattooed image and genre-bending music have made him a cultural icon.",
    popularity: 92,
    monthlyListeners: 38000000,
    totalStreams: 950000000,
    style: "Alternative/Hip Hop",
    personality: "friendly",
    featureCost: 150000,
    relationship: "neutral",
    collabHistory: {
      count: 0,
      lastWeek: 0,
      tracks: []
    }
  },
  {
    id: "rapper_10",
    name: "Jay-C", // Based on Jay-Z
    image: "/assets/covers/rapper_10.jpg",
    bio: "More than just a rapper, Jay-C is a business mogul who has transcended music to become a cultural institution. His lyrical prowess and entrepreneurial spirit have made him a blueprint for success.",
    popularity: 98,
    monthlyListeners: 45000000,
    totalStreams: 1800000000, // Almost 2 billion streams for legend
    style: "Hip Hop/Business",
    personality: "arrogant",
    featureCost: 500000,
    relationship: "neutral",
    collabHistory: {
      count: 0,
      lastWeek: 0,
      tracks: []
    }
  },
  {
    id: "rapper_11",
    name: "Eminence", // Based on Eminem
    image: "/assets/covers/rapper_11.jpg",
    bio: "Widely respected as one of the greatest technical rappers of all time, Eminence's lightning-fast delivery and complex rhyme schemes have pushed the boundaries of what's possible in hip-hop.",
    popularity: 94,
    monthlyListeners: 42000000,
    totalStreams: 1600000000, // 1.6 billion streams
    style: "Rap/Lyrical",
    personality: "controversial",
    featureCost: 350000,
    relationship: "neutral",
    collabHistory: {
      count: 0,
      lastWeek: 0,
      tracks: []
    }
  },
  {
    id: "rapper_12",
    name: "Chant the Rapper", // Based on Chance the Rapper
    image: "/assets/covers/rapper_12.jpg",
    bio: "Starting as a producer before transitioning to rapping, Chant brings a unique musicality to his work. His uplifting messages and innovative production have created a distinctive positive lane in modern rap.",
    popularity: 87,
    monthlyListeners: 30000000,
    totalStreams: 820000000,
    style: "Melodic Rap",
    personality: "friendly",
    featureCost: 90000,
    relationship: "neutral",
    collabHistory: {
      count: 0,
      lastWeek: 0,
      tracks: []
    }
  },
  {
    id: "rapper_13",
    name: "Doja Feline", // Based on Doja Cat
    image: "/assets/covers/rapper_13.jpg",
    bio: "Blending pop sensibilities with genuine rap skills, Doja Feline has become one of the most versatile artists in the industry. Her viral hits and captivating performances have built a massive following.",
    popularity: 89,
    monthlyListeners: 32000000,
    totalStreams: 880000000,
    style: "Pop/Rap",
    personality: "friendly",
    featureCost: 100000,
    relationship: "neutral",
    collabHistory: {
      count: 0,
      lastWeek: 0,
      tracks: []
    }
  },
  {
    id: "rapper_14",
    name: "Nikki Mirage", // Based on Nicki Minaj
    image: "/assets/covers/rapper_14.jpg",
    bio: "One of the most successful female rappers of all time, Nikki Mirage combines technical skill with theatrical flair. Her larger-than-life persona and versatile flow have broken barriers in the male-dominated rap industry.",
    popularity: 93,
    monthlyListeners: 36000000,
    totalStreams: 980000000,
    style: "Female Rap",
    personality: "arrogant",
    featureCost: 200000,
    relationship: "neutral",
    collabHistory: {
      count: 0,
      lastWeek: 0,
      tracks: []
    }
  },
  {
    id: "rapper_15",
    name: "Skepta Cal", // Based on Skepta
    image: "/assets/covers/rapper_15.jpg",
    bio: "Leading the UK grime scene to international recognition, Skepta Cal brings British slang and rapid-fire delivery to create a distinct sound that stands out from American rap styles.",
    popularity: 78,
    monthlyListeners: 7000000,
    totalStreams: 250000000,
    style: "Grime/UK Rap",
    personality: "controversial",
    featureCost: 50000,
    relationship: "neutral",
    collabHistory: {
      count: 0,
      lastWeek: 0,
      tracks: []
    }
  },
  {
    id: "rapper_16",
    name: "Kendrik", // Based on Kendrick Lamar
    image: "/assets/covers/rapper_16.jpg",
    bio: "Bringing thoughtful lyrics and social commentary to the mainstream, Kendrik proves conscious rap can be commercially successful. His authentic approach and message-driven music resonate across generations.",
    popularity: 82,
    monthlyListeners: 9000000,
    totalStreams: 350000000,
    style: "Conscious Rap",
    personality: "humble",
    featureCost: 60000,
    relationship: "neutral",
    collabHistory: {
      count: 0,
      lastWeek: 0,
      tracks: []
    }
  },
  {
    id: "rapper_17",
    name: "Gunna Wunna", // Based on Gunna
    image: "/assets/covers/rapper_17.jpg",
    bio: "Rising from the Southern trap scene, Gunna Wunna has quickly made a name for himself with his authentic street narratives and distinctive production style. His lyrics reflect the harsh realities of his upbringing.",
    popularity: 73,
    monthlyListeners: 4500000,
    totalStreams: 160000000,
    style: "Trap",
    personality: "mysterious",
    featureCost: 40000,
    relationship: "neutral",
    collabHistory: {
      count: 0,
      lastWeek: 0,
      tracks: []
    }
  },
  {
    id: "rapper_18",
    name: "Tech N9na", // Based on Tech N9ne
    image: "/assets/covers/rapper_18.jpg",
    bio: "Known for his mind-boggling speed and technical precision, Tech N9na has carved out a niche with his rapid-fire delivery and complex rhyme patterns. His dedicated fanbase values technical skill above all else.",
    popularity: 79,
    monthlyListeners: 6500000,
    totalStreams: 230000000,
    style: "Speed Rap/Technical",
    personality: "humble",
    featureCost: 55000,
    relationship: "neutral",
    collabHistory: {
      count: 0,
      lastWeek: 0,
      tracks: []
    }
  },
  {
    id: "rapper_19",
    name: "Juicee", // Based on Juice WRLD
    image: "/assets/covers/rapper_19.jpg",
    bio: "Pioneering the emo-rap movement, Juicee blends emotional vulnerability with trap production. His honest exploration of mental health struggles has created a deep connection with a generation of listeners.",
    popularity: 76,
    monthlyListeners: 5200000,
    totalStreams: 185000000,
    style: "Emo Rap",
    personality: "mysterious",
    featureCost: 48000,
    relationship: "neutral",
    collabHistory: {
      count: 0,
      lastWeek: 0,
      tracks: []
    }
  },
  {
    id: "rapper_20",
    name: "J. Colee", // Based on J. Cole
    image: "/assets/covers/rapper_20.jpg",
    bio: "Merging jazz influences with hip-hop sensibilities, J. Colee represents the sophisticated side of rap. His smooth delivery and thoughtful lyrics appeal to listeners looking for substance and musical innovation.",
    popularity: 72,
    monthlyListeners: 4000000,
    totalStreams: 145000000,
    style: "Jazz Rap",
    personality: "humble",
    featureCost: 38000,
    relationship: "neutral",
    collabHistory: {
      count: 0,
      lastWeek: 0,
      tracks: []
    }
  },
  {
    id: "rapper_21",
    name: "Travi$ Scott", // Based on Travis Scott
    image: "/assets/covers/rapper_21.jpg",
    bio: "A hitmaker with an impeccable ear for catchy hooks, Travi$ Scott consistently delivers chart-topping singles. His production skills and musical instincts have created a distinctive sound in modern trap.",
    popularity: 88,
    monthlyListeners: 26000000,
    totalStreams: 780000000,
    style: "Commercial Rap",
    personality: "arrogant",
    featureCost: 120000,
    relationship: "neutral",
    collabHistory: {
      count: 0,
      lastWeek: 0,
      tracks: []
    }
  },
  {
    id: "rapper_22",
    name: "Megan Thee Thoroughbred", // Based on Megan Thee Stallion
    image: "/assets/covers/rapper_22.jpg",
    bio: "Breaking barriers in the male-dominated rap scene, Megan Thee Thoroughbred combines fierce independence with undeniable skill. Her empowering messages inspire fans while her technical abilities silence critics.",
    popularity: 81,
    monthlyListeners: 8500000,
    totalStreams: 320000000,
    style: "Female Hip Hop",
    personality: "controversial",
    featureCost: 70000,
    relationship: "neutral",
    collabHistory: {
      count: 0,
      lastWeek: 0,
      tracks: []
    }
  },
  {
    id: "rapper_23",
    name: "Snoop Catt", // Based on Snoop Dogg
    image: "/assets/covers/rapper_23.jpg",
    bio: "Carrying the torch for California rap, Snoop Catt blends G-funk influences with modern production. His laid-back flow and regional pride have made him an icon in his city and beyond.",
    popularity: 84,
    monthlyListeners: 11000000,
    totalStreams: 400000000,
    style: "West Coast",
    personality: "friendly",
    featureCost: 80000,
    relationship: "neutral",
    collabHistory: {
      count: 0,
      lastWeek: 0,
      tracks: []
    }
  },
  {
    id: "rapper_24",
    name: "Tyler, The Inventor", // Based on Tyler, The Creator
    image: "/assets/covers/rapper_24.jpg",
    bio: "Bringing a playful energy and innovative approach to hip-hop, Tyler, The Inventor combines clever wordplay with unique production. His creative vision and artistic growth have built a diverse fanbase spanning multiple generations.",
    popularity: 86,
    monthlyListeners: 18000000,
    totalStreams: 650000000,
    style: "Alternative Rap",
    personality: "friendly",
    featureCost: 95000,
    relationship: "neutral",
    collabHistory: {
      count: 0,
      lastWeek: 0,
      tracks: []
    }
  }
];

// Song tier information
export const SONG_TIER_INFO = {
  1: {
    name: "Bad",
    description: "Poor quality song with no success potential",
    successChance: 0,
    popularityWeeks: 8,  // Significantly increased from 1 week
    cost: 500,
    minStreams: 0,
    maxStreams: 10000
  },
  2: {
    name: "Mid",
    description: "Average song with minimal success chance (1%)",
    successChance: 0.01,
    popularityWeeks: 12, // Significantly increased from 2 weeks
    cost: 1000,
    minStreams: 10000,
    maxStreams: 100000
  },
  3: {
    name: "Normal",
    description: "Decent song with moderate hit potential (25%)",
    successChance: 0.25,
    popularityWeeks: 20, // Significantly increased from 4 weeks
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
    maxStreams: 2000000000 // 2 billion streams cap (instead of unlimited)
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
