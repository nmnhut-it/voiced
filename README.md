# Voiced

A child-focused storytelling and memory preservation app that creates age-appropriate atmospheric experiences and allows parents to record story readings for their children.

## Features

- **Age-Based Atmospheres**: Beautiful background atmospheres that change based on your child's age
- **Daily Rotation**: A new atmosphere appears each day of the year
- **Story Reading**: Record yourself reading stories paragraph by paragraph
- **Voice Archive**: Save and replay your voice recordings for your child

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Atmosphere Images (Optional)

The app uses CSS gradients by default. Optionally, you can generate beautiful DALL-E images for atmospheres one by one.

#### Create `.env` file

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```
VITE_OPENAI_API_KEY=sk-your-actual-key-here
```

Get your API key from: https://platform.openai.com/api-keys

#### Generate Images One by One (Interactive)

```bash
npm run generate:images -- --interactive
```

This will:
- Show you each atmosphere one by one
- Let you choose which ones to generate (y/n/q)
- Save generated images to `public/atmospheres/`
- Cost ~$0.04 per image in OpenAI API credits

#### Generate a Specific Atmosphere

```bash
npm run generate:images -- --id celestial_01
```

#### Generate All Missing Images

```bash
npm run generate:images -- --all
```

**How it works:**
- App shows CSS gradients by default
- If an image exists in `public/atmospheres/{id}.png`, it uses that instead
- Generate images as you go, commit them to the repo
- Perfect for GitHub Pages deployment!

**Art Styles by Age:**
- **Age 0-1**: Soft Ghibli style (Totoro-inspired pastels)
- **Age 2-4**: Playful Disney/Pixar, colorful children's book art
- **Age 6-8**: National Geographic meets Ghibli, educational wonder
- **Age 10-13**: Sci-fi concept art, cyberpunk/solarpunk fusion
- **Age 15-17**: Digital art, cinematic photography
- **Age 19-23**: Classical archives, ethereal zen aesthetics

See `ATMOSPHERES.md` for full list of all 130+ atmospheres and their styles.

### 3. Development

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

## Deployment to GitHub Pages

### Workflow

1. **Optional**: Generate atmosphere images as you go:
   ```bash
   npm run generate:images -- --interactive
   ```

2. **Commit images** (if you generated any):
   ```bash
   git add public/atmospheres/*.png
   git commit -m "Add atmosphere images"
   git push
   ```

### Deploy

1. Update `vite.config.ts` with your repository name:

```typescript
export default defineConfig({
  base: '/your-repo-name/',  // Add this line
  plugins: [react()],
  // ... rest of config
});
```

2. Build and deploy:

```bash
npm run build
```

3. Deploy the `dist` folder to GitHub Pages:
   - Go to your repository Settings > Pages
   - Select "Deploy from a branch"
   - Choose the branch with your built files
   - Or use GitHub Actions for automatic deployment

**Security Note**: The `.env` file is in `.gitignore` and will **not** be committed. Once images are generated and committed, the API key is not needed in production.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run generate:images` - Generate atmosphere images using DALL-E (requires `.env` with OpenAI API key)

## Project Structure

```
voiced/
├── public/
│   └── atmospheres/        # Generated atmosphere images
├── scripts/
│   └── generateAtmosphereImages.ts  # Image generation script
├── src/
│   ├── components/         # React components
│   ├── data/              # Atmosphere and story data
│   ├── lib/               # Utilities (storage, age calculator, image generator)
│   └── types/             # TypeScript types
└── .env.example           # Example environment variables
```

## How It Works

1. **Day Zero Concept**: Set your child's birth date
2. **Age Calculation**: App calculates exact age (years, months, days)
3. **Stage Determination**: Maps age to life stage (Genesis, Architect, Strategist, Legacy)
4. **Theme Selection**: Each year has a unique theme with 10 atmospheres
5. **Daily Atmosphere**: Rotates through atmospheres based on day of year
6. **Story Reading**: Parents can record themselves reading age-appropriate stories

## Contributing

This is a personal project for preserving memories with your child. Feel free to fork and customize for your own family!

## License

MIT
