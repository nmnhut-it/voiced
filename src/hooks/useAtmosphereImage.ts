import { useState, useEffect } from 'react';
import { Atmosphere } from '../types';
import { storage } from '../lib/storage';
import { imageGenerator } from '../lib/imageGenerator';

interface UseAtmosphereImageResult {
  imageUrl: string | null;
  isGenerating: boolean;
  error: string | null;
}

export function useAtmosphereImage(
  atmosphere: Atmosphere | null,
  theme: string
): UseAtmosphereImageResult {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!atmosphere) {
      setImageUrl(null);
      return;
    }

    let objectUrl: string | null = null;

    async function loadOrGenerateImage() {
      if (!atmosphere) return;

      try {
        setError(null);

        const cachedBlob = await storage.getAtmosphereImage(atmosphere.id);

        if (cachedBlob) {
          objectUrl = URL.createObjectURL(cachedBlob);
          setImageUrl(objectUrl);
          return;
        }

        if (!imageGenerator.isAvailable()) {
          setError('OpenAI API key not configured');
          return;
        }

        setIsGenerating(true);
        console.log(`Generating image for ${atmosphere.name}...`);

        const generatedUrl = await imageGenerator.generateAtmosphereImage(
          atmosphere.name,
          atmosphere.description,
          theme
        );

        if (!generatedUrl) {
          setError('Failed to generate image');
          setIsGenerating(false);
          return;
        }

        const imageBlob = await imageGenerator.downloadImageAsBlob(generatedUrl);

        if (!imageBlob) {
          setError('Failed to download generated image');
          setIsGenerating(false);
          return;
        }

        await storage.saveAtmosphereImage(atmosphere.id, imageBlob);

        objectUrl = URL.createObjectURL(imageBlob);
        setImageUrl(objectUrl);
        setIsGenerating(false);

        console.log(`✓ Generated and cached image for ${atmosphere.name}`);
      } catch (err) {
        console.error('Error loading/generating image:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsGenerating(false);
      }
    }

    loadOrGenerateImage();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [atmosphere?.id, atmosphere?.name, atmosphere?.description, theme]);

  return { imageUrl, isGenerating, error };
}
