import prisma from '@/lib/db';
import { NextResponse } from 'next/server';
import superjson from 'superjson';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const artwork = await prisma.images.findFirst({
      where: {
        id: parseInt(params.id),
      },
    });

    if (!artwork) {
      return NextResponse.json({ error: '未找到该作品' }, { status: 404 });
    }

    // 获取标签 - 确保 pid 是字符串类型
    const tags = await prisma.imagetags.findMany({
      where: {
        pid: artwork.pid?.toString(),
      },
      select: {
        tag: true,
      },
    });

    // 直接查询数据库看看是否有标签
    const allTags = await prisma.imagetags.findMany({
      take: 5,
      select: {
        pid: true,
        tag: true,
      },
    });
    // console.log('sample tags in database:', allTags);

    const artworkWithTags = {
      ...artwork,
      tags: tags.map((t) => t.tag).filter(Boolean),
    };

    // console.log('final artwork with tags:', artworkWithTags);

    // 使用 superjson 序列化数据
    const serialized = superjson.serialize(artworkWithTags);
    return NextResponse.json(serialized);
  } catch (error) {
    console.error('error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
