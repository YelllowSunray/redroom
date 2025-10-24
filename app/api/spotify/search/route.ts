import { NextRequest, NextResponse } from 'next/server';
import { searchSpotifyTracks } from '@/app/lib/spotify';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const tracks = await searchSpotifyTracks(query);
    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Spotify search error:', error);
    
    // Check if it's a credentials error
    if (error instanceof Error && error.message.includes('credentials not configured')) {
      return NextResponse.json(
        { 
          error: 'Spotify API not configured',
          message: 'Please add Spotify credentials to .env.local file. See .env.local.example for details.'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to search Spotify tracks' },
      { status: 500 }
    );
  }
}

