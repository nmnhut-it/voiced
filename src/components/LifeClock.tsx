import { AgeInfo } from '../types';
import { formatLifeClock } from '../lib/ageCalculator';

interface LifeClockProps {
  ageInfo: AgeInfo;
}

export function LifeClock({ ageInfo }: LifeClockProps) {
  return (
    <div className="fixed top-3 left-3 md:top-6 md:left-6 z-50 select-none">
      <div className="backdrop-blur-2xl bg-black/40 rounded-2xl md:rounded-3xl border-2 border-white/30 shadow-2xl p-3 md:p-6 min-w-[180px] md:min-w-[320px] transform hover:scale-105 transition-all duration-300">
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <div className="text-[9px] md:text-xs font-bold tracking-widest text-yellow-300/90 uppercase">
            {ageInfo.stage.label}
          </div>
          <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
        </div>

        <div className="text-2xl md:text-5xl font-black text-white mb-1 md:mb-2 tracking-tighter drop-shadow-2xl" style={{ fontFamily: 'monospace' }}>
          {formatLifeClock(ageInfo)}
        </div>

        <div className="text-[10px] md:text-sm text-white/80 mb-2 md:mb-4 font-semibold">
          {ageInfo.totalDays.toLocaleString()} DAYS IN REALM
        </div>

        <div className="border-t border-white/20 pt-2 md:pt-3 mt-2 md:mt-3">
          <div className="text-[8px] md:text-xs font-bold text-white/60 uppercase tracking-widest leading-tight">
            CHAPTER {ageInfo.stage.id} // {ageInfo.stage.name.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
