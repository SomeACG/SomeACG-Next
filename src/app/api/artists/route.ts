import { getPopularArtists } from '@/lib/imageService';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const sortBy = (searchParams.get('sortBy') as 'artworks' | 'random') || 'artworks';

  try {
    const data = await getPopularArtists(page, pageSize, sortBy);
    return NextResponse.json(data);
  } catch (error) {
    console.error('获取热门画师失败:', error);
    return NextResponse.json({ error: '获取热门画师失败' }, { status: 500 });
  }
}
