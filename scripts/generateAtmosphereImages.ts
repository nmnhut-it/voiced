import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { YEAR_THEMES } from '../src/data/atmospheres';

// Load .env file
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;
const OUTPUT_DIR = path.join(__dirname, '../public/atmospheres');

if (!OPENAI_API_KEY) {
  console.error('Error: VITE_OPENAI_API_KEY not found in environment variables');
  console.error('Please create a .env file with your OpenAI API key');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function downloadImage(url: string, filepath: string): Promise<void> {
  const response = await fetch(url);
  const blob = await response.blob();
  const buffer = Buffer.from(await blob.arrayBuffer());
  fs.writeFileSync(filepath, buffer);
}

const ART_STYLES: Record<string, string> = {
  'Celestial Nursery': 'Soft pastel colors, dreamy and gentle Studio Ghibli style for infants, watercolor texture, peaceful and nurturing',
  'Ghibli Gardens': 'Studio Ghibli style - lush, warm, hand-painted watercolor aesthetic, My Neighbor Totoro and Spirited Away inspired',
  'Wonder World': 'Bright, playful, colorful Disney/Pixar style with oversized whimsical elements, vibrant and joyful',
  'Friendly Creatures': 'Cute, friendly children\'s book illustration style, Where the Wild Things Are meets Studio Ghibli, warm and inviting',
  'Micro & Macro': 'National Geographic photography meets Studio Ghibli magic, realistic but magical, educational beauty, detailed and scientific',
  'Earth Explorer': 'Epic nature photography style, BBC Planet Earth aesthetic, majestic and awe-inspiring, dramatic lighting',
  'Cosmic Engineer': 'Sci-fi concept art, futuristic but optimistic, Syd Mead meets Studio Ghibli, inspiring and hopeful',
  'Urban Future': 'Cyberpunk meets solarpunk - neon-lit but hopeful, Blade Runner aesthetic with optimistic green elements',
  'Mental Power': 'Abstract digital art style, Matrix meets Tron, neural networks visualized, glowing circuits and data streams',
  'Grit & Glory': 'Epic cinematic photography, sports photography meets adventure, intense and inspiring, dramatic golden hour lighting',
  'The Great Record': 'Classical library aesthetics, warm sepia tones, Interstellar library meets ancient archives, timeless and wise',
  'Transcendence': 'Ethereal and spiritual, peaceful Terrence Malick cinematography meets zen gardens, soft light and tranquility',
  'Peace': 'Minimalist and serene, Japanese zen aesthetic meets Scandinavian simplicity, calm and balanced'
};

function buildPrompt(name: string, description: string, theme: string): string {
  const artStyle = ART_STYLES[theme] || 'Soft, warm, whimsical, and magical';

  return `Create a beautiful atmosphere background image for a memory-keeping app.

Theme: ${theme}
Scene: ${name}
Description: ${description}

Art Style: ${artStyle}

Technical requirements:
- Wide landscape format suitable for full-screen background
- Plenty of negative space for text overlay
- No text, no human/animal characters, no faces
- Pure atmospheric scenery only
- Smooth gradients and transitions
- Child-friendly and emotionally appropriate`;
}

async function generateAtmosphereImage(
  atmosphereId: string,
  name: string,
  description: string,
  theme: string
): Promise<void> {
  const filename = `${atmosphereId}.png`;
  const filepath = path.join(OUTPUT_DIR, filename);

  if (fs.existsSync(filepath)) {
    console.log(`  ✓ ${atmosphereId} already exists, skipping...`);
    return;
  }

  try {
    console.log(`  Generating ${atmosphereId}...`);
    const prompt = buildPrompt(name, description, theme);

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
      style: 'vivid',
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E');
    }

    await downloadImage(imageUrl, filepath);
    console.log(`  ✓ ${atmosphereId} saved successfully`);

    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error(`  ✗ Error generating ${atmosphereId}:`, error);
    throw error;
  }
}

async function generateSpecific(atmosphereId: string) {
  console.log('🎨 Atmosphere Image Generator');
  console.log('==============================\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const yearTheme of YEAR_THEMES) {
    const atmosphere = yearTheme.atmospheres.find((a) => a.id === atmosphereId);
    if (atmosphere) {
      await generateAtmosphereImage(
        atmosphere.id,
        atmosphere.name,
        atmosphere.description,
        yearTheme.theme
      );
      console.log('\n✨ Done!');
      return;
    }
  }

  console.error(`❌ Atmosphere ID "${atmosphereId}" not found`);
  process.exit(1);
}

async function generateInteractive() {
  console.log('🎨 Interactive Atmosphere Image Generator');
  console.log('==========================================\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✓ Created directory: ${OUTPUT_DIR}\n`);
  }

  const allAtmospheres = YEAR_THEMES.flatMap((theme) =>
    theme.atmospheres.map((atm) => ({ ...atm, theme: theme.theme, year: theme.year }))
  );

  const missingAtmospheres = allAtmospheres.filter(
    (atm) => !fs.existsSync(path.join(OUTPUT_DIR, `${atm.id}.png`))
  );

  if (missingAtmospheres.length === 0) {
    console.log('✓ All atmosphere images have been generated!');
    rl.close();
    return;
  }

  console.log(`Found ${missingAtmospheres.length} missing atmosphere images\n`);

  for (let i = 0; i < missingAtmospheres.length; i++) {
    const atm = missingAtmospheres[i];
    const artStyle = ART_STYLES[atm.theme] || 'Default style';

    console.log(`\n[${i + 1}/${missingAtmospheres.length}] Year ${atm.year}: ${atm.theme}`);
    console.log(`Atmosphere: ${atm.name}`);
    console.log(`Description: ${atm.description}`);
    console.log(`Art Style: ${artStyle}`);

    const answer = await askQuestion('\nGenerate this image? (y/n/q): ');

    if (answer.toLowerCase() === 'q') {
      console.log('\n👋 Exiting...');
      break;
    }

    if (answer.toLowerCase() === 'y') {
      try {
        await generateAtmosphereImage(atm.id, atm.name, atm.description, atm.theme);
      } catch (error) {
        console.error('Failed to generate. Continue to next...');
      }
    } else {
      console.log('  Skipped.');
    }
  }

  console.log('\n✨ Done!');
  rl.close();
}

async function generateAll() {
  console.log('🎨 Atmosphere Image Generator (All)');
  console.log('====================================\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✓ Created directory: ${OUTPUT_DIR}\n`);
  }

  const totalAtmospheres = YEAR_THEMES.reduce(
    (sum, theme) => sum + theme.atmospheres.length,
    0
  );

  console.log(`Found ${YEAR_THEMES.length} year themes with ${totalAtmospheres} total atmospheres\n`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const yearTheme of YEAR_THEMES) {
    console.log(`\nYear ${yearTheme.year}: ${yearTheme.theme}`);
    console.log('─'.repeat(50));

    for (const atmosphere of yearTheme.atmospheres) {
      try {
        const filepath = path.join(OUTPUT_DIR, `${atmosphere.id}.png`);
        if (fs.existsSync(filepath)) {
          console.log(`  ✓ ${atmosphere.id} already exists`);
          skipped++;
        } else {
          await generateAtmosphereImage(
            atmosphere.id,
            atmosphere.name,
            atmosphere.description,
            yearTheme.theme
          );
          generated++;
        }
      } catch (error) {
        failed++;
        continue;
      }
    }
  }

  console.log('\n==============================');
  console.log('Summary:');
  console.log(`  Generated: ${generated}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total: ${totalAtmospheres}`);
  console.log('\n✨ Done!');
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0];

  if (mode === '--id' && args[1]) {
    await generateSpecific(args[1]);
  } else if (mode === '--interactive' || mode === '-i') {
    await generateInteractive();
  } else if (mode === '--all') {
    await generateAll();
  } else {
    console.log('🎨 Atmosphere Image Generator\n');
    console.log('Usage:');
    console.log('  npm run generate:images -- --interactive    # Generate one by one interactively');
    console.log('  npm run generate:images -- --id <id>        # Generate specific atmosphere');
    console.log('  npm run generate:images -- --all            # Generate all missing images');
    console.log('\nExamples:');
    console.log('  npm run generate:images -- --interactive');
    console.log('  npm run generate:images -- --id celestial_01');
    console.log('  npm run generate:images -- --all');
    process.exit(1);
  }
}

main().catch(console.error);
