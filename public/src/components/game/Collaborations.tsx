import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progressbar';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { useAudio } from '@/lib/stores/useAudio';
import { UsersIcon } from '@/assets/icons';
import { SongTier } from '@/lib/types';
import { SONG_TIER_INFO } from '@/lib/gameData';

export function Collaborations() {
  const { 
    aiRappers, 
    stats, 
    streamingPlatforms, 
    collaborationRequests,
    requestFeature,
    respondToFeatureRequest,
    setScreen 
  } = useRapperGame();
  const { playSuccess, playHit } = useAudio();
  
  const [selectedRapperId, setSelectedRapperId] = useState('');
  const [selectedTier, setSelectedTier] = useState<SongTier>(3);
  const [activeTab, setActiveTab] = useState('artists');
  
  // Total monthly listeners for the player
  const totalMonthlyListeners = streamingPlatforms.reduce((sum, platform) => sum + platform.listeners, 0);
  
  // Format large numbers
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
  
  // Get pending collaboration requests
  const pendingRequests = collaborationRequests.filter(req => req.accepted === null);
  
  // Handle requesting a feature
  const handleRequestFeature = () => {
    if (!selectedRapperId) return;
    
    requestFeature(selectedRapperId, selectedTier);
    playHit();
  };
  
  // Handle responding to a feature request
  const handleRespondToRequest = (rapperId: string, accept: boolean) => {
    respondToFeatureRequest(rapperId, accept);
    if (accept) playSuccess();
    else playHit();
  };
  
  // Get relationship badge style
  const getRelationshipBadge = (status: string) => {
    switch (status) {
      case 'friend': return 'bg-green-600';
      case 'rival': return 'bg-amber-600';
      case 'enemy': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-amber-900 to-black text-white p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <UsersIcon size={32} className="mr-3 text-amber-400" />
          <div>
            <h1 className="text-2xl font-bold">Collaborations</h1>
            <p className="text-sm text-gray-400">Work with other artists to boost your career</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="bg-transparent border-gray-600 hover:bg-gray-800"
          onClick={() => setScreen('career_dashboard')}
        >
          Back to Dashboard
        </Button>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-amber-950 border border-amber-800">
          <TabsTrigger value="artists" className="data-[state=active]:bg-amber-800">
            Artists
          </TabsTrigger>
          <TabsTrigger value="requests" className="data-[state=active]:bg-amber-800">
            Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
          </TabsTrigger>
        </TabsList>
        
        {/* Artists Tab */}
        <TabsContent value="artists" className="space-y-6">
          <Card className="bg-amber-950/50 border-amber-800">
            <CardHeader>
              <CardTitle className="text-lg">Request Feature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Select Artist</label>
                <Select 
                  value={selectedRapperId} 
                  onValueChange={setSelectedRapperId}
                >
                  <SelectTrigger className="bg-amber-900/40 border-amber-700">
                    <SelectValue placeholder="Choose an artist to collaborate with" />
                  </SelectTrigger>
                  <SelectContent className="bg-amber-950 border-amber-800 text-white">
                    {aiRappers
                      .filter(rapper => rapper.relationshipStatus !== 'enemy')
                      .map(rapper => (
                        <SelectItem key={`select_${rapper.id}`} value={rapper.id}>
                          {rapper.name} - {formatNumber(rapper.monthlyListeners)} listeners
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedRapperId && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Song Tier</label>
                    <Select 
                      value={selectedTier.toString()} 
                      onValueChange={(value) => setSelectedTier(parseInt(value) as SongTier)}
                    >
                      <SelectTrigger className="bg-amber-900/40 border-amber-700">
                        <SelectValue placeholder="Select song tier" />
                      </SelectTrigger>
                      <SelectContent className="bg-amber-950 border-amber-800 text-white">
                        <SelectItem value="3">
                          Tier 3: Normal - ${formatNumber(SONG_TIER_INFO[3].cost)}
                        </SelectItem>
                        <SelectItem value="4">
                          Tier 4: Hit - ${formatNumber(SONG_TIER_INFO[4].cost)}
                        </SelectItem>
                        <SelectItem value="5">
                          Tier 5: Banger - ${formatNumber(SONG_TIER_INFO[5].cost)}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900"
                      onClick={handleRequestFeature}
                    >
                      Request Feature
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiRappers.map(rapper => {
              // Calculate popularity ratio to estimate acceptance chance
              const popularityRatio = Math.min(1, totalMonthlyListeners / rapper.monthlyListeners);
              const relationshipModifier = 
                rapper.relationshipStatus === 'friend' ? 1.5 :
                rapper.relationshipStatus === 'rival' ? 0.5 :
                rapper.relationshipStatus === 'enemy' ? 0.1 :
                1.0; // neutral
              
              const estimatedAcceptanceChance = Math.min(1, popularityRatio * relationshipModifier * 0.5) * 100;
              
              return (
                <Card 
                  key={`artist_${rapper.id}`}
                  className="bg-black/30 border-gray-800"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{rapper.name}</h3>
                        <p className="text-sm text-gray-300">{rapper.style}</p>
                      </div>
                      <Badge className={getRelationshipBadge(rapper.relationshipStatus)}>
                        {rapper.relationshipStatus.charAt(0).toUpperCase() + rapper.relationshipStatus.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="my-3">
                      <div className="flex justify-between text-sm text-gray-300 mb-1">
                        <span>Popularity</span>
                        <span>{rapper.popularity}/100</span>
                      </div>
                      <ProgressBar
                        value={rapper.popularity}
                        max={100}
                        size="sm"
                        color={rapper.popularity >= 85 ? "success" : "default"}
                      />
                    </div>
                    
                    <div className="mb-3 flex justify-between items-center">
                      <span className="text-sm text-gray-300">Monthly Listeners:</span>
                      <span className="font-semibold text-amber-400">
                        {formatNumber(rapper.monthlyListeners)}
                      </span>
                    </div>
                    
                    <div className="mb-3 flex justify-between items-center">
                      <span className="text-sm text-gray-300">Collab Chance:</span>
                      <span className={`font-semibold ${
                        estimatedAcceptanceChance > 50 ? 'text-green-400' : 
                        estimatedAcceptanceChance > 20 ? 'text-amber-400' : 
                        'text-red-400'
                      }`}>
                        {Math.round(estimatedAcceptanceChance)}%
                      </span>
                    </div>
                    
                    <Button
                      className="w-full bg-amber-800 hover:bg-amber-700 mt-2"
                      onClick={() => {
                        setSelectedRapperId(rapper.id);
                        setActiveTab('artists');
                      }}
                      disabled={rapper.relationshipStatus === 'enemy'}
                    >
                      {rapper.relationshipStatus === 'enemy' 
                        ? "Can't Collaborate - Enemy" 
                        : "Request Feature"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <Card className="bg-amber-950/50 border-amber-800">
            <CardHeader>
              <CardTitle className="text-lg">Collaboration Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  You don't have any pending collaboration requests.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map(request => {
                    const rapper = aiRappers.find(r => r.id === request.rapperId);
                    if (!rapper) return null;
                    
                    return (
                      <Card key={`request_${request.rapperId}_${request.weekOffered}`} className="bg-black/30 border-gray-800">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-bold">{rapper.name}</h3>
                              <p className="text-xs text-gray-400">
                                Requested in Week {request.weekOffered}
                              </p>
                            </div>
                            <Badge className={`bg-amber-600`}>
                              Tier {request.songTier}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-gray-300 mb-4">
                            <p>
                              {rapper.name} wants you to feature on their upcoming {SONG_TIER_INFO[request.songTier].name.toLowerCase()} track.
                            </p>
                            <p className="mt-1">
                              This collaboration could help expand your audience and improve your relationship.
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              className="w-1/2 bg-green-700 hover:bg-green-600"
                              onClick={() => handleRespondToRequest(rapper.id, true)}
                            >
                              Accept
                            </Button>
                            <Button
                              className="w-1/2 bg-gray-700 hover:bg-gray-600"
                              onClick={() => handleRespondToRequest(rapper.id, false)}
                            >
                              Decline
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-black/30 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Past Collaborations</CardTitle>
            </CardHeader>
            <CardContent>
              {collaborationRequests.filter(req => req.accepted !== null).length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  You haven't participated in any collaborations yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {collaborationRequests
                    .filter(req => req.accepted !== null)
                    .sort((a, b) => b.weekOffered - a.weekOffered)
                    .map(request => {
                      const rapper = aiRappers.find(r => r.id === request.rapperId);
                      if (!rapper) return null;
                      
                      return (
                        <div 
                          key={`${request.rapperId}_${request.weekOffered}_${request.accepted ? 'accepted' : 'declined'}`}
                          className={`flex items-center justify-between p-3 rounded border ${
                            request.accepted 
                              ? 'bg-green-900/20 border-green-800' 
                              : 'bg-red-900/20 border-red-800'
                          }`}
                        >
                          <div>
                            <div className="font-medium">{rapper.name}</div>
                            <div className="text-xs text-gray-400">
                              Week {request.weekOffered} • Tier {request.songTier} Song
                            </div>
                          </div>
                          <Badge className={request.accepted ? 'bg-green-600' : 'bg-red-600'}>
                            {request.accepted ? 'Accepted' : 'Declined'}
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
