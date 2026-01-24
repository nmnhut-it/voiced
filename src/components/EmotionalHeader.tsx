interface EmotionalHeaderProps {
  childName?: string;
}

export function EmotionalHeader({ childName }: EmotionalHeaderProps) {
  return (
    <div className="fixed top-[8%] md:top-[20%] left-1/2 -translate-x-1/2 z-40 select-none w-full px-4 md:px-8 max-w-4xl">
      <div className="backdrop-blur-2xl bg-black/30 rounded-2xl md:rounded-3xl border-2 border-white/40 shadow-2xl p-3 md:p-6 text-center">
        <div className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black text-white mb-1.5 md:mb-3 drop-shadow-2xl tracking-tight leading-tight">
          🎙️ YOUR VOICE IS<br className="md:hidden" /> THEIR CONSTANT
        </div>
        <div className="text-xs sm:text-sm md:text-xl lg:text-2xl text-white/90 font-medium tracking-wide">
          Even when apart, your love is heard
        </div>
        {childName && (
          <div className="hidden md:block text-xs md:text-lg text-white/70 mt-1 md:mt-2 font-light">
            For {childName}
          </div>
        )}
      </div>
    </div>
  );
}
