import React, { useState, useEffect } from "react";
import { useRapperGame } from "../../lib/stores/useRapperGame";
import { SocialMediaPost } from "../../lib/types";
import {
  Card,
  CardContent,
} from "../ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ChevronLeft } from "lucide-react";

export default function NewTwitterPanel() {
  const { character, postOnSocialMedia, socialMedia, socialMediaStats } = useRapperGame();
  const [postText, setPostText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [twitterPosts, setTwitterPosts] = useState<SocialMediaPost[]>([]);
  
  // Get Twitter data from store
  useEffect(() => {
    // Try to get posts from socialMediaStats first (new structure)
    if (socialMediaStats?.twitter?.tweets) {
      setTwitterPosts(socialMediaStats.twitter.tweets);
    } else {
      // Fallback to looking at viralPosts in old structure
      const twitterPlatform = socialMedia.find(p => p.name === "Twitter");
      if (twitterPlatform?.viralPosts) {
        setTwitterPosts(twitterPlatform.viralPosts);
      } else {
        // If no posts found, use empty array
        setTwitterPosts([]);
      }
    }
  }, [socialMedia, socialMediaStats]);

  const handlePost = () => {
    if (!postText.trim()) return;
    
    setIsLoading(true);
    
    // Use the store's postOnSocialMedia method to post to Twitter
    postOnSocialMedia("Twitter", postText);
    
    // Reset the input
    setPostText("");
    setIsLoading(false);
    
    // The store will handle all the post metrics (likes, shares, etc.)
    // and will update the store automatically
  };

  // Go back to dashboard
  const handleBackToDashboard = () => {
    // This is handled by the parent component
    window.history.back();
  };

  return (
    <div className="bg-white text-black h-full">
      {/* Header Bar */}
      <div className="border-b border-gray-200 px-4 py-3 flex items-center sticky top-0 bg-white z-10">
        <Button variant="ghost" size="icon" onClick={handleBackToDashboard} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-xl font-bold">Twitter</div>
      </div>
      
      {/* Compose Tweet */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={character?.image} alt={character?.artistName} />
            <AvatarFallback>{character?.artistName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Input
              placeholder="What's happening?"
              className="border-none bg-transparent py-2 px-0 text-lg placeholder:text-gray-500"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <Button 
                onClick={handlePost}
                disabled={!postText.trim() || isLoading}
                className="bg-blue-500 text-white hover:bg-blue-600 rounded-full px-4"
              >
                Tweet
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Posts Feed */}
      <div className="overflow-y-auto max-h-[calc(100vh-120px)]">
        {twitterPosts.length > 0 ? (
          twitterPosts.map((post) => (
            <div key={post.id} className="p-4 border-b border-gray-200">
              <div className="flex gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={character?.image} alt={character?.artistName} />
                  <AvatarFallback>{character?.artistName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center">
                    <span className="font-bold">{character?.artistName}</span>
                    <span className="text-gray-500 ml-2">
                      @{character?.artistName?.toLowerCase().replace(/\s+/g, '') || "user"}
                    </span>
                  </div>
                  <div className="mt-1">{post.content}</div>
                  {post.image && (
                    <div className="mt-2 rounded-lg overflow-hidden">
                      <img src={post.image} alt="Post" className="w-full" />
                    </div>
                  )}
                  <div className="flex mt-2 text-gray-500 gap-4">
                    <div>💬 {post.comments}</div>
                    <div>🔄 {post.shares}</div>
                    <div>❤️ {post.likes}</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>No tweets yet. Share your first tweet above!</p>
          </div>
        )}
      </div>
    </div>
  );
}