'use client';

import React, { useState, useRef } from 'react';
import { uploadProductImage, uploadMultipleImages, deleteProductImage, fileToBase64 } from '@/lib/imageUtils';
import { ProductImage } from '@/lib/api';

interface ImageUploadProps {
  productId: number;
  existingImages?: ProductImage[];
  onImagesChange?: (images: ProductImage[]) => void;
}

export default function ImageUpload({ productId, existingImages = [], onImagesChange }: ImageUploadProps) {
  const [images, setImages] = useState<ProductImage[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<{ file: File; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const newPreviews = await Promise.all(
      files.map(async (file) => ({
        file,
        preview: await fileToBase64(file)
      }))
    );

    setPreviews([...previews, ...newPreviews]);
  };

  const handleUpload = async () => {
    if (previews.length === 0) return;

    setUploading(true);
    try {
      const files = previews.map(p => p.file);
      const uploadedImages = await uploadMultipleImages(productId, files);
      
      const newImages = [...images, ...uploadedImages];
      setImages(newImages);
      setPreviews([]);
      
      if (onImagesChange) {
        onImagesChange(newImages);
      }

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await deleteProductImage(imageId);
      const newImages = images.filter(img => img.id !== imageId);
      setImages(newImages);
      
      if (onImagesChange) {
        onImagesChange(newImages);
      }
    } catch (error) {
      alert('Failed to delete image. Please try again.');
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    try {
      // Update primary status via API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/products/images/${imageId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: new URLSearchParams({ isPrimary: 'true' })
        }
      );

      if (!response.ok) throw new Error('Failed to update image');

      // Update local state
      const newImages = images.map(img => ({
        ...img,
        isPrimary: img.id === imageId
      }));
      setImages(newImages);
      
      if (onImagesChange) {
        onImagesChange(newImages);
      }
    } catch (error) {
      alert('Failed to set primary image. Please try again.');
    }
  };

  const removePreview = (index: number) => {
    setPreviews(previews.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Images
        </label>
        
        <div className="flex items-center space-x-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-emerald-50 file:text-emerald-700
              hover:file:bg-emerald-100"
          />
          
          {previews.length > 0 && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : `Upload ${previews.length} image(s)`}
            </button>
          )}
        </div>
      </div>

      {/* Preview section */}
      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative">
              <img
                src={preview.preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => removePreview(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
              <p className="text-xs text-gray-600 mt-1 truncate">{preview.file.name}</p>
            </div>
          ))}
        </div>
      )}

      {/* Existing images */}
      {images.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Existing Images</h3>
          <div className="grid grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.base64Data || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${image.imageUrl}`}
                  alt={image.altText || image.fileName}
                  className="w-full h-32 object-cover rounded-lg"
                />
                
                {image.isPrimary && (
                  <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Primary
                  </span>
                )}
                
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                  {!image.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(image.id)}
                      className="bg-emerald-500 text-white px-2 py-1 rounded text-xs hover:bg-emerald-600"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
                
                <p className="text-xs text-gray-600 mt-1 truncate">{image.fileName}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}