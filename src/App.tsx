import { useState, useEffect } from 'react';
import { UserProfile, Atmosphere, AgeInfo } from './types';
import { storage } from './lib/storage';
import { calculateAge, getDayOfYear } from './lib/ageCalculator';
import { getStoriesForYear } from './data/stories';
import { LifeClock } from './components/LifeClock';
import { AtmosphereViewer } from './components/AtmosphereViewer';
import { Navigation } from './components/Navigation';
import { StoryReader } from './components/StoryReader';
import { Settings } from './components/Settings';

function App() {
  const [profile] = useState<UserProfile>(storage.getUserProfile());
  const [ageInfo, setAgeInfo] = useState<AgeInfo | null>(null);
  const [currentAtmosphere, setCurrentAtmosphere] = useState<Atmosphere | null>(null);
  const [availableAtmospheres, setAvailableAtmospheres] = useState<Atmosphere[]>([]);
  const [currentView, setCurrentView] = useState<'home' | 'archive' | 'settings'>('home');

  useEffect(() => {
    const initializeApp = async () => {
      await storage.init();
      updateAgeAndAtmosphere();
    };

    initializeApp();

    const interval = setInterval(() => {
      updateAgeAndAtmosphere();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const updateAgeAndAtmosphere = () => {
    const info = calculateAge(profile.dayZero);
    setAgeInfo(info);

    const allAtmospheres = info.currentThemes.flatMap((theme) => theme.atmospheres);
    setAvailableAtmospheres(allAtmospheres);

    if (allAtmospheres.length > 0) {
      const dayOfYear = getDayOfYear();
      const atmosphereIndex = dayOfYear % allAtmospheres.length;
      const dailyAtmosphere = allAtmospheres[atmosphereIndex];
      setCurrentAtmosphere(dailyAtmosphere);
    }
  };

  const handleShuffle = () => {
    const otherAtmospheres = availableAtmospheres.filter(
      (a) => a.id !== currentAtmosphere?.id
    );
    if (otherAtmospheres.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherAtmospheres.length);
      setCurrentAtmosphere(otherAtmospheres[randomIndex]);
    } else if (availableAtmospheres.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableAtmospheres.length);
      setCurrentAtmosphere(availableAtmospheres[randomIndex]);
    }
  };

  if (!ageInfo) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-400 via-pink-300 to-yellow-200 flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {currentView === 'home' && (
        <>
          <AtmosphereViewer
            atmospheres={availableAtmospheres}
            currentAtmosphere={currentAtmosphere}
            onShuffle={handleShuffle}
          />
          <LifeClock ageInfo={ageInfo} />
        </>
      )}

      {currentView === 'archive' && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-pink-800 to-yellow-700">
          <StoryReader stories={getStoriesForYear(ageInfo.exactYear)} currentYear={ageInfo.exactYear} />
        </div>
      )}

      {currentView === 'settings' && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-pink-800 to-yellow-700">
          <Settings profile={profile} />
        </div>
      )}

      <Navigation currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
}

export default App;
