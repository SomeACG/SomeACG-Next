'use client';

import { ClientOnly } from '@/components/common/ClientOnly';
import MasonryGrid from '@/components/ui/MasonryGrid';
import { useInfinitePopularArtists } from '@/lib/hooks/usePopularArtists';
import { PopularArtist } from '@/lib/type';
import { AnimatePresence } from 'motion/react';
import { useCallback, useMemo, useState } from 'react';
import { FaFire, FaRandom, FaSort, FaTrophy, FaUsers } from 'react-icons/fa';
import { PhotoProvider } from 'react-photo-view';
import { ImageToolbar } from '../../(home)/components/ImageToolbar';
import ArtistCard from './ArtistCard';

type SortType = 'artworks' | 'random';

const pageSize = 20;

// Artist item interface for MasonryGrid
interface ArtistItem {
  id: string;
  artist: PopularArtist;
  estimatedHeight: number;
}

export default function ArtistsClient() {
  const [sortBy, setSortBy] = useState<SortType>('artworks');

  const { allArtists, total, isLoading, error, hasNextPage, fetchNextPage, mutate, isValidating } = useInfinitePopularArtists(
    pageSize,
    sortBy,
  );

  // Estimate card height based on artist data
  const getEstimatedHeight = useCallback((artist: PopularArtist): number => {
    let baseHeight = 200; // Base content height (padding, text, buttons)

    // 使用与 ArtistCard 一致的宽高比计算逻辑
    const isPortrait = artist.artworkCount % 3 === 0; // Every 3rd artist gets portrait treatment
    const isSquare = artist.artworkCount % 4 === 0; // Every 4th artist gets square treatment

    // 假设卡片宽度约为 300px，根据 paddingBottom 比例计算图片高度
    const assumedWidth = 300;
    let imageHeight: number;

    if (isPortrait) {
      imageHeight = assumedWidth * (133.33 / 100); // 3:4 portrait ratio
    } else if (isSquare) {
      imageHeight = assumedWidth * (100 / 100); // 1:1 square ratio
    } else {
      imageHeight = assumedWidth * (75 / 100); // 4:3 landscape ratio (default)
    }

    baseHeight += imageHeight;

    // Add height based on content (fixed, no random)
    if (artist.author && artist.author.length > 15) {
      baseHeight += 30; // Longer names need more space
    }

    return Math.max(250, baseHeight);
  }, []);

  // Convert artists to MasonryGrid items
  const artistItems: ArtistItem[] = useMemo(
    () =>
      allArtists.map((artist, index) => ({
        id: `${artist.platform}-${artist.authorid}`,
        artist,
        estimatedHeight: getEstimatedHeight(artist),
      })),
    [allArtists, getEstimatedHeight],
  );

  const handleSortChange = async (newSortBy: SortType) => {
    if (newSortBy === sortBy) return;
    setSortBy(newSortBy);
    // Clear current data and refetch
    await mutate();
  };

  const handleLoadMore = useCallback(async () => {
    if (!hasNextPage || isValidating) {
      return;
    }

    try {
      await fetchNextPage();
      console.log('✅ Successfully loaded more artists');
    } catch (error) {
      console.error('❌ Failed to load more artists:', error);
    }
  }, [fetchNextPage, hasNextPage, isValidating]);

  // Custom column count for artists page
  const getColumnCount = useCallback(() => {
    if (typeof window === 'undefined') return 2;
    if (window.innerWidth >= 1280) return 4; // xl
    if (window.innerWidth >= 1024) return 3; // lg
    if (window.innerWidth >= 640) return 2; // sm
    return 1; // mobile
  }, []);

  // Render function for artist items
  const renderArtistItem = useCallback(
    (item: ArtistItem, index: number) => <ArtistCard artist={item.artist} index={index} />,
    [],
  );

  const glassCard = 'border border-white/20 bg-white/10 backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-900/10';
  const errorCard =
    'group relative overflow-hidden rounded-2xl border border-red-200/30 bg-gradient-to-br from-red-50/80 via-pink-50/60 to-red-50/80 p-8 shadow-2xl shadow-red-100/30 backdrop-blur-xl transition-all duration-500 hover:shadow-red-100/40 dark:border-red-800/30 dark:from-red-900/20 dark:via-red-800/15 dark:to-red-900/20 dark:shadow-red-900/20';
  const statCard =
    'group rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:border-white/25 dark:border-gray-700/30 dark:bg-gray-800/10 dark:hover:bg-gray-800/15';
  const iconBox = 'rounded-xl p-2 transition-transform duration-300 group-hover:scale-110';

  return (
    <ClientOnly>
      <PhotoProvider
        toolbarRender={({ onRotate, onScale, rotate, scale }) => <ImageToolbar {...{ onRotate, onScale, rotate, scale }} />}
        maskOpacity={0.8}
        loadingElement={
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        }
      >
        <div className="relative mx-auto min-h-screen max-w-screen-xl">
          <div className="fixed inset-0 -z-10">
            <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
            <div className="absolute top-40 right-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute bottom-20 left-1/3 h-80 w-80 rounded-full bg-pink-500/10 blur-3xl" />
          </div>

          <div className="px-4 py-8">
            <div className={`relative mb-8 overflow-hidden rounded-2xl p-8 ${glassCard}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
              <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-purple-500/20 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl" />
              <div className="relative z-10">
                <div className="mb-6 flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
                  <div className="flex flex-col items-center gap-6 sm:flex-row">
                    <div className="group relative">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-400/20 to-blue-400/20 text-4xl ring-4 ring-white/20 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:ring-white/30 dark:ring-gray-700/30 dark:group-hover:ring-gray-600/40">
                        <div className="transition-transform duration-300 group-hover:scale-110">
                          <FaTrophy className="text-yellow-500" />
                        </div>
                      </div>
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 blur-sm" />
                    </div>

                    <div className="text-center sm:text-left">
                      <h1 className="mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-gray-200">
                        XP 画师榜
                      </h1>
                      <div className="flex items-center justify-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-lg font-medium text-gray-600 backdrop-blur-sm transition-all duration-300 hover:bg-white/25 sm:justify-start dark:bg-gray-800/20 dark:text-gray-400 dark:hover:bg-gray-800/25">
                        <div className="transition-transform duration-300 hover:scale-110">
                          <FaUsers className="text-purple-500" />
                        </div>
                        <span className="hidden sm:inline">
                          这里聚集着最能戳中你 XP 的宝藏画师们，快来发现你的命定画师吧～ ✨
                        </span>
                        <span className="sm:hidden">发现你的命定画师 ✨</span>
                      </div>
                    </div>
                  </div>

                  {/* Statistics - 右侧 */}
                  {total > 0 && (
                    <div className="flex-shrink-0">
                      <div className={`inline-flex items-center gap-3 rounded-2xl px-6 py-3 ${statCard}`}>
                        <div className={`${iconBox} bg-pink-500/20`}>
                          <FaUsers className="text-pink-500" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">已收录宝藏画师</div>
                          <div className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-xl font-bold text-transparent">
                            {total} 位
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-gradient-to-r from-purple-500/80 to-blue-500/80 p-2">
                      <FaSort className="text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-lg font-semibold text-transparent dark:from-white dark:to-gray-200">
                      排序方式
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSortChange('artworks')}
                      className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                        sortBy === 'artworks'
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg hover:from-purple-600 hover:to-blue-600 hover:shadow-purple-500/25'
                          : 'bg-white/20 text-gray-700 hover:bg-white/30 dark:bg-gray-800/20 dark:text-gray-300 dark:hover:bg-gray-700/30'
                      }`}
                    >
                      <div className="absolute inset-0 translate-x-[-200%] -skew-x-12 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-700 group-hover:translate-x-[200%]" />
                      <FaFire className="relative text-sm transition-transform duration-300 group-hover:scale-110" />
                      <span className="relative">作品多多</span>
                    </button>

                    <button
                      onClick={() => handleSortChange('random')}
                      className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-6 py-3 font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                        sortBy === 'random'
                          ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg hover:from-green-600 hover:to-teal-600 hover:shadow-green-500/25'
                          : 'bg-white/20 text-gray-700 hover:bg-white/30 dark:bg-gray-800/20 dark:text-gray-300 dark:hover:bg-gray-700/30'
                      }`}
                    >
                      <div className="absolute inset-0 translate-x-[-200%] -skew-x-12 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-700 group-hover:translate-x-[200%]" />
                      <FaRandom className="relative text-sm transition-transform duration-300 group-hover:scale-110" />
                      <span className="relative">随缘发现</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Artists Grid - 内容区域标题 */}
            <div className="mb-6">
              {/* Artists Masonry Grid */}
              <AnimatePresence mode="wait">
                {error ? (
                  <div className="flex-center min-h-[300px]">
                    <div className={errorCard}>
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-4 right-4 h-16 w-16 rounded-full bg-red-400/20 blur-xl" />
                        <div className="absolute bottom-4 left-4 h-20 w-20 rounded-full bg-pink-400/20 blur-xl" />
                      </div>

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
                          <div className="text-xl font-semibold text-red-600 dark:text-red-400">加载失败</div>
                          <div className="text-sm text-red-500/80 dark:text-red-400/80">请刷新页面重试</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : isLoading ? (
                  <div className="flex-center min-h-[400px]">
                    <div className={`group relative overflow-hidden rounded-2xl p-8 ${glassCard}`}>
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-4 right-4 h-16 w-16 rounded-full bg-blue-400/20 blur-xl" />
                        <div className="absolute bottom-4 left-4 h-20 w-20 rounded-full bg-purple-400/20 blur-xl" />
                      </div>

                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 opacity-50" />

                      <div className="relative z-10 flex flex-col items-center space-y-6">
                        <div className="relative">
                          <div className="h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-blue-500/60 border-r-purple-500/60" />
                          <div className="absolute inset-2 animate-pulse rounded-full bg-gradient-to-br from-blue-400/30 to-purple-400/30" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FaUsers className="h-6 w-6 text-blue-500" />
                          </div>
                        </div>
                        <div className="space-y-2 text-center">
                          <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-semibold text-transparent dark:from-blue-400 dark:to-purple-400">
                            加载画师中
                          </div>
                          <div className="text-sm text-gray-500/80 dark:text-gray-400/80">
                            正在寻找戳中你 XP 的宝藏画师们...
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <MasonryGrid
                    items={artistItems}
                    hasMore={hasNextPage}
                    loadMore={handleLoadMore}
                    isLoading={isLoading}
                    renderItem={renderArtistItem}
                    enableHover={false}
                    getColumnCount={getColumnCount}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </PhotoProvider>
    </ClientOnly>
  );
}
