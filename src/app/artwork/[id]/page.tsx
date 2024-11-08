import prisma from '@/lib/db';
import { genArtistUrl, genArtworkUrl, transformPixivUrl } from '@/lib/utils';
import { notFound } from 'next/navigation';
import ArtworkClient from './_components/ArtworkClient';

// 生成静态页面参数
export async function generateStaticParams() {
  const artworks = await prisma.images.findMany({
    select: { id: true },
    take: 100, // 可以根据需求调整预渲染的数量
  });

  return artworks.map((artwork) => ({
    id: artwork.id.toString(),
  }));
}

// 设置页面重新生成的时间间隔
export const revalidate = 3600; // 1小时重新生成一次

async function getArtwork(id: string) {
  const artwork = await prisma.images.findFirst({
    where: {
      id: parseInt(id),
    },
  });

  if (!artwork) {
    notFound();
  }

  return artwork;
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
