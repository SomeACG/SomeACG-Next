'use client';

import ImageFb from '@/components/common/ImageFb';
import { PopularArtist } from '@/lib/type';
import { genArtistUrl, getImageThumbUrl } from '@/lib/utils';
import Link from 'next/link';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ExternalLink, Calendar, Hash, Images, User } from 'lucide-react';
import { FaSquareXTwitter } from 'react-icons/fa6';
import { SiPixiv } from 'react-icons/si';
import { PhotoView } from 'react-photo-view';

type ArtistCardProps = {
  artist: PopularArtist;
  index: number;
};

function ArtistCard({ artist, index }: ArtistCardProps) {
  const [imageError, setImageError] = useState(false);

  const { platform, authorid, author, artworkCount, latestImageThumb, lastUpdateTime, latestImageFilename } = artist;

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
        return 'text-blue-600';
      case 'twitter':
        return 'text-gray-900 dark:text-gray-100';
      default:
        return 'text-purple-600';
    }
  };

  const getRankBadge = () => {
    if (index < 3) {
      return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
    }
    if (index < 10) {
      return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
    }
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  const externalUrl = genArtistUrl(platform, { uid: authorid ?? '', username: author ?? '' });
  const internalUrl = `/artist/${platform}/${authorid}`;

  const thumbShowUrl = useMemo(
    () => getImageThumbUrl({ thumbUrl: latestImageThumb ?? '', platform, filename: latestImageFilename }),
    [latestImageThumb, platform, latestImageFilename],
  );
  
  const [realShowUrl, setRealShowUrl] = useState('');
  
  const onImgFallback = useCallback((fallbackSrc: string) => {
    setRealShowUrl(fallbackSrc);
  }, []);

  // 初始化 realShowUrl
  useEffect(() => {
    if (thumbShowUrl?.s3ThumbUrl) {
      setRealShowUrl(thumbShowUrl.s3ThumbUrl);
    }
  }, [thumbShowUrl]);

  const formatDate = (date: Date | null) => {
    if (!date) return '未知';
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  // 计算容器高度 - 确保稳定性，避免布局跳动
  const paddingBottom = useMemo(() => {
    // 优先使用稳定的默认比例，避免因图片加载而改变布局
    const isPortrait = artworkCount % 3 === 0; // Every 3rd artist gets portrait treatment
    const isSquare = artworkCount % 4 === 0; // Every 4th artist gets square treatment

    if (isPortrait) {
      return '133.33%'; // 3:4 portrait ratio
    } else if (isSquare) {
      return '100%'; // 1:1 square ratio
    } else {
      return '75%'; // 4:3 landscape ratio (default)
    }
  }, [artworkCount]);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200/60 bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-gray-300/60 hover:shadow-lg hover:-translate-y-0.5 dark:border-gray-700/60 dark:bg-gray-900/80 dark:hover:border-gray-600/60">
      {/* Rank and Platform indicators */}
      <div className="absolute top-3 left-3 z-10">
        <div className={`flex h-5 w-5 items-center justify-center rounded-md text-xs font-bold ${getRankBadge()}`}>
          {index + 1}
        </div>
      </div>
      
      <div className="absolute top-3 right-3 z-10">
        <div className={`flex h-5 w-5 items-center justify-center rounded-md bg-white/90 backdrop-blur-sm dark:bg-gray-900/90 ${getPlatformColor()}`}>
          {getPlatformIcon()}
        </div>
      </div>

      {/* Image section */}
      <div
        className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
        style={{ width: '100%', paddingBottom }}
      >
        {thumbShowUrl.s3ThumbUrl && !imageError ? (
          <PhotoView src={realShowUrl}>
            <div className="absolute inset-0 cursor-pointer overflow-hidden">
              <ImageFb
                src={thumbShowUrl.s3ThumbUrl}
                fallbackSrc={thumbShowUrl.transformThumbUrl}
                onImgFallback={onImgFallback}
                alt={author || '画师作品'}
                loading="lazy"
                fill
                decoding="async"
                className="h-full w-full cursor-pointer object-cover transition-all duration-500 group-hover:scale-110"
                onError={handleImageError}
              />
              {/* Overlay gradient for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          </PhotoView>
        ) : (
          <div className="absolute inset-0 flex h-full w-full items-center justify-center">
            <div className="text-center text-gray-400 dark:text-gray-500">
              <div className="mb-2 flex justify-center">
                <div className="rounded-lg bg-gray-200/50 p-2 dark:bg-gray-700/50">
                  {getPlatformIcon()}
                </div>
              </div>
              <p className="text-xs">暂无预览</p>
            </div>
          </div>
        )}
      </div>

      {/* Compact content section */}
      <div className="p-2.5">
        {/* Artist name and ID - single line */}
        <div className="mb-1.5 flex items-center justify-between">
          <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
            {author || '未知画师'}
          </h3>
          <div className="ml-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Hash className="h-2.5 w-2.5" />
            <span className="truncate max-w-[60px]">{authorid}</span>
          </div>
        </div>
        
        {/* Stats row - more compact */}
        <div className="mb-2 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Images className="h-3 w-3 text-blue-500" />
            <span className="font-medium">{artworkCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-green-500" />
            <span>{formatDate(lastUpdateTime)}</span>
          </div>
        </div>

        {/* Action buttons - more compact */}
        <div className="flex items-center gap-1.5">
          <Link
            href={internalUrl}
            className="flex-1 rounded-lg bg-gray-900 px-2.5 py-1.5 text-center text-xs font-medium text-white transition-all hover:bg-gray-800 hover:scale-[1.02] dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            查看作品
          </Link>
          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-6 w-6 items-center justify-center rounded-lg border border-gray-200/80 text-gray-600 transition-all hover:bg-gray-50 hover:scale-105 dark:border-gray-700/80 dark:text-gray-400 dark:hover:bg-gray-800"
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
