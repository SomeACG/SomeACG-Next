import Root from '@/components/layout/root';
import { fontVariants } from '@/constants/font';
import { cn } from '@/lib/utils';
import Providers from './providers';

import '../styles/globals.css';
import 'react-photo-view/dist/react-photo-view.css';

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout(props: Props) {
  const { children } = props;
  return (
    <html lang="zh-CN">
      <head>
        <title>Cosine 🎨 Gallery | 精选 ACG 好图壁纸集</title>
        <meta name="description" content="质量超高的 ACG 图片列表，包好看的！" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={cn(`m-0 h-full p-0 font-sans`, ...fontVariants)}>
        <Providers>
          <Root>{children}</Root>
        </Providers>
      </body>
    </html>
  );
}
