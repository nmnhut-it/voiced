import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Home } from 'lucide-react';

import { AgeDisplay } from './components/AgeDisplay';
import { HomepageTitle } from './components/HomepageTitle';
import { ParticleLayer } from './components/ParticleLayer';
import { SparkleEffect } from './components/SparkleEffect';
import { VideoBackground } from './components/VideoBackground';
import { calculateAge } from './lib/ageCalculator';
import { storage } from './lib/storage';
import {
  AgeInfo,
  Atmosphere,
  UserProfile,
} from './types';

const BASE_URL = import.meta.env.BASE_URL;

type AppView = 'home' | 'atmospheres';

// Homepage atmosphere - bedtime story landing page
const HOMEPAGE_ATMOSPHERE: Atmosphere = {
  id: 'magic-forest',
  name: 'BEDTIME STORIES',
  description: 'A magical bedtime story forest',
  cssBackground: 'linear-gradient(180deg, #0a1628 0%, #162a4a 50%, #0d1b2a 100%)',
  colors: { primary: '#4a6fa5', secondary: '#c9d6df', accent: '#ffd700' },
  timeOfDay: 'night',
  audioPath: 'sound/con-rong-chau-tien.mp3',
};

// Poster image shown while homepage video loads
const HOMEPAGE_POSTER_ID = 'celestial_02';

// Minimum swipe distance to trigger change (in pixels)
const SWIPE_THRESHOLD = 50;

function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [profile] = useState<UserProfile>(storage.getUserProfile());
  const [ageInfo, setAgeInfo] = useState<AgeInfo | null>(null);
  const [currentAtmosphere, setCurrentAtmosphere] = useState<Atmosphere | null>(null);
  const [allAtmospheres, setAllAtmospheres] = useState<Atmosphere[]>([]);
  const [sparkleTrigger, setSparkleTrigger] = useState<{ x: number; y: number; id: number } | null>(null);

  // Audio state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioAnalyser, setAudioAnalyser] = useState<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Touch tracking for swipe/tap detection
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const sparkleIdRef = useRef(0);

  // The atmosphere that drives background/particles depends on which view we're on
  const activeAtmosphere = currentView === 'home' ? HOMEPAGE_ATMOSPHERE : currentAtmosphere;

  useEffect(() => {
    const initializeApp = async () => {
      await storage.init();
      updateAgeAndAtmosphere();
    };

    initializeApp();

    const ageInterval = setInterval(() => {
      updateAgeAndAtmosphere();
    }, 60000);

    return () => {
      clearInterval(ageInterval);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Stop any playing audio
  const stopAudio = useCallback(() => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setIsPlayingAudio(false);
    setAudioAnalyser(null);
  }, []);

  // Navigate between views, stopping audio on transition
  const navigateTo = useCallback((view: AppView) => {
    stopAudio();
    setCurrentView(view);
  }, [stopAudio]);

  // Play atmosphere audio
  const playAtmosphereAudio = useCallback(async (atmosphere: Atmosphere) => {
    if (!atmosphere.audioPath) return;

    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }

    try {
      let audioContext = audioContextRef.current;
      if (!audioContext || audioContext.state === 'closed') {
        audioContext = new AudioContext();
        audioContextRef.current = audioContext;
      }

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      setAudioAnalyser(analyser);

      const audioUrl = `${BASE_URL}${atmosphere.audioPath}`;
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      audioSourceRef.current = source;

      source.onended = () => {
        setIsPlayingAudio(false);
        audioSourceRef.current = null;
      };

      source.start();
      setIsPlayingAudio(true);
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  }, []);

  const updateAgeAndAtmosphere = () => {
    const info = calculateAge(profile.dayZero);
    setAgeInfo(info);

    const atmospheres = info.currentThemes.flatMap((theme) => theme.atmospheres);
    setAllAtmospheres(atmospheres);

    // Set first atmosphere for atmosphere view if none selected
    setCurrentAtmosphere((prev) =>
      prev ? prev : (atmospheres[0] ?? null),
    );
  };

  // Cycle through atmospheres (atmosphere view only)
  const cycleAtmosphere = useCallback((x: number, y: number) => {
    if (allAtmospheres.length === 0) return;

    sparkleIdRef.current += 1;
    setSparkleTrigger({ x, y, id: sparkleIdRef.current });

    setCurrentAtmosphere((prev) => {
      const currentIndex = allAtmospheres.findIndex((a) => a.id === prev?.id);
      const nextIndex = (currentIndex + 1) % allAtmospheres.length;
      return allAtmospheres[nextIndex];
    });
  }, [allAtmospheres]);

  // Handle click — behavior depends on current view
  const handleClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) return;

    if (currentView === 'home') {
      if (HOMEPAGE_ATMOSPHERE.audioPath && !isPlayingAudio) {
        playAtmosphereAudio(HOMEPAGE_ATMOSPHERE);
      }
      return;
    }

    // Atmosphere view: play audio or cycle
    if (currentAtmosphere?.audioPath && !isPlayingAudio) {
      playAtmosphereAudio(currentAtmosphere);
      return;
    }
    cycleAtmosphere(e.clientX, e.clientY);
  }, [currentView, currentAtmosphere, isPlayingAudio, playAtmosphereAudio, cycleAtmosphere]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    if ((e.target as HTMLElement).closest('button, a')) {
      touchStartRef.current = null;
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const isTap = deltaTime < 300 && distance < 20;
    const isSwipe = Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY);

    if (isTap || isSwipe) {
      if (currentView === 'home') {
        if (HOMEPAGE_ATMOSPHERE.audioPath && !isPlayingAudio) {
          playAtmosphereAudio(HOMEPAGE_ATMOSPHERE);
        }
        touchStartRef.current = null;
        return;
      }

      if (currentAtmosphere?.audioPath && !isPlayingAudio) {
        playAtmosphereAudio(currentAtmosphere);
        touchStartRef.current = null;
        return;
      }
      cycleAtmosphere(touch.clientX, touch.clientY);
    }

    touchStartRef.current = null;
  }, [currentView, currentAtmosphere, isPlayingAudio, playAtmosphereAudio, cycleAtmosphere]);

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
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <VideoBackground
        videoId={activeAtmosphere?.id}
        posterImageId={currentView === 'home' ? HOMEPAGE_POSTER_ID : undefined}
        allAtmosphereIds={allAtmospheres.map((a) => a.id)}
      />
      <ParticleLayer
        atmosphereId={activeAtmosphere?.id}
        audioAnalyser={audioAnalyser}
        isPlayingAudio={isPlayingAudio}
      />

      {currentView === 'home' ? (
        <HomepageTitle
          audioAnalyser={audioAnalyser}
          isPlayingAudio={isPlayingAudio}
        />
      ) : (
        <AgeDisplay
          ageInfo={ageInfo}
          audioAnalyser={audioAnalyser}
          isPlayingAudio={isPlayingAudio}
        />
      )}

      <SparkleEffect trigger={sparkleTrigger} />

      {/* Tap to play prompt — homepage only */}
      {currentView === 'home' && HOMEPAGE_ATMOSPHERE.audioPath && !isPlayingAudio && (
        <div className="fixed bottom-32 left-0 right-0 z-40 text-center">
          <div
            className="text-white/60 text-sm"
            style={{ textShadow: '0 0 10px rgba(0,0,0,0.5)' }}
          >
            Tap to play
          </div>
        </div>
      )}

      {/* Navigation */}
      {currentView === 'home' ? (
        <button
          onClick={(e) => { e.stopPropagation(); navigateTo('atmospheres'); }}
          className="fixed bottom-8 right-8 z-50 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-sm hover:bg-white/20 transition-all"
          style={{ textShadow: '0 0 10px rgba(0,0,0,0.5)' }}
        >
          Realms
        </button>
      ) : (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); navigateTo('home'); }}
            className="fixed bottom-8 left-8 z-50 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 hover:bg-white/20 transition-all"
          >
            <Home size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              cycleAtmosphere(window.innerWidth / 2, window.innerHeight / 2);
            }}
            className="fixed bottom-8 right-8 z-50 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-sm hover:bg-white/20 transition-all"
            style={{ textShadow: '0 0 10px rgba(0,0,0,0.5)' }}
          >
            {currentAtmosphere?.name || 'Realms'}
          </button>
        </>
      )}
    </div>
  );
}

export default App;
