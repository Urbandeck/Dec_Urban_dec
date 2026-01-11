'use client';

import { useState } from 'react';
import Image from 'next/image';

// Placeholder image for fallback
const PLACEHOLDER_IMAGE = '/images/placeholder.jpg';

interface HoverImageSwapProps {
  images: Array<{
    id?: number;
    imageUrl?: string;
    base64Data?: string;
    isPrimary?: boolean;
    altText?: string;
    fileName?: string;
  }>;
  productName: string;
  className?: string;
  priority?: boolean;
}

export default function HoverImageSwap({
  images,
  productName,
  className = '',
  priority = false
}: HoverImageSwapProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [primaryImageError, setPrimaryImageError] = useState(false);
  const [secondaryImageError, setSecondaryImageError] = useState(false);

  // Get primary and secondary images
  const primaryImage = images?.find(img => img.isPrimary) || images?.[0];
  const secondaryImage = images?.[1] || primaryImage; // Use second image, or fallback to primary

  // Determine the image source
  const getImageSrc = (image: any, hasError: boolean = false) => {
    if (!image || hasError) return PLACEHOLDER_IMAGE;

    // Check for base64 data first
    if (image.base64Data) {
      // If base64Data doesn't include the data URI prefix, add it
      if (!image.base64Data.startsWith('data:')) {
        return `data:image/jpeg;base64,${image.base64Data}`;
      }
      return image.base64Data;
    }

    // Check for imageUrl
    if (image.imageUrl) {
      return image.imageUrl;
    }

    // Fallback to placeholder
    return PLACEHOLDER_IMAGE;
  };

  const hasDifferentSecondaryImage = secondaryImage && secondaryImage !== primaryImage;

  return (
    <div
      className={`relative w-full h-full ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {hasDifferentSecondaryImage ? (
        <>
          {/* Primary Image (visible when not hovered) */}
          <div className={`absolute inset-0 transition-opacity duration-300 ${!isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <Image
              src={getImageSrc(primaryImage, primaryImageError)}
              alt={primaryImage?.altText || productName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              priority={priority}
              onError={() => setPrimaryImageError(true)}
            />
          </div>

          {/* Secondary Image (visible when hovered) */}
          <div className={`absolute inset-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <Image
              src={getImageSrc(secondaryImage, secondaryImageError)}
              alt={secondaryImage.altText || `${productName} - alternate view`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              onError={() => setSecondaryImageError(true)}
            />
          </div>
        </>
      ) : (
        /* Single image with scale effect when no secondary image */
        <div className={`absolute inset-0 transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}>
          <Image
            src={getImageSrc(primaryImage, primaryImageError)}
            alt={primaryImage?.altText || productName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            priority={priority}
            onError={() => setPrimaryImageError(true)}
          />
        </div>
      )}
    </div>
  );
}