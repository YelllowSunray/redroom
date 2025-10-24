'use client';

import { useState, useRef, useEffect } from 'react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
}

export default function AudioRecorder({ onRecordingComplete, onCancel }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setError(null);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Could not access microphone. Please grant permission.');
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleSave = () => {
    if (audioUrl && chunksRef.current.length > 0) {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      onRecordingComplete(blob, recordingTime);
    }
  };

  const handleRetry = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordingTime(0);
    chunksRef.current = [];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-[#2a0a0a] to-[#1a0505] rounded-xl p-6 border border-red-900/30">
      <h3 className="text-lg font-semibold text-red-100 mb-4 flex items-center gap-2">
        🎙️ Record Audio Message
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-6">
        {/* Recording visualization */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {isRecording && (
            <div className="absolute inset-0 rounded-full bg-red-600/20 animate-ping" />
          )}
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
            isRecording ? 'bg-red-600 pulse-red' : 'bg-red-900/50'
          } transition-all`}>
            {isRecording ? (
              <div className="flex gap-1.5">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 bg-white rounded-full"
                    style={{
                      height: `${30 + (Math.sin(Date.now() / 200 + i) * 15)}px`,
                      animation: 'pulse-red 0.5s ease-in-out infinite',
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <svg className="w-12 h-12 text-red-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
          </div>
        </div>

        {/* Timer */}
        <div className="text-3xl font-mono text-red-100">
          {formatTime(recordingTime)}
        </div>

        {/* Controls */}
        {!audioUrl ? (
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2.5 rounded-full bg-red-950/50 text-red-300 hover:bg-red-950 transition-all border border-red-900/30"
            >
              Cancel
            </button>
            
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="px-8 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-500 hover:to-red-600 transition-all shadow-lg hover:shadow-red-600/50"
              >
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="px-8 py-2.5 rounded-full bg-red-800 text-white font-medium hover:bg-red-700 transition-all shadow-lg"
              >
                Stop Recording
              </button>
            )}
          </div>
        ) : (
          <div className="w-full space-y-4">
            {/* Playback */}
            <audio ref={audioRef} src={audioUrl} controls className="w-full" />
            
            {/* Save or Retry */}
            <div className="flex gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 px-6 py-2.5 rounded-full bg-red-950/50 text-red-300 hover:bg-red-950 transition-all border border-red-900/30"
              >
                Record Again
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-8 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-500 hover:to-red-600 transition-all shadow-lg hover:shadow-red-600/50"
              >
                Use This Recording
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

