import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progressbar';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, MapPin, Users, Calendar, DollarSign, ArrowLeft, Check } from 'lucide-react';
import { formatMoney, formatNumber } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Define interfaces to avoid type errors
interface PastShow {
  venueId: string;
  week: number;
  revenue: number;
  attendance: number;
  performance: 'excellent' | 'good' | 'average' | 'poor';
}

// Extend the PlayerStats interface to add stagePower
interface ExtendedPlayerStats {
  careerLevel: number;
  reputation: number;
  wealth: number;
  creativity: number;
  marketing: number;
  networking: number;
  fanLoyalty: number;
  stagePower?: number;
}

export function TouringConcerts() {
  const { venues, stats, wealth, currentWeek, bookVenue, setScreen, pastShows } = useRapperGame() as any;
  const [selectedTab, setSelectedTab] = useState('venues');
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [showVenueDetails, setShowVenueDetails] = useState(false);

  // Function to book a venue
  const handleBookVenue = () => {
    if (!selectedVenue) return;
    
    const venue = venues?.find(v => v.id === selectedVenue);
    if (!venue) return;
    
    if (wealth < venue.cost) {
      toast.error("You don't have enough money to book this venue.");
      return;
    }
    
    if (stats.reputation < venue.reputationRequired) {
      toast.error("Your reputation isn't high enough for this venue yet.");
      return;
    }
    
    bookVenue(selectedVenue);
    toast.success(`Successfully booked ${venue.name}!`);
    setShowVenueDetails(false);
  };

  // Get a venue's capacity utilization based on reputation
  const getCapacityUtilization = (venueCapacity: number, requiredReputation: number) => {
    const reputationRatio = stats.reputation / requiredReputation;
    // Cap at 100%, but allow for lower percentages based on reputation
    const utilization = Math.min(100, Math.max(30, reputationRatio * 80)); 
    return Math.floor((utilization / 100) * venueCapacity);
  };

  // Calculate estimated revenue
  const calculateEstimatedRevenue = (venueCapacity: number, requiredReputation: number) => {
    const attendance = getCapacityUtilization(venueCapacity, requiredReputation);
    // Average ticket price varies by venue size
    const ticketPrice = requiredReputation < 40 ? 15 : 
                        requiredReputation < 60 ? 25 : 
                        requiredReputation < 80 ? 40 : 55;
    
    return attendance * ticketPrice;
  };

  // Group past shows by month
  const groupedShows = pastShows?.reduce((acc: Record<string, typeof pastShows>, show: any) => {
    // Simple month calculation based on week number (4 weeks per month)
    const month = Math.floor(show.week / 4) + 1;
    const year = 2025; // Assuming the game starts in 2025
    
    const key = `${year}-${month}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(show);
    return acc;
  }, {} as Record<string, typeof pastShows>);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-emerald-900 to-teal-950 text-white p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Mic className="mr-2 text-teal-400" size={28} />
          <div>
            <h1 className="text-2xl font-bold">Touring & Concerts</h1>
            <p className="text-sm text-gray-300">Book venues and perform live to grow your fanbase</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="bg-transparent border-gray-600 hover:bg-gray-800"
          onClick={() => setScreen('career_dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="bg-teal-950 border border-teal-800 w-full">
          <TabsTrigger value="venues" className="flex-1 data-[state=active]:bg-teal-800">
            Available Venues
          </TabsTrigger>
          <TabsTrigger value="past-shows" className="flex-1 data-[state=active]:bg-teal-800">
            Past Shows
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex-1 data-[state=active]:bg-teal-800">
            Performance Stats
          </TabsTrigger>
        </TabsList>
        
        {/* Venues Tab */}
        <TabsContent value="venues" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues?.map((venue) => (
              <Card 
                key={venue.id} 
                className={`
                  bg-black/30 border-teal-800 overflow-hidden cursor-pointer transition-all 
                  hover:shadow-lg hover:shadow-teal-900/40 hover:-translate-y-1
                  ${stats.reputation < venue.reputationRequired ? 'opacity-60' : 'opacity-100'}
                `}
                onClick={() => {
                  setSelectedVenue(venue.id);
                  setShowVenueDetails(true);
                }}
              >
                <div 
                  className="h-36 w-full bg-cover bg-center relative"
                  style={{
                    backgroundImage: venue.image ? `url(${venue.image})` : 'linear-gradient(to bottom right, rgb(13, 148, 136), rgb(15, 118, 110))'
                  }}
                >
                  {stats.reputation < venue.reputationRequired && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                      <div className="text-center px-4 py-2 rounded-md">
                        <span className="text-teal-400 flex items-center justify-center mb-1">
                          <Users className="h-4 w-4 mr-1" />
                          <span className="font-bold">{venue.reputationRequired}</span>
                        </span>
                        <span className="text-sm text-white">Reputation Required</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                    <div className="text-sm flex items-center">
                      <MapPin className="h-3 w-3 mr-1 text-teal-400" />
                      <span>{venue.city}, {venue.country}</span>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg">{venue.name}</h3>
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <div className="flex items-center text-gray-300">
                      <Users className="h-4 w-4 mr-1 text-gray-400" />
                      <span>Capacity: {formatNumber(venue.capacity)}</span>
                    </div>
                    <Badge variant="outline" className="bg-teal-900/50 text-teal-100 border-teal-800">
                      {venue.size}
                    </Badge>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-300 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-teal-400" />
                      <span>{formatMoney(venue.cost)}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-teal-700 hover:bg-teal-800 text-xs"
                    >
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Past Shows Tab */}
        <TabsContent value="past-shows" className="space-y-6">
          {groupedShows && Object.entries(groupedShows).length > 0 ? (
            Object.entries(groupedShows).sort((a, b) => b[0].localeCompare(a[0])).map(([monthKey, shows]) => {
              const [year, month] = monthKey.split('-').map(Number);
              
              const months = [
                'January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'
              ];
              
              return (
                <Card key={monthKey} className="bg-black/30 border-teal-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium text-teal-300">
                      {months[month - 1]} {year}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {shows.length} show{shows.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {shows.map((show: any) => {
                        const venue = venues?.find(v => v.id === show.venueId);
                        
                        return (
                          <div 
                            key={`${show.venueId}-${show.week}`} 
                            className="flex items-start p-3 rounded-md bg-black/20 border border-teal-900/50"
                          >
                            <div className="h-14 w-14 rounded overflow-hidden bg-teal-900/50 flex-shrink-0 mr-3">
                              {venue?.image ? (
                                <img 
                                  src={venue.image} 
                                  alt={venue.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Mic className="h-6 w-6 text-teal-400" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{venue?.name || 'Unknown Venue'}</h4>
                                  <div className="text-sm text-gray-400 flex items-center mt-1">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    <span>{venue?.city}, {venue?.country}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-teal-300 font-medium">{formatMoney(show.revenue)}</div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    Week {show.week}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-2 flex items-center text-sm">
                                <div className="flex items-center mr-4">
                                  <Users className="h-3 w-3 mr-1 text-gray-400" />
                                  <span>{formatNumber(show.attendance)} attended</span>
                                </div>
                                <div className="flex items-center">
                                  <span 
                                    className={`h-2 w-2 rounded-full mr-1 ${
                                      show.performance === 'excellent' ? 'bg-green-500' :
                                      show.performance === 'good' ? 'bg-blue-500' :
                                      show.performance === 'average' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                  />
                                  <span className="capitalize">{show.performance}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-12 bg-black/20 rounded-lg border border-teal-900/30">
              <Mic className="h-12 w-12 mx-auto text-teal-700 mb-4" />
              <h3 className="text-xl font-medium mb-2">No Shows Yet</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Book venues and perform live to build your performance history and gain fans.
              </p>
            </div>
          )}
        </TabsContent>
        
        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-black/30 border-teal-800">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Performance Stats</CardTitle>
                <CardDescription>Your impact on live audiences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">STAGE PRESENCE</h4>
                    <ProgressBar
                      value={stats.stagePower || 35}
                      max={100}
                      size="md"
                      showValue
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      How well you command the stage and connect with audiences
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">FAN LOYALTY</h4>
                    <ProgressBar
                      value={stats.fanLoyalty}
                      max={100}
                      size="md"
                      showValue
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      How devoted your fans are to attending your shows
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">SHOW QUALITY</h4>
                    <ProgressBar
                      value={Math.min(100, (stats.creativity + stats.marketing + (stats.stagePower || 35)) / 3)}
                      max={100}
                      size="md"
                      showValue
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Overall quality of your live performances
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-black/30 border-teal-800">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Performance History</CardTitle>
                <CardDescription>Your track record on stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-teal-900/30 rounded-lg p-4">
                      <div className="text-3xl font-bold">{pastShows?.length || 0}</div>
                      <div className="text-sm text-gray-300">Total Shows</div>
                    </div>
                    <div className="bg-teal-900/30 rounded-lg p-4">
                      <div className="text-3xl font-bold">
                        {formatMoney(pastShows?.reduce((sum: number, show: any) => sum + show.revenue, 0) || 0)}
                      </div>
                      <div className="text-sm text-gray-300">Total Revenue</div>
                    </div>
                  </div>
                  
                  <div className="bg-teal-900/20 rounded-lg p-4 border border-teal-900/30">
                    <h4 className="text-sm font-medium mb-4">PERFORMANCE QUALITY</h4>
                    <div className="grid grid-cols-2 gap-y-4">
                      <div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                          <span>Excellent</span>
                        </div>
                        <div className="text-xl font-bold ml-5 mt-1">
                          {pastShows?.filter((show: any) => show.performance === 'excellent').length || 0}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                          <span>Good</span>
                        </div>
                        <div className="text-xl font-bold ml-5 mt-1">
                          {pastShows?.filter((show: any) => show.performance === 'good').length || 0}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                          <span>Average</span>
                        </div>
                        <div className="text-xl font-bold ml-5 mt-1">
                          {pastShows?.filter((show: any) => show.performance === 'average').length || 0}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                          <span>Poor</span>
                        </div>
                        <div className="text-xl font-bold ml-5 mt-1">
                          {pastShows?.filter((show: any) => show.performance === 'poor').length || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    <p>
                      Better performances lead to increased fan loyalty, social media followers, and higher future attendance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Venue Booking Dialog */}
      {selectedVenue && (
        <Dialog open={showVenueDetails} onOpenChange={setShowVenueDetails}>
          <DialogContent className="bg-gray-900 border-teal-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {venues?.find(v => v.id === selectedVenue)?.name}
              </DialogTitle>
              <DialogDescription>
                {venues?.find(v => v.id === selectedVenue)?.city}, {venues?.find(v => v.id === selectedVenue)?.country}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="aspect-video rounded-md overflow-hidden bg-teal-950">
                {venues?.find(v => v.id === selectedVenue)?.image ? (
                  <img
                    src={venues?.find(v => v.id === selectedVenue)?.image}
                    alt={venues?.find(v => v.id === selectedVenue)?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Mic className="h-12 w-12 text-teal-500" />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-md p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Venue Size:</span>
                    <Badge variant="outline" className="bg-teal-900/50 text-teal-100 border-teal-800">
                      {venues?.find(v => v.id === selectedVenue)?.size}
                    </Badge>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Capacity:</span>
                    <span className="font-medium">
                      {formatNumber(venues?.find(v => v.id === selectedVenue)?.capacity || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Est. Attendance:</span>
                    <span className="font-medium">
                      {formatNumber(getCapacityUtilization(
                        venues?.find(v => v.id === selectedVenue)?.capacity || 0, 
                        venues?.find(v => v.id === selectedVenue)?.reputationRequired || 0
                      ))}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-md p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Booking Cost:</span>
                    <span className="font-medium text-teal-300">
                      {formatMoney(venues?.find(v => v.id === selectedVenue)?.cost || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Est. Revenue:</span>
                    <span className="font-medium text-green-400">
                      {formatMoney(calculateEstimatedRevenue(
                        venues?.find(v => v.id === selectedVenue)?.capacity || 0, 
                        venues?.find(v => v.id === selectedVenue)?.reputationRequired || 0
                      ))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Est. Profit:</span>
                    <span className={`font-medium ${
                      calculateEstimatedRevenue(
                        venues?.find(v => v.id === selectedVenue)?.capacity || 0, 
                        venues?.find(v => v.id === selectedVenue)?.reputationRequired || 0
                      ) > (venues?.find(v => v.id === selectedVenue)?.cost || 0) 
                      ? 'text-green-400' 
                      : 'text-red-400'
                    }`}>
                      {formatMoney(
                        calculateEstimatedRevenue(
                          venues?.find(v => v.id === selectedVenue)?.capacity || 0, 
                          venues?.find(v => v.id === selectedVenue)?.reputationRequired || 0
                        ) - (venues?.find(v => v.id === selectedVenue)?.cost || 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-teal-900/20 rounded-md p-4 border border-teal-800">
                <div className="flex items-center mb-3">
                  <Calendar className="h-4 w-4 mr-2 text-teal-400" />
                  <span className="font-medium">Performance Date</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  If booked, you'll perform at this venue during Week {currentWeek + 1}. Your performance quality will depend on your skills, reputation, and fan loyalty.
                </p>
                <div className="flex items-center text-sm">
                  <Check className="h-4 w-4 mr-2 text-teal-400" />
                  <span>Successful shows increase your reputation, fan loyalty, and followers.</span>
                </div>
              </div>
              
              <DialogFooter className="flex justify-between">
                <div className="text-sm text-gray-400 flex items-center">
                  <span>Your funds: {formatMoney(wealth)}</span>
                </div>
                
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    className="border-gray-700 hover:bg-gray-800"
                    onClick={() => setShowVenueDetails(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="default" 
                    className="bg-teal-700 hover:bg-teal-600"
                    onClick={handleBookVenue}
                    disabled={
                      stats.reputation < (venues?.find(v => v.id === selectedVenue)?.reputationRequired || 0) ||
                      wealth < (venues?.find(v => v.id === selectedVenue)?.cost || 0) ||
                      !pastShows
                    }
                  >
                    Book Venue ({formatMoney(venues?.find(v => v.id === selectedVenue)?.cost || 0)})
                  </Button>
                </div>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}