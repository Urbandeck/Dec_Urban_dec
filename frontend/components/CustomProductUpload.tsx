'use client';
import { ENV_CONFIG } from '@/lib/env-config';

import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  name: string;
}

export default function CustomProductUpload() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [productDetails, setProductDetails] = useState({
    frameSize: '8x10',
    frameColor: 'black',
    quantity: 1,
    specialInstructions: ''
  });
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: UploadedImage[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB

    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        newImages.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview,
          name: file.name
        });

        if (newImages.length === files.length ||
            newImages.length + uploadedImages.filter(img => !file.name.includes(img.name)).length === files.length) {
          setUploadedImages(prev => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSubmit = async () => {
    if (uploadedImages.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();

    uploadedImages.forEach((img, index) => {
      formData.append(`images`, img.file);
    });

    formData.append('frameSize', productDetails.frameSize);
    formData.append('frameColor', productDetails.frameColor);
    formData.append('quantity', productDetails.quantity.toString());
    formData.append('specialInstructions', productDetails.specialInstructions);

    try {
      const response = await fetch(`${ENV_CONFIG.API_URL}/api/custom-products', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        toast.success('Custom product request submitted successfully!');
        setUploadedImages([]);
        setProductDetails({
          frameSize: '8x10',
          frameColor: 'black',
          quantity: 1,
          specialInstructions: ''
        });
        setShowModal(false);
      } else {
        toast.error('Failed to submit custom product request');
      }
    } catch (error) {
      toast.error('Error submitting request. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* Custom Product Card */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 h-full border-2 border-dashed border-purple-300">
        <div className="aspect-square relative bg-white rounded-t-lg overflow-hidden flex items-center justify-center">
          <div className="text-center p-6">
            <svg className="w-24 h-24 mx-auto mb-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Create Custom Frame</h3>
            <p className="text-gray-600 text-sm mb-4">Upload your photos and we'll create a custom digital frame for you!</p>
          </div>
        </div>
        <div className="p-4">
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Start Customizing
          </button>
        </div>
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Create Your Custom Digital Frame</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Upload Area */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Your Images
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 transition-colors"
                >
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Uploaded Images Preview */}
              {uploadedImages.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Uploaded Images ({uploadedImages.length})
                  </label>
                  <div className="grid grid-cols-4 gap-4">
                    {uploadedImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.preview}
                          alt={image.name}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(image.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Options */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frame Size
                  </label>
                  <select
                    value={productDetails.frameSize}
                    onChange={(e) => setProductDetails(prev => ({ ...prev, frameSize: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="8x10">8" x 10"</option>
                    <option value="10x12">10" x 12"</option>
                    <option value="12x15">12" x 15"</option>
                    <option value="15x20">15" x 20"</option>
                    <option value="custom">Custom Size</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frame Color
                  </label>
                  <select
                    value={productDetails.frameColor}
                    onChange={(e) => setProductDetails(prev => ({ ...prev, frameColor: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="black">Black</option>
                    <option value="white">White</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="wood">Wood Finish</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={productDetails.quantity}
                    onChange={(e) => setProductDetails(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    value={productDetails.specialInstructions}
                    onChange={(e) => setProductDetails(prev => ({ ...prev, specialInstructions: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Any special requirements or customization notes..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isUploading || uploadedImages.length === 0}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Submitting...' : 'Submit Custom Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}