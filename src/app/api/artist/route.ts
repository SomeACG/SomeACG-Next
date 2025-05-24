import { getArtistImages, getArtistInfo } from '@/lib/imageService';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform');
  const authorid = searchParams.get('authorid');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '24');
  const infoOnly = searchParams.get('infoOnly') === 'true';

  if (!platform || !authorid) {
    return NextResponse.json({ error: '缺少必要参数 platform 或 authorid' }, { status: 400 });
  }

  try {
    if (infoOnly) {
      // 只获取画师信息
      const artistInfo = await getArtistInfo(platform, authorid);
      if (!artistInfo) {
        return NextResponse.json({ error: '未找到该画师' }, { status: 404 });
      }
      return NextResponse.json(artistInfo);
    } else {
      // 获取画师作品
      const data = await getArtistImages(platform, authorid, page, pageSize);
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('获取画师数据失败:', error);
    return NextResponse.json({ error: '获取画师数据失败' }, { status: 500 });
  }
}
