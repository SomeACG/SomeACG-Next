'use client';
import { PopularArtist } from '@/lib/type';
import { cva } from 'class-variance-authority';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ArtistCard from './ArtistCard';

const masonryGridVariants = cva('grid w-full gap-4', {
  variants: {
    columns: {
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
    },
  },
  defaultVariants: {
    columns: 2,
  },
});

interface ArtistItem {
  artist: PopularArtist;
  index: number;
  estimatedHeight: number; // Estimated height for layout calculation
}

interface ArtistsMasonryGridProps {
  artists: PopularArtist[];
  loadMore: () => Promise<void>;
  hasMore: boolean | undefined;
  isLoading: boolean;
}

const ArtistsMasonryGrid: React.FC<ArtistsMasonryGridProps> = ({ artists, loadMore, hasMore, isLoading }) => {
  const loadingRef = useRef<HTMLDivElement>(null);

  // Convert artists to items with estimated heights
  const artistItems: ArtistItem[] = artists.map((artist, index) => ({
    artist,
    index,
    estimatedHeight: getEstimatedHeight(artist),
  }));

  // Estimate card height based on artist data and aspect ratios
  function getEstimatedHeight(artist: PopularArtist): number {
    let baseHeight = 200; // Base content height (padding, text, buttons)

    // Determine likely aspect ratio and add corresponding image height
    const isLikelyPortrait = artist.artworkCount % 3 === 0; // Every 3rd artist gets portrait treatment
    const isLikelySquare = artist.artworkCount % 4 === 0; // Every 4th artist gets square treatment

    if (isLikelyPortrait) {
      // Portrait: aspect-[3/4] - roughly 300px wide becomes 400px tall
      baseHeight += 300; // Portrait image height
      baseHeight += 40; // Add extra height for portrait label overlay
    } else if (isLikelySquare) {
      // Square: aspect-square - 300px wide becomes 300px tall
      baseHeight += 250; // Square image height
    } else {
      // Landscape: aspect-[4/3] - 300px wide becomes 225px tall
      baseHeight += 200; // Landscape image height
    }

    // Add height based on content
    if (artist.author && artist.author.length > 15) {
      baseHeight += 30; // Longer names need more space
    }

    // Add small random variation to avoid too uniform layout
    const variation = Math.random() * 40 - 20; // -20 to +20 pixels

    return Math.max(250, baseHeight + variation);
  }

  // Distribute artists into columns for masonry layout
  const getColumns = (items: ArtistItem[], columnCount: number) => {
    const columns: ArtistItem[][] = Array.from({ length: columnCount }, () => []);
    const columnHeights = new Array(columnCount).fill(0);

    items.forEach((item) => {
      // Find the column with minimum height
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      columns[shortestColumnIndex].push(item);
      columnHeights[shortestColumnIndex] += item.estimatedHeight;
    });

    return columns;
  };

  // Handle infinite scroll
  const handleObserver = useCallback(
    async (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && !isLoading && hasMore === true) {
        await loadMore();
      }
    },
    [isLoading, hasMore, loadMore],
  );

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(handleObserver, options);

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [handleObserver]);

  // Responsive column count
  const getColumnCount = () => {
    if (typeof window === 'undefined') return 2;
    if (window.innerWidth >= 1280) return 4; // xl
    if (window.innerWidth >= 1024) return 3; // lg
    if (window.innerWidth >= 640) return 2; // sm
    return 1; // mobile
  };

  const [columnCount, setColumnCount] = useState(getColumnCount());

  useEffect(() => {
    const handleResize = () => {
      setColumnCount(getColumnCount());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const columns = getColumns(artistItems, columnCount);

  return (
    <div className="w-full">
      {/* Masonry Grid with CSS Grid Auto-fit */}
      <div
        className="grid w-full gap-6"
        style={{
          gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
          gridAutoRows: 'auto',
        }}
      >
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="flex flex-col gap-6">
            {column.map((item) => (
              <div key={`${item.artist.platform}-${item.artist.authorid}`} className="w-full break-inside-avoid">
                <ArtistCard artist={item.artist} index={item.index} />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Loading trigger and indicators */}
      <div ref={loadingRef} className="mt-8 flex h-20 items-center justify-center">
        {isLoading && (
          <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 px-8 py-6 backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-900/10">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-2 right-2 h-8 w-8 rounded-full bg-blue-400/20 blur-lg" />
              <div className="absolute bottom-2 left-2 h-10 w-10 rounded-full bg-purple-400/20 blur-lg" />
            </div>

            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 opacity-50" />

            <div className="relative z-10 flex items-center space-x-4">
              <div className="relative">
                {/* Outer rotating ring */}
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent border-t-blue-500/60 border-r-purple-500/60" />
                {/* Inner pulsing circle */}
                <div className="absolute inset-1 animate-pulse rounded-full bg-gradient-to-br from-blue-400/40 to-purple-400/40" />
              </div>
              <div className="space-y-1">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-sm font-medium text-transparent dark:from-blue-400 dark:to-purple-400">
                  加载更多画师
                </div>
                <div className="text-xs text-gray-500/80 dark:text-gray-400/80">正在获取更多精彩内容...</div>
              </div>
            </div>
          </div>
        )}

        {!hasMore && artists.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl border border-gray-200/30 bg-gradient-to-br from-gray-50/80 via-white/60 to-gray-50/80 px-8 py-6 shadow-lg shadow-gray-100/20 backdrop-blur-xl dark:border-gray-700/30 dark:from-gray-800/20 dark:via-gray-700/15 dark:to-gray-800/20 dark:shadow-gray-900/20">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-2 right-2 h-8 w-8 rounded-full bg-gray-400/15 blur-lg" />
              <div className="absolute bottom-2 left-2 h-10 w-10 rounded-full bg-blue-400/15 blur-lg" />
            </div>

            <div className="relative z-10 flex items-center space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-400/20 to-blue-400/20 ring-2 ring-gray-200/40 dark:ring-gray-700/40">
                <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">已加载全部画师</div>
                <div className="text-xs text-gray-500/80 dark:text-gray-400/80">共 {artists.length} 位画师</div>
              </div>
            </div>

            {/* Subtle decorative line */}
            <div className="absolute bottom-0 left-1/2 h-px w-16 -translate-x-1/2 bg-gradient-to-r from-transparent via-gray-300/50 to-transparent dark:via-gray-600/50" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistsMasonryGrid;
