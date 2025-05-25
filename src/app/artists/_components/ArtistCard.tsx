'use client';

import ImageFb from '@/components/common/ImageFb';
import { PopularArtist } from '@/lib/type';
import { genArtistUrl, getImageThumbUrl, transformPixivUrl } from '@/lib/utils';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { FaCalendar, FaExternalLinkAlt, FaHashtag, FaImages, FaUser } from 'react-icons/fa';
import { FaSquareXTwitter } from 'react-icons/fa6';
import { SiPixiv } from 'react-icons/si';
import { PhotoView } from 'react-photo-view';

type ArtistCardProps = {
  artist: PopularArtist;
  index: number;
};

export default function ArtistCard({ artist, index }: ArtistCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const { platform, authorid, author, artworkCount, latestImageThumb, lastUpdateTime, latestImageFilename } = artist;

  const getPlatformIcon = () => {
    switch (platform) {
      case 'pixiv':
        return <SiPixiv className="h-4 w-4" />;
      case 'twitter':
        return <FaSquareXTwitter className="h-4 w-4" />;
      default:
        return <FaUser className="h-4 w-4" />;
    }
  };

  const getPlatformColor = () => {
    switch (platform) {
      case 'pixiv':
        return 'from-blue-600 to-blue-800'; // Pixiv深蓝色
      case 'twitter':
        return 'from-black to-black'; // X/Twitter的黑色主题
      default:
        return 'from-purple-500 to-indigo-600';
    }
  };

  const getPlatformShadow = () => {
    switch (platform) {
      case 'pixiv':
        return 'group-hover:shadow-blue-500/50';
      case 'twitter':
        return 'group-hover:shadow-black/50';
      default:
        return 'group-hover:shadow-purple-500/50';
    }
  };

  const getRankBadgeStyle = () => {
    if (index < 3) {
      return 'from-amber-400 via-orange-400 to-red-500';
    }
    if (index < 10) {
      return 'from-slate-400 via-slate-500 to-slate-600';
    }
    return 'from-blue-500 via-indigo-500 to-purple-600';
  };

  const getRankGlow = () => {
    if (index < 3) {
      return 'shadow-amber-400/30 group-hover:shadow-amber-400/50';
    }
    if (index < 10) {
      return 'shadow-slate-400/30 group-hover:shadow-slate-400/50';
    }
    return 'shadow-blue-400/30 group-hover:shadow-blue-400/50';
  };

  const externalUrl = genArtistUrl(platform, { uid: authorid ?? '', username: author ?? '' });
  const internalUrl = `/artist/${platform}/${authorid}`;

  const thumbShowUrl = useMemo(
    () => getImageThumbUrl({ thumbUrl: latestImageThumb ?? '', platform, filename: latestImageFilename }),
    [latestImageThumb, platform, latestImageFilename],
  );
  const [realShowUrl, setRealShowUrl] = useState(thumbShowUrl?.s3ThumbUrl ?? '');
  const onImgFallback = useCallback((fallbackSrc: string) => {
    setRealShowUrl(fallbackSrc);
  }, []);

  const thumbUrl = useMemo(() => {
    if (!latestImageThumb) return '';
    return transformPixivUrl(latestImageThumb);
  }, [latestImageThumb]);

  const formatDate = (date: Date | null) => {
    if (!date) return '未知';
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  // Check if image is portrait (taller than wide) or simulate portrait for demo
  const isPortrait = imageDimensions ? imageDimensions.height > imageDimensions.width : artworkCount % 3 === 0; // Every 3rd artist gets portrait treatment

  // Calculate aspect ratio for responsive image display
  const getImageAspectRatio = () => {
    if (!imageDimensions) {
      // Default aspect ratios for different image types
      return isPortrait ? 'aspect-[3/4]' : 'aspect-[4/3]';
    }

    const ratio = imageDimensions.width / imageDimensions.height;

    if (ratio < 0.8) {
      // Very tall image (portrait)
      return 'aspect-[3/4]';
    } else if (ratio < 1.2) {
      // Square-ish image
      return 'aspect-square';
    } else {
      // Wide image (landscape)
      return 'aspect-[4/3]';
    }
  };

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
    setImageLoaded(true);
  };

  // Glass card style to match the main UI
  const glassCard = 'border border-white/20 bg-white/10 backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-900/10';

  return (
    <div
      className={`group relative overflow-visible rounded-3xl shadow-lg transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl ${glassCard}`}
    >
      {/* Dynamic background decoration that follows card */}
      <div className="absolute -inset-4 opacity-0 transition-all duration-500 group-hover:opacity-100">
        <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-2xl" />
        <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500/20 to-teal-500/20 blur-2xl" />
        <div className="absolute top-1/2 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-yellow-500/15 to-orange-500/15 blur-xl" />
      </div>

      {/* Refined rank badge*/}
      <div className="absolute -top-2 -left-2 z-20">
        <div className="relative">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-semibold text-white shadow-lg transition-all duration-500 group-hover:scale-105 ${getRankBadgeStyle()} ${getRankGlow()}`}
          >
            <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative z-10">{index + 1}</span>
          </div>
          {/* Subtle decorative accent */}
          <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-white/40 opacity-0 transition-all duration-300 group-hover:scale-125 group-hover:opacity-80" />
        </div>
      </div>

      {/* Image section with creative masking and responsive aspect ratio */}
      <div
        className={`relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 ${getImageAspectRatio()}`}
      >
        {thumbUrl && !imageError ? (
          <PhotoView src={thumbUrl}>
            <div className="relative h-full w-full cursor-pointer overflow-hidden rounded-t-3xl">
              <ImageFb
                src={thumbShowUrl.s3ThumbUrl}
                fallbackSrc={thumbShowUrl.transformThumbUrl}
                onImgFallback={onImgFallback}
                alt={author || '画师作品'}
                loading="lazy"
                fill
                decoding="async"
                className={`h-full w-full cursor-pointer rounded-lg object-cover shadow-md transition-all duration-300 ${
                  imageLoaded ? 'group-hover:scale-105' : 'opacity-0'
                } group-hover:scale-105`}
                onLoad={handleImageLoad}
              />
              {/* Loading skeleton */}
              {!imageLoaded && (
                <div className="absolute inset-0 animate-pulse rounded-t-3xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
              )}

              {/* Creative hover overlay with animated elements */}
              <div className="absolute inset-0 rounded-t-3xl bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-all duration-500 group-hover:opacity-100">
                {/* Floating sparkles */}
                <div className="absolute top-4 left-4 h-2 w-2 rounded-full bg-white/60 opacity-0 transition-all duration-700 group-hover:-translate-y-2 group-hover:translate-x-2 group-hover:opacity-100" />
                <div className="absolute top-8 right-6 h-1.5 w-1.5 rounded-full bg-white/40 opacity-0 transition-all duration-1000 group-hover:-translate-x-3 group-hover:translate-y-1 group-hover:opacity-100" />
                <div className="absolute bottom-6 left-8 h-1 w-1 rounded-full bg-white/50 opacity-0 transition-all duration-500 group-hover:-translate-y-3 group-hover:translate-x-1 group-hover:opacity-100" />
              </div>
            </div>
          </PhotoView>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400 dark:text-gray-600">
            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                  {getPlatformIcon()}
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">暂无预览</p>
            </div>
          </div>
        )}
      </div>

      {/* Content section with asymmetric layout */}
      <div className="relative p-5">
        {/* Platform badge */}
        <div className="absolute top-4 right-4 z-10">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 ${getPlatformColor()} ${getPlatformShadow()}`}
          >
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative z-10">{getPlatformIcon()}</div>
          </div>
          {/* Platform Effect */}
          <div
            className={`absolute inset-0 rounded-xl opacity-30 blur-lg transition-all duration-500 group-hover:opacity-60 ${getPlatformColor()}`}
          />
        </div>

        <div className="mb-4 transform transition-transform duration-300 group-hover:-rotate-1">
          <h3 className="mb-2 truncate bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-lg font-bold text-transparent dark:from-white dark:via-gray-200 dark:to-white">
            {author || '未知画师'}
          </h3>
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 px-3 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 dark:text-gray-300">
            <FaHashtag className="h-3 w-3" />
            <span className="truncate">{authorid}</span>
          </div>
        </div>
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-3 ring-1 shadow-lg ring-blue-500/30 backdrop-blur-sm">
              <FaImages className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">作品收录</div>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
                {artworkCount}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 p-3 ring-1 shadow-lg ring-green-500/30 backdrop-blur-sm">
              <FaCalendar className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400">最近更新</div>
              <div className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-lg font-semibold text-transparent">
                {formatDate(lastUpdateTime)}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons with creative layout */}
        <div className="flex items-center gap-3">
          <Link
            href={internalUrl}
            className="group/btn relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600/50 to-blue-600/50 px-5 py-3.5 text-center text-sm font-bold text-white shadow-lg transition-all duration-500 hover:scale-[1.01] hover:shadow-xl hover:shadow-purple-900/30"
          >
            <div className="absolute inset-0 translate-x-[-200%] -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-[200%]" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-700/50 to-blue-700/50 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
            <span className="relative z-10 transition-transform duration-300 group-hover/btn:scale-105">查看作品</span>
          </Link>

          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/external relative overflow-hidden rounded-2xl border-2 border-white/20 bg-white/10 p-3.5 backdrop-blur-sm transition-all duration-500 hover:scale-110 hover:rotate-3 hover:border-white/40 hover:bg-white/20 dark:border-gray-700/30 dark:bg-gray-800/10 dark:hover:bg-gray-800/20"
              title="访问原平台"
            >
              {/* <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover/external:opacity-100" /> */}
              <FaExternalLinkAlt className="relative h-4 w-4 text-gray-600 transition-colors duration-300 group-hover/external:text-gray-800 dark:text-gray-400 dark:group-hover/external:text-gray-200" />
            </a>
          )}
        </div>

        {/* Floating decorative elements */}
        <div className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 opacity-0 transition-all duration-700 group-hover:scale-125 group-hover:rotate-45 group-hover:opacity-100" />
        <div className="absolute top-2 -left-1 h-4 w-4 rounded-full bg-gradient-to-br from-pink-400/30 to-purple-500/30 opacity-0 transition-all duration-500 group-hover:translate-x-2 group-hover:opacity-100" />
      </div>
    </div>
  );
}
