'use client';

import { ClientOnly } from '@/components/common/ClientOnly';
import { Button } from '@/components/ui/button';
import { ColumnSlider } from '@/components/ui/ColumnSlider';
import Loader from '@/components/ui/loading/Loader';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import WaterfallGrid from '@/components/ui/WaterfallGrid';
import { useInfinitePopularArtists } from '@/lib/hooks/usePopularArtists';
import { useDynamicColumnWidth } from '@/lib/hooks/useDynamicColumnWidth';
import { PopularArtist } from '@/lib/type';
import { AnimatePresence } from 'motion/react';
import { RefreshCw, Settings, Users } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { PhotoProvider } from 'react-photo-view';
import { ImageToolbar } from '../../(home)/components/ImageToolbar';
import ArtistCard from './ArtistCard';

type SortType = 'artworks' | 'random' | 'lastUpdate';

const pageSize = 20;

// Artist item interface for WaterfallGrid
interface ArtistItem {
  id: string;
  artist: PopularArtist;
  width?: number | null;
  height?: number | null;
}

export default function ArtistsClient() {
  const [sortBy, setSortBy] = useState<SortType>('artworks');

  const { allArtists, total, isLoading, error, hasNextPage, fetchNextPage, mutate, isValidating } = useInfinitePopularArtists(
    pageSize,
    sortBy,
  );

  // 使用动态列宽 hook
  const { columnWidth, columnCount, setContainer } = useDynamicColumnWidth();

  // Calculate dimensions for WaterfallGrid based on artist data
  const getArtistDimensions = useCallback((artist: PopularArtist) => {
    const width = 300;
    const contentHeight = 120; // Height for artist info section (name, stats, buttons)
    
    // Calculate image height based on actual image aspect ratio
    let imageHeight = width * 0.75; // Default 4:3 ratio fallback
    
    if (artist.latestImageWidth && artist.latestImageHeight && 
        artist.latestImageWidth > 0 && artist.latestImageHeight > 0) {
      const aspectRatio = artist.latestImageHeight / artist.latestImageWidth;
      imageHeight = width * aspectRatio;
      
      // Clamp height to reasonable bounds for layout stability
      imageHeight = Math.max(width * 0.5, Math.min(width * 2, imageHeight));
    }
    
    const totalHeight = imageHeight + contentHeight;
    return { width, height: totalHeight };
  }, []);

  // Convert artists to WaterfallGrid items
  const artistItems: ArtistItem[] = useMemo(
    () =>
      allArtists.map((artist) => {
        const dimensions = getArtistDimensions(artist);
        return {
          id: `${artist.platform}-${artist.authorid}`,
          artist,
          width: dimensions.width,
          height: dimensions.height,
        };
      }),
    [allArtists, getArtistDimensions],
  );

  const handleSortChange = async (newSortBy: SortType) => {
    if (newSortBy === sortBy) return;
    setSortBy(newSortBy);
    // Clear current data and refetch
    await mutate();
  };

  const handleRefreshRandom = async () => {
    if (sortBy !== 'random') return;
    // Force refresh random list
    await mutate();
  };

  const handleLoadMore = useCallback(async () => {
    if (!hasNextPage || isValidating) {
      return;
    }

    try {
      await fetchNextPage();
    } catch (error) {
      console.error('❌ Failed to load more artists:', error);
    }
  }, [fetchNextPage, hasNextPage, isValidating]);

  // 直接使用 setContainer 作为 ref callback
  const setContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      setContainer(node);
    },
    [setContainer],
  );

  // Render function for artist items
  const renderArtistItem = useCallback(
    (item: ArtistItem, index?: number) => <ArtistCard artist={item.artist} index={index || 0} />,
    [],
  );

  return (
    <ClientOnly>
      <PhotoProvider
        toolbarRender={({ onRotate, onScale, rotate, scale }) => <ImageToolbar {...{ onRotate, onScale, rotate, scale }} />}
      >
        <div className="space-y-8 px-8 py-4">
          {/* Header Section */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
                <Users className="h-5 w-5" />
                热门画师
              </h2>
              <div className="flex items-center gap-2">
                {total > 0 && <span className="text-sm text-gray-600 dark:text-gray-400">共 {total} 位画师</span>}
                <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 px-2 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Settings className="h-3 w-3" />
                      <span>列数设置</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="leading-none font-medium">列数设置</h4>
                        <p className="text-muted-foreground text-sm">调整画师卡片网格的列数</p>
                      </div>
                      <ColumnSlider min={1} max={6} />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">排序：</span>
              <div className="flex gap-1">
                <Button
                  variant={sortBy === 'artworks' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleSortChange('artworks')}
                  className="h-7 px-3 text-xs"
                >
                  作品数量
                </Button>
                <Button
                  variant={sortBy === 'lastUpdate' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleSortChange('lastUpdate')}
                  className="h-7 px-3 text-xs"
                >
                  最近更新
                </Button>
                <Button
                  variant={sortBy === 'random' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleSortChange('random')}
                  className="h-7 px-3 text-xs"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  随机
                </Button>
              </div>
              {/* Refresh button for random mode */}
              {sortBy === 'random' && (
                <>
                  <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefreshRandom}
                    disabled={isValidating}
                    className="h-7 gap-1.5 px-2 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <RefreshCw className={`h-3 w-3 ${isValidating ? 'animate-spin' : ''}`} />
                    <span>重新随机</span>
                  </Button>
                </>
              )}
            </div>
          </section>

          {/* Artists Grid */}
          <section>
            <AnimatePresence mode="wait">
              {error ? (
                <div className="flex h-[400px] items-center justify-center rounded-xl border border-gray-200/60 bg-white/50 shadow-sm backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-900/50">
                  <div className="text-center">
                    <div className="mb-2 text-lg text-red-500">加载失败</div>
                    <div className="text-sm text-gray-500">请刷新页面重试</div>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="flex h-[400px] items-center justify-center rounded-xl border border-gray-200/60 bg-white/50 shadow-sm backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-900/50">
                  <Loader />
                </div>
              ) : (
                <div ref={setContainerRef} className="w-full">
                  <WaterfallGrid
                    items={artistItems}
                    hasMore={hasNextPage}
                    loadMore={handleLoadMore}
                    isLoading={isValidating}
                    renderItem={renderArtistItem}
                    columnWidth={columnWidth}
                    columnCount={columnCount}
                    gap={4}
                  />
                </div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </PhotoProvider>
    </ClientOnly>
  );
}
