'use client';

import { useEffect, useState, useCallback } from 'react';
import { ClientOnly } from '@/components/common/ClientOnly';
import { Image } from '@prisma/client';
import { Masonry } from 'masonic';
import { PhotoProvider } from 'react-photo-view';
import { ImageItem } from '@/app/(home)/components/ImageItem';
import { ImageToolbar } from '@/app/(home)/components/ImageToolbar';
import { useColumnConfig } from '@/lib/hooks/useColumnConfig';
import { AnimatePresence } from 'motion/react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Loader from '@/components/ui/loading/Loader';
import useSWRInfinite from 'swr/infinite';

type TagClientProps = {
  tag: string;
};

const ITEMS_PER_PAGE = 32;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TagClient({ tag }: TagClientProps) {
  const columnConfig = useColumnConfig();

  const getKey = (pageIndex: number) => {
    return `/api/tag?tag=${encodeURIComponent(tag)}&start=${pageIndex * ITEMS_PER_PAGE}&limit=${ITEMS_PER_PAGE}`;
  };

  const {
    data: pages,
    size,
    setSize,
    isLoading,
    error,
  } = useSWRInfinite(getKey, fetcher, {
    revalidateFirstPage: false,
    revalidateOnFocus: false,
    persistSize: true,
  });

  const allImages = pages ? pages.flat() : [];
  const hasMore = pages ? pages[pages.length - 1]?.length === ITEMS_PER_PAGE : true;

  const renderItem = useCallback(({ data, index }: { data: Image; index: number }) => {
    if (!data) return null;
    return <ImageItem data={data} key={data?.id + index} />;
  }, []);

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">加载失败，请刷新重试</div>;
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">加载中...</div>;
  }

  return (
    <ClientOnly>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">标签：{tag} </h2>
        <div className="mt-4 flex w-full flex-col gap-4">
          <AnimatePresence mode="wait">
            <PhotoProvider
              toolbarRender={({ onRotate, onScale, rotate, scale }) => (
                <ImageToolbar {...{ onRotate, onScale, rotate, scale }} />
              )}
            >
              <InfiniteScroll
                className="w-full"
                dataLength={allImages.length}
                next={() => setSize(size + 1)}
                hasMore={hasMore}
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
                  <Masonry
                    items={allImages}
                    columnGutter={columnConfig.gutter}
                    columnWidth={columnConfig.width}
                    render={renderItem}
                  />
                ) : (
                  <div className="flex-center min-h-[200px]">
                    <div className="text-lg">暂无数据</div>
                  </div>
                )}
              </InfiniteScroll>
            </PhotoProvider>
          </AnimatePresence>
        </div>
      </div>
    </ClientOnly>
  );
}
