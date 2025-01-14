'use client';
import { ClientOnly } from '@/components/common/ClientOnly';
import Loader from '@/components/ui/loading/Loader';
import { useImages } from '@/lib/hooks/useImages';
import { pageAtom, totalPageAtom } from '@/store/app';
import { images } from '@prisma/client';
import { AnimatePresence } from 'framer-motion';
import { useAtomValue, useSetAtom } from 'jotai';
import { Masonry } from 'masonic';
import { useCallback, useEffect } from 'react';
import { PhotoProvider } from 'react-photo-view';
import { ImageItem } from './ImageItem';
import { ImageToolbar } from './ImageToolbar';

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

  const { images, total, isLoading, isError } = useImages(page, pageSize);

  // 使用 useCallback 缓存 render 函数
  const renderItem = useCallback((props: { data: images; index: number }) => {
    return <ImageItem data={props.data} />;
  }, []);

  useEffect(() => {
    if (total) {
      setTotalPage(Math.ceil(total / pageSize));
    }
  }, [total, pageSize, setTotalPage]);

  return (
    <div className="flex flex-col gap-4 px-3">
      <AnimatePresence mode="wait">
        <PhotoProvider
          toolbarRender={({ onRotate, onScale, rotate, scale }) => <ImageToolbar {...{ onRotate, onScale, rotate, scale }} />}
        >
          <ClientOnly>
            {isLoading ? (
              <div className="min-h-[200px]">
                <Loader />
              </div>
            ) : images && images.length > 0 ? (
              <Masonry items={images} columnGutter={26} columnWidth={250} render={renderItem} key={`masonry-${page}`} />
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

export default ImageList;
