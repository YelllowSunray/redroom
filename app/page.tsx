'use client';

import { useState, useEffect } from 'react';
import PhotoCard from './components/PhotoCard';
import UploadModal from './components/UploadModal';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import { Photo } from './types';
import { useAuth } from './context/AuthContext';
import { getUserPhotos } from './lib/firestore';

export default function Home() {
  const { user, logOut, loading: authLoading } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // Load photos when user changes
  useEffect(() => {
    if (user) {
      loadPhotos();
    } else {
      setPhotos([]);
    }
  }, [user]);

  const loadPhotos = async () => {
    if (!user) return;
    
    setLoadingPhotos(true);
    try {
      const userPhotos = await getUserPhotos(user.uid);
      setPhotos(userPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleUploadSuccess = () => {
    loadPhotos(); // Reload photos after successful upload
  };

  const handleDelete = async (id: string) => {
    // This will be handled in PhotoCard
    loadPhotos(); // Reload photos after deletion
  };

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#1a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-red-300">Loading...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-red-100">Nude Dark Room</h1>
                <p className="text-sm text-red-400/70">
                  {user ? `Welcome, ${user.displayName || user.email}` : 'Develop your memories'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-500 hover:to-red-600 transition-all shadow-lg hover:shadow-red-600/50 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Photo
                  </button>
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="px-4 py-3 rounded-full bg-red-950/50 text-red-300 hover:bg-red-950 transition-all border border-red-900/30"
                    title="Edit Profile"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-3 rounded-full bg-red-950/50 text-red-300 hover:bg-red-950 transition-all border border-red-900/30"
                    title="Logout"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-500 hover:to-red-600 transition-all shadow-lg hover:shadow-red-600/50"
                >
                  Sign In / Sign Up
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!user ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-900/20 to-red-950/20 flex items-center justify-center mb-6 dark-room-glow">
              <svg className="w-16 h-16 text-red-700/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-red-200 mb-3">
              Welcome to Nude Dark Room
            </h2>
            <p className="text-red-400/70 mb-8 max-w-md">
              Create an account to start developing your memories with photos and audio.
              Your personal dark room awaits!
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-500 hover:to-red-600 transition-all shadow-lg hover:shadow-red-600/50"
            >
              Get Started
            </button>
          </div>
        ) : loadingPhotos ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-red-300">Loading your photos...</p>
            </div>
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-900/20 to-red-950/20 flex items-center justify-center mb-6 dark-room-glow">
              <svg className="w-16 h-16 text-red-700/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-red-200 mb-3">
              Your Nude Dark Room is Empty
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
        onSuccess={handleUploadSuccess}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
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
