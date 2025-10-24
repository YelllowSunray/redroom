// Apple Music (iTunes) API integration utilities

const ITUNES_SEARCH_ENDPOINT = 'https://itunes.apple.com/search';

export interface AppleMusicTrack {
  id: string;
  name: string;
  artists: string;
  album: string;
  albumArt: string;
  previewUrl: string;
  duration: number;
}

/**
 * Search for tracks using iTunes Search API
 * Note: This API is free and doesn't require authentication
 */
export async function searchAppleMusicTracks(query: string): Promise<AppleMusicTrack[]> {
  const params = new URLSearchParams({
    term: query,
    media: 'music',
    entity: 'song',
    limit: '50', // Request many tracks
    country: 'US',
  });

  const response = await fetch(`${ITUNES_SEARCH_ENDPOINT}?${params}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to search Apple Music tracks');
  }

  const data = await response.json();

  // Map all tracks
  const allTracks = data.results.map((track: any) => ({
    id: track.trackId.toString(),
    name: track.trackName,
    artists: track.artistName,
    album: track.collectionName,
    albumArt: track.artworkUrl100.replace('100x100', '300x300'), // Get higher quality artwork
    previewUrl: track.previewUrl,
    duration: track.trackTimeMillis,
  }));

  // Filter to only show tracks with preview URLs
  const tracksWithPreviews = allTracks.filter((track: AppleMusicTrack) => track.previewUrl);
  
  // Return first 10 tracks with previews
  return tracksWithPreviews.slice(0, 10);
}

