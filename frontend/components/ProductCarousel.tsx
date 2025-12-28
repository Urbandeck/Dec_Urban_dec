'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ENV_CONFIG } from '@/lib/env-config';

interface CarouselImage {
  id: number;
  fileName: string;
  base64Data: string;
  displayOrder: number;
  isActive: boolean;
}

interface ProductCarouselProps {
  autoPlayInterval?: number;
}

export default function ProductCarousel({ autoPlayInterval = 4000 }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set());
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch carousel images from API
  useEffect(() => {
    const fetchCarouselImages = async () => {
      try {
        const response = await fetch(`${ENV_CONFIG.API_URL}/api/carousel/active`);
        if (response.ok) {
          const data = await response.json();
          setCarouselImages(data);
        }
      } catch (error) {
        // Silently fail - will show fallback gradient
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarouselImages();
  }, []);

  const handleImageLoad = (index: number) => {
    setImagesLoaded(prev => new Set(prev).add(index));
  };

  const goToSlide = useCallback((index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 700);
  }, [currentIndex, isAnimating]);

  const nextSlide = useCallback(() => {
    if (carouselImages.length === 0) return;
    goToSlide((currentIndex + 1) % carouselImages.length);
  }, [currentIndex, carouselImages.length, goToSlide]);

  // Auto-play
  useEffect(() => {
    if (carouselImages.length <= 1) return;

    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [nextSlide, autoPlayInterval, carouselImages.length]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900">
      {/* Fallback gradient background - only visible when no images */}
      {(isLoading || carouselImages.length === 0) && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-900 to-indigo-900">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
          </div>
        </div>
      )}

      {/* Background Image Slides */}
      {carouselImages.length > 0 && (
        carouselImages.map((image, index) => {
          const isActive = index === currentIndex;

          return (
            <div
              key={image.id || index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                isActive && imagesLoaded.has(index) ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={image.base64Data}
                alt={image.fileName || `Carousel image ${index + 1}`}
                onLoad={() => handleImageLoad(index)}
                className={`w-full h-full object-cover transition-transform duration-[8000ms] ease-linear ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}
              />
            </div>
          );
        })
      )}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/50 z-20" />

      {/* Static Hero Content */}
      <div className="relative z-30 min-h-screen flex items-center">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 fade-in-text">
              <span className="bg-gradient-to-r from-emerald-400 via-purple-400 to-pink-400 text-transparent bg-clip-text animate-gradient bg-300">
                Transform Your Memories
              </span>
              <br />
              <span className="text-white mt-2 block text-3xl md:text-5xl">
                into Stunning Digital Displays
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 fade-in-text drop-shadow-lg" style={{ animationDelay: '0.2s' }}>
              Discover our premium collection of digital photo frames
            </p>
            <div className="flex gap-4 fade-in-text" style={{ animationDelay: '0.4s' }}>
              <Link
                href="/products"
                className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all hover:scale-105 shadow-lg inline-block"
              >
                Shop Now
                <span className="ml-2">→</span>
              </Link>
              <Link
                href="/about"
                className="bg-white/20 backdrop-blur px-8 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all hover:scale-105 shadow-lg inline-block border border-white/30 text-white"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      {carouselImages.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-10 h-3 bg-white'
                  : 'w-3 h-3 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
