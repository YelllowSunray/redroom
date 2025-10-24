// Types for the photo sharing app

export interface AudioAttachment {
  type: 'song' | 'recording' | 'singalong';
  url: string;
  name: string;
  duration?: number;
  // For singalong: the original music track URL
  originalTrackUrl?: string;
}

export interface Photo {
  id: string;
  userId: string;
  mediaType: 'image' | 'video';
  imageUrl: string; // Used for both images and videos (keeping name for backwards compatibility)
  videoUrl?: string; // Alias for imageUrl when mediaType is 'video'
  thumbnailUrl?: string; // Optional thumbnail for videos
  audio?: AudioAttachment;
  uploadedAt: Date;
  description?: string;
}

