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

export function usePopularArtists(pageSize = 20, sortBy: 'artworks' | 'random' = 'artworks') {
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

export function useInfinitePopularArtists(pageSize = 20, sortBy: 'artworks' | 'random' = 'artworks') {
  const getKey = (pageIndex: number, previousPageData: PopularArtistsResponse | null) => {
    if (previousPageData && !previousPageData.hasNextPage) return null;
    return `/api/artists?page=${pageIndex + 1}&pageSize=${pageSize}&sortBy=${sortBy}`;
  };

  const { data, error, size, setSize, mutate, isValidating } = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
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

      console.log('📡 fetchNextPage called', { currentSize, newSize, currentDataLength: data?.length });

      // Set new size to trigger fetch
      setSize(newSize);

      // Wait for the data to be fetched by checking isValidating
      return new Promise((resolve, reject) => {
        let timeoutId: NodeJS.Timeout;
        let retryCount = 0;
        const maxRetries = 30; // 3 seconds timeout (100ms * 30)

        const checkForNewData = () => {
          // Clear previous timeout
          if (timeoutId) clearTimeout(timeoutId);

          console.log(`🔍 checkForNewData attempt ${retryCount + 1}`, {
            currentDataLength: data?.length,
            expectedLength: newSize,
            isValidating,
          });

          // Check if we got new data or if validation finished
          if (data && data.length >= newSize) {
            console.log('✅ fetchNextPage: got new data', data);
            resolve(data);
            return;
          }

          // Check if we've exceeded max retries
          if (retryCount >= maxRetries) {
            console.log('❌ fetchNextPage: timeout');
            reject(new Error('Timeout waiting for new data'));
            return;
          }

          retryCount++;
          timeoutId = setTimeout(checkForNewData, 100);
        };

        // Start checking
        checkForNewData();
      });
    },
    mutate,
  };
}
