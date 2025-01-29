'use client';

import { Platform } from '@/lib/type';
import { ClientOnly } from '@/components/common/ClientOnly';
import PhotoViewer from '@/components/ui/PhotoViewer';
import { FaSquareXTwitter } from 'react-icons/fa6';
import { SiPixiv } from 'react-icons/si';
import { FaTags } from 'react-icons/fa';
import { useEffect } from 'react';
import { useArtwork } from '@/lib/hooks/useImages';
import { genArtistUrl, genArtworkUrl, transformPixivUrl } from '@/lib/utils';

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

type ArtworkClientProps = {
  id: string;
};

export default function ArtworkClient({ id }: ArtworkClientProps) {
  const { artwork, isLoading, isError } = useArtwork(id);

  if (isError) {
    return <div className="container mx-auto px-4 py-8 text-center">加载失败</div>;
  }

  if (isLoading || !artwork) {
    return <div className="container mx-auto px-4 py-8 text-center">加载中...</div>;
  }

  const originShowUrl = transformPixivUrl(artwork.rawurl ?? '');
  const authorUrl = genArtistUrl(artwork.platform, {
    uid: artwork.authorid?.toString() ?? '',
    username: artwork.author,
  });
  const artworkUrl = genArtworkUrl({
    platform: artwork.platform,
    pid: artwork.pid,
    username: artwork.author ?? '',
  });

  return (
    <ClientOnly>
      <div className="container mx-auto overflow-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 overflow-auto lg:grid-cols-2">
          <div className="relative aspect-auto">
            <PhotoViewer originUrl={originShowUrl} thumbUrl={originShowUrl} title={artwork?.title ?? ''} />
          </div>

          <div className="flex flex-col space-y-6">
            <h1 className="break-all text-3xl font-bold">{artwork.title}</h1>

            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">作者：</span>
                <a href={authorUrl} target="_blank" className="flex items-center gap-2 text-primary hover:underline">
                  {artwork.platform === Platform.Pixiv && <SiPixiv className="text-xl" />}
                  {artwork.platform === Platform.Twitter && <FaSquareXTwitter className="text-xl" />}
                  {artwork.author}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">平台：</span>
                <span>{artwork.platform}</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="whitespace-nowrap text-gray-600 dark:text-gray-400">原始标签：</span>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(artwork.tags) && artwork.tags.length > 0 ? (
                    artwork.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 text-sm text-primary transition-colors duration-300 hover:bg-primary/30"
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
            {artworkUrl && (
              <a
                href={artworkUrl}
                target="_blank"
                className="inline-block w-fit rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary/90"
              >
                在 {artwork.platform} 上查看原图
              </a>
            )}
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
