import { NextRequest, NextResponse } from 'next/server';
import { searchAppleMusicTracks } from '@/app/lib/appleMusic';

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
    const tracks = await searchAppleMusicTracks(query);
    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Apple Music search error:', error);
    
    return NextResponse.json(
      { error: 'Failed to search Apple Music tracks' },
      { status: 500 }
    );
  }
}

