// Types for the photo sharing app

export interface AudioAttachment {
  type: 'song' | 'recording' | 'singalong';
  url: string;
  name: string;
  duration?: number;
  // For singalong: the original Spotify track URL
  originalTrackUrl?: string;
}

export interface Photo {
  id: string;
  userId: string;
  imageUrl: string;
  audio?: AudioAttachment;
  uploadedAt: Date;
  description?: string;
}

