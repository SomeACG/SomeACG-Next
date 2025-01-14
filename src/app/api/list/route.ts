import { getPaginatedImages } from '@/lib/imageService';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');

  try {
    const data = await getPaginatedImages(page, pageSize);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: '获取图片列表失败' }, { status: 500 });
  }
}
