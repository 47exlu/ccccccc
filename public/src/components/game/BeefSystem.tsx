import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRapperGame } from "@/lib/stores/useRapperGame";
import { AIRapper } from "@/lib/types";
import { AlertCircle, CheckCircle, ThumbsUp, ThumbsDown, TrendingUp, Music, MessageSquare } from "lucide-react";

// Types for the beef system
interface Beef {
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

// Generate lyrics hint based on AI rapper's style
const getLyricsHint = (rapper: AIRapper) => {
  const style = rapper.style.toLowerCase();
  if (style.includes("trap")) {
    return "Focus on trap beats, flex culture, and autotune flow";
  } else if (style.includes("old school")) {
    return "Use classic boom bap style, focus on lyricism and wordplay";
  } else if (style.includes("drill")) {
    return "Aggressive delivery, street stories, sliding beats";
  } else if (style.includes("melodic")) {
    return "Blend singing with rap, emotional content, catchy hooks";
  }
  return "Strike with a unique flow that shows your style";
};

// Calculate diss track quality based on player stats and inputs
const calculateTrackQuality = (
  lyrics: string, 
  playerCreativity: number, 
  playerReputation: number,
  opponentPopularity: number
): number => {
  // Base calculations for quality
  const lengthFactor = Math.min(1, lyrics.length / 200) * 20; // Up to 20 points for length
  const specificInsultBonus = (lyrics.match(/\b(weak|fraud|fake|trash|whack|garbage|washed|wannabe|poser|joke)\b/gi) || []).length * 2;
  const creativityFactor = playerCreativity / 10; // 0-10 points based on creativity
  const reputationFactor = playerReputation / 20; // 0-5 points based on rep
  const difficultyBonus = opponentPopularity / 20; // 0-5 bonus for taking on bigger artists
  
  return Math.floor(lengthFactor + specificInsultBonus + creativityFactor + reputationFactor + difficultyBonus);
};

// Diss Track Creator Component
const DissTrackCreator = ({ 
  beef, 
  onSubmit 
}: { 
  beef: Beef, 
  onSubmit: (title: string, lyrics: string, quality: number) => void 
}) => {
  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const aiRappers = useRapperGame(state => state.aiRappers);
  const character = useRapperGame(state => state.character);
  const stats = useRapperGame(state => state.stats);
  
  const opponent = aiRappers.find(r => 
    r.id === (character?.id === beef.initiatorId ? beef.targetId : beef.initiatorId)
  );
  
  const handleSubmit = () => {
    if (!title || !lyrics || !opponent) return;
    
    const quality = calculateTrackQuality(
      lyrics,
      stats.creativity,
      stats.reputation,
      opponent.popularity
    );
    
    onSubmit(title, lyrics, quality);
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-md">
        <h3 className="flex items-center text-amber-800 dark:text-amber-400 font-medium">
          <AlertCircle className="w-4 h-4 mr-2" />
          Diss Track Tips
        </h3>
        <p className="text-sm mt-1 text-amber-700 dark:text-amber-500">
          {opponent ? getLyricsHint(opponent) : "Create lyrics that hit hard and showcase your style"}
        </p>
      </div>
      
      <div>
        <label className="text-sm font-medium">Track Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mt-1 p-2 border rounded-md"
          placeholder="Enter your diss track title"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Lyrics</label>
        <Textarea
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          className="min-h-[200px]"
          placeholder="Write your diss track lyrics here..."
        />
        <p className="text-xs text-gray-500 mt-1">
          {lyrics.length} characters - The more specific and creative, the better
        </p>
      </div>
      
      <Button onClick={handleSubmit} className="w-full">
        Release Diss Track
      </Button>
    </div>
  );
};

// Beef Detail Card
const BeefDetailCard = ({ beef }: { beef: Beef }) => {
  const aiRappers = useRapperGame(state => state.aiRappers);
  const character = useRapperGame(state => state.character);
  const stats = useRapperGame(state => state.stats);
  const currentWeek = useRapperGame(state => state.currentWeek);
  const [showDissTrackCreator, setShowDissTrackCreator] = useState(false);
  const [createDissTrack, updateBeef] = useState<() => void>(() => () => {});
  
  // Get rapper information
  const initiator = character?.id === beef.initiatorId 
    ? { name: character.artistName, image: character.image } 
    : { name: aiRappers.find(r => r.id === beef.initiatorId)?.name || "Unknown Rapper", 
        image: aiRappers.find(r => r.id === beef.initiatorId)?.image };
  
  const target = character?.id === beef.targetId 
    ? { name: character.artistName, image: character.image } 
    : { name: aiRappers.find(r => r.id === beef.targetId)?.name || "Unknown Rapper", 
        image: aiRappers.find(r => r.id === beef.targetId)?.image };
  
  // Determine if player needs to respond
  const playerNeedsToRespond = (character?.id === beef.initiatorId && !beef.initiatorTrack) || 
                               (character?.id === beef.targetId && !beef.targetTrack && beef.initiatorTrack);
  
  // Handle diss track submission
  const handleDissTrackSubmit = (title: string, lyrics: string, quality: number) => {
    // Logic to send diss track to the game state would go here
    setShowDissTrackCreator(false);
    
    // Update beef state in game
    // This would be implemented in useRapperGame store
  };
  
  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-red-900 to-orange-800 text-white py-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-lg">
            <Music className="w-5 h-5 mr-2" /> 
            Beef Details
          </CardTitle>
          <Badge 
            variant={beef.status === "ongoing" ? "destructive" : "outline"} 
            className={
              beef.status === "won" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : 
              beef.status === "lost" ? "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300" : 
              beef.status === "draw" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300" : 
              ""
            }
          >
            {beef.status.charAt(0).toUpperCase() + beef.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-16 h-16 mb-2">
              <img src={initiator.image} alt={initiator.name} className="object-cover" />
            </Avatar>
            <span className="font-semibold">{initiator.name}</span>
            <Badge variant="outline" className="mt-1">Initiator</Badge>
          </div>
          
          <div className="text-2xl font-bold text-red-600">VS</div>
          
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-16 h-16 mb-2">
              <img src={target.image} alt={target.name} className="object-cover" />
            </Avatar>
            <span className="font-semibold">{target.name}</span>
            <Badge variant="outline" className="mt-1">Target</Badge>
          </div>
        </div>
        
        <Tabs defaultValue="tracks">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tracks">Diss Tracks</TabsTrigger>
            <TabsTrigger value="impact">Public Reaction</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracks" className="space-y-4 mt-4">
            {beef.initiatorTrack ? (
              <div className="border rounded-md p-3">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold">{beef.initiatorTrack.title}</h3>
                  <span className="text-sm text-gray-500">Week {beef.initiatorTrack.responseWeek}</span>
                </div>
                <p className="text-sm whitespace-pre-line">{beef.initiatorTrack.lyrics}</p>
                <div className="mt-2 flex items-center">
                  <span className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    Quality: {beef.initiatorTrack.quality}/100
                  </span>
                </div>
              </div>
            ) : beef.status === "ongoing" && beef.initiatorId === character?.id ? (
              <div className="border border-dashed rounded-md p-4 text-center">
                <p className="text-gray-500 mb-2">You need to create the first diss track</p>
                <Button size="sm" onClick={() => setShowDissTrackCreator(true)}>Create Diss Track</Button>
              </div>
            ) : beef.status === "waiting" ? (
              <div className="border border-dashed rounded-md p-4 text-center">
                <p className="text-gray-500">Waiting for initiator to drop the first track</p>
              </div>
            ) : null}
            
            {beef.targetTrack ? (
              <div className="border rounded-md p-3">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold">{beef.targetTrack.title}</h3>
                  <span className="text-sm text-gray-500">Week {beef.targetTrack.responseWeek}</span>
                </div>
                <p className="text-sm whitespace-pre-line">{beef.targetTrack.lyrics}</p>
                <div className="mt-2 flex items-center">
                  <span className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    Quality: {beef.targetTrack.quality}/100
                  </span>
                </div>
              </div>
            ) : beef.initiatorTrack && beef.targetId === character?.id ? (
              <div className="border border-dashed rounded-md p-4 text-center">
                <p className="text-gray-500 mb-2">You need to respond to the diss track</p>
                <Button size="sm" onClick={() => setShowDissTrackCreator(true)}>Create Response</Button>
              </div>
            ) : beef.initiatorTrack ? (
              <div className="border border-dashed rounded-md p-4 text-center">
                <p className="text-gray-500">Waiting for target to respond</p>
              </div>
            ) : null}
            
            {showDissTrackCreator && (
              <Dialog open={showDissTrackCreator} onOpenChange={setShowDissTrackCreator}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Your Diss Track</DialogTitle>
                  </DialogHeader>
                  <DissTrackCreator beef={beef} onSubmit={handleDissTrackSubmit} />
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>
          
          <TabsContent value="impact" className="mt-4">
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
                <h3 className="font-semibold mb-2">Public Opinion</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">{initiator.name}'s Support</div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-blue-600 h-4 rounded-full" 
                        style={{ width: `${beef.publicReaction.initiatorFavor}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-sm">{beef.publicReaction.initiatorFavor}%</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">{target.name}'s Support</div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-red-600 h-4 rounded-full" 
                        style={{ width: `${beef.publicReaction.targetFavor}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-sm">{beef.publicReaction.targetFavor}%</div>
                  </div>
                </div>
              </div>
              
              {beef.status !== "ongoing" && beef.status !== "waiting" && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
                  <h3 className="font-semibold mb-2">Aftermath</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium">{initiator.name}</h4>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="w-4 h-4 mr-1 text-gray-500" />
                        <span className={beef.impact.initiatorRepGain >= 0 ? "text-green-600" : "text-red-600"}>
                          {beef.impact.initiatorRepGain > 0 ? "+" : ""}{beef.impact.initiatorRepGain} Rep
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <MessageSquare className="w-4 h-4 mr-1 text-gray-500" />
                        <span className={beef.impact.initiatorFollowerGain >= 0 ? "text-green-600" : "text-red-600"}>
                          {beef.impact.initiatorFollowerGain > 0 ? "+" : ""}{beef.impact.initiatorFollowerGain} Followers
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium">{target.name}</h4>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="w-4 h-4 mr-1 text-gray-500" />
                        <span className={beef.impact.targetRepGain >= 0 ? "text-green-600" : "text-red-600"}>
                          {beef.impact.targetRepGain > 0 ? "+" : ""}{beef.impact.targetRepGain} Rep
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <MessageSquare className="w-4 h-4 mr-1 text-gray-500" />
                        <span className={beef.impact.targetFollowerGain >= 0 ? "text-green-600" : "text-red-600"}>
                          {beef.impact.targetFollowerGain > 0 ? "+" : ""}{beef.impact.targetFollowerGain} Followers
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {playerNeedsToRespond && (
          <div className="mt-4 bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-md">
            <p className="text-amber-800 dark:text-amber-400 font-medium flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              You need to respond!
            </p>
            <p className="text-sm mt-1 text-amber-700 dark:text-amber-500">
              Failing to respond will damage your reputation and lose you followers.
            </p>
            <Button onClick={() => setShowDissTrackCreator(true)} size="sm" className="mt-2">
              Create Diss Track
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main BeefSystem Component
export function BeefSystem() {
  const aiRappers = useRapperGame(state => state.aiRappers);
  const character = useRapperGame(state => state.character);
  const stats = useRapperGame(state => state.stats);
  const currentWeek = useRapperGame(state => state.currentWeek);
  
  // These would come from the real game state in a future implementation
  const [beefs, setBeefs] = useState<Beef[]>([
    {
      id: "beef-1",
      initiatorId: "rapper-1", // AI Rapper ID
      targetId: "player-1", // Player ID
      status: "ongoing",
      startWeek: 24,
      initiatorTrack: {
        title: "Fraud Alert",
        lyrics: "You ain't real, never been in the field\nClaiming you a star but your skills can't pay the bills\nI'm the real deal, watch me make the crowd kneel\nWhile you hiding in the studio with your fake appeal",
        quality: 75,
        responseWeek: 24
      },
      publicReaction: {
        initiatorFavor: 65,
        targetFavor: 35
      },
      impact: {
        initiatorRepGain: 0,
        targetRepGain: 0,
        initiatorFollowerGain: 0,
        targetFollowerGain: 0
      }
    },
    {
      id: "beef-2",
      initiatorId: "player-1", // Player ID
      targetId: "rapper-3", // AI Rapper ID
      status: "won", 
      startWeek: 18,
      endWeek: 23,
      initiatorTrack: {
        title: "Wannabe",
        lyrics: "You a clone, no style of your own\nBiting flows while I'm sitting on my throne\nCame from nothing, built this from the ground\nWhile you were born with a silver spoon, never had to pound",
        quality: 85,
        responseWeek: 18
      },
      targetTrack: {
        title: "Mirror Image",
        lyrics: "Look at you thinking you invented the game\nI been doing this while you were still unknown\nTalking 'bout my silver spoon when you don't know my pain\nI earned my spot, you just got lucky with one song",
        quality: 65,
        responseWeek: 20
      },
      publicReaction: {
        initiatorFavor: 72,
        targetFavor: 28
      },
      impact: {
        initiatorRepGain: 15,
        targetRepGain: -8,
        initiatorFollowerGain: 12500,
        targetFollowerGain: -5000
      }
    }
  ]);
  
  const [selectedRapper, setSelectedRapper] = useState<AIRapper | null>(null);
  const [showStartBeefDialog, setShowStartBeefDialog] = useState(false);
  
  // Helper function to determine relationship status visual
  const getRelationshipBadge = (relationship: string) => {
    switch(relationship) {
      case "friend":
        return <Badge variant="outline" className="flex items-center bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"><CheckCircle className="mr-1 h-3 w-3" /> Friend</Badge>;
      case "rival":
        return <Badge variant="outline" className="flex items-center bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400"><ThumbsDown className="mr-1 h-3 w-3" /> Rival</Badge>;
      case "enemy":
        return <Badge variant="destructive" className="flex items-center"><ThumbsDown className="mr-1 h-3 w-3" /> Enemy</Badge>;
      default:
        return <Badge variant="outline" className="flex items-center">Neutral</Badge>;
    }
  };

  // Start a new beef with rapper
  const handleStartBeef = (rapperId: string) => {
    // This would be implemented in the game store
    console.log(`Starting beef with rapper ${rapperId}`);
    setShowStartBeefDialog(false);
    
    // For demo, just add a new beef to the list
    const newBeef: Beef = {
      id: `beef-${Date.now()}`,
      initiatorId: character?.id || "player-1",
      targetId: rapperId,
      status: "waiting",
      startWeek: currentWeek,
      publicReaction: {
        initiatorFavor: 50,
        targetFavor: 50
      },
      impact: {
        initiatorRepGain: 0,
        targetRepGain: 0,
        initiatorFollowerGain: 0,
        targetFollowerGain: 0
      }
    };
    
    setBeefs([...beefs, newBeef]);
  };
  
  // Filter active beefs that involve the player
  const activeBeefs = beefs.filter(beef => 
    (beef.initiatorId === character?.id || beef.targetId === character?.id) && 
    (beef.status === "ongoing" || beef.status === "waiting")
  );
  
  // Filter past beefs that involve the player
  const pastBeefs = beefs.filter(beef => 
    (beef.initiatorId === character?.id || beef.targetId === character?.id) && 
    (beef.status === "won" || beef.status === "lost" || beef.status === "draw")
  );
  
  const setScreen = useRapperGame(state => state.setScreen);
    
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Rap Beefs & Rivalries</h1>
        <Button 
          variant="outline" 
          onClick={() => setScreen("career_dashboard")}
          className="flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left">
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>
          Back to Dashboard
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Active Beefs</h2>
            {activeBeefs.length > 0 ? (
              activeBeefs.map(beef => (
                <BeefDetailCard key={beef.id} beef={beef} />
              ))
            ) : (
              <Card className="text-center p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-md">
                <p className="text-gray-600 dark:text-gray-300 mb-3">You don't have any active beefs right now</p>
                <Button onClick={() => setShowStartBeefDialog(true)} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">Start a Beef</Button>
              </Card>
            )}
          </div>
          
          {pastBeefs.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Past Beefs</h2>
              {pastBeefs.map(beef => (
                <BeefDetailCard key={beef.id} beef={beef} />
              ))}
            </div>
          )}
        </div>
        
        <div>
          <Card className="shadow-lg border-t-4 border-red-500 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 p-4">
              <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">Potential Rivals</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {aiRappers.slice(0, 5).map(rapper => (
                  <div key={rapper.id} className="flex items-center justify-between border-b pb-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md p-2 transition-colors">
                    <div className="flex items-center">
                      <Avatar className="mr-3 h-12 w-12 border-2 border-gray-200 dark:border-gray-700">
                        <img src={rapper.image} alt={rapper.name} className="object-cover" />
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{rapper.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          {getRelationshipBadge(rapper.relationship || "neutral")}
                          <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{rapper.popularity}% popularity</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                      onClick={() => {
                        setSelectedRapper(rapper);
                        setShowStartBeefDialog(true);
                      }}
                    >
                      Start Beef
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Use a dedicated dialog for starting beef without DialogTrigger */}
      <Dialog open={showStartBeefDialog} onOpenChange={setShowStartBeefDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Start a Beef with {selectedRapper?.name}</DialogTitle>
          </DialogHeader>
          {selectedRapper && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 border-2 border-gray-200 dark:border-gray-700">
                  <img src={selectedRapper.image} alt={selectedRapper.name} className="object-cover" />
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedRapper.name}</h3>
                  <p className="text-sm text-gray-500">{selectedRapper.style} • {selectedRapper.popularity}% popularity</p>
                  <div className="mt-1">
                    {getRelationshipBadge(selectedRapper.relationship || "neutral")}
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 p-4 rounded-md border-l-4 border-amber-400 dark:border-amber-600">
                <p className="text-amber-800 dark:text-amber-400 font-medium flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Starting a beef has consequences
                </p>
                <ul className="text-sm mt-2 text-amber-700 dark:text-amber-500 list-disc pl-5 space-y-1">
                  <li>You'll need to create a diss track to start the beef</li>
                  <li>The opponent will likely respond with their own track</li>
                  <li>Your reputation and followers can increase or decrease</li>
                  <li>Beef with higher-profile rappers is riskier but has bigger rewards</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedRapper(null);
                    setShowStartBeefDialog(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                  onClick={() => {
                    if (selectedRapper) {
                      handleStartBeef(selectedRapper.id);
                      setSelectedRapper(null);
                      setShowStartBeefDialog(false);
                    }
                  }}
                >
                  Start Beef
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}