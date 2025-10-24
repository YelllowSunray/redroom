'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Photo } from '../types';
import { deletePhoto, getUserProfile } from '../lib/firestore';
import { deleteFile } from '../lib/firebaseStorage';

interface PhotoCardProps {
  photo: Photo;
  onDelete?: (id: string) => Promise<void>;
}

export default function PhotoCard({ photo, onDelete }: PhotoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userProfile, setUserProfile] = useState<{ displayName: string; photoURL: string; age: string } | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const originalTrackRef = useRef<HTMLAudioElement>(null);

  // Fetch user profile
  useEffect(() => {
    const loadProfile = async () => {
      if (photo.userId) {
        const profile = await getUserProfile(photo.userId);
        setUserProfile(profile);
      }
    };
    loadProfile();
  }, [photo.userId]);

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
      // For singalong, also pause the original track
      if (photo.audio?.type === 'singalong' && originalTrackRef.current) {
        originalTrackRef.current.pause();
      }
    } else {
      audio.play();
      // For singalong, also play the original track
      if (photo.audio?.type === 'singalong' && originalTrackRef.current) {
        // Sync both to the same time
        originalTrackRef.current.currentTime = audio.currentTime;
        originalTrackRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    
    if (!confirm('Are you sure you want to delete this photo? This cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      // Delete from Firestore
      await deletePhoto(photo.id);
      
      // Delete image from Storage
      await deleteFile(photo.imageUrl);
      
      // Delete audio from Storage if it exists and isn't an external preview link
      if (photo.audio && photo.audio.type !== 'song' && !photo.audio.url.includes('apple.com') && !photo.audio.url.includes('itunes.apple.com')) {
        await deleteFile(photo.audio.url);
      }
      
      // Notify parent
      await onDelete(photo.id);
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo. Please try again.');
      setIsDeleting(false);
    }
  };

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
            {photo.audio.type === 'song' ? '♪' : photo.audio.type === 'singalong' ? '🎤' : '🎙️'}
            <span>{photo.audio.name}</span>
          </div>
        )}

        {/* Delete button */}
        {onDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="absolute top-3 left-3 bg-red-900/80 backdrop-blur-sm p-2 rounded-full text-red-100 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Delete photo"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        )}

        {/* Profile selfie overlay - bottom left */}
        {userProfile?.photoURL && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full pr-3 border-2 border-red-900/50">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-600/70">
              <Image
                src={userProfile.photoURL}
                alt={userProfile.displayName}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-xs">
              <div className="text-red-100 font-medium">{userProfile.displayName}</div>
              {userProfile.age && (
                <div className="text-red-300/70">{userProfile.age} years</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Audio player */}
      {photo.audio && (
        <div className="p-4 bg-[#1a0505]/80 backdrop-blur-sm border-t border-red-900/30">
          <audio ref={audioRef} src={photo.audio.url} />
          {/* For singalong, also load the original track */}
          {photo.audio.type === 'singalong' && photo.audio.originalTrackUrl && (
            <audio ref={originalTrackRef} src={photo.audio.originalTrackUrl} />
          )}
          
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

