import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ProgressBar } from '@/components/ui/progressbar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { SpotifyIcon, SoundCloudIcon, ITunesIcon, YouTubeIcon, VevoIcon, MusicIcon, StarIcon } from '@/assets/icons';
import { VIDEO_COSTS } from '@/lib/gameData';
import { ImageUploader } from '@/components/ui/image-uploader';
// Will implement AIRapperProfiles component later
const AIRapperProfiles = () => {
  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">Artist Profiles</h2>
      <p className="text-gray-500">Artist profiles will be available soon.</p>
    </div>
  );
};
// Define MusicStyle type since it's missing in types.ts
type MusicStyle = string;
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// Import AlbumDetail component for showing album details
import AlbumDetail from '../spotify/AlbumDetail';

export function StreamingPlatforms() {
  const { streamingPlatforms, videosPlatforms, songs, stats, character, setScreen, updateCharacter, musicVideos, albums } = useRapperGame();
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showCoverEditor, setShowCoverEditor] = useState(false);
  const [showAboutBackgroundEditor, setShowAboutBackgroundEditor] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('spotify');
  // New state variables for album details
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [showAlbumDetail, setShowAlbumDetail] = useState(false);
  
  // Get platform data
  const spotify = streamingPlatforms.find(p => p.name === 'Spotify');
  const soundCloud = streamingPlatforms.find(p => p.name === 'SoundCloud');
  const iTunes = streamingPlatforms.find(p => p.name === 'iTunes');
  const youtubeMusic = streamingPlatforms.find(p => p.name === 'YouTube Music');
  
  // Get video platforms
  const youtube = videosPlatforms.find(p => p.name === 'YouTube');
  const vevo = videosPlatforms.find(p => p.name === 'VEVO');
  
  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(1) + 'B';
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + 'M';
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  
  // Format money
  const formatMoney = (amount: number): string => {
    return '$' + formatNumber(amount);
  };
  
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-green-900 to-black text-white p-4 overflow-y-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center">
          <SpotifyIcon size={28} className="mr-2 text-green-400 flex-shrink-0" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Streaming Platforms</h1>
            <p className="text-xs sm:text-sm text-gray-400">Monitor your performance across streaming services</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="default" 
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 h-8"
            onClick={() => setScreen('streaming_impact_dashboard')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
              <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
            </svg>
            Analytics Dashboard
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-transparent border-gray-600 hover:bg-gray-800 mt-1 sm:mt-0 text-sm py-1 h-auto"
            onClick={() => setScreen('career_dashboard')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left mr-2">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
            Back to Dashboard
          </Button>
        </div>
      </div>
      
      <Tabs 
        value={selectedPlatform} 
        onValueChange={setSelectedPlatform}
        className="space-y-6"
      >
        <TabsList className="bg-green-950 border border-green-800 w-full flex flex-wrap overflow-x-auto h-auto">
          <TabsTrigger value="spotify" className="data-[state=active]:bg-green-800 flex-1 text-[10px] xxs:text-[11px] xs:text-xs sm:text-sm py-1 px-1 sm:px-2 h-auto">
            <SpotifyIcon size={12} className="mr-0.5 sm:mr-1 text-[#1DB954]" />
            <span className="hidden xxs:inline">Spotify</span>
            <span className="xxs:hidden">Spot</span>
          </TabsTrigger>
          <TabsTrigger value="soundcloud" className="data-[state=active]:bg-green-800 flex-1 text-[10px] xxs:text-[11px] xs:text-xs sm:text-sm py-1 px-1 sm:px-2 h-auto">
            <SoundCloudIcon size={12} className="mr-0.5 sm:mr-1 text-[#FF5500]" />
            <span className="hidden xxs:inline">SoundCloud</span>
            <span className="xxs:hidden">SC</span>
          </TabsTrigger>
          <TabsTrigger value="itunes" className="data-[state=active]:bg-green-800 flex-1 text-[10px] xxs:text-[11px] xs:text-xs sm:text-sm py-1 px-1 sm:px-2 h-auto">
            <ITunesIcon size={12} className="mr-0.5 sm:mr-1 text-[#FB5BC5]" />
            <span className="hidden xxs:inline">iTunes</span>
            <span className="xxs:hidden">iT</span>
          </TabsTrigger>
          <TabsTrigger value="youtubeMusic" className="data-[state=active]:bg-green-800 flex-1 text-[10px] xxs:text-[11px] xs:text-xs sm:text-sm py-1 px-1 sm:px-2 h-auto">
            <YouTubeIcon size={12} className="mr-0.5 sm:mr-1 text-[#FF0000]" />
            <span className="hidden xxs:inline">YT Music</span>
            <span className="xxs:hidden">YTM</span>
          </TabsTrigger>
          <TabsTrigger value="youtube" className="data-[state=active]:bg-green-800 flex-1 text-[10px] xxs:text-[11px] xs:text-xs sm:text-sm py-1 px-1 sm:px-2 h-auto">
            <YouTubeIcon size={12} className="mr-0.5 sm:mr-1 text-[#FF0000]" />
            <span className="hidden xxs:inline">YouTube</span>
            <span className="xxs:hidden">YT</span>
          </TabsTrigger>
          <TabsTrigger value="vevo" className="data-[state=active]:bg-green-800 flex-1 text-[10px] xxs:text-[11px] xs:text-xs sm:text-sm py-1 px-1 sm:px-2 h-auto">
            <VevoIcon size={12} className="mr-0.5 sm:mr-1 text-[#FF0000]" />
            <span>VEVO</span>
          </TabsTrigger>
          <TabsTrigger value="artists" className="data-[state=active]:bg-green-800 relative flex-1 text-[10px] xxs:text-[11px] xs:text-xs sm:text-sm py-1 px-1 sm:px-2 h-auto">
            <span className="hidden xxs:inline">Artist Profiles</span>
            <span className="xxs:hidden">Artists</span>
            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] rounded-full px-0.5 py-px">New</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Spotify Platform - Only platform we're keeping */}
        <TabsContent value="spotify" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Spotify Card */}
            {spotify && (
              <Card className="bg-[#121212] border-[#121212] overflow-hidden">
                <div className="flex flex-col h-full">
                  {/* Top Navbar */}
                  <div className="flex items-center justify-between bg-[#121212] px-4 py-3 border-b border-[#282828]">
                    <div className="flex items-center">
                      <SpotifyIcon size={24} className="text-[#1DB954]" />
                      <span className="ml-2 font-bold text-white">Spotify</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" className="h-8 rounded-full p-0 px-2 text-[#b3b3b3] hover:text-white hover:bg-[#282828]">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                          <circle cx="11" cy="11" r="8"></circle>
                          <path d="m21 21-4.3-4.3"></path>
                        </svg>
                        <span className="text-xs">Search</span>
                      </Button>
                      {character?.image && (
                        <img 
                          src={character.image} 
                          alt={character.artistName} 
                          className="h-8 w-8 rounded-full cursor-pointer object-cover"
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Main Content */}
                  <CardContent className="p-0 flex-1 overflow-y-auto">
                    <div className="relative">
                      {/* Banner/Header Section with Artist Info */}
                      <div className="relative">
                        {/* Artist Banner with gradient background like real Spotify */}
                        <div 
                          className="h-48 w-full relative flex flex-col justify-end cursor-pointer group"
                          style={{
                            backgroundImage: character?.coverImage 
                              ? `linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.9) 100%), url(${character.coverImage})`
                              : `linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.9) 100%)`,
                            backgroundColor: '#121212',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center 30%'
                          }}
                          onClick={() => setShowCoverEditor(true)}
                        >
                          {/* Optional overlay for better text visibility */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                          
                          {/* Change background hint */}
                          <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/20">
                            <div className="bg-black/50 text-white rounded-full p-2 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              <span className="ml-1 text-xs font-medium">Change Cover</span>
                            </div>
                          </div>
                          
                          {/* Artist Profile with larger image */}
                          <div className="pb-3 pt-2 px-3 flex flex-col gap-1 relative z-10">
                            {/* Artist Text Info - Compact and stable design */}
                            <div className="text-white w-full">
                              <h1 className="text-4xl font-bold uppercase">{character?.artistName || "RAPPERNAME"}</h1>
                              <div className="flex items-center text-[#b3b3b3] text-xs">
                                <span>{formatNumber(spotify.listeners)} monthly listeners</span>
                                <span className="mx-2">•</span>
                                <span>{songs.filter(s => s.released).length} songs</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action buttons row - simplified to match screenshot */}
                        <div className="px-4 sm:px-7 py-3 sm:py-4 flex items-center gap-3 sm:gap-4 bg-black">
                          <Button 
                            className="h-8 sm:h-10 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs sm:text-sm"
                            onClick={() => setShowProfileEditor(true)}
                          >
                            Edit Profile
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="h-8 sm:h-10 text-[#b3b3b3] hover:text-white rounded-full font-normal hover:bg-[#282828] text-xs sm:text-sm"
                          >
                            <svg className="mr-1 sm:mr-2 h-4 sm:h-5 w-4 sm:w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 5v14M5 12h14"/>
                            </svg>
                            Follow
                          </Button>
                        </div>
                      </div>
                      
                      {/* Main Content Sections */}
                      <div className="p-4 space-y-8">
                        {/* Popular Section */}
                        <div>
                          <h2 className="text-2xl font-bold mb-4">Popular</h2>
                          {songs.length === 0 ? (
                            <div className="text-center py-8 text-[#b3b3b3] bg-[#181818] rounded-md">
                              You haven't released any songs yet.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {songs
                                .filter(s => s.released)
                                .sort((a, b) => b.streams - a.streams)
                                .slice(0, 5)
                                .map((song, index) => (
                                  <div key={song.id} className="flex items-center px-2 xs:px-3 sm:px-5 py-2 xs:py-3 hover:bg-[#282828] rounded-md group">
                                    <div className="w-4 xxs:w-5 xs:w-6 text-center text-[#b3b3b3] mr-2 xxs:mr-3 xs:mr-4 font-normal text-xs xxs:text-sm">{index + 1}</div>
                                    <div className="h-10 w-10 xxs:h-12 xxs:w-12 xs:h-14 xs:w-14 mr-2 xxs:mr-3 xs:mr-4 overflow-hidden flex-shrink-0">
                                      {song.coverArt ? (
                                        <img src={song.coverArt} alt={song.title} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full bg-[#333] flex items-center justify-center">
                                          <MusicIcon size={12} className="text-[#b3b3b3]" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-xs xxs:text-sm xs:text-md truncate pr-1">{song.title}</div>
                                      <div className="text-[10px] xxs:text-xs text-[#b3b3b3] truncate">
                                        {song.featuring.length > 0 ? `Feat. ${song.featuring.length} artist${song.featuring.length > 1 ? 's' : ''}` : 'Single'}
                                      </div>
                                    </div>
                                    <div className="text-right text-xs xxs:text-sm text-[#b3b3b3] flex-shrink-0 pl-1">
                                      {selectedPlatform === 'spotify' && spotify ? 
                                         // Distribute streams weighted by platform market share with slight variation
                                         formatNumber(Math.floor(song.streams * (0.55 * (0.9 + Math.random() * 0.2)))) :
                                       selectedPlatform === 'youtubeMusic' && youtubeMusic ?
                                         formatNumber(Math.floor(song.streams * (0.28 * (0.9 + Math.random() * 0.2)))) :
                                       selectedPlatform === 'itunes' && iTunes ?
                                         formatNumber(Math.floor(song.streams * (0.12 * (0.9 + Math.random() * 0.2)))) :
                                       selectedPlatform === 'soundcloud' && soundCloud ?
                                         formatNumber(Math.floor(song.streams * (0.05 * (0.9 + Math.random() * 0.2)))) :
                                         formatNumber(song.streams)
                                      }
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                          
                          <Button variant="ghost" className="text-[#b3b3b3] hover:text-white mt-2">
                            See more
                          </Button>
                        </div>
                        
                        {/* Albums Section */}
                        <div>
                          <h2 className="text-xl xxs:text-2xl font-bold mb-2 xxs:mb-4">Albums</h2>
                          {!albums || albums.length === 0 ? (
                            <div className="text-center py-8 text-[#b3b3b3] bg-[#181818] rounded-md">
                              You haven't released any albums yet.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 xxs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 xxs:gap-4 sm:gap-5">
                              {albums
                                .filter(album => album.released)
                                .sort((a, b) => (b.releaseDate || 0) - (a.releaseDate || 0))
                                .map((album) => (
                                  <div 
                                    key={album.id} 
                                    className="bg-[#181818] rounded-lg p-2 xxs:p-3 sm:p-4 hover:bg-[#282828] transition-colors cursor-pointer"
                                    onClick={() => {
                                      if (selectedPlatform === 'spotify') {
                                        setSelectedAlbumId(album.id);
                                        setShowAlbumDetail(true);
                                      }
                                    }}
                                  >
                                    <div className="mb-2 xxs:mb-3 sm:mb-4 rounded overflow-hidden shadow-lg aspect-square">
                                      {album.coverArt ? (
                                        <img src={album.coverArt} alt={album.title} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full bg-[#333] flex items-center justify-center">
                                          <MusicIcon size={20} className="text-[#b3b3b3]" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-sm xxs:text-md font-bold line-clamp-1">{album.title}</div>
                                    <div className="text-[10px] xxs:text-xs text-[#b3b3b3] mt-1 xxs:mt-2 line-clamp-2">
                                      {new Date().getFullYear() - Math.floor((album.releaseDate || 0) / 52)} • {album.type || 'Album'} • {album.songIds.length} tracks
                                    </div>
                                    <div className="mt-1 xxs:mt-2 text-[10px] xxs:text-xs text-[#b3b3b3] flex flex-wrap items-center">
                                      <div className="flex items-center mr-2">
                                        <StarIcon size={10} className="text-[#b3b3b3] mr-1" />
                                        <span>{album.criticalRating ? album.criticalRating.toFixed(1) : '-'}/10</span>
                                      </div>
                                      <div className="whitespace-nowrap">
                                        {selectedPlatform === 'spotify' && spotify ? 
                                           formatNumber(Math.floor((album.streams || 0) * (0.55 * (0.9 + Math.random() * 0.2)))) :
                                         selectedPlatform === 'youtubeMusic' && youtubeMusic ?
                                           formatNumber(Math.floor((album.streams || 0) * (0.28 * (0.9 + Math.random() * 0.2)))) :
                                         selectedPlatform === 'itunes' && iTunes ?
                                           formatNumber(Math.floor((album.streams || 0) * (0.12 * (0.9 + Math.random() * 0.2)))) :
                                         selectedPlatform === 'soundcloud' && soundCloud ?
                                           formatNumber(Math.floor((album.streams || 0) * (0.05 * (0.9 + Math.random() * 0.2)))) :
                                           formatNumber(album.streams || 0)
                                        } streams
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                          
                          <Button variant="ghost" className="text-[#b3b3b3] hover:text-white mt-2">
                            See more
                          </Button>
                        </div>
                        
                        {/* Selections Section */}
                        <div>
                          <h2 className="text-xl xxs:text-2xl sm:text-3xl font-bold mb-3 xxs:mb-4 sm:mb-8">Featuring {character?.artistName || "You"}</h2>
                          <div className="grid grid-cols-1 xxs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 xxs:gap-4 sm:gap-6 lg:gap-8">
                            {songs
                              .filter(s => s.released && s.featuring && s.featuring.length > 0)
                              .slice(0, 5)
                              .map((song) => (
                                <div key={song.id} className="bg-[#181818] rounded-lg p-2 xxs:p-3 sm:p-4 hover:bg-[#282828] transition-colors cursor-default">
                                  <div className="mb-2 xxs:mb-3 sm:mb-4 rounded overflow-hidden shadow-lg aspect-square">
                                    {song.coverArt ? (
                                      <img src={song.coverArt} alt={song.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full bg-[#333] flex items-center justify-center">
                                        <MusicIcon size={20} className="text-[#b3b3b3]" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-xs xxs:text-sm sm:text-md font-bold line-clamp-1">{song.title}</div>
                                  <div className="text-[10px] xxs:text-xs text-[#b3b3b3] mt-1 xxs:mt-2 line-clamp-2">
                                    {selectedPlatform === 'spotify' && spotify ? 
                                       formatNumber(Math.floor(song.streams * (0.55 * (0.9 + Math.random() * 0.2)))) :
                                     selectedPlatform === 'youtubeMusic' && youtubeMusic ?
                                       formatNumber(Math.floor(song.streams * (0.28 * (0.9 + Math.random() * 0.2)))) :
                                     selectedPlatform === 'itunes' && iTunes ?
                                       formatNumber(Math.floor(song.streams * (0.12 * (0.9 + Math.random() * 0.2)))) :
                                     selectedPlatform === 'soundcloud' && soundCloud ?
                                       formatNumber(Math.floor(song.streams * (0.05 * (0.9 + Math.random() * 0.2)))) :
                                       formatNumber(song.streams)
                                    } streams • Feat. {song.featuring.length} artist{song.featuring.length > 1 ? 's' : ''}
                                  </div>
                                </div>
                              ))}
                              
                            {songs.filter(s => s.released && s.featuring && s.featuring.length > 0).length === 0 && (
                              <div className="col-span-1 xxs:col-span-2 sm:col-span-3 lg:col-span-5 text-center py-6 sm:py-10 text-[#b3b3b3] bg-[#181818] rounded-md text-xs xxs:text-sm">
                                No collaborations yet. Create songs with featured artists to see them here.
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Stats Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 xxs:gap-4 sm:gap-5">
                          <div className="bg-[#181818] rounded-md p-3 xxs:p-4 sm:p-5">
                            <h4 className="text-[10px] xxs:text-xs sm:text-sm font-normal text-[#b3b3b3] mb-1 xxs:mb-2">MONTHLY LISTENERS</h4>
                            <p className="text-xl xxs:text-2xl sm:text-3xl font-bold text-white">{formatNumber(spotify.listeners)}</p>
                          </div>
                          <div className="bg-[#181818] rounded-md p-3 xxs:p-4 sm:p-5">
                            <h4 className="text-[10px] xxs:text-xs sm:text-sm font-normal text-[#b3b3b3] mb-1 xxs:mb-2">TOTAL STREAMS</h4>
                            <p className="text-xl xxs:text-2xl sm:text-3xl font-bold text-white">{formatNumber(spotify.totalStreams)}</p>
                          </div>
                          <div className="bg-[#181818] rounded-md p-3 xxs:p-4 sm:p-5 sm:col-span-2 md:col-span-1">
                            <h4 className="text-[10px] xxs:text-xs sm:text-sm font-normal text-[#b3b3b3] mb-1 xxs:mb-2">TOTAL REVENUE</h4>
                            <p className="text-xl xxs:text-2xl sm:text-3xl font-bold text-[#1DB954]">{formatMoney(spotify.revenue)}</p>
                          </div>
                        </div>
                        
                        {/* About section */}
                        <div>
                          <h2 className="text-xl xxs:text-2xl sm:text-3xl font-bold mb-3 xxs:mb-4 sm:mb-6">About</h2>
                          <div className="rounded-md overflow-hidden">
                            {/* About section with darker background to match Spotify's look */}
                            <div className="bg-black p-4 xxs:p-5 sm:p-8">
                              <div className="flex flex-col sm:flex-row gap-4 xxs:gap-5 sm:gap-8">
                                {/* Artist Image with click to change - Now circular */}
                                {character?.image && (
                                  <div 
                                    className="w-24 h-24 xxs:w-32 xxs:h-32 sm:w-40 sm:h-40 relative overflow-hidden flex-shrink-0 rounded-full cursor-pointer group shadow-xl mx-auto sm:mx-0"
                                    onClick={() => setShowProfileEditor(true)}
                                  >
                                    <img 
                                      src={character.image} 
                                      alt={character.artistName} 
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                      </svg>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Artist Stats */}
                                <div className="flex-1 text-center sm:text-left mt-3 sm:mt-0">
                                  <div className="flex flex-col text-white">
                                    <p className="text-xl xxs:text-2xl sm:text-3xl font-bold mb-1 xxs:mb-2">{formatNumber(spotify.listeners)}</p>
                                    <p className="text-xs xxs:text-sm text-[#b3b3b3] mb-2 xxs:mb-3 sm:mb-4">Monthly Listeners</p>
                                    <div className="mt-2 xxs:mt-3 sm:mt-4 grid grid-cols-2 gap-3 xxs:gap-4 sm:gap-6">
                                      <div>
                                        <h4 className="text-xs xxs:text-sm font-bold mb-1 xxs:mb-2 text-[#b3b3b3] uppercase">Music Style</h4>
                                        <p className="text-sm xxs:text-md text-white">{character?.musicStyle || "Rap"}</p>
                                      </div>
                                      <div>
                                        <h4 className="text-xs xxs:text-sm font-bold mb-1 xxs:mb-2 text-[#b3b3b3] uppercase">Career Level</h4>
                                        <p className="text-sm xxs:text-md text-white">{stats.careerLevel}/10</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* SoundCloud Platform */}
        <TabsContent value="soundcloud" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* SoundCloud Card */}
            {soundCloud && (
              <Card className="bg-white border-[#f2f2f2] overflow-hidden">
                <div className="flex flex-col h-full">
                  {/* SoundCloud Header */}
                  <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center">
                      <SoundCloudIcon size={24} className="text-[#FF5500]" />
                      <span className="ml-2 font-bold text-black">SoundCloud</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Button 
                        variant="ghost" 
                        className="h-8 text-gray-600 hover:text-black rounded-md hover:bg-gray-100 text-xs"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Upload
                      </Button>
                      {character?.image && (
                        <img 
                          src={character.image} 
                          alt={character.artistName} 
                          className="h-8 w-8 rounded-full cursor-pointer object-cover"
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Main Content */}
                  <CardContent className="p-0 flex-1 bg-[#f2f2f2] text-black overflow-y-auto">
                    {/* Artist Header */}
                    <div className="relative h-64 w-full bg-gradient-to-r from-[#FF7400] to-[#FF5500]">
                      <div className="absolute bottom-0 left-0 p-5 w-full">
                        <div className="flex items-end gap-4">
                          <div 
                            className="relative cursor-pointer group"
                            onClick={() => setShowProfileEditor(true)}
                          >
                            {character?.image ? (
                              <img 
                                src={character.image} 
                                alt={character.artistName} 
                                className="h-36 w-36 border-4 border-white shadow-lg object-cover"
                              />
                            ) : (
                              <div className="h-36 w-36 bg-gray-800 flex items-center justify-center text-white border-4 border-white shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                  <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                              </div>
                            )}
                            {/* Add change image overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <div className="text-white text-xs font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-1">
                                  <path d="M12 20h9"></path>
                                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                </svg>
                                Change Image
                              </div>
                            </div>
                          </div>
                          <div className="text-white mb-1">
                            <div className="text-sm text-white/70">Artist</div>
                            <h2 className="text-2xl font-bold">{character?.artistName || "RAPPERNAME"}</h2>
                            <div className="text-sm mt-1">{formatNumber(soundCloud.listeners)} followers</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Navigation */}
                    <div className="bg-white py-3 px-5 border-b border-gray-200">
                      <div className="flex space-x-6">
                        <div className="font-bold text-[#FF5500] border-b-2 border-[#FF5500] pb-1">Tracks</div>
                        <div className="text-gray-500 pb-1">Albums</div>
                        <div className="text-gray-500 pb-1">Stats</div>
                        <div className="text-gray-500 pb-1">Reposts</div>
                      </div>
                    </div>
                    
                    {/* Stats Overview */}
                    <div className="p-5 mb-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="bg-white p-5 rounded shadow">
                          <h3 className="text-gray-500 text-sm mb-2">FOLLOWERS</h3>
                          <p className="text-3xl font-bold">{formatNumber(soundCloud.listeners)}</p>
                          <div className="text-green-500 text-xs mt-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1">
                              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                              <polyline points="16 7 22 7 22 13"></polyline>
                            </svg>
                            <span>+{formatNumber(Math.floor(soundCloud.listeners * 0.05))} this month</span>
                          </div>
                        </div>
                        <div className="bg-white p-5 rounded shadow">
                          <h3 className="text-gray-500 text-sm mb-2">TOTAL PLAYS</h3>
                          <p className="text-3xl font-bold">{formatNumber(soundCloud.totalStreams)}</p>
                          <div className="text-green-500 text-xs mt-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1">
                              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                              <polyline points="16 7 22 7 22 13"></polyline>
                            </svg>
                            <span>+{formatNumber(Math.floor(soundCloud.totalStreams * 0.1))} this week</span>
                          </div>
                        </div>
                        <div className="bg-white p-5 rounded shadow">
                          <h3 className="text-gray-500 text-sm mb-2">REVENUE (PRO)</h3>
                          <p className="text-3xl font-bold text-[#FF5500]">{formatMoney(soundCloud.revenue)}</p>
                          <div className="text-xs mt-2 flex items-center justify-between">
                            <span className="text-green-500 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1">
                                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                                <polyline points="16 7 22 7 22 13"></polyline>
                              </svg>
                              <span>+{formatMoney(Math.floor(soundCloud.revenue * 0.08))}</span>
                            </span>
                            <Button variant="ghost" className="h-6 py-0 px-2 text-xs bg-[#FF5500] text-white hover:bg-[#ff6a00]">
                              Monetize
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Tracks Section */}
                    <div className="px-5 pb-5">
                      <h3 className="text-xl font-bold mb-4">Your Tracks</h3>
                      {songs.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 bg-white rounded shadow">
                          You haven't released any songs yet.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {songs
                            .filter(s => s.released)
                            .sort((a, b) => b.streams - a.streams)
                            .slice(0, 7)
                            .map((song, index) => (
                              <div key={song.id} className="flex items-center bg-white p-4 rounded shadow hover:shadow-md transition-all">
                                <div className="w-8 text-center text-gray-400 mr-3">{index + 1}</div>
                                <div className="h-10 w-10 mr-4 overflow-hidden bg-gray-100 flex-shrink-0">
                                  {song.coverArt ? (
                                    <img 
                                      src={song.coverArt} 
                                      alt={song.title} 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                      <MusicIcon size={14} className="text-gray-500" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center">
                                    <div className="font-medium text-sm truncate mr-2">{song.title}</div>
                                    {song.featuring && song.featuring.length > 0 && (
                                      <Badge variant="outline" className="text-[10px] h-4 px-1 border-gray-300 text-gray-500">
                                        ft. {song.featuring.length}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 flex items-center mt-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1">
                                      <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                                      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"></path>
                                      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                                    </svg>
                                    {/* Calculate plays for SoundCloud specifically */}
                                    {formatNumber(Math.floor(song.streams * 0.05))}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3 ml-2">
                                  <button className="text-[#FF5500] hover:text-[#ff6a00]">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                                    </svg>
                                  </button>
                                  {/* Calculate song duration predictably based on song id */}
                                  <div className="text-xs text-gray-500">
                                    {1 + (parseInt(song.id.substring(0, 2), 16) % 4)}:{(parseInt(song.id.substring(2, 4), 16) % 60).toString().padStart(2, '0')}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                      <Button variant="outline" className="mt-4 border-gray-300 text-gray-600 hover:text-black hover:bg-gray-100">
                        See all tracks
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* iTunes Platform */}
        <TabsContent value="itunes" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* iTunes Card */}
            {iTunes && (
              <Card className="bg-white text-black border-gray-200 overflow-hidden">
                <div className="flex flex-col h-full">
                  {/* iTunes Header */}
                  <div className="flex items-center justify-between bg-[#f5f5f7] border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center">
                      <ITunesIcon size={24} className="text-[#FB5BC5]" />
                      <span className="ml-2 font-bold text-black">Apple Music for Artists</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button 
                        variant="ghost" 
                        className="h-8 rounded-full bg-transparent hover:bg-gray-100 text-xs"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Manage
                      </Button>
                      {character?.image && (
                        <img 
                          src={character.image} 
                          alt={character.artistName} 
                          className="h-8 w-8 rounded-full cursor-pointer object-cover"
                        />
                      )}
                    </div>
                  </div>
                  
                  <CardContent className="p-0 flex-1 bg-white overflow-y-auto">
                    {/* Dashboard Header */}
                    <div className="p-6 bg-gradient-to-r from-[#FB5BC5] to-[#FA233B] text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-3xl font-bold mb-1">{character?.artistName || "Artist Name"}</h2>
                          <p className="text-sm opacity-90">{formatNumber(iTunes.listeners)} monthly listeners</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button className="bg-white text-[#FA233B] hover:bg-gray-100 h-8 text-xs px-3 rounded-full">
                            Promote
                          </Button>
                          <Button className="bg-white/20 hover:bg-white/30 text-white h-8 text-xs px-3 rounded-full">
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Navigation */}
                    <div className="border-b border-gray-200 px-6">
                      <div className="flex space-x-8 -mb-px">
                        <div className="py-4 text-[#FA233B] border-b-2 border-[#FA233B] font-medium">Overview</div>
                        <div className="py-4 text-gray-500">Songs</div>
                        <div className="py-4 text-gray-500">Playlists</div>
                        <div className="py-4 text-gray-500">Trends</div>
                        <div className="py-4 text-gray-500">Spatial Audio</div>
                      </div>
                    </div>
                    
                    {/* Main Content */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gray-50 p-5 rounded-xl shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-gray-500 text-sm">MONTHLY LISTENERS</h3>
                            <span className="text-xs text-green-500 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-6.293 6.293a1 1 0 01-1.414-1.414l7-7a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                              </svg>
                              12%
                            </span>
                          </div>
                          <p className="text-3xl font-bold text-gray-800">{formatNumber(iTunes.listeners)}</p>
                          <div className="h-1 w-full bg-gray-200 rounded-full mt-3 overflow-hidden">
                            <div className="h-1 bg-green-500 rounded-full" style={{ width: '70%' }}></div>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-5 rounded-xl shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-gray-500 text-sm">PLAYS</h3>
                            <span className="text-xs text-green-500 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-6.293 6.293a1 1 0 01-1.414-1.414l7-7a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                              </svg>
                              8%
                            </span>
                          </div>
                          <p className="text-3xl font-bold text-gray-800">{formatNumber(iTunes.totalStreams)}</p>
                          <div className="h-1 w-full bg-gray-200 rounded-full mt-3 overflow-hidden">
                            <div className="h-1 bg-green-500 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-5 rounded-xl shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-gray-500 text-sm">REVENUE</h3>
                            <span className="text-xs text-green-500 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-6.293 6.293a1 1 0 01-1.414-1.414l7-7a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                              </svg>
                              15%
                            </span>
                          </div>
                          <p className="text-3xl font-bold text-[#FA233B]">{formatMoney(iTunes.revenue)}</p>
                          <div className="h-1 w-full bg-gray-200 rounded-full mt-3 overflow-hidden">
                            <div className="h-1 bg-green-500 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Top Songs */}
                      <div>
                        <h3 className="text-xl font-bold mb-4">Top Songs</h3>
                        <div className="bg-gray-50 rounded-xl shadow-sm overflow-hidden">
                          <div className="p-4 border-b border-gray-200 bg-gray-100 text-xs text-gray-500 grid grid-cols-12 gap-2">
                            <div className="col-span-1">#</div>
                            <div className="col-span-5">SONG</div>
                            <div className="col-span-2">PLAYS</div>
                            <div className="col-span-2">SHAZAMS</div>
                            <div className="col-span-2">REVENUE</div>
                          </div>
                          
                          {songs.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                              You haven't released any songs yet.
                            </div>
                          ) : (
                            <div>
                              {songs
                                .filter(s => s.released)
                                .sort((a, b) => b.streams - a.streams)
                                .slice(0, 5)
                                .map((song, index) => (
                                  <div key={song.id} className="p-4 hover:bg-gray-100 transition-colors grid grid-cols-12 gap-2 items-center border-b border-gray-200">
                                    <div className="col-span-1 text-gray-400">{index + 1}</div>
                                    <div className="col-span-5 flex items-center">
                                      <div className="h-10 w-10 mr-3 overflow-hidden rounded-md">
                                        {song.coverArt ? (
                                          <img src={song.coverArt} alt={song.title} className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                            <MusicIcon size={14} className="text-gray-500" />
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <div className="font-medium">{song.title}</div>
                                        <div className="text-xs text-gray-500">
                                          {song.featuring.length > 0 ? `Feat. ${song.featuring.length} artist${song.featuring.length > 1 ? 's' : ''}` : 'Single'}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-span-2 text-sm">
                                      {formatNumber(Math.floor(song.streams * (0.12 * (0.9 + Math.random() * 0.2))))}
                                    </div>
                                    <div className="col-span-2 text-sm">
                                      {formatNumber(Math.floor(song.streams * 0.12 * 0.15 * (0.9 + Math.random() * 0.2)))}
                                    </div>
                                    <div className="col-span-2 text-sm">
                                      {formatMoney(Math.floor(song.streams * 0.12 * 0.005 * (0.9 + Math.random() * 0.2)))}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* YouTube Music Platform */}
        <TabsContent value="youtubeMusic" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* YouTube Music Card */}
            {youtubeMusic && (
              <Card className="bg-[#030303] border-[#242424] overflow-hidden">
                <div className="flex flex-col h-full">
                  {/* YouTube Music Header */}
                  <div className="flex items-center justify-between bg-[#0F0F0F] px-4 py-3 border-b border-[#2c2c2c]">
                    <div className="flex items-center">
                      <div className="rounded-full bg-[#FF0000] p-0.5 mr-2">
                        <YouTubeIcon size={20} className="text-white" />
                      </div>
                      <span className="font-bold text-white">YouTube Music for Artists</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button 
                        variant="ghost" 
                        className="h-8 text-gray-400 hover:text-white hover:bg-[#272727] rounded-full text-xs"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        Analytics
                      </Button>
                      {character?.image && (
                        <img 
                          src={character.image} 
                          alt={character.artistName} 
                          className="h-8 w-8 rounded-full cursor-pointer object-cover"
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Content Area */}
                  <CardContent className="p-0 flex-1 bg-[#0F0F0F] text-white overflow-y-auto">
                    {/* Artist Header */}
                    <div className="p-6 bg-gradient-to-r from-[#3a3a3a] to-[#0F0F0F]">
                      <div className="flex items-center">
                        {character?.image ? (
                          <img 
                            src={character.image}
                            alt={character.artistName}
                            className="h-24 w-24 rounded-full mr-6 border-2 border-white shadow-lg object-cover"
                          />
                        ) : (
                          <div className="h-24 w-24 rounded-full mr-6 border-2 border-white shadow-lg bg-gray-800 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                          </div>
                        )}
                        <div>
                          <h2 className="text-2xl font-bold mb-1">{character?.artistName || "Artist Name"}</h2>
                          <div className="flex items-center">
                            <div className="text-gray-400 mr-4">
                              <span className="font-medium text-white">{formatNumber(youtubeMusic.listeners)}</span> monthly listeners
                            </div>
                            <div className="text-gray-400">
                              <span className="font-medium text-white">{formatNumber(youtubeMusic.totalStreams)}</span> total streams
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Navigation */}
                    <div className="bg-[#0F0F0F] border-b border-[#2c2c2c] px-6">
                      <div className="flex space-x-6">
                        <div className="py-4 text-white border-b-2 border-[#FF0000] font-medium">Overview</div>
                        <div className="py-4 text-gray-400">Music</div>
                        <div className="py-4 text-gray-400">Analytics</div>
                        <div className="py-4 text-gray-400">Audience</div>
                      </div>
                    </div>
                    
                    {/* Dashboard Content */}
                    <div className="p-6">
                      <div className="mb-8">
                        <h3 className="text-lg font-bold mb-4">Audience Insights</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div className="bg-[#1F1F1F] p-5 rounded-lg">
                            <div className="flex items-center justify-between">
                              <h4 className="text-gray-400 text-sm">MONTHLY LISTENERS</h4>
                              <Badge className="bg-green-700 text-white text-[10px]">+8%</Badge>
                            </div>
                            <p className="text-3xl font-bold mt-2">{formatNumber(youtubeMusic.listeners)}</p>
                            <div className="mt-4 h-10 flex items-end space-x-1">
                              {[30, 45, 25, 50, 70, 85, 90].map((h, i) => (
                                <div 
                                  key={i} 
                                  className="h-full flex-1 bg-[#FF0000]/20 hover:bg-[#FF0000]/30 cursor-pointer transition-colors"
                                  style={{ height: `${h}%` }}
                                ></div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="bg-[#1F1F1F] p-5 rounded-lg">
                            <div className="flex items-center justify-between">
                              <h4 className="text-gray-400 text-sm">TOTAL STREAMS</h4>
                              <Badge className="bg-green-700 text-white text-[10px]">+12%</Badge>
                            </div>
                            <p className="text-3xl font-bold mt-2">{formatNumber(youtubeMusic.totalStreams)}</p>
                            <div className="mt-4 h-10 flex items-end space-x-1">
                              {[40, 60, 75, 90, 65, 80, 95].map((h, i) => (
                                <div 
                                  key={i} 
                                  className="h-full flex-1 bg-[#FF0000]/20 hover:bg-[#FF0000]/30 cursor-pointer transition-colors"
                                  style={{ height: `${h}%` }}
                                ></div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="bg-[#1F1F1F] p-5 rounded-lg">
                            <div className="flex items-center justify-between">
                              <h4 className="text-gray-400 text-sm">TOTAL REVENUE</h4>
                              <Badge className="bg-green-700 text-white text-[10px]">+18%</Badge>
                            </div>
                            <p className="text-3xl font-bold mt-2 text-[#FF0000]">{formatMoney(youtubeMusic.revenue)}</p>
                            <div className="mt-4 h-10 flex items-end space-x-1">
                              {[20, 35, 55, 75, 95, 85, 90].map((h, i) => (
                                <div 
                                  key={i} 
                                  className="h-full flex-1 bg-[#FF0000]/20 hover:bg-[#FF0000]/30 cursor-pointer transition-colors"
                                  style={{ height: `${h}%` }}
                                ></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Top Songs */}
                      <div>
                        <h3 className="text-lg font-bold mb-4">Top Songs</h3>
                        
                        {songs.length === 0 ? (
                          <div className="text-center py-10 text-gray-500 bg-[#1F1F1F] rounded-lg">
                            You haven't released any songs yet.
                          </div>
                        ) : (
                          <div className="bg-[#1F1F1F] rounded-lg overflow-hidden">
                            <div className="p-4 border-b border-[#2c2c2c] text-xs text-gray-400 grid grid-cols-12 gap-2">
                              <div className="col-span-1">#</div>
                              <div className="col-span-6">SONG</div>
                              <div className="col-span-3">STREAMS</div>
                              <div className="col-span-2">REVENUE</div>
                            </div>
                            <div>
                              {songs
                                .filter(s => s.released)
                                .sort((a, b) => b.streams - a.streams)
                                .slice(0, 5)
                                .map((song, index) => (
                                  <div key={song.id} className="hover:bg-[#272727] transition-colors px-4 py-3 grid grid-cols-12 gap-2 items-center border-b border-[#2c2c2c]">
                                    <div className="col-span-1 text-gray-400">{index + 1}</div>
                                    <div className="col-span-6 flex items-center">
                                      <div className="h-10 w-10 mr-3 overflow-hidden rounded-md">
                                        {song.coverArt ? (
                                          <img src={song.coverArt} alt={song.title} className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                                            <MusicIcon size={14} className="text-gray-300" />
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <div className="font-medium truncate">{song.title}</div>
                                        <div className="text-xs text-gray-400">
                                          {character?.artistName || "Artist"} 
                                          {song.featuring.length > 0 && ` • feat. ${song.featuring.length} artist${song.featuring.length > 1 ? 's' : ''}`}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-span-3 flex items-center">
                                      <div className="h-1 w-20 bg-gray-700 mr-3 rounded overflow-hidden">
                                        <div 
                                          className="h-1 bg-[#FF0000]" 
                                          style={{ width: `${Math.min(100, (song.streams / 1000000) * 100)}%` }}
                                        ></div>
                                      </div>
                                      <div className="text-sm">{formatNumber(Math.floor(song.streams * (0.28 * (0.9 + Math.random() * 0.2))))}</div>
                                    </div>
                                    <div className="col-span-2 text-sm">
                                      {formatMoney(Math.floor(song.streams * 0.28 * 0.004 * (0.9 + Math.random() * 0.2)))}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                        
                        <Button className="mt-4 bg-[#272727] hover:bg-[#3a3a3a] text-white rounded-full text-xs">
                          See all tracks
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* YouTube Platform */}
        <TabsContent value="youtube" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* YouTube Card */}
            {youtube && (
              <Card className="bg-[#0F0F0F] border-[#242424] overflow-hidden">
                <div className="flex flex-col h-full">
                  {/* YouTube Studio Header */}
                  <div className="flex items-center justify-between bg-[#0F0F0F] px-5 py-3 border-b border-[#2c2c2c]">
                    <div className="flex items-center">
                      <div className="flex items-center mr-6">
                        <div className="bg-[#FF0000] rounded-lg p-1 mr-2">
                          <YouTubeIcon size={18} className="text-white" />
                        </div>
                        <span className="font-bold text-white text-lg">Studio</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-[#1F1F1F] rounded-full px-3 py-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        <span className="text-xs text-gray-400">Search</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                        </svg>
                      </button>
                      <button className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                      </button>
                      {character?.image ? (
                        <img 
                          src={character.image}
                          alt={character.artistName}
                          className="h-8 w-8 rounded-full cursor-pointer object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full cursor-pointer bg-blue-500 flex items-center justify-center text-white font-bold">
                          {(character?.artistName || "A").charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Studio Content */}
                  <CardContent className="p-0 flex-1 bg-[#0F0F0F] text-white overflow-y-auto">
                    {/* Studio Sidebar & Content */}
                    <div className="flex h-full">
                      {/* Sidebar */}
                      <div className="w-48 bg-[#0F0F0F] border-r border-[#2c2c2c] py-4 px-3">
                        <div className="flex flex-col space-y-1">
                          <button className="flex items-center space-x-3 text-sm py-2 px-3 text-white bg-[#272727] rounded-lg hover:bg-[#333]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                            <span>Dashboard</span>
                          </button>
                          <button className="flex items-center space-x-3 text-sm py-2 px-3 text-gray-400 rounded-lg hover:bg-[#333]">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5l16.5-4.125M12 6.75c-2.708 0-5.363.224-7.948.655C2.999 7.58 2.25 8.507 2.25 9.574v9.176A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169A48.329 48.329 0 0012 6.75zm-1.683 6.443l-.005.005-.006-.005.006-.005.005.005zm-.005 2.127l-.005-.006.005-.005.005.005-.005.005zm-2.116-.006l-.005.006-.006-.006.005-.005.006.005zm-.005-2.116l-.006-.005.006-.005.005.005-.005.005zM9.255 10.5v.008h-.008V10.5h.008zm3.249 1.88l-.007.004-.003-.007.006-.003.004.006zm-1.38 5.126l-.003-.006.006-.004.004.007-.006.003zm.007-6.501l-.003.006-.007-.003.004-.007.006.004zm1.37 5.129l-.007-.004.004-.006.006.003-.004.007zm.504-1.877h-.008v-.007h.008v.007zM9.255 18v.008h-.008V18h.008zm-3.246-1.87l-.007.004L6 16.127l.006-.003.004.006zm1.366-5.119l-.004-.006.006-.004.004.007-.006.003zM7.38 17.5l-.003.006-.007-.003.004-.007.006.004zm-1.376-5.116L6 12.38l.003-.007.007.004-.004.007zm-.5 1.873h-.008v-.007h.008v.007zM17.25 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zm0 4.5a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                            </svg>
                            <span>Content</span>
                          </button>
                          <button className="flex items-center space-x-3 text-sm py-2 px-3 text-gray-400 rounded-lg hover:bg-[#333]">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                            </svg>
                            <span>Analytics</span>
                          </button>
                          <button className="flex items-center space-x-3 text-sm py-2 px-3 text-gray-400 rounded-lg hover:bg-[#333]">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Monetization</span>
                          </button>
                          <button className="flex items-center space-x-3 text-sm py-2 px-3 text-gray-400 rounded-lg hover:bg-[#333]">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                            <span>Audience</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Main Content */}
                      <div className="flex-1 p-6">
                        <div className="mb-6">
                          <h1 className="text-xl font-bold mb-1">Channel Dashboard</h1>
                          <div className="text-sm text-gray-400">
                            {character?.artistName || "Artist"} • Last 28 days
                          </div>
                        </div>
                        
                        {/* Channel Analytics */}
                        <div className="bg-[#1F1F1F] rounded-lg p-5 mb-6">
                          <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-medium">Channel analytics</h2>
                            <Button className="text-[#3ea6ff] bg-transparent hover:bg-[#263850] text-xs h-8 rounded">Advanced mode</Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                            <div className="border-b border-[#2c2c2c] pb-5">
                              <h3 className="text-gray-400 text-sm mb-1">Current subscribers</h3>
                              <div className="flex items-baseline">
                                <p className="text-2xl font-bold">{formatNumber(youtube.subscribers)}</p>
                                <span className="ml-2 text-green-500 text-xs">+{formatNumber(Math.floor(youtube.subscribers * 0.08))}</span>
                              </div>
                            </div>
                            <div className="border-b border-[#2c2c2c] pb-5">
                              <h3 className="text-gray-400 text-sm mb-1">Views - Last 28 days</h3>
                              <div className="flex items-baseline">
                                <p className="text-2xl font-bold">{formatNumber(youtube.views || 0)}</p>
                                <span className="ml-2 text-green-500 text-xs">+{formatNumber(Math.floor((youtube.views || 0) * 0.12))}</span>
                              </div>
                            </div>
                            <div className="border-b border-[#2c2c2c] pb-5">
                              <h3 className="text-gray-400 text-sm mb-1">Estimated Revenue</h3>
                              <div className="flex items-baseline">
                                <p className="text-2xl font-bold text-white">{formatMoney(youtube.revenue || 0)}</p>
                                <span className="ml-2 text-green-500 text-xs">+{formatMoney(Math.floor((youtube.revenue || 0) * 0.15))}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Chart Placeholder */}
                          <div className="h-40 w-full">
                            <div className="h-full flex items-end space-x-1">
                              {[25, 35, 30, 40, 35, 45, 50, 55, 45, 60, 65, 55, 70, 75, 65, 80, 85, 75, 90, 82].map((h, i) => (
                                <div 
                                  key={i} 
                                  className="h-full flex-1 bg-[#FF0000]/20 hover:bg-[#FF0000]/40 cursor-pointer transition-colors rounded-sm"
                                  style={{ height: `${h}%` }}
                                ></div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Recent Videos */}
                        <div className="bg-[#1F1F1F] rounded-lg p-5">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium">Recent videos</h2>
                            <Button className="text-[#3ea6ff] bg-transparent hover:bg-[#263850] text-xs h-8 rounded">SEE ALL</Button>
                          </div>
                          
                          {(musicVideos || []).length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                              <div className="mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                </svg>
                              </div>
                              <p>You haven't uploaded any videos yet.</p>
                              <Button className="mt-4 bg-[#3ea6ff] text-[#0F0F0F] hover:bg-[#4db5ff] text-xs h-8 rounded">CREATE</Button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {(musicVideos || [])
                                .sort((a, b) => (b.releaseDate || 0) - (a.releaseDate || 0))
                                .slice(0, 3)
                                .map((video) => (
                                  <div key={video.id} className="flex hover:bg-[#272727] transition-colors p-2 rounded-lg">
                                    <div className="h-20 w-36 bg-gray-800 mr-3 rounded overflow-hidden relative flex-shrink-0">
                                      {video.thumbnail ? (
                                        <img src={video.thumbnail} alt={`Video ${video.id}`} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-500">
                                            <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                                          </svg>
                                        </div>
                                      )}
                                      <div className="absolute bottom-1 right-1 bg-black/80 text-xs px-1 rounded">
                                        {Math.floor(Math.random() * 3) + 2}:{(Math.floor(Math.random() * 59) + 10).toString().padStart(2, '0')}
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-medium text-sm line-clamp-2">
                                        {songs.find(s => s.id === video.songId)?.title || `Music Video ${video.id.substring(0, 6)}`}
                                      </h3>
                                      <div className="text-xs text-gray-400 mt-1">
                                        {formatNumber(video.views || Math.floor(Math.random() * 500000) + 50000)} views • {Math.floor(Math.random() * 4) + 1} weeks ago
                                      </div>
                                      <div className="flex items-center mt-2">
                                        <Badge className="bg-[#272727] hover:bg-[#333] text-white text-[10px] cursor-pointer">Edit</Badge>
                                        <Badge className="bg-transparent hover:bg-[#272727] text-gray-300 text-[10px] ml-1 cursor-pointer">Analytics</Badge>
                                        <Badge className="bg-transparent hover:bg-[#272727] text-gray-300 text-[10px] ml-1 cursor-pointer">Comments</Badge>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* VEVO Platform */}
        <TabsContent value="vevo" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* VEVO Card */}
            {vevo && (
              <Card className="bg-white border-gray-200 overflow-hidden">
                <div className="flex flex-col h-full">
                  {/* VEVO Header */}
                  <div className="flex items-center justify-between bg-black px-4 py-3">
                    <div className="flex items-center">
                      <span className="font-bold text-white text-2xl tracking-tight">
                        <span className="text-[#FF0000]">VEVO</span> ARTIST PORTAL
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button 
                        variant="ghost" 
                        className="h-8 text-white hover:bg-white/10 rounded text-xs"
                      >
                        Help
                      </Button>
                      {character?.image && (
                        <img 
                          src={character.image} 
                          alt={character.artistName} 
                          className="h-8 w-8 rounded-full cursor-pointer object-cover"
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Main Content */}
                  <CardContent className="p-0 flex-1 bg-[#f5f5f5] text-black overflow-y-auto">
                    {/* Artist Banner */}
                    <div className="relative bg-black h-40 w-full overflow-hidden">
                      {/* Channel Art - gradient as placeholder */}
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-800 to-red-600 opacity-70"></div>
                      <div className="absolute bottom-4 left-4 flex items-center">
                        {character?.image ? (
                          <img 
                            src={character.image} 
                            alt={character.artistName} 
                            className="h-16 w-16 border-2 border-white rounded-full mr-3 object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gray-800 flex items-center justify-center text-white rounded-full border-2 border-white mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                          </div>
                        )}
                        <div>
                          <div className="text-xs text-white/80 uppercase tracking-wider">Official Artist Channel</div>
                          <h2 className="text-2xl font-bold text-white">{character?.artistName || "Artist Name"}</h2>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-[#FF0000] text-white">CERTIFIED</Badge>
                      </div>
                    </div>
                    
                    {/* Navigation */}
                    <div className="bg-white border-b border-gray-200 px-6">
                      <div className="flex space-x-6">
                        <div className="py-4 text-[#FF0000] border-b-2 border-[#FF0000] font-medium">Dashboard</div>
                        <div className="py-4 text-gray-700">Videos</div>
                        <div className="py-4 text-gray-700">Analytics</div>
                        <div className="py-4 text-gray-700">Monetization</div>
                        <div className="py-4 text-gray-700">Settings</div>
                      </div>
                    </div>
                    
                    {/* Dashboard Content */}
                    <div className="p-6">
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold">Channel Overview</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Last 28 days</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div className="bg-white p-5 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-gray-500 text-sm font-medium">SUBSCRIBERS</h4>
                              <Badge className="bg-green-100 text-green-800 text-[10px]">+12.5%</Badge>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{formatNumber(vevo.subscribers)}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-1 bg-red-500 rounded-full" style={{ width: '78%' }}></div>
                              </div>
                              <span className="text-xs text-gray-500">78%</span>
                            </div>
                          </div>
                          
                          <div className="bg-white p-5 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-gray-500 text-sm font-medium">TOTAL VIEWS</h4>
                              <Badge className="bg-green-100 text-green-800 text-[10px]">+18.7%</Badge>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{formatNumber(vevo.views || 0)}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-1 bg-red-500 rounded-full" style={{ width: '92%' }}></div>
                              </div>
                              <span className="text-xs text-gray-500">92%</span>
                            </div>
                          </div>
                          
                          <div className="bg-white p-5 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-gray-500 text-sm font-medium">REVENUE</h4>
                              <Badge className="bg-green-100 text-green-800 text-[10px]">+22.4%</Badge>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{formatMoney(vevo.revenue || 0)}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-1 bg-red-500 rounded-full" style={{ width: '85%' }}></div>
                              </div>
                              <span className="text-xs text-gray-500">85%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Top Music Videos */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold">Top Music Videos</h3>
                          <Button variant="outline" className="text-xs h-8 border-gray-300">
                            Upload New Video
                          </Button>
                        </div>
                        
                        {(musicVideos || []).length === 0 ? (
                          <div className="bg-white rounded-lg shadow p-8 text-center">
                            <div className="mb-4">
                              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FF0000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                </svg>
                              </div>
                            </div>
                            <h4 className="text-lg font-medium mb-2">No Music Videos Yet</h4>
                            <p className="text-gray-500 mb-4">Get started by creating your first official music video</p>
                            <Button className="bg-[#FF0000] hover:bg-red-600 text-white">Create Music Video</Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {(musicVideos || [])
                              .sort((a, b) => (b.views || 0) - (a.views || 0))
                              .slice(0, 3)
                              .map((video, index) => (
                                <div key={video.id} className="bg-white rounded-lg shadow p-4 flex items-center">
                                  <div className="mr-3 text-lg font-bold text-gray-400 w-5">{index + 1}</div>
                                  <div className="h-20 w-36 bg-gray-200 mr-4 rounded-md overflow-hidden relative flex-shrink-0">
                                    {video.thumbnail ? (
                                      <img src={video.thumbnail} alt={songs.find(s => s.id === video.songId)?.title || 'Music Video'} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      </div>
                                    )}
                                    <div className="absolute bottom-1 right-1 bg-black/80 text-xs px-1 rounded text-white">
                                      {Math.floor(Math.random() * 3) + 2}:{(Math.floor(Math.random() * 59) + 10).toString().padStart(2, '0')}
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium mb-1 line-clamp-1">{(songs.find(s => s.id === video.songId)?.title || "Untitled") + (video.style ? ` - Official ${video.style.charAt(0).toUpperCase() + video.style.slice(1)} Video` : "")}</h4>
                                    <div className="flex items-center text-xs text-gray-500 mb-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                      {formatNumber(video.views || 0)} views
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <div className="flex items-center text-xs text-gray-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                        </svg>
                                        {formatNumber(Math.floor((video.views || 0) * 0.92))}
                                      </div>
                                      <div className="flex items-center text-xs text-gray-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                        {formatNumber(Math.floor((video.views || 0) * 0.024))}
                                      </div>
                                      <div className="flex items-center text-xs text-gray-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                        {formatNumber(Math.floor((video.views || 0) * 0.018))}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-xs text-gray-500 mb-1">Revenue</div>
                                    <div className="text-sm font-bold">{formatMoney(Math.floor((video.views || 0) * 0.0012))}</div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button className="bg-[#FF0000] hover:bg-red-600 text-white text-sm h-10">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Create New Video
                        </Button>
                        <Button variant="outline" className="border-gray-300 text-gray-700 text-sm h-10">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          View Analytics
                        </Button>
                        <Button variant="outline" className="border-gray-300 text-gray-700 text-sm h-10">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Get Support
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Artist Profiles */}
        <TabsContent value="artists" className="space-y-6">
          <div className="h-[700px]">
            <AIRapperProfiles />
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Profile Editor Dialog */}
      <Dialog open={showProfileEditor} onOpenChange={setShowProfileEditor}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile Picture</DialogTitle>
            <DialogDescription>
              Upload a new profile picture for your artist
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <div className="w-32 h-32 relative overflow-hidden rounded-full border-2 border-white">
                {character?.image ? (
                  <img 
                    src={character.image} 
                    alt={character.artistName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                )}
              </div>
            </div>
            
            <ImageUploader
              onImageSelected={(imageData) => {
                if (character) {
                  updateCharacter({ ...character, image: imageData });
                }
                setShowProfileEditor(false);
              }}
              currentImage={character?.image}
              imageType="profile"
              aspectRatio="square"
              buttonText="Select a Profile Picture"
              dialogTitle="Choose Profile Picture"
              className="w-full"
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Cover Editor Dialog */}
      <Dialog open={showCoverEditor} onOpenChange={setShowCoverEditor}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Cover Image</DialogTitle>
            <DialogDescription>
              Upload a new cover image for your artist profile
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="h-32 w-full relative overflow-hidden rounded-md border border-gray-300">
              {character?.coverImage ? (
                <img 
                  src={character.coverImage} 
                  alt="Cover" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <circle cx="9" cy="9" r="2"></circle>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                  </svg>
                </div>
              )}
            </div>
            
            <ImageUploader
              onImageSelected={(imageData) => {
                if (character) {
                  updateCharacter({ ...character, coverImage: imageData });
                }
                setShowCoverEditor(false);
              }}
              currentImage={character?.coverImage}
              imageType="cover"
              aspectRatio="wide"
              buttonText="Select a Cover Image"
              dialogTitle="Choose Cover Image"
              className="w-full"
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* About Background Editor Dialog */}
      <Dialog open={showAboutBackgroundEditor} onOpenChange={setShowAboutBackgroundEditor}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit About Background</DialogTitle>
            <DialogDescription>
              Upload a new background image for your about section
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="h-32 w-full relative overflow-hidden rounded-md border border-gray-300">
              {character?.aboutBackgroundImage ? (
                <img 
                  src={character.aboutBackgroundImage} 
                  alt="About Background" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <circle cx="9" cy="9" r="2"></circle>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                  </svg>
                </div>
              )}
            </div>
            
            <ImageUploader
              onImageSelected={(imageData) => {
                if (character) {
                  updateCharacter({ ...character, aboutBackgroundImage: imageData });
                }
                setShowAboutBackgroundEditor(false);
              }}
              currentImage={character?.aboutBackgroundImage}
              imageType="cover"
              aspectRatio="wide"
              buttonText="Select a Background Image"
              dialogTitle="Choose Background Image"
              className="w-full"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Album Detail Dialog */}
      <Dialog open={showAlbumDetail} onOpenChange={setShowAlbumDetail}>
        <DialogContent className="sm:max-w-3xl bg-[#121212] text-white border-[#282828]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Album Details</DialogTitle>
          </DialogHeader>
          {selectedAlbumId && albums && (
            <AlbumDetail 
              albumId={selectedAlbumId} 
              onBack={() => setShowAlbumDetail(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}