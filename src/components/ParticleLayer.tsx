import { useMemo } from 'react';

interface Particle {
  id: number;
  size: number;
  left: number;
  startY: number;
  delay: number;
  duration: number;
}

// Rising particles config - varying sizes, golden glow
const PARTICLE_COUNT = 45;
const MIN_SIZE = 2;
const MAX_SIZE = 14;
const MIN_DURATION = 6;
const MAX_DURATION = 12;

function generateParticles(): Particle[] {
  const particles: Particle[] = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      id: i,
      size: MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE),
      left: Math.random() * 100,
      startY: 70 + Math.random() * 40, // Start from bottom 70-110% of screen
      delay: Math.random() * 10, // Stagger start times
      duration: MIN_DURATION + Math.random() * (MAX_DURATION - MIN_DURATION),
    });
  }

  return particles;
}

export function ParticleLayer() {
  const particles = useMemo(() => generateParticles(), []);

  return (
    <div className="fixed inset-0 z-20 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-rise"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.left}%`,
            top: `${particle.startY}%`,
            backgroundColor: 'rgba(255, 215, 100, 0.8)',
            boxShadow: `0 0 ${particle.size}px ${particle.size / 2}px rgba(255, 200, 80, 0.6)`,
            '--delay': `${particle.delay}s`,
            '--duration': `${particle.duration}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
