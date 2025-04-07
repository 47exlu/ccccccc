import React, { useState, useEffect } from 'react';
import { useRapperGame } from '../../lib/stores/useRapperGame';
import { Album, AlbumType, Song } from '../../lib/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ArrowLeft, Plus, Music, Disc, Star, Calendar, BarChart3, PlusCircle, Edit, ImageIcon, ThumbsUp, Award } from 'lucide-react';

type AlbumFormProps = {
  type: 'standard' | 'deluxe' | 'remix';
  parentAlbumId?: string;
  onSuccess: () => void;
  onCancel: () => void;
};

const AlbumForm: React.FC<AlbumFormProps> = ({ type, parentAlbumId, onSuccess, onCancel }) => {
  const [title, setTitle] = useState('');
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const [remixArtists, setRemixArtists] = useState<string[]>([]);
  const [coverArt, setCoverArt] = useState('/assets/covers/default_album.jpg');
  const [showCoverSelector, setShowCoverSelector] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const { 
    songs, aiRappers, 
    createAlbum, createDeluxeAlbum, createRemixAlbum, 
    updateAlbumCover 
  } = useRapperGame();

  // Filter available songs for album creation
  const availableSongs = songs.filter(song => {
    // For standard albums, we want completed but unreleased songs
    if (type === 'standard') {
      return !song.released; // Just check if the song is not already released - removed "completed" condition
    } else {
      // For deluxe/remix, any song can be added as exclusive content
      return true;
    }
  });
  
  // Cover art options - we'll show a gallery of predefined images
  const coverArtOptions = [
    '/assets/covers/album_cover_1.jpg',
    '/assets/covers/album_cover_2.jpg',
    '/assets/covers/album_cover_3.jpg',
    '/assets/covers/album_cover_4.jpg',
    '/assets/covers/album_cover_5.jpg',
  ];
  
  // Handle image upload from gallery
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Read the file as data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      setUploadedImage(imageUrl);
      setCoverArt(imageUrl);
      setShowCoverSelector(false);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = () => {
    if (!title || selectedSongs.length === 0) {
      alert('Please provide a title and select at least one song for your album.');
      return;
    }
    
    let albumId = '';
    
    if (type === 'standard') {
      albumId = createAlbum(title, 'standard', coverArt, selectedSongs);
    } else if (type === 'deluxe' && parentAlbumId) {
      albumId = createDeluxeAlbum(parentAlbumId, title, coverArt, selectedSongs);
    } else if (type === 'remix' && parentAlbumId) {
      albumId = createRemixAlbum(parentAlbumId, title, coverArt, remixArtists);
    }
    
    if (albumId) {
      alert(`Your ${type} album "${title}" has been created!`);
      onSuccess();
    }
  };
  
  const handleSelectCoverArt = (artUrl: string) => {
    setCoverArt(artUrl);
    setShowCoverSelector(false);
  };
  
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Create {type.charAt(0).toUpperCase() + type.slice(1)} Album</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="album-title">Album Title</Label>
          <Input 
            id="album-title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Enter album title" 
          />
        </div>
        
        {type === 'remix' ? (
          <div>
            <Label>Select Featured Remix Artists</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {aiRappers.map(rapper => (
                <div 
                  key={rapper.id}
                  className={`p-2 border rounded cursor-pointer ${
                    remixArtists.includes(rapper.id) ? 'bg-primary/20 border-primary' : ''
                  }`}
                  onClick={() => {
                    if (remixArtists.includes(rapper.id)) {
                      setRemixArtists(remixArtists.filter(id => id !== rapper.id));
                    } else {
                      setRemixArtists([...remixArtists, rapper.id]);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                      {rapper.image && <img src={rapper.image} alt={rapper.name} className="w-full h-full object-cover" />}
                    </div>
                    <span>{rapper.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <Label>Select Songs</Label>
            <ScrollArea className="h-60 border rounded-md p-2 mt-2">
              {availableSongs.length > 0 ? (
                availableSongs.map(song => (
                  <div 
                    key={song.id}
                    className={`p-2 mb-2 border rounded cursor-pointer ${
                      selectedSongs.includes(song.id) ? 'bg-primary/20 border-primary' : ''
                    }`}
                    onClick={() => {
                      if (selectedSongs.includes(song.id)) {
                        setSelectedSongs(selectedSongs.filter(id => id !== song.id));
                      } else {
                        setSelectedSongs([...selectedSongs, song.id]);
                      }
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{song.title}</div>
                        <div className="text-sm text-gray-500">
                          Tier {song.tier} • {song.featuring.length > 0 ? `feat. ${song.featuring.join(', ')}` : 'Solo'}
                        </div>
                      </div>
                      {song.coverArt && (
                        <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden">
                          <img src={song.coverArt} alt={song.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No available songs. {type === 'standard' ? 'Complete some songs first.' : 'Create songs for your album.'}
                </div>
              )}
            </ScrollArea>
            <div className="mt-2 text-sm">
              {selectedSongs.length} songs selected
            </div>
          </div>
        )}
        
        <div>
          <Label>Album Cover</Label>
          <div className="mt-2 flex items-center gap-4">
            <div className="w-24 h-24 bg-gray-200 rounded overflow-hidden">
              {coverArt && (
                <img src={coverArt} alt="Album cover" className="w-full h-full object-cover" />
              )}
            </div>
            <Button variant="outline" onClick={() => setShowCoverSelector(true)}>
              <ImageIcon className="mr-2 h-4 w-4" /> 
              Choose Cover Art
            </Button>
          </div>
          
          {showCoverSelector && (
            <div className="mt-4 p-4 border rounded-md">
              <h3 className="font-medium mb-2">Select Cover Art</h3>
              
              {/* File upload option */}
              <div className="mb-4">
                <Label htmlFor="cover-upload" className="block mb-2">Upload from your phone gallery</Label>
                <input 
                  type="file" 
                  id="cover-upload"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-white
                    hover:file:bg-primary/90"
                />
                {uploadedImage && (
                  <div className="mt-2 p-2 border rounded">
                    <div className="text-sm mb-1">Uploaded Image:</div>
                    <div className="w-20 h-20 bg-gray-200 rounded overflow-hidden">
                      <img src={uploadedImage} alt="Uploaded cover" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>
              
              <Separator className="my-4" />
              
              <div className="mb-2">
                <Label className="block mb-2">Or choose from gallery</Label>
                <ScrollArea className="h-40">
                  <div className="grid grid-cols-3 gap-2">
                    {coverArtOptions.map((art, index) => (
                      <div 
                        key={index}
                        className="w-full aspect-square bg-gray-200 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary"
                        onClick={() => handleSelectCoverArt(art)}
                      >
                        <img src={art} alt={`Cover option ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setShowCoverSelector(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={title === '' || (type !== 'remix' && selectedSongs.length === 0) || (type === 'remix' && remixArtists.length === 0)}>
            Create Album
          </Button>
        </div>
      </div>
    </div>
  );
};

const AlbumItem: React.FC<{ album: Album, songs: Song[], onReleaseAlbum: (albumId: string) => void }> = ({ album, songs, onReleaseAlbum }) => {
  const albumSongs = songs.filter(song => album.songIds.includes(song.id));
  
  return (
    <Card className="p-4 mb-4">
      <div className="flex">
        <div className="w-24 h-24 bg-gray-200 rounded overflow-hidden">
          {album.coverArt && (
            <img src={album.coverArt} alt={album.title} className="w-full h-full object-cover" />
          )}
        </div>
        
        <div className="ml-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">{album.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Badge variant={album.type === 'standard' ? 'default' : album.type === 'deluxe' ? 'secondary' : 'outline'}>
                  {album.type.charAt(0).toUpperCase() + album.type.slice(1)}
                </Badge>
                <span>{albumSongs.length} tracks</span>
                {album.released && (
                  <>
                    <span>•</span>
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      <span>Week {album.releaseDate}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {!album.released && (
              <Button size="sm" onClick={() => onReleaseAlbum(album.id)}>
                Release
              </Button>
            )}
          </div>
          
          {album.released && (
            <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
              <div>
                <div className="text-gray-500">Streams</div>
                <div className="font-medium">
                  {typeof album.streams === 'number' && !isNaN(album.streams)
                    ? album.streams.toLocaleString()
                    : '0'}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Critical Rating</div>
                <div className="font-medium flex items-center">
                  <Star className="text-yellow-500 h-3 w-3 mr-1" />
                  {typeof album.criticalRating === 'number' && !isNaN(album.criticalRating) 
                    ? album.criticalRating.toFixed(1) + '/10'
                    : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Fan Rating</div>
                <div className="font-medium flex items-center">
                  <ThumbsUp className="text-blue-500 h-3 w-3 mr-1" />
                  {typeof album.fanRating === 'number' && !isNaN(album.fanRating) 
                    ? album.fanRating.toFixed(1) + '/10'
                    : 'N/A'}
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-2">
            <ScrollArea className="h-20">
              {albumSongs.map(song => (
                <div key={song.id} className="flex items-center text-sm py-1">
                  <Music className="h-3 w-3 mr-2" />
                  <span>{song.title}</span>
                  {song.featuring.length > 0 && (
                    <span className="text-gray-500 ml-1">feat. {song.featuring.join(', ')}</span>
                  )}
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const AlbumManagement: React.FC = () => {
  const { 
    setScreen, albums, songs, releaseAlbum,
    character
  } = useRapperGame();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [formType, setFormType] = useState<'standard' | 'deluxe' | 'remix'>('standard');
  const [selectedParentAlbumId, setSelectedParentAlbumId] = useState<string | undefined>(undefined);
  
  // Filter albums based on active tab
  const filteredAlbums = albums?.filter(album => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unreleased') return !album.released;
    if (activeTab === 'released') return album.released;
    if (activeTab === 'standard') return album.type === 'standard';
    if (activeTab === 'deluxe') return album.type === 'deluxe';
    if (activeTab === 'remix') return album.type === 'remix';
    return true;
  }) || [];
  
  // Standard albums that can be used for deluxe/remix versions
  const standardAlbums = albums?.filter(album => 
    album.type === 'standard' && album.released
  ) || [];
  
  const handleNewAlbumClick = (type: 'standard' | 'deluxe' | 'remix') => {
    setFormType(type);
    
    if (type === 'standard') {
      setSelectedParentAlbumId(undefined);
      setShowCreateForm(true);
      return;
    }
    
    // For deluxe or remix, we need to select a parent album first if there are any
    if (standardAlbums.length === 0) {
      alert('You need to create and release a standard album first before creating a deluxe or remix version.');
      return;
    }
    
    // If there's only one standard album, use it automatically
    if (standardAlbums.length === 1) {
      setSelectedParentAlbumId(standardAlbums[0].id);
      setShowCreateForm(true);
      return;
    }
    
    // Otherwise show album selection dialog (this would be implemented in the UI)
    // For simplicity, we'll just use the first album for now
    setSelectedParentAlbumId(standardAlbums[0].id);
    setShowCreateForm(true);
  };
  
  const handleReleaseAlbum = (albumId: string) => {
    // Confirm release
    if (window.confirm('Are you sure you want to release this album? Once released, it cannot be modified.')) {
      releaseAlbum(albumId);
    }
  };
  
  if (showCreateForm) {
    return (
      <div className="p-4">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => setShowCreateForm(false)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Albums
        </Button>
        
        <ScrollArea className="h-[calc(100vh-150px)] pr-4">
          <AlbumForm 
            type={formType}
            parentAlbumId={selectedParentAlbumId}
            onSuccess={() => setShowCreateForm(false)}
            onCancel={() => setShowCreateForm(false)}
          />
        </ScrollArea>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => setScreen('career_dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Career
        </Button>
        <h1 className="text-3xl font-bold">Album Management</h1>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Album
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Create New Album</AlertDialogTitle>
              <AlertDialogDescription>
                What type of album would you like to create?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid grid-cols-3 gap-4 my-4">
              <Card className="p-4 cursor-pointer hover:bg-primary/5" onClick={() => handleNewAlbumClick('standard')}>
                <Disc className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-bold">Standard Album</h3>
                <p className="text-sm text-gray-500">A collection of your songs</p>
              </Card>
              <Card className="p-4 cursor-pointer hover:bg-secondary/5" onClick={() => handleNewAlbumClick('deluxe')}>
                <Award className="h-8 w-8 mb-2 text-secondary" />
                <h3 className="font-bold">Deluxe Edition</h3>
                <p className="text-sm text-gray-500">Add bonus tracks to an existing album</p>
              </Card>
              <Card className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => handleNewAlbumClick('remix')}>
                <PlusCircle className="h-8 w-8 mb-2 text-gray-700" />
                <h3 className="font-bold">Remix Album</h3>
                <p className="text-sm text-gray-500">Collaborate with others to remix your album</p>
              </Card>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <Tabs defaultValue="all" className="mb-6" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unreleased">Unreleased</TabsTrigger>
          <TabsTrigger value="released">Released</TabsTrigger>
          <TabsTrigger value="standard">Standard</TabsTrigger>
          <TabsTrigger value="deluxe">Deluxe</TabsTrigger>
          <TabsTrigger value="remix">Remix</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <ScrollArea className="h-[calc(100vh-200px)] pr-4">
        <div className="space-y-4">
          {filteredAlbums.length > 0 ? (
            filteredAlbums.map(album => (
              <AlbumItem 
                key={album.id} 
                album={album} 
                songs={songs}
                onReleaseAlbum={handleReleaseAlbum}
              />
            ))
          ) : (
            <div className="text-center py-16">
              <Disc className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-600">No Albums Found</h3>
              <p className="text-gray-500 mb-6">
                {activeTab === 'all' 
                  ? "You haven't created any albums yet." 
                  : `You don't have any ${activeTab} albums.`}
              </p>
              <Button onClick={() => handleNewAlbumClick('standard')}>
                <Plus className="mr-2 h-4 w-4" /> Create Your First Album
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AlbumManagement;