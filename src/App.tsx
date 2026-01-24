import { useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile, Atmosphere, AgeInfo, TimeOfDay } from './types';
import { storage } from './lib/storage';
import { calculateAge } from './lib/ageCalculator';
import { getStoriesForYear } from './data/stories';
import { Navigation } from './components/Navigation';
import { StoryReader } from './components/StoryReader';
import { Settings } from './components/Settings';
import { VideoBackground } from './components/VideoBackground';
import { ParticleLayer } from './components/ParticleLayer';
import { AgeDisplay } from './components/AgeDisplay';
import { SparkleEffect } from './components/SparkleEffect';

const BASE_URL = import.meta.env.BASE_URL;
const WELCOME_AUDIO_PATH = `${BASE_URL}sound/nhung-canh-buom.m4a`;

// Welcome atmosphere shown on first visit
const WELCOME_ATMOSPHERE: Atmosphere = {
  id: 'welcome_01',
  name: 'Nhung Canh Buom',
  description: 'Father and child watching the sunset together',
  cssBackground: 'linear-gradient(180deg, #87CEEB 0%, #f4a460 50%, #ffd700 100%)',
  colors: { primary: '#f4a460', secondary: '#ffd700', accent: '#87CEEB' },
  timeOfDay: 'twilight',
};

// Get current time of day based on hour
function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 17) return 'day';       // 6am - 5pm
  if (hour >= 17 && hour < 20) return 'twilight'; // 5pm - 8pm
  return 'night';                                  // 8pm - 6am
}

// Filter atmospheres by time of day, fallback to all if none match
function filterByTimeOfDay(atmospheres: Atmosphere[], timeOfDay: TimeOfDay): Atmosphere[] {
  const filtered = atmospheres.filter((a) => a.timeOfDay === timeOfDay);
  return filtered.length > 0 ? filtered : atmospheres;
}

// Minimum swipe distance to trigger change (in pixels)
const SWIPE_THRESHOLD = 50;

function App() {
  const [profile] = useState<UserProfile>(storage.getUserProfile());
  const [ageInfo, setAgeInfo] = useState<AgeInfo | null>(null);
  const [currentAtmosphere, setCurrentAtmosphere] = useState<Atmosphere | null>(null);
  const [allAtmospheres, setAllAtmospheres] = useState<Atmosphere[]>([]);
  const [availableAtmospheres, setAvailableAtmospheres] = useState<Atmosphere[]>([]);
  const [currentView, setCurrentView] = useState<'home' | 'archive' | 'settings'>('home');
  const [sparkleTrigger, setSparkleTrigger] = useState<{ x: number; y: number; id: number } | null>(null);

  // First visit and audio state
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioAnalyser, setAudioAnalyser] = useState<AnalyserNode | null>(null);
  const [audioEnded, setAudioEnded] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Touch tracking for swipe/tap detection
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const sparkleIdRef = useRef(0);

  useEffect(() => {
    const initializeApp = async () => {
      await storage.init();

      // Check for first visit
      if (storage.isFirstVisit()) {
        setIsFirstVisit(true);
        setCurrentAtmosphere(WELCOME_ATMOSPHERE);
      }

      updateAgeAndAtmosphere();
    };

    initializeApp();

    // Update age every minute
    const ageInterval = setInterval(() => {
      updateAgeAndAtmosphere();
    }, 60000);

    return () => {
      clearInterval(ageInterval);
      // Cleanup audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Auto-rotate disabled - user changes atmosphere manually via tap/click

  // Play welcome audio
  const playWelcomeAudio = useCallback(async () => {
    try {
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      setAudioAnalyser(analyser);

      const response = await fetch(WELCOME_AUDIO_PATH);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      source.onended = () => {
        setAudioEnded(true);
        setIsPlayingAudio(false);
      };

      source.start();
      setIsPlayingAudio(true);
    } catch (error) {
      console.error('Failed to play audio:', error);
      setAudioEnded(true);
    }
  }, []);

  // Complete first visit and transition to normal mode
  const completeFirstVisit = useCallback(() => {
    storage.markFirstVisitComplete();
    setIsFirstVisit(false);
    setAudioEnded(false);
    setIsPlayingAudio(false);
    setAudioAnalyser(null);

    // Set to first available atmosphere
    if (availableAtmospheres.length > 0) {
      setCurrentAtmosphere(availableAtmospheres[0]);
    }
  }, [availableAtmospheres]);

  const updateAgeAndAtmosphere = () => {
    const info = calculateAge(profile.dayZero);
    setAgeInfo(info);

    const atmospheres = info.currentThemes.flatMap((theme) => theme.atmospheres);
    setAllAtmospheres(atmospheres);

    const timeOfDay = getCurrentTimeOfDay();
    const filteredAtmospheres = filterByTimeOfDay(atmospheres, timeOfDay);
    setAvailableAtmospheres(filteredAtmospheres);

    // Don't override welcome atmosphere on first visit (check storage directly to avoid race condition)
    const isFirstVisitFromStorage = storage.isFirstVisit();
    if (filteredAtmospheres.length > 0 && !currentAtmosphere && !isFirstVisitFromStorage) {
      setCurrentAtmosphere(filteredAtmospheres[0]);
    }
  };

  // Cycle to next atmosphere with sparkle effect (cycles through ALL atmospheres)
  const cycleAtmosphere = useCallback((x: number, y: number) => {
    if (allAtmospheres.length === 0) return;

    // Trigger sparkle effect
    sparkleIdRef.current += 1;
    setSparkleTrigger({ x, y, id: sparkleIdRef.current });

    // Cycle to next atmosphere (through all, not just time-filtered)
    setCurrentAtmosphere((prev) => {
      const currentIndex = allAtmospheres.findIndex((a) => a.id === prev?.id);
      const nextIndex = (currentIndex + 1) % allAtmospheres.length;
      return allAtmospheres[nextIndex];
    });
  }, [allAtmospheres]);

  // Handle click on background
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Don't trigger if clicking on navigation or other interactive elements
    if ((e.target as HTMLElement).closest('button, a, nav')) return;

    // Handle first visit flow
    if (isFirstVisit) {
      if (!isPlayingAudio && !audioEnded) {
        // First tap: Start playing audio
        playWelcomeAudio();
      } else if (audioEnded) {
        // Audio finished, tap to continue
        completeFirstVisit();
      }
      return;
    }

    cycleAtmosphere(e.clientX, e.clientY);
  }, [cycleAtmosphere, isFirstVisit, isPlayingAudio, audioEnded, playWelcomeAudio, completeFirstVisit]);

  // Handle touch start for swipe/tap detection
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }, []);

  // Handle touch end for swipe/tap detection
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    // Don't trigger if touching navigation or other interactive elements
    if ((e.target as HTMLElement).closest('button, a, nav')) {
      touchStartRef.current = null;
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Trigger on tap (short touch with minimal movement) or horizontal swipe
    const isTap = deltaTime < 300 && distance < 20;
    const isSwipe = Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY);

    if (isTap || isSwipe) {
      // Handle first visit flow
      if (isFirstVisit) {
        if (!isPlayingAudio && !audioEnded) {
          playWelcomeAudio();
        } else if (audioEnded) {
          completeFirstVisit();
        }
        touchStartRef.current = null;
        return;
      }

      cycleAtmosphere(touch.clientX, touch.clientY);
    }

    touchStartRef.current = null;
  }, [cycleAtmosphere, isFirstVisit, isPlayingAudio, audioEnded, playWelcomeAudio, completeFirstVisit]);

  if (!ageInfo) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-400 via-pink-300 to-yellow-200 flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden"
      onClick={currentView === 'home' ? handleClick : undefined}
      onTouchStart={currentView === 'home' ? handleTouchStart : undefined}
      onTouchEnd={currentView === 'home' ? handleTouchEnd : undefined}
    >
      {currentView === 'home' && (
        <>
          <VideoBackground
            videoId={currentAtmosphere?.id}
            allAtmosphereIds={allAtmospheres.map((a) => a.id)}
          />
          <ParticleLayer
            atmosphereId={currentAtmosphere?.id}
            audioAnalyser={audioAnalyser}
            isPlayingAudio={isPlayingAudio}
          />
          <AgeDisplay
            ageInfo={ageInfo}
            audioAnalyser={audioAnalyser}
            isPlayingAudio={isPlayingAudio}
          />
          <SparkleEffect trigger={sparkleTrigger} />

          {/* First visit prompt messages */}
          {isFirstVisit && (
            <div className="fixed bottom-32 left-0 right-0 z-40 text-center">
              {!isPlayingAudio && !audioEnded && (
                <div
                  className="text-white/80 text-lg animate-pulse"
                  style={{ textShadow: '0 0 10px rgba(0,0,0,0.5)' }}
                >
                  Tap to play
                </div>
              )}
              {audioEnded && (
                <div
                  className="text-white/90 text-lg fade-in-text"
                  style={{ textShadow: '0 0 10px rgba(0,0,0,0.5)' }}
                >
                  Tap to continue
                </div>
              )}
            </div>
          )}
        </>
      )}

      {currentView === 'archive' && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-pink-800 to-yellow-700">
          <StoryReader stories={getStoriesForYear(ageInfo.exactYear)} currentYear={ageInfo.exactYear} />
        </div>
      )}

      {currentView === 'settings' && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-pink-800 to-yellow-700">
          <Settings profile={profile} />
        </div>
      )}

      {/* Hide navigation during first visit */}
      {!isFirstVisit && <Navigation currentView={currentView} onViewChange={setCurrentView} />}
    </div>
  );
}

export default App;
