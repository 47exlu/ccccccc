import React, { useState, useEffect } from 'react';
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
  X,
  ChevronRight,
  Book
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
    name: 'Merchandise', 
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
    id: 'player_wikipedia', 
    name: 'Career Wiki', 
    icon: <Book className="w-5 h-5" />,
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
  const { setScreen, screen: currentScreen, stats, character, currentWeek } = useRapperGame();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
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

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };
  
  // Animation variants for dropdown menus
  const dropdownVariants = {
    hidden: { 
      height: 0, 
      opacity: 0,
      transition: { 
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    visible: { 
      height: "auto", 
      opacity: 1,
      transition: { 
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  // Animation variants for menu items
  const menuItemVariants = {
    hidden: { 
      x: -10, 
      opacity: 0 
    },
    visible: (i: number) => ({ 
      x: 0, 
      opacity: 1,
      transition: { 
        delay: i * 0.05,
        duration: 0.3
      }
    })
  };

  // Animation variants for the mobile sheet
  const sheetVariants = {
    hidden: { 
      y: "100%",
      opacity: 0,
      transition: { 
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    visible: { 
      y: 0,
      opacity: 1,
      transition: { 
        duration: 0.4,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  // Animation for backdrop
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };
  
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col bg-gray-900 text-white w-64 h-full overflow-auto border-r border-gray-700">
        {/* User profile */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 border-b border-gray-700 bg-gradient-to-r from-gray-900 to-gray-800"
        >
          <div className="flex items-center space-x-3">
            {character?.image ? (
              <motion.img 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                src={character.image} 
                alt={character?.artistName} 
                className="h-10 w-10 rounded-full object-cover border-2 border-purple-500" 
              />
            ) : (
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold border-2 border-purple-400"
              >
                {character?.artistName?.charAt(0) || '?'}
              </motion.div>
            )}
            <div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-semibold"
              >
                {character?.artistName || 'Artist'}
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-gray-400"
              >
                Week {currentScreen ? (currentScreen === 'character_creation' ? 0 : currentScreen === 'main_menu' ? 0 : currentWeek || 0) : 0}
              </motion.div>
            </div>
          </div>
          <motion.div 
            className="grid grid-cols-2 gap-2 mt-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="bg-gray-800 p-2 rounded border border-gray-700 hover:border-purple-500 transition-colors group">
              <div className="text-xs text-gray-400 group-hover:text-purple-300 transition-colors">Wealth</div>
              <div className="font-medium">${stats?.wealth?.toLocaleString() || 0}</div>
            </div>
            <div className="bg-gray-800 p-2 rounded border border-gray-700 hover:border-purple-500 transition-colors group">
              <div className="text-xs text-gray-400 group-hover:text-purple-300 transition-colors">Reputation</div>
              <div className="font-medium">{stats?.reputation || 0}%</div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Navigation */}
        <div className="flex-1 py-2 overflow-y-auto">
          {categories.map((category, categoryIndex) => {
            const categoryScreens = screens.filter(s => s.category === category.id);
            if (categoryScreens.length === 0) return null;
            
            const isCategoryExpanded = expandedCategory === category.id;
            const isCategoryActive = currentScreen && categoryScreens.some(s => getActualScreenId(s.id) === currentScreen);
            
            return (
              <motion.div 
                key={category.id} 
                className="mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * categoryIndex, duration: 0.5 }}
              >
                <button 
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2 uppercase text-xs font-semibold transition-colors",
                    isCategoryActive ? "text-purple-400" : "text-gray-500 hover:text-gray-300"
                  )}
                  onClick={() => toggleCategory(category.id)}
                >
                  <span>{category.name}</span>
                  <motion.div
                    animate={{ rotate: isCategoryExpanded ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronRight size={14} />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {(isCategoryExpanded || category.id === 'main') && (
                    <motion.div
                      key={`${category.id}-dropdown`}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={dropdownVariants}
                      className="overflow-hidden"
                    >
                      {categoryScreens.map((screen, index) => {
                        const isActive = currentScreen === getActualScreenId(screen.id);
                        
                        return (
                          <motion.button
                            key={screen.id}
                            custom={index}
                            variants={menuItemVariants}
                            whileHover={{ x: 5 }}
                            className={cn(
                              "w-full flex items-center space-x-3 px-6 py-2.5 text-sm text-left transition-all",
                              isActive 
                                ? "bg-gradient-to-r from-purple-800 to-purple-700 text-white" 
                                : "text-gray-300 hover:text-white hover:bg-gray-800"
                            )}
                            onClick={() => handleScreenChange(getActualScreenId(screen.id))}
                          >
                            {screen.icon}
                            <span>{screen.name}</span>
                            
                            {isActive && (
                              <motion.div 
                                layoutId="activeIndicator"
                                className="ml-auto h-2 w-2 rounded-full bg-purple-400"
                              />
                            )}
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Mobile header - improved for mobile usability */}
      <div className="md:hidden bg-gray-900 text-white border-b border-gray-700 sticky top-0 z-40">
        <div className="flex items-center justify-between p-3">
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {character?.image ? (
              <motion.img 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                src={character.image} 
                alt={character?.artistName} 
                className="h-8 w-8 rounded-full object-cover border border-purple-500" 
              />
            ) : (
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold"
              >
                {character?.artistName?.charAt(0) || '?'}
              </motion.div>
            )}
            <div>
              <div className="font-semibold text-sm">{character?.artistName || 'Artist'}</div>
              <div className="text-xs text-gray-400">Week {currentScreen ? (currentScreen === 'character_creation' ? 0 : currentScreen === 'main_menu' ? 0 : currentWeek || 0) : 0}</div>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="text-xs px-2 py-1 bg-gray-800 rounded-md border border-gray-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-green-400">$</span>
              <span className="font-medium">{stats?.wealth?.toLocaleString() || 0}</span>
            </motion.div>
            
            <motion.div 
              className="text-xs px-2 py-1 bg-gray-800 rounded-md border border-gray-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-purple-400">Rep </span>
              <span className="font-medium">{stats?.reputation || 0}%</span>
            </motion.div>
            
            <motion.button 
              className="p-2 rounded-md bg-gradient-to-r from-purple-700 to-pink-700 text-white hover:opacity-90"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </motion.button>
          </motion.div>
        </div>
        
        {/* Bottom tab bar for main navigation */}
        <motion.div 
          className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex justify-around items-center p-1 z-40"
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {['main', 'music', 'marketing', 'business', 'network'].map((categoryId, idx) => {
            // Get first item from each category for quick access
            const firstScreen = screens.find(s => s.category === categoryId);
            if (!firstScreen) return null;
            
            const isActive = currentScreen && getActualScreenId(firstScreen.id) === currentScreen;
            
            return (
              <motion.button
                key={categoryId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx + 0.3, duration: 0.5 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 rounded-md transition-colors",
                  isActive ? "text-purple-400" : "text-gray-500 hover:text-gray-300"
                )}
                onClick={() => handleScreenChange(getActualScreenId(firstScreen.id))}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute -top-1 w-1/5 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  />
                )}
                {firstScreen.icon}
                <span className="text-[10px] mt-1">{firstScreen.name}</span>
              </motion.button>
            );
          })}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center justify-center py-2 px-1 text-gray-500 hover:text-gray-300"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={20} />
            <span className="text-[10px] mt-1">More</span>
          </motion.button>
        </motion.div>
        
        {/* Mobile full menu - improved with animations */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col justify-end touch-none" 
              onClick={() => setMobileMenuOpen(false)}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={backdropVariants}
            >
              <motion.div 
                className="bg-gray-900 border-t border-gray-700 rounded-t-xl pb-20 pt-2 max-h-[80vh] overflow-y-auto touch-auto" 
                onClick={e => e.stopPropagation()}
                variants={sheetVariants}
              >
                {/* Pull indicator */}
                <motion.div 
                  className="flex justify-center mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="w-12 h-1 bg-gray-700 rounded-full"></div>
                </motion.div>
                
                {/* Close button */}
                <motion.div 
                  className="absolute top-2 right-2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <button 
                    className="p-2 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <X size={16} />
                  </button>
                </motion.div>
                
                {/* All menu items by category */}
                {categories.map((category, categoryIndex) => {
                  const categoryScreens = screens.filter(s => s.category === category.id);
                  if (categoryScreens.length === 0) return null;
                  
                  return (
                    <motion.div 
                      key={category.id} 
                      className="mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * categoryIndex + 0.4 }}
                    >
                      <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">{category.name}</div>
                      <div className="grid grid-cols-3 gap-2 px-2">
                        {categoryScreens.map((screen, screenIndex) => {
                          const isActive = currentScreen === getActualScreenId(screen.id);
                          
                          return (
                            <motion.button
                              key={screen.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.05 * screenIndex + 0.1 * categoryIndex + 0.5 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={cn(
                                "flex flex-col items-center justify-center space-y-1 p-3 rounded-md text-center transition-all",
                                isActive 
                                  ? "bg-gradient-to-r from-purple-800 to-purple-700 text-white border border-purple-600" 
                                  : "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700"
                              )}
                              onClick={() => handleScreenChange(getActualScreenId(screen.id))}
                            >
                              {screen.icon}
                              <span className="text-xs font-medium">{screen.name}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}