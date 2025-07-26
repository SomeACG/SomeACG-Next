'use client';

import { ImageItem } from '@/app/(home)/components/ImageItem';
import { ImageToolbar } from '@/app/(home)/components/ImageToolbar';
import { ClientOnly } from '@/components/common/ClientOnly';
import Loader from '@/components/ui/loading/Loader';
import MasonryGrid from '@/components/ui/MasonryGrid';
import { useArtistInfo, useInfiniteArtistImages } from '@/lib/hooks/useImages';
import { ImageWithTag, Platform } from '@/lib/type';
import { genArtistUrl } from '@/lib/utils';
import { useCallback, useMemo, useState } from 'react';
import { FaCalendar, FaExternalLinkAlt, FaHashtag, FaImages } from 'react-icons/fa';
import { FaSquareXTwitter } from 'react-icons/fa6';
import { SiPixiv } from 'react-icons/si';
import { PhotoProvider } from 'react-photo-view';

type ArtistClientProps = {
  platform: string;
  uid: string;
  initialData?: {
    images: ImageWithTag[];
    total: number;
  };
};

// Image item interface for MasonryGrid
interface ImageGridItem {
  id: string;
  width: number;
  height: number;
  payload: ImageWithTag;
}

export default function ArtistClient({ platform, uid, initialData }: ArtistClientProps) {
  const pageSize = 24;

  const { artistInfo, isLoading: isInfoLoading, isError: isInfoError } = useArtistInfo(platform, uid);
  const {
    allImages,
    total,
    isLoading: isImagesLoading,
    error: imagesError,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteArtistImages(platform, uid, pageSize, initialData);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState(0);
  const COOLDOWN_TIME = 1000; // 1秒冷却时间

  // 包装fetchNextPage函数使其返回Promise<void>，并添加冷却时间控制
  const handleLoadMore = useCallback(async () => {
    const now = Date.now();
    if (isLoadingMore || now - lastLoadTime < COOLDOWN_TIME) {
      return;
    }

    try {
      setIsLoadingMore(true);
      await fetchNextPage();
      setLastLoadTime(now);
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchNextPage, isLoadingMore, lastLoadTime]);

  const externalArtistUrl = genArtistUrl(platform, {
    uid,
    username: artistInfo?.author ?? '',
  });

  // 转换图片数据格式以匹配MasonryGrid需要的接口
  const gridItems: ImageGridItem[] = useMemo(
    () =>
      allImages.map((image) => ({
        id: image.id.toString(),
        width: image.width || 800, // 设置默认宽度
        height: image.height || 600, // 设置默认高度
        payload: image,
      })),
    [allImages],
  );

  // Render function for image items
  const renderImageItem = useCallback((item: ImageGridItem, index: number) => <ImageItem data={item.payload} />, []);

  // Shared styles
  const glassCard = 'border border-white/20 bg-white/10 backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-900/10';
  const errorCard =
    'group relative overflow-hidden rounded-2xl border border-red-200/30 bg-gradient-to-br from-red-50/80 via-pink-50/60 to-red-50/80 p-8 shadow-2xl shadow-red-100/30 backdrop-blur-xl transition-all duration-500 hover:shadow-red-100/40 dark:border-red-800/30 dark:from-red-900/20 dark:via-red-800/15 dark:to-red-900/20 dark:shadow-red-900/20';
  const emptyCard =
    'group relative overflow-hidden rounded-2xl border border-gray-200/30 bg-gradient-to-br from-gray-50/80 via-white/60 to-gray-50/80 p-8 shadow-2xl shadow-gray-100/30 backdrop-blur-xl transition-all duration-500 hover:shadow-gray-100/40 dark:border-gray-700/30 dark:from-gray-800/20 dark:via-gray-700/15 dark:to-gray-800/20 dark:shadow-gray-900/20';
  const statCard =
    'group rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:border-white/25 dark:border-gray-700/30 dark:bg-gray-800/10 dark:hover:bg-gray-800/15';
  const iconBox = 'rounded-xl p-2 transition-transform duration-300 group-hover:scale-110';

  if (isInfoError) {
    return (
      <div className="px-4 py-8 text-center">
        <div className={errorCard}>
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-4 right-4 h-16 w-16 rounded-full bg-red-400/20 blur-xl" />
            <div className="absolute bottom-4 left-4 h-20 w-20 rounded-full bg-pink-400/20 blur-xl" />
          </div>

          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-400/20 via-pink-400/20 to-red-400/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <div className="relative z-10 flex flex-col items-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-400/20 to-pink-400/20 ring-4 ring-red-200/30 dark:ring-red-800/30">
              <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="space-y-2 text-center">
              <div className="text-xl font-semibold text-red-600 dark:text-red-400">画师信息加载失败</div>
              <div className="text-sm text-red-500/80 dark:text-red-400/80">请检查网络连接后重试</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isInfoLoading || !artistInfo) {
    return <Loader className="mt-8" />;
  }

  const getPlatformIcon = () => {
    switch (platform) {
      case Platform.Pixiv:
        return <SiPixiv className="text-blue-500" />;
      case Platform.Twitter:
        return <FaSquareXTwitter className="text-black dark:text-white" />;
      default:
        return null;
    }
  };

  const getPlatformColor = () => {
    switch (platform) {
      case Platform.Pixiv:
        return 'from-blue-500 to-cyan-500';
      case Platform.Twitter:
        return 'from-blue-400 to-blue-600';
      default:
        return 'from-purple-500 to-blue-500';
    }
  };

  return (
    <ClientOnly>
      <div className="relative min-h-screen">
        {/* Background decoration */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute top-40 right-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute bottom-20 left-1/3 h-80 w-80 rounded-full bg-pink-500/10 blur-3xl" />
        </div>

        <div className="px-4 py-8">
          {/* Artist header */}
          <div className={`relative mb-8 overflow-hidden rounded-2xl p-8 ${glassCard}`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${getPlatformColor()} opacity-5`} />
            <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-purple-500/20 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl" />

            <div className="relative z-10">
              {/* Avatar and title */}
              <div className="mb-6 flex flex-col items-center gap-6 sm:flex-row">
                <div className="group relative">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-400/20 to-blue-400/20 text-4xl ring-4 ring-white/20 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:ring-white/30 dark:ring-gray-700/30 dark:group-hover:ring-gray-600/40">
                    <div className="transition-transform duration-300 group-hover:scale-110">{getPlatformIcon()}</div>
                  </div>
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 blur-sm" />
                </div>

                <div className="text-center sm:text-left">
                  <h1 className="mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-gray-200">
                    {artistInfo.author}
                  </h1>
                  <div className="flex items-center justify-center gap-2 rounded-full bg-white/20 px-4 py-2 text-lg font-medium text-gray-600 backdrop-blur-sm transition-all duration-300 hover:bg-white/25 sm:justify-start dark:bg-gray-800/20 dark:text-gray-400 dark:hover:bg-gray-800/25">
                    <div className="transition-transform duration-300 hover:scale-110">{getPlatformIcon()}</div>
                    <span className="capitalize">{platform} 画师</span>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className={statCard}>
                  <div className="flex items-center gap-3">
                    <div className={`${iconBox} bg-blue-500/20`}>
                      <FaImages className="rounded-xl text-blue-500" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">作品数量</div>
                      <div className="text-xl font-bold">{artistInfo.artworkCount}</div>
                    </div>
                  </div>
                </div>

                <div className={statCard}>
                  <div className="flex items-center gap-3">
                    <div className={`${iconBox} bg-purple-500/20`}>
                      <FaHashtag className="text-purple-500" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">画师ID</div>
                      <div className="text-xl font-bold">{uid}</div>
                    </div>
                  </div>
                </div>

                <div className={statCard}>
                  <div className="flex items-center gap-3">
                    <div className={`${iconBox} bg-green-500/20`}>
                      <FaCalendar className="text-green-500" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">平台</div>
                      <div className="text-xl font-bold capitalize">{platform}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* External link */}
              {externalArtistUrl && (
                <div className="mt-6 flex items-center justify-between gap-5 md:flex-col">
                  <a
                    href={externalArtistUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600/50 to-blue-600/50 px-6 py-3 font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:from-purple-700/50 hover:to-blue-700/50 hover:shadow-lg hover:shadow-purple-500/25"
                  >
                    <div className="absolute inset-0 translate-x-[-200%] -skew-x-12 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-700 group-hover:translate-x-[200%]" />
                    <span className="relative capitalize">在 {platform} 上查看</span>
                    <div className="relative transition-transform duration-300 group-hover:translate-x-0.5">
                      <FaExternalLinkAlt className="text-sm" />
                    </div>
                  </a>
                  <div className="group rounded-xl border border-gray-200/30 bg-gray-50/30 px-3 py-2 backdrop-blur-sm transition-all duration-300 hover:bg-gray-100/40 dark:border-gray-700/30 dark:bg-gray-800/30 dark:hover:bg-gray-700/40">
                    <p className="text-center text-xs text-gray-500/90 transition-colors duration-300 group-hover:text-gray-600 dark:text-gray-400/90 dark:group-hover:text-gray-300">
                      💡 画师可能在不同平台使用不同账号，本页面信息仅供参考
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Artworks */}
          <div className="mb-8">
            <div className="mb-6 text-center">
              <div className={`inline-flex items-center gap-3 rounded-xl px-6 py-3 ${glassCard}`}>
                <div className="rounded-full bg-gradient-to-r from-purple-500/80 to-blue-500/80 p-2">
                  <FaImages className="text-white" />
                </div>
                <h2 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-gray-200">
                  作品集
                </h2>
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                共收藏 <span className="font-semibold text-purple-600 dark:text-purple-400">{total || 0}</span> 件作品
              </p>
            </div>

            {imagesError ? (
              <div className="flex-center min-h-[300px]">
                <div className={errorCard}>
                  {/* Background decoration */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-4 right-4 h-16 w-16 rounded-full bg-red-400/20 blur-xl" />
                    <div className="absolute bottom-4 left-4 h-20 w-20 rounded-full bg-pink-400/20 blur-xl" />
                  </div>

                  {/* Animated gradient border */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-400/20 via-pink-400/20 to-red-400/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative z-10 flex flex-col items-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-400/20 to-pink-400/20 ring-4 ring-red-200/30 dark:ring-red-800/30">
                      <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="space-y-2 text-center">
                      <div className="text-xl font-semibold text-red-600 dark:text-red-400">作品加载失败</div>
                      <div className="text-sm text-red-500/80 dark:text-red-400/80">请刷新页面重试</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : isImagesLoading ? (
              <div className="flex-center min-h-[300px]">
                <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-900/10">
                  {/* Background decoration */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-4 right-4 h-16 w-16 rounded-full bg-blue-400/20 blur-xl" />
                    <div className="absolute bottom-4 left-4 h-20 w-20 rounded-full bg-purple-400/20 blur-xl" />
                  </div>

                  {/* Animated gradient border */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 opacity-50" />

                  <div className="relative z-10 flex flex-col items-center space-y-6">
                    <div className="relative">
                      {/* Outer rotating ring */}
                      <div className="h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-blue-500/60 border-r-purple-500/60" />
                      {/* Inner pulsing circle */}
                      <div className="absolute inset-2 animate-pulse rounded-full bg-gradient-to-br from-blue-400/30 to-purple-400/30" />
                      {/* Center icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FaImages className="h-6 w-6 text-blue-500" />
                      </div>
                    </div>
                    <div className="space-y-2 text-center">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-semibold text-transparent dark:from-blue-400 dark:to-purple-400">
                        加载作品中
                      </div>
                      <div className="text-sm text-gray-500/80 dark:text-gray-400/80">正在获取画师的精彩作品...</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : !allImages?.length ? (
              <div className="flex-center min-h-[300px]">
                <div className={emptyCard}>
                  {/* Background decoration */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-4 right-4 h-16 w-16 rounded-full bg-gray-400/20 blur-xl" />
                    <div className="absolute bottom-4 left-4 h-20 w-20 rounded-full bg-blue-400/20 blur-xl" />
                  </div>

                  {/* Animated gradient border */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gray-400/10 via-blue-400/10 to-gray-400/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative z-10 flex flex-col items-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-400/20 to-blue-400/20 ring-4 ring-gray-200/30 dark:ring-gray-700/30">
                      <FaImages className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="space-y-2 text-center">
                      <div className="text-xl font-semibold text-gray-600 dark:text-gray-400">该画师暂无作品</div>
                      <div className="text-sm text-gray-500/80 dark:text-gray-400/80">
                        画师可能还没有上传作品，请稍后再来看看
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <PhotoProvider
                toolbarRender={({ onRotate, onScale, rotate, scale }) => (
                  <ImageToolbar {...{ onRotate, onScale, rotate, scale }} />
                )}
              >
                <ClientOnly>
                  {allImages.length > 0 ? (
                    <MasonryGrid
                      items={gridItems}
                      loadMore={handleLoadMore}
                      hasMore={hasNextPage}
                      isLoading={isLoadingMore}
                      renderItem={renderImageItem}
                    />
                  ) : (
                    <div className="flex-center min-h-[200px]">
                      <div className="text-lg">该画师暂无作品</div>
                    </div>
                  )}
                </ClientOnly>
              </PhotoProvider>
            )}
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
