'use client';

import { useState } from 'react';
import Image from 'next/image';

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

  // Get primary and secondary images
  const primaryImage = images?.find(img => img.isPrimary) || images?.[0];
  const secondaryImage = images?.[1] || primaryImage; // Use second image, or fallback to primary

  // Determine the image source
  const getImageSrc = (image: any) => {
    if (!image) return '/images/placeholder.jpg';
    if (image.base64Data) {
      // If base64Data doesn't include the data URI prefix, add it
      if (!image.base64Data.startsWith('data:')) {
        return `data:image/jpeg;base64,${image.base64Data}`;
      }
      return image.base64Data;
    }
    return image.imageUrl || '/images/placeholder.jpg';
  };

  const currentImageSrc = isHovered && secondaryImage ? getImageSrc(secondaryImage) : getImageSrc(primaryImage);

  return (
    <div
      className={`relative w-full h-full ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Primary Image (visible when not hovered) */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${!isHovered ? 'opacity-100' : 'opacity-0'}`}>
        {primaryImage && (
          <Image
            src={getImageSrc(primaryImage)}
            alt={primaryImage.altText || productName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            priority={priority}
          />
        )}
      </div>

      {/* Secondary Image (visible when hovered) */}
      {secondaryImage && secondaryImage !== primaryImage && (
        <div className={`absolute inset-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Image
            src={getImageSrc(secondaryImage)}
            alt={secondaryImage.altText || `${productName} - alternate view`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>
      )}

      {/* Fallback if no secondary image - just scale effect */}
      {(!secondaryImage || secondaryImage === primaryImage) && (
        <div className={`absolute inset-0 transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}>
          <Image
            src={getImageSrc(primaryImage)}
            alt={primaryImage?.altText || productName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            priority={priority}
          />
        </div>
      )}
    </div>
  );
}