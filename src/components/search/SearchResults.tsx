'use client';

import React from 'react';
import { Loader2, Search, ImageIcon } from 'lucide-react';
import { SearchResult, SearchHit } from '@/lib/hooks/useSearch';
import { ImageItem } from '../../app/(home)/components/ImageItem';
import { ImageWithTag } from '@/lib/type';
import { PhotoProvider } from 'react-photo-view';

interface SearchResultsProps {
  results?: SearchResult;
  isLoading: boolean;
  isEmpty: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  searchQuery?: string;
}

export function SearchResults({ results, isLoading, isEmpty, hasMore, onLoadMore, searchQuery }: SearchResultsProps) {
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
    width: hit.width || null,
    height: hit.height || null,
    guest: null,
    r18: hit.r18 || false,
    ai: hit.ai || false,
    tags: hit.tags || [],
  });

  // 空搜索状态
  if (!searchQuery && !isLoading) {
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
  if (isEmpty && searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ImageIcon className="mb-4 h-16 w-16 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">没有找到结果</h3>
        <p className="mb-4 max-w-md text-gray-600 dark:text-gray-400">
          没有找到匹配 &quot;{searchQuery}&quot; 的图片，试试其他关键词吧
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
      {/* 结果网格 */}
      {results && (
        <PhotoProvider
          toolbarRender={({ onRotate, onScale, rotate, scale }) => (
            <div className="flex items-center space-x-2">
              <button onClick={() => onRotate(rotate + 90)} className="rounded p-2 text-white hover:bg-white/10">
                旋转
              </button>
              <button onClick={() => onScale(scale * 1.5)} className="rounded p-2 text-white hover:bg-white/10">
                放大
              </button>
              <button onClick={() => onScale(scale / 1.5)} className="rounded p-2 text-white hover:bg-white/10">
                缩小
              </button>
            </div>
          )}
        >
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {results.hits.map((hit) => {
              const imageData = transformSearchHit(hit);
              return (
                <div key={hit.id} className="group relative">
                  <ImageItem data={imageData} />

                  {/* 搜索高亮信息 */}
                  {hit._formatted && (
                    <div className="absolute top-2 left-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="max-w-xs rounded bg-black/70 px-2 py-1 text-xs text-white">
                        {hit._formatted.title && hit._formatted.title !== hit.title && (
                          <div dangerouslySetInnerHTML={{ __html: hit._formatted.title }} />
                        )}
                        {hit._formatted.author && hit._formatted.author !== hit.author && (
                          <div dangerouslySetInnerHTML={{ __html: hit._formatted.author }} />
                        )}
                        {hit._formatted.tags && hit._formatted.tags.length > 0 && (
                          <div className="mt-1">
                            {hit._formatted.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="mr-1 mb-1 inline-block rounded bg-blue-500/80 px-1 py-0.5 text-xs">
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
            })}
          </div>
        </PhotoProvider>
      )}

      {/* 加载更多 */}
      {hasMore && (
        <div className="flex justify-center py-8">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="flex items-center space-x-2 rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span>{isLoading ? '加载中...' : '加载更多'}</span>
          </button>
        </div>
      )}

      {/* 加载中的骨架屏（加载更多时） */}
      {isLoading && results && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="aspect-[3/4] animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      )}
    </div>
  );
}
