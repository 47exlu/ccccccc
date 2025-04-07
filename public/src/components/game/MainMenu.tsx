import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MusicIcon, StarIcon } from '@/assets/icons';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { useSaveGame } from '@/lib/stores/useSaveGame';
import { useAudio } from '@/lib/stores/useAudio';
import { Badge } from '@/components/ui/badge';
import { CrownIcon, InfoIcon, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';

export function MainMenu() {
  const { setScreen, subscriptionInfo } = useRapperGame();
  const { loadSaves, saves } = useSaveGame();
  const { 
    setBackgroundMusic, 
    setHitSound, 
    setSuccessSound, 
    toggleMute, 
    isMuted 
  } = useAudio();
  
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);

  // Load saved games when component mounts
  useEffect(() => {
    loadSaves();
    
    // Set up background music
    const bgMusic = new Audio('/sounds/background.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);
    
    // Set up sound effects
    const hitSfx = new Audio('/sounds/hit.mp3');
    setHitSound(hitSfx);
    
    const successSfx = new Audio('/sounds/success.mp3');
    setSuccessSound(successSfx);

    // Clean up
    return () => {
      bgMusic.pause();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-r from-gray-900 via-purple-950 to-gray-900 text-white p-6 relative overflow-hidden">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/5 w-32 h-32 rounded-full bg-purple-500/10 blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full bg-pink-500/10 blur-3xl"></div>
      </div>
      
      {/* Glass card container */}
      <div className="relative w-full max-w-md flex flex-col items-center backdrop-blur-sm bg-black/40 p-8 rounded-2xl border border-white/10 shadow-xl">
        {/* Logo and title */}
        <div className="flex items-center text-6xl font-extrabold mb-2 relative">
          <div className="absolute -left-10 -top-5 transform rotate-12">
            <MusicIcon size={56} className="text-amber-400 drop-shadow-glow" />
          </div>
          <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-amber-300 to-pink-500 drop-shadow-md">RES</h1>
          <div className="absolute -right-10 -top-5 transform -rotate-12">
            <StarIcon size={56} className="text-amber-400 drop-shadow-glow" />
          </div>
        </div>
        <div className="text-xl font-medium text-gray-300 mb-6 italic tracking-wide">Rap Empire Simulator</div>
        
        <p className="text-xl mb-10 text-gray-300 text-center font-light">
          Build your hip-hop empire from the ground up
        </p>
        
        {/* Animated buttons */}
        <div className="w-full space-y-4 stagger-fade-in">
          <Button 
            className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 rounded-xl shadow-lg shadow-amber-900/20 transition-all hover:translate-y-[-2px]"
            onClick={() => setScreen('character_creation')}
          >
            New Career
          </Button>
          
          <Button 
            className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl shadow-lg shadow-blue-900/20 transition-all hover:translate-y-[-2px]"
            onClick={() => setScreen('save_load')}
            disabled={saves.length === 0}
          >
            Load Career
          </Button>
          
          {/* Subscription Status Button */}
          <Button 
            className="w-full h-14 text-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-purple-900/20 transition-all hover:translate-y-[-2px]"
            onClick={() => window.open('/subscribe', '_self')}
          >
            <CrownIcon className="h-5 w-5" />
            {subscriptionInfo?.isSubscribed ? (
              <>
                <span>Premium Subscription</span>
                <Badge className="bg-green-600/80 ml-2">Active</Badge>
              </>
            ) : (
              "Upgrade to Premium"
            )}
          </Button>

          <Button 
            className="w-full h-10 text-base bg-gray-800/80 hover:bg-gray-700/80 rounded-xl transition-all hover:translate-y-[-1px]"
            onClick={toggleMute}
          >
            {isMuted ? "🔇 Sound Off" : "🔊 Sound On"}
          </Button>
          
          <Button 
            className="w-full h-10 text-base bg-gray-700/80 hover:bg-gray-600/80 rounded-xl transition-all hover:translate-y-[-1px] flex items-center justify-center gap-2"
            onClick={() => setAboutDialogOpen(true)}
          >
            <InfoIcon className="h-4 w-4" />
            About
          </Button>
        </div>
        
        <div className="mt-12 text-sm text-gray-400 text-center font-light">
          <p>Create your own hip-hop star and rise to the top of the charts!</p>
          <p>Manage your career, release hits, and build your fanbase.</p>
        </div>
      </div>
      
      {/* Version info */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-500">
        v2.0
      </div>
      
      {/* About Dialog */}
      <Dialog open={aboutDialogOpen} onOpenChange={setAboutDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-amber-300 to-pink-500">About RES</DialogTitle>
            <DialogDescription className="text-gray-400 text-center pt-2">
              Rap Empire Simulator
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-amber-400">Credits</h3>
              <p className="text-gray-300">Developed by: NameExlusiveLLC, Akkkha</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-amber-400">Join Our Community</h3>
              <a 
                href="https://discord.gg/hbDEWPEQDp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Discord Server
              </a>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-amber-400">Game Version</h3>
              <p className="text-gray-300">v2.0</p>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 hover:text-white w-full">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
