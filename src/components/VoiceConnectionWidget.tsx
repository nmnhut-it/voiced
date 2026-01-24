import { useState, useEffect, useRef } from 'react';
import { storage } from '../lib/storage';
import { StoryRecording } from '../types';
import { getAllStories } from '../data/stories';

interface VoiceConnectionWidgetProps {
  onNavigateToArchive: () => void;
}

export function VoiceConnectionWidget({ onNavigateToArchive }: VoiceConnectionWidgetProps) {
  const [latestRecording, setLatestRecording] = useState<StoryRecording | null>(null);
  const [storyTitle, setStoryTitle] = useState<string>('');
  const [totalRecordings, setTotalRecordings] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      const recordings = await storage.getStoryRecordings();
      setTotalRecordings(recordings.length);

      if (recordings.length > 0) {
        const sorted = recordings.sort(
          (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
        );
        const latest = sorted[0];
        setLatestRecording(latest);

        const allStories = getAllStories();
        const story = allStories.find((s) => s.id === latest.storyId);
        if (story) {
          setStoryTitle(story.title);
        }
      }
    } catch (error) {
      console.error('Failed to load recordings:', error);
    }
  };

  const handlePlay = async () => {
    if (!latestRecording) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      const url = URL.createObjectURL(latestRecording.audioBlob);
      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current = new Audio(url);
        audioRef.current.onended = () => setIsPlaying(false);
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Failed to play audio:', error);
      setIsPlaying(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (totalRecordings === 0) {
    return (
      <div className="fixed top-[32%] md:top-[48%] left-1/2 -translate-x-1/2 z-40 w-full px-4 md:px-8 max-w-2xl">
        <div className="backdrop-blur-2xl bg-black/30 rounded-2xl md:rounded-3xl border-2 border-white/40 shadow-2xl p-4 md:p-8 text-center">
          <div className="text-lg md:text-2xl font-bold text-white mb-2 md:mb-4">
            📚 No Recordings Yet
          </div>
          <div className="text-xs md:text-base text-white/80 mb-3 md:mb-6 leading-relaxed">
            Record your first story to start building your voice library
          </div>
          <button
            onClick={onNavigateToArchive}
            className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 bg-white/20 hover:bg-white/30 active:scale-95 rounded-xl md:rounded-2xl text-white font-bold text-sm md:text-lg transition-all backdrop-blur-sm border-2 border-white/40"
          >
            🎙️ Record Your First Story
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-[32%] md:top-[48%] left-1/2 -translate-x-1/2 z-40 w-full px-4 md:px-8 max-w-2xl">
      <div className="backdrop-blur-2xl bg-black/30 rounded-2xl md:rounded-3xl border-2 border-white/40 shadow-2xl p-4 md:p-8">
        <div className="text-center mb-3 md:mb-6">
          <div className="hidden md:block text-xs md:text-sm text-white/60 uppercase tracking-wider mb-1 md:mb-2">
            Latest Recording
          </div>
          <div className="text-lg md:text-3xl font-bold text-white mb-1 md:mb-2 leading-tight">
            {storyTitle}
          </div>
          {latestRecording && (
            <div className="text-white/70 text-xs md:text-sm">
              {formatDuration(latestRecording.duration)}<span className="hidden md:inline"> • {formatDate(latestRecording.recordedAt)}</span>
            </div>
          )}
        </div>

        <button
          onClick={handlePlay}
          className="w-full px-6 md:px-8 py-4 md:py-6 bg-gradient-to-r from-pink-500/80 to-purple-500/80 hover:from-pink-600/90 hover:to-purple-600/90 active:scale-95 rounded-xl md:rounded-2xl text-white font-black text-base md:text-2xl transition-all backdrop-blur-sm border-2 border-white/40 shadow-lg mb-3 md:mb-6"
        >
          {isPlaying ? '⏸️ PAUSE' : '▶️ PLAY DAD\'S VOICE'}
        </button>

        <div className="flex justify-between items-center text-white/80 text-xs md:text-sm">
          <div>
            <span className="font-bold text-white">{totalRecordings}</span> <span className="hidden sm:inline">recording{totalRecordings !== 1 ? 's' : ''}</span> saved
          </div>
          <button
            onClick={onNavigateToArchive}
            className="px-3 md:px-4 py-1.5 md:py-2 bg-white/10 hover:bg-white/20 active:scale-95 rounded-lg transition-all text-xs md:text-sm"
          >
            View All →
          </button>
        </div>
      </div>
    </div>
  );
}
