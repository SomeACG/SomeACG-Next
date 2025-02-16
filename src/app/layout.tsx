import Root from '@/components/layout/root';
import { fontVariants } from '@/constants/font';
import { cn } from '@/lib/utils';
import Providers from './providers';
import Script from 'next/script';

import 'react-photo-view/dist/react-photo-view.css';
import '../styles/globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cosine 🎨 Gallery | 精选 ACG 好图壁纸集',
  description: '质量超高的 ACG 图片列表，包好看的！',
  alternates: {
    canonical: 'https://pic.cosine.ren',
    types: {
      'application/rss+xml': [{ url: 'feed.xml', title: 'RSS 订阅' }],
    },
  },
  openGraph: {
    title: 'Cosine 🎨 Gallery | 精选 ACG 好图壁纸集',
    siteName: 'Cosine 🎨 Gallery',
    description: '质量超高的 ACG 图片列表，包好看的！',
    images: [{ url: 'https://r2.cosine.ren/og/cosine-gallery.webp' }],
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {process.env.NODE_ENV === 'production' && (
          <Script defer src="https://stats.cosine.ren/script.js" data-website-id="a3769128-94ac-4b7b-b8ca-7ff86d2f4dcd" />
        )}
      </head>
      <body className={cn(`m-0 h-full p-0 font-sans`, ...fontVariants)} suppressHydrationWarning>
        <Providers>
          <Root>{children}</Root>
        </Providers>
      </body>
    </html>
  );
}
