// Firebase Storage utilities for uploading and managing files
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload an image file to Firebase Storage
 * @param file - The image file to upload
 * @param userId - The user ID (to organize files by user)
 * @returns The download URL of the uploaded image
 */
export async function uploadImage(file: File, userId: string): Promise<string> {
  const timestamp = Date.now();
  const fileName = `images/${userId}/${timestamp}_${file.name}`;
  const storageRef = ref(storage, fileName);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
}

/**
 * Upload an audio file to Firebase Storage
 * @param blob - The audio blob to upload
 * @param userId - The user ID
 * @param fileName - Optional custom file name
 * @returns The download URL of the uploaded audio
 */
export async function uploadAudio(
  blob: Blob,
  userId: string,
  fileName?: string
): Promise<string> {
  const timestamp = Date.now();
  const name = fileName || `recording_${timestamp}.webm`;
  const storagePath = `audio/${userId}/${timestamp}_${name}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, blob);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
}

/**
 * Delete a file from Firebase Storage
 * @param url - The download URL of the file to delete
 */
export async function deleteFile(url: string): Promise<void> {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    // File might not exist or already deleted, which is okay
  }
}

