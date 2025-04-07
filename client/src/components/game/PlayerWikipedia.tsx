import React, { useState } from 'react';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { motion } from 'framer-motion';
import { Book, Clock, Award, Music, Star, Users, TrendingUp, BarChart2, Calendar } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export function PlayerWikipedia() {
  const gameState = useRapperGame();
  // Fix: Destructuring of possibly undefined values with fallbacks
  const { 
    character = {}, 
    currentWeek = 1, 
    stats = {}, 
    songs = [], 
    albums = [], 
    socialMediaStats = {}, 
    streamingPlatforms = []
  } = gameState || {};
  const [activeTab, setActiveTab] = useState('overview');
  
  // Debug the gameState
  console.log('PlayerWikipedia - songs available in store:', 
    gameState?.songs?.map(s => s.title) || 'No songs');
  console.log('PlayerWikipedia - songs length:', gameState?.songs?.length || 0);

  // Calculate total career stats  
  // More defensive checking of songs array
  const safeSongs = Array.isArray(songs) ? songs : [];
  
  // Log songs array to debug
  console.log('PlayerWikipedia - Songs data:', JSON.stringify(safeSongs.map(s => ({
    title: s.title || 'Unnamed song',
    streams: typeof s.streams === 'number' ? s.streams : 0,
    released: !!s.released
  }))));
  
  const totalSongs = safeSongs.filter(song => song.released)?.length || 0;
  const totalAlbums = Array.isArray(albums) ? albums.filter(album => album.released)?.length || 0 : 0;
  
  // More defensive stream calculation
  const totalStreams = safeSongs.reduce((total, song) => {
    const streamCount = typeof song.streams === 'number' ? song.streams : 0;
    console.log(`Song "${song?.title || 'Unnamed'}": ${streamCount} streams, released: ${!!song.released}`);
    return total + streamCount;
  }, 0);
  
  console.log('PlayerWikipedia - Total streams calculated:', totalStreams);
  
  // Calculate total fans/followers across platforms
  const calculateTotalFollowers = () => {
    let total = 0;
    if (socialMediaStats?.twitter?.followers) total += socialMediaStats.twitter.followers;
    if (socialMediaStats?.instagram?.followers) total += socialMediaStats.instagram.followers;
    if (socialMediaStats?.tiktok?.followers) total += socialMediaStats.tiktok.followers;
    return total;
  };

  const totalFollowers = calculateTotalFollowers();

  // Calculate monthly listeners
  const calculateMonthlyListeners = () => {
    let total = 0;
    // Check if streamingPlatforms exists and is an array
    if (streamingPlatforms && Array.isArray(streamingPlatforms)) {
      streamingPlatforms.forEach(platform => {
        // Check if monthlyListeners exists and is a number
        const listeners = typeof platform.monthlyListeners === 'number' ? platform.monthlyListeners : 0;
        total += listeners;
      });
    }
    return total;
  };

  const monthlyListeners = calculateMonthlyListeners();

  // Find most successful song and album with defensive checking
  const mostSuccessfulSong = Array.isArray(safeSongs) && safeSongs.length > 0 
    ? [...safeSongs].sort((a, b) => {
        const aStreams = typeof a.streams === 'number' ? a.streams : 0;
        const bStreams = typeof b.streams === 'number' ? b.streams : 0;
        return bStreams - aStreams;
      })[0] 
    : null;
    
  const safeAlbums = Array.isArray(albums) ? albums : [];
  const mostSuccessfulAlbum = safeAlbums.length > 0
    ? [...safeAlbums].sort((a, b) => {
        const aStreams = typeof a.streams === 'number' ? a.streams : 0;
        const bStreams = typeof b.streams === 'number' ? b.streams : 0;
        return bStreams - aStreams;
      })[0] 
    : null;

  return (
    <div className="bg-gray-900 text-white rounded-lg border border-gray-800 overflow-hidden">
      <header className="bg-gradient-to-r from-purple-900 to-indigo-900 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-shrink-0">
            {character?.image ? (
              <img 
                src={character.image}
                alt={character?.artistName || 'Artist'} 
                className="h-24 w-24 md:h-32 md:w-32 rounded-lg object-cover border-2 border-purple-400 shadow-lg" 
              />
            ) : (
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-4xl font-bold border-2 border-purple-400 shadow-lg">
                {character?.artistName?.charAt(0) || '?'}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
              {character?.artistName || 'Unknown Artist'}
            </h1>
            
            <p className="text-purple-200 mt-1 italic">
              {character?.realName && `Born ${character.realName}, `}
              Career started in Week 1
              {character?.hometown && `, from ${character.hometown}`}
            </p>
            
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-purple-900 bg-opacity-60 rounded text-xs border border-purple-700">
                {totalSongs} Songs
              </span>
              <span className="px-2 py-1 bg-purple-900 bg-opacity-60 rounded text-xs border border-purple-700">
                {totalAlbums} Albums
              </span>
              <span className="px-2 py-1 bg-purple-900 bg-opacity-60 rounded text-xs border border-purple-700">
                Week {currentWeek} of Career
              </span>
              <span className="px-2 py-1 bg-indigo-900 bg-opacity-60 rounded text-xs border border-indigo-700">
                ${typeof stats?.wealth === 'number' ? stats.wealth.toLocaleString() : '0'} Net Worth
              </span>
            </div>
          </div>
        </div>
      </header>
      
      <nav className="bg-gray-800 px-4 border-b border-gray-700 flex overflow-x-auto">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`px-4 py-3 text-sm font-medium ${activeTab === 'overview' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-300 hover:text-white'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('discography')} 
          className={`px-4 py-3 text-sm font-medium ${activeTab === 'discography' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-300 hover:text-white'}`}
        >
          Discography
        </button>
        <button 
          onClick={() => setActiveTab('streaming')} 
          className={`px-4 py-3 text-sm font-medium ${activeTab === 'streaming' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-300 hover:text-white'}`}
        >
          Streaming
        </button>
        <button 
          onClick={() => setActiveTab('social')} 
          className={`px-4 py-3 text-sm font-medium ${activeTab === 'social' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-300 hover:text-white'}`}
        >
          Social Media
        </button>
      </nav>
      
      <div className="p-4 md:p-6">
        {activeTab === 'overview' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h2 className="text-lg font-bold mb-3 flex items-center">
                  <Book className="w-5 h-5 mr-2 text-purple-400" />
                  Career Overview
                </h2>
                <p className="text-gray-300 mb-4">
                  {character?.artistName || 'The artist'} is a {currentWeek < 52 ? 'new' : 'established'} rapper who has been 
                  active for {currentWeek} weeks. They have released {totalSongs} songs and {totalAlbums} albums.
                  {character?.bio && <span> {character.bio}</span>}
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-700 bg-opacity-50 rounded p-3 border border-gray-600">
                    <div className="text-xs text-gray-400">Reputation</div>
                    <div className="font-bold text-lg">{stats?.reputation || 0}%</div>
                  </div>
                  <div className="bg-gray-700 bg-opacity-50 rounded p-3 border border-gray-600">
                    <div className="text-xs text-gray-400">Net Worth</div>
                    <div className="font-bold text-lg">${typeof stats?.wealth === 'number' ? stats.wealth.toLocaleString() : '0'}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h2 className="text-lg font-bold mb-3 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-purple-400" />
                  Career Highlights
                </h2>
                
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <Star className="w-4 h-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-white">Most Streamed Song:</strong>{" "}
                      {mostSuccessfulSong ? (
                        <span className="text-gray-300">
                          "{mostSuccessfulSong.title}" ({formatNumber(mostSuccessfulSong.streams || 0)} streams)
                        </span>
                      ) : (
                        <span className="text-gray-500">No songs released yet</span>
                      )}
                    </span>
                  </li>
                  
                  <li className="flex items-start">
                    <Star className="w-4 h-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-white">Most Popular Album:</strong>{" "}
                      {mostSuccessfulAlbum ? (
                        <span className="text-gray-300">
                          "{mostSuccessfulAlbum.title}" ({mostSuccessfulAlbum.songIds?.length || 0} tracks)
                        </span>
                      ) : (
                        <span className="text-gray-500">No albums released yet</span>
                      )}
                    </span>
                  </li>
                  
                  <li className="flex items-start">
                    <Star className="w-4 h-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-white">Total Streams:</strong>{" "}
                      <span className="text-gray-300">{formatNumber(totalStreams)} across all platforms</span>
                    </span>
                  </li>
                  
                  <li className="flex items-start">
                    <Star className="w-4 h-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-white">Total Followers:</strong>{" "}
                      <span className="text-gray-300">{formatNumber(totalFollowers)} across all social media</span>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h2 className="text-lg font-bold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
                Career Stats
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700 bg-opacity-30 rounded p-3 border border-gray-600 flex flex-col items-center justify-center">
                  <Music className="w-8 h-8 mb-2 text-purple-400" />
                  <div className="text-2xl font-bold">{totalSongs}</div>
                  <div className="text-xs text-gray-400">Songs Released</div>
                </div>
                
                <div className="bg-gray-700 bg-opacity-30 rounded p-3 border border-gray-600 flex flex-col items-center justify-center">
                  <BarChart2 className="w-8 h-8 mb-2 text-indigo-400" />
                  <div className="text-2xl font-bold">{formatNumber(totalStreams)}</div>
                  <div className="text-xs text-gray-400">Total Streams</div>
                </div>
                
                <div className="bg-gray-700 bg-opacity-30 rounded p-3 border border-gray-600 flex flex-col items-center justify-center">
                  <Users className="w-8 h-8 mb-2 text-blue-400" />
                  <div className="text-2xl font-bold">{formatNumber(monthlyListeners)}</div>
                  <div className="text-xs text-gray-400">Monthly Listeners</div>
                </div>
                
                <div className="bg-gray-700 bg-opacity-30 rounded p-3 border border-gray-600 flex flex-col items-center justify-center">
                  <Calendar className="w-8 h-8 mb-2 text-green-400" />
                  <div className="text-2xl font-bold">{currentWeek}</div>
                  <div className="text-xs text-gray-400">Weeks Active</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h2 className="text-lg font-bold mb-3 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-purple-400" />
                Recent Activity
              </h2>
              
              <div className="space-y-3">
                {safeSongs && safeSongs.length > 0 ? (
                  safeSongs
                    .filter(song => song.released)
                    .sort((a, b) => {
                      const aDate = a.releaseDate || 0;
                      const bDate = b.releaseDate || 0;
                      return bDate - aDate;
                    })
                    .slice(0, 3)
                    .map(song => (
                      <div key={song.id} className="flex items-center p-2 bg-gray-700 bg-opacity-30 rounded">
                        <div className="w-10 h-10 rounded bg-gradient-to-br from-purple-700 to-pink-700 flex items-center justify-center mr-3 flex-shrink-0">
                          <Music className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium">{song.title}</div>
                          <div className="text-xs text-gray-400">
                            Released on Week {song.releaseDate || '?'} • {formatNumber(typeof song.streams === 'number' ? song.streams : 0)} streams
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-gray-500 italic text-center py-4">
                    No recent activity to display
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
        
        {activeTab === 'discography' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h2 className="text-lg font-bold mb-3">Albums ({totalAlbums})</h2>
              
              {albums && albums.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {albums.filter(album => album.released).map(album => (
                    <div key={album.id} className="flex bg-gray-700 bg-opacity-40 rounded overflow-hidden border border-gray-600">
                      {album.coverArt ? (
                        <img src={album.coverArt} alt={album.title} className="w-24 h-24 object-cover" />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-800 to-pink-800 flex items-center justify-center">
                          <Music className="w-8 h-8 text-white opacity-70" />
                        </div>
                      )}
                      <div className="p-3">
                        <h3 className="font-bold">{album.title}</h3>
                        <div className="text-xs text-gray-400 mt-1">Released on Week {album.releaseDate}</div>
                        <div className="text-xs text-gray-400">{album.songIds?.length || 0} tracks</div>
                        <div className="text-xs text-purple-400 mt-1">{album.type} Album</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic text-center py-3">
                  No albums released yet
                </div>
              )}
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h2 className="text-lg font-bold mb-3">Singles & Songs ({totalSongs})</h2>
              
              {safeSongs && safeSongs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="text-left text-xs text-gray-400 border-b border-gray-700">
                      <tr>
                        <th className="pb-2 px-2">#</th>
                        <th className="pb-2 px-2">Title</th>
                        <th className="pb-2 px-2">Release</th>
                        <th className="pb-2 px-2">Tier</th>
                        <th className="pb-2 px-2">Streams</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeSongs
                        .filter(song => song.released)
                        .sort((a, b) => {
                          const aStreams = typeof a.streams === 'number' ? a.streams : 0;
                          const bStreams = typeof b.streams === 'number' ? b.streams : 0;
                          return bStreams - aStreams;
                        })
                        .map((song, index) => (
                        <tr key={song.id} className="border-b border-gray-700 hover:bg-gray-700 hover:bg-opacity-30">
                          <td className="py-3 px-2 text-sm">{index + 1}</td>
                          <td className="py-3 px-2">
                            <div className="font-medium">{song.title}</div>
                            {Array.isArray(song.featuring) && song.featuring.length > 0 && (
                              <div className="text-xs text-gray-400">feat. {song.featuring.join(', ')}</div>
                            )}
                          </td>
                          <td className="py-3 px-2 text-sm">Week {song.releaseDate || '?'}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded text-xs ${getTierColor(song.tier)}`}>
                              Tier {song.tier || 1}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-sm">{formatNumber(typeof song.streams === 'number' ? song.streams : 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-500 italic text-center py-3">
                  No songs released yet
                </div>
              )}
            </div>
          </motion.div>
        )}
        
        {activeTab === 'streaming' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h2 className="text-lg font-bold mb-3">Streaming Overview</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Streams:</span>
                    <span className="font-bold">{formatNumber(totalStreams)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Monthly Listeners:</span>
                    <span className="font-bold">{formatNumber(monthlyListeners)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Average per Song:</span>
                    <span className="font-bold">
                      {totalSongs ? formatNumber(totalStreams / totalSongs) : '-'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h2 className="text-lg font-bold mb-3">Platform Distribution</h2>
                
                {streamingPlatforms && streamingPlatforms.length > 0 ? (
                  <div className="space-y-3">
                    {streamingPlatforms.map(platform => {
                      const percentage = totalStreams > 0 
                        ? Math.round((platform.streams / totalStreams) * 100) 
                        : 0;
                      
                      return (
                        <div key={platform.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{platform.name}</span>
                            <span className="text-gray-400">{formatNumber(platform.streams)} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getPlatformColor(platform.name)}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-gray-500 italic text-center py-3">
                    No streaming data available
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h2 className="text-lg font-bold mb-3">Top Songs by Streaming</h2>
              
              {safeSongs && safeSongs.filter(song => song.released).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {safeSongs
                    .filter(song => song.released)
                    .sort((a, b) => {
                      const aStreams = typeof a.streams === 'number' ? a.streams : 0;
                      const bStreams = typeof b.streams === 'number' ? b.streams : 0;
                      return bStreams - aStreams;
                    })
                    .slice(0, 9)
                    .map((song, index) => {
                      const songStreams = typeof song.streams === 'number' ? song.streams : 0;
                      const streamPercent = totalStreams > 0 
                        ? (songStreams / totalStreams) * 100
                        : 0;
                        
                      return (
                        <div key={song.id} className="bg-gray-700 bg-opacity-30 p-3 rounded border border-gray-600">
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 rounded bg-gray-600 flex items-center justify-center mr-3">
                              {index + 1}
                            </div>
                            <div className="truncate">
                              <div className="font-medium truncate">{song.title}</div>
                              <div className="text-xs text-gray-400 truncate">
                                {formatNumber(songStreams)} streams
                              </div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                              style={{ width: `${Math.min(100, streamPercent * 3)}%` }}
                            />
                          </div>
                        </div>
                      );
                  })}
                </div>
              ) : (
                <div className="text-gray-500 italic text-center py-3">
                  No streaming data available
                </div>
              )}
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h2 className="text-lg font-bold mb-3">Stream Growth Forecast</h2>
              
              <p className="text-gray-300 mb-4">
                Based on current growth rates, you are projected to reach the following milestones:
              </p>
              
              {calculateStreamingProjections().map((projection, index) => (
                <div key={index} className="flex items-center mb-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400 mr-2"></div>
                  <div className="text-sm">{projection}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        
        {activeTab === 'social' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SocialMediaCard 
                platform="Twitter" 
                followers={socialMediaStats?.twitter?.followers || 0}
                postCount={socialMediaStats?.twitter?.tweets?.length || 0}
                color="bg-blue-500"
                growth={calculateGrowthRate(socialMediaStats?.twitter?.followers || 0)}
              />
              
              <SocialMediaCard 
                platform="Instagram" 
                followers={socialMediaStats?.instagram?.followers || 0}
                postCount={socialMediaStats?.instagram?.posts?.length || 0}
                color="bg-pink-600"
                growth={calculateGrowthRate(socialMediaStats?.instagram?.followers || 0)}
              />
              
              <SocialMediaCard 
                platform="TikTok" 
                followers={socialMediaStats?.tiktok?.followers || 0}
                postCount={socialMediaStats?.tiktok?.videos?.length || 0}
                color="bg-black"
                growth={calculateGrowthRate(socialMediaStats?.tiktok?.followers || 0)}
              />
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h2 className="text-lg font-bold mb-3">Viral Post Analytics</h2>
              
              {getViralPosts().length > 0 ? (
                <div className="space-y-3">
                  {getViralPosts().map(post => (
                    <div key={post.id} className="bg-gray-700 bg-opacity-30 p-3 rounded border border-gray-600">
                      <div className="flex items-start">
                        <div className={`w-10 h-10 rounded ${getPlatformBgColor(post.platformName)} flex items-center justify-center mr-3 flex-shrink-0`}>
                          {getPlatformIcon(post.platformName)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium flex items-center">
                            <span className={`px-2 py-0.5 rounded text-xs mr-2 ${getViralStatusColor(post.viralStatus)}`}>
                              {formatViralStatus(post.viralStatus)}
                            </span>
                            <span>Week {post.postWeek}</span>
                          </div>
                          <div className="text-sm text-gray-300 mt-1">
                            {post.content}
                          </div>
                          <div className="flex gap-4 mt-2 text-xs text-gray-400">
                            <span>{formatNumber(post.likes)} likes</span>
                            <span>{formatNumber(post.shares)} shares</span>
                            <span>{formatNumber(post.followerGain)} new followers</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic text-center py-3">
                  No viral posts yet
                </div>
              )}
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h2 className="text-lg font-bold mb-3">Social Media Growth</h2>
              
              <p className="text-gray-300 mb-4">
                Your social media following has been growing steadily. Current combined following: {formatNumber(totalFollowers)}
              </p>
              
              <div className="space-y-4">
                <div className="bg-gray-700 bg-opacity-30 p-3 rounded border border-gray-600">
                  <h3 className="font-medium mb-2">Growth Opportunities</h3>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 mr-2"></div>
                      <span>Post consistently to increase engagement and follower growth</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 mr-2"></div>
                      <span>Collaborate with other artists to reach new audiences</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 mr-2"></div>
                      <span>Create viral-worthy content to maximize follower gains</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-700 bg-opacity-30 p-3 rounded border border-gray-600">
                  <h3 className="font-medium mb-2">Follower Demographics</h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-xs text-gray-400">Age Group</div>
                      <div className="font-medium">18-24</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Most Active</div>
                      <div className="font-medium">{getMostActivePlatform()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Engagement</div>
                      <div className="font-medium">{getAverageEngagement()}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function SocialMediaCard({ platform, followers, postCount, color, growth }: { 
  platform: string; 
  followers: number; 
  postCount: number;
  color: string;
  growth: string;
}) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
      <div className={`${color} p-3`}>
        <h3 className="text-white font-bold">{platform}</h3>
      </div>
      <div className="p-4">
        <div className="text-2xl font-bold">{formatNumber(followers)}</div>
        <div className="text-sm text-gray-400 mb-3">Followers</div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">{postCount} posts</span>
          <span className="text-green-400">{growth}</span>
        </div>
      </div>
    </div>
  );
}

// Helper functions for styling and formatting
function getTierColor(tier: number) {
  switch(tier) {
    case 1: return 'bg-gray-600';
    case 2: return 'bg-blue-600';
    case 3: return 'bg-purple-600';
    case 4: return 'bg-pink-600';
    case 5: return 'bg-yellow-600';
    default: return 'bg-gray-600';
  }
}

function getPlatformColor(platform: string) {
  switch(platform.toLowerCase()) {
    case 'spotify': return 'bg-green-500';
    case 'apple music': return 'bg-pink-500';
    case 'youtube music': return 'bg-red-500';
    case 'soundcloud': return 'bg-orange-500';
    default: return 'bg-blue-500';
  }
}

function getPlatformBgColor(platform: string) {
  switch(platform.toLowerCase()) {
    case 'twitter': return 'bg-blue-500';
    case 'instagram': return 'bg-pink-600';
    case 'tiktok': return 'bg-gray-800';
    default: return 'bg-purple-500';
  }
}

function getPlatformIcon(platform: string) {
  // Simple text icons as placeholders
  switch(platform.toLowerCase()) {
    case 'twitter': return 'Tw';
    case 'instagram': return 'Ig';
    case 'tiktok': return 'Tt';
    default: return '?';
  }
}

function getViralStatusColor(status: string) {
  switch(status) {
    case 'super_viral': return 'bg-yellow-600 text-white';
    case 'viral': return 'bg-pink-600 text-white';
    case 'trending': return 'bg-purple-600 text-white';
    default: return 'bg-gray-600 text-white';
  }
}

function formatViralStatus(status: string) {
  switch(status) {
    case 'super_viral': return 'SUPER VIRAL';
    case 'viral': return 'VIRAL';
    case 'trending': return 'TRENDING';
    default: return 'NORMAL';
  }
}

function calculateGrowthRate(followers: number) {
  // Simplified growth rate estimation
  const rate = Math.max(1, Math.floor(Math.sqrt(followers) / 5));
  return `+${rate}% weekly`;
}

function getViralPosts() {
  const gameState = useRapperGame.getState();
  const allPosts: any[] = [];
  
  if (gameState.socialMediaStats?.twitter?.tweets) {
    const viral = gameState.socialMediaStats.twitter.tweets.filter(
      post => post.viralStatus !== 'not_viral'
    );
    allPosts.push(...viral);
  }
  
  if (gameState.socialMediaStats?.instagram?.posts) {
    const viral = gameState.socialMediaStats.instagram.posts.filter(
      post => post.viralStatus !== 'not_viral'
    );
    allPosts.push(...viral);
  }
  
  if (gameState.socialMediaStats?.tiktok?.videos) {
    const viral = gameState.socialMediaStats.tiktok.videos.filter(
      post => post.viralStatus !== 'not_viral'
    );
    allPosts.push(...viral);
  }
  
  return allPosts
    .sort((a, b) => {
      // First sort by viral status
      const statusOrder = { super_viral: 3, viral: 2, trending: 1, not_viral: 0 };
      const statusDiff = 
        statusOrder[b.viralStatus as keyof typeof statusOrder] - 
        statusOrder[a.viralStatus as keyof typeof statusOrder];
      
      if (statusDiff !== 0) return statusDiff;
      
      // Then by postWeek (more recent first)
      return b.postWeek - a.postWeek;
    })
    .slice(0, 5); // Show top 5 viral posts
}

function getMostActivePlatform() {
  const gameState = useRapperGame.getState();
  const platforms = [
    { name: 'Twitter', followers: gameState.socialMediaStats?.twitter?.followers || 0 },
    { name: 'Instagram', followers: gameState.socialMediaStats?.instagram?.followers || 0 },
    { name: 'TikTok', followers: gameState.socialMediaStats?.tiktok?.followers || 0 }
  ];
  
  return platforms.sort((a, b) => b.followers - a.followers)[0].name;
}

function getAverageEngagement() {
  const gameState = useRapperGame.getState();
  const twitterEng = gameState.socialMediaStats?.twitter?.engagement || 0;
  const instagramEng = gameState.socialMediaStats?.instagram?.engagement || 0;
  const tiktokEng = gameState.socialMediaStats?.tiktok?.engagement || 0;
  
  const count = (twitterEng > 0 ? 1 : 0) + (instagramEng > 0 ? 1 : 0) + (tiktokEng > 0 ? 1 : 0);
  if (count === 0) return 0;
  
  return Math.round((twitterEng + instagramEng + tiktokEng) / count);
}

function calculateStreamingProjections() {
  const gameState = useRapperGame.getState();
  const totalStreams = gameState.songs?.reduce((total, song) => total + (song.streams || 0), 0) || 0;
  const weeklyGrowth = estimateWeeklyStreamGrowth();
  
  // Projections for milestone achievements
  const projections = [];
  
  // Next million milestone
  const nextMillion = Math.ceil(totalStreams / 1000000) * 1000000;
  if (nextMillion > totalStreams && weeklyGrowth > 0) {
    const weeksToMillion = Math.ceil((nextMillion - totalStreams) / weeklyGrowth);
    projections.push(`${formatNumber(nextMillion)} total streams in ~${weeksToMillion} weeks`);
  }
  
  // 10x current streams
  const tenX = totalStreams * 10;
  // Prevent division by zero
  if (weeklyGrowth > 0) {
    const weeksToTenX = Math.ceil((tenX - totalStreams) / weeklyGrowth);
    projections.push(`${formatNumber(tenX)} total streams (10x current) in ~${weeksToTenX} weeks`);
  } else {
    projections.push(`${formatNumber(tenX)} total streams (10x current) - need more activity to estimate`);
  }
  
  // Monthly listeners milestone
  const currentMonthly = gameState.streamingPlatforms?.reduce((sum, p) => sum + (p.monthlyListeners || 0), 0) || 0;
  const nextMonthlyMilestone = Math.ceil(currentMonthly / 100000) * 100000;
  
  if (nextMonthlyMilestone > currentMonthly && weeklyGrowth > 0) {
    const weeksToMonthlyMilestone = Math.ceil((nextMonthlyMilestone - currentMonthly) / (weeklyGrowth * 0.2));
    projections.push(`${formatNumber(nextMonthlyMilestone)} monthly listeners in ~${weeksToMonthlyMilestone} weeks`);
  }
  
  return projections;
}

function estimateWeeklyStreamGrowth() {
  // Simplified version that returns an estimate of weekly stream growth
  const gameState = useRapperGame.getState();
  
  // More robust null/undefined checking
  if (!gameState || !gameState.songs) return 1000;
  
  const totalStreams = gameState.songs.reduce((total, song) => total + (song.streams || 0), 0) || 0;
  const songsCount = gameState.songs.filter(song => song.released)?.length || 0;
  
  if (songsCount === 0 || totalStreams === 0) return 1000; // Default value for new artists
  
  // Calculate average streams per song
  const avgStreamsPerSong = totalStreams / songsCount;
  
  // Estimate weekly growth as a percentage of total streams (higher for smaller artists)
  const weeklyGrowthPercent = Math.max(0.02, 0.1 - (totalStreams / 10000000) * 0.05);
  return Math.max(500, Math.floor(totalStreams * weeklyGrowthPercent));
}