import { useMemo, useState, useEffect, useRef } from 'react';

interface Particle {
  id: number;
  size: number;
  left: number;
  startY: number;
  delay: number;
  duration: number;
  colorIndex: number;
}

interface AudioParticle {
  id: number;
  size: number;
  left: number;
  startY: number;
  duration: number;
  color: { bg: string; glow: string };
  createdAt: number;
}

interface ParticleTheme {
  colors: Array<{ bg: string; glow: string }>;
}

// Theme-specific particle colors
const PARTICLE_THEMES: Record<string, ParticleTheme> = {
  celestial: {
    colors: [
      { bg: 'rgba(255, 215, 100, 0.8)', glow: 'rgba(255, 200, 80, 0.6)' },
      { bg: 'rgba(255, 230, 150, 0.7)', glow: 'rgba(255, 220, 100, 0.5)' },
      { bg: 'rgba(255, 200, 80, 0.85)', glow: 'rgba(255, 180, 60, 0.6)' },
    ],
  },
  twilight: {
    colors: [
      { bg: 'rgba(220, 220, 255, 0.8)', glow: 'rgba(180, 180, 230, 0.6)' },
      { bg: 'rgba(255, 200, 120, 0.75)', glow: 'rgba(255, 160, 80, 0.5)' },
      { bg: 'rgba(200, 180, 255, 0.7)', glow: 'rgba(170, 150, 230, 0.5)' },
      { bg: 'rgba(255, 255, 255, 0.9)', glow: 'rgba(200, 200, 255, 0.6)' },
    ],
  },
  welcome: {
    colors: [
      { bg: 'rgba(255, 215, 100, 0.9)', glow: 'rgba(255, 200, 80, 0.7)' },
      { bg: 'rgba(255, 180, 80, 0.85)', glow: 'rgba(255, 150, 50, 0.6)' },
      { bg: 'rgba(255, 255, 200, 0.8)', glow: 'rgba(255, 240, 150, 0.6)' },
    ],
  },
  default: {
    colors: [
      { bg: 'rgba(255, 255, 255, 0.7)', glow: 'rgba(200, 200, 200, 0.5)' },
    ],
  },
};

// Extract theme prefix from atmosphere ID
function getThemeFromAtmosphereId(atmosphereId?: string): string {
  if (!atmosphereId) return 'celestial';
  const prefix = atmosphereId.split('_')[0];
  return PARTICLE_THEMES[prefix] ? prefix : 'celestial';
}

// Base particles config
const PARTICLE_COUNT = 45;
const MIN_SIZE = 2;
const MAX_SIZE = 14;
const MIN_DURATION = 6;
const MAX_DURATION = 12;

// Audio-reactive particles config
const AUDIO_PARTICLE_LIFETIME = 4000;
const AUDIO_SPAWN_THRESHOLD = 80;
const MAX_AUDIO_PARTICLES = 60;

function generateParticles(colorCount: number): Particle[] {
  const particles: Particle[] = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      id: i,
      size: MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE),
      left: Math.random() * 100,
      startY: 70 + Math.random() * 40,
      delay: Math.random() * 10,
      duration: MIN_DURATION + Math.random() * (MAX_DURATION - MIN_DURATION),
      colorIndex: Math.floor(Math.random() * colorCount),
    });
  }

  return particles;
}

interface ParticleLayerProps {
  atmosphereId?: string;
  audioAnalyser?: AnalyserNode | null;
  isPlayingAudio?: boolean;
}

export function ParticleLayer({ atmosphereId, audioAnalyser, isPlayingAudio }: ParticleLayerProps) {
  const themeName = getThemeFromAtmosphereId(atmosphereId);
  const theme = PARTICLE_THEMES[themeName];
  const particles = useMemo(() => generateParticles(theme.colors.length), [theme.colors.length]);

  // Audio-reactive particles
  const [audioParticles, setAudioParticles] = useState<AudioParticle[]>([]);
  const animationRef = useRef<number>(0);
  const particleIdRef = useRef(0);
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    if (!isPlayingAudio || !audioAnalyser) {
      setAudioParticles([]);
      return;
    }

    const bufferLength = audioAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const spawnParticles = () => {
      animationRef.current = requestAnimationFrame(spawnParticles);

      audioAnalyser.getByteFrequencyData(dataArray);

      // Calculate average volume from low-mid frequencies (voice range)
      let sum = 0;
      const voiceRange = Math.floor(bufferLength * 0.4);
      for (let i = 0; i < voiceRange; i++) {
        sum += dataArray[i];
      }
      const avgVolume = sum / voiceRange;

      const now = Date.now();

      // Spawn particles based on audio level
      if (avgVolume > AUDIO_SPAWN_THRESHOLD && now - lastSpawnRef.current > 50) {
        const spawnCount = Math.floor((avgVolume - AUDIO_SPAWN_THRESHOLD) / 30) + 1;
        const newParticles: AudioParticle[] = [];

        for (let i = 0; i < Math.min(spawnCount, 5); i++) {
          particleIdRef.current += 1;
          const colorIndex = Math.floor(Math.random() * theme.colors.length);
          newParticles.push({
            id: particleIdRef.current,
            size: 4 + Math.random() * 12 * (avgVolume / 200),
            left: Math.random() * 100,
            startY: 85 + Math.random() * 20,
            duration: 2 + Math.random() * 3,
            color: theme.colors[colorIndex],
            createdAt: now,
          });
        }

        lastSpawnRef.current = now;

        setAudioParticles((prev) => {
          const filtered = prev.filter((p) => now - p.createdAt < AUDIO_PARTICLE_LIFETIME);
          return [...filtered, ...newParticles].slice(-MAX_AUDIO_PARTICLES);
        });
      }

      // Cleanup old particles
      setAudioParticles((prev) =>
        prev.filter((p) => now - p.createdAt < AUDIO_PARTICLE_LIFETIME)
      );
    };

    spawnParticles();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [audioAnalyser, isPlayingAudio, theme.colors]);

  return (
    <div className="fixed inset-0 z-20 pointer-events-none overflow-hidden">
      {/* Base particles */}
      {particles.map((particle) => {
        const color = theme.colors[particle.colorIndex];
        return (
          <div
            key={particle.id}
            className="absolute rounded-full animate-rise"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.left}%`,
              top: `${particle.startY}%`,
              backgroundColor: color.bg,
              boxShadow: `0 0 ${particle.size}px ${particle.size / 2}px ${color.glow}`,
              '--delay': `${particle.delay}s`,
              '--duration': `${particle.duration}s`,
            } as React.CSSProperties}
          />
        );
      })}

      {/* Audio-reactive particles */}
      {audioParticles.map((particle) => (
        <div
          key={`audio-${particle.id}`}
          className="absolute rounded-full animate-rise-fast"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.left}%`,
            top: `${particle.startY}%`,
            backgroundColor: particle.color.bg,
            boxShadow: `0 0 ${particle.size * 1.5}px ${particle.size}px ${particle.color.glow}`,
            '--duration': `${particle.duration}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
