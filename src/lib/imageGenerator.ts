import OpenAI from 'openai';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

class ImageGenerator {
  private openai: OpenAI | null = null;

  constructor() {
    if (OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      });
    }
  }

  isAvailable(): boolean {
    return this.openai !== null;
  }

  async generateAtmosphereImage(
    atmosphereName: string,
    atmosphereDescription: string,
    theme: string
  ): Promise<string | null> {
    if (!this.openai) {
      console.warn('OpenAI API key not configured');
      return null;
    }

    try {
      const prompt = this.buildPrompt(atmosphereName, atmosphereDescription, theme);

      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1792x1024',
        quality: 'standard',
        style: 'vivid',
      });

      return response.data[0]?.url || null;
    } catch (error) {
      console.error('Error generating image:', error);
      return null;
    }
  }

  private buildPrompt(name: string, description: string, theme: string): string {
    return `Create a beautiful, child-friendly, dreamy atmosphere background image for a children's app.
Theme: ${theme}
Atmosphere: ${name}
Description: ${description}

Style: Soft, warm, whimsical, and magical. Should be calming and age-appropriate for children.
The image should work as a full-screen background with plenty of negative space for text overlay.
No text, no characters, no faces - just pure atmospheric scenery.`;
  }

  async downloadImageAsBlob(imageUrl: string): Promise<Blob | null> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }
      return await response.blob();
    } catch (error) {
      console.error('Error downloading image:', error);
      return null;
    }
  }
}

export const imageGenerator = new ImageGenerator();
