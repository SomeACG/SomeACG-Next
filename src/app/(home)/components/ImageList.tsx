'use client';
import Loader from '@/components/ui/loading/Loader';
import { useImages } from '@/lib/hooks/useImages';
import { pageAtom, totalPageAtom, viewModeAtom } from '@/store/app';
import { useAtomValue, useSetAtom } from 'jotai';
import WaterfallGrid from '@/components/ui/WaterfallGrid';
import { AnimatePresence } from 'motion/react';
import { useCallback, useEffect } from 'react';
import { PhotoProvider } from 'react-photo-view';
import { ImageItem } from './ImageItem';
import { ImageToolbar } from './ImageToolbar';
import InfiniteImageList from './InfiniteImageList';
import { ImageControls } from './ImageControls';
import { CompactPagination } from './CompactPagination';
import { useColumnConfig } from '@/lib/hooks/useColumnConfig';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import { ImageWithTag } from '@/lib/type';

interface ImageListProps {
  initialData: {
    images: ImageWithTag[];
    total: number;
  };
}

export function ImageList({ initialData }: ImageListProps) {
  const page = useAtomValue(pageAtom);
  const setTotalPage = useSetAtom(totalPageAtom);
  const viewMode = useAtomValue(viewModeAtom);

  // 只在分页模式下启用 useImages hook
  const { images, total, isLoading, isError } = useImages(
    page,
    DEFAULT_PAGE_SIZE,
    initialData,
    viewMode === 'pagination', // 只在分页模式下启用
  );
  const columnConfig = useColumnConfig();

  const renderItem = useCallback((data: ImageWithTag, index?: number) => {
    return <ImageItem key={index || data.id} data={data} />;
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

    return (
      <div className="flex flex-col gap-4">
        <WaterfallGrid
          key={page} // 添加key强制重新渲染，重置动画状态
          items={images || []}
          loadMore={async () => {}} // 分页模式不需要无限加载
          hasMore={false}
          isLoading={false}
          renderItem={renderItem}
          gap={4}
          minColumnWidth={columnConfig.width}
          enableAnimation={false} // 分页模式禁用动画
        />
        {/* 分页模式底部分页控件 */}
        <div className="flex justify-center py-4">
          <CompactPagination />
        </div>
      </div>
    );
  }, [isLoading, isError, images, columnConfig, renderItem, page]);

  return (
    <div className="flex flex-col gap-4">
      <ImageControls showColumnSlider={viewMode === 'infinite'} />
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
