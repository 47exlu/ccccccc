import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { useAudio } from '@/lib/stores/useAudio';

export function RandomEvents() {
  const { activeRandomEvents, resolveRandomEvent } = useRapperGame();
  const { playHit } = useAudio();
  
  // If no active events, don't render anything
  if (activeRandomEvents.length === 0) {
    return null;
  }
  
  // Get the first active event to display
  const currentEvent = activeRandomEvents[0];
  
  // Handle selecting an option
  const handleSelectOption = (optionIndex: number) => {
    playHit();
    resolveRandomEvent(currentEvent.id, optionIndex);
  };
  
  return (
    <Card className="bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border-indigo-700 shadow-lg">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-amber-400">{currentEvent.title}</h2>
          <div className="px-2 py-1 rounded bg-purple-800 text-xs font-semibold">
            Random Event
          </div>
        </div>
        
        <p className="text-gray-200 mb-6">
          {currentEvent.description}
        </p>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-3">
        {currentEvent.options.map((option, index) => (
          <Button
            key={index}
            className={index === 0 
              ? "w-full bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900"
              : "w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800"
            }
            onClick={() => handleSelectOption(index)}
          >
            {option.text}
          </Button>
        ))}
      </CardFooter>
    </Card>
  );
}
