# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Voiced is a React + TypeScript web application built with Vite. **This is a parent-child voice connection app** - it allows parents to record their voice reading stories, messages, and lullabies so their child can hear them even when they're physically apart.

**Core Purpose:** "I can't be near my kid all the time, I want this so that he can hear the audio books or whatever" - The parent records their voice, and the child can listen anytime, anywhere. This is about maintaining connection through voice when distance separates.

The app combines:
- Age-appropriate visual atmospheres (beautiful backgrounds)
- Story recording system (paragraph-by-paragraph voice recording)
- Audio playback (child can hear parent's voice anytime)
- Memory preservation (recordings stored permanently)
- Developmental tracking (content matched to child's age using "day zero" concept)

## Development Commands

```bash
# Development server (runs on http://localhost:5173 by default)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking (without emitting files)
npm run typecheck

# Linting
npm run lint
```

## Architecture

### Core Concept
- **Day Zero**: A birth date from which all age calculations are derived
- **Stages**: Life stages (Genesis 0-5, Architect 6-12, Strategist 13-18, Legacy 19-25)
- **Year Themes**: Each year of life has unique themes with 10 atmospheres (visual backgrounds)
- **Stories**: Age-appropriate stories that parents can record themselves reading

### Data Flow
1. User profile with `dayZero` is retrieved from storage (currently hardcoded in `storage.ts:44-50`)
2. `ageCalculator.ts` calculates current age (years, months, days) and determines the current stage
3. Age info is used to fetch relevant year themes and atmospheres from `atmospheres.ts`
4. Daily atmosphere is selected based on day of year (rotates through available atmospheres)
5. User can shuffle to view different atmospheres or navigate to story archive

### State Management
- Uses React hooks (useState, useEffect, useRef) for local state
- No global state management library
- Storage layer uses:
  - `localStorage` for user profile and current atmosphere ID
  - `IndexedDB` for audio recordings (both general audio and story paragraph recordings)

### Storage Architecture
- **StorageManager class** (`src/lib/storage.ts`):
  - Manages IndexedDB with two object stores: `audioRecordings` and `storyRecordings`
  - Handles audio blob persistence for voice recordings
  - Story recordings are keyed by `storyId_paragraphIndex` to allow re-recording

### Component Structure
- **App.tsx**: Main coordinator, manages view state (home/archive/settings), age calculation
- **AtmosphereViewer**: Full-screen background atmosphere display with shuffle functionality
- **LifeClock**: Displays child's current age in years, months, days format
- **StoryReader**: **CORE FEATURE** - Story list and paragraph-by-paragraph voice recording interface
  - Parent records each paragraph of a story
  - Can re-record until satisfied
  - Playback anytime
  - Stored permanently in IndexedDB
- **Navigation**: Bottom navigation for view switching
- **Settings**: User profile management
- **Onboarding**: Initial setup (not currently used in App.tsx)
- **AudioArchive**: General audio recording archive (exists but not currently accessible in UI)

### Data Files
- **`src/data/atmospheres.ts`**: Contains STAGES and YEAR_THEMES with 10 atmospheres per year theme
  - Year 0: Celestial Nursery
  - Year 1: Ghibli Gardens
  - Year 2: Wonder World
  - Year 4: Friendly Creatures
  - Year 6: Micro & Macro
  - Year 8: Earth Explorer
  - Year 10: Cosmic Engineer
  - Year 13: Urban Future
  - Year 15: Mental Power
  - Year 17: Grit & Glory
  - Year 19: The Great Record
  - Year 21: Transcendence
  - Year 23: Peace
  - Note: Not all years 0-25 have themes defined yet

- **`src/data/stories.ts`**: Story content organized by year

### Key Features
- **Atmosphere rotation**: Automatically changes daily based on day of year
- **Audio recording**: Uses MediaRecorder API for browser-based audio recording
- **Story paragraph recording**: Each paragraph can be recorded/re-recorded independently
- **Blob storage**: Audio files stored as blobs in IndexedDB to avoid file system limitations

## Technology Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **lucide-react** for icons
- **@supabase/supabase-js** (dependency present but not actively used in code)

## Voice Recording Implementation (CORE FEATURE)

### How Recording Works
The StoryReader component (`src/components/StoryReader.tsx`) provides paragraph-by-paragraph recording:

**Recording Flow:**
1. Parent navigates to Story Archive
2. Selects age-appropriate story
3. Records each paragraph individually using MediaRecorder API
4. Can listen back immediately
5. Can re-record any paragraph
6. All recordings saved to IndexedDB as audio blobs

**Storage:**
- Audio recordings stored in IndexedDB (can handle large files, works offline)
- Separate object stores for:
  - `storyRecordings`: Paragraph recordings for stories
  - `audioRecordings`: General audio messages (not yet UI-accessible)
- Recordings persist across sessions
- Each recording includes: storyId, paragraphIndex, audioBlob, duration, recordedAt

**Technical Details:**
- Uses browser MediaRecorder API (webm format)
- Requires microphone permission
- Audio quality: standard (suitable for voice)
- No server required - everything stored client-side
- Works offline after initial load

### Current Limitations
- Only 5 stories available (3 for year 0, 1 for year 1, 1 for year 2)
- Stories must be pre-defined in `stories.ts`
- No "quick message" recording (must use story structure)
- Audio archive not accessible in UI (component exists but not wired)
- No playlists or scheduled playback
- No caregiver instructions built-in

### Planned Enhancements
See `VOICE_CONNECTION_REVIEW.md` for detailed recommendations:
- Quick message recording (without story structure)
- Audio archive UI access
- Playlists and scheduled playback
- More story content (20+ stories per year)
- Caregiver guide integration
- Background audio while atmospheres display

## Important Implementation Notes

### User Profile
Currently the user profile is hardcoded in `storage.ts`. To enable dynamic user creation:
1. Update `getUserProfile()` to read from localStorage
2. Implement onboarding flow in App.tsx
3. Call `storage.setUserProfile()` after onboarding

### Audio Recording
- Recordings are stored as webm blobs in IndexedDB
- MediaRecorder API requires HTTPS in production (works on localhost)
- Story recordings replace existing recordings for the same paragraph (no versioning)
- Audio objects should be properly disposed (URL.revokeObjectURL) to prevent memory leaks, though current implementation relies on garbage collection

### Atmosphere Selection
The daily atmosphere selection algorithm in `App.tsx:42-44`:
```typescript
const dayOfYear = getDayOfYear();
const atmosphereIndex = dayOfYear % allAtmospheres.length;
const dailyAtmosphere = allAtmospheres[atmosphereIndex];
```
This ensures the same atmosphere appears on the same calendar day each year.

### Missing Years
Not all years 0-25 have theme data. When adding new year themes, follow the existing pattern in `atmospheres.ts` with exactly 10 atmospheres per year theme.

### Adding New Stories
Stories are defined in `src/data/stories.ts`. Each story must have:
```typescript
{
  id: string;           // Unique identifier (e.g., 'year0_story1')
  year: number;         // Age year (0-25)
  title: string;        // Story title
  content: string;      // Full markdown content (for display)
  paragraphs: string[]; // Array of paragraphs for recording
}
```

**Important for Voice Recording:**
- Keep paragraphs short (1-3 sentences) for easy recording
- Each paragraph is recorded separately
- Total story length: 2-5 minutes when read aloud
- Content should be age-appropriate and meaningful
- Can include stories in multiple languages (Vietnamese, English, etc.)
- Parent will record in their voice, so content should be warm and personal

### Image Generation Art Styles
The image generator (`scripts/generateAtmosphereImages.ts`) uses age-appropriate art styles:
- **Celestial Nursery (Age 0)**: Soft Ghibli pastels for infants
- **Ghibli Gardens (Age 1)**: Studio Ghibli watercolor (Totoro/Spirited Away)
- **Wonder World (Age 2)**: Disney/Pixar bright playful style
- **Friendly Creatures (Age 4)**: Children's book illustration
- **Micro & Macro (Age 6)**: National Geographic meets Ghibli
- **Earth Explorer (Age 8)**: BBC Planet Earth epic photography
- **Cosmic Engineer (Age 10)**: Optimistic sci-fi concept art
- **Urban Future (Age 13)**: Cyberpunk/solarpunk fusion
- **Mental Power (Age 15)**: Matrix/Tron abstract digital
- **Grit & Glory (Age 17)**: Cinematic sports photography
- **The Great Record (Age 19)**: Classical library aesthetics
- **Transcendence (Age 21)**: Ethereal spiritual cinematography
- **Peace (Age 23)**: Zen minimalism

See `ATMOSPHERES.md` for complete documentation of all atmospheres and prompts.

### Image Generation Commands
```bash
# Interactive mode (recommended)
npm run generate:images -- --interactive

# Generate specific atmosphere
npm run generate:images -- --id celestial_01

# Generate all missing images
npm run generate:images -- --all
```
