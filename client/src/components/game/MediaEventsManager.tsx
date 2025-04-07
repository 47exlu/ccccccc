import React, { useState } from 'react';
import { useRapperGame } from '../../lib/stores/useRapperGame';
import { MediaEvent, MediaEventType, MediaEventSize } from '../../lib/types';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { ArrowLeft, Calendar, DollarSign, Trophy, Users, Music, Check, X, Star } from 'lucide-react';
import { formatMoney } from '../../lib/utils';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';

export const MediaEventsManager: React.FC = () => {
  const { 
    setScreen, 
    upcomingMediaEvents, 
    invitedMediaEvents, 
    confirmedMediaEvents, 
    completedMediaEvents, 
    confirmMediaEvent, 
    cancelMediaEvent, 
    completeMediaEvent,
    completeMediaEventPreparationTask,
    stats,
    currentWeek,
  } = useRapperGame();
  
  const [activeTab, setActiveTab] = useState('invited');
  
  // Helper function to get badge color based on event type
  const getEventTypeBadge = (type: MediaEventType) => {
    switch (type) {
      case 'festival':
        return <Badge className="bg-purple-500">Festival</Badge>;
      case 'talk_show':
        return <Badge className="bg-blue-500">Talk Show</Badge>;
      case 'interview':
        return <Badge className="bg-green-500">Interview</Badge>;
      case 'podcast':
        return <Badge className="bg-orange-500">Podcast</Badge>;
      case 'award_show':
        return <Badge className="bg-yellow-500">Award Show</Badge>;
      default:
        return <Badge>Event</Badge>;
    }
  };
  
  // Helper function to get badge for event size
  const getEventSizeBadge = (size: MediaEventSize) => {
    switch (size) {
      case 'small':
        return <Badge variant="outline" className="border-gray-400 text-gray-600">Small</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-blue-400 text-blue-600">Medium</Badge>;
      case 'large':
        return <Badge variant="outline" className="border-green-400 text-green-600">Large</Badge>;
      case 'major':
        return <Badge variant="outline" className="border-purple-400 text-purple-600">Major</Badge>;
      default:
        return null;
    }
  };
  
  // Render invited events section
  const renderInvitedEvents = () => {
    if (!invitedMediaEvents || invitedMediaEvents.length === 0) {
      return (
        <Card className="bg-black/20 mb-4 p-6 text-center">
          <p className="text-gray-400">You don't have any event invitations at the moment.</p>
          <p className="text-gray-500 text-sm mt-2">
            Invitations come as your reputation grows. Higher reputation will lead to better opportunities.
          </p>
        </Card>
      );
    }
    
    return invitedMediaEvents.map(event => (
      <Card key={event.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{event.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" /> Week {event.week}
                <span className="mx-1">·</span>
                <Users className="h-4 w-4" /> {event.reputationRequired}+ rep required
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {getEventTypeBadge(event.type)}
              {getEventSizeBadge(event.size)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 mb-3">{event.description}</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center bg-black/20 p-3 rounded-md">
              <Trophy className="h-5 w-5 text-yellow-500 mb-1" />
              <span className="text-sm text-gray-400">Reputation</span>
              <span className="font-bold">+{event.reputationGain}</span>
            </div>
            <div className="flex flex-col items-center bg-black/20 p-3 rounded-md">
              <Users className="h-5 w-5 text-blue-500 mb-1" />
              <span className="text-sm text-gray-400">Followers</span>
              <span className="font-bold">+{event.followerGain}</span>
            </div>
            <div className="flex flex-col items-center bg-black/20 p-3 rounded-md">
              <DollarSign className="h-5 w-5 text-green-500 mb-1" />
              <span className="text-sm text-gray-400">Payout</span>
              <span className="font-bold">${event.payout.toLocaleString()}</span>
            </div>
          </div>
          
          {event.cost > 0 && (
            <div className="mt-3 p-2 bg-black/30 rounded-md">
              <span className="text-yellow-400"><DollarSign className="h-4 w-4 inline" /> Cost to attend: </span>
              <span className="font-bold">${event.cost.toLocaleString()}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0">
          <div className="flex gap-2 w-full">
            <Button 
              variant="default" 
              className="flex-1"
              onClick={() => confirmMediaEvent(event.id)}
              disabled={stats.reputation < event.reputationRequired || stats.wealth < event.cost}
            >
              <Check className="h-4 w-4 mr-2" />
              Confirm
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => cancelMediaEvent(event.id)}
            >
              <X className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </div>
        </CardFooter>
      </Card>
    ));
  };
  
  // Render confirmed events section
  const renderConfirmedEvents = () => {
    if (!confirmedMediaEvents || confirmedMediaEvents.length === 0) {
      return (
        <Card className="bg-black/20 mb-4 p-6 text-center">
          <p className="text-gray-400">You haven't confirmed any events yet.</p>
          <p className="text-gray-500 text-sm mt-2">
            Check the "Invited" tab to see if you have any pending invitations.
          </p>
        </Card>
      );
    }
    
    return confirmedMediaEvents.map(event => {
      const isUpcoming = event.week > currentWeek;
      const isCurrentWeek = event.week === currentWeek;
      const weeksDifference = event.week - currentWeek;
      
      return (
        <Card key={event.id} className={`mb-4 ${isCurrentWeek ? 'border border-green-500' : ''}`}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{event.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" /> 
                  {isCurrentWeek 
                    ? <span className="text-green-500 font-bold">This week!</span> 
                    : isUpcoming 
                      ? `${weeksDifference} week${weeksDifference > 1 ? 's' : ''} from now` 
                      : 'Ready to complete'}
                  <span className="mx-1">·</span>
                  <span>{event.host}</span>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {getEventTypeBadge(event.type)}
                {getEventSizeBadge(event.size)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-3">{event.description}</p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="flex flex-col items-center bg-black/20 p-3 rounded-md">
                <Trophy className="h-5 w-5 text-yellow-500 mb-1" />
                <span className="text-sm text-gray-400">Reputation</span>
                <span className="font-bold">+{event.reputationGain}</span>
              </div>
              <div className="flex flex-col items-center bg-black/20 p-3 rounded-md">
                <Users className="h-5 w-5 text-blue-500 mb-1" />
                <span className="text-sm text-gray-400">Followers</span>
                <span className="font-bold">+{event.followerGain}</span>
              </div>
              <div className="flex flex-col items-center bg-black/20 p-3 rounded-md">
                <DollarSign className="h-5 w-5 text-green-500 mb-1" />
                <span className="text-sm text-gray-400">Payout</span>
                <span className="font-bold">${event.payout.toLocaleString()}</span>
              </div>
            </div>
            
            {event.preparationTasks && event.preparationTasks.length > 0 && (
              <div className="mt-3">
                <h3 className="text-sm font-medium mb-2">Preparation Tasks</h3>
                {event.preparationTasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`mb-2 p-2 rounded-md flex justify-between items-center ${
                      task.completed ? 'bg-green-900/30' : 'bg-black/30'
                    }`}
                  >
                    <div className="flex items-center">
                      {task.completed ? 
                        <Check className="h-4 w-4 text-green-500 mr-2" /> : 
                        <div className="h-4 w-4 border border-gray-500 rounded-sm mr-2" />
                      }
                      <span className={task.completed ? 'text-green-400' : 'text-gray-300'}>
                        {task.description}
                      </span>
                    </div>
                    {!task.completed && (
                      <Button 
                        size="sm" 
                        onClick={() => completeMediaEventPreparationTask(event.id, task.id)}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <div className="flex gap-2 w-full">
              <Button 
                variant="default" 
                className="flex-1"
                onClick={() => completeMediaEvent(event.id)}
                disabled={isUpcoming}
              >
                <Star className="h-4 w-4 mr-2" />
                {isUpcoming ? `Scheduled for Week ${event.week}` : 'Complete Event'}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => cancelMediaEvent(event.id)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardFooter>
        </Card>
      );
    });
  };
  
  // Render completed events section
  const renderCompletedEvents = () => {
    if (!completedMediaEvents || completedMediaEvents.length === 0) {
      return (
        <Card className="bg-black/20 mb-4 p-6 text-center">
          <p className="text-gray-400">You haven't completed any events yet.</p>
        </Card>
      );
    }
    
    return completedMediaEvents.map(event => (
      <Card key={event.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{event.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" /> Week {event.week}
                <span className="mx-1">·</span>
                <span>{event.host}</span>
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {getEventTypeBadge(event.type)}
              {getEventSizeBadge(event.size)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {event.performanceQuality !== undefined && (
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-400">Performance Quality</span>
                <span className="font-bold">{event.performanceQuality}/100</span>
              </div>
              <Progress value={event.performanceQuality} className="h-2" />
            </div>
          )}
          
          {event.highlights && event.highlights.length > 0 && (
            <div className="mb-3">
              <h3 className="text-sm font-medium mb-2">Highlights</h3>
              <ul className="list-disc pl-5 space-y-1">
                {event.highlights.map((highlight, index) => (
                  <li key={index} className="text-gray-300">{highlight}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    ));
  };
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => setScreen("career_dashboard")}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Career
        </Button>
        <h1 className="text-2xl font-bold">Media Appearances</h1>
        <div className="w-40">
          <span className="text-sm text-gray-400">Current Week: {currentWeek}</span>
        </div>
      </div>
      
      <Tabs
        defaultValue="invited"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList className="grid grid-cols-3 mb-8 w-full">
          <TabsTrigger value="invited" className="relative">
            Invitations
            {invitedMediaEvents && invitedMediaEvents.length > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-blue-500">
                {invitedMediaEvents.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="relative">
            Confirmed
            {confirmedMediaEvents && confirmedMediaEvents.length > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-green-500">
                {confirmedMediaEvents.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="invited">
          {renderInvitedEvents()}
        </TabsContent>
        
        <TabsContent value="confirmed">
          {renderConfirmedEvents()}
        </TabsContent>
        
        <TabsContent value="completed">
          {renderCompletedEvents()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MediaEventsManager;