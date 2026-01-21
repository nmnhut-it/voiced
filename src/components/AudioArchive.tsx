import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Lock, Unlock, Calendar } from 'lucide-react';
import { AudioRecording } from '../types';
import { storage } from '../lib/storage';
import { isMessageUnlocked } from '../lib/ageCalculator';

export function AudioArchive() {
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showNewRecording, setShowNewRecording] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [unlocksAt, setUnlocksAt] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    const recs = await storage.getAudioRecordings();
    const sortedRecs = recs.sort((a, b) =>
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    );
    setRecordings(sortedRecs);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        setShowNewRecording(true);
      };

      mediaRecorder.start();
      setIsRecording(true);
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
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const saveRecording = async () => {
    if (audioChunksRef.current.length === 0 || !newTitle) return;

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

    const recording = {
      title: newTitle,
      description: newDescription,
      recordedAt: new Date().toISOString(),
      unlocksAt: unlocksAt || undefined,
      audioBlob,
      duration: recordingTime,
      isLocked: unlocksAt ? !isMessageUnlocked(unlocksAt) : false,
    };

    await storage.saveAudioRecording(recording);
    await loadRecordings();

    setNewTitle('');
    setNewDescription('');
    setUnlocksAt('');
    setRecordingTime(0);
    audioChunksRef.current = [];
    setShowNewRecording(false);
  };

  const cancelRecording = () => {
    audioChunksRef.current = [];
    setRecordingTime(0);
    setShowNewRecording(false);
    setNewTitle('');
    setNewDescription('');
    setUnlocksAt('');
  };

  const playRecording = (recording: AudioRecording) => {
    if (!isMessageUnlocked(recording.unlocksAt || '')) return;

    if (playingId === recording.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(URL.createObjectURL(recording.audioBlob));
      audioRef.current = audio;
      audio.play();
      setPlayingId(recording.id);

      audio.onended = () => {
        setPlayingId(null);
      };
    }
  };

  const deleteRecording = async (id: string) => {
    if (confirm('Delete this recording?')) {
      await storage.deleteAudioRecording(id);
      await loadRecordings();
      if (playingId === id) {
        audioRef.current?.pause();
        setPlayingId(null);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Audio Archive</h2>
          <p className="text-white/70">
            Record stories, messages, and memories for the future
          </p>
        </div>

        {!isRecording && !showNewRecording && (
          <button
            onClick={startRecording}
            className="w-full py-6 rounded-2xl backdrop-blur-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mb-8"
          >
            <Mic className="w-6 h-6" />
            Start Recording
          </button>
        )}

        {isRecording && (
          <div className="backdrop-blur-xl bg-red-500/20 border border-red-400/30 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                <span className="text-2xl font-mono text-white">
                  {formatTime(recordingTime)}
                </span>
              </div>
              <button
                onClick={stopRecording}
                className="px-8 py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all flex items-center gap-2"
              >
                <Square className="w-5 h-5" />
                Stop
              </button>
            </div>
          </div>
        )}

        {showNewRecording && (
          <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Save Recording</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="e.g., Bedtime Story: The Brave Dragon"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                  rows={3}
                  placeholder="Add notes about this recording..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Time Lock (Optional)
                </label>
                <input
                  type="date"
                  value={unlocksAt}
                  onChange={(e) => setUnlocksAt(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <p className="text-xs text-white/60 mt-2">
                  This recording will be locked until the selected date
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={saveRecording}
                  disabled={!newTitle}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-all"
                >
                  Save Recording
                </button>
                <button
                  onClick={cancelRecording}
                  className="px-6 py-3 rounded-xl backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {recordings.map((recording) => {
            const locked = recording.isLocked && !isMessageUnlocked(recording.unlocksAt || '');

            return (
              <div
                key={recording.id}
                className={`backdrop-blur-xl border rounded-2xl p-6 transition-all ${
                  locked
                    ? 'bg-white/10 border-white/20 opacity-60'
                    : 'bg-white/20 border-white/30 hover:bg-white/25'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {locked ? (
                        <Lock className="w-4 h-4 text-white/60" />
                      ) : (
                        <Unlock className="w-4 h-4 text-white/60" />
                      )}
                      <h3 className="text-lg font-bold text-white">
                        {recording.title}
                      </h3>
                    </div>
                    {recording.description && (
                      <p className="text-white/70 text-sm mb-2">
                        {recording.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      <span>
                        Recorded: {new Date(recording.recordedAt).toLocaleDateString()}
                      </span>
                      <span>{formatTime(recording.duration)}</span>
                      {recording.unlocksAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Unlocks: {new Date(recording.unlocksAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => playRecording(recording)}
                      disabled={locked}
                      className={`p-3 rounded-xl transition-all ${
                        locked
                          ? 'opacity-50 cursor-not-allowed bg-white/10'
                          : 'backdrop-blur-xl bg-white/20 hover:bg-white/30 border border-white/30'
                      }`}
                    >
                      {playingId === recording.id ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteRecording(recording.id)}
                      className="p-3 rounded-xl backdrop-blur-xl bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 transition-all"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {recordings.length === 0 && !isRecording && !showNewRecording && (
            <div className="text-center py-12 text-white/60">
              <Mic className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recordings yet. Start recording to create your first memory.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
