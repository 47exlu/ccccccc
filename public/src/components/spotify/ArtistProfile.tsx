import React from 'react';
import { Link } from 'react-router-dom';

// Icons
import { 
  Play, Heart, MoreHorizontal, 
  Clock, Download, ExternalLink, 
  ChevronLeft, ChevronRight, 
  Search, Home, Library, Plus
} from 'lucide-react';

const ArtistProfile: React.FC = () => {
  // Mock data similar to the image provided
  const artist = {
    name: 'Lil Durk',
    monthlyListeners: '30.2M',
    followers: '12,493,835',
    verified: true,
    bio: 'Chicago rapper Durk Banks emerged in the early 2010s with a raw, emotional take on drill music, often focusing on the violent crime and poverty of his upbringing.',
    topTracks: [
      { id: 1, title: 'Laugh Now Cry Later', featuring: 'Drake', plays: '845,462,123', duration: '3:21', explicit: true },
      { id: 2, title: 'Broadway Girls (feat. Morgan Wallen)', featuring: 'Morgan Wallen', plays: '542,371,985', duration: '2:58', explicit: true },
      { id: 3, title: 'All My Life (feat. J. Cole)', featuring: 'J. Cole', plays: '389,765,421', duration: '3:45', explicit: true },
      { id: 4, title: 'No Auto Durk (feat. Lil Baby)', featuring: 'Lil Baby', duration: '3:32', plays: '289,651,788', explicit: true },
      { id: 5, title: 'Finessed (Duet) (feat. Lil Baby)', featuring: 'Lil Baby', duration: '2:57', plays: '278,965,112', explicit: true },
      { id: 6, title: 'Ahhh Ha', featuring: null, duration: '3:09', plays: '265,871,543', explicit: true },
      { id: 7, title: 'What Happened To Virgil?', featuring: 'Gunna', duration: '3:22', plays: '252,784,965', explicit: true },
      { id: 8, title: 'Who Want Smoke??', featuring: 'G Herbo', duration: '3:45', plays: '224,567,891', explicit: true },
      { id: 9, title: 'Crazy Story', featuring: null, duration: '2:56', plays: '218,954,765', explicit: true },
      { id: 10, title: 'Still Runnin (feat. 21 Savage)', featuring: '21 Savage', duration: '3:15', plays: '209,871,234', explicit: true },
    ],
    discography: [
      { id: 1, title: 'Almost Healed', year: 2023, type: 'Album', image: 'https://via.placeholder.com/150' },
      { id: 2, title: 'Durk', year: 2023, type: 'Single', image: 'https://via.placeholder.com/150' },
      { id: 3, title: '7220', year: 2022, type: 'Album', image: 'https://via.placeholder.com/150' },
    ],
    appearsOn: [
      { id: 1, title: 'Deep Thoughts', artist: 'Future', image: 'https://via.placeholder.com/150' },
      { id: 2, title: 'The Voice of the Heroes', artist: 'Lil Baby', image: 'https://via.placeholder.com/150' },
      { id: 3, title: 'Almost Island', artist: 'Drake', image: 'https://via.placeholder.com/150' },
    ],
    similarArtists: [
      { id: 1, name: 'Lil Baby', image: 'https://via.placeholder.com/150' },
      { id: 2, name: 'Moneybagg Yo', image: 'https://via.placeholder.com/150' },
      { id: 3, name: 'King Von', image: 'https://via.placeholder.com/150' },
      { id: 4, name: 'Polo G', image: 'https://via.placeholder.com/150' },
    ],
    profileImage: 'https://via.placeholder.com/300',
    headerImage: 'https://via.placeholder.com/1200x400',
  };

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
              
              <div className="text-sm">
                <span>{artist.monthlyListeners} monthly listeners</span>
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
        <div className="p-6 pt-2">
          <h2 className="text-2xl font-bold mb-4">Popular</h2>
          
          <div className="space-y-3">
            {artist.topTracks.slice(0, 5).map((track, index) => (
              <div key={track.id} className="group flex items-center p-2 rounded-md hover:bg-white/10">
                <div className="w-6 text-center text-gray-400 group-hover:text-white">
                  {index + 1}
                </div>
                
                <div className="flex-1 ml-4 mr-6">
                  <div className="flex items-center">
                    <div className="mr-3 w-10 h-10 bg-gray-800 flex-shrink-0"></div>
                    <div>
                      <div className="font-medium">{track.title}</div>
                      {track.featuring && (
                        <div className="text-sm text-gray-400">feat. {track.featuring}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-gray-400 text-sm">{track.plays}</div>
                
                <div className="ml-6 text-gray-400 text-sm">
                  {track.duration}
                </div>
              </div>
            ))}
            
            <button className="text-gray-400 hover:text-white text-sm font-bold mt-2">
              See more
            </button>
          </div>
        </div>
        
        {/* Discography section */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Discography</h2>
            <button className="text-gray-400 hover:text-white text-sm font-bold">
              Show all
            </button>
          </div>
          
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {artist.discography.map(album => (
              <div key={album.id} className="min-w-[160px] p-3 bg-gray-900 bg-opacity-60 rounded-md hover:bg-gray-800">
                <img 
                  src={album.image} 
                  alt={album.title} 
                  className="w-full aspect-square object-cover mb-3 rounded-md"
                />
                <h3 className="font-medium text-white truncate">{album.title}</h3>
                <p className="text-sm text-gray-400">{album.year} • {album.type}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Featuring section */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Featuring {artist.name}</h2>
            <button className="text-gray-400 hover:text-white text-sm font-bold">
              Show all
            </button>
          </div>
          
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {artist.appearsOn.map(album => (
              <div key={album.id} className="min-w-[160px] p-3 bg-gray-900 bg-opacity-60 rounded-md hover:bg-gray-800">
                <img 
                  src={album.image} 
                  alt={album.title} 
                  className="w-full aspect-square object-cover mb-3 rounded-md"
                />
                <h3 className="font-medium text-white truncate">{album.title}</h3>
                <p className="text-sm text-gray-400">By {album.artist}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* About section */}
        <div className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">About</h2>
          
          <div className="flex space-x-6">
            <div className="flex-1">
              <img 
                src={artist.profileImage} 
                alt={artist.name} 
                className="w-full h-64 object-cover object-top rounded-full mb-4"
              />
              
              <div className="flex items-center text-sm mb-6">
                <span className="text-white font-bold mr-2">{artist.monthlyListeners}</span>
                <span className="text-gray-400">monthly listeners</span>
              </div>
              
              <p className="text-gray-400 mb-6 leading-relaxed">
                {artist.bio}
              </p>
            </div>
            
            <div className="w-1/3">
              <h3 className="text-lg font-bold mb-4">Fans also like</h3>
              <div className="grid grid-cols-2 gap-4">
                {artist.similarArtists.map(similar => (
                  <div key={similar.id} className="p-2 bg-gray-900 bg-opacity-60 rounded-md hover:bg-gray-800">
                    <img 
                      src={similar.image} 
                      alt={similar.name} 
                      className="w-full aspect-square object-cover mb-2 rounded-full"
                    />
                    <h4 className="font-medium text-white text-sm text-center truncate">{similar.name}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-gray-900 border-t border-gray-800 flex items-center px-4">
        <div className="flex items-center w-1/3">
          <div className="w-14 h-14 bg-gray-800 mr-3"></div>
          <div>
            <div className="font-medium text-sm">All My Life (feat. J. Cole)</div>
            <div className="text-xs text-gray-400">Lil Durk, J. Cole</div>
          </div>
          <button className="ml-4 text-gray-400 hover:text-white">
            <Heart className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex flex-col items-center w-1/3">
          <div className="flex items-center space-x-4 mb-1">
            <button className="text-gray-400 hover:text-white">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"></path>
              </svg>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-black">
              <Play fill="black" className="h-5 w-5 ml-0.5" />
            </button>
            <button className="text-gray-400 hover:text-white">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"></path>
              </svg>
            </button>
          </div>
          
          <div className="flex items-center w-full">
            <span className="text-xs text-gray-400 mr-2">1:45</span>
            <div className="flex-1 h-1 bg-gray-600 rounded-full">
              <div className="h-1 bg-white rounded-full w-1/3"></div>
            </div>
            <span className="text-xs text-gray-400 ml-2">3:45</span>
          </div>
        </div>
        
        <div className="flex items-center justify-end w-1/3 space-x-3">
          <button className="text-gray-400 hover:text-white">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"></path>
            </svg>
          </button>
          <button className="text-gray-400 hover:text-white">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"></path>
            </svg>
          </button>
          <button className="text-gray-400 hover:text-white">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
            </svg>
          </button>
          <div className="w-24 h-1 bg-gray-600 rounded-full">
            <div className="h-1 bg-white rounded-full w-2/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistProfile;