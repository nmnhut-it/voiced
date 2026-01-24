import { useState, useEffect } from 'react';

interface VideoBackgroundProps {
  videoId?: string;
}

const FALLBACK_GRADIENT = 'linear-gradient(135deg, #1a1235 0%, #2d1f4e 40%, #3d2d6b 70%, #4a3875 100%)';
const BASE_URL = import.meta.env.BASE_URL;

export function VideoBackground({ videoId }: VideoBackgroundProps) {
  const [mediaType, setMediaType] = useState<'video' | 'image' | 'gradient'>('gradient');
  const [isLoading, setIsLoading] = useState(true);

  const videoSrc = videoId ? `${BASE_URL}videos/${videoId}.mp4` : null;
  const imageSrc = videoId ? `${BASE_URL}atmospheres/${videoId}.png` : null;

  useEffect(() => {
    if (!videoId) {
      setMediaType('gradient');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Try video first
    const video = document.createElement('video');
    video.src = `${BASE_URL}videos/${videoId}.mp4`;

    video.oncanplay = () => {
      setMediaType('video');
      setIsLoading(false);
    };

    video.onerror = () => {
      // Video failed, try image
      const img = new Image();
      img.src = `${BASE_URL}atmospheres/${videoId}.png`;

      img.onload = () => {
        setMediaType('image');
        setIsLoading(false);
      };

      img.onerror = () => {
        setMediaType('gradient');
        setIsLoading(false);
      };
    };
  }, [videoId]);

  return (
    <div className="fixed inset-0 z-10">
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
