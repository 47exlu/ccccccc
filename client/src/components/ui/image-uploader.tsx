import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './dialog';
import { Button } from './button';
import { ScrollArea } from './scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

type ImageUploaderProps = {
  onImageSelected: (imageData: string) => void;
  currentImage?: string | null;
  title?: string;
  buttonText?: string;
  selectedImage?: string;
  imageType?: 'cover' | 'video' | 'profile';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  aspectRatio?: 'square' | 'video' | 'wide';
  previewClassName?: string;
  dialogTitle?: string;
  className?: string;
};

export function ImageUploader({
  onImageSelected,
  currentImage,
  title = 'Select Image',
  buttonText = 'Choose Image',
  selectedImage,
  imageType = 'cover',
  label,
  size = 'md',
  aspectRatio = 'square',
  previewClassName,
  dialogTitle = 'Select Image',
  className = ''
}: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('gallery');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  useEffect(() => {
    // Load available images based on the imageType
    const loadImages = async () => {
      try {
        if (imageType === 'cover') {
          // For cover art
          setImages([
            '/assets/covers/cover1.svg',
            '/assets/covers/cover2.svg',
            '/assets/covers/cover3.svg',
            '/assets/covers/cover4.svg',
            '/assets/covers/cover5.svg',
            '/assets/covers/cover6.svg',
          ]);
        } else if (imageType === 'video') {
          // For video thumbnails
          setImages([
            '/assets/videos/video1.svg',
            '/assets/videos/video2.svg',
            '/assets/videos/video3.svg',
            '/assets/videos/video4.svg',
            '/assets/videos/video5.svg',
            '/assets/videos/video6.svg',
          ]);
        } else {
          // For profile images
          setImages([
            '/assets/profiles/profile1.svg',
            '/assets/profiles/profile2.svg',
            '/assets/profiles/profile3.svg',
            '/assets/profiles/profile4.svg',
            '/assets/profiles/profile5.svg',
            '/assets/profiles/profile6.svg',
          ]);
        }
      } catch (error) {
        console.error('Error loading images:', error);
      }
    };

    loadImages();
  }, [imageType]);

  useEffect(() => {
    // Find and set the index of the currently selected image if it exists
    if (selectedImage) {
      const idx = images.findIndex(img => img === selectedImage);
      if (idx !== -1) {
        setSelectedIdx(idx);
      }
    }
  }, [selectedImage, images]);

  const handleSelectImage = (index: number) => {
    setSelectedIdx(index);
    onImageSelected(images[index]);
    setDialogOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setUploadedImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitUpload = () => {
    if (uploadedImage) {
      onImageSelected(uploadedImage);
      setDialogOpen(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Button size variants
  const sizeClassMap = {
    sm: "text-xs py-1 px-2",
    md: "text-sm py-1.5 px-3",
    lg: "text-base py-2 px-4"
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className={`${className || ""}`}
          >
            {buttonText}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{dialogTitle || title}</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="gallery" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="gallery">App Gallery</TabsTrigger>
              <TabsTrigger value="upload">Upload from Device</TabsTrigger>
            </TabsList>
            <TabsContent value="gallery" className="pt-4">
              <ScrollArea className="max-h-[60vh]">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-2">
                  {images.map((image, idx) => (
                    <div
                      key={idx}
                      className={`relative cursor-pointer rounded-md overflow-hidden transition-all ${
                        selectedIdx === idx
                          ? 'ring-4 ring-blue-500'
                          : 'hover:ring-2 hover:ring-gray-300'
                      }`}
                      onClick={() => handleSelectImage(idx)}
                    >
                      <img
                        src={image}
                        alt={`${imageType === 'cover' ? 'Cover art' : imageType === 'video' ? 'Video thumbnail' : 'Profile image'} ${idx + 1}`}
                        className={`w-full h-auto ${aspectRatio === 'square' ? 'aspect-square' : aspectRatio === 'video' ? 'aspect-video' : 'aspect-[16/6]'} object-cover`}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="upload" className="space-y-4 pt-4">
              <div className="flex flex-col items-center justify-center gap-4">
                <div 
                  className={`border-2 border-dashed border-gray-300 rounded-lg ${aspectRatio === 'square' ? 'aspect-square' : aspectRatio === 'video' ? 'aspect-video' : 'aspect-[16/6]'} w-full max-w-md flex flex-col items-center justify-center p-6 cursor-pointer hover:border-blue-500 transition-colors`}
                  onClick={triggerFileInput}
                >
                  {uploadedImage ? (
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded preview" 
                      className={`max-h-full max-w-full object-contain`} 
                    />
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-4">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                      <p className="text-gray-500 text-center">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-2">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                </div>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                {uploadedImage && (
                  <Button onClick={handleSubmitUpload} className="w-full max-w-md">
                    Use This Image
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}