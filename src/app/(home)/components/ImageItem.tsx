'use client';
import ImageWithAutoFallback from '@/components/common/ImageWithAutoFallback';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loading/Loader';
import { useIsMobile } from '@/hooks/useIsMobile';
import { ImageWithTag, Platform } from '@/lib/type';
import { cn, genArtistUrl, genArtworkUrl, getImageThumbUrl } from '@/lib/utils';
import { AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { FaLink, FaSquareXTwitter } from 'react-icons/fa6';
import { SiPixiv } from 'react-icons/si';
import { PhotoView } from 'react-photo-view';
import { ImageHoverCard } from './ImageHoverCard';

interface ImageItemProps {
  data: ImageWithTag;
  className?: string;
  premiumMode?: boolean;
}

export function ImageItem({ data, className, premiumMode }: ImageItemProps) {
  const { id, title, author, thumburl, platform, authorid, pid, width, height, filename, tags } = data ?? {};
  const [isHover, setIsHover] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const isMobile = useIsMobile();
  const isPremium = useMemo(
    () => !isLoading && !premiumMode && tags?.length && tags.some((tag) => tag === '精选'),
    [isLoading, premiumMode, tags],
  ); // 为精选图片
  const thumbShowUrl = useMemo(
    () => getImageThumbUrl({ thumbUrl: thumburl ?? '', platform, filename }),
    [filename, platform, thumburl],
  );
  const [currentImageSrc, setCurrentImageSrc] = useState(thumbShowUrl.transformThumbUrl || thumbShowUrl.s3ThumbUrl);

  useEffect(() => {
    setCurrentImageSrc(thumbShowUrl.transformThumbUrl || thumbShowUrl.s3ThumbUrl);
  }, [thumbShowUrl]);

  // console.log('image item', data);
  const authorUrl = useMemo(
    () => genArtistUrl(platform, { uid: authorid?.toString() ?? '', username: author ?? '' }),
    [platform, authorid, author],
  );
  const internalArtistUrl = useMemo(() => `/artist/${platform}/${authorid}`, [platform, authorid]);
  const artworkUrl = useMemo(
    () => genArtworkUrl({ platform: platform ?? '', pid: pid ?? '', username: author ?? '' }),
    [platform, author, pid],
  );

  // 计算容器高度
  const paddingBottom = useMemo(() => {
    if (width && height && width > 0 && height > 0) {
      const ratio = width / height;
      return `${(1 / ratio) * 100}%`;
    }
    return '75%'; // 默认 4:3 比例
  }, [width, height]);

  return (
    <div
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className={cn(
        'group relative z-1 overflow-hidden rounded-lg hover:z-10',
        {
          'bg-gradient-to-br from-[#AF40FF] via-[#5B42F3] to-[#00DDEB] p-1 shadow-[0_10px_20px_-5px_rgba(151,65,252,0.3)]':
            isPremium,
        },
        className,
      )}
    >
      <PhotoView src={currentImageSrc}>
        <div className="bg-primary/20 relative" style={{ width: '100%', paddingBottom }}>
          {isLoading && <Loader className="absolute inset-0" />}
          <div className="absolute inset-0">
            <ImageWithAutoFallback
              primarySrc={thumbShowUrl.transformThumbUrl}
              fallbackSrc={thumbShowUrl.s3ThumbUrl}
              alt={title ?? ''}
              fill
              decoding="async"
              className={`h-full w-full cursor-pointer rounded-lg object-cover shadow-md transition-transform duration-300 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              } group-hover:scale-110`}
              onLoad={() => setIsLoading(false)}
              onCurrentSrcChange={setCurrentImageSrc}
            />
          </div>
        </div>
      </PhotoView>
      {isMobile ? (
        <div
          className="text-primary hidden bg-[#d3d2da] px-2 py-2 backdrop-blur-lg md:block dark:bg-[#3b3c40] dark:text-white"
          onClick={() => router.push(`/artwork/${id}`)}
        >
          {/* 移动端显示在底部 */}
          <h2 className="truncate text-sm/4 font-semibold">{title}</h2>

          <div className="mt-1.5 flex items-center justify-between gap-1 text-white">
            <Link
              href={internalArtistUrl}
              className="flex-center group/author border-primary bg-primary/50 hover:bg-primary/80 h-6 cursor-pointer gap-1.5 rounded-full border px-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              {platform === Platform.Pixiv && <SiPixiv className="size-4 opacity-70 group-hover/author:opacity-100" />}
              {platform === Platform.Twitter && (
                <FaSquareXTwitter className="size-4 opacity-70 group-hover/author:opacity-100" />
              )}
              <span className="block max-w-16 truncate text-xs">{author}</span>
            </Link>
            <Button
              variant="ghost"
              size="xs"
              className="flex-center border-primary bg-primary/50 hover:bg-primary/80 cursor-pointer gap-0.5 rounded-full border p-0 px-1.5 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                window.open(artworkUrl, '_blank');
              }}
            >
              <FaLink className="size-3.5" />
              <span className="truncate">原图</span>
            </Button>
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* 桌面端使用 hover 卡片 */}
          {isHover && (
            <div className="block md:hidden">
              <ImageHoverCard
                id={id ?? ''}
                title={title ?? ''}
                author={author ?? ''}
                platform={platform as Platform}
                artworkUrl={artworkUrl ?? ''}
                authorUrl={authorUrl ?? ''}
                authorid={authorid?.toString() ?? ''}
              />
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
