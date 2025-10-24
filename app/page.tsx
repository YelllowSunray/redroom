'use client';

import { useState } from 'react';
import PhotoCard from './components/PhotoCard';
import UploadModal from './components/UploadModal';
import { Photo, AudioAttachment } from './types';

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleUpload = (imageUrl: string, audio?: AudioAttachment, description?: string) => {
    const newPhoto: Photo = {
      id: Date.now().toString(),
      imageUrl,
      audio,
      description,
      uploadedAt: new Date(),
    };
    setPhotos([newPhoto, ...photos]);
  };

  const handleDelete = (id: string) => {
    setPhotos(photos.filter(photo => photo.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#1a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-b from-[#1a0a0a] via-[#1a0a0a] to-transparent backdrop-blur-sm border-b border-red-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center dark-room-glow">
                <span className="text-xl">📷</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-red-100">Dark Room</h1>
                <p className="text-sm text-red-400/70">Develop your memories</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-500 hover:to-red-600 transition-all shadow-lg hover:shadow-red-600/50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Photo
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-900/20 to-red-950/20 flex items-center justify-center mb-6 dark-room-glow">
              <svg className="w-16 h-16 text-red-700/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-red-200 mb-3">
              Your Dark Room is Empty
            </h2>
            <p className="text-red-400/70 mb-8 max-w-md">
              Start developing your memories by uploading photos with audio attachments. 
              Add songs or record personal messages to bring your photos to life.
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-500 hover:to-red-600 transition-all shadow-lg hover:shadow-red-600/50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload Your First Photo
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-8 flex gap-6 text-sm">
              <div className="flex items-center gap-2 text-red-300/70">
                <span className="text-lg">📷</span>
                <span>{photos.length} {photos.length === 1 ? 'photo' : 'photos'}</span>
              </div>
              <div className="flex items-center gap-2 text-red-300/70">
                <span className="text-lg">♪</span>
                <span>{photos.filter(p => p.audio?.type === 'song').length} songs</span>
              </div>
              <div className="flex items-center gap-2 text-red-300/70">
                <span className="text-lg">🎙️</span>
                <span>{photos.filter(p => p.audio?.type === 'recording').length} recordings</span>
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map(photo => (
                <PhotoCard 
                  key={photo.id} 
                  photo={photo}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      {/* Footer */}
      <footer className="mt-20 border-t border-red-900/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-red-400/50 text-sm">
          <p>Developed with ❤️ in the dark room</p>
        </div>
      </footer>
    </div>
  );
}
