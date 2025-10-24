'use client';

import { useState, useEffect } from 'react';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: string;
  album: string;
  albumArt: string;
  previewUrl: string | null;
  duration: number;
}

interface SpotifySearchProps {
  onSelect: (track: { name: string; artists: string; previewUrl: string }) => void;
  onCancel: () => void;
}

export default function SpotifySearch({ onSelect, onCancel }: SpotifySearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setTracks([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchTracks();
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const searchTracks = async () => {
    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to search');
      }

      setTracks(data.tracks);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search tracks');
      setTracks([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectTrack = (track: SpotifyTrack) => {
    if (!track.previewUrl) {
      setError('This track does not have a preview available. Please select a different track.');
      return;
    }
    setError(null);
    setSelectedTrack(track);
  };

  const handleConfirm = () => {
    if (selectedTrack?.previewUrl) {
      onSelect({
        name: selectedTrack.name,
        artists: selectedTrack.artists,
        previewUrl: selectedTrack.previewUrl,
      });
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-[#2a0a0a] to-[#1a0505] rounded-xl p-6 border border-red-900/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl">🎵</div>
        <div>
          <h3 className="text-lg font-semibold text-red-100">Spotify Search</h3>
          <p className="text-xs text-red-400/70">Search for a song to attach to your photo</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-200 text-sm">
          {error}
          {error.includes('not configured') && (
            <div className="mt-2 text-xs">
              <p>To set up Spotify integration:</p>
              <ol className="list-decimal ml-4 mt-1 space-y-1">
                <li>Go to <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Spotify Developer Dashboard</a></li>
                <li>Create an app and get your credentials</li>
                <li>Add them to your .env.local file</li>
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Search input */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for a song or artist..."
        className="w-full px-4 py-2.5 mb-4 bg-red-950/50 border border-red-900/50 rounded-lg text-red-100 placeholder-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-transparent"
        autoFocus
      />

      {/* Results */}
      <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
        {isSearching && (
          <div className="text-center py-8 text-red-400/70">
            <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-2" />
            Searching...
          </div>
        )}

        {!isSearching && searchQuery.length >= 2 && tracks.length === 0 && !error && (
          <div className="text-center py-8 text-red-400/70">
            <div className="text-lg mb-2">🎵</div>
            <div className="font-medium mb-1">No results found</div>
            <div className="text-sm opacity-70">
              Try a different search term
            </div>
          </div>
        )}

        {!isSearching && tracks.length > 0 && !tracks.some(t => t.previewUrl) && (
          <div className="mb-3 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg text-yellow-200/90 text-sm">
            ⚠️ None of these tracks have previews available. Try searching for a more popular song.
          </div>
        )}

        {tracks.map((track) => (
          <button
            key={track.id}
            onClick={() => handleSelectTrack(track)}
            disabled={!track.previewUrl}
            className={`w-full p-3 rounded-lg transition-all text-left flex items-center gap-3 ${
              selectedTrack?.id === track.id
                ? 'bg-red-600 border-red-500 text-white'
                : track.previewUrl
                ? 'bg-red-950/30 border border-red-900/50 text-red-200 hover:bg-red-950/50 hover:border-red-700/50'
                : 'bg-red-950/20 border border-red-900/30 text-red-400/40 cursor-not-allowed'
            }`}
          >
            {track.albumArt && (
              <img
                src={track.albumArt}
                alt={track.album}
                className={`w-12 h-12 rounded object-cover flex-shrink-0 ${!track.previewUrl ? 'opacity-40' : ''}`}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{track.name}</div>
              <div className="text-sm opacity-70 truncate">{track.artists}</div>
            </div>
            <div className="text-xs opacity-70 flex-shrink-0">
              {track.previewUrl ? formatDuration(track.duration) : '❌ No preview'}
            </div>
          </button>
        ))}
      </div>

      {searchQuery.length < 2 && tracks.length === 0 && (
        <div className="text-center py-8 text-red-400/70 text-sm">
          Type at least 2 characters to start searching
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 px-6 py-2.5 rounded-full bg-red-950/50 text-red-300 hover:bg-red-950 transition-all border border-red-900/30"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedTrack}
          className="flex-1 px-6 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:from-red-500 hover:to-red-600 transition-all shadow-lg hover:shadow-red-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Attach Song
        </button>
      </div>
    </div>
  );
}

