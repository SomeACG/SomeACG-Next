import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { PopularArtistsResponse } from '@/lib/type';

const fetcher = async (url: string): Promise<PopularArtistsResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
};

export function usePopularArtists(pageSize = 20, sortBy: 'artworks' | 'random' | 'lastUpdate' = 'artworks') {
  const { data, error, mutate } = useSWR(`/api/artists?page=1&pageSize=${pageSize}&sortBy=${sortBy}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {
    artists: data?.artists || [],
    total: data?.total || 0,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useInfinitePopularArtists(pageSize = 20, sortBy: 'artworks' | 'random' | 'lastUpdate' = 'artworks') {
  const getKey = (pageIndex: number, previousPageData: PopularArtistsResponse | null) => {
    if (previousPageData && !previousPageData.hasNextPage) return null;
    return `/api/artists?page=${pageIndex + 1}&pageSize=${pageSize}&sortBy=${sortBy}`;
  };

  const { data, error, size, setSize, mutate, isValidating } = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateFirstPage: false,
    parallel: false,
  });

  const allArtists = data ? data.flatMap((page) => page.artists) : [];
  const total = data?.[0]?.total || 0;
  const hasNextPage = data && data[data.length - 1]?.hasNextPage;

  return {
    allArtists,
    total,
    isLoading: !error && !data,
    error,
    hasNextPage,
    isValidating,
    fetchNextPage: async () => {
      const currentSize = size;
      const newSize = currentSize + 1;
      try {
        await setSize(newSize);
      } catch (error) {
        console.error('❌ fetchNextPage: failed to load page', newSize, error);
        throw error;
      }
    },
    mutate,
  };
}
