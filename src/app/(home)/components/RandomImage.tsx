'use client';

import { Button } from '@/components/ui/button';
import Card from '@/components/ui/card';
import { ArrowLeftIcon } from '@/components/ui/icons/ArrowLeftIcon';
import { ArrowRightIcon } from '@/components/ui/icons/ArrowRightIcon';
import Loader from '@/components/ui/loading/Loader';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/useIsMobile';
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
  const isMobile = useIsMobile();
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
    fetchRandomImages();
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
    <div className="w-full select-none">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">✨随便看看 </h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="size-6 p-0" onClick={scrollToStart}>
            <ArrowLeftIcon />
          </Button>
          <Button variant="ghost" size="sm" className="size-6 p-0" onClick={scrollToEnd}>
            <ArrowRightIcon />
          </Button>
          <Button variant="ghost" size="sm" className="group" onClick={fetchRandomImages} disabled={loading}>
            <RefreshCw className={cn('size-4 group-hover:animate-spin', { 'animate-spin': loading })} />
            <span>来点新的</span>
          </Button>
        </div>
      </div>
      <Card
        className={cn(
          'dark:hover:shadow-primary/5 mt-2 overflow-hidden p-4 pb-1 transition-shadow duration-300 hover:shadow-lg',
          {
            'flex-center': loading,
          },
        )}
        // isPremium={hasPremiumImages}
      >
        {loading ? (
          <Loader />
        ) : (
          <PhotoProvider
            className="photo-provider"
            toolbarRender={({ onRotate, onScale, rotate, scale }) => <ImageToolbar {...{ onRotate, onScale, rotate, scale }} />}
          >
            <ScrollArea className={cn('pb-4 md:h-[23.625rem]')} ref={scrollContainerRef}>
              <div className="flex items-start gap-2">
                {images.map((image) => {
                  const aspectRatio = (image.width ?? 800) / (image.height ?? 600);
                  const height = 300;
                  const width = height * aspectRatio;

                  return (
                    <div
                      key={image.id}
                      className="flex-none"
                      style={{
                        height: `${height}px`,
                        width: `${width}px`,
                      }}
                    >
                      <ImageItem data={image} className={cn('size-full object-cover', { 'h-[362px]': isMobile })} />
                    </div>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </PhotoProvider>
        )}
      </Card>
    </div>
  );
}
