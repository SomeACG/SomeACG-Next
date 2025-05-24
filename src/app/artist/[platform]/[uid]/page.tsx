import { getArtistImages, getArtistInfo } from '@/lib/imageService';
import { notFound } from 'next/navigation';
import superjson from 'superjson';
import ArtistClient from './_components/ArtistClient';
import { Metadata } from 'next';
import { seoConfig } from '@/constants/site-config';
import prisma from '@/lib/db';

// 设置页面重新生成时间
export const revalidate = 3600; // 1小时

// 允许访问未预渲染的路径
export const dynamicParams = true;

type Props = {
  params: {
    platform: string;
    uid: string;
  };
};

export async function generateStaticParams() {
  try {
    // 获取作品数量最多的画师（按platform和authorid分组）
    const topArtists = await prisma.image.groupBy({
      by: ['platform', 'authorid'],
      _count: {
        id: true,
      },
      where: {
        platform: {
          not: null,
        },
        authorid: {
          not: null,
        },
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 100, // 预渲染前100个最热门的画师
    });

    return topArtists
      .filter((artist) => artist.platform && artist.authorid)
      .map((artist) => ({
        platform: artist.platform!,
        uid: artist.authorid!.toString(),
      }));
  } catch (error) {
    console.error('生成画师静态参数时出错:', error);
    return []; // 返回空数组作为 fallback
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { platform, uid } = params;

  try {
    const artistInfo = await getArtistInfo(platform, uid);

    if (!artistInfo) {
      return {
        title: `画师不存在 | ${seoConfig.title}`,
        description: '请检查画师 ID 或平台信息是否正确',
      };
    }
    const { author, artworkCount } = artistInfo;
    const platformDisplay = platform === 'pixiv' ? 'Pixiv' : platform === 'twitter' ? 'Twitter' : platform;

    return {
      title: `${author} - ${platformDisplay} 画师作品集 | ${seoConfig.title}`,
      description: `浏览画师 ${author} 在 ${platformDisplay} 平台发布的精美二次元插画作品，共收藏 ${artworkCount} 件高质量ACG艺术作品`,
      keywords: [`${author}`, `${platformDisplay}画师`, 'ACG', '二次元', '动漫', '插画', seoConfig.title],
      authors: author ? [{ name: author }] : undefined,
      openGraph: {
        title: `${author} - ${platformDisplay} 画师作品集`,
        description: `欣赏画师 ${author} 的 ${artworkCount} 件精美作品`,
        type: 'profile',
      },
    };
  } catch (error) {
    return {
      title: `画师页面 | ${seoConfig.title}`,
      description: '画师作品集页面加载中...',
    };
  }
}

export default async function ArtistPage({ params }: Props) {
  const { platform, uid } = params;

  try {
    // 验证画师是否存在
    const artistInfo = await getArtistInfo(platform, uid);
    if (!artistInfo) {
      notFound();
    }

    // 获取第一页数据
    const initialData = await getArtistImages(platform, uid, 1, 24);
    const serializedData = superjson.serialize(initialData);

    return <ArtistClient platform={platform} uid={uid} initialData={superjson.deserialize(serializedData)} />;
  } catch (error) {
    console.error('获取画师数据失败:', error);
    notFound();
  }
}
