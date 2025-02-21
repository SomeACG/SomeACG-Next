'use client';

import { ClientOnly } from '@/components/common/ClientOnly';
import { LinkCard } from '@/components/ui/card/LinkCard';
import PhotoViewer from '@/components/ui/PhotoViewer';
import { useArtwork } from '@/lib/hooks/useImages';
import { Platform } from '@/lib/type';
import { cn, genArtistUrl, genArtworkUrl, transformPixivUrl } from '@/lib/utils';
import { FaTags } from 'react-icons/fa';
import { FaSquareXTwitter } from 'react-icons/fa6';
import { SiPixiv } from 'react-icons/si';
import { useCallback, useMemo } from 'react';
import Card from '@/components/ui/card';

type ArtworkClientProps = {
  id: string;
};

export default function ArtworkClient({ id }: ArtworkClientProps) {
  const { artwork, isLoading, isError } = useArtwork(id);
  const { author, authorid, platform, pid, rawurl, tags, title, width, height, ai } = artwork ?? {};
  const twitterTags = useMemo(() => {
    if (platform !== Platform.Twitter || !title) return [];
    const matches = title.match(/#[^\s#]+/g);
    return matches || [];
  }, [platform, title]);
  const isLandscape = useMemo(() => width && height && width > height, [width, height]);

  const originShowUrl = transformPixivUrl(rawurl ?? '');
  const authorUrl = genArtistUrl(platform, {
    uid: authorid?.toString() ?? '',
    username: author ?? '',
  });
  const artworkUrl = genArtworkUrl({
    platform,
    pid: pid ?? '',
    username: author ?? '',
  });

  const renderTitle = useCallback(() => {
    if (!title) return null;
    if (platform === Platform.Pixiv) {
      return <h1 className="text-3xl font-bold break-all">{title}</h1>;
    }
    return <Card desc={title} />;
  }, [platform, title]);

  if (isError) {
    return <div className="container mx-auto px-4 py-8 text-center">加载失败，请稍后再试，可能该作品信息还未同步</div>;
  }

  if (isLoading || !artwork) {
    return <div className="container mx-auto px-4 py-8 text-center">加载中...</div>;
  }
  return (
    <ClientOnly>
      <div className="container mx-auto px-2 py-8">
        <div className={cn('grid grid-cols-1 gap-8', { 'lg:grid-cols-2': !isLandscape })}>
          <div className={cn('aspect-auto *:relative', { 'mx-auto max-w-[1200px]': isLandscape })}>
            <PhotoViewer originUrl={originShowUrl} thumbUrl={originShowUrl} title={artwork?.title ?? ''} />
          </div>

          <div className="flex flex-col space-y-6">
            {renderTitle()}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">作者：</span>
                <a href={authorUrl} target="_blank" className="text-primary flex items-center gap-2 hover:underline">
                  {platform === Platform.Pixiv && <SiPixiv className="text-xl" />}
                  {platform === Platform.Twitter && <FaSquareXTwitter className="text-xl" />}
                  {author}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">平台：</span>
                <span>{platform}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">尺寸：</span>
                <span>
                  {width} × {height}
                </span>
              </div>

              {ai && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">AI生成：</span>
                  <span className="text-yellow-600 dark:text-yellow-400">是</span>
                </div>
              )}

              <div className="flex items-start gap-2">
                <span className="whitespace-nowrap text-gray-600 dark:text-gray-400">原始标签：</span>
                <div className="flex flex-wrap gap-2">
                  {platform === Platform.Twitter && twitterTags.length > 0
                    ? twitterTags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="bg-primary/20 text-primary hover:bg-primary/30 flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors duration-300"
                        >
                          <FaTags className="text-xs" />
                          {tag.slice(1)}
                        </span>
                      ))
                    : null}
                  {Array.isArray(tags) && tags.length > 0 ? (
                    tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="bg-primary/20 text-primary hover:bg-primary/30 flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors duration-300"
                      >
                        <FaTags className="text-xs" />
                        {tag.replace(/#/g, '')}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">暂无标签</span>
                  )}
                </div>
              </div>
            </div>
            {artworkUrl && <LinkCard link={artworkUrl} name={title ?? ''} description={`在 ${platform} 上查看原图`} />}
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
