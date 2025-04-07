import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRapperGame } from '@/lib/stores/useRapperGame';
import { useAudio } from '@/lib/stores/useAudio';
import { MicrophoneIcon } from '@/assets/icons';
import {
  AppearanceStyle,
  FashionStyle,
  HairStyle,
  AccessoryType,
  MusicStyle,
  CharacterAppearance
} from '@/lib/types';

export function ArtistCustomization() {
  const { createCharacter, setScreen } = useRapperGame();
  const { playSuccess } = useAudio();
  
  // Basic info
  const [name, setName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [age, setAge] = useState('20');
  const [country, setCountry] = useState('USA');
  const [about, setAbout] = useState('');
  
  // Style and appearance
  const [musicStyle, setMusicStyle] = useState<MusicStyle>('trap');
  const [appearanceStyle, setAppearanceStyle] = useState<AppearanceStyle>('modern');
  const [fashionStyle, setFashionStyle] = useState<FashionStyle>('streetwear');
  const [hairStyle, setHairStyle] = useState<HairStyle>('fade');
  const [colorScheme, setColorScheme] = useState('#ffab00');
  
  // Accessories (multiple selection)
  const [accessories, setAccessories] = useState<AccessoryType[]>(['chains']);
  
  const handleAccessoryChange = (accessory: AccessoryType) => {
    if (accessories.includes(accessory)) {
      setAccessories(accessories.filter(a => a !== accessory));
    } else {
      setAccessories([...accessories, accessory]);
    }
  };
  
  const handleCreateCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim() || !artistName.trim() || !age || !country) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Create the appearance object
    const appearance: CharacterAppearance = {
      style: appearanceStyle,
      fashion: fashionStyle,
      hair: hairStyle,
      accessories: accessories,
      colorScheme: colorScheme
    };
    
    // Create character with enhanced details
    playSuccess();
    createCharacter({
      name,
      artistName,
      age: parseInt(age, 10),
      country,
      careerStartWeek: 1,
      about: about || undefined,
      musicStyle,
      appearance
    });
  };
  
  // Color presets for brand identity
  const colorPresets = [
    { name: 'Gold', value: '#ffab00' },
    { name: 'Silver', value: '#c0c0c0' },
    { name: 'Platinum', value: '#e5e4e2' },
    { name: 'Red', value: '#ff3d00' },
    { name: 'Blue', value: '#0091ea' },
    { name: 'Purple', value: '#aa00ff' },
    { name: 'Green', value: '#00c853' },
    { name: 'Black', value: '#212121' },
  ];
  
  return (
    <div className="flex items-center justify-center min-h-full bg-gradient-to-b from-purple-900 to-black p-6">
      <Card className="w-full max-w-4xl bg-black/50 backdrop-blur-lg border-gray-800 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center mb-6">
            <MicrophoneIcon size={32} className="mr-2 text-amber-400" />
            <h1 className="text-2xl font-bold">Create Your Artist</h1>
          </div>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="appearance">Style & Appearance</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleCreateCharacter}>
              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="bg-gray-900 border-gray-700"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="artistName">Artist Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="artistName"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="Lil Something"
                    className="bg-gray-900 border-gray-700"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age <span className="text-red-500">*</span></Label>
                    <Select value={age} onValueChange={setAge} required>
                      <SelectTrigger className="bg-gray-900 border-gray-700">
                        <SelectValue placeholder="Select age" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700 text-white">
                        {Array.from({ length: 22 }, (_, i) => i + 16).map((a) => (
                          <SelectItem key={a} value={a.toString()}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
                    <Select value={country} onValueChange={setCountry} required>
                      <SelectTrigger className="bg-gray-900 border-gray-700">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700 text-white">
                        <SelectItem value="USA">USA</SelectItem>
                        <SelectItem value="UK">UK</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                        <SelectItem value="France">France</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="Japan">Japan</SelectItem>
                        <SelectItem value="Brazil">Brazil</SelectItem>
                        <SelectItem value="South Korea">South Korea</SelectItem>
                        <SelectItem value="Nigeria">Nigeria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="about">About (Bio)</Label>
                  <Input 
                    id="about"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="A brief description of your artist's background and story"
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="musicStyle">Music Style</Label>
                  <Select value={musicStyle} onValueChange={(val) => setMusicStyle(val as MusicStyle)}>
                    <SelectTrigger className="bg-gray-900 border-gray-700">
                      <SelectValue placeholder="Select music style" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-white">
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
                
                <div className="pt-2 flex justify-end">
                  <Button 
                    type="button"
                    className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800"
                    onClick={() => document.querySelector('[data-value="appearance"]')?.dispatchEvent(new Event('click'))}
                  >
                    Next: Style & Appearance
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="appearance" className="space-y-4">
                <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appearanceStyle">Overall Style</Label>
                    <Select value={appearanceStyle} onValueChange={(val) => setAppearanceStyle(val as AppearanceStyle)}>
                      <SelectTrigger className="bg-gray-900 border-gray-700">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700 text-white">
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="alternative">Alternative</SelectItem>
                        <SelectItem value="underground">Underground</SelectItem>
                        <SelectItem value="mainstream">Mainstream</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fashionStyle">Fashion Style</Label>
                    <Select value={fashionStyle} onValueChange={(val) => setFashionStyle(val as FashionStyle)}>
                      <SelectTrigger className="bg-gray-900 border-gray-700">
                        <SelectValue placeholder="Select fashion" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700 text-white">
                        <SelectItem value="streetwear">Streetwear</SelectItem>
                        <SelectItem value="high-fashion">High Fashion</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="vintage">Vintage</SelectItem>
                        <SelectItem value="athleisure">Athleisure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hairStyle">Hair Style</Label>
                  <Select value={hairStyle} onValueChange={(val) => setHairStyle(val as HairStyle)}>
                    <SelectTrigger className="bg-gray-900 border-gray-700">
                      <SelectValue placeholder="Select hair style" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-white">
                      <SelectItem value="afro">Afro</SelectItem>
                      <SelectItem value="braids">Braids</SelectItem>
                      <SelectItem value="dreadlocks">Dreadlocks</SelectItem>
                      <SelectItem value="fade">Fade</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="colored">Colored</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="accessories">Accessories (Select multiple)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ['chains', 'Chains'],
                      ['grills', 'Grills'],
                      ['tattoos', 'Tattoos'],
                      ['piercings', 'Piercings'],
                      ['watches', 'Watches'],
                      ['glasses', 'Glasses'],
                      ['none', 'None']
                    ].map(([value, label]) => (
                      <div key={value} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`accessory-${value}`} 
                          checked={accessories.includes(value as AccessoryType)}
                          onCheckedChange={() => handleAccessoryChange(value as AccessoryType)}
                        />
                        <label 
                          htmlFor={`accessory-${value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="colorScheme">Brand Color Scheme</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorPresets.map(({ name, value }) => (
                      <Badge 
                        key={value}
                        variant="outline"
                        className={`cursor-pointer p-2 flex flex-col items-center ${colorScheme === value ? 'border-2 border-amber-500' : 'border-gray-700'}`}
                        style={{ backgroundColor: `${value}20` }} // Using transparency
                        onClick={() => setColorScheme(value)}
                      >
                        <div 
                          className="w-6 h-6 rounded-full mb-1" 
                          style={{ backgroundColor: value }}
                        />
                        <span className="text-xs">{name}</span>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="customColor" className="w-auto">Custom:</Label>
                    <Input 
                      id="customColor"
                      type="color"
                      value={colorScheme}
                      onChange={(e) => setColorScheme(e.target.value)}
                      className="w-12 h-8 p-0 bg-transparent"
                    />
                  </div>
                </div>
                
                <div className="pt-6 flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-1/3 border-gray-600 text-gray-300 hover:bg-gray-800"
                    onClick={() => document.querySelector('[data-value="basic"]')?.dispatchEvent(new Event('click'))}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="w-2/3 bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800"
                  >
                    Start Your Career
                  </Button>
                </div>
                </ScrollArea>
              </TabsContent>
            </form>
          </Tabs>
          
          <div className="mt-6 text-sm text-gray-500 text-center">
            <p>Your journey to hip-hop stardom begins with who you are.</p>
            <p className="text-xs mt-1">Fields marked with <span className="text-red-500">*</span> are required</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
