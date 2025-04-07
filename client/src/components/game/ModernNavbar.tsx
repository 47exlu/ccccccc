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
      <div className="hidden md:flex flex-col bg-black text-white w-64 h-full overflow-auto border-r border-gray-800">
        {/* User profile */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            {character?.image ? (
              <img src={character.image} alt={character?.artistName} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {character?.artistName?.charAt(0) || '?'}
              </div>
            )}
            <div>
              <div className="font-semibold">{character?.artistName || 'Artist'}</div>
              <div className="text-xs text-gray-400">Week {currentScreen ? (currentScreen === 'character_creation' ? 0 : currentScreen === 'main_menu' ? 0 : stats?.currentWeek || 0) : 0}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-gray-900 p-2 rounded">
              <div className="text-xs text-gray-400">Wealth</div>
              <div className="font-medium">${stats?.wealth?.toLocaleString() || 0}</div>
            </div>
            <div className="bg-gray-900 p-2 rounded">
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
                        currentScreen === getActualScreenId(screen.id) && "bg-gradient-to-r from-purple-900 to-purple-800 text-white"
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
      
      {/* Mobile header */}
      <div className="md:hidden bg-black text-white border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            {character?.image ? (
              <img src={character.image} alt={character?.artistName} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {character?.artistName?.charAt(0) || '?'}
              </div>
            )}
            <div className="font-semibold text-sm">{character?.artistName || 'Artist'}</div>
          </div>
          
          <button 
            className="p-2 rounded-md hover:bg-gray-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="bg-black border-t border-gray-800 pb-2 max-h-[70vh] overflow-y-auto">
            {categories.map(category => {
              const categoryScreens = screens.filter(s => s.category === category.id);
              if (categoryScreens.length === 0) return null;
              
              return (
                <div key={category.id} className="mb-2">
                  <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">{category.name}</div>
                  <div className="grid grid-cols-3 gap-1 px-2">
                    {categoryScreens.map(screen => (
                      <button
                        key={screen.id}
                        className={cn(
                          "flex flex-col items-center justify-center space-y-1 p-2 rounded-md text-center transition-colors",
                          currentScreen === getActualScreenId(screen.id) 
                            ? "bg-gradient-to-r from-purple-900 to-purple-800 text-white" 
                            : "hover:bg-gray-800 text-gray-300"
                        )}
                        onClick={() => handleScreenChange(getActualScreenId(screen.id))}
                      >
                        {screen.icon}
                        <span className="text-xs">{screen.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}