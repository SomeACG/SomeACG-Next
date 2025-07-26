'use client';
import { ClientOnly } from '@/components/common/ClientOnly';
import WaterfallGrid from '@/components/ui/WaterfallGrid';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import { useInfiniteImages } from '@/lib/hooks/useInfiniteImages';
import { useDynamicColumnWidth } from '@/lib/hooks/useDynamicColumnWidth';
import { ImageWithTag } from '@/lib/type';
import { AnimatePresence } from 'motion/react';
import { useCallback, useMemo, useState, memo } from 'react';
import { PhotoProvider } from 'react-photo-view';
import { ImageItem } from './ImageItem';
import { ImageToolbar } from './ImageToolbar';

// Constants
const COOLDOWN_TIME = 1000; // 1秒冷却时间

interface InfiniteImageListProps {
  initialData: {
    images: ImageWithTag[];
    total: number;
  };
}

function InfiniteImageListComponent({ initialData }: InfiniteImageListProps) {
  const { allImages, hasNextPage, fetchNextPage, error } = useInfiniteImages(DEFAULT_PAGE_SIZE, initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState(0);

  // 使用动态列宽 hook
  const { columnWidth, columnCount, setContainer } = useDynamicColumnWidth();

  // 直接使用 setContainer 作为 ref callback
  const setContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      setContainer(node);
    },
    [setContainer],
  );

  // 包装fetchNextPage函数使其返回Promise<void>，并添加冷却时间控制
  const handleLoadMore = useCallback(async () => {
    const now = Date.now();
    if (isLoading || now - lastLoadTime < COOLDOWN_TIME) {
      return;
    }

    try {
      setIsLoading(true);
      await fetchNextPage();
      setLastLoadTime(now);
    } finally {
      setIsLoading(false);
    }
  }, [fetchNextPage, isLoading, lastLoadTime]);

  // 转换图片数据格式以匹配WaterfallGrid需要的接口
  const gridItems: ImageWithTag[] = useMemo(
    () =>
      allImages.map((image) => ({
        ...image,
        width: image.width || 800, // 设置默认宽度
        height: image.height || 600, // 设置默认高度
      })),
    [allImages],
  );

  // Render function for image items - memoized
  const renderImageItem = useCallback((item: ImageWithTag) => <ImageItem data={item} />, []);

  if (error) {
    return (
      <div className="flex-center min-h-[200px]">
        <div className="text-lg text-red-500">加载失败，请刷新重试</div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <PhotoProvider
        toolbarRender={({ onRotate, onScale, rotate, scale }) => <ImageToolbar {...{ onRotate, onScale, rotate, scale }} />}
      >
        <ClientOnly>
          <div ref={setContainerRef} className="w-full">
            {allImages.length > 0 ? (
              <WaterfallGrid
                items={gridItems}
                loadMore={handleLoadMore}
                hasMore={hasNextPage}
                isLoading={isLoading}
                renderItem={renderImageItem}
                gap={4}
                columnWidth={columnWidth}
                columnCount={columnCount}
                enableAnimation={false}
              />
            ) : (
              <div className="flex-center min-h-[200px]">
                <div className="text-lg">暂无数据</div>
              </div>
            )}
          </div>
        </ClientOnly>
      </PhotoProvider>
    </AnimatePresence>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const InfiniteImageList = memo(InfiniteImageListComponent);

export default InfiniteImageList;
