import prisma from '@/lib/db';
import { genArtistUrl, genArtworkUrl, transformPixivUrl } from '@/lib/utils';
import { notFound } from 'next/navigation';
import ArtworkClient from './_components/ArtworkClient';

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

async function getArtwork(id: string) {
  try {
    const artwork = await prisma.images.findFirst({
      where: {
        id: parseInt(id),
      },
    });

    if (!artwork) {
      notFound();
    }

    return artwork;
  } catch (error) {
    console.error('获取作品数据时出错:', error);
    throw error; // 或者根据需求处理错误
  }
}

export default async function ArtworkPage({ params }: { params: { id: string } }) {
  const artwork = await getArtwork(params.id);

  const originShowUrl = transformPixivUrl(artwork.rawurl ?? '');
  const authorUrl = genArtistUrl(artwork.platform, {
    uid: artwork.authorid?.toString(),
    username: artwork.author ?? '',
  });
  const artworkUrl = genArtworkUrl({
    platform: artwork.platform,
    pid: artwork.pid ?? '',
    username: artwork.author ?? '',
  });

  return (
    <ArtworkClient artwork={artwork} originShowUrl={originShowUrl} authorUrl={authorUrl ?? ''} artworkUrl={artworkUrl ?? ''} />
  );
}
