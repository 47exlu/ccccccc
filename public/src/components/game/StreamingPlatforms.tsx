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
import { AIRapperProfiles } from './AIRapperProfiles';
import { VIDEO_COSTS } from '@/lib/gameData';
// Define MusicStyle type since it's missing in types.ts
type MusicStyle = string;
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from '@/components/ui/image-uploader';

export function StreamingPlatforms() {
  const { streamingPlatforms, videosPlatforms, songs, stats, character, setScreen, updateCharacter } = useRapperGame();
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showCoverEditor, setShowCoverEditor] = useState(false);
  const [showAboutBackgroundEditor, setShowAboutBackgroundEditor] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('audio');
  
  // Get platform data
  const spotify = streamingPlatforms.find(p => p.name === 'Spotify');
  const soundCloud = streamingPlatforms.find(p => p.name === 'SoundCloud');
  const iTunes = streamingPlatforms.find(p => p.name === 'iTunes');
  const youtubeMusic = streamingPlatforms.find(p => p.name === 'YouTube Music');
  
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
      
      <Tabs 
        value={selectedPlatform} 
        onValueChange={setSelectedPlatform}
        className="space-y-6"
      >
        <TabsList className="bg-green-950 border border-green-800 w-full flex">
          <TabsTrigger value="audio" className="data-[state=active]:bg-green-800 flex-1 text-sm">
            Audio Streaming
          </TabsTrigger>
          <TabsTrigger value="video" className="data-[state=active]:bg-green-800 flex-1 text-sm">
            Video Platforms
          </TabsTrigger>
          <TabsTrigger value="artists" className="data-[state=active]:bg-green-800 relative flex-1 text-sm">
            <span>Artist Profiles</span>
            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] rounded-full px-1 py-0.5">New</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Audio Streaming Platforms */}
        <TabsContent value="audio" className="space-y-6">
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
                                  <div key={song.id} className="flex items-center px-5 py-3 hover:bg-[#282828] rounded-md group">
                                    <div className="w-6 text-center text-[#b3b3b3] mr-4 font-normal">{index + 1}</div>
                                    <div className="h-14 w-14 mr-4 overflow-hidden">
                                      {song.coverArt ? (
                                        <img src={song.coverArt} alt={song.title} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full bg-[#333] flex items-center justify-center">
                                          <MusicIcon size={16} className="text-[#b3b3b3]" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium text-md">{song.title}</div>
                                      <div className="text-xs text-[#b3b3b3]">
                                        {song.featuring.length > 0 ? `Feat. ${song.featuring.length} artist${song.featuring.length > 1 ? 's' : ''}` : 'Single'}
                                      </div>
                                    </div>
                                    <div className="text-right text-sm text-[#b3b3b3]">
                                      {formatNumber(song.streams)}
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
                          <h2 className="text-3xl font-bold mb-8">Featuring {character?.artistName || "You"}</h2>
                          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
                            {songs
                              .filter(s => s.released && s.featuring && s.featuring.length > 0)
                              .slice(0, 5)
                              .map((song) => (
                                <div key={song.id} className="bg-[#181818] rounded-lg p-4 hover:bg-[#282828] transition-colors cursor-default">
                                  <div className="mb-4 rounded overflow-hidden shadow-lg aspect-square">
                                    {song.coverArt ? (
                                      <img src={song.coverArt} alt={song.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full bg-[#333] flex items-center justify-center">
                                        <MusicIcon size={30} className="text-[#b3b3b3]" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-md font-bold line-clamp-1">{song.title}</div>
                                  <div className="text-xs text-[#b3b3b3] mt-2 line-clamp-2">
                                    {formatNumber(song.streams)} streams • Feat. {song.featuring.length} artist{song.featuring.length > 1 ? 's' : ''}
                                  </div>
                                </div>
                              ))}
                              
                            {songs.filter(s => s.released && s.featuring && s.featuring.length > 0).length === 0 && (
                              <div className="col-span-5 text-center py-10 text-[#b3b3b3] bg-[#181818] rounded-md">
                                No collaborations yet. Create songs with featured artists to see them here.
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Stats Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
                          <div className="bg-[#181818] rounded-md p-5 sm:p-6">
                            <h4 className="text-xs sm:text-sm font-normal text-[#b3b3b3] mb-2">MONTHLY LISTENERS</h4>
                            <p className="text-2xl sm:text-3xl font-bold text-white">{formatNumber(spotify.listeners)}</p>
                          </div>
                          <div className="bg-[#181818] rounded-md p-5 sm:p-6">
                            <h4 className="text-xs sm:text-sm font-normal text-[#b3b3b3] mb-2">TOTAL STREAMS</h4>
                            <p className="text-2xl sm:text-3xl font-bold text-white">{formatNumber(spotify.totalStreams)}</p>
                          </div>
                          <div className="bg-[#181818] rounded-md p-5 sm:p-6 sm:col-span-2 md:col-span-1">
                            <h4 className="text-xs sm:text-sm font-normal text-[#b3b3b3] mb-2">TOTAL REVENUE</h4>
                            <p className="text-2xl sm:text-3xl font-bold text-[#1DB954]">{formatMoney(spotify.revenue)}</p>
                          </div>
                        </div>
                        
                        {/* About section */}
                        <div>
                          <h2 className="text-3xl font-bold mb-6">About</h2>
                          <div className="rounded-md overflow-hidden">
                            {/* About section with darker background to match Spotify's look */}
                            <div className="bg-black p-8">
                              <div className="flex flex-col sm:flex-row gap-8">
                                {/* Artist Image with click to change - Now circular */}
                                {character?.image && (
                                  <div 
                                    className="w-40 h-40 relative overflow-hidden flex-shrink-0 rounded-full cursor-pointer group shadow-xl"
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
                                <div className="flex-1">
                                  <div className="flex flex-col text-white">
                                    <p className="text-2xl sm:text-3xl font-bold mb-2">{formatNumber(spotify.listeners)}</p>
                                    <p className="text-sm text-[#b3b3b3] mb-4">Monthly Listeners</p>
                                    <div className="mt-4 grid grid-cols-2 gap-6">
                                      <div>
                                        <h4 className="text-sm font-bold mb-2 text-[#b3b3b3] uppercase">Music Style</h4>
                                        <p className="text-md text-white">{character?.musicStyle || "Rap"}</p>
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-bold mb-2 text-[#b3b3b3] uppercase">Career Level</h4>
                                        <p className="text-md text-white">{stats.careerLevel}/10</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Add the character's bio here with customizable background */}
                            <div 
                              className="p-0 relative group cursor-pointer overflow-hidden" 
                              style={{
                                backgroundImage: character?.aboutBackgroundImage 
                                  ? `linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.9) 100%), url(${character.aboutBackgroundImage})`
                                  : 'none',
                                backgroundColor: 'black',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                              }}
                            >
                              {/* Bio content with padding inside */}
                              <div 
                                className="p-6 relative z-10 min-h-[120px]"
                                onClick={() => setShowProfileEditor(true)}
                              >
                                {character?.about ? (
                                  <p className="text-sm text-[#b3b3b3] leading-relaxed">{character.about}</p>
                                ) : (
                                  <p className="text-sm text-[#b3b3b3] leading-relaxed">
                                    {character?.artistName || "You"} {character?.musicStyle ? `makes ${character.musicStyle} music` : "creates unique music that fans love"}.
                                  </p>
                                )}
                              </div>
                              
                              {/* Edit bio overlay - appears on hover */}
                              <div 
                                className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setShowProfileEditor(true)}
                              >
                                <div className="absolute left-2 top-2 bg-black/70 px-2 py-1 rounded-md flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                  </svg>
                                  <span className="text-xs text-white">Edit Bio</span>
                                </div>
                                
                                {/* Edit background button */}
                                <div 
                                  className="absolute right-2 top-2 bg-black/70 px-2 py-1 rounded-md flex items-center gap-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAboutBackgroundEditor(true);
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                    <circle cx="9" cy="9" r="2" />
                                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                  </svg>
                                  <span className="text-xs text-white">Change Background</span>
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
            
            {/* SoundCloud Card */}
            {soundCloud && (
              <Card className="bg-white text-black border-[#f2f2f2] overflow-hidden">
                <div className="flex items-center bg-gradient-to-r from-[#ff5500] to-[#ff8800] px-4 py-1">
                  <SoundCloudIcon size={20} className="text-white" />
                  <span className="ml-2 font-bold text-white">SoundCloud for Artists</span>
                </div>
                <CardContent className="pt-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Profile section */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-6">
                        {character?.image && (
                          <div className="bg-[#f50] w-16 h-16 rounded-full flex items-center justify-center overflow-hidden">
                            <img src={character.image} alt={character.artistName} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold">{songs.length > 0 ? "Your Music" : "No tracks yet"}</h3>
                          <p className="text-[#999] text-sm">Artist • {formatNumber(soundCloud.listeners)} followers</p>
                          <div className="flex mt-2">
                            <Badge className="bg-[#f50] hover:bg-[#f70] text-xs font-normal rounded-full">
                              PRO UNLIMITED
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Stats cards */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="border border-[#f2f2f2] rounded-md p-3">
                          <div className="text-xs text-[#999] uppercase mb-1">Plays (last 30 days)</div>
                          <div className="text-2xl font-bold">{formatNumber(soundCloud.totalStreams)}</div>
                        </div>
                        <div className="border border-[#f2f2f2] rounded-md p-3">
                          <div className="text-xs text-[#999] uppercase mb-1">Followers</div>
                          <div className="text-2xl font-bold">{formatNumber(soundCloud.listeners)}</div>
                        </div>
                      </div>
                      
                      <div className="border border-[#f2f2f2] rounded-md p-3 mb-4">
                        <div className="text-xs text-[#999] uppercase mb-1">Revenue</div>
                        <div className="text-2xl font-bold text-[#f50]">{formatMoney(soundCloud.revenue)}</div>
                        <ProgressBar
                          value={Math.min(100, (soundCloud.revenue / 10000) * 100)}
                          max={100}
                          label="Revenue Target"
                          size="sm"
                          color="warning"
                          className="mt-2"
                        />
                        <p className="text-[#999] text-xs mt-1">
                          {Math.min(100, (soundCloud.revenue / 10000) * 100).toFixed(1)}% of the way to $10,000
                        </p>
                      </div>
                      
                      <div className="bg-[#f8f8f8] rounded-md p-3">
                        <h4 className="font-bold mb-1">Creator tip</h4>
                        <p className="text-[#666] text-sm">
                          Release music consistently to maintain your audience - inactive tracks lose listeners over time.
                        </p>
                      </div>
                    </div>
                    
                    {/* Tracks section */}
                    <div className="flex-1">
                      <div className="mb-4">
                        <h4 className="font-bold text-[#333] mb-2">Your tracks</h4>
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="Filter tracks..."
                            className="w-full border border-[#e5e5e5] rounded-md py-2 px-3 text-sm"
                          />
                        </div>
                      </div>
                      
                      <ScrollArea className="h-[320px] pr-4">
                        {songs.length === 0 ? (
                          <div className="text-center py-4 text-[#999]">
                            You haven't released any songs yet.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {songs
                              .filter(s => s.released)
                              .sort((a, b) => b.streams - a.streams)
                              .map((song) => (
                                <div key={song.id} className="flex border-b border-[#f2f2f2] p-2 hover:bg-[#f8f8f8]">
                                  <div className="w-10 h-10 bg-[#f2f2f2] flex-shrink-0 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                                    {song.coverArt ? (
                                      <img src={song.coverArt} alt={song.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-6 h-6 bg-[#ff5500] rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">▶</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-bold">{song.title}</div>
                                    <div className="flex items-center text-xs text-[#999]">
                                      <span>{formatNumber(song.streams)} plays</span>
                                      <span className="mx-1">•</span>
                                      <span>{song.isActive ? "Active" : "Inactive"}</span>
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0 text-[#999]">
                                    <div className="text-xs">
                                      {song.releaseDate ? new Date(Date.now() - (song.releaseDate * 7 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) : 'Unknown date'}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* iTunes/Apple Music Card */}
            {iTunes && (
              <Card className="bg-[#f5f5f7] text-black border border-[#d2d2d7] overflow-hidden">
                <div className="flex items-center bg-gradient-to-r from-[#fb5bc5] via-[#fa233b] to-[#fa233b] px-4 py-1">
                  <ITunesIcon size={20} className="text-white" />
                  <span className="ml-2 font-bold text-white">Apple Music for Artists</span>
                </div>
                <CardContent className="pt-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left side - Artist stats */}
                    <div className="flex-1">
                      <div className="mb-6">
                        <div className="flex items-center gap-4">
                          {character?.image && (
                            <div className="w-16 h-16 bg-gradient-to-r from-[#fb5bc5] to-[#fa233b] rounded-full flex items-center justify-center overflow-hidden">
                              <img src={character.image} alt={character.artistName} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-xl font-bold">Artist Performance</h3>
                            <p className="text-[#86868b] text-sm">View your stats on Apple Music</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="bg-white border border-[#d2d2d7] rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold text-[#1d1d1f]">Listeners</h4>
                          <Badge className="font-normal bg-[#fa233b]/90">Last 30 days</Badge>
                        </div>
                        
                        <div className="text-3xl font-bold text-[#1d1d1f] mb-1">
                          {formatNumber(iTunes.listeners)}
                        </div>
                        <p className="text-xs text-[#86868b] mb-3">Monthly listeners</p>
                        
                        <ProgressBar
                          value={Math.min(100, (iTunes.listeners / 1000000) * 100)}
                          max={100}
                          label="Listeners"
                          size="sm"
                          color="danger"
                          className="mb-1"
                        />
                        <p className="text-[#86868b] text-xs">
                          {Math.min(100, (iTunes.listeners / 1000000) * 100).toFixed(1)}% of benchmark
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white border border-[#d2d2d7] rounded-lg p-4">
                          <h4 className="font-semibold text-[#1d1d1f] mb-2">Plays</h4>
                          <div className="text-2xl font-bold text-[#1d1d1f]">
                            {formatNumber(iTunes.totalStreams)}
                          </div>
                          <p className="text-xs text-[#86868b]">Total streams</p>
                        </div>
                        
                        <div className="bg-white border border-[#d2d2d7] rounded-lg p-4">
                          <h4 className="font-semibold text-[#1d1d1f] mb-2">Revenue</h4>
                          <div className="text-2xl font-bold text-[#fa233b]">
                            {formatMoney(iTunes.revenue)}
                          </div>
                          <p className="text-xs text-[#86868b]">Total earnings</p>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-[#fb5bc5]/10 to-[#fa233b]/10 rounded-lg p-4 border border-[#fa233b]/20">
                        <h4 className="font-semibold text-[#1d1d1f] mb-1">Featured insight</h4>
                        <p className="text-sm text-[#424245]">
                          Inactive songs experience listener decay over time. Regular releases help maintain your audience.
                        </p>
                      </div>
                    </div>
                    
                    {/* Right side - Songs */}
                    <div className="flex-1">
                      <div className="bg-white border border-[#d2d2d7] rounded-lg overflow-hidden">
                        <div className="px-4 py-3 border-b border-[#d2d2d7]">
                          <h4 className="font-semibold text-[#1d1d1f]">Top Songs</h4>
                        </div>
                        
                        <ScrollArea className="h-[350px]">
                          {songs.length === 0 ? (
                            <div className="text-center py-4 text-[#86868b]">
                              You haven't released any songs yet.
                            </div>
                          ) : (
                            <div className="divide-y divide-[#d2d2d7]">
                              {songs
                                .filter(s => s.released)
                                .sort((a, b) => b.streams - a.streams)
                                .map((song, index) => (
                                  <div key={song.id} className="flex items-center p-3">
                                    <div className="w-8 text-center text-[#86868b] mr-2">{index + 1}</div>
                                    <div className="w-10 h-10 bg-gradient-to-r from-[#fb5bc5] to-[#fa233b] rounded-full flex items-center justify-center mr-3 overflow-hidden">
                                      {song.coverArt ? (
                                        <img src={song.coverArt} alt={song.title} className="w-full h-full object-cover" />
                                      ) : (
                                        <span className="text-white text-xs">♪</span>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium text-[#1d1d1f]">{song.title}</div>
                                      <div className="text-xs text-[#86868b]">
                                        {song.isActive ? "Active" : "Inactive"} • {formatNumber(song.streams)} plays
                                      </div>
                                    </div>
                                    <div className="w-5 text-[#86868b]">
                                      <span>〉</span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* YouTube Music Card */}
            {youtubeMusic && (
              <Card className="bg-[#030303] border-[#282828] overflow-hidden">
                <div className="flex items-center bg-[#FF0000] px-4 py-1">
                  <YouTubeIcon size={20} className="text-white" />
                  <span className="ml-2 font-bold text-white">YouTube Music Studio</span>
                </div>
                <CardContent className="pt-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left side - Channel info */}
                    <div className="flex-1">
                      <div className="mb-6">
                        <div className="flex items-center gap-4">
                          {character?.image && (
                            <div className="w-16 h-16 bg-[#282828] rounded-full flex items-center justify-center overflow-hidden">
                              <img src={character.image} alt={character.artistName} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-xl font-bold">{songs.filter(s => s.released).length > 0 ? "Your Channel" : "No Music"}</h3>
                            <div className="flex items-center gap-2 text-[#AAAAAA] text-sm">
                              <span>{formatNumber(youtubeMusic.listeners)} subscribers</span>
                              <span>•</span>
                              <span>{songs.filter(s => s.released).length} tracks</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Analytics cards */}
                      <div className="bg-[#212121] rounded-md p-4 mb-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium text-lg">Analytics</h4>
                          <Badge className="bg-[#383838] text-white font-normal">Last 28 days</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 mb-4">
                          <div>
                            <p className="text-[#AAAAAA] text-xs uppercase mb-1">Subscribers</p>
                            <p className="text-3xl font-bold">{formatNumber(youtubeMusic.listeners)}</p>
                          </div>
                          <div>
                            <p className="text-[#AAAAAA] text-xs uppercase mb-1">Streams</p>
                            <p className="text-3xl font-bold">{formatNumber(youtubeMusic.totalStreams)}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-[#AAAAAA] text-xs uppercase mb-1">Estimated Revenue</p>
                          <p className="text-2xl font-bold text-[#FF0000]">{formatMoney(youtubeMusic.revenue)}</p>
                        </div>
                        
                        <div className="mt-4">
                          <ProgressBar
                            value={Math.min(100, (youtubeMusic.listeners / 1000000) * 100)}
                            max={100}
                            label="Progress to Silver Award"
                            size="sm"
                            color="danger"
                            className="mb-1"
                          />
                          <p className="text-[#AAAAAA] text-xs">
                            {Math.min(100, (youtubeMusic.listeners / 1000000) * 100).toFixed(1)}% of the way to 1M subscribers
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-[#212121] rounded-md p-4">
                        <h4 className="font-medium mb-3">Music Decay Insight</h4>
                        <p className="text-[#AAAAAA] text-sm">
                          YouTube's algorithm favors newer content. Releasing music consistently helps maintain your audience and prevents listener decay.
                        </p>
                      </div>
                    </div>
                    
                    {/* Right side - Songs */}
                    <div className="flex-1">
                      <div className="bg-[#212121] rounded-md overflow-hidden">
                        <div className="px-4 py-3 border-b border-[#383838] flex justify-between items-center">
                          <h4 className="font-medium">Popular Content</h4>
                          <Badge className="bg-[#383838] text-[#AAAAAA] font-normal">Music</Badge>
                        </div>
                        
                        <ScrollArea className="h-[350px]">
                          {songs.length === 0 ? (
                            <div className="text-center py-4 text-[#AAAAAA]">
                              You haven't released any songs yet.
                            </div>
                          ) : (
                            <div className="divide-y divide-[#383838]">
                              {songs
                                .filter(s => s.released)
                                .sort((a, b) => b.streams - a.streams)
                                .map((song, index) => (
                                  <div key={song.id} className="flex items-center p-3 hover:bg-[#383838] transition-colors">
                                    <div className="w-8 text-center text-[#AAAAAA] mr-2">{index + 1}</div>
                                    <div className="w-10 h-10 bg-[#383838] flex items-center justify-center mr-3 rounded-full overflow-hidden">
                                      {song.coverArt ? (
                                        <img src={song.coverArt} alt={song.title} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#FF0000]">
                                          <span className="text-white text-xs">▶</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm truncate">{song.title}</div>
                                      <div className="flex items-center text-[#AAAAAA] text-xs">
                                        <span>{formatNumber(song.streams)} views</span>
                                        <span className="mx-1">•</span>
                                        <span>{song.isActive ? "Active" : "Inactive"}</span>
                                      </div>
                                    </div>
                                    <div className="ml-2">
                                      <div className="text-[#AAAAAA] text-xs">
                                        {song.performanceType === 'viral' ? 
                                          <Badge className="bg-[#FF0000] text-white">Trending</Badge> :
                                          song.performanceType === 'flop' ?
                                          <Badge className="bg-[#383838] text-[#AAAAAA]">Underperforming</Badge> :
                                          null
                                        }
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Songs Performance */}
          <Card className="bg-black/30 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Top Songs Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {songs.length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  You haven't released any songs yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {songs
                    .sort((a, b) => b.streams - a.streams)
                    .slice(0, 5)
                    .map(song => (
                      <div key={song.id} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{song.title}</div>
                          <div className="text-xs text-gray-400">
                            Released: Week {song.releaseDate || '?'}
                            {song.featuring.length > 0 && " • Featuring"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-amber-400">
                            {formatNumber(song.streams)} streams
                          </div>
                          <div className="text-xs text-gray-400">
                            <Badge className={song.isActive ? 'bg-green-700' : 'bg-gray-700'}>
                              {song.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Video Platforms */}
        <TabsContent value="video" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* YouTube Card */}
            {youtube && (
              <Card className="bg-[#0f0f0f] border-[#272727] overflow-hidden">
                <div className="flex items-center bg-[#282828] px-4 py-1 border-b border-[#3f3f3f]">
                  <YouTubeIcon size={20} className="text-[#FF0000]" />
                  <span className="ml-2 font-bold text-white">YouTube Studio</span>
                </div>
                <CardContent className="pt-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left side - Channel info & creation */}
                    <div className="flex-1">
                      <div className="mb-6">
                        <div className="flex items-center gap-4">
                          {character?.image && (
                            <div className="w-16 h-16 bg-[#181818] rounded-full flex items-center justify-center overflow-hidden">
                              <img src={character.image} alt={character.artistName} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-xl font-bold">Your Channel</h3>
                            <div className="flex items-center gap-2 text-[#aaaaaa] text-sm">
                              <span>{formatNumber(youtube.subscribers)} subscribers</span>
                              <span>•</span>
                              <span>{formatNumber(youtube.videos)} videos</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="bg-[#212121] rounded-md p-4 mb-4">
                        <h4 className="font-medium mb-3">Channel Analytics</h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-[#aaaaaa] text-xs uppercase">SUBSCRIBERS</p>
                            <p className="text-2xl font-bold">{formatNumber(youtube.subscribers)}</p>
                          </div>
                          <div>
                            <p className="text-[#aaaaaa] text-xs uppercase">VIEWS</p>
                            <p className="text-2xl font-bold">{formatNumber(youtube.totalViews)}</p>
                          </div>
                        </div>
                        
                        <div className="bg-[#181818] rounded p-3">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-[#aaaaaa]">Progress to Silver Play Button</span>
                            <span className="text-xs text-[#aaaaaa]">{Math.min(100, (youtube.subscribers / 100000) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-[#3f3f3f] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#FF0000]" 
                              style={{width: `${Math.min(100, (youtube.subscribers / 100000) * 100)}%`}}
                            ></div>
                          </div>
                          <p className="text-[#aaaaaa] text-xs mt-1">
                            {formatNumber(100000 - youtube.subscribers)} more subscribers needed
                          </p>
                        </div>
                      </div>
                      
                      {/* Content creation */}
                      <div className="bg-[#212121] rounded-md p-4">
                        <h4 className="font-medium mb-3">Create Music Video</h4>
                        <p className="text-[#aaaaaa] text-sm mb-4">
                          Videos can significantly boost your streams and accelerate your career growth.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#181818] p-3 rounded-md">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-[#3f3f3f] rounded-md flex items-center justify-center">
                                <span className="text-[#aaaaaa]">📹</span>
                              </div>
                              <span className="font-medium">Basic Video</span>
                            </div>
                            <ul className="text-xs text-[#aaaaaa] space-y-1 mb-3">
                              <li>• Standard quality</li>
                              <li>• 1-2x stream boost</li>
                              <li>• Low viral chance</li>
                            </ul>
                            <Button
                              disabled={stats.wealth < VIDEO_COSTS.YouTube.basic}
                              className="w-full bg-[#3f3f3f] hover:bg-[#525252] text-sm py-1 h-auto"
                            >
                              ${formatNumber(VIDEO_COSTS.YouTube.basic)}
                            </Button>
                          </div>
                          
                          <div className="bg-[#181818] p-3 rounded-md border border-[#FF0000]/20">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-[#FF0000] rounded-md flex items-center justify-center">
                                <span className="text-white">🎬</span>
                              </div>
                              <span className="font-medium">Premium Video</span>
                            </div>
                            <ul className="text-xs text-[#aaaaaa] space-y-1 mb-3">
                              <li>• High quality</li>
                              <li>• 2-5x stream boost</li>
                              <li>• Higher viral chance</li>
                            </ul>
                            <Button
                              disabled={stats.wealth < VIDEO_COSTS.YouTube.premium}
                              className="w-full bg-gradient-to-r from-[#c00] to-[#FF0000] hover:from-[#b00] hover:to-[#e00] text-sm py-1 h-auto"
                            >
                              ${formatNumber(VIDEO_COSTS.YouTube.premium)}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right side - Content display */}
                    <div className="flex-1">
                      <div className="bg-[#212121] rounded-md overflow-hidden">
                        <div className="px-4 py-3 border-b border-[#3f3f3f] flex justify-between items-center">
                          <h4 className="font-medium">Your Videos</h4>
                          <Badge className="bg-[#3f3f3f] text-[#aaaaaa] font-normal">Newest first</Badge>
                        </div>
                        
                        <ScrollArea className="h-[400px]">
                          {youtube.videos === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                              <div className="w-12 h-12 bg-[#181818] rounded-full flex items-center justify-center mb-3">
                                <YouTubeIcon size={24} className="text-[#aaaaaa]" />
                              </div>
                              <p className="text-[#aaaaaa]">No videos uploaded yet</p>
                              <p className="text-[#777] text-xs mt-1">Create your first video to reach a wider audience</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-[#3f3f3f]">
                              {Array.from({ length: youtube.videos }).map((_, index) => (
                                <div key={index} className="flex p-3 hover:bg-[#272727]">
                                  <div className="w-32 h-20 bg-[#181818] flex-shrink-0 rounded mr-3 flex items-center justify-center overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-br from-[#3f3f3f] to-[#181818] flex items-center justify-center">
                                      <div className="w-8 h-8 bg-[#000000]/50 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">▶</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm mb-1 line-clamp-2">
                                      {index < 5 ? "Official Music Video" : "Live Performance"} - {
                                        songs
                                          .filter(s => s.released)
                                          .sort((a, b) => (b.releaseDate || 0) - (a.releaseDate || 0))
                                          [index % Math.max(1, songs.filter(s => s.released).length)]?.title || "Unknown Track"
                                      }
                                    </p>
                                    <div className="text-xs text-[#aaaaaa] flex items-center gap-3">
                                      <span>{formatNumber(Math.round(youtube.totalViews / Math.max(1, youtube.videos) * (1 + Math.random() * 0.4 - 0.2)))} views</span>
                                      <span>{Math.floor(Math.random() * 10 + 1)} {index % 2 === 0 ? 'days' : 'weeks'} ago</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* VEVO Card */}
            {vevo && (
              <Card className="bg-black border-[#1d1d1d] overflow-hidden">
                <div className="bg-[#fd0e35] flex items-center justify-center px-4 py-1">
                  <VevoIcon size={28} className="text-white" />
                </div>
                <CardContent className="pt-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left side - Artist profile & stats */}
                    <div className="flex-1">
                      <div className="mb-6">
                        <div className="flex items-center gap-4">
                          {character?.image && (
                            <div className="w-16 h-16 bg-[#fd0e35] rounded-full flex items-center justify-center overflow-hidden">
                              <img src={character.image} alt={character.artistName} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-xl font-bold">VEVO Artist</h3>
                            <div className="flex items-center gap-2 text-[#888] text-sm">
                              <span>{formatNumber(vevo.subscribers)} subscribers</span>
                              <span>•</span>
                              <span>{formatNumber(vevo.videos)} videos</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Performance metrics */}
                      <div className="bg-[#0c0c0c] rounded p-4 mb-4 border border-[#1d1d1d]">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold">Performance</h4>
                          <Badge className="bg-[#fd0e35] text-white font-normal rounded-sm px-3">PREMIUM</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-[#888] text-xs mb-1">SUBSCRIBERS</p>
                            <p className="text-3xl font-bold">{formatNumber(vevo.subscribers)}</p>
                          </div>
                          <div>
                            <p className="text-[#888] text-xs mb-1">TOTAL VIEWS</p>
                            <p className="text-3xl font-bold">{formatNumber(vevo.totalViews)}</p>
                          </div>
                        </div>
                        
                        <div className="bg-black rounded p-3 mb-4">
                          <p className="text-sm text-white">Analytics Insight</p>
                          <p className="text-xs text-[#888] mt-1">
                            VEVO videos receive premium placement on music channels and typically generate 
                            {vevo.videos > 5 ? " significant " : " higher "} 
                            revenue compared to standard videos.
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#fd0e35] rounded-full"></div>
                          <p className="text-xs text-[#888]">
                            Premium videos have a {vevo.videos > 3 ? "78%" : "65%"} higher viral potential
                          </p>
                        </div>
                      </div>
                      
                      {/* Video creation section */}
                      <div className="bg-[#0c0c0c] rounded p-4 border border-[#1d1d1d]">
                        <h4 className="font-bold mb-3">Create VEVO Video</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-black p-3 rounded relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#fd0e35]/10 to-transparent pointer-events-none"></div>
                            <div className="relative">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-[#1d1d1d] rounded flex items-center justify-center">
                                  <span className="text-[#fd0e35]">📹</span>
                                </div>
                                <span className="font-medium">Standard Video</span>
                              </div>
                              
                              <ul className="text-xs text-[#888] space-y-1 mb-4">
                                <li>• Professional quality</li>
                                <li>• 1.5-3x stream boost</li>
                                <li>• Moderate viral chance</li>
                                <li>• VEVO certification</li>
                              </ul>
                              
                              <Button
                                disabled={stats.wealth < VIDEO_COSTS.VEVO.basic}
                                className="w-full bg-[#fd0e35]/80 hover:bg-[#fd0e35] text-white font-medium text-sm py-1.5 h-auto"
                              >
                                ${formatNumber(VIDEO_COSTS.VEVO.basic)}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="bg-black p-3 rounded relative overflow-hidden border border-[#fd0e35]/50">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#fd0e35]/20 to-transparent pointer-events-none"></div>
                            <div className="relative">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-[#fd0e35] rounded flex items-center justify-center">
                                  <span className="text-white">💎</span>
                                </div>
                                <span className="font-medium">Premium Video</span>
                              </div>
                              
                              <ul className="text-xs text-[#888] space-y-1 mb-4">
                                <li>• Cinematic quality</li>
                                <li>• 3-8x stream boost</li>
                                <li>• High viral chance</li>
                                <li>• Featured placement</li>
                              </ul>
                              
                              <Button
                                disabled={stats.wealth < VIDEO_COSTS.VEVO.premium}
                                className="w-full bg-gradient-to-r from-[#fd0e35] to-[#ff4060] hover:from-[#fd0e35] hover:to-[#ff5070] text-white font-medium text-sm py-1.5 h-auto"
                              >
                                ${formatNumber(VIDEO_COSTS.VEVO.premium)}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right side - Videos gallery */}
                    <div className="flex-1">
                      <div className="bg-[#0c0c0c] rounded overflow-hidden border border-[#1d1d1d]">
                        <div className="px-4 py-3 border-b border-[#1d1d1d] flex justify-between items-center">
                          <h4 className="font-bold text-[#fd0e35]">VIDEOS</h4>
                          <div className="flex items-center gap-1">
                            <Badge className="bg-black border border-[#1d1d1d] text-[#888] font-normal px-3 py-0.5">
                              Sort: TRENDING
                            </Badge>
                          </div>
                        </div>
                        
                        <ScrollArea className="h-[400px]">
                          {vevo.videos === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                              <div className="w-16 h-16 bg-[#0c0c0c] rounded-full flex items-center justify-center mb-3 border border-[#1d1d1d]">
                                <VevoIcon size={32} className="text-[#888]" />
                              </div>
                              <p className="text-[#ccc] font-medium">No VEVO videos yet</p>
                              <p className="text-[#888] text-xs mt-1">Create official music videos to reach millions of viewers globally</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-[#1d1d1d]">
                              {Array.from({ length: vevo.videos }).map((_, index) => (
                                <div key={index} className="p-4 hover:bg-black transition-colors">
                                  <div className="flex gap-4 mb-3">
                                    <div className="w-32 h-20 bg-[#0c0c0c] flex-shrink-0 rounded flex items-center justify-center overflow-hidden">
                                      <div className="w-full h-full bg-gradient-to-br from-[#333] to-black flex items-center justify-center relative">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <div className="w-8 h-8 bg-[#fd0e35] rounded-full flex items-center justify-center">
                                            <span className="text-white">▶</span>
                                          </div>
                                        </div>
                                        <div className="absolute bottom-1 right-1">
                                          <VevoIcon size={12} className="text-white" />
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <h5 className="font-bold text-sm mb-1">
                                        {songs
                                          .filter(s => s.released)
                                          .sort((a, b) => b.streams - a.streams)
                                          [index % Math.max(1, songs.filter(s => s.released).length)]?.title || "Official Video"
                                        }
                                      </h5>
                                      <p className="text-xs text-[#888]">
                                        {formatNumber(Math.round(vevo.totalViews / Math.max(1, vevo.videos) * (1 + Math.random() * 0.5 - 0.2)))} views
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-4 text-[#888]">
                                      <span className="flex items-center gap-1">
                                        <span>👍</span> {formatNumber(Math.round(vevo.subscribers * (0.1 + Math.random() * 0.3)))}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <span>💬</span> {formatNumber(Math.round(vevo.subscribers * (0.01 + Math.random() * 0.03)))}
                                      </span>
                                    </div>
                                    <div>
                                      {index < 2 && (
                                        <Badge className="bg-[#fd0e35] text-white text-xs px-2 py-0">Trending</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <Card className="bg-black/30 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Video Promotion Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-300 space-y-2">
              <p>
                <span className="font-semibold text-red-400">YouTube</span> - Basic videos cost ${formatNumber(VIDEO_COSTS.YouTube.basic)} 
                and can multiply your streams by 1-2x. Premium videos cost ${formatNumber(VIDEO_COSTS.YouTube.premium)} 
                and can multiply streams by 2-5x.
              </p>
              <p>
                <span className="font-semibold text-pink-400">VEVO</span> - Basic videos cost ${formatNumber(VIDEO_COSTS.VEVO.basic)} 
                and can multiply your streams by 1.5-3x. Premium videos cost ${formatNumber(VIDEO_COSTS.VEVO.premium)} 
                and can multiply streams by 3-8x.
              </p>
              <p className="text-xs text-gray-500 mt-4">
                Videos work best for your newest and highest tier songs. Premium videos have a higher chance of going viral.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Artist Profiles Tab (new) */}
        <TabsContent value="artists" className="space-y-6">
          <div className="h-[700px]">
            <AIRapperProfiles />
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Profile Editor Dialog */}
      <Dialog open={showProfileEditor} onOpenChange={setShowProfileEditor}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Artist Profile</DialogTitle>
            <DialogDescription>
              Update your artist profile information that appears on streaming platforms.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Image uploader */}
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                {character?.image && (
                  <div className="w-40 h-40 rounded-full overflow-hidden relative mb-3 border border-gray-300">
                    <img src={character.image} alt={character.artistName || "Artist profile"} className="w-full h-full object-cover" />
                  </div>
                )}
                
                <ImageUploader
                  onImageSelected={(imageData) => updateCharacter({ image: imageData })}
                  initialImage={character?.image}
                  buttonText="Change profile photo"
                  dialogTitle="Upload Artist Profile Image"
                  className="w-full"
                  showGallery={true}
                />
                
                <p className="text-xs text-gray-500 mt-2 text-center max-w-[200px]">
                  Your profile photo will appear on all streaming platforms
                </p>
              </div>
            </div>
            
            {/* Right column - Profile details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="artistName" className="text-sm font-medium">Artist Name</Label>
                <Input 
                  id="artistName" 
                  defaultValue={character?.artistName || ""} 
                  onChange={(e) => updateCharacter({ artistName: e.target.value })} 
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="musicStyle" className="text-sm font-medium">Music Style</Label>
                <Select 
                  value={character?.musicStyle || "trap"} 
                  onValueChange={(val) => updateCharacter({ musicStyle: val })}
                >
                  <SelectTrigger id="musicStyle" className="w-full mt-1">
                    <SelectValue placeholder="Select music style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trap">Trap</SelectItem>
                    <SelectItem value="boom-bap">Boom Bap</SelectItem>
                    <SelectItem value="melodic">Melodic</SelectItem>
                    <SelectItem value="drill">Drill</SelectItem>
                    <SelectItem value="conscious">Conscious</SelectItem>
                    <SelectItem value="experimental">Experimental</SelectItem>
                    <SelectItem value="mainstream">Mainstream</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="about" className="text-sm font-medium">Artist Bio</Label>
                <Textarea 
                  id="about" 
                  placeholder="Write something about yourself as an artist..."
                  defaultValue={character?.about || ""} 
                  onChange={(e) => updateCharacter({ about: e.target.value })}
                  className="min-h-28 mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This bio will appear on your artist profile pages
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowProfileEditor(false)} className="mr-2">
              Cancel
            </Button>
            <Button type="button" onClick={() => setShowProfileEditor(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Cover Image Editor Dialog */}
      <Dialog open={showCoverEditor} onOpenChange={setShowCoverEditor}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Change Cover Image</DialogTitle>
            <DialogDescription>
              Select a background image for your artist profile header.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="w-full aspect-[3/1] rounded-md bg-gradient-to-b from-gray-700 to-black overflow-hidden relative mb-4 border border-gray-700">
              {character?.coverImage ? (
                <img 
                  src={character.coverImage} 
                  alt="Cover" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No cover image selected</span>
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black to-transparent"></div>
            </div>
            
            <ImageUploader
              onImageSelected={(imageData) => updateCharacter({ coverImage: imageData })}
              initialImage={character?.coverImage}
              buttonText="Change cover image"
              dialogTitle="Upload Cover Image"
              className="w-full"
              showGallery={true}
            />
            
            <p className="text-xs text-gray-500 mt-2">
              This cover image will be displayed as a background on your artist profile.
              Choose an image that represents your brand as an artist.
            </p>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowCoverEditor(false)} className="mr-2">
              Cancel
            </Button>
            <Button type="button" onClick={() => setShowCoverEditor(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* About Background Image Editor Dialog */}
      <Dialog open={showAboutBackgroundEditor} onOpenChange={setShowAboutBackgroundEditor}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Change About Background</DialogTitle>
            <DialogDescription>
              Select a background image for your About section.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="w-full aspect-[4/3] rounded-md bg-gradient-to-b from-gray-900 to-black overflow-hidden relative mb-4 border border-gray-900">
              {character?.aboutBackgroundImage ? (
                <div className="w-full h-full relative">
                  <img 
                    src={character.aboutBackgroundImage} 
                    alt="About Background" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/70"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <p className="text-sm max-w-xs text-center">
                      Background preview with darkening overlay for better text readability
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No background image selected</span>
                </div>
              )}
            </div>
            
            <ImageUploader
              onImageSelected={(imageData) => updateCharacter({ aboutBackgroundImage: imageData })}
              initialImage={character?.aboutBackgroundImage}
              buttonText="Change background image"
              dialogTitle="Upload About Background Image"
              className="w-full"
              showGallery={true}
            />
            
            <p className="text-xs text-gray-500 mt-2">
              This background image will appear behind your artist bio in the About section.
              A dark overlay will be applied to ensure text remains readable.
            </p>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowAboutBackgroundEditor(false)} className="mr-2">
              Cancel
            </Button>
            <Button type="button" onClick={() => setShowAboutBackgroundEditor(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
