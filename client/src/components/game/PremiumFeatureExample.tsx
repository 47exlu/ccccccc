// PremiumFeatureExample.tsx - Example component showing how to use PremiumFeatureGate
import React from 'react';
import PremiumFeatureGate from '../premium/PremiumFeatureGate';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { Headphones, Crown, Diamond, Music, Rocket, Star, Trophy } from 'lucide-react';

/**
 * PremiumFeatureExample
 * 
 * A sample component showing how to use the PremiumFeatureGate component
 * to restrict access to features based on subscription tier.
 */
export function PremiumFeatureExample() {
  const { subscriptionInfo } = useRapperGame();
  const { isSubscribed, subscriptionType } = subscriptionInfo;
  
  return (
    <div className="p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Premium Features Example</h1>
        <p className="text-gray-500">
          This example shows how premium features can be gated based on subscription tier.
          Your current subscription: {isSubscribed ? subscriptionType.charAt(0).toUpperCase() + subscriptionType.slice(1) : 'None'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Features - Available to all users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-blue-500" />
              Basic Feature
            </CardTitle>
            <CardDescription>Available to all users</CardDescription>
          </CardHeader>
          <CardContent className="h-40 flex items-center justify-center">
            <div className="text-center">
              <Music className="h-12 w-12 mx-auto text-blue-400 mb-2" />
              <p>Basic music tools</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Use Feature</Button>
          </CardFooter>
        </Card>
        
        {/* Standard Premium Feature */}
        <PremiumFeatureGate
          feature="standard"
          description="This feature requires a Standard subscription or higher."
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-500" />
                Standard Feature
              </CardTitle>
              <CardDescription>Standard subscription required</CardDescription>
            </CardHeader>
            <CardContent className="h-40 flex items-center justify-center">
              <div className="text-center">
                <Trophy className="h-12 w-12 mx-auto text-blue-400 mb-2" />
                <p>Enhanced music production tools</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Use Feature</Button>
            </CardFooter>
          </Card>
        </PremiumFeatureGate>
        
        {/* Premium Feature */}
        <PremiumFeatureGate
          feature="premium"
          description="This feature requires a Premium subscription or higher."
        >
          <Card>
            <CardHeader className="bg-purple-50">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Crown className="h-5 w-5 text-purple-500" />
                Premium Feature
              </CardTitle>
              <CardDescription className="text-purple-600">Premium subscription required</CardDescription>
            </CardHeader>
            <CardContent className="h-40 flex items-center justify-center">
              <div className="text-center">
                <Rocket className="h-12 w-12 mx-auto text-purple-400 mb-2" />
                <p>Advanced marketing campaigns</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Use Feature</Button>
            </CardFooter>
          </Card>
        </PremiumFeatureGate>
        
        {/* Platinum Feature */}
        <PremiumFeatureGate
          feature="platinum"
          description="This feature requires a Platinum subscription."
        >
          <Card>
            <CardHeader className="bg-amber-50">
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <Diamond className="h-5 w-5 text-amber-500" />
                Platinum Feature
              </CardTitle>
              <CardDescription className="text-amber-600">Platinum subscription required</CardDescription>
            </CardHeader>
            <CardContent className="h-40 flex items-center justify-center">
              <div className="text-center">
                <Diamond className="h-12 w-12 mx-auto text-amber-400 mb-2" />
                <p>Exclusive platinum content</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-amber-600 hover:bg-amber-700">Use Feature</Button>
            </CardFooter>
          </Card>
        </PremiumFeatureGate>
        
        {/* Premium Feature with custom fallback */}
        <PremiumFeatureGate
          feature="premium"
          description="This feature requires a Premium subscription or higher."
          fallback={
            <Card className="border-dashed border-gray-300 bg-gray-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-500">
                  <Crown className="h-5 w-5 text-gray-400" />
                  Custom Fallback Example
                </CardTitle>
                <CardDescription className="text-gray-400">Premium subscription required</CardDescription>
              </CardHeader>
              <CardContent className="h-40 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Rocket className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p>This is a custom fallback UI</p>
                  <p className="text-sm text-gray-400 mt-2">Upgrade to see the real content</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">Upgrade to Premium</Button>
              </CardFooter>
            </Card>
          }
        >
          <Card className="border-purple-200">
            <CardHeader className="bg-purple-50">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Crown className="h-5 w-5 text-purple-500" />
                Custom Fallback Feature
              </CardTitle>
              <CardDescription className="text-purple-600">With custom fallback UI</CardDescription>
            </CardHeader>
            <CardContent className="h-40 flex items-center justify-center">
              <div className="text-center">
                <Rocket className="h-12 w-12 mx-auto text-purple-400 mb-2" />
                <p>This content is only visible to Premium subscribers</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Premium Action</Button>
            </CardFooter>
          </Card>
        </PremiumFeatureGate>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="font-semibold mb-2">How to Use Premium Feature Gates</h2>
        <p className="text-sm text-gray-600 mb-4">
          Wrap any component with the <code className="bg-gray-200 px-1 py-0.5 rounded">PremiumFeatureGate</code> component
          to restrict access based on subscription tier. 
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded-md text-sm overflow-x-auto">
          {`<PremiumFeatureGate
  feature="premium"
  description="This feature requires a Premium subscription."
>
  <YourPremiumComponent />
</PremiumFeatureGate>`}
        </pre>
      </div>
    </div>
  );
}

export default PremiumFeatureExample;