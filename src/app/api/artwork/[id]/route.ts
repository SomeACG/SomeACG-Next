import prisma from '@/lib/db';
import { NextResponse } from 'next/server';
import superjson from 'superjson';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  console.log(`[Artwork API] 开始获取作品信息，ID: ${params.id}`);

  try {
    const artwork = await prisma.images.findFirst({
      where: {
        id: parseInt(params.id),
      },
    });

    if (!artwork) {
      console.log(`[Artwork API] 未找到ID为 ${params.id} 的作品`);
      return NextResponse.json({ error: '未找到该作品' }, { status: 404 });
    }

    console.log(`[Artwork API] 成功获取作品基本信息:`, {
      id: artwork.id,
      pid: artwork.pid,
      title: artwork.title,
    });

    // 获取标签 - 确保 pid 是字符串类型
    const tags = await prisma.imagetags.findMany({
      where: {
        pid: artwork.pid?.toString(),
      },
    });

    console.log(`[Artwork API] 获取到标签数量: ${tags.length}`);

    const artworkWithTags = {
      ...artwork,
      tags: tags.map((t) => t.tag).filter(Boolean),
    };

    console.log(`[Artwork API] 最终处理完成的作品数据:`, {
      id: artworkWithTags.id,
      title: artworkWithTags.title,
      tagsCount: artworkWithTags.tags.length,
    });

    // 使用 superjson 序列化数据
    const serialized = superjson.serialize(artworkWithTags);
    return NextResponse.json(serialized);
  } catch (error) {
    console.error('[Artwork API] 处理请求时发生错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
