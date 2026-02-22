'use client';
import { ENV_CONFIG } from '@/lib/env-config';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ScrollAnimationWrapper from './ScrollAnimationWrapper';

interface VideoData {
  id?: number;
  videoUrl: string;
  title?: string;
  description?: string;
  active: boolean;
}

export default function CTAVideoSection() {
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveVideo();
  }, []);

  const fetchActiveVideo = async () => {
    try {
      const response = await fetch(`${ENV_CONFIG.API_URL}/api/site-settings/cta-video`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (data && data.active) {
          setVideoData(data);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-stone-100 pt-32 pb-16 relative">
      {/* Wave divider - Top (from slate-800) */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
          <path d="M0 0L48 10C96 20 192 40 288 50C384 60 480 60 576 50C672 40 768 20 864 15C960 10 1056 20 1152 35C1248 50 1344 70 1392 80L1440 90V0H1392C1344 0 1248 0 1152 0C1056 0 960 0 864 0C768 0 672 0 576 0C480 0 384 0 288 0C192 0 96 0 48 0H0Z" fill="#1e293b"/>
        </svg>
      </div>
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Text Content */}
          <ScrollAnimationWrapper animation="slide-right" threshold={0.2} delay={100}>
            <div className={`${videoData ? 'text-left' : 'text-center md:text-left'} ${!videoData && 'md:col-span-2 max-w-4xl mx-auto'}`}>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Ready to Display Your Memories?</h2>
              <p className="text-slate-600 mb-8">
                Join thousands of happy customers who have transformed their homes with our
                premium digital photo frames.
              </p>
              <Link
                href="/products"
                className="bg-amber-500 text-slate-900 px-8 py-3 rounded-full font-semibold hover:bg-amber-400 transition-colors inline-block"
              >
                Start Shopping
              </Link>
            </div>
          </ScrollAnimationWrapper>

          {/* Video Section */}
          {!loading && videoData && videoData.videoUrl && (
            <ScrollAnimationWrapper animation="slide-left" threshold={0.2} delay={200}>
              <div className="relative">
                <div className="rounded-lg overflow-hidden shadow-xl">
                  {videoData.videoUrl.includes('youtube.com') || videoData.videoUrl.includes('youtu.be') ? (
                    // YouTube embed
                    <div className="aspect-video">
                      <iframe
                        src={getYouTubeEmbedUrl(videoData.videoUrl)}
                        title={videoData.title || "Advertisement Video"}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>
                  ) : videoData.videoUrl.includes('vimeo.com') ? (
                    // Vimeo embed
                    <div className="aspect-video">
                      <iframe
                        src={getVimeoEmbedUrl(videoData.videoUrl)}
                        title={videoData.title || "Advertisement Video"}
                        className="w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    // Direct video file
                    <video
                      controls
                      autoPlay
                      muted
                      loop
                      className="w-full aspect-video bg-black"
                    >
                      <source src={videoData.videoUrl} type="video/mp4" />
                      <source src={videoData.videoUrl} type="video/webm" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
                {videoData.title && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-slate-800">{videoData.title}</h3>
                    {videoData.description && (
                      <p className="text-sm text-slate-600 mt-1">{videoData.description}</p>
                    )}
                  </div>
                )}
              </div>
            </ScrollAnimationWrapper>
          )}
        </div>
      </div>
    </section>
  );
}

// Helper function to extract YouTube video ID and create embed URL
function getYouTubeEmbedUrl(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[2].length === 11) ? match[2] : null;

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  }
  return url;
}

// Helper function to extract Vimeo video ID and create embed URL
function getVimeoEmbedUrl(url: string): string {
  const regExp = /vimeo\.com\/(\d+)/;
  const match = url.match(regExp);
  const videoId = match ? match[1] : null;

  if (videoId) {
    return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1`;
  }
  return url;
}