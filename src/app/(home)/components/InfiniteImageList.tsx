'use client';
import { ClientOnly } from '@/components/common/ClientOnly';
import Loader from '@/components/ui/loading/Loader';
import { useInfiniteImages } from '@/lib/hooks/useInfiniteImages';
import { AnimatePresence } from 'motion/react';
import { useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { PhotoProvider } from 'react-photo-view';
import { ImageItem } from './ImageItem';
import { ImageToolbar } from './ImageToolbar';
import { Masonry } from 'masonic';
import { Image } from '@prisma/client';

interface InfiniteImageListProps {
  initialData: {
    images: Image[];
    total: number;
  };
}

export function InfiniteImageList({ initialData }: InfiniteImageListProps) {
  const pageSize = 20;
  const { allImages, isLoading, hasNextPage, fetchNextPage, error, size } = useInfiniteImages(pageSize, initialData);

  // 使用 useCallback 缓存 render 函数
  const renderItem = useCallback((props: { data: Image; index: number }) => {
    return <ImageItem data={props.data} />;
  }, []);

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
            <InfiniteScroll
              className="w-full"
              dataLength={allImages.length}
              next={fetchNextPage}
              hasMore={hasNextPage}
              loader={
                <div className="min-h-[100px]">
                  <Loader />
                </div>
              }
              endMessage={
                <div className="flex-center min-h-[100px]">
                  <div className="text-lg">没有更多了</div>
                </div>
              }
            >
              {allImages.length > 0 ? (
                <Masonry items={allImages} columnGutter={26} columnWidth={250} render={renderItem} key={`masonry-${size}`} />
              ) : (
                <div className="flex-center min-h-[200px]">
                  <div className="text-lg">暂无数据</div>
                </div>
              )}
            </InfiniteScroll>
          </ClientOnly>
        </PhotoProvider>
      </AnimatePresence>
    </div>
  );
}

export default InfiniteImageList;
