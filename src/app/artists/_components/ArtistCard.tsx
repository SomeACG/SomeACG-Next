'use client';

import ImageWithAutoFallback from '@/components/common/ImageWithAutoFallback';
import { PopularArtist } from '@/lib/type';
import { genArtistUrl, getImageThumbUrl } from '@/lib/utils';
import { Calendar, ExternalLink, Hash, Images, User } from 'lucide-react';
import Link from 'next/link';
import { memo, useEffect, useMemo, useState } from 'react';
import { FaSquareXTwitter } from 'react-icons/fa6';
import { SiPixiv } from 'react-icons/si';
import { PhotoView } from 'react-photo-view';

type ArtistCardProps = {
  artist: PopularArtist;
  index: number;
};

function ArtistCard({ artist, index }: ArtistCardProps) {
  const {
    platform,
    authorid,
    author,
    artworkCount,
    latestImageThumb,
    lastUpdateTime,
    latestImageFilename,
    latestImageWidth,
    latestImageHeight,
  } = artist;

  const getPlatformIcon = () => {
    switch (platform) {
      case 'pixiv':
        return <SiPixiv className="h-3.5 w-3.5" />;
      case 'twitter':
        return <FaSquareXTwitter className="h-3.5 w-3.5" />;
      default:
        return <User className="h-3.5 w-3.5" />;
    }
  };

  const getPlatformColor = () => {
    switch (platform) {
      case 'pixiv':
        return 'text-blue';
      case 'twitter':
        return 'text-artist-neutral-700 dark:text-artist-neutral-dark-200';
      default:
        return 'text-purple-500';
    }
  };

  const getRankBadge = () => {
    if (index < 3) {
      return 'bg-gradient-to-r from-yellow to-red text-white shadow-lg';
    }
    if (index < 10) {
      return 'bg-gradient-to-r from-artist-neutral-700 to-artist-neutral-800 text-white shadow-md';
    }
    return 'bg-white/90 text-artist-neutral-600 shadow-sm backdrop-blur-sm dark:bg-artist-neutral-dark-700/90 dark:text-artist-neutral-dark-200';
  };

  const externalUrl = genArtistUrl(platform, { uid: authorid ?? '', username: author ?? '' });
  const internalUrl = `/artist/${platform}/${authorid}`;

  const thumbShowUrl = useMemo(
    () => getImageThumbUrl({ thumbUrl: latestImageThumb ?? '', platform, filename: latestImageFilename }),
    [latestImageThumb, platform, latestImageFilename],
  );

  const [currentImageSrc, setCurrentImageSrc] = useState(thumbShowUrl.transformThumbUrl || thumbShowUrl.s3ThumbUrl);

  useEffect(() => {
    setCurrentImageSrc(thumbShowUrl.transformThumbUrl || thumbShowUrl.s3ThumbUrl);
  }, [thumbShowUrl]);

  const formatDate = (date: Date | null) => {
    if (!date) return '未知';
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  // 计算容器高度 - 基于真实图片比例
  const paddingBottom = useMemo(() => {
    if (latestImageWidth && latestImageHeight && latestImageWidth > 0 && latestImageHeight > 0) {
      const aspectRatio = latestImageHeight / latestImageWidth;
      // Convert to percentage and clamp to reasonable bounds
      const percentage = Math.max(50, Math.min(200, aspectRatio * 100));
      return `${percentage}%`;
    }
    return '75%'; // 4:3 landscape ratio fallback
  }, [latestImageWidth, latestImageHeight]);

  return (
    <div className="group border-artist-neutral-100/60 hover:border-artist-neutral-200/80 dark:border-artist-neutral-dark-700/60 dark:bg-artist-neutral-dark-800/75 dark:hover:border-artist-neutral-dark-300/80 dark:hover:bg-artist-neutral-dark-800/85 relative overflow-hidden rounded-2xl border bg-white/75 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/85 hover:shadow-xl">
      {/* Rank and Platform indicators */}
      <div className="absolute top-2.5 left-2.5 z-10">
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-transform duration-200 group-hover:scale-105 ${getRankBadge()}`}
        >
          {index + 1}
        </div>
      </div>

      <div className="absolute top-2.5 right-2.5 z-10">
        <div
          className={`dark:bg-artist-neutral-dark-700/95 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur-sm transition-all duration-200 group-hover:scale-105 ${getPlatformColor()}`}
        >
          {getPlatformIcon()}
        </div>
      </div>

      {/* Image section */}
      <div
        className="dark:from-artist-neutral-dark-700/80 dark:to-artist-neutral-dark-800/80 relative overflow-hidden bg-gradient-to-br from-gray-50/80 to-gray-100/80"
        style={{ width: '100%', paddingBottom }}
      >
        <PhotoView src={currentImageSrc}>
          <div className="absolute inset-0 cursor-pointer overflow-hidden">
            <ImageWithAutoFallback
              primarySrc={thumbShowUrl.transformThumbUrl}
              fallbackSrc={thumbShowUrl.s3ThumbUrl}
              alt={author || '画师作品'}
              fill
              decoding="async"
              className="h-full w-full cursor-pointer object-cover transition-all duration-500 group-hover:scale-110"
              onCurrentSrcChange={setCurrentImageSrc}
            />
            {/* Overlay gradient for better visual effect */}
            <div className="from-artist-neutral-800/30 absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        </PhotoView>
      </div>

      {/* Compact content section */}
      <div className="p-2.5">
        {/* Artist name and ID - single line */}
        <div className="mb-1.5 flex items-center justify-between">
          <h3 className="text-artist-neutral-800 dark:text-artist-neutral-dark-900 truncate text-sm font-semibold">
            {author || '未知画师'}
          </h3>
          <div className="text-artist-neutral-600 dark:text-artist-neutral-dark-200 ml-2 flex items-center gap-1 text-xs">
            <Hash className="h-2.5 w-2.5" />
            <span className="max-w-[60px] truncate">{authorid}</span>
          </div>
        </div>

        {/* Stats row - more compact */}
        <div className="text-artist-neutral-600 dark:text-artist-neutral-dark-200 mb-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <Images className="text-blue h-3 w-3" />
            <span className="font-medium">{artworkCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="text-yellow h-3 w-3" />
            <span>{formatDate(lastUpdateTime)}</span>
          </div>
        </div>

        {/* Action buttons - more compact */}
        <div className="flex items-center gap-1.5">
          <Link
            href={internalUrl}
            className="from-artist-neutral-700 to-artist-neutral-800 hover:to-artist-neutral-700 dark:from-artist-neutral-dark-200 dark:text-artist-neutral-800 dark:hover:to-artist-neutral-dark-200 flex-1 rounded-xl bg-gradient-to-r px-2.5 py-1.5 text-center text-xs font-medium text-white shadow-sm transition-all hover:scale-[1.02] hover:from-gray-600 hover:shadow-md dark:to-gray-300 dark:hover:from-gray-200"
          >
            查看作品
          </Link>
          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border-artist-neutral-100/70 text-artist-neutral-600 dark:border-artist-neutral-dark-700/70 dark:bg-artist-neutral-dark-700/70 dark:text-artist-neutral-dark-200 dark:hover:bg-artist-neutral-dark-700/85 flex h-6 w-6 items-center justify-center rounded-xl border bg-white/70 shadow-sm backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/85 hover:shadow-md"
              title="访问原平台"
            >
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ArtistCard);
