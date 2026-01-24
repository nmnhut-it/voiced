import { Home, Mic, Settings } from 'lucide-react';

interface NavigationProps {
  currentView: 'home' | 'archive' | 'settings';
  onViewChange: (view: 'home' | 'archive' | 'settings') => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems = [
    { id: 'home' as const, icon: Home, label: 'REALM' },
    { id: 'archive' as const, icon: Mic, label: 'ARCHIVE' },
    { id: 'settings' as const, icon: Settings, label: 'CONFIG' },
  ];

  return (
    <div className="fixed top-3 right-3 sm:top-6 sm:right-6 z-50 select-none">
      <div className="backdrop-blur-2xl bg-black/40 rounded-2xl sm:rounded-3xl border-2 border-white/30 shadow-2xl p-1.5 sm:p-2 flex gap-1 sm:gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`px-3 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center gap-1.5 sm:gap-3 font-bold text-[10px] sm:text-xs tracking-widest ${
                isActive
                  ? 'bg-gradient-to-r from-yellow-400/30 to-orange-400/30 text-white shadow-lg shadow-yellow-400/20 scale-105 border border-yellow-400/50'
                  : 'text-white/60 hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
