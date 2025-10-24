'use client';

import { useState, useRef } from 'react';
import { AudioAttachment } from '../types';
import AudioRecorder from './AudioRecorder';
import Camera from './Camera';
import SpotifySearch from './SpotifySearch';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (imageUrl: string, audio?: AudioAttachment, description?: string) => void;
}

export default function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageMode, setImageMode] = useState<'none' | 'upload' | 'camera'>('none');
  const [description, setDescription] = useState('');
  const [audioMode, setAudioMode] = useState<'none' | 'upload' | 'record' | 'spotify'>('none');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<{ blob: Blob; duration: number } | null>(null);
  const [spotifyTrack, setSpotifyTrack] = useState<{ name: string; artists: string; previewUrl: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageMode('none');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (imageDataUrl: string) => {
    setImagePreview(imageDataUrl);
    // Convert data URL to File for consistency
    fetch(imageDataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setImageFile(file);
      });
    setImageMode('none');
  };

  const handleSpotifySelect = (track: { name: string; artists: string; previewUrl: string }) => {
    setSpotifyTrack(track);
    setAudioFile(null);
    setRecordedAudio(null);
    setAudioMode('none');
  };

  const handleAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setRecordedAudio(null);
    }
  };

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    setRecordedAudio({ blob, duration });
    setAudioFile(null);
    setSpotifyTrack(null);
    setAudioMode('none');
  };

  const handleUpload = async () => {
    if (!imageFile) return;

    setIsUploading(true);

    try {
      // Create object URLs for the files (in a real app, you'd upload to a server)
      const imageUrl = URL.createObjectURL(imageFile);
      
      let audio: AudioAttachment | undefined;
      
      if (audioFile) {
        audio = {
          type: 'song',
          url: URL.createObjectURL(audioFile),
          name: audioFile.name,
        };
      } else if (recordedAudio) {
        audio = {
          type: 'recording',
          url: URL.createObjectURL(recordedAudio.blob),
          name: `Recording ${new Date().toLocaleTimeString()}`,
          duration: recordedAudio.duration,
        };
      } else if (spotifyTrack) {
        audio = {
          type: 'song',
          url: spotifyTrack.previewUrl,
          name: `${spotifyTrack.name} - ${spotifyTrack.artists}`,
        };
      }

      onUpload(imageUrl, audio, description || undefined);
      
      // Reset form
      setImagePreview(null);
      setImageFile(null);
      setImageMode('none');
      setDescription('');
      setAudioMode('none');
      setAudioFile(null);
      setRecordedAudio(null);
      setSpotifyTrack(null);
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setImagePreview(null);
      setImageFile(null);
      setImageMode('none');
      setDescription('');
      setAudioMode('none');
      setAudioFile(null);
      setRecordedAudio(null);
      setSpotifyTrack(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#2a0a0a] to-[#1a0505] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-red-900/30 dark-room-glow">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a0505]/95 backdrop-blur-sm border-b border-red-900/30 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-red-100">Develop Your Photo</h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-red-300 hover:text-red-100 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image Upload/Camera */}
          <div>
            <label className="block text-sm font-medium text-red-200 mb-3">
              Photo *
            </label>

            {!imagePreview && imageMode === 'none' && (
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 px-4 py-3 rounded-lg border border-red-900/50 bg-red-950/30 text-red-300 hover:border-red-700/50 hover:bg-red-950/50 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Photo
                </button>
                <button
                  onClick={() => setImageMode('camera')}
                  className="flex-1 px-4 py-3 rounded-lg border border-red-900/50 bg-red-950/30 text-red-300 hover:border-red-700/50 hover:bg-red-950/50 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Take Photo
                </button>
              </div>
            )}

            {imageMode === 'camera' && (
              <Camera
                onCapture={handleCameraCapture}
                onCancel={() => setImageMode('none')}
              />
            )}

            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl border border-red-900/30"
                />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className="absolute top-3 right-3 bg-red-900/90 backdrop-blur-sm p-2 rounded-full text-red-100 hover:bg-red-800 transition-all"
                  aria-label="Remove image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-red-200 mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a caption to your photo..."
              className="w-full px-4 py-3 bg-red-950/30 border border-red-900/50 rounded-lg text-red-100 placeholder-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Audio Options */}
          <div>
            <label className="block text-sm font-medium text-red-200 mb-3">
              Audio Attachment (optional)
            </label>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => setAudioMode('spotify')}
                className={`px-3 py-2.5 rounded-lg border transition-all text-sm ${
                  audioMode === 'spotify'
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-red-950/30 border-red-900/50 text-red-300 hover:border-red-700/50'
                }`}
              >
                <span className="text-base mr-1">🎵</span>
                Spotify
              </button>
              <button
                onClick={() => setAudioMode('upload')}
                className={`px-3 py-2.5 rounded-lg border transition-all text-sm ${
                  audioMode === 'upload'
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-red-950/30 border-red-900/50 text-red-300 hover:border-red-700/50'
                }`}
              >
                <span className="text-base mr-1">♪</span>
                Upload
              </button>
              <button
                onClick={() => setAudioMode('record')}
                className={`px-3 py-2.5 rounded-lg border transition-all text-sm ${
                  audioMode === 'record'
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-red-950/30 border-red-900/50 text-red-300 hover:border-red-700/50'
                }`}
              >
                <span className="text-base mr-1">🎙️</span>
                Record
              </button>
            </div>

            {/* Upload Song */}
            {audioMode === 'upload' && (
              <div>
                <button
                  onClick={() => audioInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-red-800/50 rounded-lg hover:border-red-600/50 transition-all bg-red-950/20 text-red-300 hover:text-red-200"
                >
                  {audioFile ? (
                    <span>♪ {audioFile.name}</span>
                  ) : (
                    <span>Click to select an audio file</span>
                  )}
                </button>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileSelect}
                  className="hidden"
                />
              </div>
            )}

            {/* Record Audio */}
            {audioMode === 'record' && (
              <AudioRecorder
                onRecordingComplete={handleRecordingComplete}
                onCancel={() => setAudioMode('none')}
              />
            )}

            {/* Spotify Search */}
            {audioMode === 'spotify' && (
              <SpotifySearch
                onSelect={handleSpotifySelect}
                onCancel={() => setAudioMode('none')}
              />
            )}

            {/* Show attached audio/recording/spotify */}
            {(audioFile || recordedAudio || spotifyTrack) && audioMode === 'none' && (
              <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg flex items-center justify-between">
                <span className="text-red-200">
                  {audioFile && `♪ ${audioFile.name}`}
                  {recordedAudio && '🎙️ Voice Recording'}
                  {spotifyTrack && `🎵 ${spotifyTrack.name} - ${spotifyTrack.artists}`}
                </span>
                <button
                  onClick={() => {
                    setAudioFile(null);
                    setRecordedAudio(null);
                    setSpotifyTrack(null);
                  }}
                  className="text-red-400 hover:text-red-200 transition-colors"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="flex-1 px-6 py-3 rounded-full bg-red-950/50 text-red-300 hover:bg-red-950 transition-all border border-red-900/30 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!imageFile || isUploading}
              className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-500 hover:to-red-600 transition-all shadow-lg hover:shadow-red-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Developing...' : 'Develop Photo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

