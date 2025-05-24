'use client';
import { ImageItem } from '@/app/(home)/components/ImageItem';
import { ImageWithTag } from '@/lib/type';
import { cva } from 'class-variance-authority';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const masonryGridVariants = cva('grid w-full gap-4', {
  variants: {
    columns: {
      // TODO: 因为目前就需要这么几列，所以先这么写了，tailwind 动态值目前还不支持
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
    },
  },
  defaultVariants: {
    columns: 2,
  },
});

const imageCardVariants = cva('group relative overflow-hidden rounded-lg transition-all duration-300', {
  variants: {
    hover: {
      default: 'hover:z-10 hover:scale-[1.02] hover:shadow-xl',
    },
  },
  defaultVariants: {
    hover: 'default',
  },
});

interface TImageItem {
  id: string;
  height: number;
  width: number;
  payload: ImageWithTag;
}

interface MasonryGridProps {
  items: TImageItem[];
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ items, loadMore, hasMore }) => {
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // 将图片分配到不同的列中，尽量保持每列高度平衡
  const getColumns = (items: TImageItem[], columnCount: number) => {
    const columns: TImageItem[][] = Array.from({ length: columnCount }, () => []);
    const columnHeights = new Array(columnCount).fill(0);

    items.forEach((item) => {
      const aspectRatio = item.width / item.height;
      const normalizedHeight = item.height / item.width; // 归一化高度，考虑宽度会被拉伸到列宽

      if (aspectRatio > 1.2 && columnCount > 1) {
        // 处理宽图：找到最短的两列
        let shortestCol = 0;
        let secondShortestCol = 1;

        for (let i = 0; i < columnCount - 1; i++) {
          if (columnHeights[i] < columnHeights[shortestCol]) {
            secondShortestCol = shortestCol;
            shortestCol = i;
          } else if (columnHeights[i] < columnHeights[secondShortestCol]) {
            secondShortestCol = i;
          }
        }

        // 确保两列相邻
        const finalCol = Math.min(shortestCol, secondShortestCol);
        if (finalCol < columnCount - 1) {
          columns[finalCol].push(item);
          columnHeights[finalCol] += normalizedHeight;
        } else {
          // 如果找不到合适的相邻列，就放在最短的列
          const shortestCol = columnHeights.indexOf(Math.min(...columnHeights));
          columns[shortestCol].push(item);
          columnHeights[shortestCol] += normalizedHeight;
        }
      } else {
        // 普通图片：放在最短的列
        const shortestCol = columnHeights.indexOf(Math.min(...columnHeights));
        columns[shortestCol].push(item);
        columnHeights[shortestCol] += normalizedHeight;
      }
    });

    return columns;
  };

  const handleObserver = useCallback(
    async (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && !loading && hasMore) {
        setLoading(true);
        await loadMore();
        setLoading(false);
      }
    },
    [loading, hasMore, loadMore],
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
  }, [loading, hasMore, loadMore, handleObserver]);

  // 响应式列数
  const getColumnCount = () => {
    if (typeof window === 'undefined') return 1;
    if (window.innerWidth >= 1024) return 4; // lg
    if (window.innerWidth >= 768) return 3; // sm
    return 2;
  };

  const [columnCount, setColumnCount] = useState(getColumnCount());

  useEffect(() => {
    const handleResize = () => {
      setColumnCount(getColumnCount());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const columns = getColumns(items, columnCount);

  return (
    <div className="w-full">
      <div className={masonryGridVariants({ columns: columnCount as 2 | 3 | 4 })}>
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="w-full space-y-4">
            {column.map((item) => (
              <div key={item.id}>
                <div className={imageCardVariants()}>
                  <ImageItem data={item?.payload} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div ref={loadingRef} className="mt-8 flex h-20 items-center justify-center">
        {loading && (
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
                  加载更多
                </div>
                <div className="text-xs text-gray-500/80 dark:text-gray-400/80">正在获取更多精彩内容...</div>
              </div>
            </div>
          </div>
        )}
        {!hasMore && (
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
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">已加载完成</div>
                <div className="text-xs text-gray-500/80 dark:text-gray-400/80">所有内容都在这里了 ✨</div>
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

export default MasonryGrid;
