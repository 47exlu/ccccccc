import React, { useState } from 'react';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Song, SongIcon, SongPerformanceType } from '@/lib/types';
import { MusicIcon, StarIcon } from '@/assets/icons';
import { Image } from 'lucide-react';
import { ImageUploader } from '@/components/ui/image-uploader';

export function UnreleasedSongs() {
  const { songs, streamingPlatforms, stats, releaseSong } = useRapperGame();
  
  // Filter unreleased songs
  const unreleasedSongs = songs.filter(song => !song.released);
  
  // Song release modal state
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [releasePlatforms, setReleasePlatforms] = useState<string[]>([]);
  const [songTitle, setSongTitle] = useState("");
  const [songIcon, setSongIcon] = useState<SongIcon>("default");
  const [coverArt, setCoverArt] = useState<string | undefined>(undefined);
  
  const handleOpenReleaseModal = (song: Song) => {
    setSelectedSong(song);
    setSongTitle(song.title);
    setSongIcon(song.icon);
    setCoverArt(song.coverArt);
    setReleasePlatforms([]);
    setIsReleaseModalOpen(true);
  };

  const handleCloseReleaseModal = () => {
    setIsReleaseModalOpen(false);
    setSelectedSong(null);
    setReleasePlatforms([]);
    setSongTitle("");
    setSongIcon("default");
    setCoverArt(undefined);
  };

  const handleTogglePlatform = (platformName: string) => {
    setReleasePlatforms(prev => {
      if (prev.includes(platformName)) {
        return prev.filter(p => p !== platformName);
      } else {
        return [...prev, platformName];
      }
    });
  };

  const handleReleaseSong = () => {
    if (!selectedSong || releasePlatforms.length === 0) return;
    
    // Save the cover art if provided
    if (coverArt && selectedSong) {
      useRapperGame.getState().updateSongCoverArt(selectedSong.id, coverArt);
    }
    
    // Call the releaseSong function from the store
    releaseSong(selectedSong.id, songTitle, songIcon, releasePlatforms);
    
    handleCloseReleaseModal();
  };

  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 1: return "Basic";
      case 2: return "Good";
      case 3: return "Premium";
      case 4: return "Platinum";
      case 5: return "Diamond";
      default: return "Unknown";
    }
  };

  const getSongIconOptions = () => {
    return [
      { value: "default", label: "Default" },
      { value: "fire", label: "Fire" },
      { value: "star", label: "Star" },
      { value: "diamond", label: "Diamond" },
      { value: "crown", label: "Crown" },
      { value: "microphone", label: "Microphone" }
    ];
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-orange-900 to-black text-white p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <MusicIcon size={32} className="mr-3 text-orange-400" />
          <div>
            <h1 className="text-2xl font-bold">Unreleased Songs</h1>
            <p className="text-sm text-gray-400">Prepare and release your tracks</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="bg-transparent border-gray-600 hover:bg-gray-800"
            onClick={() => useRapperGame.getState().setScreen('career_dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      {unreleasedSongs.length === 0 ? (
        <div className="text-center p-12 border border-orange-800 rounded-lg bg-black/30">
          <p className="text-xl text-gray-300">You don't have any unreleased songs yet.</p>
          <p className="mt-2 text-gray-400">Go to Music Production to create new tracks!</p>
          <Button 
            className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            onClick={() => useRapperGame.getState().setScreen('music_production')}
          >
            Go to Studio
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unreleasedSongs.map(song => (
            <Card key={song.id} className="bg-orange-950/50 border-orange-800 hover:bg-orange-950/70 transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold truncate">{song.title}</h3>
                  <div className="bg-orange-800/60 text-orange-200 px-2 py-1 rounded text-sm">
                    {getTierLabel(song.tier)}
                  </div>
                </div>
                
                {song.coverArt ? (
                  <div className="mb-3 w-full h-36 rounded overflow-hidden">
                    <img 
                      src={song.coverArt}
                      alt="Cover Art"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="mb-3 w-full h-36 flex items-center justify-center bg-orange-900/30 rounded">
                    <Image size={36} className="text-orange-700/50" />
                  </div>
                )}
                
                <div className="flex items-center gap-2 mb-2">
                  <StarIcon size={18} className="text-amber-500" />
                  <span className="text-sm text-gray-300">Quality: Tier {song.tier}</span>
                </div>
                
                {song.featuring.length > 0 && (
                  <p className="text-sm text-gray-400 mb-2">
                    Featuring: {song.featuring.join(', ')}
                  </p>
                )}
                
                <div className="mt-4">
                  <Button 
                    onClick={() => handleOpenReleaseModal(song)}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  >
                    Prepare Release
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Release Song Modal */}
      <Dialog open={isReleaseModalOpen} onOpenChange={setIsReleaseModalOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-to-b from-orange-950 to-black border border-orange-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-orange-300">Prepare Song Release</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="song-title">Song Title</Label>
              <Input 
                id="song-title" 
                value={songTitle} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSongTitle(e.target.value)} 
                placeholder="Enter song title"
                className="bg-orange-900/40 border-orange-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="song-icon">Song Icon</Label>
              <Select value={songIcon} onValueChange={(value: string) => setSongIcon(value as SongIcon)}>
                <SelectTrigger id="song-icon" className="bg-orange-900/40 border-orange-700">
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent className="bg-orange-950 border-orange-800 text-white">
                  {getSongIconOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cover-art">Cover Art</Label>
              <div className="flex flex-col items-center">
                {coverArt && (
                  <div className="mb-2 w-40 h-40 rounded overflow-hidden">
                    <img 
                      src={coverArt} 
                      alt="Cover Art" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <ImageUploader
                  buttonText="Upload Cover Art"
                  dialogTitle="Upload Song Cover Art"
                  currentImage={coverArt}
                  onImageSelected={(imageData) => setCoverArt(imageData)}
                  imageType="cover"
                  aspectRatio="square"
                  className="w-full bg-orange-900/40 border-orange-700 hover:bg-orange-800/60"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Release Platforms</Label>
              <div className="grid grid-cols-2 gap-2">
                {streamingPlatforms.map(platform => (
                  <Button
                    key={platform.name}
                    type="button"
                    variant={releasePlatforms.includes(platform.name) ? "default" : "outline"}
                    onClick={() => handleTogglePlatform(platform.name)}
                    className={releasePlatforms.includes(platform.name) 
                      ? "justify-start bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 border-none"
                      : "justify-start bg-transparent border-gray-600 hover:bg-orange-950"}
                  >
                    {platform.name}
                  </Button>
                ))}
              </div>
              {releasePlatforms.length === 0 && (
                <p className="text-sm text-gray-400">Select at least one platform</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCloseReleaseModal}
              className="bg-transparent border-gray-600 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReleaseSong} 
              disabled={!songTitle || releasePlatforms.length === 0}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              Release Song
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}