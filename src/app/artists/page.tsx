import { Metadata } from 'next';
import { seoConfig } from '@/constants/site-config';
import ArtistsClient from './_components/ArtistsClient';

export const metadata: Metadata = {
  title: `热门画师 | ${seoConfig.title}`,
  description: '发现最受欢迎的二次元画师，按作品数量排序或随机浏览，欣赏精美的ACG艺术作品',
  keywords: ['热门画师', 'ACG画师', '二次元画师', 'Pixiv画师', 'Twitter画师', '插画师', '动漫画师', seoConfig.title],
  openGraph: {
    title: `热门画师 | ${seoConfig.title}`,
    description: '发现最受欢迎的二次元画师，按作品数量排序或随机浏览',
    type: 'website',
  },
};

export default function ArtistsPage() {
  return <ArtistsClient />;
}
