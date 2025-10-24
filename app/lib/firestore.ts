// Firestore utilities for managing photo data
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Photo, AudioAttachment } from '../types';

const PHOTOS_COLLECTION = 'photos';

interface FirestorePhoto {
  userId: string;
  imageUrl: string;
  audio?: AudioAttachment;
  description?: string;
  createdAt: Timestamp;
}

/**
 * Save a photo to Firestore
 */
export async function savePhoto(
  userId: string,
  imageUrl: string,
  audio?: AudioAttachment,
  description?: string
): Promise<string> {
  // Build the photo data object, only including fields that have values
  // Firestore doesn't accept undefined values
  const photoData: any = {
    userId,
    imageUrl,
    createdAt: Timestamp.now(),
  };

  // Only add optional fields if they have values
  if (audio) {
    photoData.audio = audio;
  }
  if (description) {
    photoData.description = description;
  }

  const docRef = await addDoc(collection(db, PHOTOS_COLLECTION), photoData);
  return docRef.id;
}

/**
 * Get all photos for a specific user
 */
export async function getUserPhotos(userId: string): Promise<Photo[]> {
  // Query without orderBy to avoid needing a composite index
  // We'll sort on the client side instead
  const photosQuery = query(
    collection(db, PHOTOS_COLLECTION),
    where('userId', '==', userId)
  );

  const querySnapshot = await getDocs(photosQuery);
  
  const photos: Photo[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data() as FirestorePhoto;
    photos.push({
      id: doc.id,
      userId: data.userId,
      imageUrl: data.imageUrl,
      audio: data.audio,
      description: data.description,
      uploadedAt: data.createdAt.toDate(),
    });
  });

  // Sort by date on the client side (newest first)
  photos.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

  return photos;
}

/**
 * Delete a photo from Firestore
 */
export async function deletePhoto(photoId: string): Promise<void> {
  await deleteDoc(doc(db, PHOTOS_COLLECTION, photoId));
}

/**
 * Save user profile to Firestore
 */
export async function saveUserProfile(
  userId: string,
  profile: { displayName: string; photoURL: string; age: string }
): Promise<void> {
  const userDocRef = doc(db, 'users', userId);
  await setDoc(userDocRef, profile, { merge: true });
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(
  userId: string
): Promise<{ displayName: string; photoURL: string; age: string } | null> {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  
  if (userDoc.exists()) {
    return userDoc.data() as { displayName: string; photoURL: string; age: string };
  }
  
  return null;
}

