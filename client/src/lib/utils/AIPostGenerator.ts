import { AIRapper, CharacterInfo, SocialMediaPost, ViralStatus } from "../types";
import { v4 as uuidv4 } from 'uuid';

// AI Post Generator Service
// This service generates realistic social media posts for AI rappers

// Collection of post templates for different personalities
const postTemplates = {
  friendly: [
    "Just dropped a new track! Check it out 🔥 #NewMusic",
    "Grateful for all the support lately. Y'all are the best fans! ❤️",
    "In the studio working on something special... stay tuned 🎵",
    "Loving the vibes from {name}'s new album!",
    "Nothing but respect for {name} - true artist right there",
    "Who's coming to the show tonight? Can't wait to see you all!",
    "Man, the energy last night was CRAZY! Thanks to everyone who came out!",
    "Woke up feeling blessed today. Music is a gift 🙏",
    "Always remember where you came from. Staying humble 💯",
    "Shoutout to my day ones who've been rocking with me since the beginning!"
  ],
  arrogant: [
    "Nobody doing it like me right now. Period. 💯",
    "These numbers don't lie. I'm running this game 📈",
    "They studying my moves but can't copy the blueprint 🤷‍♂️",
    "{name} thinks they can touch my level? 😂",
    "Just heard {name}'s new track... I guess not everyone has the gift 🤦‍♂️",
    "Another day, another million. Business as usual 💰",
    "The difference between me and them? Talent. Simple as that.",
    "Awards are cool but we know who really runs this industry 👑",
    "They call it arrogant, I call it confident. Stay mad about it.",
    "Don't compare me to these new artists. I'm built different."
  ],
  mysterious: [
    "...",
    "The truth is always hidden in plain sight 👁️",
    "New chapter soon...",
    "Silence speaks louder than words sometimes",
    "Do you ever wonder what's real and what's fabricated?",
    "All will be revealed in time ⏳",
    "Some things are better left unsaid",
    "Watching from the shadows 🌑",
    "The industry has secrets that would shock you",
    "Been gone for a reason. Coming back for a bigger one."
  ],
  controversial: [
    "They trying to cancel me but I'm still here 🤷‍♂️",
    "Y'all gonna be mad about this one too... 😈",
    "Tired of all this fake outrage. Keep that same energy for real issues",
    "Just spoke my mind in the booth. If you're offended, good.",
    "Everybody got an opinion until I drop these facts 🎤",
    "The mainstream media won't tell you this but...",
    "Not here to be liked. Here to be heard. Big difference.",
    "Some of y'all need to stop being so sensitive fr",
    "Controversy sells but truth is priceless 💯",
    "They hate me because I say what everyone's thinking"
  ],
  humble: [
    "So grateful for this journey 🙏",
    "None of this happens without you all. Thank you ❤️",
    "Blessed to wake up and do what I love every day",
    "Big respect to {name} for the inspiration",
    "We all stand on the shoulders of giants. Salute to the legends who paved the way",
    "Still can't believe how far we've come. Thank you for believing in me",
    "Every stream, every purchase, every share means the world to me",
    "Just a kid with a dream that came true because of y'all",
    "Remembering the days when nobody believed... stay humble",
    "Success means nothing without the people who helped you get there 💯"
  ]
};

// Collection of controversial posts for the controversial personality
const controversialPosts = [
  "The music industry is rigged. Labels picking winners and losers behind closed doors 🤫",
  "Streams are being manipulated. The numbers you see aren't real 👁️",
  "These 'critics' get paid to praise certain artists. It's all a game 🎮",
  "Most of these rappers don't even write their own stuff. I keep it 100% authentic 📝",
  "Awards are bought, not earned. Change my mind.",
  "The real talent is underground. Mainstream is just what they let you hear 🔊",
  "Half these collabs happening because of label politics, not actual creativity",
  "Social media numbers can be bought. Don't be fooled by fake engagement 🤖",
  "I turned down a major deal because they wanted to control my message. Freedom over fame.",
  "They tried to get me to compromise my sound for radio play. I said no. Integrity matters."
];

// Collection of response posts based on current game week events
const weeklyResponsePosts = [
  "Chart positions don't define art. Real ones know 💯",
  "Imagine copying someone's flow and calling it innovation 🙄",
  "That new album by {name} though... 🔥🔥🔥",
  "Sometimes silence is the best response to all this noise",
  "My numbers went crazy this week! Thanks for streaming 📈",
  "Festival season approaching... who's ready? 🎪",
  "These blogs don't even listen before they review anymore",
  "The tour starts next month! Tickets selling fast 🎫",
  "Just heard I'm nominated! Blessed regardless of the outcome 🏆",
  "Been working on this album for months. Can't wait to share it with y'all"
];

// Helper function to generate a random post
const getRandomPost = (posts: string[]): string => {
  const randomIndex = Math.floor(Math.random() * posts.length);
  return posts[randomIndex];
};

// Helper function to replace placeholders in templates
const replacePlaceholders = (template: string, rapper: AIRapper, playerRapper?: CharacterInfo | null): string => {
  let result = template;
  
  // Replace rapper name
  if (template.includes("{name}") && playerRapper) {
    result = result.replace("{name}", playerRapper.artistName);
  }
  
  return result;
};

// Function to determine viral status based on rapper popularity and randomness
const determineViralStatus = (popularity: number): ViralStatus => {
  const random = Math.random() * 100;
  
  if (popularity > 80 && random > 70) return "super_viral";
  if (popularity > 60 && random > 60) return "viral";
  if (popularity > 40 && random > 50) return "trending";
  return "not_viral";
};

// Generate engagement numbers based on popularity and viral status
const generateEngagement = (
  rapper: AIRapper, 
  viralStatus: ViralStatus
): { likes: number; comments: number; shares: number; viralMultiplier: number; followerGain: number } => {
  const baseFollowers = rapper.monthlyListeners / 10;
  const baseMultiplier = rapper.popularity / 20;
  
  let viralMultiplier = 1;
  switch (viralStatus) {
    case "super_viral":
      viralMultiplier = 10 + Math.random() * 15;
      break;
    case "viral":
      viralMultiplier = 5 + Math.random() * 5;
      break;
    case "trending":
      viralMultiplier = 2 + Math.random() * 3;
      break;
    default:
      viralMultiplier = 0.5 + Math.random() * 0.5;
  }
  
  const likesBase = baseFollowers * (0.05 + Math.random() * 0.1) * baseMultiplier;
  const commentsBase = likesBase * (0.02 + Math.random() * 0.05);
  const sharesBase = likesBase * (0.01 + Math.random() * 0.03);
  
  const likes = Math.floor(likesBase * viralMultiplier);
  const comments = Math.floor(commentsBase * viralMultiplier);
  const shares = Math.floor(sharesBase * viralMultiplier);
  
  // Calculate follower gain based on engagement
  const followerGain = Math.floor((likes + comments * 3 + shares * 5) * 0.01);
  
  return {
    likes,
    comments,
    shares,
    viralMultiplier,
    followerGain
  };
};

// Main function to generate a social media post for an AI rapper
export const generateAIRapperPost = (
  rapper: AIRapper,
  platform: string,
  currentWeek: number,
  playerRapper: CharacterInfo | null = null,
  isResponseToPlayer: boolean = false,
  customContent?: string
): SocialMediaPost => {
  // Determine personality-based content
  const personality = rapper.personality || "friendly";
  let content = "";
  
  if (customContent) {
    content = customContent;
  } else if (isResponseToPlayer) {
    content = replacePlaceholders(getRandomPost(weeklyResponsePosts), rapper, playerRapper);
  } else if (personality === "controversial" && Math.random() > 0.7) {
    content = getRandomPost(controversialPosts);
  } else {
    // @ts-ignore - We know these properties exist
    content = replacePlaceholders(getRandomPost(postTemplates[personality]), rapper, playerRapper);
  }
  
  // Determine viral status
  const viralStatus = determineViralStatus(rapper.popularity);
  
  // Generate engagement metrics
  const engagement = generateEngagement(rapper, viralStatus);
  
  // Create the post object
  const post: SocialMediaPost = {
    id: uuidv4(),
    platformName: platform,
    content,
    postWeek: currentWeek,
    date: new Date(),
    likes: engagement.likes,
    comments: engagement.comments,
    shares: engagement.shares,
    viralStatus,
    viralMultiplier: engagement.viralMultiplier,
    followerGain: engagement.followerGain,
    reputationGain: 0, // This could be calculated based on interactions with player
    wealthGain: 0 // Same here
  };
  
  // Optionally add an image
  if (Math.random() > 0.6) {
    const imageNumber = Math.floor(Math.random() * 6) + 1;
    post.image = `/assets/covers/cover${imageNumber}.svg`;
  }
  
  return post;
};

// Generate a batch of posts for a given week
export const generateWeeklyAIPosts = (
  rappers: AIRapper[],
  platform: string,
  currentWeek: number,
  playerRapper: CharacterInfo | null = null
): SocialMediaPost[] => {
  const posts: SocialMediaPost[] = [];
  
  // Each rapper has a chance to post
  rappers.forEach(rapper => {
    // Base chance to post in a given week
    const postChance = 0.7 + (rapper.popularity / 100) * 0.3;
    
    if (Math.random() < postChance) {
      // Each rapper can post 1-3 times per week
      const postCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < postCount; i++) {
        // Determine if this post is a response to the player (small chance)
        const isResponse = Math.random() < 0.15 && playerRapper !== null;
        
        posts.push(generateAIRapperPost(
          rapper,
          platform,
          currentWeek,
          playerRapper,
          isResponse
        ));
      }
    }
  });
  
  return posts;
};

// Generate a specific response from an AI rapper to a player's post or action
export const generateAIRapperResponse = (
  rapper: AIRapper,
  platform: string,
  currentWeek: number,
  playerRapper: CharacterInfo | null,
  responseType: 'positive' | 'negative' | 'neutral' = 'neutral',
  customContent?: string
): SocialMediaPost => {
  let content = customContent;
  
  if (!content) {
    // Generate based on response type
    if (responseType === 'positive') {
      const positiveResponses = [
        `Just listened to ${playerRapper?.artistName}'s new track. Pure fire! 🔥`,
        `Big respect to ${playerRapper?.artistName} for keeping it real always! 💯`,
        `${playerRapper?.artistName} really showing everybody how it's done!`,
        `Need that collab with ${playerRapper?.artistName} ASAP! Who's with me?`,
        `That flow on ${playerRapper?.artistName}'s latest? Insane talent right there 🙌`
      ];
      content = getRandomPost(positiveResponses);
    } else if (responseType === 'negative') {
      const negativeResponses = [
        `Heard that new track by ${playerRapper?.artistName}... I guess not everyone has the same standards 🤷‍♂️`,
        `${playerRapper?.artistName} talking big but the music not matching the energy...`,
        `Y'all really hyping up ${playerRapper?.artistName} like that? Industry plant vibes 👀`,
        `Been in this game long enough to know what's authentic. ${playerRapper?.artistName} ain't it.`,
        `${playerRapper?.artistName} dropping mid and y'all calling it revolutionary? Come on now`
      ];
      content = getRandomPost(negativeResponses);
    } else {
      const neutralResponses = [
        `Interesting approach from ${playerRapper?.artistName} on that new joint.`,
        `Watching ${playerRapper?.artistName}'s moves in the industry. Taking notes.`,
        `${playerRapper?.artistName} doing their thing. Respect the hustle regardless.`,
        `The game needs different styles. ${playerRapper?.artistName} bringing something different.`,
        `Curious to see where ${playerRapper?.artistName} goes from here`
      ];
      content = getRandomPost(neutralResponses);
    }
  }
  
  return generateAIRapperPost(
    rapper,
    platform,
    currentWeek,
    playerRapper,
    true,
    content
  );
};

export default {
  generateAIRapperPost,
  generateWeeklyAIPosts,
  generateAIRapperResponse
};