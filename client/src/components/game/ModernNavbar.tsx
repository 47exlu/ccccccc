import React, { useState } from 'react';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { 
  Home, 
  Music, 
  Users, 
  Mic2, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Instagram, 
  Twitter, 
  Youtube, 
  Settings,
  Album,
  BarChart2,
  Award,
  ShoppingBag,
  Radio,
  Tv,
  Film,
  MessageCircle,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const screens = [
  { 
    id: 'career_dashboard', 
    name: 'Dashboard', 
    icon: <Home className="w-5 h-5" />,
    category: 'main' 
  },
  { 
    id: 'music_production', 
    name: 'Create Music', 
    icon: <Music className="w-5 h-5" />,
    category: 'music' 
  },
  { 
    id: 'unreleased_songs', 
    name: 'Songs', 
    icon: <Mic2 className="w-5 h-5" />,
    category: 'music' 
  },
  { 
    id: 'album_management', 
    name: 'Albums', 
    icon: <Album className="w-5 h-5" />,
    category: 'music' 
  },
  { 
    id: 'music_videos', 
    name: 'Music Videos', 
    icon: <Film className="w-5 h-5" />,
    category: 'music' 
  },
  { 
    id: 'song_promotion', 
    name: 'Promotion', 
    icon: <TrendingUp className="w-5 h-5" />,
    category: 'marketing' 
  },
  { 
    id: 'streaming_platforms', 
    name: 'Streaming', 
    icon: <Radio className="w-5 h-5" />,
    category: 'marketing' 
  },
  { 
    id: 'social_media_hub', 
    name: 'Social Media', 
    icon: <Instagram className="w-5 h-5" />,
    category: 'marketing' 
  },
  { 
    id: 'merch_management', 
    name: 'Merch', 
    icon: <ShoppingBag className="w-5 h-5" />,
    category: 'business' 
  },
  { 
    id: 'touring', 
    name: 'Touring', 
    icon: <Users className="w-5 h-5" />,
    category: 'business' 
  },
  { 
    id: 'collaborations', 
    name: 'Collabs', 
    icon: <Users className="w-5 h-5" />,
    category: 'network' 
  },
  { 
    id: 'beef', 
    name: 'Beefs', 
    icon: <MessageCircle className="w-5 h-5" />,
    category: 'network' 
  },
  { 
    id: 'skills_training', 
    name: 'Training', 
    icon: <Award className="w-5 h-5" />,
    category: 'other' 
  },
  { 
    id: 'chart_impact', 
    name: 'Charts', 
    icon: <BarChart2 className="w-5 h-5" />,
    category: 'other' 
  },
  { 
    id: 'save_load', 
    name: 'Save/Load', 
    icon: <Settings className="w-5 h-5" />,
    category: 'system' 
  }
];

const categories = [
  { id: 'main', name: 'Main' },
  { id: 'music', name: 'Music' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'business', name: 'Business' },
  { id: 'network', name: 'Network' },
  { id: 'other', name: 'Other' }
];

export function ModernNavbar() {
  const { setScreen, screen: currentScreen, stats, character } = useRapperGame();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleScreenChange = (screenId: string) => {
    setScreen(screenId as any); // Type cast to any as a temporary fix
    setMobileMenuOpen(false);
  };
  
  // Map screen IDs to actual IDs in the game system
  const getActualScreenId = (screenId: string) => {
    switch (screenId) {
      case 'album_management': return 'album_management';
      case 'beef': return 'beef_system';
      case 'chart_impact': return 'streaming_impact';
      case 'save_load': return 'save_load';
      case 'touring': return 'touring_concerts';
      default: return screenId;
    }
  };
  
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col bg-gray-900 text-white w-64 h-full overflow-auto border-r border-gray-700">
        {/* User profile */}
        <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800">
          <div className="flex items-center space-x-3">
            {character?.image ? (
              <img src={character.image} alt={character?.artistName} className="h-10 w-10 rounded-full object-cover border-2 border-purple-500" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold border-2 border-purple-400">
                {character?.artistName?.charAt(0) || '?'}
              </div>
            )}
            <div>
              <div className="font-semibold">{character?.artistName || 'Artist'}</div>
              <div className="text-xs text-gray-400">Week {currentScreen ? (currentScreen === 'character_creation' ? 0 : currentScreen === 'main_menu' ? 0 : stats?.week || 0) : 0}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-gray-800 p-2 rounded border border-gray-700">
              <div className="text-xs text-gray-400">Wealth</div>
              <div className="font-medium">${stats?.wealth?.toLocaleString() || 0}</div>
            </div>
            <div className="bg-gray-800 p-2 rounded border border-gray-700">
              <div className="text-xs text-gray-400">Reputation</div>
              <div className="font-medium">{stats?.reputation || 0}%</div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 py-2 overflow-y-auto">
          {categories.map(category => {
            const categoryScreens = screens.filter(s => s.category === category.id);
            if (categoryScreens.length === 0) return null;
            
            return (
              <div key={category.id} className="mb-4">
                <div className="px-4 py-1 uppercase text-xs font-semibold text-gray-500">{category.name}</div>
                <div>
                  {categoryScreens.map(screen => (
                    <button
                      key={screen.id}
                      className={cn(
                        "w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-800",
                        currentScreen === getActualScreenId(screen.id) 
                          ? "bg-gradient-to-r from-purple-800 to-purple-700 text-white" 
                          : "text-gray-300 hover:text-white"
                      )}
                      onClick={() => handleScreenChange(getActualScreenId(screen.id))}
                    >
                      {screen.icon}
                      <span>{screen.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Mobile header - improved for mobile usability */}
      <div className="md:hidden bg-gray-900 text-white border-b border-gray-700 sticky top-0 z-40">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-3">
            {character?.image ? (
              <img src={character.image} alt={character?.artistName} className="h-8 w-8 rounded-full object-cover border border-purple-500" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                {character?.artistName?.charAt(0) || '?'}
              </div>
            )}
            <div>
              <div className="font-semibold text-sm">{character?.artistName || 'Artist'}</div>
              <div className="text-xs text-gray-400">Week {currentScreen ? (currentScreen === 'character_creation' ? 0 : currentScreen === 'main_menu' ? 0 : stats?.week || 0) : 0}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-xs px-2 py-1 bg-gray-800 rounded-md border border-gray-700">
              <span className="text-green-400">$</span>
              <span className="font-medium">{stats?.wealth?.toLocaleString() || 0}</span>
            </div>
            
            <div className="text-xs px-2 py-1 bg-gray-800 rounded-md border border-gray-700">
              <span className="text-purple-400">Rep </span>
              <span className="font-medium">{stats?.reputation || 0}%</span>
            </div>
            
            <button 
              className="p-2 rounded-md bg-gradient-to-r from-purple-700 to-pink-700 text-white hover:opacity-90"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        
        {/* Bottom tab bar for main navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex justify-around items-center p-1 z-40">
          {['main', 'music', 'marketing', 'business', 'network'].map(categoryId => {
            // Get first item from each category for quick access
            const firstScreen = screens.find(s => s.category === categoryId);
            if (!firstScreen) return null;
            
            const isActive = currentScreen && getActualScreenId(firstScreen.id) === currentScreen;
            
            return (
              <button
                key={categoryId}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 rounded-md transition-colors",
                  isActive ? "text-purple-400" : "text-gray-500 hover:text-gray-300"
                )}
                onClick={() => handleScreenChange(getActualScreenId(firstScreen.id))}
              >
                {firstScreen.icon}
                <span className="text-[10px] mt-1">{firstScreen.name}</span>
              </button>
            );
          })}
          <button
            className="flex flex-col items-center justify-center py-2 px-1 text-gray-500 hover:text-gray-300"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={20} />
            <span className="text-[10px] mt-1">More</span>
          </button>
        </div>
        
        {/* Mobile full menu - improved with bottom sheet style */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col justify-end touch-none" onClick={() => setMobileMenuOpen(false)}>
            <div 
              className="bg-gray-900 border-t border-gray-700 rounded-t-xl pb-20 pt-2 max-h-[80vh] overflow-y-auto touch-auto" 
              onClick={e => e.stopPropagation()}
            >
              {/* Pull indicator */}
              <div className="flex justify-center mb-2">
                <div className="w-12 h-1 bg-gray-700 rounded-full"></div>
              </div>
              
              {/* Close button */}
              <div className="absolute top-2 right-2">
                <button 
                  className="p-2 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>
              
              {/* All menu items by category */}
              {categories.map(category => {
                const categoryScreens = screens.filter(s => s.category === category.id);
                if (categoryScreens.length === 0) return null;
                
                return (
                  <div key={category.id} className="mb-4">
                    <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">{category.name}</div>
                    <div className="grid grid-cols-3 gap-2 px-2">
                      {categoryScreens.map(screen => (
                        <button
                          key={screen.id}
                          className={cn(
                            "flex flex-col items-center justify-center space-y-1 p-3 rounded-md text-center transition-colors",
                            currentScreen === getActualScreenId(screen.id) 
                              ? "bg-gradient-to-r from-purple-800 to-purple-700 text-white border border-purple-600" 
                              : "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700"
                          )}
                          onClick={() => handleScreenChange(getActualScreenId(screen.id))}
                        >
                          {screen.icon}
                          <span className="text-xs font-medium">{screen.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}