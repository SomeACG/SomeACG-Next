'use client';
import { cn } from '@/lib/utils';
import { throttle } from 'es-toolkit';
import { AnimatePresence, m } from 'motion/react';
import React, { useCallback, useEffect, useRef, useState, useMemo, memo } from 'react';

interface WaterfallItem {
  id: string | number;
  width?: number | null;
  height?: number | null;
}

interface WaterfallGridProps<T extends WaterfallItem> {
  items: T[];
  loadMore: () => Promise<void>;
  hasMore: boolean | undefined;
  isLoading?: boolean;
  renderItem: (item: T, index?: number) => React.ReactNode;
  className?: string;
  gap?: number;
  columnWidth?: number;
  columnCount?: number;
  minColumnWidth?: number;
  enableAnimation?: boolean;
}

const FIRST_SCREEN_ITEMS_COUNT = 30;

const Spring = {
  presets: {
    smooth: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
};

function WaterfallGrid<T extends WaterfallItem>({
  items,
  loadMore,
  hasMore,
  isLoading = false,
  renderItem,
  className,
  gap = 16,
  columnWidth,
  columnCount,
  minColumnWidth = 200,
  enableAnimation = true,
}: WaterfallGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const hasAnimatedRef = useRef(false);
  
  // 获取响应式列数（fallback逻辑）
  const getColumnCount = useCallback(() => {
    if (!containerRef.current) return 2;
    const containerWidth = containerRef.current.offsetWidth;
    const columns = Math.floor(containerWidth / (minColumnWidth + gap));
    return Math.max(1, Math.min(columns, 6)); // 最少1列，最多6列
  }, [minColumnWidth, gap]);

  const [fallbackColumnCount, setFallbackColumnCount] = useState(2);

  // 响应式处理（仅在没有传入columnCount时使用）
  useEffect(() => {
    if (columnCount) return; // 如果传入了columnCount，则不使用fallback逻辑

    const updateColumnCount = throttle(() => {
      const newCount = getColumnCount();
      if (newCount !== fallbackColumnCount) {
        setFallbackColumnCount(newCount);
      }
    }, 150);

    updateColumnCount(); // 初始设置
    window.addEventListener('resize', updateColumnCount);
    return () => window.removeEventListener('resize', updateColumnCount);
  }, [getColumnCount, fallbackColumnCount, columnCount]);

  const actualColumnCount = columnCount || fallbackColumnCount;

  // 计算瀑布流布局
  const layout = useMemo(() => {
    if (!items.length) return { columns: [], maxHeight: 0 };

    const columns: Array<{ items: T[]; height: number }> = Array.from({ length: actualColumnCount }, () => ({
      items: [],
      height: 0,
    }));

    // 计算每个item的标准化高度
    const itemsWithHeight = items.map((item) => {
      const aspectRatio = (item.width && item.height) ? item.width / item.height : 1;
      const normalizedHeight = 300 / aspectRatio; // 基准高度300px
      return { item, height: normalizedHeight };
    });

    // 分配items到各列
    itemsWithHeight.forEach(({ item, height }) => {
      // 找到高度最小的列
      const shortestColumn = columns.reduce((prev, current) => 
        current.height < prev.height ? current : prev
      );
      
      shortestColumn.items.push(item);
      shortestColumn.height += height + gap;
    });

    const maxHeight = Math.max(...columns.map(col => col.height));

    return { columns: columns.map(col => col.items), maxHeight };
  }, [items, actualColumnCount, gap]);

  // 无限滚动观察器
  const handleObserver = useCallback(
    async (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && !loading && !isLoading && hasMore) {
        setLoading(true);
        try {
          await loadMore();
        } finally {
          setLoading(false);
        }
      }
    },
    [loading, isLoading, hasMore, loadMore],
  );

  useEffect(() => {
    if (!loadingRef.current) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '200px',
      threshold: 0.1,
    });

    observer.observe(loadingRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  const actualColumnWidth = typeof columnWidth === 'number' ? `${columnWidth}px` : columnWidth || `calc((100% - ${(actualColumnCount - 1) * gap}px) / ${actualColumnCount})`;

  const handleAnimationComplete = useCallback(() => {
    hasAnimatedRef.current = true;
  }, []);

  return (
    <div className={cn('w-full', className)}>
      <div 
        ref={containerRef}
        className="flex w-full"
        style={{ gap: `${gap}px` }}
      >
        {layout.columns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className="flex flex-col"
            style={{ 
              width: actualColumnWidth,
              gap: `${gap}px`
            }}
          >
            {column.map((item, itemIndex) => {
              const globalIndex = items.indexOf(item);
              return (
                <WaterfallItem
                  key={`${item.id}`}
                  item={item}
                  index={globalIndex}
                  renderItem={renderItem}
                  hasAnimated={hasAnimatedRef.current}
                  onAnimationComplete={handleAnimationComplete}
                  enableAnimation={enableAnimation}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* 加载状态 */}
      <div ref={loadingRef} className="mt-8 flex h-20 items-center justify-center">
        {(loading || isLoading) && (
          <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 px-8 py-6 backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-900/10">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-2 right-2 h-8 w-8 rounded-full bg-blue-400/20 blur-lg" />
              <div className="absolute bottom-2 left-2 h-10 w-10 rounded-full bg-purple-400/20 blur-lg" />
            </div>

            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 opacity-50" />

            <div className="relative z-10 flex items-center space-x-4">
              <div className="relative">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent border-t-blue-500/60 border-r-purple-500/60" />
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
        
        {!hasMore && items.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl border border-gray-200/30 bg-gradient-to-br from-gray-50/80 via-white/60 to-gray-50/80 px-8 py-6 shadow-lg shadow-gray-100/20 backdrop-blur-xl dark:border-gray-700/30 dark:from-gray-800/20 dark:via-gray-700/15 dark:to-gray-800/20 dark:shadow-gray-900/20">
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

            <div className="absolute bottom-0 left-1/2 h-px w-16 -translate-x-1/2 bg-gradient-to-r from-transparent via-gray-300/50 to-transparent dark:via-gray-600/50" />
          </div>
        )}
      </div>
    </div>
  );
}

const WaterfallItem = memo(<T extends WaterfallItem>({
  item,
  index,
  renderItem,
  hasAnimated,
  onAnimationComplete,
  enableAnimation = true,
}: {
  item: T;
  index: number;
  renderItem: (item: T, index?: number) => React.ReactNode;
  hasAnimated: boolean;
  onAnimationComplete: () => void;
  enableAnimation: boolean;
}) => {
  // 只对第一屏的 items 做动画，且只在首次加载时
  const shouldAnimate = enableAnimation && !hasAnimated && index < FIRST_SCREEN_ITEMS_COUNT;

  // 计算动画延迟
  const delay = shouldAnimate ? Math.min(index * 0.05, 0.3) : 0;

  if (!enableAnimation || !shouldAnimate) {
    return (
      <div className="w-full">
        {renderItem(item, index)}
      </div>
    );
  }

  return (
    <m.div
      initial={{
        opacity: 0,
        y: 30,
        scale: 0.95,
        filter: 'blur(4px)',
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
      }}
      transition={{
        ...Spring.presets.smooth,
        delay,
      }}
      onAnimationComplete={onAnimationComplete}
      className="w-full"
    >
      {renderItem(item, index)}
    </m.div>
  );
});

WaterfallItem.displayName = 'WaterfallItem';

export default WaterfallGrid;