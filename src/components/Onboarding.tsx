import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface OnboardingProps {
  onComplete: (childName: string, dayZero: string) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [childName, setChildName] = useState('');
  const [dayZero, setDayZero] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (childName && dayZero) {
      onComplete(childName, dayZero);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-blue-400 via-pink-300 to-yellow-200">
      <div className="absolute inset-0 backdrop-blur-sm bg-white/10" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="backdrop-blur-2xl bg-white/20 rounded-3xl border border-white/30 shadow-2xl p-12 max-w-2xl w-full">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-pink-300 mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              Grow & Glow
            </h1>

            <p className="text-xl text-white/80 leading-relaxed">
              The Eternal Archive
            </p>

            <p className="text-base text-white/70 mt-4 max-w-md mx-auto">
              A living digital time capsule that grows with your child from their first breath through their 25th birthday
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="childName"
                className="block text-sm font-semibold text-white/90 mb-2 tracking-wide"
              >
                Child's Name
              </label>
              <input
                type="text"
                id="childName"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full px-6 py-4 rounded-xl backdrop-blur-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-lg"
                placeholder="Enter name"
                required
              />
            </div>

            <div>
              <label
                htmlFor="dayZero"
                className="block text-sm font-semibold text-white/90 mb-2 tracking-wide"
              >
                Day Zero (Birth Date)
              </label>
              <input
                type="date"
                id="dayZero"
                value={dayZero}
                onChange={(e) => setDayZero(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-6 py-4 rounded-xl backdrop-blur-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-lg"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-5 rounded-xl bg-gradient-to-r from-pink-400 to-yellow-300 hover:from-pink-500 hover:to-yellow-400 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Begin the Journey
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-white/60">
            Your data is stored locally on your device
          </div>
        </div>
      </div>
    </div>
  );
}
