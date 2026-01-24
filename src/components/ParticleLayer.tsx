import { useMemo } from 'react';

interface Particle {
  id: number;
  size: number;
  left: number;
  startY: number;
  delay: number;
  duration: number;
  colorIndex: number;
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
      { bg: 'rgba(220, 220, 255, 0.8)', glow: 'rgba(180, 180, 230, 0.6)' }, // Silver/lavender
      { bg: 'rgba(255, 200, 120, 0.75)', glow: 'rgba(255, 160, 80, 0.5)' }, // Warm orange
      { bg: 'rgba(200, 180, 255, 0.7)', glow: 'rgba(170, 150, 230, 0.5)' }, // Purple
      { bg: 'rgba(255, 255, 255, 0.9)', glow: 'rgba(200, 200, 255, 0.6)' }, // White star
    ],
  },
  default: {
    colors: [
      { bg: 'rgba(255, 255, 255, 0.7)', glow: 'rgba(200, 200, 200, 0.5)' },
    ],
  },
};

// Extract theme prefix from atmosphere ID (e.g., 'celestial_01' -> 'celestial')
function getThemeFromAtmosphereId(atmosphereId?: string): string {
  if (!atmosphereId) return 'celestial';
  const prefix = atmosphereId.split('_')[0];
  return PARTICLE_THEMES[prefix] ? prefix : 'celestial';
}

// Rising particles config - varying sizes
const PARTICLE_COUNT = 45;
const MIN_SIZE = 2;
const MAX_SIZE = 14;
const MIN_DURATION = 6;
const MAX_DURATION = 12;

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
}

export function ParticleLayer({ atmosphereId }: ParticleLayerProps) {
  const themeName = getThemeFromAtmosphereId(atmosphereId);
  const theme = PARTICLE_THEMES[themeName];
  const particles = useMemo(() => generateParticles(theme.colors.length), [theme.colors.length]);

  return (
    <div className="fixed inset-0 z-20 pointer-events-none overflow-hidden">
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
    </div>
  );
}
