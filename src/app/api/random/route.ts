import prisma from '@/lib/db';
import { transformPixivUrl } from '@/lib/utils';
import { NextResponse } from 'next/server';
import superjson from 'superjson';

export async function GET() {
  try {
    // 获取总数
    const total = await prisma.images.count();
    
    // 生成随机跳过的数量
    const skip = Math.floor(Math.random() * total);
    
    // 随机获取一张图片
    const image = await prisma.images.findFirst({
      skip,
      take: 1,
    });

    if (!image) {
      return NextResponse.json({ error: '未找到图片' }, { status: 404 });
    }

    // 获取图片标签
    const tags = await prisma.imagetags.findMany({
      where: {
        pid: image.pid?.toString(),
      },
      select: {
        tag: true,
      },
    });

    // 转换图片URL
    const imageWithUrls = {
      ...image,
      rawurl: transformPixivUrl(image.rawurl || ''),
      thumburl: transformPixivUrl(image.thumburl || ''),
      tags: tags.map((t) => t.tag).filter(Boolean),
    };

    // 序列化数据
    const serialized = superjson.serialize(imageWithUrls);
    return NextResponse.json(serialized);
  } catch (error) {
    console.error('error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
} 