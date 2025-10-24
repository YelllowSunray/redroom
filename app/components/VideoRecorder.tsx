'use client';

import { useState, useRef, useEffect } from 'react';

interface VideoRecorderProps {
  onCapture: (videoBlob: Blob, videoDuration: number) => void;
  onCancel: () => void;
}

export default function VideoRecorder({ onCapture, onCancel }: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Request camera access on mount
    startCamera();
    
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      const errorMsg = err.name === 'NotAllowedError'
        ? '🚫 Camera/microphone access denied. Please allow access in your browser settings.'
        : err.name === 'NotFoundError'
        ? '📷 No camera or microphone found. Please connect a camera/microphone.'
        : err.name === 'NotReadableError'
        ? '⚠️ Camera/microphone is being used by another app.'
        : `Could not access camera: ${err.message}`;
      
      setError(errorMsg);
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = () => {
    if (!streamRef.current) {
      setError('Camera not available');
      return;
    }

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setVideoBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setHasRecording(true);
        setVideoDuration(recordingTime);
        
        // Show preview in video element
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = url;
        }
        
        stopCamera();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setError(null);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      setError(`Could not start recording: ${err.message}`);
      console.error('Error starting recording:', err);
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

  const handleRetry = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setVideoBlob(null);
    setRecordingTime(0);
    setHasRecording(false);
    setVideoDuration(0);
    chunksRef.current = [];
    startCamera();
  };

  const handleUse = () => {
    if (videoBlob) {
      onCapture(videoBlob, videoDuration);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Video preview/recording */}
      <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isRecording}
          controls={hasRecording}
          className="w-full h-full object-cover"
        />
        
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-full">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-white font-mono text-sm">{formatTime(recordingTime)}</span>
          </div>
        )}
      </div>

      {/* Controls */}
      {!hasRecording ? (
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-2.5 rounded-full bg-red-950/50 text-red-300 hover:bg-red-950 transition-all border border-red-900/30"
          >
            Cancel
          </button>
          
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={!!error}
              className="flex-1 px-8 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-500 hover:to-red-600 transition-all shadow-lg hover:shadow-red-600/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>🎥</span>
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex-1 px-8 py-2.5 rounded-full bg-red-800 text-white font-medium hover:bg-red-700 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>⏹</span>
              Stop Recording
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-center text-sm text-green-400">
            ✅ Video recorded! ({formatTime(videoDuration)})
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 px-6 py-2.5 rounded-full bg-red-950/50 text-red-300 hover:bg-red-950 transition-all border border-red-900/30"
            >
              Record Again
            </button>
            <button
              onClick={handleUse}
              className="flex-1 px-8 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-500 hover:to-red-600 transition-all shadow-lg hover:shadow-red-600/50"
            >
              Use This Video
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

