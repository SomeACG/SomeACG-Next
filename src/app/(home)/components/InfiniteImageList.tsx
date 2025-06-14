'use client';
import { ClientOnly } from '@/components/common/ClientOnly';
import MasonryGrid from '@/components/ui/MasonryGrid';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import { useInfiniteImages } from '@/lib/hooks/useInfiniteImages';
import { ImageWithTag } from '@/lib/type';
import { AnimatePresence } from 'motion/react';
import { useCallback, useMemo, useState } from 'react';
import { PhotoProvider } from 'react-photo-view';
import { ImageItem } from './ImageItem';
import { ImageToolbar } from './ImageToolbar';

interface InfiniteImageListProps {
  initialData: {
    images: ImageWithTag[];
    total: number;
  };
}

// Image item interface for MasonryGrid
interface ImageGridItem {
  id: string;
  width: number;
  height: number;
  payload: ImageWithTag;
}

export function InfiniteImageList({ initialData }: InfiniteImageListProps) {
  const { allImages, hasNextPage, fetchNextPage, error } = useInfiniteImages(DEFAULT_PAGE_SIZE, initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState(0);
  const COOLDOWN_TIME = 1000; // 1秒冷却时间

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

  if (error) {
    return (
      <div className="flex-center min-h-[200px]">
        <div className="text-lg text-red-500">加载失败，请刷新重试</div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <AnimatePresence mode="wait">
        <PhotoProvider
          toolbarRender={({ onRotate, onScale, rotate, scale }) => <ImageToolbar {...{ onRotate, onScale, rotate, scale }} />}
        >
          <ClientOnly>
            {allImages.length > 0 ? (
              <MasonryGrid
                items={gridItems}
                loadMore={handleLoadMore}
                hasMore={hasNextPage}
                isLoading={isLoading}
                renderItem={renderImageItem}
              />
            ) : (
              <div className="flex-center min-h-[200px]">
                <div className="text-lg">暂无数据</div>
              </div>
            )}
          </ClientOnly>
        </PhotoProvider>
      </AnimatePresence>
    </div>
  );
}

export default InfiniteImageList;
