import { useState, useEffect } from 'react';
import { Atmosphere } from '../types';
import { Shuffle } from 'lucide-react';

interface AtmosphereViewerProps {
  atmospheres: Atmosphere[];
  currentAtmosphere: Atmosphere | null;
  onShuffle: () => void;
}

export function AtmosphereViewer({
  atmospheres,
  currentAtmosphere,
  onShuffle,
}: AtmosphereViewerProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (currentAtmosphere) {
      setIsTransitioning(true);
      const timer = setTimeout(() => setIsTransitioning(false), 800);
      return () => clearTimeout(timer);
    }
  }, [currentAtmosphere]);

  if (!currentAtmosphere) return null;

  return (
    <div className="fixed inset-0 w-full h-full">
      <div
        className={`absolute inset-0 transition-opacity duration-800 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          background: currentAtmosphere.cssBackground,
        }}
      />

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 select-none">
        <div className="backdrop-blur-2xl bg-black/40 rounded-3xl border-2 border-white/30 shadow-2xl px-10 py-5 flex items-center gap-8 transform hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <div className="text-2xl font-black text-white mb-2 uppercase tracking-wider drop-shadow-lg">
              {currentAtmosphere.name}
            </div>
            <div className="text-sm text-white/80 font-medium uppercase tracking-wide">
              {currentAtmosphere.description}
            </div>
          </div>

          <button
            onClick={onShuffle}
            className="backdrop-blur-xl bg-gradient-to-br from-yellow-400/30 to-orange-400/30 hover:from-yellow-400/40 hover:to-orange-400/40 rounded-full p-5 border-2 border-yellow-400/50 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg shadow-yellow-400/20"
            aria-label="Shuffle atmosphere"
          >
            <Shuffle className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
