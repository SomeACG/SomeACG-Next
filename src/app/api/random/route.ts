import prisma from '@/lib/db';
import { genArtistUrl, genArtworkUrl, transformPixivUrl } from '@/lib/utils';
import { NextResponse } from 'next/server';
import superjson from 'superjson';

// 设置为动态路由
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') ?? '1');
    const limit = Math.min(Math.max(count, 1), 20); // 限制最大返回20张图片

    // 获取所有ID
    const allIds = await prisma.images.findMany({
      select: {
        id: true,
      },
    });

    if (!allIds.length) {
      return NextResponse.json({ error: '未找到图片' }, { status: 404 });
    }

    // 随机选择ID
    const randomIds = allIds
      .map((item) => item.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

    // 获取随机图片
    const images = await prisma.images.findMany({
      where: {
        id: {
          in: randomIds,
        },
      },
    });

    if (!images.length) {
      return NextResponse.json({ error: '未找到图片' }, { status: 404 });
    }

    // 获取所有图片的pid
    const pids = images.map((img) => img.pid?.toString()).filter(Boolean);

    // 批量获取图片标签
    const tags = await prisma.imagetags.findMany({
      where: {
        pid: {
          in: pids as string[],
        },
      },
      select: {
        pid: true,
        tag: true,
      },
    });

    // 按pid分组标签
    const tagsByPid = tags.reduce(
      (acc, curr) => {
        if (!curr.pid) return acc;
        if (!acc[curr.pid]) acc[curr.pid] = [];
        if (curr.tag) acc[curr.pid].push(curr.tag.replace(/#+/g, '#'));
        return acc;
      },
      {} as Record<string, string[]>,
    );

    // 转换图片URL
    const imagesWithUrls = images.map((image) => ({
      ...image,
      rawurl: transformPixivUrl(image.rawurl || ''),
      thumburl: transformPixivUrl(image.thumburl || ''),
      originUrl: genArtworkUrl({ platform: image.platform ?? '', pid: image.pid ?? '', username: image.author ?? '' }),
      authorUrl: genArtistUrl(image.platform ?? '', { uid: image.authorid?.toString() ?? '', username: image.author ?? '' }),
      tags: tagsByPid[image.pid?.toString() ?? ''] ?? [],
    }));

    if (imagesWithUrls.length === 1) {
      const serialized = superjson.serialize(imagesWithUrls[0]);
      return NextResponse.json(serialized);
    }
    // 序列化数据
    const serialized = superjson.serialize(imagesWithUrls);
    return NextResponse.json(serialized);
  } catch (error) {
    console.error('error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
