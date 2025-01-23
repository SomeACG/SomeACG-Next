'use client';
import Loader from '@/components/ui/loading/Loader';
import { Platform } from '@/lib/type';
import { genArtistUrl, genArtworkUrl, transformPixivUrl } from '@/lib/utils';
import { images } from '@prisma/client';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { PhotoView } from 'react-photo-view';
import { ImageHoverCard } from './ImageHoverCard';

interface ImageItemProps {
  data: images;
}

export function ImageItem({ data }: ImageItemProps) {
  const { id, title, author, thumburl, rawurl, platform, authorid, pid, width, height } = data ?? {};
  const [isHover, setIsHover] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      <AnimatePresence mode="wait">
        {isHover && (
          <ImageHoverCard
            id={id ?? ''}
            title={title ?? ''}
            author={author ?? ''}
            platform={platform as Platform}
            artworkUrl={artworkUrl ?? ''}
            authorUrl={authorUrl ?? ''}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
