'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Loader2, Search, ImageIcon, Settings } from 'lucide-react';
import { SearchResult, SearchHit } from '@/lib/hooks/useSearch';
import { ImageItem } from '../../app/(home)/components/ImageItem';
import { ImageToolbar } from '../../app/(home)/components/ImageToolbar';
import { ImageWithTag } from '@/lib/type';
import { PhotoProvider } from 'react-photo-view';
import { ClientOnly } from '@/components/common/ClientOnly';
import WaterfallGrid from '@/components/ui/WaterfallGrid';
import { useDynamicColumnWidth } from '@/lib/hooks/useDynamicColumnWidth';
import { AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ColumnSlider } from '@/components/ui/ColumnSlider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Constants
const COOLDOWN_TIME = 1000; // 1秒冷却时间

interface SearchResultsProps {
  results?: SearchResult;
  isLoading: boolean;
  isEmpty: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  searchQuery?: string;
}

export function SearchResults({ results, isLoading, isEmpty, hasMore, onLoadMore, searchQuery }: SearchResultsProps) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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
  // 转换搜索结果为 ImageWithTag 格式
  const transformSearchHit = (hit: SearchHit): ImageWithTag => ({
    id: parseInt(hit.id),
    userid: null,
    username: null,
    create_time: hit.create_time ? new Date(hit.create_time) : null,
    platform: hit.platform || null,
    title: hit.title || null,
    page: null,
    size: null,
    filename: hit.filename || null,
    author: hit.author || null,
    authorid: hit.authorid ? BigInt(hit.authorid) : null,
    pid: hit.pid || null,
    extension: null,
    rawurl: hit.rawurl || null,
    thumburl: hit.thumburl || null,
    width: hit.width || 800, // 设置默认宽度
    height: hit.height || 600, // 设置默认高度
    guest: null,
    r18: hit.r18 || false,
    ai: hit.ai || false,
    tags: hit.tags || [],
  });

  // 包装onLoadMore函数使其返回Promise<void>，并添加冷却时间控制
  const handleLoadMore = useCallback(async () => {
    const now = Date.now();
    if (isLoadingMore || now - lastLoadTime < COOLDOWN_TIME) {
      return;
    }

    try {
      setIsLoadingMore(true);
      onLoadMore();
      setLastLoadTime(now);
    } finally {
      setIsLoadingMore(false);
    }
  }, [onLoadMore, isLoadingMore, lastLoadTime]);

  // 转换图片数据格式以匹配WaterfallGrid需要的接口
  const gridItems: ImageWithTag[] = useMemo(() => (results ? results.hits.map(transformSearchHit) : []), [results]);

  // Render function for image items with search highlights - memoized
  const renderImageItem = useCallback(
    (item: ImageWithTag) => {
      const hit = results?.hits.find((h) => parseInt(h.id) === item.id);
      return (
        <div className="group relative">
          <ImageItem data={item} />

          {/* 搜索高亮信息 */}
          {hit?._formatted && (
            <div className="absolute top-2 left-2 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="max-w-xs rounded-lg bg-black/70 px-2 py-1 text-xs text-white">
                {hit._formatted.title && hit._formatted.title !== hit.title && (
                  <div dangerouslySetInnerHTML={{ __html: hit._formatted.title }} />
                )}
                {hit._formatted.author && hit._formatted.author !== hit.author && (
                  <div dangerouslySetInnerHTML={{ __html: hit._formatted.author }} />
                )}
                {hit._formatted.tags && hit._formatted.tags.length > 0 && (
                  <div className="mt-1">
                    {hit._formatted.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="mr-1 mb-1 inline-block rounded-md bg-blue-500/80 px-1 py-0.5 text-xs">
                        <span dangerouslySetInnerHTML={{ __html: tag }} />
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    },
    [results],
  );

  // 空搜索状态 - 只有当没有任何搜索结果且不在加载时才显示
  if (!results && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Search className="mb-4 h-16 w-16 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">开始搜索</h3>
        <p className="max-w-md text-gray-600 dark:text-gray-400">在上方搜索框中输入关键词来搜索图片、标签或画师</p>
      </div>
    );
  }

  // 加载状态
  if (isLoading && !results) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600 dark:text-gray-400">搜索中...</p>
        </div>
      </div>
    );
  }

  // 空结果状态
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ImageIcon className="mb-4 h-16 w-16 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">没有找到结果</h3>
        <p className="mb-4 max-w-md text-gray-600 dark:text-gray-400">
          {searchQuery 
            ? `没有找到匹配 "${searchQuery}" 的图片，试试其他关键词吧` 
            : '当前筛选条件下没有找到图片，试试调整筛选条件吧'
          }
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>搜索建议：</p>
          <ul className="mt-2 space-y-1">
            <li>• 检查拼写是否正确</li>
            <li>• 尝试使用更简短的关键词</li>
            <li>• 尝试使用英文或日文关键词</li>
            <li>• 使用标签搜索，如：anime, manga</li>
          </ul>
        </div>
      </div>
    );
  }

  // 有结果时显示
  return (
    <div className="space-y-6">
      {/* 搜索结果控制栏 */}
      {gridItems.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">找到 {results?.total || 0} 个结果</div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Settings className="h-3.5 w-3.5" />
                列数设置
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="leading-none font-medium">列数设置</h4>
                  <p className="text-muted-foreground text-sm">调整图片网格的列数</p>
                </div>
                <ColumnSlider min={1} max={10} />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* 搜索结果网格 */}
      <AnimatePresence mode="wait">
        <PhotoProvider
          toolbarRender={({ onRotate, onScale, rotate, scale }) => <ImageToolbar {...{ onRotate, onScale, rotate, scale }} />}
        >
          <ClientOnly>
            <div ref={setContainerRef} className="w-full">
              {gridItems.length > 0 ? (
                <WaterfallGrid
                  items={gridItems}
                  loadMore={handleLoadMore}
                  hasMore={hasMore}
                  isLoading={isLoadingMore}
                  renderItem={renderImageItem}
                  gap={4}
                  columnWidth={columnWidth}
                  columnCount={columnCount}
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
    </div>
  );
}
