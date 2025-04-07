import React, { Suspense, useEffect } from 'react';
import { MainMenu } from './components/game/MainMenu';
import { ArtistCustomization } from './components/game/ArtistCustomization';
import { CareerDashboard } from './components/game/CareerDashboard';
import { MusicProduction } from './components/game/MusicProduction';
import { UnreleasedSongs } from './components/game/UnreleasedSongs';
import { MusicVideos } from './components/game/MusicVideos';
import { SocialMediaView } from './components/game/SocialMediaView';
import { StreamingPlatforms } from './components/game/StreamingPlatforms';
import { Collaborations } from './components/game/Collaborations';
import { SaveLoadGame } from './components/game/SaveLoadGame';
import { PremiumStore } from './components/game/PremiumStore';
import { BeefSystem } from './components/game/BeefSystem';
import { SkillsTraining } from './components/game/SkillsTraining';
import { TouringConcerts } from './components/game/TouringConcerts';
import { GameLayout } from './components/game/GameLayout';
import { useRapperGame } from './lib/stores/useRapperGame';
import { useLoadingScreen } from './lib/stores/useLoadingScreen';
import { useSettings } from './lib/stores/useSettings';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { LoadingTransition } from './components/ui/loading-transition';
import { LoadingScreen } from './components/ui/loading-screen';
import { RapperLoading, TurntableLoading } from './components/ui/rapper-loading';
import { Route, Switch } from 'wouter';
import SubscribePage from './pages/subscribe';
import SubscriptionSuccessPage from './pages/subscription-success';
import NotFoundPage from './pages/not-found';
import SpotifyPage from './pages/spotify';
import '@fontsource/inter';
import './index.css';

// Screen-specific loading messages
const SCREEN_LOADING_MESSAGES: Record<string, string[]> = {
  main_menu: [
    "Setting the stage...",
    "Loading your rap career...",
    "Preparing beats...",
  ],
  character_creation: [
    "Creating your persona...",
    "Crafting your image...",
    "Building your brand...",
  ],
  career_dashboard: [
    "Tracking your success...",
    "Calculating streams...",
    "Managing your career...",
  ],
  music_production: [
    "Setting up the studio...",
    "Preparing samples...",
    "Loading audio workstation...",
  ],
  unreleased_songs: [
    "Finding your unreleased hits...",
    "Organizing your vault...",
    "Preparing your next hit...",
  ],
  music_videos: [
    "Setting up the cameras...",
    "Preparing video equipment...",
    "Loading video production suite...",
  ],
  social_media: [
    "Connecting to the network...",
    "Checking your notifications...",
    "Loading your social presence...",
  ],
  streaming_platforms: [
    "Connecting to streaming services...",
    "Tracking your plays...",
    "Calculating your royalties...",
  ],
  collaborations: [
    "Calling other artists...",
    "Checking your network...",
    "Setting up collaborations...",
  ],
  save_load: [
    "Accessing cloud storage...",
    "Loading saved games...",
    "Preparing your career history...",
  ],
  premium_store: [
    "Loading premium items...",
    "Connecting to store...",
    "Preparing exclusive content...",
    "Setting up the VIP section...",
  ],
};

// Get a random loading message for the current screen
const getScreenLoadingMessage = (screen: string): string => {
  const messages = SCREEN_LOADING_MESSAGES[screen] || ["Loading..."];
  return messages[Math.floor(Math.random() * messages.length)];
};

// Get a loading variant based on the screen
const getScreenLoadingVariant = (screen: string): "default" | "record" | "vinyl" | "microphone" | "random" => {
  if (screen === 'music_production') return 'microphone';
  if (screen === 'streaming_platforms') return 'vinyl';
  if (screen === 'career_dashboard') return 'record';
  if (screen === 'music_videos') return 'microphone';
  return 'random';
};

function App() {
  const { screen, previousScreen } = useRapperGame();
  const { showLoading, hideLoading } = useLoadingScreen();
  const { loadingAnimationsEnabled } = useSettings();
  
  // Show loading screen when screen changes
  useEffect(() => {
    if (previousScreen !== screen && previousScreen !== null) {
      // Only show loading transitions between actual screens (not on initial load)
      showLoading(
        getScreenLoadingMessage(screen),
        getScreenLoadingVariant(screen)
      );
      
      // Use shorter loading time when animations are disabled
      const loadingTime = loadingAnimationsEnabled ? 1500 : 300;
      
      // Hide loading after the appropriate time
      const timer = setTimeout(() => {
        hideLoading();
      }, loadingTime);
      
      return () => clearTimeout(timer);
    }
  }, [screen, previousScreen, showLoading, hideLoading, loadingAnimationsEnabled]);
  
  // Initial loading component with rapper-themed animation
  const InitialLoading = () => {
    const { loadingAnimationsEnabled } = useSettings();
    
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white">
        <div className="mb-8">
          {loadingAnimationsEnabled ? (
            <TurntableLoading size="lg" />
          ) : (
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          )}
        </div>
        <h2 className="text-2xl font-bold mb-2">Loading Rapper Career Simulator</h2>
        <div className="w-48 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full overflow-hidden">
          {loadingAnimationsEnabled ? (
            <div className="h-full bg-white/30" style={{ width: '100%', animation: 'loading 2s infinite' }}></div>
          ) : (
            <div className="h-full bg-white/50" style={{ width: '50%' }}></div>
          )}
        </div>
      </div>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<InitialLoading />}>
        <Switch>
          {/* Subscription routes */}
          <Route path="/subscribe">
            <div className="subscription-page z-50 absolute top-0 left-0 w-full h-full overflow-y-auto">
              <SubscribePage />
            </div>
          </Route>
          <Route path="/subscription-success">
            <div className="subscription-page z-50 absolute top-0 left-0 w-full h-full overflow-y-auto">
              <SubscriptionSuccessPage />
            </div>
          </Route>
          
          {/* Spotify UI */}
          <Route path="/spotify">
            <div className="spotify-page z-50 absolute top-0 left-0 w-full h-full overflow-hidden">
              <SpotifyPage />
            </div>
          </Route>
          
          {/* Game routes */}
          <Route path="/">
            <LoadingTransition>
              <GameLayout>
                {screen === 'main_menu' && <MainMenu />}
                {screen === 'character_creation' && <ArtistCustomization />}
                {screen === 'career_dashboard' && <CareerDashboard />}
                {screen === 'music_production' && <MusicProduction />}
                {screen === 'unreleased_songs' && <UnreleasedSongs />}
                {screen === 'music_videos' && <MusicVideos />}
                {screen === 'social_media' && <SocialMediaView />}
                {screen === 'streaming_platforms' && <StreamingPlatforms />}
                {screen === 'collaborations' && <Collaborations />}
                {screen === 'save_load' && <SaveLoadGame />}
                {screen === 'premium_store' && <PremiumStore />}
                {screen === 'beefs' && <BeefSystem />}
                {screen === 'skills' && <SkillsTraining />}
                {screen === 'touring' && <TouringConcerts />}
              </GameLayout>
            </LoadingTransition>
          </Route>
          
          {/* Not found */}
          <Route>
            <NotFoundPage />
          </Route>
        </Switch>
      </Suspense>
    </QueryClientProvider>
  );
}

export default App;
