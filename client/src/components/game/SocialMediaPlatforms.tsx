import React, { useState } from 'react';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { SocialMediaPost } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

// Social Media Platform Icons
const InstagramIcon = ({ size = 24, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const TwitterIcon = ({ size = 24, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const TikTokIcon = ({ size = 24, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
    <path d="M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path>
    <path d="M15 8v8a4 4 0 0 1-4 4"></path>
    <line x1="15" y1="4" x2="15" y2="12"></line>
  </svg>
);

export function SocialMediaPlatforms() {
  const { 
    character, 
    socialMediaStats, 
    updateSocialMediaStats,
    stats,
    updateCharacter, 
    setScreen, 
    currentWeek,
  } = useRapperGame();
  
  // Extract stats directly
  const wealth = stats.wealth;
  const reputation = stats.reputation;
  
  // Function to update wealth
  const updateWealth = (amount: number) => {
    const currentStats = { ...stats };
    currentStats.wealth += amount;
    useRapperGame.setState({ stats: currentStats });
  };
  
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState('');
  const [postCost, setPostCost] = useState(0);
  const [postType, setPostType] = useState('regular');
  
  // Initialize social media stats if they don't exist
  const instagram = socialMediaStats?.instagram || { 
    followers: 0, 
    posts: [], 
    handle: character?.artistName?.toLowerCase().replace(/\\s+/g, '') || 'artist',
    verified: false, 
    engagement: 0
  };
  
  const twitter = socialMediaStats?.twitter || { 
    followers: 0, 
    tweets: [], 
    handle: character?.artistName?.toLowerCase().replace(/\\s+/g, '') || 'artist',
    verified: false, 
    engagement: 0
  };
  
  const tiktok = socialMediaStats?.tiktok || { 
    followers: 0, 
    videos: [], 
    handle: character?.artistName?.toLowerCase().replace(/\\s+/g, '') || 'artist',
    verified: false, 
    engagement: 0
  };

  // Format functions
  const formatNumber = (num: number): string => {
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(1) + 'B';
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + 'M';
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate post cost and potential gain based on platform and type
  const calculatePostMetrics = (platform: string, type: string) => {
    let cost = 0;
    let potentialFollowers = 0;
    
    // Base cost and potential for regular posts
    switch (platform) {
      case 'instagram':
        cost = 500;
        potentialFollowers = 1000 + Math.floor(reputation * 50);
        break;
      case 'twitter':
        cost = 300;
        potentialFollowers = 800 + Math.floor(reputation * 40);
        break;
      case 'tiktok':
        cost = 700;
        potentialFollowers = 1500 + Math.floor(reputation * 60);
        break;
    }
    
    // Modify for sponsored/promoted content
    if (type === 'sponsored') {
      cost = cost * 3;
      potentialFollowers = Math.floor(potentialFollowers * 2.5);
    }
    
    return { cost, potentialFollowers };
  };

  // Create a new post
  const createPost = () => {
    if (postContent.trim() === '') {
      alert('Post content cannot be empty!');
      return;
    }
    
    const { cost, potentialFollowers } = calculatePostMetrics(selectedPlatform, postType);
    
    // Check if player can afford it
    if (wealth < cost) {
      alert('Not enough money to create this post!');
      return;
    }
    
    // Create the post
    const newPost: SocialMediaPost = {
      id: Date.now().toString(),
      platformName: selectedPlatform,
      content: postContent,
      image: postImage,
      postWeek: currentWeek,
      date: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      viralStatus: "not_viral",
      viralMultiplier: 1,
      followerGain: 0,
      reputationGain: 0,
      type: postType as 'regular' | 'sponsored' | 'announcement',
      wealthGain: 0
    };
    
    // Update social media stats based on platform
    const updatedStats = { ...socialMediaStats };
    
    const randomEngagement = Math.random() * 0.3 + 0.7; // 0.7 to 1.0 random factor
    const followerGain = Math.floor(potentialFollowers * randomEngagement);
    
    switch (selectedPlatform) {
      case 'instagram':
        updatedStats.instagram = {
          ...instagram,
          followers: instagram.followers + followerGain,
          posts: [newPost, ...(instagram.posts || [])]
        };
        break;
      case 'twitter':
        updatedStats.twitter = {
          ...twitter,
          followers: twitter.followers + followerGain,
          tweets: [newPost, ...(twitter.tweets || [])]
        };
        break;
      case 'tiktok':
        updatedStats.tiktok = {
          ...tiktok,
          followers: tiktok.followers + followerGain,
          videos: [newPost, ...(tiktok.videos || [])]
        };
        break;
    }
    
    // Update state
    updateSocialMediaStats(updatedStats);
    updateWealth(-cost);
    
    // Update post engagement (likes, comments, etc.)
    setTimeout(() => {
      updatePostEngagement(newPost.id, selectedPlatform);
    }, 500);
    
    // Close dialog and reset
    setShowPostDialog(false);
    setPostContent('');
    setPostImage('');
    setPostType('regular');
  };

  // Update post engagement over time
  const updatePostEngagement = (postId: string, platform: string) => {
    if (!socialMediaStats) return;
    
    const updatedStats = { ...socialMediaStats };
    
    let posts: SocialMediaPost[] = [];
    let followers = 0;
    
    // Get the right data for the platform
    if (platform === 'instagram' && updatedStats.instagram) {
      posts = updatedStats.instagram.posts || [];
      followers = instagram.followers;
    } else if (platform === 'twitter' && updatedStats.twitter) {
      posts = updatedStats.twitter.tweets || [];
      followers = twitter.followers;
    } else if (platform === 'tiktok' && updatedStats.tiktok) {
      posts = updatedStats.tiktok.videos || [];
      followers = tiktok.followers;
    } else {
      return;
    }
    
    // Find the post to update
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;
    
    const post = posts[postIndex];
    
    // Calculate engagement based on followers and reputation
    const likeRate = (Math.random() * 0.2 + 0.1) * (1 + (reputation / 100)); // 10-30% of followers like
    const commentRate = (Math.random() * 0.05 + 0.01) * (1 + (reputation / 200)); // 1-6% of followers comment
    const shareRate = (Math.random() * 0.02 + 0.005) * (1 + (reputation / 300)); // 0.5-2.5% of followers share
    
    const likes = Math.floor(followers * likeRate);
    const comments = Math.floor(followers * commentRate);
    const shares = Math.floor(followers * shareRate);
    const views = Math.floor(followers * (Math.random() * 3 + 2)); // 2-5x followers view
    
    // Update the post
    const updatedPost: SocialMediaPost = {
      ...post,
      likes,
      comments,
      shares,
      views
    };
    
    // Update the array of posts in the correct platform
    if (platform === 'instagram' && updatedStats.instagram) {
      const updatedPosts = [...updatedStats.instagram.posts];
      updatedPosts[postIndex] = updatedPost;
      updatedStats.instagram.posts = updatedPosts;
    } else if (platform === 'twitter' && updatedStats.twitter) {
      const updatedTweets = [...updatedStats.twitter.tweets];
      updatedTweets[postIndex] = updatedPost;
      updatedStats.twitter.tweets = updatedTweets;
    } else if (platform === 'tiktok' && updatedStats.tiktok) {
      const updatedVideos = [...updatedStats.tiktok.videos];
      updatedVideos[postIndex] = updatedPost;
      updatedStats.tiktok.videos = updatedVideos;
    }
    
    // Update social media stats
    updateSocialMediaStats(updatedStats);
  };

  // Verify account (costs money)
  const verifyAccount = (platform: string) => {
    const verificationCost = 50000; // $50k to verify
    
    if (wealth < verificationCost) {
      alert('Not enough money to verify your account!');
      return;
    }
    
    const updatedStats = { ...socialMediaStats };
    
    switch (platform) {
      case 'instagram':
        updatedStats.instagram = {
          ...instagram,
          verified: true
        };
        break;
      case 'twitter':
        updatedStats.twitter = {
          ...twitter,
          verified: true
        };
        break;
      case 'tiktok':
        updatedStats.tiktok = {
          ...tiktok,
          verified: true
        };
        break;
    }
    
    updateSocialMediaStats(updatedStats);
    updateWealth(-verificationCost);
  };

  // Get content array based on platform
  const getPlatformContent = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return instagram.posts || [];
      case 'twitter':
        return twitter.tweets || [];
      case 'tiktok':
        return tiktok.videos || [];
      default:
        return [];
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 to-black text-white p-4 overflow-y-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center">
          <InstagramIcon size={28} className="mr-2 text-pink-500 flex-shrink-0" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Social Media</h1>
            <p className="text-xs sm:text-sm text-gray-400">Grow your audience and engage with fans</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="bg-transparent border-gray-600 hover:bg-gray-800 mt-1 sm:mt-0 text-sm py-1 h-auto"
          onClick={() => setScreen('career_dashboard')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left mr-2">
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>
          Back to Dashboard
        </Button>
      </div>
      
      <Tabs 
        value={selectedPlatform} 
        onValueChange={setSelectedPlatform}
        className="space-y-6"
      >
        <TabsList className="bg-gray-950 border border-gray-800 w-full flex flex-wrap">
          <TabsTrigger value="instagram" className="data-[state=active]:bg-pink-700 flex-1 text-sm">
            <InstagramIcon size={16} className="mr-1 text-pink-500" />
            Instagram
          </TabsTrigger>
          <TabsTrigger value="twitter" className="data-[state=active]:bg-blue-700 flex-1 text-sm">
            <TwitterIcon size={16} className="mr-1 text-blue-400" />
            Twitter
          </TabsTrigger>
          <TabsTrigger value="tiktok" className="data-[state=active]:bg-black flex-1 text-sm">
            <TikTokIcon size={16} className="mr-1 text-white" />
            TikTok
          </TabsTrigger>
        </TabsList>
        
        {/* Instagram Platform */}
        <TabsContent value="instagram" className="space-y-6">
          <Card className="bg-[#121212] border-[#262626] overflow-hidden">
            <div className="flex flex-col h-full">
              {/* Instagram Header */}
              <div className="flex items-center justify-between bg-[#121212] px-4 py-3 border-b border-[#262626]">
                <div className="flex items-center">
                  <InstagramIcon size={24} className="text-pink-500" />
                  <span className="ml-2 font-bold text-white">Instagram</span>
                </div>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    className="h-8 text-white hover:bg-[#262626] p-2"
                    onClick={() => setShowPostDialog(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <path d="M12 8v8" />
                      <path d="M8 12h8" />
                    </svg>
                  </Button>
                </div>
              </div>
              
              {/* Instagram Profile */}
              <CardContent className="p-0 overflow-y-auto">
                <div className="p-4 border-b border-[#262626]">
                  <div className="flex items-start">
                    <div className="mr-6">
                      {character?.image ? (
                        <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-pink-500">
                          <img src={character.image} alt={character.artistName} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-20 w-20 bg-gray-800 rounded-full flex items-center justify-center border-2 border-pink-500">
                          <span className="text-3xl font-bold text-pink-500">{character?.artistName?.charAt(0).toUpperCase() || 'A'}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-lg font-semibold">@{instagram.handle}</h2>
                        {instagram.verified && (
                          <span className="bg-blue-500 text-white p-1 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
                        <div>
                          <span className="font-semibold">{formatNumber(instagram.posts?.length || 0)}</span> posts
                        </div>
                        <div>
                          <span className="font-semibold">{formatNumber(instagram.followers)}</span> followers
                        </div>
                        <div>
                          <span className="font-semibold">0</span> following
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-[#262626] hover:bg-[#363636] text-white border-0"
                          onClick={() => setShowPostDialog(true)}
                        >
                          Create Post
                        </Button>
                        
                        {!instagram.verified && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-blue-500 hover:bg-blue-600 text-white border-0"
                            onClick={() => verifyAccount('instagram')}
                          >
                            Get Verified ($50,000)
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Instagram Posts */}
                <div className="grid grid-cols-3 gap-1">
                  {getPlatformContent('instagram').length > 0 ? (
                    getPlatformContent('instagram').map((post: any) => (
                      <div key={post.id} className="aspect-square bg-[#262626] relative">
                        {post.image ? (
                          <img src={post.image} alt="Post" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white p-3 text-xs overflow-hidden">
                            {post.content.slice(0, 50)}{post.content.length > 50 ? '...' : ''}
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 text-white text-xs flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                          {formatNumber(post.likes)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 py-8 text-center text-gray-400">
                      No posts yet. Create your first post to start building your Instagram presence!
                    </div>
                  )}
                </div>
              </CardContent>
            </div>
          </Card>
        </TabsContent>
        
        {/* Twitter Platform */}
        <TabsContent value="twitter" className="space-y-6">
          <Card className="bg-black border-[#2F3336] overflow-hidden">
            <div className="flex flex-col h-full">
              {/* Twitter Header */}
              <div className="flex items-center justify-between bg-black px-4 py-3 border-b border-[#2F3336]">
                <div className="flex items-center">
                  <TwitterIcon size={24} className="text-blue-400" />
                  <span className="ml-2 font-bold text-white">Twitter</span>
                </div>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    className="h-8 text-white hover:bg-[#181818] p-2"
                    onClick={() => setShowPostDialog(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </Button>
                </div>
              </div>
              
              {/* Twitter Profile */}
              <CardContent className="p-0 overflow-y-auto">
                <div className="relative">
                  {/* Banner */}
                  <div className="h-32 bg-blue-800 relative">
                    {character?.coverImage && (
                      <img src={character.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    )}
                  </div>
                  
                  {/* Profile Info */}
                  <div className="px-4 pt-14 pb-4 border-b border-[#2F3336] relative">
                    {/* Profile Picture */}
                    <div className="absolute -top-12 left-4">
                      {character?.image ? (
                        <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-black">
                          <img src={character.image} alt={character.artistName} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-20 w-20 bg-gray-800 rounded-full flex items-center justify-center border-4 border-black">
                          <span className="text-3xl font-bold text-blue-400">{character?.artistName?.charAt(0).toUpperCase() || 'A'}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end mb-4">
                      {!twitter.verified ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-blue-500 hover:bg-blue-600 text-white border-0"
                          onClick={() => verifyAccount('twitter')}
                        >
                          Get Verified ($50,000)
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-500 text-blue-500 hover:bg-blue-950"
                          onClick={() => setShowPostDialog(true)}
                        >
                          Tweet
                        </Button>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center gap-1">
                        <h2 className="text-xl font-bold">{character?.artistName}</h2>
                        {twitter.verified && (
                          <span className="bg-blue-500 text-white p-1 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <div className="text-gray-500">@{twitter.handle}</div>
                    </div>
                    
                    <div className="text-sm text-gray-400 mb-3">
                      Official account of {character?.artistName} | Rapper, Producer, Entrepreneur
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="font-bold text-white">{formatNumber(twitter.followers)}</span>
                        <span className="text-gray-500"> Followers</span>
                      </div>
                      <div>
                        <span className="font-bold text-white">0</span>
                        <span className="text-gray-500"> Following</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Twitter Tweets */}
                  <div className="divide-y divide-[#2F3336]">
                    {getPlatformContent('twitter').length > 0 ? (
                      getPlatformContent('twitter').map((tweet: any) => (
                        <div key={tweet.id} className="p-4 hover:bg-[#080808]">
                          <div className="flex items-start">
                            {/* Author Photo */}
                            <div className="mr-3">
                              {character?.image ? (
                                <div className="h-10 w-10 rounded-full overflow-hidden">
                                  <img src={character.image} alt={character.artistName} className="h-full w-full object-cover" />
                                </div>
                              ) : (
                                <div className="h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center">
                                  <span className="text-xl font-bold text-blue-400">{character?.artistName?.charAt(0).toUpperCase() || 'A'}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Tweet Content */}
                            <div className="flex-1">
                              <div className="flex items-center gap-1 mb-1">
                                <span className="font-bold">{character?.artistName}</span>
                                {twitter.verified && (
                                  <span className="bg-blue-500 text-white p-0.5 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  </span>
                                )}
                                <span className="text-gray-500">@{twitter.handle}</span>
                                <span className="text-gray-500">·</span>
                                <span className="text-gray-500 text-sm">{formatDate(tweet.date)}</span>
                              </div>
                              
                              <div className="mb-3">{tweet.content}</div>
                              
                              {tweet.image && (
                                <div className="mb-3 rounded-xl overflow-hidden">
                                  <img src={tweet.image} alt="Tweet media" className="w-full h-auto max-h-96 object-cover" />
                                </div>
                              )}
                              
                              {/* Tweet Stats */}
                              <div className="flex items-center justify-between text-gray-500 text-sm">
                                <div className="flex items-center gap-1 hover:text-blue-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                  </svg>
                                  <span>{formatNumber(tweet.comments || 0)}</span>
                                </div>
                                <div className="flex items-center gap-1 hover:text-green-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 1l4 4-4 4"></path>
                                    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                                    <path d="M7 23l-4-4 4-4"></path>
                                    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                                  </svg>
                                  <span>{formatNumber(tweet.shares || 0)}</span>
                                </div>
                                <div className="flex items-center gap-1 hover:text-red-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                  </svg>
                                  <span>{formatNumber(tweet.likes || 0)}</span>
                                </div>
                                <div className="flex items-center gap-1 hover:text-blue-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                  </svg>
                                  <span>{formatNumber(tweet.views || 0)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-10 text-center text-gray-500">
                        <div className="mb-3">You haven't tweeted yet</div>
                        <Button
                          variant="outline"
                          className="border-blue-500 text-blue-500 hover:bg-blue-950"
                          onClick={() => setShowPostDialog(true)}
                        >
                          Create your first Tweet
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </TabsContent>
        
        {/* TikTok Platform */}
        <TabsContent value="tiktok" className="space-y-6">
          <Card className="bg-black border-gray-800 overflow-hidden">
            <div className="flex flex-col h-full">
              {/* TikTok Header */}
              <div className="flex items-center justify-between bg-black px-4 py-3 border-b border-gray-800">
                <div className="flex items-center">
                  <TikTokIcon size={24} className="text-white" />
                  <span className="ml-2 font-bold text-white">TikTok</span>
                </div>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    className="h-8 text-white hover:bg-gray-900 p-2"
                    onClick={() => setShowPostDialog(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </Button>
                </div>
              </div>
              
              {/* TikTok Profile */}
              <CardContent className="p-0 overflow-y-auto">
                <div className="p-4 flex flex-col items-center border-b border-gray-800">
                  {/* Profile Picture */}
                  {character?.image ? (
                    <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-pink-500 mb-4">
                      <img src={character.image} alt={character.artistName} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-20 w-20 bg-gray-800 rounded-full flex items-center justify-center border-2 border-pink-500 mb-4">
                      <span className="text-3xl font-bold text-white">{character?.artistName?.charAt(0).toUpperCase() || 'A'}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1 mb-2">
                    <h2 className="text-lg font-semibold">@{tiktok.handle}</h2>
                    {tiktok.verified && (
                      <span className="bg-blue-500 text-white p-1 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center gap-6 mb-4">
                    <div className="text-center">
                      <div className="font-semibold">{formatNumber(tiktok.followers)}</div>
                      <div className="text-sm text-gray-400">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{formatNumber(tiktok.videos?.length || 0)}</div>
                      <div className="text-sm text-gray-400">Videos</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">0</div>
                      <div className="text-sm text-gray-400">Following</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-400 text-center mb-4">
                    {character?.artistName} | Official Account<br />
                    New music dropping soon 🔥
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-pink-600 hover:bg-pink-700 text-white border-0"
                      onClick={() => setShowPostDialog(true)}
                    >
                      Create Video
                    </Button>
                    
                    {!tiktok.verified && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-blue-500 hover:bg-blue-600 text-white border-0"
                        onClick={() => verifyAccount('tiktok')}
                      >
                        Get Verified ($50,000)
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* TikTok Videos */}
                <div className="grid grid-cols-3 gap-1 p-1">
                  {getPlatformContent('tiktok').length > 0 ? (
                    getPlatformContent('tiktok').map((video: any) => (
                      <div key={video.id} className="aspect-[9/16] bg-gray-900 relative">
                        {video.image ? (
                          <img src={video.image} alt="Video thumbnail" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white p-2 text-xs">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"></div>
                            <span className="relative z-10">{video.content.slice(0, 30)}{video.content.length > 30 ? '...' : ''}</span>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 right-2 text-white text-xs flex items-center justify-between z-10">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            {formatNumber(video.likes || 0)}
                          </div>
                          <div>{formatNumber(video.views || 0)} views</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 py-10 text-center text-gray-400">
                      No videos yet. Create your first TikTok to start growing your audience!
                    </div>
                  )}
                </div>
              </CardContent>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Create Post Dialog */}
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Create New {selectedPlatform === 'twitter' ? 'Tweet' : selectedPlatform === 'tiktok' ? 'Video' : 'Post'}
            </DialogTitle>
            <DialogDescription>
              Share content with your fans on {selectedPlatform === 'twitter' ? 'Twitter' : selectedPlatform === 'tiktok' ? 'TikTok' : 'Instagram'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea 
              placeholder={selectedPlatform === 'twitter' ? "What's happening?" : selectedPlatform === 'tiktok' ? "Add a caption..." : "Write a caption..."}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="min-h-24"
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {selectedPlatform === 'tiktok' ? 'Video thumbnail URL' : 'Image URL'} (optional)
              </label>
              <Input 
                placeholder="https://example.com/image.jpg"
                value={postImage}
                onChange={(e) => setPostImage(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Post Type</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={postType === 'regular' ? 'default' : 'outline'}
                  onClick={() => {
                    setPostType('regular');
                    const { cost } = calculatePostMetrics(selectedPlatform, 'regular');
                    setPostCost(cost);
                  }}
                  className="flex-1"
                >
                  Regular
                </Button>
                <Button
                  type="button"
                  variant={postType === 'sponsored' ? 'default' : 'outline'}
                  onClick={() => {
                    setPostType('sponsored');
                    const { cost } = calculatePostMetrics(selectedPlatform, 'sponsored');
                    setPostCost(cost);
                  }}
                  className="flex-1"
                >
                  Sponsored
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                {postType === 'sponsored' 
                  ? 'Sponsored posts cost more but reach a wider audience.' 
                  : 'Regular posts are cheaper but have limited organic reach.'}
              </p>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Cost:</span>
                <span className="font-bold">${(calculatePostMetrics(selectedPlatform, postType).cost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Potential followers:</span>
                <span className="font-bold">~{formatNumber(calculatePostMetrics(selectedPlatform, postType).potentialFollowers)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Current balance:</span>
                <span className="font-bold">${wealth.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPostDialog(false)}>Cancel</Button>
            <Button onClick={createPost} disabled={wealth < calculatePostMetrics(selectedPlatform, postType).cost}>
              {selectedPlatform === 'twitter' ? 'Tweet' : selectedPlatform === 'tiktok' ? 'Post Video' : 'Share'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}