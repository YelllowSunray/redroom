'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Photo } from '../types';

interface PhotoCardProps {
  photo: Photo;
  onDelete?: (id: string) => void;
}

export default function PhotoCard({ photo, onDelete }: PhotoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="group relative bg-gradient-to-br from-[#2a0a0a] to-[#1a0505] rounded-lg overflow-hidden border border-red-900/30 dark-room-glow hover:border-red-700/50 transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={photo.imageUrl}
          alt={photo.description || 'Photo'}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Overlay gradient for dark room effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-red-950/80 via-transparent to-transparent opacity-60" />
        
        {/* Audio indicator badge */}
        {photo.audio && (
          <div className="absolute top-3 right-3 bg-red-900/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-red-100 flex items-center gap-1.5 border border-red-700/50">
            {photo.audio.type === 'song' ? '♪' : '🎙️'}
            <span>{photo.audio.name}</span>
          </div>
        )}

        {/* Delete button */}
        {onDelete && (
          <button
            onClick={() => onDelete(photo.id)}
            className="absolute top-3 left-3 bg-red-900/80 backdrop-blur-sm p-2 rounded-full text-red-100 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-800"
            aria-label="Delete photo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Audio player */}
      {photo.audio && (
        <div className="p-4 bg-[#1a0505]/80 backdrop-blur-sm border-t border-red-900/30">
          <audio ref={audioRef} src={photo.audio.url} />
          
          <div className="flex items-center gap-3">
            {/* Play/Pause button */}
            <button
              onClick={togglePlay}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center hover:from-red-500 hover:to-red-700 transition-all shadow-lg hover:shadow-red-600/50"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Progress bar */}
            <div className="flex-1">
              <div className="h-1.5 bg-red-950/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-200"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-red-300/70 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playing animation */}
            {isPlaying && (
              <div className="flex items-end gap-0.5 h-5">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-red-500 rounded-full pulse-red"
                    style={{
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {photo.description && (
        <div className="px-4 pb-4 pt-2 text-sm text-red-200/80">
          {photo.description}
        </div>
      )}
    </div>
  );
}

