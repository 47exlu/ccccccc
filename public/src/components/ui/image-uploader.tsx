import React, { useState, useRef } from 'react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog';
import { ImageIcon, UploadIcon, XIcon, FolderIcon, CameraIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

// Sample gallery images for profile pictures (these would be actual paths in a real app)
const GALLERY_IMAGES = [
  '/assets/profile1.jpg',
  '/assets/profile2.jpg',
  '/assets/profile3.jpg',
  '/assets/profile4.jpg',
  // Add more sample images as needed
];

interface ImageUploaderProps {
  onImageSelected: (imageData: string) => void;
  // Support for the existing implementation with dialog
  initialImage?: string;
  buttonText?: string;
  dialogTitle?: string;
  className?: string;
  // Support for the direct implementation
  currentImage?: string;
  aspectRatio?: 'square' | 'cover';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  previewClassName?: string;
  allowReset?: boolean;
  // For gallery support
  showGallery?: boolean;
  galleryImages?: string[];
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  // Handle both property names for images
  initialImage,
  currentImage,
  buttonText = 'Upload Image',
  dialogTitle = 'Upload Image',
  className = '',
  aspectRatio = 'square',
  size = 'md',
  label = 'Upload Image',
  previewClassName = '',
  allowReset = true,
  showGallery = true,
  galleryImages = []
}) => {
  // Use initialImage for backward compatibility
  const imageToUse = initialImage || currentImage;
  
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(imageToUse);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<string>("upload");

  // Use the provided gallery images or fallback to the default sample ones
  const imagesToShow = galleryImages.length > 0 ? galleryImages : [
    'https://i.imgur.com/YlGV5Xr.jpg',
    'https://i.imgur.com/gXYXBQZ.jpg', 
    'https://i.imgur.com/YpvDwLj.jpg',
    'https://i.imgur.com/SWzhgy0.jpg',
    'https://i.imgur.com/emHvZyn.jpg',
    'https://i.imgur.com/KxRFZLJ.jpg',
  ];

  // Determine dimensions based on size prop
  const getDimensions = () => {
    switch (size) {
      case 'sm': return 'w-24 h-24';
      case 'lg': return 'w-48 h-48';
      case 'md':
      default: return 'w-32 h-32';
    }
  };

  // Get aspect ratio class
  const getAspectRatio = () => {
    return aspectRatio === 'square' ? 'aspect-square' : 'aspect-[4/3]';
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0 && files[0].type.match('image.*')) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setPreviewUrl(imageData);
      onImageSelected(imageData);
      
      // If using dialog mode, close the dialog after selection
      if (buttonText && !showGallery) {
        setDialogOpen(false);
      }
    };
    
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setPreviewUrl(undefined);
    onImageSelected('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGalleryImageSelect = (imageUrl: string) => {
    setPreviewUrl(imageUrl);
    onImageSelected(imageUrl);
  };

  // If we have buttonText prop, we're using the dialog mode
  if (buttonText) {
    return (
      <>
        <Button 
          type="button" 
          onClick={() => setDialogOpen(true)}
          className={className}
          variant="outline"
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>
            
            {showGallery ? (
              <Tabs defaultValue="upload" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="upload" className="flex items-center">
                    <CameraIcon className="h-4 w-4 mr-2" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="gallery" className="flex items-center">
                    <FolderIcon className="h-4 w-4 mr-2" />
                    Gallery
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="mt-0">
                  <div className="flex flex-col items-center space-y-4 py-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      ref={fileInputRef}
                    />
                    
                    <div
                      className="w-64 h-64 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {previewUrl && activeTab === "upload" ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="w-full h-full object-contain"
                          />
                          <button
                            className="absolute top-2 right-2 bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReset();
                            }}
                          >
                            <XIcon className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <UploadIcon className="h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                            Drag & drop an image here, or click to select from your phone
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="gallery" className="mt-0">
                  <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-2">
                    {imagesToShow.map((image, index) => (
                      <div 
                        key={index}
                        className={`relative aspect-square cursor-pointer overflow-hidden rounded-md border-2 hover:opacity-90 ${
                          previewUrl === image ? 'border-primary' : 'border-transparent'
                        }`}
                        onClick={() => handleGalleryImageSelect(image)}
                      >
                        <img 
                          src={image} 
                          alt={`Gallery image ${index}`} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center space-y-4 py-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                />
                
                <div
                  className="w-64 h-64 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-contain"
                      />
                      <button
                        className="absolute top-2 right-2 bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReset();
                        }}
                      >
                        <XIcon className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <UploadIcon className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                        Drag & drop an image here, or click to select
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button type="button" onClick={() => setDialogOpen(false)}>
                {previewUrl ? 'Done' : 'Cancel'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Direct mode (no dialog)
  return (
    <div className="flex flex-col items-center">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
      />
      
      <div
        className={`relative ${getDimensions()} ${getAspectRatio()} overflow-hidden rounded-md cursor-pointer ${
          isDragging ? 'border-2 border-primary' : 'border border-gray-300 dark:border-gray-700'
        } ${previewUrl ? '' : 'bg-gray-100 dark:bg-gray-800'} ${previewClassName}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {previewUrl ? (
          <>
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            {allowReset && (
              <button
                className="absolute top-1 right-1 bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReset();
                }}
              >
                <XIcon className="h-4 w-4 text-white" />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-2">
            <UploadIcon className="h-8 w-8 text-gray-400 mb-2" />
            <div className="text-xs text-center text-gray-500 dark:text-gray-400">
              {label}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { ImageUploader };