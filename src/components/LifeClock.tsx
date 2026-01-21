import { AgeInfo } from '../types';
import { formatLifeClock } from '../lib/ageCalculator';

interface LifeClockProps {
  ageInfo: AgeInfo;
}

export function LifeClock({ ageInfo }: LifeClockProps) {
  return (
    <div className="fixed top-6 left-6 z-50 select-none">
      <div className="backdrop-blur-2xl bg-black/40 rounded-3xl border-2 border-white/30 shadow-2xl p-6 min-w-[320px] transform hover:scale-105 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold tracking-widest text-yellow-300/90 uppercase">
            {ageInfo.stage.label}
          </div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
        </div>

        <div className="text-5xl font-black text-white mb-2 tracking-tighter drop-shadow-2xl" style={{ fontFamily: 'monospace' }}>
          {formatLifeClock(ageInfo)}
        </div>

        <div className="text-sm text-white/80 mb-4 font-semibold">
          {ageInfo.totalDays.toLocaleString()} DAYS IN REALM
        </div>

        <div className="border-t border-white/20 pt-3 mt-3">
          <div className="text-xs font-bold text-white/60 uppercase tracking-widest">
            CHAPTER {ageInfo.stage.id} // {ageInfo.stage.name.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
