import { GameState, RandomEvent, Song } from '../types';

// A collection of random events that can occur during the game
export const generateRandomEvents = (): RandomEvent[] => {
  return [
    {
      id: "event_1",
      title: "Viral Social Media Moment",
      description: "One of your social media posts has gone viral unexpectedly!",
      options: [
        {
          text: "Capitalize on the moment with new content",
          effect: (state: GameState): GameState => {
            const updatedState = { ...state };
            // Increase followers across platforms
            updatedState.socialMedia = state.socialMedia.map(platform => ({
              ...platform,
              followers: Math.floor(platform.followers * 1.2) // 20% follower boost
            }));
            
            // Boost streaming numbers on latest song
            if (updatedState.songs.length > 0) {
              const latestSongIndex = updatedState.songs.length - 1;
              updatedState.songs[latestSongIndex] = {
                ...updatedState.songs[latestSongIndex],
                streams: Math.floor(updatedState.songs[latestSongIndex].streams * 1.5) // 50% stream boost
              };
            }
            
            // Increase marketing stat
            updatedState.stats = {
              ...updatedState.stats,
              marketing: Math.min(100, updatedState.stats.marketing + 5)
            };
            
            return updatedState;
          }
        },
        {
          text: "Ignore it and focus on your music",
          effect: (state: GameState): GameState => {
            const updatedState = { ...state };
            // Small boost to creativity
            updatedState.stats = {
              ...updatedState.stats,
              creativity: Math.min(100, updatedState.stats.creativity + 3)
            };
            return updatedState;
          }
        }
      ],
      resolved: false
    },
    {
      id: "event_2",
      title: "Record Label Offer",
      description: "A record label has approached you with a contract offer!",
      options: [
        {
          text: "Sign the deal for immediate cash and exposure",
          effect: (state: GameState): GameState => {
            const updatedState = { ...state };
            // Immediate wealth boost
            updatedState.stats = {
              ...updatedState.stats,
              wealth: updatedState.stats.wealth + 50000,
              reputation: Math.min(100, updatedState.stats.reputation + 15)
            };
            
            // Boost streaming platform presence
            updatedState.streamingPlatforms = state.streamingPlatforms.map(platform => ({
              ...platform,
              listeners: Math.floor(platform.listeners * 1.5) // 50% listener boost
            }));
            
            return updatedState;
          }
        },
        {
          text: "Stay independent to maintain creative control",
          effect: (state: GameState): GameState => {
            const updatedState = { ...state };
            // Boost reputation with fans for staying true
            updatedState.stats = {
              ...updatedState.stats,
              fanLoyalty: Math.min(100, updatedState.stats.fanLoyalty + 10),
              creativity: Math.min(100, updatedState.stats.creativity + 5)
            };
            return updatedState;
          }
        }
      ],
      resolved: false
    },
    {
      id: "event_3",
      title: "Studio Equipment Failure",
      description: "Your recording equipment has malfunctioned right before an important session!",
      options: [
        {
          text: "Invest in new high-quality equipment",
          effect: (state: GameState): GameState => {
            const updatedState = { ...state };
            // Expense for new equipment
            updatedState.stats = {
              ...updatedState.stats,
              wealth: Math.max(0, updatedState.stats.wealth - 5000),
              creativity: Math.min(100, updatedState.stats.creativity + 8)
            };
            return updatedState;
          }
        },
        {
          text: "Use a friend's studio temporarily",
          effect: (state: GameState): GameState => {
            const updatedState = { ...state };
            // Networking boost but slight creativity hit
            updatedState.stats = {
              ...updatedState.stats,
              networking: Math.min(100, updatedState.stats.networking + 5),
              creativity: Math.max(0, updatedState.stats.creativity - 2)
            };
            return updatedState;
          }
        }
      ],
      resolved: false
    },
    {
      id: "event_4",
      title: "Beef with Another Artist",
      description: `${getRandomAIRapperName()} has dissed you in their latest track!`,
      options: [
        {
          text: "Respond with a diss track",
          effect: (state: GameState): GameState => {
            const updatedState = { ...state };
            // Create a new diss track
            const newSong: Song = {
              id: `song_diss_${Date.now()}`,
              title: `Diss Track (${state.currentWeek})`,
              tier: 3 as const, // Diss tracks are usually tier 3
              releaseDate: state.currentWeek,
              streams: 50000, // Initial streams
              isActive: true,
              featuring: [],
              released: true, // Auto-released as a diss track response
              icon: "fire", // Diss tracks are hot
              releasePlatforms: ["Spotify", "SoundCloud"] // Standard platforms for quick release
            };
            
            updatedState.songs = [...state.songs, newSong];
            
            // Update relationships
            const targetRapperIndex = Math.floor(Math.random() * updatedState.aiRappers.length);
            if (updatedState.aiRappers[targetRapperIndex]) {
              updatedState.aiRappers[targetRapperIndex] = {
                ...updatedState.aiRappers[targetRapperIndex],
                relationshipStatus: "enemy"
              };
            }
            
            // Increase social media attention
            updatedState.socialMedia = state.socialMedia.map(platform => ({
              ...platform,
              followers: Math.floor(platform.followers * 1.1) // 10% follower boost from drama
            }));
            
            return updatedState;
          }
        },
        {
          text: "Ignore it and stay above the drama",
          effect: (state: GameState): GameState => {
            const updatedState = { ...state };
            // Small reputation boost for maturity
            updatedState.stats = {
              ...updatedState.stats,
              reputation: Math.min(100, updatedState.stats.reputation + 3),
              fanLoyalty: Math.min(100, updatedState.stats.fanLoyalty + 2)
            };
            return updatedState;
          }
        }
      ],
      resolved: false
    },
    {
      id: "event_5",
      title: "Feature Opportunity",
      description: `A major artist wants to feature you on their upcoming track!`,
      // Make this event only appear for artists with at least some reputation
      requiresStats: {
        reputation: 30 // Only artists with at least 30 reputation get feature opportunities
      },
      options: [
        {
          text: "Accept the feature opportunity",
          effect: (state: GameState): GameState => {
            const updatedState = { ...state };
            
            // Boost reputation and networking
            updatedState.stats = {
              ...updatedState.stats,
              reputation: Math.min(100, updatedState.stats.reputation + 10),
              networking: Math.min(100, updatedState.stats.networking + 8),
              wealth: updatedState.stats.wealth + 15000 // Payment for feature
            };
            
            // Gain new listeners
            updatedState.streamingPlatforms = state.streamingPlatforms.map(platform => ({
              ...platform,
              listeners: Math.floor(platform.listeners * 1.2) // 20% listener boost
            }));
            
            return updatedState;
          }
        },
        {
          text: "Decline to focus on your own music",
          effect: (state: GameState): GameState => {
            const updatedState = { ...state };
            // Focus on creativity
            updatedState.stats = {
              ...updatedState.stats,
              creativity: Math.min(100, updatedState.stats.creativity + 5)
            };
            return updatedState;
          }
        }
      ],
      resolved: false
    },
    {
      id: "event_6",
      title: "Controversial Interview",
      description: "During an interview, you made a controversial statement that's getting attention!",
      options: [
        {
          text: "Apologize and clarify your statement",
          effect: (state: GameState): GameState => {
            const updatedState = { ...state };
            // Minimal reputation damage
            updatedState.stats = {
              ...updatedState.stats,
              reputation: Math.max(0, updatedState.stats.reputation - 2)
            };
            return updatedState;
          }
        },
        {
          text: "Double down and embrace the controversy",
          effect: (state: GameState): GameState => {
            const updatedState = { ...state };
            // High risk, high reward
            const reputationChange = Math.random() > 0.5 ? 10 : -15;
            
            updatedState.stats = {
              ...updatedState.stats,
              reputation: Math.max(0, Math.min(100, updatedState.stats.reputation + reputationChange))
            };
            
            // More social media attention regardless
            updatedState.socialMedia = state.socialMedia.map(platform => ({
              ...platform,
              followers: Math.floor(platform.followers * 1.15) // 15% follower boost from controversy
            }));
            
            return updatedState;
          }
        }
      ],
      resolved: false
    },
    {
      id: "event_7",
      title: "Producer Collaboration Offer",
      description: "A famous producer wants to work with you on your next project!",
      options: [
        {
          text: "Pay for their premium services",
          effect: (state: GameState): GameState => {
            const updatedState = { ...state };
            // Pay for premium production
            updatedState.stats = {
              ...updatedState.stats,
              wealth: Math.max(0, updatedState.stats.wealth - 10000),
              creativity: Math.min(100, updatedState.stats.creativity + 15)
            };
            return updatedState;
          }
        },
        {
          text: "Negotiate a royalty deal instead",
          effect: (state: GameState): GameState => {
            const updatedState = { ...state };
            // No upfront cost but less future revenue
            updatedState.stats = {
              ...updatedState.stats,
              creativity: Math.min(100, updatedState.stats.creativity + 8)
            };
            
            // Lower revenue on streaming platforms
            updatedState.streamingPlatforms = state.streamingPlatforms.map(platform => ({
              ...platform,
              revenue: Math.floor(platform.revenue * 0.9) // 10% revenue reduction for royalties
            }));
            
            return updatedState;
          }
        }
      ],
      resolved: false
    },
    {
      id: "event_8",
      title: "Marketing Campaign Opportunity",
      description: "A marketing agency offers to run a campaign for your latest release!",
      options: [
        {
          text: "Invest in the full campaign",
          effect: (state: GameState): GameState => {
            const updatedState = { ...state };
            // Expensive but effective
            updatedState.stats = {
              ...updatedState.stats,
              wealth: Math.max(0, updatedState.stats.wealth - 7500),
              marketing: Math.min(100, updatedState.stats.marketing + 12)
            };
            
            // Boost latest song
            if (updatedState.songs.length > 0) {
              const latestSongIndex = updatedState.songs.length - 1;
              updatedState.songs[latestSongIndex] = {
                ...updatedState.songs[latestSongIndex],
                streams: Math.floor(updatedState.songs[latestSongIndex].streams * 1.4) // 40% stream boost
              };
            }
            
            return updatedState;
          }
        },
        {
          text: "Run a smaller DIY campaign",
          effect: (state: GameState): GameState => {
            const updatedState = { ...state };
            // Less expensive, less effective
            updatedState.stats = {
              ...updatedState.stats,
              wealth: Math.max(0, updatedState.stats.wealth - 1500),
              marketing: Math.min(100, updatedState.stats.marketing + 5)
            };
            
            // Smaller boost to latest song
            if (updatedState.songs.length > 0) {
              const latestSongIndex = updatedState.songs.length - 1;
              updatedState.songs[latestSongIndex] = {
                ...updatedState.songs[latestSongIndex],
                streams: Math.floor(updatedState.songs[latestSongIndex].streams * 1.15) // 15% stream boost
              };
            }
            
            return updatedState;
          }
        }
      ],
      resolved: false
    },
    {
      id: "event_9",
      title: "Fashion Brand Partnership",
      description: "A popular clothing brand wants you to be the face of their new collection!",
      // Add requirement for higher reputation and career level for sponsorships
      requiresStats: {
        reputation: 50,
        careerLevel: 3 // Only established artists with career level 3+ get brand deals
      },
      options: [
        {
          text: "Accept the endorsement deal",
          effect: (state: GameState): GameState => {
            const updatedState = { ...state };
            // Significant income and reputation boost
            updatedState.stats = {
              ...updatedState.stats,
              wealth: updatedState.stats.wealth + 35000,
              reputation: Math.min(100, updatedState.stats.reputation + 8),
              marketing: Math.min(100, updatedState.stats.marketing + 6)
            };
            
            // Moderate social media growth
            updatedState.socialMedia = state.socialMedia.map(platform => ({
              ...platform,
              followers: Math.floor(platform.followers * 1.12) // 12% follower boost
            }));
            
            return updatedState;
          }
        },
        {
          text: "Launch your own fashion line instead",
          effect: (state: GameState): GameState => {
            const updatedState = { ...state };
            // High risk, high reward
            updatedState.stats = {
              ...updatedState.stats,
              wealth: Math.max(0, updatedState.stats.wealth - 20000), // Initial investment
              marketing: Math.min(100, updatedState.stats.marketing + 10)
            };
            
            // Random chance of success
            if (Math.random() > 0.4) { // 60% chance of success
              // Successful line
              updatedState.stats = {
                ...updatedState.stats,
                wealth: updatedState.stats.wealth + 50000,
                reputation: Math.min(100, updatedState.stats.reputation + 12),
              };
            } else {
              // Failed line
              updatedState.stats = {
                ...updatedState.stats,
                reputation: Math.max(0, updatedState.stats.reputation - 5),
              };
            }
            
            return updatedState;
          }
        }
      ],
      resolved: false
    },
    {
      id: "event_10",
      title: "Sampling Clearance Issue",
      description: "Your latest track contains a sample that the original artist is contesting!",
      options: [
        {
          text: "Pay for proper clearance",
          effect: (state: GameState): GameState => {
            const updatedState = { ...state };
            // Pay for clearance
            updatedState.stats = {
              ...updatedState.stats,
              wealth: Math.max(0, updatedState.stats.wealth - 12000),
            };
            
            // Small reputation boost for doing the right thing
            updatedState.stats = {
              ...updatedState.stats,
              reputation: Math.min(100, updatedState.stats.reputation + 3),
            };
            
            return updatedState;
          }
        },
        {
          text: "Re-record without the sample",
          effect: (state: GameState): GameState => {
            const updatedState = { ...state };
            
            // Affect your latest song's performance
            if (updatedState.songs.length > 0) {
              const latestSongIndex = updatedState.songs.length - 1;
              updatedState.songs[latestSongIndex] = {
                ...updatedState.songs[latestSongIndex],
                streams: Math.floor(updatedState.songs[latestSongIndex].streams * 0.85) // 15% stream reduction
              };
            }
            
            // Boost creativity from the challenge
            updatedState.stats = {
              ...updatedState.stats,
              creativity: Math.min(100, updatedState.stats.creativity + 5),
            };
            
            return updatedState;
          }
        }
      ],
      resolved: false
    },
    {
      id: "event_11",
      title: "Music Festival Invitation",
      description: "You've been invited to perform at a major music festival!",
      // Require some career progress for festival invitations
      requiresStats: {
        reputation: 40,
        careerLevel: 2 // At least level 2 for festival invitations
      },
      options: [
        {
          text: "Accept and prepare an amazing show",
          effect: (state: GameState): GameState => {
            const updatedState = { ...state };
            
            // Investment in the performance
            updatedState.stats = {
              ...updatedState.stats,
              wealth: Math.max(0, updatedState.stats.wealth - 5000), // Cost to prepare
              reputation: Math.min(100, updatedState.stats.reputation + 15),
              networking: Math.min(100, updatedState.stats.networking + 10)
            };
            
            // Significant boost to listeners
            updatedState.streamingPlatforms = state.streamingPlatforms.map(platform => ({
              ...platform,
              listeners: Math.floor(platform.listeners * 1.3), // 30% listener boost
              revenue: Math.floor(platform.revenue * 1.25) // 25% revenue boost
            }));
            
            // Social media follower boost
            updatedState.socialMedia = state.socialMedia.map(platform => ({
              ...platform,
              followers: Math.floor(platform.followers * 1.2) // 20% follower boost
            }));
            
            return updatedState;
          }
        },
        {
          text: "Decline to focus on studio work",
          effect: (state: GameState): GameState => {
            const updatedState = { ...state };
            
            // Focus on creating more music
            updatedState.stats = {
              ...updatedState.stats,
              creativity: Math.min(100, updatedState.stats.creativity + 8),
            };
            
            // Small reputation hit for missing opportunity
            updatedState.stats = {
              ...updatedState.stats,
              reputation: Math.max(0, updatedState.stats.reputation - 3),
            };
            
            return updatedState;
          }
        }
      ],
      resolved: false
    },
    {
      id: "event_12",
      title: "Streaming Platform Exclusive Deal",
      description: "A major streaming platform wants to make your next release exclusive for two weeks.",
      // Require higher reputation for platform deals
      requiresStats: {
        reputation: 55,
        careerLevel: 3 // Only established artists get exclusive deals
      },
      options: [
        {
          text: "Accept the exclusive deal",
          effect: (state: GameState): GameState => {
            const updatedState = { ...state };
            
            // Significant upfront payment
            updatedState.stats = {
              ...updatedState.stats,
              wealth: updatedState.stats.wealth + 25000,
            };
            
            // Boost one platform's stats but hurt others
            const platformIndex = Math.floor(Math.random() * updatedState.streamingPlatforms.length);
            updatedState.streamingPlatforms = updatedState.streamingPlatforms.map((platform, index) => {
              if (index === platformIndex) {
                return {
                  ...platform,
                  listeners: Math.floor(platform.listeners * 1.4), // 40% boost to exclusive platform
                  revenue: Math.floor(platform.revenue * 1.5), // 50% revenue boost
                };
              } else {
                return {
                  ...platform,
                  listeners: Math.floor(platform.listeners * 0.9), // 10% reduction to other platforms
                };
              }
            });
            
            return updatedState;
          }
        },
        {
          text: "Release on all platforms simultaneously",
          effect: (state: GameState): GameState => {
            const updatedState = { ...state };
            
            // Fan loyalty boost for not playing favorites
            updatedState.stats = {
              ...updatedState.stats,
              fanLoyalty: Math.min(100, updatedState.stats.fanLoyalty + 8),
            };
            
            // Small boost across all platforms
            updatedState.streamingPlatforms = state.streamingPlatforms.map(platform => ({
              ...platform,
              listeners: Math.floor(platform.listeners * 1.05), // 5% listener boost across all platforms
            }));
            
            return updatedState;
          }
        }
      ],
      resolved: false
    }
  ];
};

// Helper function to get a random AI rapper name for events
function getRandomAIRapperName(): string {
  const names = [
    "21 Sawage", "Lil Bhaby", "Drakke", "Lil Druk", "King Vhon", "MC Flow", "Young Money", "Rhyme Master",
    "Post Baloney", "Jaye-Z", "Emindeed", "Chancy the Producer", "Doja Mouse", "Micki Nichaj", "Capital Letters", "Mack Lemur"
  ];
  return names[Math.floor(Math.random() * names.length)];
}

// Generate a random event for the current week
export const getRandomEventForWeek = (currentEvents: RandomEvent[], resolvedEvents: string[]): RandomEvent | null => {
  // Get all events that are not currently active or already resolved
  const allEvents = generateRandomEvents();
  const availableEvents = allEvents.filter(event => 
    !currentEvents.some(e => e.id === event.id) && 
    !resolvedEvents.includes(event.id)
  );
  
  // 5% chance of getting an event each week (decreased from 25%)
  if (Math.random() < 0.05 && availableEvents.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableEvents.length);
    return availableEvents[randomIndex];
  }
  
  return null;
};
