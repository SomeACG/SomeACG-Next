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

export default async function ArtworkPage({ params }: { params: { id: string } }) {
  return <ArtworkClient id={params.id} />;
}
