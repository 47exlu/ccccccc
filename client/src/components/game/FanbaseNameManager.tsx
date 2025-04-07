import React, { useState } from 'react';
import { useRapperGame } from '../../lib/stores/useRapperGame';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { ArrowLeft, HomeIcon } from 'lucide-react';

const FanbaseNameManager: React.FC = () => {
  const { character, updateFanbaseName, setScreen } = useRapperGame();
  const [fanbaseName, setFanbaseName] = useState(character?.fanbaseName || '');
  const [isEditing, setIsEditing] = useState(!character?.fanbaseName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fanbaseName.trim()) {
      updateFanbaseName(fanbaseName.trim());
      setIsEditing(false);
    }
  };

  const handleBackToDashboard = () => {
    setScreen('career_dashboard');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToDashboard}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Fan Base Naming</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleBackToDashboard}
          className="flex items-center gap-1"
        >
          <HomeIcon className="h-4 w-4" />
          <span>Dashboard</span>
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">Fan Base Naming</CardTitle>
            <CardDescription>
              Give your loyal fans a collective name to strengthen your artist brand
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="fanbaseName">Fanbase Name</Label>
                  <Input
                    id="fanbaseName"
                    value={fanbaseName}
                    onChange={(e) => setFanbaseName(e.target.value)}
                    placeholder="Enter a name for your fans"
                    className="w-full"
                    maxLength={20}
                  />
                  <p className="text-sm text-gray-500">
                    Choose something memorable that reflects your music style
                  </p>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button type="submit">Save Name</Button>
                  {character?.fanbaseName && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setFanbaseName(character.fanbaseName || '');
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Current Fanbase Name</Label>
                  <p className="text-lg font-medium mt-1">{character?.fanbaseName}</p>
                </div>
                <Button onClick={() => setIsEditing(true)}>Change Name</Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <div className="text-sm text-gray-500 mt-2">
              <p className="font-medium">Benefits:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Increased fan loyalty</li>
                <li>Stronger artist identity</li>
                <li>Better engagement on social media</li>
              </ul>
            </div>
          </CardFooter>
        </Card>
      </ScrollArea>
    </div>
  );
};

export default FanbaseNameManager;