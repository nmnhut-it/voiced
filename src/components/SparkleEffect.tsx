import { useState, useEffect, useCallback } from 'react';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  angle: number;
  distance: number;
  duration: number;
  color: string;
}

interface SparkleEffectProps {
  trigger: { x: number; y: number; id: number } | null;
}

const SPARKLE_COLORS = [
  'rgba(255, 215, 100, 0.9)',
  'rgba(255, 255, 255, 0.95)',
  'rgba(255, 230, 150, 0.85)',
  'rgba(200, 180, 255, 0.9)',
  'rgba(255, 200, 120, 0.85)',
];

const SPARKLE_COUNT = 24;

function generateSparkles(x: number, y: number): Sparkle[] {
  const sparkles: Sparkle[] = [];

  for (let i = 0; i < SPARKLE_COUNT; i++) {
    sparkles.push({
      id: i,
      x,
      y,
      size: 4 + Math.random() * 10,
      angle: (i / SPARKLE_COUNT) * 360 + Math.random() * 30,
      distance: 60 + Math.random() * 120,
      duration: 0.4 + Math.random() * 0.4,
      color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
    });
  }

  return sparkles;
}

export function SparkleEffect({ trigger }: SparkleEffectProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (trigger) {
      setSparkles(generateSparkles(trigger.x, trigger.y));
      setIsAnimating(true);

      const timer = setTimeout(() => {
        setIsAnimating(false);
        setSparkles([]);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [trigger?.id]);

  if (!isAnimating || sparkles.length === 0) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {sparkles.map((sparkle) => {
        const radians = (sparkle.angle * Math.PI) / 180;
        const endX = Math.cos(radians) * sparkle.distance;
        const endY = Math.sin(radians) * sparkle.distance;

        return (
          <div
            key={sparkle.id}
            className="absolute rounded-full"
            style={{
              left: sparkle.x,
              top: sparkle.y,
              width: sparkle.size,
              height: sparkle.size,
              backgroundColor: sparkle.color,
              boxShadow: `0 0 ${sparkle.size * 2}px ${sparkle.size}px ${sparkle.color}`,
              transform: 'translate(-50%, -50%)',
              animation: `sparkle-burst ${sparkle.duration}s ease-out forwards`,
              '--end-x': `${endX}px`,
              '--end-y': `${endY}px`,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}
