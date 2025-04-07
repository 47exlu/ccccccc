import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { calculateTotalMonthlyListeners } from '@/lib/utils/gameCalculations';
import AlbumDetail from './AlbumDetail';

// Icons
import { 
  Play, Heart, MoreHorizontal, 
  Clock, Download, ExternalLink, 
  ChevronLeft, ChevronRight, 
  Search, Home, Library, Plus
} from 'lucide-react';

// Helper to format large numbers with appropriate suffix (K, M, B)
const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    return num.toString();
  }
};

const ArtistProfile: React.FC = () => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  
  // Get game state from the store
  const { 
    character, 
    streamingPlatforms, 
    songs,
    albums,
    stats,
    aiRappers
  } = useRapperGame();

  // Calculate total monthly listeners
  const monthlyListeners = useMemo(() => {
    return calculateTotalMonthlyListeners(streamingPlatforms);
  }, [streamingPlatforms]);

  // Calculate artist rank among AI rappers
  const calculateRank = () => {
    // Combine player and AI rappers and sort by monthly listeners
    const allArtists = [
      { id: 'player', monthlyListeners: monthlyListeners },
      ...aiRappers.map(rapper => ({ id: rapper.id, monthlyListeners: rapper.monthlyListeners }))
    ].sort((a, b) => b.monthlyListeners - a.monthlyListeners);
    
    // Find player's position
    const playerIndex = allArtists.findIndex(artist => artist.id === 'player');
    return playerIndex + 1; // +1 because array index is 0-based but ranks start at 1
  };
  
  // Determine rank change based on streams trend
  const determineRankChange = (): 'up' | 'down' | 'same' => {
    // Use recent song performance to determine trend
    const recentSongs = songs.filter(s => s.released).slice(0, 3);
    
    if (recentSongs.some(s => s.performanceType === 'viral')) {
      return 'up';
    } else if (recentSongs.some(s => s.performanceType === 'flop')) {
      return 'down';
    } else {
      return 'same';
    }
  };
  
  // Generate top tracks from player's songs, sorting by streams
  const getTopTracks = () => {
    // Make sure we have valid songs array
    if (!songs || songs.length === 0) return [];
    
    // Get all released songs and sort by streams (highest first)
    const releasedSongs = songs
      .filter(song => song.released && song.streams && song.streams > 0) // Only include songs with actual streams
      .sort((a, b) => (b.streams || 0) - (a.streams || 0));
    
    // Debug logging
    console.log("Released songs for Popular section:", 
      releasedSongs.map(s => ({ title: s.title, streams: s.streams }))
    );
    
    // If we have no songs with streams, let's try to find songs in albums
    if (releasedSongs.length === 0 && albums && albums.length > 0) {
      console.log("No songs with streams found, checking albums...");
      
      // Find released albums with streams
      const releasedAlbums = albums.filter(album => album.released && album.streams && album.streams > 0);
      
      if (releasedAlbums.length > 0) {
        console.log("Found released albums with streams, assigning streams to songs");
        
        // For each album, find its songs and distribute the album streams
        releasedAlbums.forEach(album => {
          if (!album.songIds) return;
          
          const albumSongs = songs.filter(song => album.songIds.includes(song.id));
          const songCount = albumSongs.length;
          
          if (songCount > 0) {
            // Distribute album streams among songs based on position
            // First song gets more streams than later songs
            albumSongs.forEach((song, index) => {
              const position = album.songIds.indexOf(song.id);
              const positionFactor = Math.max(0.5, 1 - (position / (songCount * 2)));
              const portionOfStreams = Math.floor(((album.streams || 0) / songCount) * positionFactor);
              
              // Add streams to the song if it doesn't already have streams
              if (!song.streams || song.streams === 0) {
                const songIndex = songs.findIndex(s => s.id === song.id);
                if (songIndex !== -1) {
                  songs[songIndex].streams = portionOfStreams;
                }
              }
            });
          }
        });
        
        // Re-get all released songs with new stream values
        const updatedReleasedSongs = songs
          .filter(song => song.released && song.streams && song.streams > 0)
          .sort((a, b) => (b.streams || 0) - (a.streams || 0));
        
        console.log("Updated released songs with streams:", 
          updatedReleasedSongs.map(s => ({ title: s.title, streams: s.streams }))
        );
        
        return updatedReleasedSongs.slice(0, 10).map(song => ({
          id: song.id,
          title: song.title,
          featuring: song.featuring,
          plays: song.streams || 0,
          // Use default values for properties that might not exist in the Song type
          duration: '3:00', // Default duration
          explicit: false   // Default explicit flag
        }));
      }
    }
    
    return releasedSongs.slice(0, 10).map(song => ({
      id: song.id,
      title: song.title,
      featuring: song.featuring,
      plays: song.streams || 0,
      // Use default values for properties that might not exist in the Song type
      duration: '3:00', // Default duration
      explicit: false   // Default explicit flag
    }));
  };
  
  // Real data from game state
  const artist = {
    name: character?.artistName || 'Your Artist',
    monthlyListeners: formatNumber(monthlyListeners),
    followers: formatNumber(Math.floor(monthlyListeners * 0.4)), // Estimate followers as 40% of monthly listeners
    verified: true,
    artistRank: calculateRank(),
    rankChange: determineRankChange(),
    bio: character?.about || 'Rising artist making waves in the industry.',
    topTracks: getTopTracks(),
    discography: (albums || []).map((album, index) => ({
      id: album.id,
      title: album.title,
      year: new Date().getFullYear() - Math.floor(Math.random() * 3),
      type: 'Album',
      image: album.coverArt || 'https://via.placeholder.com/150'
    })),
    // Generate appears on and similar artists using AI rappers
    appearsOn: aiRappers.slice(0, 3).map(rapper => ({
      id: rapper.id,
      title: `${rapper.name} & Friends`,
      artist: rapper.name,
      image: rapper.image || 'https://via.placeholder.com/150'
    })),
    similarArtists: aiRappers.slice(0, 4).map(rapper => ({
      id: rapper.id,
      name: rapper.name,
      image: rapper.image || 'https://via.placeholder.com/150'
    })),
    profileImage: character?.image || 'https://via.placeholder.com/300',
    headerImage: 'https://via.placeholder.com/1200x400',
  };

  // Render album detail view if an album is selected
  if (selectedAlbumId) {
    return <AlbumDetail albumId={selectedAlbumId} onBack={() => setSelectedAlbumId(null)} />;
  }

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Left Sidebar */}
      <div className="w-60 flex-shrink-0 bg-black p-4 border-r border-gray-800">
        <div className="flex flex-col h-full">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white py-1">
              <ChevronLeft className="h-7 w-7 bg-black rounded-full p-1" />
              <ChevronRight className="h-7 w-7 bg-black rounded-full p-1" />
            </div>
            
            <div className="bg-gray-900 rounded-md p-3 space-y-4">
              <button className="flex items-center space-x-3 text-white hover:text-white/70 w-full">
                <Home className="h-6 w-6" />
                <span className="font-medium">Home</span>
              </button>
              <button className="flex items-center space-x-3 text-white hover:text-white/70 w-full">
                <Search className="h-6 w-6" />
                <span className="font-medium">Search</span>
              </button>
            </div>
            
            <div className="bg-gray-900 rounded-md p-3 h-64 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <button className="flex items-center space-x-2 text-white hover:text-white/70">
                  <Library className="h-6 w-6" />
                  <span className="font-medium">Your Library</span>
                </button>
                <button className="text-white hover:text-white/70">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              
              {/* Library Items */}
              <div className="space-y-3 mt-4">
                <div className="p-2 bg-gray-800 bg-opacity-40 rounded-md">
                  <h4 className="font-medium text-sm">Create your first playlist</h4>
                  <p className="text-xs text-gray-400 mt-1">It's easy, we'll help you</p>
                  <button className="mt-3 px-3 py-1 text-xs font-bold bg-white text-black rounded-full">
                    Create playlist
                  </button>
                </div>
                
                <div className="p-2 bg-gray-800 bg-opacity-40 rounded-md">
                  <h4 className="font-medium text-sm">Let's find some podcasts to follow</h4>
                  <p className="text-xs text-gray-400 mt-1">We'll keep you updated on new episodes</p>
                  <button className="mt-3 px-3 py-1 text-xs font-bold bg-white text-black rounded-full">
                    Browse podcasts
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative">
        {/* Header with artist image */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"></div>
          <div className="h-80 bg-gradient-to-b from-blue-900 to-gray-900"></div>
          
          <div className="absolute bottom-0 flex items-end p-6 space-x-6">
            <div className="w-48 h-48 shadow-2xl rounded-full overflow-hidden">
              <img 
                src={artist.profileImage} 
                alt={artist.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="pb-6">
              {artist.verified && (
                <div className="flex items-center mb-2">
                  <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-sm font-medium">
                    Verified Artist
                  </span>
                </div>
              )}
              
              <h1 className="text-7xl font-bold mb-6">{artist.name}</h1>
              
              <div className="text-sm flex items-center">
                <span className="mr-3">{artist.monthlyListeners} monthly listeners</span>
                <div className="flex items-center bg-gray-800 rounded-full px-3 py-1">
                  <span className="font-bold mr-1">#{artist.artistRank}</span>
                  <span className="text-xs text-gray-400">in the world</span>
                  {artist.rankChange === 'up' && (
                    <svg className="h-3 w-3 ml-1 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 14l5-5 5 5H7z"></path>
                    </svg>
                  )}
                  {artist.rankChange === 'down' && (
                    <svg className="h-3 w-3 ml-1 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5H7z"></path>
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="p-6 flex items-center space-x-4 bg-gradient-to-b from-gray-900 to-black">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-400 focus:outline-none">
            <Play fill="black" className="h-5 w-5 text-black ml-0.5" />
          </button>
          
          <button className="text-white hover:text-white/70">
            <Heart className="h-9 w-9" />
          </button>
          
          <button className="text-white hover:text-white/70">
            <MoreHorizontal className="h-8 w-8" />
          </button>
        </div>
        
        {/* Popular */}
        <div className="p-4 sm:p-6 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">Popular</h2>
          
          <div className="space-y-2 sm:space-y-3">
            {artist.topTracks.slice(0, 5).map((track, index) => {
              // Find album this song belongs to for the cover art
              const song = songs.find(s => s.id === track.id);
              const albumWithSong = (albums || []).find(a => song && a.songIds && a.songIds.includes(song.id));
              const songCoverArt = albumWithSong?.coverArt || song?.icon || 'https://via.placeholder.com/40';
              
              return (
                <div key={track.id} className="group flex items-center p-1.5 sm:p-2 rounded-md hover:bg-white/10">
                  <div className="w-5 sm:w-6 text-center text-gray-400 group-hover:text-white text-xs sm:text-sm">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 ml-2 sm:ml-4 mr-2 sm:mr-6 min-w-0">
                    <div className="flex items-center">
                      <div className="mr-2 sm:mr-3 w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 flex-shrink-0 overflow-hidden rounded">
                        <img src={songCoverArt} alt={track.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm sm:text-base truncate">{track.title}</div>
                        {track.featuring && track.featuring.length > 0 && (
                          <div className="text-xs sm:text-sm text-gray-400 truncate">feat. {track.featuring.join(', ')}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-gray-400 text-[10px] sm:text-sm whitespace-nowrap px-1">{formatNumber(track.plays)} plays</div>
                  
                  <div className="ml-2 sm:ml-6 text-gray-400 text-[10px] sm:text-sm whitespace-nowrap">
                    {track.duration}
                  </div>
                </div>
              );
            })}
            
            <button className="text-gray-400 hover:text-white text-xs sm:text-sm font-bold mt-2">
              See more
            </button>
          </div>
        </div>
        
        {/* Discography section */}
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-2 sm:mb-4">
            <h2 className="text-xl sm:text-2xl font-bold">Discography</h2>
            <button className="text-gray-400 hover:text-white text-xs sm:text-sm font-bold">
              Show all
            </button>
          </div>
          
          <div className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-2 sm:pb-4">
            {artist.discography.map(album => (
              <div 
                key={album.id} 
                className="min-w-[120px] sm:min-w-[160px] p-2 sm:p-3 bg-gray-900 bg-opacity-60 rounded-md hover:bg-gray-800 cursor-pointer transition-all hover:scale-105"
                onClick={() => setSelectedAlbumId(album.id)}
              >
                <img 
                  src={album.image} 
                  alt={album.title} 
                  className="w-full aspect-square object-cover mb-2 sm:mb-3 rounded-md"
                />
                <h3 className="font-medium text-white text-sm sm:text-base truncate">{album.title}</h3>
                <p className="text-xs sm:text-sm text-gray-400">{album.year} • {album.type}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Featuring section */}
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-2 sm:mb-4">
            <h2 className="text-xl sm:text-2xl font-bold">Featuring {artist.name}</h2>
            <button className="text-gray-400 hover:text-white text-xs sm:text-sm font-bold">
              Show all
            </button>
          </div>
          
          <div className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-2 sm:pb-4">
            {artist.appearsOn.map(album => (
              <div key={album.id} className="min-w-[120px] sm:min-w-[160px] p-2 sm:p-3 bg-gray-900 bg-opacity-60 rounded-md hover:bg-gray-800">
                <img 
                  src={album.image} 
                  alt={album.title} 
                  className="w-full aspect-square object-cover mb-2 sm:mb-3 rounded-md"
                />
                <h3 className="font-medium text-white text-sm sm:text-base truncate">{album.title}</h3>
                <p className="text-xs sm:text-sm text-gray-400">By {album.artist}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* About section */}
        <div className="p-4 sm:p-6 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">About</h2>
          
          <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
            <div className="flex-1">
              <img 
                src={artist.profileImage} 
                alt={artist.name} 
                className="w-full h-40 sm:h-64 object-cover object-top rounded-full mb-4"
              />
              
              <div className="flex flex-col mb-4 sm:mb-6">
                <div className="flex items-center text-xs sm:text-sm mb-2">
                  <span className="text-white font-bold mr-2">{artist.monthlyListeners}</span>
                  <span className="text-gray-400">monthly listeners</span>
                </div>
                
                <div className="flex items-center bg-gray-900 rounded-md p-2 sm:p-3 mt-2">
                  <div className="flex-1">
                    <span className="text-lg sm:text-xl font-bold block">#{artist.artistRank}</span>
                    <span className="text-xs sm:text-sm text-gray-400">Global Rank</span>
                  </div>
                  
                  <div className="flex items-center text-xs sm:text-sm">
                    {artist.rankChange === 'up' && (
                      <div className="flex items-center text-green-500">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7 14l5-5 5 5H7z"></path>
                        </svg>
                        <span>Trending Up</span>
                      </div>
                    )}
                    {artist.rankChange === 'down' && (
                      <div className="flex items-center text-red-500">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7 10l5 5 5-5H7z"></path>
                        </svg>
                        <span>Trending Down</span>
                      </div>
                    )}
                    {artist.rankChange === 'same' && (
                      <div className="flex items-center text-gray-400">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M5 12h14"></path>
                        </svg>
                        <span>Steady</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
                {character?.about || 'Rising artist making waves in the industry.'}
              </p>
            </div>
            
            <div className="w-full md:w-1/3">
              <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-4">Fans also like</h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                {artist.similarArtists.map(similar => (
                  <div key={similar.id} className="p-2 bg-gray-900 bg-opacity-60 rounded-md hover:bg-gray-800">
                    <img 
                      src={similar.image} 
                      alt={similar.name} 
                      className="w-full aspect-square object-cover mb-2 rounded-full"
                    />
                    <h4 className="font-medium text-white text-xs sm:text-sm text-center truncate">{similar.name}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 sm:h-20 bg-gray-900 border-t border-gray-800 flex items-center px-2 sm:px-4">
        <div className="flex items-center w-1/4 md:w-1/3">
          <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gray-800 mr-2 sm:mr-3 hidden sm:block"></div>
          <div className="truncate">
            <div className="font-medium text-xs sm:text-sm truncate">All My Life (feat. J. Cole)</div>
            <div className="text-[10px] sm:text-xs text-gray-400 truncate">Lil Durk, J. Cole</div>
          </div>
          <button className="ml-2 sm:ml-4 text-gray-400 hover:text-white hidden sm:block">
            <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center w-2/4 md:w-1/3">
          <div className="flex items-center space-x-2 sm:space-x-4 mb-1">
            <button className="text-gray-400 hover:text-white">
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"></path>
              </svg>
            </button>
            <button className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white text-black">
              <Play fill="black" className="h-3 w-3 sm:h-5 sm:w-5 ml-0.5" />
            </button>
            <button className="text-gray-400 hover:text-white">
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"></path>
              </svg>
            </button>
          </div>
          
          <div className="flex items-center w-full">
            <span className="text-[10px] sm:text-xs text-gray-400 mr-1 sm:mr-2">1:45</span>
            <div className="flex-1 h-1 bg-gray-600 rounded-full">
              <div className="h-1 bg-white rounded-full w-1/3"></div>
            </div>
            <span className="text-[10px] sm:text-xs text-gray-400 ml-1 sm:ml-2">3:45</span>
          </div>
        </div>
        
        <div className="flex items-center justify-end w-1/4 md:w-1/3 space-x-1 sm:space-x-3">
          <button className="text-gray-400 hover:text-white hidden sm:block">
            <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"></path>
            </svg>
          </button>
          <button className="text-gray-400 hover:text-white hidden sm:block">
            <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"></path>
            </svg>
          </button>
          <button className="text-gray-400 hover:text-white">
            <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
            </svg>
          </button>
          <div className="w-12 sm:w-24 h-1 bg-gray-600 rounded-full">
            <div className="h-1 bg-white rounded-full w-2/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistProfile;