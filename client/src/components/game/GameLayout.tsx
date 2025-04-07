import React, { useEffect, useState } from 'react';
import { useAudio } from '../../lib/stores/useAudio';
import { useSettings } from '../../lib/stores/useSettings';
import { useRapperGame } from '../../lib/stores/useRapperGame';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import EnergyDisplay from './EnergyDisplay';
import { ModernNavbar } from './ModernNavbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Volume, VolumeX } from 'lucide-react';

interface GameLayoutProps {
  children: React.ReactNode;
}

export function GameLayout({ children }: GameLayoutProps) {
  const { backgroundMusic, isMuted, toggleMute } = useAudio();
  const { loadingAnimationsEnabled, toggleLoadingAnimations } = useSettings();
  const { screen } = useRapperGame();
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Animation variants
  const pageTransition = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2
      }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };
  
  // Set up key bindings for muting
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // M key toggles mute
      if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMute]);
  
  // Play background music only when the component mounts and when muted status changes
  useEffect(() => {
    // Only attempt to control the audio when backgroundMusic is available
    if (backgroundMusic) {
      // Handle music playback based on mute status
      if (isMuted) {
        backgroundMusic.pause();
      } else {
        // Make sure background music is playing if not muted
        if (!backgroundMusic.playing()) {
          try {
            backgroundMusic.play();
          } catch (error) {
            console.error("Error playing background music:", error);
          }
        }
      }
    }
    
    // Don't pause the background music on component unmount to preserve audio across transitions
    // to maintain sound settings between different sections
  }, [isMuted, backgroundMusic]);
  
  // Game initialization effect
  useEffect(() => {
    // Any game initialization could go here in the future
    console.log('Game layout mounted');
    
    return () => {
      console.log('Game layout unmounted');
    };
  }, []);

  // Don't show navbar on main menu or character creation
  const showNavbar = screen !== 'main_menu' && screen !== 'character_creation';

  return (
    <motion.div 
      className="w-full h-full flex flex-col bg-gray-900 text-white overflow-hidden"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageTransition}
    >
      {/* Modern Navigation Bar */}
      <AnimatePresence mode="wait">
        {showNavbar && <ModernNavbar key="navbar" />}
      </AnimatePresence>
      
      {/* Energy Display - moved to the top right near settings */}
      <AnimatePresence>
        {screen === 'career_dashboard' && (
          <motion.div 
            className="fixed top-3 left-4 z-40 flex items-center"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <EnergyDisplay className="w-36" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Controls panel - moved to top left for better accessibility */}
      <motion.div 
        className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-gray-900/70 backdrop-blur-md rounded-full p-1.5 border border-gray-800 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Settings button */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <motion.button 
              className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
              whileHover={buttonVariants.hover}
              whileTap={buttonVariants.tap}
              title="Settings"
            >
              <Settings className="w-4 h-4 text-gray-200" />
            </motion.button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border border-gray-700 text-white max-w-[90vw] md:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Game Settings
              </DialogTitle>
            </DialogHeader>
            <motion.div 
              className="space-y-4 py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="flex items-center justify-between"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="space-y-0.5">
                  <Label htmlFor="loading-animations" className="text-base">Loading Animations</Label>
                  <p className="text-sm text-gray-400">Show detailed animations during loading screens</p>
                </div>
                <Switch 
                  id="loading-animations" 
                  checked={loadingAnimationsEnabled}
                  onCheckedChange={toggleLoadingAnimations}
                />
              </motion.div>
              
              <motion.div 
                className="flex items-center justify-between"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="space-y-0.5">
                  <Label htmlFor="sound" className="text-base">Sound</Label>
                  <p className="text-sm text-gray-400">Turn game sound on or off</p>
                </div>
                <Switch 
                  id="sound" 
                  checked={!isMuted}
                  onCheckedChange={(checked) => {
                    if (checked !== !isMuted) {
                      toggleMute();
                    }
                  }}
                />
              </motion.div>
            </motion.div>
          </DialogContent>
        </Dialog>
        
        {/* Sound toggle button */}
        <motion.button 
          className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
          onClick={toggleMute}
          whileHover={buttonVariants.hover}
          whileTap={buttonVariants.tap}
          title={isMuted ? "Unmute" : "Mute"}
        >
          <AnimatePresence mode="wait">
            {isMuted ? (
              <motion.div
                key="muted"
                initial={{ rotate: -30, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 30, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <VolumeX className="w-4 h-4 text-gray-200" />
              </motion.div>
            ) : (
              <motion.div
                key="unmuted"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Volume className="w-4 h-4 text-gray-200" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
      
      {/* Main content - adjusted for better mobile viewing with bottom padding on mobile */}
      <motion.main 
        className="w-full h-full overflow-auto flex-1 bg-gradient-to-b from-gray-900 to-gray-800 pb-16 md:pb-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.div 
          className="h-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {children}
        </motion.div>
      </motion.main>
    </motion.div>
  );
}
