'use client';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loading/Loader';
import { Platform } from '@/lib/type';
import { cn, genArtistUrl, genArtworkUrl, transformPixivUrl } from '@/lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { FaLink, FaSquareXTwitter } from 'react-icons/fa6';
import { SiPixiv } from 'react-icons/si';
import { PhotoView } from 'react-photo-view';
import { ImageHoverCard } from './ImageHoverCard';
import { Image } from '@prisma/client';

interface ImageItemProps {
  data: Image;
  className?: string;
}

export function ImageItem({ data, className }: ImageItemProps) {
  const { id, title, author, thumburl, rawurl, platform, authorid, pid, width, height } = data ?? {};
  const [isHover, setIsHover] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const thumbShowUrl = useMemo(() => transformPixivUrl(thumburl ?? ''), [thumburl]);
  const originShowUrl = useMemo(() => transformPixivUrl(rawurl ?? ''), [rawurl]);
  const authorUrl = useMemo(
    () => genArtistUrl(platform, { uid: authorid?.toString() ?? '', username: author ?? '' }),
    [platform, authorid, author],
  );
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
    <motion.div
      key={id}
      layout
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      className={cn('group hover:ring-primary/50 relative z-1 overflow-hidden rounded-lg hover:ring-2', className)}
    >
      <PhotoView src={originShowUrl}>
        <div className="bg-primary/20 relative" style={{ width: '100%', paddingBottom }}>
          {isLoading && <Loader className="absolute inset-0" />}
          <div className="absolute inset-0">
            <img
              src={thumbShowUrl}
              alt={title ?? ''}
              loading="lazy"
              decoding="async"
              className={`h-full w-full cursor-pointer rounded-lg object-contain shadow-md transition-all duration-300 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              } group-hover:scale-105`}
              onLoad={() => setIsLoading(false)}
            />
          </div>
        </div>
      </PhotoView>
      {/* 桌面端使用hover卡片 */}
      <AnimatePresence mode="wait">
        {isHover && (
          <div className="block md:hidden">
            <ImageHoverCard
              id={id ?? ''}
              title={title ?? ''}
              author={author ?? ''}
              platform={platform as Platform}
              artworkUrl={artworkUrl ?? ''}
              authorUrl={authorUrl ?? ''}
            />
          </div>
        )}
      </AnimatePresence>
      {/* 移动端显示在底部 */}
      <div
        className="bg-primary/20 hidden px-2 py-2 text-white backdrop-blur-lg md:block"
        onClick={() => router.push(`/artwork/${id}`)}
      >
        <h2 className="truncate text-sm/4 font-semibold">{title}</h2>

        <div className="mt-1.5 flex items-center justify-between gap-1">
          <a
            target="_blank"
            className="flex-center group/author border-primary bg-primary/50 hover:bg-primary/80 h-6 cursor-pointer gap-1.5 rounded-full border px-1.5 hover:text-white"
            href={authorUrl}
          >
            {platform === Platform.Pixiv && <SiPixiv className="size-4 opacity-70 group-hover/author:opacity-100" />}
            {platform === Platform.Twitter && <FaSquareXTwitter className="size-4 opacity-70 group-hover/author:opacity-100" />}
            <span className="block max-w-16 truncate text-xs text-white/90 group-hover/author:text-white">{author}</span>
          </a>
          <Button
            variant="ghost"
            size="xs"
            className="flex-center border-primary bg-primary/50 hover:bg-primary/80 cursor-pointer gap-0.5 rounded-full border p-0 px-1.5 text-xs text-white hover:text-white"
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
    </motion.div>
  );
}
