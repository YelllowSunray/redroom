'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { uploadImage } from '../lib/firebaseStorage';
import { saveUserProfile, getUserProfile } from '../lib/firestore';
import Camera from './Camera';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserProfile {
  displayName: string;
  photoURL: string;
  age: string;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadProfile();
    }
  }, [isOpen, user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const profile = await getUserProfile(user.uid);
      if (profile) {
        setDisplayName(profile.displayName || user.displayName || '');
        setAge(profile.age || '');
        setPhotoPreview(profile.photoURL || user.photoURL || null);
      } else {
        // Use existing Firebase Auth data as defaults
        setDisplayName(user.displayName || '');
        setPhotoPreview(user.photoURL || null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Fallback to Firebase Auth data
      setDisplayName(user.displayName || '');
      setPhotoPreview(user.photoURL || null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (imageDataUrl: string) => {
    setPhotoPreview(imageDataUrl);
    // Convert data URL to File for upload
    fetch(imageDataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setPhotoFile(file);
      });
    setShowCamera(false);
  };

  const handleSave = async () => {
    if (!user || !displayName.trim()) {
      alert('Please enter your name');
      return;
    }

    setIsSaving(true);
    try {
      let photoURL = photoPreview;

      // Upload new photo if selected
      if (photoFile) {
        photoURL = await uploadImage(photoFile, user.uid);
      }

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: displayName.trim(),
        photoURL: photoURL || undefined,
      });

      // Save to Firestore
      await saveUserProfile(user.uid, {
        displayName: displayName.trim(),
        photoURL: photoURL || '',
        age: age.trim(),
      });

      alert('Profile updated successfully! 🎉');
      onClose();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to save profile. ';
      
      if (error?.code === 'permission-denied') {
        errorMessage += 'Permission denied. Please check your Firebase Firestore security rules allow writes to /users/{userId}. See FIREBASE_SETUP.md Step 6.';
      } else if (error?.message?.includes('Missing or insufficient permissions')) {
        errorMessage += 'Missing permissions. Please update your Firestore security rules. See FIREBASE_SETUP.md Step 6.';
      } else if (error?.message?.includes('Firestore') || error?.message?.includes('firestore')) {
        errorMessage += 'Firestore error. Make sure Firestore is enabled in your Firebase Console. See FIREBASE_SETUP.md';
      } else {
        errorMessage += 'Please check the browser console for details and try again.';
      }
      
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#2a0a0a] to-[#1a0505] rounded-2xl max-w-md w-full border border-red-900/30 dark-room-glow max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-red-900/30 p-6 flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-bold text-red-100">Your Profile</h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-2 rounded-full bg-red-950/50 text-red-300 hover:bg-red-600 hover:text-white transition-all border border-red-900/30 disabled:opacity-50 flex items-center gap-2"
            aria-label="Close"
            title="Exit Profile"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Profile Photo */}
              <div className="flex flex-col items-center">
                {!showCamera ? (
                  <>
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-red-950/30 border-4 border-red-900/50 flex items-center justify-center">
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-16 h-16 text-red-700/50" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        )}
                      </div>
                    </div>
                    
                    {/* Upload/Camera buttons */}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-lg bg-red-950/50 text-red-300 hover:bg-red-950 transition-all border border-red-900/30 flex items-center gap-2 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload
                      </button>
                      <button
                        onClick={() => setShowCamera(true)}
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg flex items-center gap-2 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Take Selfie
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </>
                ) : (
                  <div className="w-full">
                    <Camera
                      onCapture={handleCameraCapture}
                      onCancel={() => setShowCamera(false)}
                    />
                  </div>
                )}
              </div>

              {/* Show form only when camera is not active */}
              {!showCamera && (
                <>
                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-red-200 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-3 bg-red-950/30 border border-red-900/50 rounded-lg text-red-100 placeholder-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-transparent"
                      maxLength={50}
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-red-200 mb-2">
                      Age (optional)
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Your age"
                      min="1"
                      max="120"
                      className="w-full px-4 py-3 bg-red-950/30 border border-red-900/50 rounded-lg text-red-100 placeholder-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-transparent"
                    />
                  </div>

                  {/* Email (read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-red-200 mb-2">
                      Email
                    </label>
                    <div className="px-4 py-3 bg-red-950/20 border border-red-900/30 rounded-lg text-red-300/70">
                      {user?.email}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={onClose}
                      disabled={isSaving}
                      className="flex-1 px-6 py-3 rounded-full bg-red-950/50 text-red-300 hover:bg-red-950 transition-all border border-red-900/30 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !displayName.trim()}
                      className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-500 hover:to-red-600 transition-all shadow-lg hover:shadow-red-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

