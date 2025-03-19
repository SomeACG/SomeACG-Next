'use client';
import { ImageItem } from '@/app/(home)/components/ImageItem';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image } from '@prisma/client';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import { ImageWithTag } from '@/lib/type';

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

interface ImageItem {
  id: string;
  height: number;
  width: number;
  payload: ImageWithTag;
}

interface MasonryGridProps {
  items: ImageItem[];
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ items, loadMore, hasMore }) => {
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // 将图片分配到不同的列中，尽量保持每列高度平衡
  const getColumns = (items: ImageItem[], columnCount: number) => {
    const columns: ImageItem[][] = Array.from({ length: columnCount }, () => []);
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
          <div className="flex flex-col items-center space-y-2">
            <div className="flex space-x-2">
              <div className="h-3 w-3 animate-bounce rounded-full bg-gray-500"></div>
              <div className="h-3 w-3 animate-bounce rounded-full bg-gray-500 [animation-delay:-.3s]"></div>
              <div className="h-3 w-3 animate-bounce rounded-full bg-gray-500 [animation-delay:-.5s]"></div>
            </div>
            <div className="text-gray-500">加载中...</div>
          </div>
        )}
        {!hasMore && <div className="border-t border-gray-200 pt-4 text-center text-gray-500">没有更多内容了</div>}
      </div>
    </div>
  );
};

export default MasonryGrid;
