import { NextRequest, NextResponse } from 'next/server';
import { searchEpisodes } from '@/lib/search';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

  const results = searchEpisodes(query, limit);

  return NextResponse.json({
    query,
    count: results.length,
    results,
  });
}
