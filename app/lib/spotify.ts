// Spotify API integration utilities

const SPOTIFY_TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const SPOTIFY_SEARCH_ENDPOINT = 'https://api.spotify.com/v1/search';

let cachedToken: { access_token: string; expires_at: number } | null = null;

/**
 * Get Spotify access token using Client Credentials flow
 * Note: This is a server-side only function
 */
export async function getSpotifyAccessToken(): Promise<string> {
  // Check if we have a cached valid token
  if (cachedToken && cachedToken.expires_at > Date.now()) {
    return cachedToken.access_token;
  }

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured. Please add them to .env.local');
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get Spotify access token');
  }

  const data = await response.json();
  
  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in - 60) * 1000, // Subtract 60s for safety
  };

  return data.access_token;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string;
  album: string;
  albumArt: string;
  previewUrl: string | null;
  duration: number;
}

/**
 * Search for tracks on Spotify
 */
export async function searchSpotifyTracks(query: string): Promise<SpotifyTrack[]> {
  const accessToken = await getSpotifyAccessToken();

  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: '10',
  });

  const response = await fetch(`${SPOTIFY_SEARCH_ENDPOINT}?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to search Spotify tracks');
  }

  const data = await response.json();

  return data.tracks.items.map((track: any) => ({
    id: track.id,
    name: track.name,
    artists: track.artists.map((a: any) => a.name).join(', '),
    album: track.album.name,
    albumArt: track.album.images[0]?.url || '',
    previewUrl: track.preview_url,
    duration: track.duration_ms,
  }));
}

