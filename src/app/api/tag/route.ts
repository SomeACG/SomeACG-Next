import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

// 处理 BigInt 序列化
const serialize = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj, (_, value) => (typeof value === 'bigint' ? value.toString() : value)));
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get('tag');
  const start = parseInt(searchParams.get('start') || '0');
  const limit = parseInt(searchParams.get('limit') || '32');

  if (!tag) {
    return NextResponse.json({ error: '标签参数缺失' }, { status: 400 });
  }

  try {
    const searchTag = tag.toLowerCase();
    const pids = await prisma.imageTag.findMany({
      where: {
        tag: {
          contains: searchTag,
          mode: 'insensitive',
        },
      },
      select: { pid: true, tag: true },
    });

    // 过滤掉不匹配的标签（确保标签内容完全匹配，只是前面的#符号可能不同）
    const filteredPids = pids
      .filter(({ tag }) => tag?.toLowerCase().replace(/^#+/, '') === searchTag)
      .map((t) => t.pid)
      .filter((pid): pid is string => pid !== null);

    const images = await prisma.image.findMany({
      where: {
        pid: { in: filteredPids },
      },
      orderBy: { create_time: 'desc' },
      skip: start,
      take: limit,
    });

    const allTags = await prisma.imageTag.findMany({
      where: {
        pid: {
          in: images.map((img) => img.pid?.toString() ?? ''),
        },
      },
    });

    const imagesWithTags = images.map((img, index) => {
      const imgTags = allTags.filter((tag) => tag && tag.pid === img.pid?.toString());
      return {
        ...img,
        tags: imgTags.map(({ tag }) => tag?.replace(/#/g, '')),
      };
    });

    return NextResponse.json(serialize(imagesWithTags));
  } catch (error) {
    console.error('Error fetching artworks by tag:', error);
    return NextResponse.json({ error: '获取作品失败' }, { status: 500 });
  }
}
