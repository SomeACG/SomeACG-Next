'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SearchBox } from '@/components/search/SearchBox';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchFilters } from '@/components/search/SearchFilters';
import { useSearch, type SearchParams } from '@/lib/hooks/useSearch';
import { AlertCircle } from 'lucide-react';

interface SearchClientProps {
  initialParams: {
    q?: string;
    platform?: string;
    tags?: string;
    r18?: string;
    sort?: string;
    page?: string;
  };
}

export default function SearchClient({ initialParams }: SearchClientProps) {
  const router = useRouter();

  // 初始化搜索参数
  const [searchQuery, setSearchQuery] = useState(initialParams.q || '');

  const initialSearchParams: SearchParams = {
    q: initialParams.q,
    platform: initialParams.platform,
    tags: initialParams.tags?.split(',').filter(Boolean),
    r18: initialParams.r18 === 'true',
    sort: (initialParams.sort as any) || 'create_time:desc',
    limit: 20,
    offset: 0,
  };

  const {
    results,
    isLoading,
    error,
    params: searchParams,
    hasMore,
    isEmpty,
    search,
    updateParams,
    clearSearch,
    loadMore,
  } = useSearch(initialSearchParams);

  // 同步 URL 参数
  useEffect(() => {
    const urlParams = new URLSearchParams();

    if (searchParams.q) urlParams.set('q', searchParams.q);
    if (searchParams.platform) urlParams.set('platform', searchParams.platform);
    if (searchParams.tags && searchParams.tags.length > 0) urlParams.set('tags', searchParams.tags.join(','));
    if (searchParams.r18 !== undefined) urlParams.set('r18', searchParams.r18.toString());
    if (searchParams.sort && searchParams.sort !== 'create_time:desc') urlParams.set('sort', searchParams.sort);

    const newUrl = `/search${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;

    // 只在参数真正改变时更新 URL
    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, router]);

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    search(query, { offset: 0 });
  };

  // 处理过滤器变化
  const handleFilterChange = (filterParams: Partial<SearchParams>) => {
    updateParams({ ...filterParams, offset: 0 });
  };

  // 清空搜索
  const handleClearSearch = () => {
    setSearchQuery('');
    clearSearch();
    router.replace('/search');
  };

  return (
    <div className="space-y-6">
      {/* 搜索框 */}
      <div className="mx-auto w-full max-w-2xl">
        <SearchBox
          initialQuery={searchQuery}
          onSearch={handleSearch}
          placeholder="搜索图片、标签、画师..."
          showSuggestions={true}
          className="w-full"
        />
      </div>

      {/* 搜索过滤器 */}
      <SearchFilters
        currentFilters={{
          platform: searchParams.platform,
          tags: searchParams.tags || [],
          r18: searchParams.r18,
          sort: searchParams.sort || 'create_time:desc',
        }}
        onFilterChange={handleFilterChange}
        onClear={handleClearSearch}
      />

      {/* 搜索结果信息 */}
      {results && (
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div>
            找到 <span className="font-medium">{results.total}</span> 个结果
            {results.query && (
              <>
                ，搜索：<span className="font-medium">&quot;{results.query}&quot;</span>
              </>
            )}
            <span className="ml-2">({results.processingTimeMs}ms)</span>
          </div>

          {searchParams.q && (
            <button
              onClick={handleClearSearch}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              清空搜索
            </button>
          )}
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">搜索出错了</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              {error instanceof Error ? error.message : '搜索服务暂时不可用'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            >
              重新加载
            </button>
          </div>
        </div>
      )}

      {/* 搜索结果 */}
      {!error && (
        <SearchResults
          results={results}
          isLoading={isLoading}
          isEmpty={isEmpty}
          hasMore={hasMore}
          onLoadMore={loadMore}
          searchQuery={searchParams.q}
        />
      )}
    </div>
  );
}
