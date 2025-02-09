'use client';
import { ClientOnly } from '@/components/common/ClientOnly';
import Loader from '@/components/ui/loading/Loader';
import { useImages } from '@/lib/hooks/useImages';
import { pageAtom, totalPageAtom, viewModeAtom } from '@/store/app';
import { images } from '@prisma/client';
import { AnimatePresence } from 'motion/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { Masonry } from 'masonic';
import { useCallback, useEffect } from 'react';
import { PhotoProvider } from 'react-photo-view';
import { ImageItem } from './ImageItem';
import { ImageToolbar } from './ImageToolbar';
import InfiniteImageList from './InfiniteImageList';
import { useWindowSize } from 'react-use';

interface ImageListProps {
  initialData: {
    images: images[];
    total: number;
  };
}

export function ImageList({ initialData }: ImageListProps) {
  const page = useAtomValue(pageAtom);
  const pageSize = 20;
  const setTotalPage = useSetAtom(totalPageAtom);
  const viewMode = useAtomValue(viewModeAtom);
  const { images, total, isLoading, isError } = useImages(page, pageSize);
  const { width } = useWindowSize();
  // 使用 useCallback 缓存 render 函数
  const renderItem = useCallback((props: { data: images; index: number }) => {
    return <ImageItem data={props.data} />;
  }, []);

  useEffect(() => {
    if (total) {
      setTotalPage(Math.ceil(total / pageSize));
    }
  }, [total, pageSize, setTotalPage]);

  const renderList = useCallback(() => {
    if (viewMode === 'infinite') return <InfiniteImageList initialData={initialData} />;
    if (isLoading)
      return (
        <div className="min-h-[200px]">
          <Loader />
        </div>
      );
    if (!images?.length) {
      return (
        <div className="flex-center min-h-[200px]">
          <div className="text-lg">暂无数据</div>
        </div>
      );
    }
    const columnWidth = Math.min(250, width / 2 - 50);
    const columnGutter = width < 768 ? 8 : 16;
    return (
      <Masonry
        items={images}
        columnGutter={columnGutter}
        columnWidth={columnWidth}
        render={renderItem}
        key={`masonry-${page}`}
      />
    );
  }, [viewMode, initialData, isLoading, images, width, renderItem, page]);

  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence mode="wait">
        <PhotoProvider
          toolbarRender={({ onRotate, onScale, rotate, scale }) => <ImageToolbar {...{ onRotate, onScale, rotate, scale }} />}
        >
          <ClientOnly>{renderList()}</ClientOnly>
        </PhotoProvider>
      </AnimatePresence>
    </div>
  );
}

export default ImageList;
