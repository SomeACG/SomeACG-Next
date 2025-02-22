import prisma from '@/lib/db';
import ArtworkClient from './_components/ArtworkClient';
import { notFound } from 'next/navigation';

// 设置页面重新生成时间
export const revalidate = 60; // 60秒

// 允许访问未预渲染的路径
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const artworks = await prisma.image.findMany({
      select: { id: true },
      orderBy: { create_time: 'desc' },
      take: 200, // 只预渲染最新的200个作品
    });

    return artworks.map((artwork) => ({
      id: artwork.id.toString(),
    }));
  } catch (error) {
    console.error('生成静态参数时出错:', error);
    return []; // 返回空数组作为 fallback
  }
}

export default async function ArtworkPage({ params }: { params: { id: string } }) {
  // 在服务器端验证 ID 是否存在
  try {
    const artwork = await prisma.image.findUnique({
      where: { id: parseInt(params.id) },
      select: { id: true }, // 只获取 ID 来验证存在性
    });
    if (!artwork) {
      notFound();
    }
  } catch (error) {
    console.error('获取作品时出错:', error);
    notFound();
  }
  return <ArtworkClient id={params.id} />;
}
