import React, { useState, useRef, useEffect } from "react";
import { useRapperGame } from "@/lib/stores/useRapperGame";
import { SocialMediaPost, ViralStatus } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { 
  Twitter,
  Instagram as InstagramIcon,
  Image as ImageIcon,
  Video,
  Music,
  Hash,
  AtSign,
  Calendar,
  MapPin,
  Smile,
  Tag,
  Bookmark,
  Star,
  Sparkles,
  Zap,
  Flame,
  FileVideo,
  LucideIcon,
  Clock,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader,
  Search,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Upload,
  X,
  MessageCircle,
  Heart,
  Share,
  Repeat
} from "lucide-react";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

// Type for the wizard step
type WizardStep = 
  | 'platform'     // Choose platform
  | 'content'      // Create content
  | 'media'        // Add media
  | 'hashtags'     // Add hashtags/mentions
  | 'timing'       // Schedule or post now
  | 'preview'      // Preview post
  | 'success';     // Success screen

// Type for post content across platforms
interface PostContent {
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  hashtags: string[];
  mentions: string[];
  location?: string;
  scheduledFor?: Date;
}

// Platform icons for selection
const PlatformIcon: React.FC<{ platform: string; className?: string; size?: number }> = ({ platform, className = "", size = 24 }) => {
  if (platform === "Twitter") {
    return <Twitter size={size} className={className} />;
  } else if (platform === "Instagram") {
    return (
      <div className={`rounded-lg bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center ${className}`}>
        <InstagramIcon size={size} className="text-white" />
      </div>
    );
  } else if (platform === "TikTok") {
    return (
      <div className={`rounded-lg bg-black flex items-center justify-center ${className}`}>
        <div className="relative flex items-center justify-center">
          <span className="text-white font-bold">TT</span>
        </div>
      </div>
    );
  }
  return null;
};

// Main Post Creation Wizard Component
export const PostCreationWizard: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPlatform?: string;
}> = ({ open, onOpenChange, initialPlatform }) => {
  const { character, socialMediaStats, addSocialMediaPost } = useRapperGame();
  
  // State for wizard
  const [currentStep, setCurrentStep] = useState<WizardStep>('platform');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(initialPlatform || null);
  const [postContent, setPostContent] = useState<PostContent>({
    text: '',
    hashtags: [],
    mentions: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hashtagInput, setHashtagInput] = useState('');
  const [mentionInput, setMentionInput] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Trending hashtags based on platform
  const trendingHashtags = {
    Twitter: ['#NewMusic', '#NowPlaying', '#RapMusic', '#HipHop', '#musicproducer', '#rapgame'],
    Instagram: ['#music', '#rapper', '#hiphop', '#artist', '#newmusic', '#studio'],
    TikTok: ['#foryou', '#fyp', '#music', '#rap', '#viral', '#hiphopmusic']
  };
  
  // Popular accounts to mention based on platform
  const popularAccounts = {
    Twitter: ['MusicInsider', 'RapRadio', 'BillboardHot100', 'RapCaviar', 'ComplexMusic'],
    Instagram: ['complex', 'xxl', 'worldstar', 'rapcaviar', 'lyricallemonade'],
    TikTok: ['musictrends', 'rapfans', 'hiphopheads', 'beatmakers', 'producerlife']
  };
  
  // Reset the wizard when it's opened
  useEffect(() => {
    if (open) {
      if (!initialPlatform) {
        setCurrentStep('platform');
        setSelectedPlatform(null);
      } else {
        setSelectedPlatform(initialPlatform);
        setCurrentStep('content');
      }
      
      setPostContent({
        text: '',
        hashtags: [],
        mentions: [],
      });
      setIsSubmitting(false);
      setHashtagInput('');
      setMentionInput('');
      setIsScheduled(false);
      setScheduledDate('');
      setScheduledTime('');
    }
  }, [open, initialPlatform]);
  
  // Handle platform selection
  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform);
    setCurrentStep('content');
  };
  
  // Handle text content change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostContent({ ...postContent, text: e.target.value });
  };
  
  // Handle media upload
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const fileType = file.type.startsWith('image/') 
            ? 'image' 
            : file.type.startsWith('video/') 
              ? 'video' 
              : 'audio';
              
          setPostContent({
            ...postContent,
            mediaUrl: event.target.result as string,
            mediaType: fileType,
          });
        }
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // Handle hashtag addition
  const handleAddHashtag = () => {
    if (hashtagInput.trim()) {
      let formattedHashtag = hashtagInput.trim();
      if (!formattedHashtag.startsWith('#')) {
        formattedHashtag = '#' + formattedHashtag;
      }
      
      // Remove any spaces
      formattedHashtag = formattedHashtag.replace(/\s+/g, '');
      
      if (!postContent.hashtags.includes(formattedHashtag)) {
        setPostContent({
          ...postContent,
          hashtags: [...postContent.hashtags, formattedHashtag]
        });
      }
      setHashtagInput('');
    }
  };
  
  // Handle mention addition
  const handleAddMention = () => {
    if (mentionInput.trim()) {
      let formattedMention = mentionInput.trim();
      if (!formattedMention.startsWith('@')) {
        formattedMention = '@' + formattedMention;
      }
      
      // Remove any spaces
      formattedMention = formattedMention.replace(/\s+/g, '');
      
      if (!postContent.mentions.includes(formattedMention)) {
        setPostContent({
          ...postContent,
          mentions: [...postContent.mentions, formattedMention]
        });
      }
      setMentionInput('');
    }
  };
  
  // Handle trending hashtag selection
  const handleSelectTrendingHashtag = (hashtag: string) => {
    if (!postContent.hashtags.includes(hashtag)) {
      setPostContent({
        ...postContent,
        hashtags: [...postContent.hashtags, hashtag]
      });
    }
  };
  
  // Handle popular account mention
  const handleSelectPopularAccount = (account: string) => {
    const formattedMention = '@' + account;
    if (!postContent.mentions.includes(formattedMention)) {
      setPostContent({
        ...postContent,
        mentions: [...postContent.mentions, formattedMention]
      });
    }
  };
  
  // Handle location setting
  const handleSetLocation = (location: string) => {
    setPostContent({
      ...postContent,
      location
    });
  };
  
  // Remove a hashtag
  const handleRemoveHashtag = (hashtag: string) => {
    setPostContent({
      ...postContent,
      hashtags: postContent.hashtags.filter(h => h !== hashtag)
    });
  };
  
  // Remove a mention
  const handleRemoveMention = (mention: string) => {
    setPostContent({
      ...postContent,
      mentions: postContent.mentions.filter(m => m !== mention)
    });
  };
  
  // Remove media
  const handleRemoveMedia = () => {
    setPostContent({
      ...postContent,
      mediaUrl: undefined,
      mediaType: undefined
    });
  };
  
  // Handle scheduling toggle
  const handleScheduleToggle = (checked: boolean) => {
    setIsScheduled(checked);
    
    // If turning on scheduling, set default date to tomorrow
    if (checked && !scheduledDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const day = String(tomorrow.getDate()).padStart(2, '0');
      
      setScheduledDate(`${year}-${month}-${day}`);
      setScheduledTime('12:00');
    }
  };
  
  // Process the post text with hashtags and mentions
  const getProcessedContent = () => {
    let text = postContent.text;
    
    // Append hashtags and mentions if they're not already in the text
    [...postContent.hashtags, ...postContent.mentions].forEach(tag => {
      if (!text.includes(tag)) {
        text += ` ${tag}`;
      }
    });
    
    return text.trim();
  };
  
  // Create and submit the post
  const handleSubmitPost = () => {
    if (!selectedPlatform) return;
    
    setIsSubmitting(true);
    
    try {
      // Create a new post object
      const processedContent = getProcessedContent();
      
      // Get the image URL from the media (if any)
      const imageUrl = postContent.mediaType === 'image' ? postContent.mediaUrl : undefined;
      const videoUrl = postContent.mediaType === 'video' ? postContent.mediaUrl : undefined;
      
      // Determine when to post
      let postDate: Date;
      if (isScheduled && scheduledDate && scheduledTime) {
        postDate = new Date(`${scheduledDate}T${scheduledTime}`);
      } else {
        postDate = new Date();
      }
      
      // Create the post object
      const newPost: SocialMediaPost = {
        id: uuidv4(),
        platformName: selectedPlatform,
        content: processedContent,
        image: imageUrl,
        video: videoUrl,
        postWeek: useRapperGame.getState().currentWeek,
        date: postDate,
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        viralStatus: 'not_viral' as ViralStatus,
        viralMultiplier: 1,
        followerGain: 0,
        reputationGain: 0,
        wealthGain: 0,
        // Add user info
        username: character?.artistName,
        handle: character?.artistName?.toLowerCase().replace(/\s+/g, ''),
        avatar: character?.image,
        verified: true,
      };

      // Simulate a small delay for better UX
      setTimeout(() => {
        // Add post to the game state
        addSocialMediaPost(selectedPlatform, newPost);
        
        // Show success message
        toast.success(isScheduled 
          ? "Post scheduled successfully!" 
          : "Post created successfully!",
          {
            description: isScheduled 
              ? `Your post will be published on ${new Date(postDate).toLocaleString()}` 
              : "Your post has been published",
            duration: 3000
          }
        );
        
        // Reset form and close dialog
        setCurrentStep('success');
        setIsSubmitting(false);
        
        // Close the dialog after showing success for a moment
        setTimeout(() => {
          onOpenChange(false);
        }, 1500);
      }, 1000);
    } catch (error) {
      console.error("Error creating post:", error);
      setIsSubmitting(false);
      
      toast.error("Failed to create post", {
        description: "There was an error creating your post. Please try again.",
        duration: 3000
      });
    }
  };
  
  // Handle going to the next step
  const handleNextStep = () => {
    switch (currentStep) {
      case 'platform':
        if (selectedPlatform) setCurrentStep('content');
        break;
      case 'content':
        if (postContent.text.trim().length > 0) setCurrentStep('media');
        break;
      case 'media':
        setCurrentStep('hashtags');
        break;
      case 'hashtags':
        setCurrentStep('timing');
        break;
      case 'timing':
        setCurrentStep('preview');
        break;
      case 'preview':
        handleSubmitPost();
        break;
      default:
        break;
    }
  };
  
  // Handle going to the previous step
  const handlePrevStep = () => {
    switch (currentStep) {
      case 'content':
        setCurrentStep('platform');
        break;
      case 'media':
        setCurrentStep('content');
        break;
      case 'hashtags':
        setCurrentStep('media');
        break;
      case 'timing':
        setCurrentStep('hashtags');
        break;
      case 'preview':
        setCurrentStep('timing');
        break;
      default:
        break;
    }
  };
  
  // Check if the next button should be disabled
  const isNextDisabled = () => {
    switch (currentStep) {
      case 'platform':
        return !selectedPlatform;
      case 'content':
        return !postContent.text.trim();
      case 'preview':
        return isSubmitting;
      default:
        return false;
    }
  };
  
  // Get character count warning color
  const getCharacterCountColor = () => {
    const limit = selectedPlatform === 'Twitter' ? 280 : 2200;
    const count = postContent.text.length;
    
    if (count > limit * 0.9) return "text-red-500";
    if (count > limit * 0.75) return "text-yellow-500";
    return "text-gray-500";
  };
  
  // Get character limit based on platform
  const getCharacterLimit = () => {
    switch (selectedPlatform) {
      case 'Twitter':
        return 280;
      case 'Instagram':
        return 2200;
      case 'TikTok':
        return 2200;
      default:
        return 1000;
    }
  };
  
  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'platform':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-center mb-4">Choose Platform</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Twitter', 'Instagram', 'TikTok'].map((platform) => (
                <Card 
                  key={platform}
                  className={`hover:shadow-md transition-all cursor-pointer ${
                    selectedPlatform === platform 
                      ? 'ring-2 ring-primary shadow-md' 
                      : ''
                  }`}
                  onClick={() => handlePlatformSelect(platform)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      {platform === 'Twitter' && <Twitter className="h-8 w-8 text-blue-500" />}
                      {platform === 'Instagram' && (
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center">
                          <InstagramIcon className="h-5 w-5 text-white" />
                        </div>
                      )}
                      {platform === 'TikTok' && (
                        <div className="h-8 w-8 rounded-xl bg-black flex items-center justify-center">
                          <div className="text-white text-xs font-bold">TT</div>
                        </div>
                      )}
                      
                      {selectedPlatform === platform && (
                        <Badge variant="outline" className="bg-primary text-primary-foreground">
                          <Check className="h-3 w-3 mr-1" />
                          Selected
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl mt-2">{platform}</CardTitle>
                    <CardDescription>
                      {platform === 'Twitter' && 'Short updates & conversations'}
                      {platform === 'Instagram' && 'Visual content & stories'}
                      {platform === 'TikTok' && 'Short-form videos & trends'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Followers</span>
                        <span className="font-semibold">
                          {platform === 'Twitter' && socialMediaStats?.twitter?.followers.toLocaleString()}
                          {platform === 'Instagram' && socialMediaStats?.instagram?.followers.toLocaleString()}
                          {platform === 'TikTok' && socialMediaStats?.tiktok?.followers.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Posts</span>
                        <span className="font-semibold">
                          {platform === 'Twitter' && (socialMediaStats?.twitter?.tweets?.length || 0)}
                          {platform === 'Instagram' && (socialMediaStats?.instagram?.posts?.length || 0)}
                          {platform === 'TikTok' && (socialMediaStats?.tiktok?.videos?.length || 0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
        
      case 'content':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-center mb-4">Create Content</h2>
            
            <div className="flex items-center space-x-3 mb-4">
              <PlatformIcon platform={selectedPlatform || ''} size={32} className="w-8 h-8" />
              <div>
                <p className="font-medium">{character?.artistName}</p>
                <p className="text-sm text-gray-500">@{character?.artistName?.toLowerCase().replace(/\s+/g, '')}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="post-content">What's on your mind?</Label>
              <Textarea 
                id="post-content" 
                placeholder={
                  selectedPlatform === 'Twitter' 
                    ? "What's happening?" 
                    : selectedPlatform === 'Instagram'
                      ? "Write a caption..."
                      : "Add a caption..."
                }
                className="min-h-[120px]"
                value={postContent.text}
                onChange={handleTextChange}
                maxLength={getCharacterLimit()}
              />
              <div className={`text-xs flex justify-end ${getCharacterCountColor()}`}>
                {postContent.text.length}/{getCharacterLimit()} characters
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Tips for great content:</div>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Be authentic and showcase your personality</li>
                <li>Ask questions to encourage engagement</li>
                <li>Share something valuable or entertaining</li>
                <li>
                  {selectedPlatform === 'Twitter' && 'Keep it concise and use emojis sparingly'}
                  {selectedPlatform === 'Instagram' && 'Use emojis to make your caption pop'}
                  {selectedPlatform === 'TikTok' && 'Keep captions short and use relevant trending hashtags'}
                </li>
              </ul>
            </div>
          </div>
        );
        
      case 'media':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-center mb-4">Add Media</h2>
            
            {!postContent.mediaUrl ? (
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                  {selectedPlatform === 'TikTok' 
                    ? <FileVideo className="h-6 w-6 text-gray-500" />
                    : <ImageIcon className="h-6 w-6 text-gray-500" />
                  }
                </div>
                <h3 className="text-lg font-medium mb-1">
                  {selectedPlatform === 'TikTok' 
                    ? 'Upload a video' 
                    : 'Upload a photo or video'
                  }
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {selectedPlatform === 'Twitter' && 'PNG, JPG, or MP4 (max 10MB)'}
                  {selectedPlatform === 'Instagram' && 'PNG, JPG, or MP4 (max 100MB)'}
                  {selectedPlatform === 'TikTok' && 'MP4 format (max 3 minutes)'}
                </p>
                <Button 
                  variant="outline" 
                  className="mx-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Select File
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleMediaUpload}
                  accept={
                    selectedPlatform === 'TikTok'
                      ? "video/*"
                      : "image/*,video/*"
                  }
                />
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden border">
                {postContent.mediaType === 'image' ? (
                  <img 
                    src={postContent.mediaUrl} 
                    alt="Preview" 
                    className="w-full object-contain max-h-[300px]"
                  />
                ) : (
                  <video 
                    src={postContent.mediaUrl} 
                    controls 
                    className="w-full h-auto max-h-[300px]"
                  />
                )}
                <button 
                  className="absolute top-2 right-2 bg-black/70 text-white rounded-full h-8 w-8 flex items-center justify-center"
                  onClick={handleRemoveMedia}
                >
                  <X size={16} />
                </button>
              </div>
            )}
            
            <div className="space-y-2 mt-4">
              <div className="text-sm text-gray-500">
                {!postContent.mediaUrl && 'Skip this step if you don\'t want to add media.'}
              </div>
              
              <div className="text-sm text-gray-500">Tips for great media:</div>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>
                  {selectedPlatform === 'Twitter' && 'Images with clear subjects stand out in the timeline'}
                  {selectedPlatform === 'Instagram' && 'High-quality, well-lit images perform best'}
                  {selectedPlatform === 'TikTok' && 'Vertical videos with good lighting perform best'}
                </li>
                <li>
                  {selectedPlatform === 'Twitter' && 'Add multiple images to tell a story'}
                  {selectedPlatform === 'Instagram' && 'Use a consistent style for your feed'}
                  {selectedPlatform === 'TikTok' && 'Shorter videos (15-30 seconds) often get more engagement'}
                </li>
                <li>Show behind-the-scenes content for more authentic connection</li>
              </ul>
            </div>
          </div>
        );
        
      case 'hashtags':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-center mb-4">Add Hashtags & Mentions</h2>
            
            {/* Hashtag Input */}
            <div className="space-y-2">
              <Label htmlFor="hashtag-input">Add Hashtags</Label>
              <div className="flex space-x-2">
                <Input 
                  id="hashtag-input" 
                  placeholder="Enter a hashtag..." 
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddHashtag();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleAddHashtag}
                >
                  Add
                </Button>
              </div>
            </div>
            
            {/* Hashtag Display */}
            {postContent.hashtags.length > 0 && (
              <div className="space-y-2">
                <Label>Your Hashtags</Label>
                <div className="flex flex-wrap gap-2">
                  {postContent.hashtags.map((hashtag) => (
                    <Badge key={hashtag} variant="secondary" className="flex items-center gap-1">
                      {hashtag}
                      <button
                        className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 p-0.5"
                        onClick={() => handleRemoveHashtag(hashtag)}
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Trending Hashtags */}
            <div className="space-y-2">
              <Label>Trending Hashtags</Label>
              <div className="flex flex-wrap gap-2">
                {selectedPlatform && trendingHashtags[selectedPlatform as keyof typeof trendingHashtags].map((hashtag) => (
                  <Badge 
                    key={hashtag} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => handleSelectTrendingHashtag(hashtag)}
                  >
                    {hashtag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Separator className="my-4" />
            
            {/* Mention Input */}
            <div className="space-y-2">
              <Label htmlFor="mention-input">Add Mentions</Label>
              <div className="flex space-x-2">
                <Input 
                  id="mention-input" 
                  placeholder="Enter a username..." 
                  value={mentionInput}
                  onChange={(e) => setMentionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMention();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleAddMention}
                >
                  Add
                </Button>
              </div>
            </div>
            
            {/* Mention Display */}
            {postContent.mentions.length > 0 && (
              <div className="space-y-2">
                <Label>Your Mentions</Label>
                <div className="flex flex-wrap gap-2">
                  {postContent.mentions.map((mention) => (
                    <Badge key={mention} variant="secondary" className="flex items-center gap-1">
                      {mention}
                      <button
                        className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 p-0.5"
                        onClick={() => handleRemoveMention(mention)}
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Popular Accounts */}
            <div className="space-y-2">
              <Label>Popular Accounts</Label>
              <div className="flex flex-wrap gap-2">
                {selectedPlatform && popularAccounts[selectedPlatform as keyof typeof popularAccounts].map((account) => (
                  <Badge 
                    key={account} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => handleSelectPopularAccount(account)}
                  >
                    @{account}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Tips */}
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Tips for hashtags & mentions:</div>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Use 2-5 relevant hashtags for best engagement</li>
                <li>Mention accounts that might share your content</li>
                <li>
                  {selectedPlatform === 'Twitter' && 'Hashtags increase discoverability in searches'}
                  {selectedPlatform === 'Instagram' && 'Instagram allows up to 30 hashtags per post'}
                  {selectedPlatform === 'TikTok' && 'Try to include at least one trending hashtag'}
                </li>
              </ul>
            </div>
          </div>
        );
        
      case 'timing':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-center mb-4">Timing & Settings</h2>
            
            {/* Schedule Toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="schedule-toggle">Schedule for later</Label>
                <Switch 
                  id="schedule-toggle" 
                  checked={isScheduled}
                  onCheckedChange={handleScheduleToggle}
                />
              </div>
              
              {isScheduled && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduled-date">Date</Label>
                    <Input
                      id="scheduled-date"
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduled-time">Time</Label>
                    <Input
                      id="scheduled-time"
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <Separator className="my-4" />
            
            {/* Location (Optional) */}
            {(selectedPlatform === 'Instagram' || selectedPlatform === 'Twitter') && (
              <div className="space-y-2">
                <Label htmlFor="location">Add Location (Optional)</Label>
                <Select
                  value={postContent.location}
                  onValueChange={handleSetLocation}
                >
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Popular Locations</SelectLabel>
                      <SelectItem value="Recording Studio">Recording Studio</SelectItem>
                      <SelectItem value="On Tour">On Tour</SelectItem>
                      <SelectItem value="Music Festival">Music Festival</SelectItem>
                      <SelectItem value="Los Angeles, CA">Los Angeles, CA</SelectItem>
                      <SelectItem value="New York, NY">New York, NY</SelectItem>
                      <SelectItem value="Atlanta, GA">Atlanta, GA</SelectItem>
                      <SelectItem value="Miami, FL">Miami, FL</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Best Timing Tips */}
            <div className="space-y-2 mt-4">
              <div className="text-sm text-gray-500">Best posting times for engagement:</div>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>
                  {selectedPlatform === 'Twitter' && 'Twitter: 8-10 AM, 12 PM, 5-6 PM on weekdays'}
                  {selectedPlatform === 'Instagram' && 'Instagram: 11 AM, 1 PM, and 5 PM on weekdays'}
                  {selectedPlatform === 'TikTok' && 'TikTok: 7-9 AM, 12-1 PM, and 7-11 PM daily'}
                </li>
                <li>Weekends tend to have higher engagement in the afternoon</li>
                <li>Schedule posts when your audience is most active</li>
              </ul>
            </div>
          </div>
        );
        
      case 'preview':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-center mb-4">Preview Your Post</h2>
            
            <div className="border rounded-lg overflow-hidden">
              {/* Post Header */}
              <div className="p-3 flex items-start space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={character?.image} alt={character?.artistName} />
                  <AvatarFallback>{character?.artistName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <span className="font-bold truncate">{character?.artistName}</span>
                    <Badge className="ml-1 bg-blue-500 text-white border-0 h-4 w-4 p-0 flex items-center justify-center rounded-full">
                      <Check className="h-3 w-3" />
                    </Badge>
                    <span className="text-gray-500 text-sm ml-1 truncate">@{character?.artistName?.toLowerCase().replace(/\s+/g, '')}</span>
                  </div>
                  
                  {/* Post Content */}
                  <div className="mt-1">
                    <p className="whitespace-pre-wrap break-words">{getProcessedContent()}</p>
                    
                    {postContent.location && (
                      <div className="text-sm text-blue-500 mt-1 flex items-center">
                        <MapPin size={14} className="mr-1" />
                        {postContent.location}
                      </div>
                    )}
                    
                    {/* Media Preview */}
                    {postContent.mediaUrl && (
                      <div className="mt-3 rounded-lg overflow-hidden">
                        {postContent.mediaType === 'image' ? (
                          <img 
                            src={postContent.mediaUrl} 
                            alt="Preview" 
                            className="w-full object-contain max-h-[300px]"
                          />
                        ) : (
                          <video 
                            src={postContent.mediaUrl} 
                            controls 
                            className="w-full h-auto max-h-[300px]"
                          />
                        )}
                      </div>
                    )}
                    
                    {/* Timestamp */}
                    <div className="text-sm text-gray-500 mt-2">
                      {isScheduled
                        ? `Scheduled for ${new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}`
                        : 'Will post now'
                      }
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Post Actions */}
              <div className="border-t p-2 flex justify-between">
                <div className="flex space-x-4 text-gray-500 text-sm">
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span>0</span>
                  </div>
                  
                  <div className="flex items-center">
                    {selectedPlatform === 'Twitter' ? (
                      <Repeat className="h-4 w-4 mr-1" />
                    ) : (
                      <Share className="h-4 w-4 mr-1" />
                    )}
                    <span>0</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    <span>0</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Bookmark className="h-4 w-4 mr-1" />
                    <span>0</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Audience Reach Estimate */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mt-4">
              <h3 className="font-medium mb-2">Estimated Reach</h3>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: '60%' }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">60%</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This post could reach approximately {
                  selectedPlatform === 'Twitter' 
                    ? Math.round(socialMediaStats?.twitter?.followers || 0 * 0.6).toLocaleString()
                    : selectedPlatform === 'Instagram'
                      ? Math.round(socialMediaStats?.instagram?.followers || 0 * 0.6).toLocaleString()
                      : Math.round(socialMediaStats?.tiktok?.followers || 0 * 0.6).toLocaleString()
                } users based on your current followers and recent engagement.
              </p>
            </div>
          </div>
        );
        
      case 'success':
        return (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mb-4">
              <Check className="h-8 w-8 text-green-600 dark:text-green-300" />
            </div>
            <h2 className="text-xl font-bold mb-2">
              {isScheduled ? 'Post Scheduled!' : 'Post Created!'}
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 max-w-sm">
              {isScheduled
                ? `Your post will be published on ${new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}`
                : 'Your post has been published successfully and is now visible to your followers.'
              }
            </p>
          </div>
        );
    }
  };
  
  // Render the step indicator
  const renderStepIndicator = () => {
    const steps = ['platform', 'content', 'media', 'hashtags', 'timing', 'preview'];
    const currentStepIndex = steps.indexOf(currentStep);
    
    return (
      <div className="flex justify-between items-center w-full mb-6 px-2">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            {/* Step circle */}
            <div 
              className={`
                relative z-10 rounded-full flex items-center justify-center w-8 h-8 
                ${currentStepIndex >= index 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-gray-200 text-gray-500 dark:bg-gray-700'
                }
                ${currentStepIndex === index ? 'ring-2 ring-offset-2 ring-primary' : ''}
              `}
            >
              {currentStepIndex > index ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-xs">{index + 1}</span>
              )}
            </div>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div 
                className={`
                  h-1 flex-1 
                  ${currentStepIndex > index 
                    ? 'bg-primary' 
                    : 'bg-gray-200 dark:bg-gray-700'
                  }
                `}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };
  
  // Main render
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a Post</DialogTitle>
          <DialogDescription>
            Create and share content with your followers.
          </DialogDescription>
        </DialogHeader>
        
        {currentStep !== 'success' && renderStepIndicator()}
        
        <div className="mt-4">
          {renderStepContent()}
        </div>
        
        {currentStep !== 'success' && (
          <DialogFooter className="flex justify-between mt-6">
            {currentStep !== 'platform' ? (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={isSubmitting}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            ) : (
              <div></div> // Empty div for spacing
            )}
            
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={isNextDisabled()}
              className={currentStep === 'preview' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {currentStep === 'preview' ? 'Publishing...' : 'Processing...'}
                </>
              ) : (
                <>
                  {currentStep === 'preview' 
                    ? isScheduled ? 'Schedule Post' : 'Publish Post'
                    : 'Continue'
                  }
                  <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PostCreationWizard;