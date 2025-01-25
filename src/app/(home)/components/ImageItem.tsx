'use client';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loading/Loader';
import { Platform } from '@/lib/type';
import { genArtistUrl, genArtworkUrl, transformPixivUrl } from '@/lib/utils';
import { images } from '@prisma/client';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { FaLink, FaSquareXTwitter } from 'react-icons/fa6';
import { SiPixiv } from 'react-icons/si';
import { TiInfoLarge } from 'react-icons/ti';
import { PhotoView } from 'react-photo-view';
import { ImageHoverCard } from './ImageHoverCard';

interface ImageItemProps {
  data: images;
}

export function ImageItem({ data }: ImageItemProps) {
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
      className="group relative z-[1] overflow-hidden rounded-lg hover:ring-2 hover:ring-primary/50"
    >
      <PhotoView src={originShowUrl}>
        <div className="relative bg-primary/20" style={{ width: '100%', paddingBottom }}>
          {isLoading && <Loader className="absolute inset-0" />}
          <div className="absolute inset-0">
            <img
              src={thumbShowUrl}
              alt={title ?? ''}
              loading="lazy"
              decoding="async"
              className={`h-full w-full cursor-pointer rounded-lg object-cover shadow-md transition-all duration-300 ${
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
        className="hidden bg-primary/20 px-2 py-3 text-white backdrop-blur-lg md:block"
        onClick={() => router.push(`/artwork/${id}`)}
      >
        <h2 className="truncate text-sm/5 font-semibold">{title}</h2>

        <div className="mt-2 flex items-center justify-between gap-1">
          <a
            target="_blank"
            className="flex-center group/author h-6 cursor-pointer gap-2 rounded-full border border-primary bg-primary/50 px-1.5 hover:bg-primary/80 hover:text-white"
            href={authorUrl}
          >
            {platform === Platform.Pixiv && <SiPixiv className="size-4 opacity-70 group-hover/author:opacity-100" />}
            {platform === Platform.Twitter && <FaSquareXTwitter className="size-4 opacity-70 group-hover/author:opacity-100" />}
            <span className="block max-w-16 truncate text-xs text-white/90 group-hover/author:text-white">{author}</span>
          </a>
          <Button
            variant="ghost"
            size="xs"
            className="flex-center ml-auto size-6 rounded-full border border-primary bg-primary/50 p-0 px-0 text-white bg-blend-lighten hover:bg-primary/80 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/artwork/${id}`);
            }}
          >
            <TiInfoLarge className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            className="flex-center size-6 rounded-full border border-primary bg-primary/50 p-0 px-0 text-white hover:bg-primary/80"
            onClick={(e) => {
              e.stopPropagation();
              window.open(artworkUrl, '_blank');
            }}
          >
            <FaLink className="size-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
