// Types for the photo sharing app

export interface AudioAttachment {
  type: 'song' | 'recording';
  url: string;
  name: string;
  duration?: number;
}

export interface Photo {
  id: string;
  imageUrl: string;
  audio?: AudioAttachment;
  uploadedAt: Date;
  description?: string;
}

