import React, { useEffect, useState } from 'react';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { MarketTrend } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import { BarChart2, TrendingUp, TrendingDown, Flame, Check, AlertTriangle, Info } from 'lucide-react';

// Functions to generate trend colors based on type
const getTrendColor = (type: string): string => {
  switch (type) {
    case 'rising': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'falling': return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'hot': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'stable': return 'bg-green-500/10 text-green-500 border-green-500/20';
    default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  }
};

const getTrendIcon = (type: string): JSX.Element => {
  switch (type) {
    case 'rising': return <TrendingUp className="w-4 h-4 mr-1" />;
    case 'falling': return <TrendingDown className="w-4 h-4 mr-1" />;
    case 'hot': return <Flame className="w-4 h-4 mr-1" />;
    case 'stable': return <Check className="w-4 h-4 mr-1" />;
    default: return <Info className="w-4 h-4 mr-1" />;
  }
};

const getTrendBadgeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (type) {
    case 'rising': return 'secondary';
    case 'falling': return 'destructive';
    case 'hot': return 'destructive';
    case 'stable': return 'outline';
    default: return 'default';
  }
};

// Helper function to calculate remaining weeks
const getRemainingWeeks = (trend: MarketTrend, currentWeek: number): number => {
  return trend.startWeek + trend.duration - currentWeek;
};

// Component for trend badges
const TrendBadge: React.FC<{ type: string }> = ({ type }) => {
  const color = getTrendColor(type);
  const Icon = getTrendIcon(type);
  const variant = getTrendBadgeVariant(type);
  
  return (
    <Badge variant={variant} className="capitalize flex items-center">
      {Icon}
      {type}
    </Badge>
  );
};

interface PlatformImpactData {
  platform: string;
  impact: number;
}

const TrendImpactChart: React.FC<{ trends: MarketTrend[] }> = ({ trends }) => {
  // Aggregate impact by platform
  const platformImpacts: Record<string, number> = {};
  
  // Find all unique platforms affected by trends
  const allPlatforms = new Set<string>();
  trends.forEach(trend => {
    trend.affectedPlatforms.forEach(platform => allPlatforms.add(platform));
  });
  
  // Initialize all platforms with zero impact
  allPlatforms.forEach(platform => {
    platformImpacts[platform] = 0;
  });
  
  // Calculate impact for each platform
  trends.forEach(trend => {
    trend.affectedPlatforms.forEach(platform => {
      let impactMultiplier = 1;
      
      switch (trend.type) {
        case 'rising':
          impactMultiplier = 1;
          break;
        case 'falling':
          impactMultiplier = -1;
          break;
        case 'hot':
          impactMultiplier = 2;
          break;
        case 'stable':
          impactMultiplier = 0.5;
          break;
      }
      
      platformImpacts[platform] += trend.impactFactor * impactMultiplier;
    });
  });
  
  // Convert to array for chart
  const data: PlatformImpactData[] = Object.keys(platformImpacts).map(platform => ({
    platform,
    impact: platformImpacts[platform]
  }));
  
  // Generate colors based on impact
  const getBarColor = (impact: number) => {
    if (impact > 5) return '#22c55e'; // green for highly positive
    if (impact > 0) return '#3b82f6'; // blue for positive
    if (impact > -5) return '#f97316'; // orange for slightly negative
    return '#ef4444'; // red for very negative
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <BarChart2 className="w-5 h-5 mr-2" />
          Platform Impact
        </CardTitle>
        <CardDescription>
          How current trends are affecting each platform's growth
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="platform" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`Impact: ${value}`, 'Market Impact']}
                labelFormatter={(value) => `Platform: ${value}`}
              />
              <Legend />
              <Bar 
                dataKey="impact" 
                fill="#3b82f6" 
                name="Market Impact"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

interface TrendDetailProps {
  trend: MarketTrend;
  currentWeek: number;
}

const TrendDetail: React.FC<TrendDetailProps> = ({ trend, currentWeek }) => {
  const remainingWeeks = getRemainingWeeks(trend, currentWeek);
  const alertVariant = trend.type === 'hot' || trend.type === 'rising' ? 'success' : 'destructive';
  
  return (
    <Card className={`mb-4 border ${getTrendColor(trend.type)}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center">
              {getTrendIcon(trend.type)}
              {trend.name}
            </CardTitle>
            <CardDescription className="mt-1">
              Started week {trend.startWeek} • {remainingWeeks} {remainingWeeks === 1 ? 'week' : 'weeks'} remaining
            </CardDescription>
          </div>
          <TrendBadge type={trend.type} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-3">{trend.description}</p>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <div className="text-xs">Affected platforms:</div>
          {trend.affectedPlatforms.map(platform => (
            <Badge variant="outline" key={platform}>
              {platform}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          <div className="text-xs">Impact level:</div>
          <div className="flex items-center">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-4 mx-0.5 rounded-sm ${i < trend.impactFactor ? (trend.type === 'falling' ? 'bg-red-500' : 'bg-blue-500') : 'bg-gray-200'}`}
              />
            ))}
          </div>
          <span className="text-xs font-medium ml-2">{trend.impactFactor}/10</span>
        </div>
      </CardContent>
    </Card>
  );
};

const MarketTrends: React.FC = () => {
  const gameState = useRapperGame();
  const { activeMarketTrends = [], pastMarketTrends = [], currentWeek, generateMarketTrend } = gameState;
  const [showDialog, setShowDialog] = useState(false);
  
  // Check if there are no active trends to show alert
  const noActiveTrends = activeMarketTrends.length === 0;
  
  // Generate a new trend
  const handleGenerateMarketTrend = () => {
    const newTrend = generateMarketTrend();
    setShowDialog(true);
  };
  
  // Generate a new random trend if there are none
  useEffect(() => {
    if (noActiveTrends && Math.random() > 0.7) {
      generateMarketTrend();
    }
  }, [currentWeek]);
  
  return (
    <div className="market-trends-container">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Market Trends</h2>
        <Button onClick={handleGenerateMarketTrend} className="flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          Analyze Market
        </Button>
      </div>
      
      {noActiveTrends ? (
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No active market trends</AlertTitle>
          <AlertDescription>
            The music streaming market is currently stable without any significant trends.
            Click "Analyze Market" to spot emerging trends and opportunities.
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="active">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Active Trends ({activeMarketTrends.length})</TabsTrigger>
            <TabsTrigger value="past">Past Trends ({pastMarketTrends.length})</TabsTrigger>
            <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            <ScrollArea className="h-[500px] pr-4">
              {activeMarketTrends.map(trend => (
                <TrendDetail 
                  key={trend.id} 
                  trend={trend} 
                  currentWeek={currentWeek} 
                />
              ))}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="past">
            <ScrollArea className="h-[500px] pr-4">
              {pastMarketTrends.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No past market trends available yet.</p>
              ) : (
                pastMarketTrends.map(trend => (
                  <TrendDetail 
                    key={trend.id} 
                    trend={{...trend, type: trend.type}} 
                    currentWeek={currentWeek} 
                  />
                ))
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="impact">
            {activeMarketTrends.length > 0 ? (
              <TrendImpactChart trends={activeMarketTrends} />
            ) : (
              <p className="text-center py-8 text-muted-foreground">No active trends to analyze.</p>
            )}
          </TabsContent>
        </Tabs>
      )}
      
      {/* Dialog for new trend notification */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Market Trend Detected!</DialogTitle>
            <DialogDescription>
              Your analysts have identified a new market trend that could affect your music's performance.
            </DialogDescription>
          </DialogHeader>
          
          {activeMarketTrends.length > 0 && (
            <TrendDetail 
              trend={activeMarketTrends[activeMarketTrends.length - 1]} 
              currentWeek={currentWeek} 
            />
          )}
          
          <p className="text-sm mt-2">
            This trend will affect how your music performs on the affected platforms.
            Adjust your release strategy accordingly to maximize success.
          </p>
          
          <Button onClick={() => setShowDialog(false)} className="w-full mt-2">
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketTrends;