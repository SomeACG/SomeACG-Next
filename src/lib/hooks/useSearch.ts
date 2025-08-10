import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { useDebounceValue } from '@/hooks/useDebounce';

// 搜索参数接口
export interface SearchParams {
  q?: string;
  limit?: number;
  offset?: number;
  platform?: string;
  tags?: string[];
  r18?: boolean;
  sort?: 'create_time:desc' | 'create_time:asc';
}

// 搜索建议接口
export interface SearchSuggestion {
  text: string;
  type: string;
}

// 搜索结果接口
export interface SearchHit {
  id: string;
  title?: string;
  author?: string;
  platform?: string;
  tags: string[];
  pid?: string;
  authorid?: string;
  width?: number;
  height?: number;
  filename?: string;
  thumburl?: string;
  rawurl?: string;
  create_time?: string;
  r18?: boolean;
  ai?: boolean;
  _formatted?: {
    title?: string;
    author?: string;
    tags?: string[];
  };
}

export interface SearchResult {
  hits: SearchHit[];
  query: string;
  total: number;
  limit: number;
  offset: number;
  processingTimeMs: number;
}

// 搜索 API 响应接口
interface SearchResponse {
  success: boolean;
  data?: SearchResult;
  error?: string;
  message?: string;
}

// 构建查询字符串
function buildQueryString(params: SearchParams): string {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set('q', params.q);
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.offset) searchParams.set('offset', params.offset.toString());
  if (params.platform) searchParams.set('platform', params.platform);
  if (params.tags && params.tags.length > 0) searchParams.set('tags', params.tags.join(','));
  if (params.r18 !== undefined) searchParams.set('r18', params.r18.toString());
  if (params.sort) searchParams.set('sort', params.sort);

  return searchParams.toString();
}

// 搜索 API 调用
const searchFetcher = async (url: string): Promise<SearchResult> => {
  const response = await fetch(url);
  const data: SearchResponse = await response.json();

  if (!data.success) {
    throw new Error(data.message || data.error || 'Search failed');
  }

  return data.data!;
};

// 主搜索 Hook
export function useSearch(initialParams: SearchParams = {}) {
  const [params, setParams] = useState<SearchParams>(initialParams);
  const [accumulatedResults, setAccumulatedResults] = useState<SearchHit[]>([]);
  const [lastSearchQuery, setLastSearchQuery] = useState<string | undefined>(undefined);
  const [hasSearched, setHasSearched] = useState(false);
  const debouncedParams = useDebounceValue(params, 300);

  // 构建 API URL
  const queryString = buildQueryString(debouncedParams);
  const shouldFetch = hasSearched && debouncedParams.q !== undefined;
  const apiUrl = shouldFetch ? `/api/search?${queryString}` : null;

  // 使用 SWR 进行数据获取
  const { data, error, mutate, isLoading } = useSWR<SearchResult>(apiUrl, searchFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 1000,
  });

  // 检查是否是新的搜索查询
  const isNewSearch = useCallback(
    (currentQuery: string | undefined, currentOffset: number | undefined) => {
      const queryChanged = currentQuery !== lastSearchQuery;
      const isFirstPage = (currentOffset || 0) === 0;
      return queryChanged || isFirstPage;
    },
    [lastSearchQuery],
  );

  // 当数据更新时，处理累加逻辑
  useEffect(() => {
    if (data) {
      if (isNewSearch(debouncedParams.q, debouncedParams.offset)) {
        // 新搜索或首页：替换结果
        setAccumulatedResults(data.hits);
        setLastSearchQuery(debouncedParams.q);
      } else {
        // 加载更多：累加结果
        setAccumulatedResults((prev) => [...prev, ...data.hits]);
      }
    }
  }, [
    data,
    debouncedParams.q,
    debouncedParams.offset,
    debouncedParams.platform,
    debouncedParams.tags,
    debouncedParams.r18,
    debouncedParams.sort,
    isNewSearch,
  ]);

  // 清空累积结果当搜索参数变化时（除了 offset）
  useEffect(() => {
    if (debouncedParams.offset === 0) {
      setAccumulatedResults([]);
    }
  }, [
    debouncedParams.q,
    debouncedParams.platform,
    debouncedParams.tags,
    debouncedParams.r18,
    debouncedParams.sort,
    debouncedParams.offset,
  ]);

  // 更新搜索参数
  const updateParams = useCallback((newParams: Partial<SearchParams>) => {
    setHasSearched(true);
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  // 执行新搜索
  const search = useCallback((query: string, options: Partial<SearchParams> = {}) => {
    setHasSearched(true);
    setParams((prev) => ({
      ...prev,
      q: query || '', // 允许空字符串查询
      offset: 0, // 重置偏移量
      ...options,
    }));
  }, []);

  // 清空搜索
  const clearSearch = useCallback(() => {
    setParams({ limit: params.limit });
    setAccumulatedResults([]);
    setLastSearchQuery(undefined);
    setHasSearched(false);
  }, [params.limit]);

  // 加载更多结果
  const loadMore = useCallback(() => {
    if (data && accumulatedResults.length < data.total) {
      setParams((prev) => ({
        ...prev,
        offset: (prev.offset || 0) + (prev.limit || 20),
      }));
    }
  }, [data, accumulatedResults.length]);

  // 构建返回的 results 对象，包含累积的结果
  const combinedResults = data
    ? {
        ...data,
        hits: accumulatedResults,
      }
    : null;

  return {
    // 数据
    results: combinedResults,
    isLoading,
    error,

    // 状态
    params: debouncedParams,
    hasMore: data ? accumulatedResults.length < data.total : false,
    isEmpty: accumulatedResults.length === 0,

    // 方法
    search,
    updateParams,
    clearSearch,
    loadMore,
    refresh: mutate,
  };
}

// 搜索建议 Hook
export function useSearchSuggestions(query: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const debouncedQuery = useDebounceValue(query, 200);

  const shouldFetch = enabled && debouncedQuery && debouncedQuery.length >= 2;
  const apiUrl = shouldFetch ? `/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}` : null;

  const { data, error, isLoading } = useSWR(
    apiUrl,
    async (url: string) => {
      const response = await fetch(url);
      const result = await response.json();
      return result.success ? result.data : { suggestions: [] };
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
    },
  );

  return {
    suggestions: (data?.suggestions || []) as SearchSuggestion[],
    isLoading,
    error,
  };
}

// 快捷搜索 Hook（用于特定类型的搜索）
export function useQuickSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 按标签搜索
  const searchByTag = useCallback(async (tag: string, limit: number = 20): Promise<SearchResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?tags=${encodeURIComponent(tag)}&limit=${limit}`);
      const data: SearchResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Search failed');
      }

      return data.data!;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 按画师搜索
  const searchByArtist = useCallback(async (artist: string, limit: number = 20): Promise<SearchResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(`author:"${artist}"`)}&limit=${limit}`);
      const data: SearchResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Search failed');
      }

      return data.data!;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 按平台搜索
  const searchByPlatform = useCallback(async (platform: string, limit: number = 20): Promise<SearchResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?platform=${encodeURIComponent(platform)}&limit=${limit}`);
      const data: SearchResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Search failed');
      }

      return data.data!;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    searchByTag,
    searchByArtist,
    searchByPlatform,
    isLoading,
    error,
  };
}
