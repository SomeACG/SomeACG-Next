import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import ArtworkClient from './_components/ArtworkClient';
import superjson from 'superjson';
import { Platform } from '@/lib/type';
import { headers } from 'next/headers';

type ArtworkData = {
  id: number;
  title: string;
  platform: Platform;
  author: string;
  authorid: bigint | null;
  pid: string;
  rawurl: string | null;
  tags: string[];
};

// 生成静态页面参数
export async function generateStaticParams() {
  try {
    const artworks = await prisma.images.findMany({
      select: { id: true },
      take: 100,
    });

    return artworks.map((artwork) => ({
      id: artwork.id.toString(),
    }));
  } catch (error) {
    console.error('生成静态参数时出错:', error);
    return []; // 返回空数组作为fallback
  }
}

async function getArtwork(id: string): Promise<ArtworkData> {
  try {
    const headersList = headers();
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = headersList.get('host') || 'localhost:3000';
    const response = await fetch(`${protocol}://${host}/api/artwork/${id}`, {
      next: { revalidate: 3600 }, // 1小时缓存
    });

    if (!response.ok) {
      if (response.status === 404) {
        notFound();
      }
      throw new Error('获取作品数据失败');
    }

    const data = await response.json();
    return superjson.deserialize(data);
  } catch (error) {
    console.error('获取作品数据时出错:', error);
    throw error;
  }
}

export default async function ArtworkPage({ params }: { params: { id: string } }) {
  return <ArtworkClient id={params.id} />;
}
