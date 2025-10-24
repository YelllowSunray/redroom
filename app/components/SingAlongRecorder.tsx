'use client';

import { useState, useRef, useEffect } from 'react';

interface SingAlongRecorderProps {
  trackName: string;
  trackArtists: string;
  trackPreviewUrl: string;
  onRecordingComplete: (audioBlob: Blob, duration: number, originalTrackUrl: string) => void;
  onCancel: () => void;
}

export default function SingAlongRecorder({ 
  trackName, 
  trackArtists, 
  trackPreviewUrl, 
  onRecordingComplete, 
  onCancel 
}: SingAlongRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const trackAudioRef = useRef<HTMLAudioElement>(null);
  const recordingAudioRef = useRef<HTMLAudioElement>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    };
  }, [recordingUrl]);

  const startRecording = async () => {
    try {
      // Get microphone access
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
        setRecordingUrl(url);
        setHasRecording(true);
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setError(null);

      // Start playing the track
      if (trackAudioRef.current) {
        trackAudioRef.current.currentTime = 0;
        trackAudioRef.current.play();
      }

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      const errorMsg = err.name === 'NotAllowedError' 
        ? '🚫 Microphone access denied. Click the lock icon in your address bar and allow microphone access.'
        : err.name === 'NotFoundError'
        ? '🎤 No microphone found. Please connect a microphone to your computer.'
        : err.name === 'NotReadableError'
        ? '⚠️ Microphone is being used by another app. Close other apps using your mic.'
        : `Could not access microphone: ${err.message}`;
      
      setError(errorMsg);
      console.error('Error accessing microphone:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop the track
      if (trackAudioRef.current) {
        trackAudioRef.current.pause();
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playBoth = () => {
    if (trackAudioRef.current && recordingAudioRef.current && recordingUrl) {
      // Sync both to start from beginning
      trackAudioRef.current.currentTime = 0;
      recordingAudioRef.current.currentTime = 0;
      
      // Play both simultaneously
      trackAudioRef.current.play();
      recordingAudioRef.current.play();
      setIsPlaying(true);

      // Set up ended handler
      const handleEnded = () => {
        setIsPlaying(false);
        trackAudioRef.current?.pause();
        recordingAudioRef.current?.pause();
      };

      trackAudioRef.current.onended = handleEnded;
      recordingAudioRef.current.onended = handleEnded;
    }
  };

  const pauseBoth = () => {
    if (trackAudioRef.current && recordingAudioRef.current) {
      trackAudioRef.current.pause();
      recordingAudioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSave = () => {
    if (recordingUrl && chunksRef.current.length > 0) {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      onRecordingComplete(blob, recordingTime, trackPreviewUrl);
    }
  };

  const handleRetry = () => {
    if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    setRecordingUrl(null);
    setRecordingTime(0);
    setHasRecording(false);
    chunksRef.current = [];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-[#2a0a0a] to-[#1a0505] rounded-xl p-6 border border-red-900/30">
      {/* Hidden audio elements */}
      <audio ref={trackAudioRef} src={trackPreviewUrl} />
      {recordingUrl && <audio ref={recordingAudioRef} src={recordingUrl} />}

      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl">🎤</div>
        <div>
          <h3 className="text-lg font-semibold text-red-100">Sing Along Mode</h3>
          <p className="text-xs text-red-400/70">Record yourself singing with the track</p>
        </div>
      </div>

      {/* Track info */}
      <div className="mb-4 p-3 bg-red-950/30 rounded-lg border border-red-900/30">
        <div className="text-sm text-red-200 font-medium">{trackName}</div>
        <div className="text-xs text-red-400/70">{trackArtists}</div>
      </div>

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
            isRecording ? 'bg-red-600 pulse-red' : hasRecording ? 'bg-green-600' : 'bg-red-900/50'
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
            ) : hasRecording ? (
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
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

        {/* Instructions */}
        {!hasRecording && !isRecording && (
          <div className="text-sm text-red-300/70 text-center max-w-sm">
            Click "Start Singing" and the track will play while recording your voice. 
            You'll be able to hear both together after recording!
          </div>
        )}

        {/* Controls */}
        {!hasRecording ? (
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
                className="px-8 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-500 hover:to-red-600 transition-all shadow-lg hover:shadow-red-600/50 flex items-center gap-2"
              >
                <span>🎤</span>
                Start Singing
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
            {/* Playback controls */}
            <div className="text-center mb-2">
              <p className="text-sm text-green-400 mb-3 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                Recording complete! Listen to your performance:
              </p>
              <button
                onClick={isPlaying ? pauseBoth : playBoth}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg flex items-center gap-2 mx-auto"
              >
                {isPlaying ? (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                    Pause
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Play Both (Music + Voice)
                  </>
                )}
              </button>
            </div>
            
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

