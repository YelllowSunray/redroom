# Apple Music Integration

This app uses Apple Music (via the iTunes Search API) to allow users to search for and attach songs to their photos.

## Features

- **Search for Songs**: Search for any song using the iTunes catalog
- **30-Second Previews**: Attach 30-second preview clips to photos
- **Sing Along Mode**: Record yourself singing along with your favorite tracks
- **No Authentication Required**: The iTunes Search API is free and doesn't require any setup

## How It Works

### iTunes Search API

The app uses Apple's free [iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html) which:

- Requires no authentication or API keys
- Provides access to millions of tracks
- Returns 30-second preview URLs for most songs
- Is completely free to use

### Implementation

1. **Search**: Users can search for songs by title, artist, or album
2. **Preview**: Each song includes a 30-second preview URL
3. **Attach**: The preview URL is saved with the photo (no upload needed)
4. **Play**: When viewing photos, the preview plays directly from Apple's servers

### API Endpoints

- **Search Endpoint**: `/api/apple-music/search`
  - Query parameter: `q` (search query)
  - Returns: Array of tracks with preview URLs

## Technical Details

### Library

The Apple Music integration is handled by `app/lib/appleMusic.ts` which:

- Makes requests to the iTunes Search API
- Filters results to only include tracks with preview URLs
- Returns formatted track data including artwork and metadata

### Components

- **AppleMusicSearch**: Search interface for finding songs
- **SingAlongRecorder**: Records user singing along with a selected track

## Limitations

- Preview clips are limited to 30 seconds
- Not all songs have preview URLs available (especially older or region-restricted content)
- No offline playback capability

## Alternative: Full Apple Music Integration

For a production app with full Apple Music features, you could implement:

- **MusicKit JS**: Apple's official JavaScript API
- **Apple Music API**: Requires Apple Developer account and user authentication
- **Full Songs**: Access to complete tracks (requires Apple Music subscription)

However, for most use cases, the free iTunes Search API provides sufficient functionality without the complexity of authentication.

