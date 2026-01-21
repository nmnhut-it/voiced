import { useState, useRef, useEffect } from 'react';
import { Book, Mic, Square, Play, Pause, ArrowLeft } from 'lucide-react';
import { Story, StoryRecording } from '../types';
import { storage } from '../lib/storage';

interface StoryReaderProps {
  stories: Story[];
  currentYear: number;
}

export function StoryReader({ stories, currentYear }: StoryReaderProps) {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [recordings, setRecordings] = useState<Map<string, StoryRecording>>(new Map());
  const [isRecording, setIsRecording] = useState(false);
  const [recordingParagraph, setRecordingParagraph] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingKey, setPlayingKey] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    const allRecs = await storage.getStoryRecordings();
    const recMap = new Map<string, StoryRecording>();
    allRecs.forEach((rec) => {
      const key = `${rec.storyId}_${rec.paragraphIndex}`;
      recMap.set(key, rec);
    });
    setRecordings(recMap);
  };

  const startRecording = async (paragraphIndex: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        if (audioChunksRef.current.length > 0 && selectedStory) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

          const recording: Omit<StoryRecording, 'id'> = {
            storyId: selectedStory.id,
            paragraphIndex,
            audioBlob,
            duration: recordingTime,
            recordedAt: new Date().toISOString(),
          };

          await storage.saveStoryRecording(recording);
          await loadRecordings();
        }

        audioChunksRef.current = [];
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingParagraph(paragraphIndex);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingParagraph(null);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playRecording = (storyId: string, paragraphIndex: number) => {
    const key = `${storyId}_${paragraphIndex}`;
    const recording = recordings.get(key);

    if (!recording) return;

    if (playingKey === key) {
      audioRef.current?.pause();
      setPlayingKey(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(URL.createObjectURL(recording.audioBlob));
      audioRef.current = audio;
      audio.play();
      setPlayingKey(key);

      audio.onended = () => {
        setPlayingKey(null);
      };
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!selectedStory) {
    return (
      <div className="h-full overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Story Archive</h2>
            <p className="text-white/70">
              Year {currentYear} Stories - Record your voice reading to your child
            </p>
          </div>

          {stories.length === 0 ? (
            <div className="text-center py-12 text-white/60">
              <Book className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No stories available for this year yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {stories.map((story) => (
                <button
                  key={story.id}
                  onClick={() => setSelectedStory(story)}
                  className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl p-6 text-left hover:bg-white/25 transition-all transform hover:scale-105"
                >
                  <div className="flex items-start gap-4">
                    <Book className="w-8 h-8 text-white/80 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {story.title}
                      </h3>
                      <p className="text-white/70 text-sm">
                        {story.paragraphs.length} paragraphs
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => {
            setSelectedStory(null);
            if (isRecording) stopRecording();
          }}
          className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back to Stories</span>
        </button>

        <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-white mb-4">{selectedStory.title}</h1>
          <p className="text-white/70 text-sm">
            Record each paragraph separately. Play them back anytime.
          </p>
        </div>

        <div className="space-y-4">
          {selectedStory.paragraphs.map((paragraph, index) => {
            const key = `${selectedStory.id}_${index}`;
            const recording = recordings.get(key);
            const isCurrentlyRecording = isRecording && recordingParagraph === index;
            const isPlaying = playingKey === key;

            return (
              <div
                key={index}
                className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl p-6"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 font-bold text-white">
                    {index + 1}
                  </div>
                  <p className="text-white/90 leading-relaxed flex-1">{paragraph}</p>
                </div>

                <div className="flex items-center gap-3 ml-12">
                  {!isCurrentlyRecording && !recording && (
                    <button
                      onClick={() => startRecording(index)}
                      disabled={isRecording}
                      className="px-4 py-2 rounded-xl bg-red-500/80 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all flex items-center gap-2"
                    >
                      <Mic className="w-4 h-4" />
                      Record
                    </button>
                  )}

                  {isCurrentlyRecording && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-red-400">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="font-mono font-bold">{formatTime(recordingTime)}</span>
                      </div>
                      <button
                        onClick={stopRecording}
                        className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-sm transition-all flex items-center gap-2"
                      >
                        <Square className="w-4 h-4" />
                        Stop
                      </button>
                    </div>
                  )}

                  {recording && !isCurrentlyRecording && (
                    <>
                      <button
                        onClick={() => playRecording(selectedStory.id, index)}
                        className="px-4 py-2 rounded-xl bg-green-500/80 hover:bg-green-500 text-white font-semibold text-sm transition-all flex items-center gap-2"
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-4 h-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Play
                          </>
                        )}
                      </button>
                      <span className="text-white/60 text-sm">
                        {formatTime(recording.duration)}
                      </span>
                      <button
                        onClick={() => startRecording(index)}
                        disabled={isRecording}
                        className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-50 text-white font-semibold text-sm transition-all flex items-center gap-2"
                      >
                        <Mic className="w-4 h-4" />
                        Re-record
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
