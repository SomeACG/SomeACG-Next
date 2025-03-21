'use client';

import { ClientOnly } from '@/components/common/ClientOnly';
import ImageFb from '@/components/common/ImageFb';
import Card from '@/components/ui/card';
import { LinkCard } from '@/components/ui/card/LinkCard';
import Loader from '@/components/ui/loading/Loader';
import { useArtwork } from '@/lib/hooks/useImages';
import { Platform } from '@/lib/type';
import { cn, genArtistUrl, genArtworkUrl, getImageOriginUrl } from '@/lib/utils';
import { uniq } from 'es-toolkit';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaTags } from 'react-icons/fa';
import { FaArrowRotateRight, FaCircleMinus, FaCirclePlus, FaSquareXTwitter } from 'react-icons/fa6';
import { SiPixiv } from 'react-icons/si';
import { PhotoProvider, PhotoView } from 'react-photo-view';
type ArtworkClientProps = {
  id: string;
};

export default function ArtworkClient({ id }: ArtworkClientProps) {
  const { artwork, isLoading, isError } = useArtwork(id);
  const { author, authorid, platform, pid, rawurl, tags, title, width, height, ai, filename } = artwork ?? {};
  const twitterTags = useMemo(() => {
    if (platform !== Platform.Twitter || !title) return [];
    const matches = title.match(/#[^\s#]+/g);
    return matches || [];
  }, [platform, title]);
  const isLandscape = useMemo(() => width && height && width > height, [width, height]);
  const [isImgLoading, setIsImgLoading] = useState(true);
  const finalTags = useMemo(() => {
    // TODO: 多图的时候 tag 有 bug ，待修复
    return uniq(tags ?? []);
  }, [tags]);
  // 计算容器高度
  const aspectRatio = useMemo(() => {
    if (width && height && width > 0 && height > 0) {
      return `${width / height}`;
    }
    return 1; // 默认 4:3 比例
  }, [width, height]);

  const originShowUrl = getImageOriginUrl({
    rawUrl: rawurl ?? '',
    platform,
    filename,
  });
  const [realShowUrl, setRealShowUrl] = useState(originShowUrl?.transformOriginUrl ?? '');

  const onImgFallback = useCallback((fallbackSrc: string) => {
    setRealShowUrl(fallbackSrc);
  }, []);

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

  useEffect(() => {
    if (!isImgLoading) {
      setRealShowUrl(originShowUrl?.transformOriginUrl ?? '');
    }
  }, [originShowUrl, isImgLoading]);
  if (isError) {
    return <div className="container mx-auto px-4 py-8 text-center">加载失败，请稍后再试，可能该作品信息还未同步</div>;
  }

  if (isLoading || !artwork) {
    return <Loader className="mt-8" />;
  }

  return (
    <ClientOnly>
      <PhotoProvider
        toolbarRender={({ onRotate, onScale, rotate, scale }) => {
          return (
            <>
              <FaArrowRotateRight className="mr-2 h-5 w-5 cursor-pointer" onClick={() => onRotate(rotate + 90)} />
              <FaCirclePlus className="mr-2 h-5 w-5 cursor-pointer" onClick={() => onScale(scale + 1)} />
              <FaCircleMinus className="mr-2 h-5 w-5 cursor-pointer" onClick={() => onScale(scale - 1)} />
            </>
          );
        }}
      >
        <div className="container mx-auto px-2 py-8">
          <div className={cn('grid grid-cols-1 gap-8', { 'lg:grid-cols-2': !isLandscape })}>
            <PhotoView src={realShowUrl}>
              <div className="bg-primary/20 relative w-full max-w-[1200px]" style={{ aspectRatio }}>
                {isImgLoading && <Loader className="absolute inset-0" />}
                <div className="absolute inset-0">
                  <ImageFb
                    src={originShowUrl.transformOriginUrl}
                    fallbackSrc={originShowUrl.s3OriginUrl}
                    onImgFallback={onImgFallback}
                    alt={title ?? ''}
                    loading="lazy"
                    fill
                    decoding="async"
                    className={`h-full w-full cursor-pointer rounded-lg object-contain shadow-md transition-all duration-300 ${
                      isImgLoading ? 'opacity-0' : 'opacity-100'
                    } group-hover:scale-105`}
                    onLoad={() => setIsImgLoading(false)}
                  />
                </div>
              </div>
            </PhotoView>

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

                {platform === Platform.Twitter && twitterTags.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="whitespace-nowrap text-gray-600 dark:text-gray-400">推文标签：</span>
                    <div className="flex flex-wrap gap-2">
                      {twitterTags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="bg-primary/20 text-primary hover:bg-primary/30 flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors duration-300"
                        >
                          <FaTags className="text-xs" />
                          {tag.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <span className="whitespace-nowrap text-gray-600 dark:text-gray-400">原始标签：</span>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(finalTags) && finalTags.length > 0 ? (
                      finalTags.map((tag: string, index: number) => (
                        <Link
                          key={index}
                          href={`/tag/${encodeURIComponent(tag.replace(/#/g, ''))}`}
                          className="bg-primary/20 text-primary hover:bg-primary/30 flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors duration-300"
                        >
                          <FaTags className="text-xs" />
                          {tag.replace(/#/g, '')}
                        </Link>
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
      </PhotoProvider>
    </ClientOnly>
  );
}
