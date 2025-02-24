'use client';
import Loader from '@/components/ui/loading/Loader';
import { useImages } from '@/lib/hooks/useImages';
import { pageAtom, totalPageAtom, viewModeAtom } from '@/store/app';
import { Image } from '@prisma/client';
import { useAtomValue, useSetAtom } from 'jotai';
import { Masonry } from 'masonic';
import { AnimatePresence } from 'motion/react';
import { useCallback, useEffect } from 'react';
import { PhotoProvider } from 'react-photo-view';
import { ImageItem } from './ImageItem';
import { ImageToolbar } from './ImageToolbar';
import InfiniteImageList from './InfiniteImageList';
import { useColumnConfig } from '@/lib/hooks/useColumnConfig';
import { DEFAULT_PAGE_SIZE } from '@/constants';

interface ImageListProps {
  initialData: {
    images: Image[];
    total: number;
  };
}

export function ImageList({ initialData }: ImageListProps) {
  const page = useAtomValue(pageAtom);
  const setTotalPage = useSetAtom(totalPageAtom);
  const viewMode = useAtomValue(viewModeAtom);
  const { images, total, isLoading, isError } = useImages(page, DEFAULT_PAGE_SIZE, initialData);
  const columnConfig = useColumnConfig();

  // 使用 useCallback 缓存 render 函数，依赖项为空因为 ImageItem 是纯展示组件
  const renderItem = useCallback((props: { data: Image; index: number }) => {
    return <ImageItem data={props.data} />;
  }, []);

  useEffect(() => {
    if (total) {
      setTotalPage(Math.ceil(total / DEFAULT_PAGE_SIZE));
    }
  }, [total, setTotalPage]);

  const renderList = useCallback(() => {
    if (isLoading) {
      return (
        <div className="min-h-[200px]">
          <Loader />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex-center min-h-[200px]">
          <div className="text-lg text-red-500">加载失败，请刷新重试</div>
        </div>
      );
    }

    if (!images?.length) {
      return (
        <div className="flex-center min-h-[200px]">
          <div className="text-lg">暂无数据</div>
        </div>
      );
    }

    return <Masonry items={images} columnGutter={columnConfig.gutter} columnWidth={columnConfig.width} render={renderItem} />;
  }, [isLoading, isError, images, columnConfig, renderItem]);

  return (
    <div className="flex flex-col gap-4">
      {viewMode === 'infinite' ? (
        <InfiniteImageList initialData={initialData} />
      ) : (
        <AnimatePresence mode="wait">
          <PhotoProvider
            toolbarRender={({ onRotate, onScale, rotate, scale }) => <ImageToolbar {...{ onRotate, onScale, rotate, scale }} />}
          >
            {renderList()}
          </PhotoProvider>
        </AnimatePresence>
      )}
    </div>
  );
}

export default ImageList;
