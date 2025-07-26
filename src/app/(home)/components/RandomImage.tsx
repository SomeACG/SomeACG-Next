'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@/components/ui/icons/ArrowLeftIcon';
import { ArrowRightIcon } from '@/components/ui/icons/ArrowRightIcon';
import Loader from '@/components/ui/loading/Loader';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Image } from '@prisma/client';
import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PhotoProvider } from 'react-photo-view';
import superjson from 'superjson';
import { ImageItem } from './ImageItem';
import { ImageToolbar } from './ImageToolbar';

type RandomImage = Image & {
  originUrl: string;
  authorUrl: string;
  tags: string[];
};

export function RandomImage() {
  const [images, setImages] = useState<RandomImage[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  const fetchRandomImages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/random?count=10');
      const data = await response.json();
      const imageData: RandomImage[] = superjson.deserialize(data);
      setImages(imageData);
    } catch (error) {
      console.error('Failed to fetch random images:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchRandomImages();
    }
  }, [fetchRandomImages]);

  // 检查是否有精选图片
  // const hasPremiumImages = useMemo(() => {
  //   if (!images || images.length === 0) return false;
  //   return images.some((image) => {
  //     return image.tags && image.tags.some((tag) => tag.tag === '精选');
  //   });
  // }, [images]);

  const scrollToStart = () => {
    const viewport = scrollContainerRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport instanceof HTMLElement) {
      viewport.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const scrollToEnd = () => {
    const viewport = scrollContainerRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport instanceof HTMLElement) {
      viewport.scrollTo({
        left: viewport.scrollWidth,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="flex flex-col gap-3 select-none">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">✨ 随便看看</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="size-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={scrollToStart}
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="size-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={scrollToEnd}
          >
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Button>
          <div className="mx-1 h-4 w-px bg-gray-200 dark:bg-gray-700" />
          <Button
            variant="ghost"
            size="sm"
            className="group h-7 gap-1.5 px-2 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={fetchRandomImages}
            disabled={loading}
          >
            <RefreshCw className={cn('h-3 w-3 transition-transform', { 'animate-spin': loading })} />
            <span>换一批</span>
          </Button>
        </div>
      </div>
      <div className="relative h-[280px] overflow-hidden rounded-xl border border-gray-200/60 bg-white/50 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-gray-300/60 hover:shadow-md dark:border-gray-700/60 dark:bg-gray-900/50 dark:hover:border-gray-600/60">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader />
          </div>
        ) : (
          <PhotoProvider
            className="photo-provider"
            toolbarRender={({ onRotate, onScale, rotate, scale }) => <ImageToolbar {...{ onRotate, onScale, rotate, scale }} />}
          >
            <ScrollArea className="h-full p-3" ref={scrollContainerRef}>
              <div className="flex items-start gap-2">
                {images.map((image) => {
                  const aspectRatio = (image.width ?? 800) / (image.height ?? 600);
                  const height = 250;
                  const width = height * aspectRatio;

                  return (
                    <div
                      key={image.id}
                      className="flex-none overflow-hidden rounded-lg"
                      style={{
                        height: `${height}px`,
                        width: `${width}px`,
                      }}
                    >
                      <ImageItem
                        data={image}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" className="h-1.5" />
            </ScrollArea>
          </PhotoProvider>
        )}
      </div>
    </section>
  );
}
