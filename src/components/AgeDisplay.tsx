import { AgeInfo } from '../types';

interface AgeDisplayProps {
  ageInfo: AgeInfo;
}

export function AgeDisplay({ ageInfo }: AgeDisplayProps) {
  const { years, months, days, stage } = ageInfo;

  return (
    <div className="fixed z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center select-none">
      {/* Subtle backdrop */}
      <div className="bg-black/20 rounded-3xl px-8 py-6 sm:px-12 sm:py-8 border border-white/10">
        {/* Age display */}
        <div
          className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight"
          style={{
            textShadow: '0 0 20px rgba(244,208,63,0.6), 0 0 40px rgba(255,234,167,0.4), 0 0 60px rgba(244,208,63,0.2)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <span>{years}</span>
          <span className="text-yellow-200/70 mx-1 sm:mx-2">Y</span>
          <span>{months}</span>
          <span className="text-yellow-200/70 mx-1 sm:mx-2">M</span>
          <span>{days}</span>
          <span className="text-yellow-200/70 mx-1 sm:mx-2">D</span>
        </div>

        {/* Stage name */}
        <div
          className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-xl font-medium uppercase tracking-widest"
          style={{
            color: '#FFEAA7',
            textShadow: '0 0 15px rgba(244,208,63,0.5)',
          }}
        >
          {stage.name}
        </div>
      </div>
    </div>
  );
}
