import { useState, useEffect, useRef } from 'react';

interface VideoBackgroundProps {
  videoId?: string;
  allAtmosphereIds?: string[];
}

const FALLBACK_GRADIENT = 'linear-gradient(135deg, #1a1235 0%, #2d1f4e 40%, #3d2d6b 70%, #4a3875 100%)';
const BASE_URL = import.meta.env.BASE_URL;
const TRANSITION_DURATION = 600; // ms - faster transition

// Cache for preloaded images
const preloadedImages = new Set<string>();

// Preload an image and cache it
function preloadImage(src: string): void {
  if (preloadedImages.has(src)) return;
  const img = new Image();
  img.src = src;
  img.onload = () => preloadedImages.add(src);
}

export function VideoBackground({ videoId, allAtmosphereIds = [] }: VideoBackgroundProps) {
  const [mediaType, setMediaType] = useState<'video' | 'image' | 'gradient'>('gradient');
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayedVideoId, setDisplayedVideoId] = useState(videoId);
  const prevVideoIdRef = useRef(videoId);

  const videoSrc = displayedVideoId ? `${BASE_URL}videos/${displayedVideoId}.mp4` : null;
  const imageSrc = displayedVideoId ? `${BASE_URL}atmospheres/${displayedVideoId}.png` : null;

  // Preload all atmosphere images on mount
  useEffect(() => {
    allAtmosphereIds.forEach((id) => {
      preloadImage(`${BASE_URL}atmospheres/${id}.png`);
    });
  }, [allAtmosphereIds]);

  // Handle transition when videoId changes
  useEffect(() => {
    if (prevVideoIdRef.current !== videoId && prevVideoIdRef.current !== undefined) {
      // Start blur transition
      setIsTransitioning(true);

      // After half the transition, swap the content
      const swapTimeout = setTimeout(() => {
        setDisplayedVideoId(videoId);
      }, TRANSITION_DURATION / 2);

      // After full transition, remove blur
      const endTimeout = setTimeout(() => {
        setIsTransitioning(false);
      }, TRANSITION_DURATION);

      prevVideoIdRef.current = videoId;
      return () => {
        clearTimeout(swapTimeout);
        clearTimeout(endTimeout);
      };
    } else {
      setDisplayedVideoId(videoId);
      prevVideoIdRef.current = videoId;
    }
  }, [videoId]);

  // Load media for displayed video
  useEffect(() => {
    if (!displayedVideoId) {
      setMediaType('gradient');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Try video first
    const video = document.createElement('video');
    video.src = `${BASE_URL}videos/${displayedVideoId}.mp4`;

    video.oncanplay = () => {
      setMediaType('video');
      setIsLoading(false);
    };

    video.onerror = () => {
      // Video failed, try image
      const img = new Image();
      img.src = `${BASE_URL}atmospheres/${displayedVideoId}.png`;

      img.onload = () => {
        setMediaType('image');
        setIsLoading(false);
      };

      img.onerror = () => {
        setMediaType('gradient');
        setIsLoading(false);
      };
    };
  }, [displayedVideoId]);

  return (
    <div
      className="fixed inset-0 z-10 transition-all"
      style={{
        filter: isTransitioning ? 'blur(20px) brightness(1.1)' : 'blur(0px)',
        transform: isTransitioning ? 'scale(1.1)' : 'scale(1)',
        transitionDuration: `${TRANSITION_DURATION / 2}ms`,
        transitionTimingFunction: 'ease-in-out',
      }}
    >
      {/* Base gradient layer - always visible as foundation */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ background: FALLBACK_GRADIENT }}
      />

      {/* Video background */}
      {mediaType === 'video' && videoSrc && (
        <video
          key={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Image background */}
      {mediaType === 'image' && imageSrc && (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${imageSrc})` }}
        />
      )}
    </div>
  );
}
