import React, { useState } from 'react';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ControversySeverity, ControversyType, ReleaseType } from '@/lib/types';
import { 
  AlertTriangleIcon, 
  ArrowLeftIcon, 
  BoltIcon, 
  FlameIcon, 
  HashIcon,
  MessageCircleIcon,
  TrendingUpIcon,
  Flame as FireIcon
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export function HypeAndControversyTester() {
  const { 
    setScreen, 
    currentWeek, 
    activeHypeEvents = [], 
    pastHypeEvents = [], 
    activeControversies = [], 
    pastControversies = [], 
    createHypeEvent, 
    updateHypeLevel, 
    announceRelease,
    completeRelease,
    generateControversy,
    respondToControversy,
    character,
    stats
  } = useRapperGame();

  const [activeTab, setActiveTab] = useState('hype');
  const [newHypeName, setNewHypeName] = useState('');
  const [newHypeType, setNewHypeType] = useState<ReleaseType>('single');
  const [targetWeek, setTargetWeek] = useState(currentWeek + 4);
  const [selectedHypeEvent, setSelectedHypeEvent] = useState<string | null>(null);
  const [selectedControversy, setSelectedControversy] = useState<string | null>(null);
  const [newControversyType, setNewControversyType] = useState<ControversyType>('offensive_tweet');
  const [newControversySeverity, setNewControversySeverity] = useState<ControversySeverity>('minor');

  // Handle creating a new hype event
  const handleCreateHypeEvent = () => {
    if (newHypeName && newHypeType && targetWeek > currentWeek) {
      const hypeEventId = createHypeEvent(newHypeType, newHypeName, targetWeek);
      setSelectedHypeEvent(hypeEventId);
      setNewHypeName('');
    }
  };

  // Handle boosting hype for an event
  const handleBoostHype = (hypeEventId: string, amount: number) => {
    updateHypeLevel(hypeEventId, amount);
  };

  // Handle announcing a release
  const handleAnnounceRelease = (hypeEventId: string) => {
    announceRelease(hypeEventId);
  };

  // Handle completing a release
  const handleCompleteRelease = (hypeEventId: string) => {
    completeRelease(hypeEventId);
  };

  // Handle creating a new controversy
  const handleCreateControversy = () => {
    const controversyId = generateControversy(newControversyType, newControversySeverity);
    setSelectedControversy(controversyId);
  };

  // Handle responding to a controversy
  const handleRespondToControversy = (controversyId: string, responseIndex: number) => {
    respondToControversy(controversyId, responseIndex);
  };

  // Get the selected hype event
  const selectedHypeEventData = activeHypeEvents.find(event => event.id === selectedHypeEvent) || 
                               pastHypeEvents.find(event => event.id === selectedHypeEvent);

  // Get the selected controversy
  const selectedControversyData = activeControversies.find(controversy => controversy.id === selectedControversy) ||
                                 pastControversies.find(controversy => controversy.id === selectedControversy);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setScreen('career_dashboard')}
            className="mr-2"
          >
            <ArrowLeftIcon size={16} className="mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Hype & Controversy Tester</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm opacity-70">Current Week: {currentWeek}</span>
          {character && (
            <div className="flex items-center bg-black/30 rounded-full px-3 py-1">
              <div 
                className="w-8 h-8 rounded-full bg-cover bg-center mr-2"
                style={{
                  backgroundImage: character.image 
                    ? `url(${character.image})` 
                    : 'linear-gradient(to right, #6366f1, #a855f7)'
                }}
              />
              <span className="font-semibold">{character.artistName}</span>
            </div>
          )}
        </div>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full mb-6">
          <TabsTrigger value="hype" className="flex items-center">
            <FireIcon size={16} className="mr-2 text-orange-400" />
            Hype System
          </TabsTrigger>
          <TabsTrigger value="controversy" className="flex items-center">
            <AlertTriangleIcon size={16} className="mr-2 text-red-400" />
            Controversy System
          </TabsTrigger>
        </TabsList>
        
        {/* Hype System Tab */}
        <TabsContent value="hype" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create new hype event */}
            <Card className="bg-black/30 border-orange-900/50">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FireIcon size={18} className="mr-2 text-orange-400" />
                  Create New Hype Event
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hype-name">Event Name</Label>
                  <Input 
                    id="hype-name"
                    value={newHypeName}
                    onChange={(e) => setNewHypeName(e.target.value)}
                    placeholder="Your next big single or album..."
                    className="bg-black/30 border-gray-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hype-type">Release Type</Label>
                  <Select 
                    value={newHypeType} 
                    onValueChange={(val) => setNewHypeType(val as ReleaseType)}
                  >
                    <SelectTrigger className="bg-black/30 border-gray-700" id="hype-type">
                      <SelectValue placeholder="Select release type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Release Types</SelectLabel>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="ep">EP</SelectItem>
                        <SelectItem value="album">Album</SelectItem>
                        <SelectItem value="deluxe">Deluxe Album</SelectItem>
                        <SelectItem value="tour">Tour</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="target-week">Target Release Week</Label>
                  <div className="flex space-x-2 items-center">
                    <Slider 
                      value={[targetWeek]} 
                      min={currentWeek + 1} 
                      max={currentWeek + 12}
                      step={1}
                      onValueChange={(vals) => setTargetWeek(vals[0])}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono bg-black/40 px-2 py-1 rounded">
                      Week {targetWeek}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {targetWeek - currentWeek} week{(targetWeek - currentWeek) !== 1 ? 's' : ''} from now
                  </div>
                </div>
                
                <Button 
                  onClick={handleCreateHypeEvent}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  disabled={!newHypeName || targetWeek <= currentWeek}
                >
                  <FireIcon size={16} className="mr-2" />
                  Start Building Hype
                </Button>
              </CardContent>
            </Card>
            
            {/* Active hype events */}
            <Card className="bg-black/30 border-orange-900/50">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUpIcon size={18} className="mr-2 text-orange-400" />
                  Active Hype Events ({activeHypeEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeHypeEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No active hype events. Create one to start building anticipation.
                  </div>
                ) : (
                  <ScrollArea className="h-[250px] pr-4">
                    <div className="space-y-3">
                      {activeHypeEvents.map(event => (
                        <div 
                          key={event.id}
                          className={`p-3 rounded-md border cursor-pointer transition-colors ${
                            selectedHypeEvent === event.id 
                              ? 'bg-orange-950/40 border-orange-600/50' 
                              : 'bg-black/20 border-gray-800 hover:border-orange-800/50'
                          }`}
                          onClick={() => setSelectedHypeEvent(event.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{event.name}</div>
                              <div className="flex items-center text-xs mt-1">
                                <span className="capitalize text-orange-400">{event.type}</span>
                                <span className="mx-1 text-gray-500">•</span>
                                <span className="text-gray-400">
                                  Week {event.targetReleaseWeek} ({event.targetReleaseWeek - currentWeek} week{(event.targetReleaseWeek - currentWeek) !== 1 ? 's' : ''} from now)
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center bg-black/40 rounded-full px-2 py-0.5 text-xs font-semibold">
                              <FireIcon size={12} className="mr-1 text-orange-500" />
                              {event.hypeLevel.toFixed(0)}%
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <Progress value={event.hypeLevel} max={100} className={cn("h-1.5 bg-gray-800")} />
                          </div>
                          
                          <div className="flex items-center mt-2 text-xs">
                            <span className={event.announced ? 'text-green-400' : 'text-gray-500'}>
                              {event.announced ? 'Announced' : 'Not Announced'}
                            </span>
                            <span className="mx-1 text-gray-500">•</span>
                            <span className={event.released ? 'text-green-400' : 'text-gray-500'}>
                              {event.released ? 'Released' : 'Not Released'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Selected hype event details */}
          {selectedHypeEventData && (
            <Card className="bg-black/30 border-orange-800/50">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  {selectedHypeEventData.type === 'single' && <HashIcon size={18} className="mr-2 text-orange-400" />}
                  {selectedHypeEventData.type === 'album' && <MessageCircleIcon size={18} className="mr-2 text-orange-400" />}
                  {selectedHypeEventData.type === 'tour' && <BoltIcon size={18} className="mr-2 text-orange-400" />}
                  {selectedHypeEventData.type === 'ep' && <FlameIcon size={18} className="mr-2 text-orange-400" />}
                  {selectedHypeEventData.type === 'deluxe' && <TrendingUpIcon size={18} className="mr-2 text-orange-400" />}
                  {selectedHypeEventData.name} Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-400">Type</div>
                    <div className="font-medium capitalize">{selectedHypeEventData.type}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-400">Created</div>
                    <div className="font-medium">Week {selectedHypeEventData.createdWeek}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-400">Target Release</div>
                    <div className="font-medium">
                      Week {selectedHypeEventData.targetReleaseWeek} 
                      {!selectedHypeEventData.released && (
                        <span className="text-sm text-gray-400 ml-1">
                          ({selectedHypeEventData.targetReleaseWeek - currentWeek} week{(selectedHypeEventData.targetReleaseWeek - currentWeek) !== 1 ? 's' : ''} from now)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-400">Status</div>
                    <div className="font-medium">
                      {selectedHypeEventData.released 
                        ? <span className="text-green-400">Released</span> 
                        : selectedHypeEventData.announced 
                          ? <span className="text-blue-400">Announced</span>
                          : <span className="text-yellow-400">Building Hype</span>
                      }
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">Current Hype Level</div>
                    <div className="font-medium text-orange-400">{selectedHypeEventData.hypeLevel.toFixed(0)}%</div>
                  </div>
                  <Progress 
                    value={selectedHypeEventData.hypeLevel} 
                    max={100} 
                    className={cn("h-2.5 bg-gray-800")}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                <Separator className="bg-gray-800" />
                
                <div className="space-y-2">
                  <Label>Boost Hype</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      className="border-green-800 bg-black/30 hover:bg-green-950/30"
                      onClick={() => handleBoostHype(selectedHypeEventData.id, 5)}
                      disabled={selectedHypeEventData.released}
                    >
                      +5%
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-amber-800 bg-black/30 hover:bg-amber-950/30"
                      onClick={() => handleBoostHype(selectedHypeEventData.id, 10)}
                      disabled={selectedHypeEventData.released}
                    >
                      +10%
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-orange-800 bg-black/30 hover:bg-orange-950/30"
                      onClick={() => handleBoostHype(selectedHypeEventData.id, 20)}
                      disabled={selectedHypeEventData.released}
                    >
                      +20%
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="border-blue-800 bg-black/30 hover:bg-blue-950/30"
                    onClick={() => handleAnnounceRelease(selectedHypeEventData.id)}
                    disabled={selectedHypeEventData.announced || selectedHypeEventData.released}
                  >
                    Announce Release
                  </Button>
                  <Button 
                    variant="default" 
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                    onClick={() => handleCompleteRelease(selectedHypeEventData.id)}
                    disabled={selectedHypeEventData.released}
                  >
                    Complete Release
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Past hype events */}
          {pastHypeEvents.length > 0 && (
            <Card className="bg-black/30 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FireIcon size={18} className="mr-2 text-gray-400" />
                  Past Hype Events ({pastHypeEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-3">
                    {pastHypeEvents.map(event => (
                      <div 
                        key={event.id}
                        className={`p-3 rounded-md border cursor-pointer transition-colors ${
                          selectedHypeEvent === event.id 
                            ? 'bg-gray-950 border-gray-600' 
                            : 'bg-black/20 border-gray-800 hover:border-gray-700'
                        }`}
                        onClick={() => setSelectedHypeEvent(event.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{event.name}</div>
                            <div className="flex items-center text-xs mt-1">
                              <span className="capitalize text-gray-400">{event.type}</span>
                              <span className="mx-1 text-gray-500">•</span>
                              <span className="text-gray-500">
                                Released Week {event.targetReleaseWeek}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center bg-black/40 rounded-full px-2 py-0.5 text-xs font-semibold">
                            <FireIcon size={12} className="mr-1 text-gray-500" />
                            {event.hypeLevel.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Controversy System Tab */}
        <TabsContent value="controversy" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create a new controversy */}
            <Card className="bg-black/30 border-red-900/50">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <AlertTriangleIcon size={18} className="mr-2 text-red-400" />
                  Generate Controversy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="controversy-type">Controversy Type</Label>
                  <Select 
                    value={newControversyType} 
                    onValueChange={(val) => setNewControversyType(val as ControversyType)}
                  >
                    <SelectTrigger className="bg-black/30 border-gray-700" id="controversy-type">
                      <SelectValue placeholder="Select controversy type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Controversy Types</SelectLabel>
                        <SelectItem value="offensive_tweet">Offensive Tweet</SelectItem>
                        <SelectItem value="leaked_audio">Leaked Audio</SelectItem>
                        <SelectItem value="public_feud">Public Feud</SelectItem>
                        <SelectItem value="relationship_drama">Relationship Drama</SelectItem>
                        <SelectItem value="inappropriate_comments">Inappropriate Comments</SelectItem>
                        <SelectItem value="substance_abuse">Substance Abuse</SelectItem>
                        <SelectItem value="legal_trouble">Legal Trouble</SelectItem>
                        <SelectItem value="conspiracy_theory">Conspiracy Theory</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="controversy-severity">Severity</Label>
                  <Select 
                    value={newControversySeverity} 
                    onValueChange={(val) => setNewControversySeverity(val as ControversySeverity)}
                  >
                    <SelectTrigger className="bg-black/30 border-gray-700" id="controversy-severity">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Severity Levels</SelectLabel>
                        <SelectItem value="minor">Minor</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="major">Major</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-gray-400">
                    {newControversySeverity === 'minor' && 'Minor controversies have minimal impact on your career'}
                    {newControversySeverity === 'moderate' && 'Moderate controversies can impact your reputation and followers'}
                    {newControversySeverity === 'major' && 'Major controversies will significantly affect your reputation and streams'}
                    {newControversySeverity === 'severe' && 'Severe controversies can be career-damaging if not handled properly'}
                  </div>
                </div>
                
                <Button 
                  onClick={handleCreateControversy}
                  className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700"
                >
                  <AlertTriangleIcon size={16} className="mr-2" />
                  Generate Controversy
                </Button>
              </CardContent>
            </Card>
            
            {/* Active controversies */}
            <Card className="bg-black/30 border-red-900/50">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <AlertTriangleIcon size={18} className="mr-2 text-red-400" />
                  Active Controversies ({activeControversies.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeControversies.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No active controversies. Your reputation is clean... for now.
                  </div>
                ) : (
                  <ScrollArea className="h-[250px] pr-4">
                    <div className="space-y-3">
                      {activeControversies.map(controversy => (
                        <div 
                          key={controversy.id}
                          className={`p-3 rounded-md border cursor-pointer transition-colors ${
                            selectedControversy === controversy.id 
                              ? 'bg-red-950/40 border-red-600/50' 
                              : 'bg-black/20 border-gray-800 hover:border-red-800/50'
                          }`}
                          onClick={() => setSelectedControversy(controversy.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{controversy.title}</div>
                              <div className="text-xs mt-1 text-gray-400">
                                Started Week {controversy.week}
                              </div>
                            </div>
                            <div className="flex items-center bg-black/40 rounded-full px-2 py-0.5 text-xs font-semibold">
                              <span className={
                                controversy.severity === 'minor' ? 'text-yellow-400' :
                                controversy.severity === 'moderate' ? 'text-orange-400' :
                                controversy.severity === 'major' ? 'text-red-400' :
                                'text-red-600'
                              }>
                                {controversy.severity.charAt(0).toUpperCase() + controversy.severity.slice(1)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-2 text-sm">
                            <p className="line-clamp-2 text-gray-300">{controversy.description}</p>
                          </div>
                          
                          <div className="flex items-center mt-2 text-xs">
                            <span className="text-gray-500">
                              {controversy.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </span>
                            {controversy.isActive && (
                              <>
                                <span className="mx-1 text-gray-500">•</span>
                                <span className="text-red-400">
                                  Requires Response
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Selected controversy details */}
          {selectedControversyData && (
            <Card className="bg-black/30 border-red-800/50">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <AlertTriangleIcon size={18} className="mr-2 text-red-400" />
                  Controversy Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold">{selectedControversyData.title}</h3>
                  <div className="flex items-center mt-1 text-sm">
                    <span className={
                      selectedControversyData.severity === 'minor' ? 'text-yellow-400' :
                      selectedControversyData.severity === 'moderate' ? 'text-orange-400' :
                      selectedControversyData.severity === 'major' ? 'text-red-400' :
                      'text-red-600'
                    }>
                      {selectedControversyData.severity.charAt(0).toUpperCase() + selectedControversyData.severity.slice(1)} Severity
                    </span>
                    <span className="mx-1 text-gray-500">•</span>
                    <span className="text-gray-400">
                      Week {selectedControversyData.week}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 bg-black/20 rounded-md border border-gray-800">
                  <p className="text-gray-300">{selectedControversyData.description}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-400">Impact on Reputation</div>
                    <div className="font-medium text-red-400">{selectedControversyData.impactOnReputation > 0 ? '+' : ''}{selectedControversyData.impactOnReputation}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-400">Impact on Streams</div>
                    <div className={`font-medium ${selectedControversyData.impactOnStreams >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedControversyData.impactOnStreams > 0 ? '+' : ''}{selectedControversyData.impactOnStreams}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-400">Impact on Followers</div>
                    <div className="font-medium text-red-400">{selectedControversyData.impactOnFollowers > 0 ? '+' : ''}{selectedControversyData.impactOnFollowers}%</div>
                  </div>
                </div>
                
                <Separator className="bg-gray-800" />
                
                {selectedControversyData.isActive ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Response Options:</h4>
                    <div className="space-y-2">
                      {selectedControversyData.responseOptions.map((option, index) => (
                        <Button 
                          key={index}
                          variant="outline" 
                          className="w-full justify-start p-3 h-auto text-left border-gray-700 bg-black/30 hover:bg-gray-900/50"
                          onClick={() => handleRespondToControversy(selectedControversyData.id, index)}
                        >
                          <div>
                            <div className="font-medium">{option.text}</div>
                            <div className="text-xs mt-1 flex space-x-2">
                              <span className={option.reputationModifier >= 0 ? 'text-green-400' : 'text-red-400'}>
                                Rep: {option.reputationModifier > 0 ? '+' : ''}{option.reputationModifier}
                              </span>
                              <span className={option.streamModifier >= 0 ? 'text-green-400' : 'text-red-400'}>
                                Streams: {option.streamModifier > 0 ? '+' : ''}{option.streamModifier}%
                              </span>
                              <span className={option.followerModifier >= 0 ? 'text-green-400' : 'text-red-400'}>
                                Followers: {option.followerModifier > 0 ? '+' : ''}{option.followerModifier}%
                              </span>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Your Response:</h4>
                    <div className="p-3 border border-gray-700 bg-black/30 rounded-md">
                      {selectedControversyData.selectedResponse !== undefined ? (
                        <div>
                          <div className="font-medium">{selectedControversyData.responseOptions[selectedControversyData.selectedResponse].text}</div>
                          <div className="text-xs mt-1 flex space-x-2">
                            <span className={selectedControversyData.responseOptions[selectedControversyData.selectedResponse].reputationModifier >= 0 ? 'text-green-400' : 'text-red-400'}>
                              Rep: {selectedControversyData.responseOptions[selectedControversyData.selectedResponse].reputationModifier > 0 ? '+' : ''}{selectedControversyData.responseOptions[selectedControversyData.selectedResponse].reputationModifier}
                            </span>
                            <span className={selectedControversyData.responseOptions[selectedControversyData.selectedResponse].streamModifier >= 0 ? 'text-green-400' : 'text-red-400'}>
                              Streams: {selectedControversyData.responseOptions[selectedControversyData.selectedResponse].streamModifier > 0 ? '+' : ''}{selectedControversyData.responseOptions[selectedControversyData.selectedResponse].streamModifier}%
                            </span>
                            <span className={selectedControversyData.responseOptions[selectedControversyData.selectedResponse].followerModifier >= 0 ? 'text-green-400' : 'text-red-400'}>
                              Followers: {selectedControversyData.responseOptions[selectedControversyData.selectedResponse].followerModifier > 0 ? '+' : ''}{selectedControversyData.responseOptions[selectedControversyData.selectedResponse].followerModifier}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400">
                          This controversy was resolved without a direct response.
                        </div>
                      )}
                    </div>
                    {selectedControversyData.resolvedWeek && (
                      <div className="text-sm text-gray-400 text-center">
                        Resolved in Week {selectedControversyData.resolvedWeek}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Past controversies */}
          {pastControversies.length > 0 && (
            <Card className="bg-black/30 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <AlertTriangleIcon size={18} className="mr-2 text-gray-400" />
                  Past Controversies ({pastControversies.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-3">
                    {pastControversies.map(controversy => (
                      <div 
                        key={controversy.id}
                        className={`p-3 rounded-md border cursor-pointer transition-colors ${
                          selectedControversy === controversy.id 
                            ? 'bg-gray-950 border-gray-600' 
                            : 'bg-black/20 border-gray-800 hover:border-gray-700'
                        }`}
                        onClick={() => setSelectedControversy(controversy.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{controversy.title}</div>
                            <div className="text-xs mt-1 text-gray-500">
                              Weeks {controversy.week} - {controversy.resolvedWeek}
                            </div>
                          </div>
                          <div className="flex items-center bg-black/40 rounded-full px-2 py-0.5 text-xs font-semibold">
                            <span className={
                              controversy.severity === 'minor' ? 'text-yellow-500' :
                              controversy.severity === 'moderate' ? 'text-orange-500' :
                              controversy.severity === 'major' ? 'text-red-500' :
                              'text-red-600'
                            }>
                              {controversy.severity.charAt(0).toUpperCase() + controversy.severity.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}