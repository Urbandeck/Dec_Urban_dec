'use client';

import { useState, useEffect, useRef } from 'react';
import { ENV_CONFIG } from '@/lib/env-config';
import { toast } from 'react-hot-toast';

interface CarouselImage {
  id: number;
  fileName: string;
  mimeType: string;
  displayOrder: number;
  isActive: boolean;
  base64Data: string;
  createdAt: string;
}

export default function CarouselManagement() {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch(`${ENV_CONFIG.API_URL}/api/carousel`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      }
    } catch (error) {
      toast.error('Failed to fetch carousel images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (const file of Array.from(files)) {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file.`);
        continue;
      }

      const formData = new FormData();
      formData.append('image', file);
      formData.append('displayOrder', String(images.length));

      try {
        const response = await fetch(`${ENV_CONFIG.API_URL}/api/carousel`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (response.ok) {
          toast.success(`${file.name} uploaded successfully`);
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      } catch (error) {
        toast.error(`Error uploading ${file.name}`);
      }
    }

    setIsUploading(false);
    fetchImages();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`${ENV_CONFIG.API_URL}/api/carousel/${id}/toggle`, {
        method: 'PUT',
        credentials: 'include',
      });

      if (response.ok) {
        setImages(images.map(img =>
          img.id === id ? { ...img, isActive: !currentStatus } : img
        ));
        toast.success(`Image ${currentStatus ? 'disabled' : 'enabled'}`);
      } else {
        toast.error('Failed to update image status');
      }
    } catch (error) {
      toast.error('Error updating image status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`${ENV_CONFIG.API_URL}/api/carousel/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setImages(images.filter(img => img.id !== id));
        toast.success('Image deleted successfully');
      } else {
        toast.error('Failed to delete image');
      }
    } catch (error) {
      toast.error('Error deleting image');
    }
  };

  const handleReorder = async (id: number, direction: 'up' | 'down') => {
    const currentIndex = images.findIndex(img => img.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const newImages = [...images];
    [newImages[currentIndex], newImages[newIndex]] = [newImages[newIndex], newImages[currentIndex]];

    // Update display orders
    const updatedImages = newImages.map((img, idx) => ({ ...img, displayOrder: idx }));
    setImages(updatedImages);

    // Save order to backend
    try {
      await fetch(`${ENV_CONFIG.API_URL}/api/carousel/${id}/order`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayOrder: newIndex }),
      });
      await fetch(`${ENV_CONFIG.API_URL}/api/carousel/${images[newIndex].id}/order`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayOrder: currentIndex }),
      });
    } catch (error) {
      toast.error('Failed to save order');
      fetchImages(); // Revert on error
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Carousel Images</h1>
          <p className="text-slate-500 mt-1">
            Manage the images displayed in the homepage carousel
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Uploading...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload Images
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-blue-800">How it works</h3>
            <p className="text-sm text-amber-700 mt-1">
              Upload images to display in the homepage carousel. Only active images will be shown.
              Use the arrows to reorder images. For best results, use high-resolution images (1920x1080 or higher).
            </p>
          </div>
        </div>
      </div>

      {/* Images Grid */}
      {images.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No carousel images yet</h3>
          <p className="text-slate-500 mb-4">Upload your first image to get started</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
          >
            Upload Images
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div key={image.id} className={`bg-white rounded-2xl border border-stone-200 overflow-hidden ${!image.isActive && 'opacity-60'}`}>
              <div className="aspect-video relative">
                <img
                  src={image.base64Data}
                  alt={image.fileName}
                  className="w-full h-full object-cover"
                />
                {!image.isActive && (
                  <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                    <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
                      Disabled
                    </span>
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  #{index + 1}
                </div>
              </div>

              <div className="p-4">
                <p className="text-sm text-slate-500 truncate mb-3">{image.fileName}</p>

                <div className="flex items-center justify-between">
                  {/* Reorder buttons */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleReorder(image.id, 'up')}
                      disabled={index === 0}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-stone-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleReorder(image.id, 'down')}
                      disabled={index === images.length - 1}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-stone-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(image.id, image.isActive)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        image.isActive
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {image.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
