import { UserProfile } from '../types';
import { User, Calendar, Trash2 } from 'lucide-react';

interface SettingsProps {
  profile: UserProfile;
}

export function Settings({ profile }: SettingsProps) {
  const handleReset = () => {
    if (
      confirm(
        'Are you sure you want to reset all data? This will delete everything and cannot be undone.'
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
          <p className="text-white/70">Manage your Grow & Glow profile</p>
        </div>

        <div className="space-y-6">
          <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">
                  Child's Name
                </label>
                <div className="px-4 py-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white">
                  {profile.childName}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Day Zero (Birth Date)
                </label>
                <div className="px-4 py-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white">
                  {new Date(profile.dayZero).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2">
                  Profile Created
                </label>
                <div className="px-4 py-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-red-500/20 border border-red-400/30 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Danger Zone
            </h3>

            <p className="text-white/80 mb-6 text-sm">
              Resetting will permanently delete all data including recordings, settings,
              and profile information. This action cannot be undone.
            </p>

            <button
              onClick={handleReset}
              className="px-8 py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all"
            >
              Reset All Data
            </button>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">About Grow & Glow</h3>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              Grow & Glow is a living digital time capsule designed to accompany a child
              from their first breath through their 25th birthday. It blends emotional
              warmth of parent-recorded storytelling with richly curated cinematic
              atmospheres that mature alongside its user.
            </p>
            <p className="text-white/60 text-xs">
              All data is stored locally on your device. No data is sent to external
              servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
