import { Image } from '@prisma/client';
import superjson from 'superjson';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { ImageWithTag } from '../type';
import { useMemo } from 'react';

interface ImagesResponse {
  images: ImageWithTag[];
  total: number;
}

export type ArtworkData = Image & {
  tags: string[];
};

const fetcher = async (url: string): Promise<ImagesResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('加载失败');
  }
  return res.json();
};

const artworkFetcher = async (url: string): Promise<ArtworkData> => {
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('作品不存在');
    }
    throw new Error('加载失败');
  }
  const data = await res.json();
  return superjson.deserialize(data);
};

export function useImages(page: number, pageSize: number, initialData?: ImagesResponse, enabled: boolean = true) {
  const { data, error, isLoading, mutate } = useSWR<ImagesResponse>(
    enabled ? `/api/list?page=${page}&pageSize=${pageSize}&mode=pagination` : null, 
    fetcher, 
    {
      fallbackData: initialData,
    }
  );

  return {
    images: data?.images,
    total: data?.total,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useArtwork(id: string) {
  const { data, error, isLoading, mutate } = useSWR<ArtworkData>(`/api/artwork/${id}`, artworkFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {
    artwork: data,
    isLoading,
    isError: error,
    mutate,
  };
}

interface ArtistInfo {
  author: string | null;
  authorid: string | null;
  platform: string | null;
  artworkCount: number;
}

interface ArtistImagesResponse {
  images: ImageWithTag[];
  total: number;
}

const artistInfoFetcher = async (url: string): Promise<ArtistInfo> => {
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('画师不存在');
    }
    throw new Error('加载失败');
  }
  return res.json();
};

const artistImagesFetcher = async (url: string): Promise<ArtistImagesResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('加载失败');
  }
  return res.json();
};

export function useArtistInfo(platform: string, authorid: string) {
  const { data, error, isLoading, mutate } = useSWR<ArtistInfo>(
    `/api/artist?platform=${platform}&authorid=${authorid}&infoOnly=true`,
    artistInfoFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    artistInfo: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useArtistImages(
  platform: string,
  authorid: string,
  page: number,
  pageSize: number,
  initialData?: ArtistImagesResponse,
) {
  const { data, error, isLoading, mutate } = useSWR<ArtistImagesResponse>(
    `/api/artist?platform=${platform}&authorid=${authorid}&page=${page}&pageSize=${pageSize}`,
    artistImagesFetcher,
    {
      fallbackData: initialData,
    },
  );

  return {
    images: data?.images,
    total: data?.total,
    isLoading,
    isError: error,
    mutate,
  };
}

// Add this new hook for infinite scrolling on artist pages
export function useInfiniteArtistImages(
  platform: string,
  uid: string,
  pageSize: number,
  initialData?: {
    images: ImageWithTag[];
    total: number;
  },
) {
  const getKey = (pageIndex: number) => {
    return `/api/artist?platform=${platform}&authorid=${uid}&page=${pageIndex + 1}&pageSize=${pageSize}`;
  };

  const { data, error, size, setSize, isLoading, isValidating } = useSWRInfinite<{
    images: ImageWithTag[];
    total: number;
  }>(getKey, artistImagesFetcher, {
    fallbackData: initialData ? [initialData] : undefined,
    revalidateFirstPage: false,
  });

  const isLoadingMore = isLoading || isValidating || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const total = data?.[0]?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = size < totalPages;

  return useMemo(() => {
    return {
      data,
      allImages: data?.flatMap((page) => page.images) ?? [],
      error,
      isLoading: isLoadingMore,
      hasNextPage,
      fetchNextPage: () => setSize(size + 1),
      size,
      total,
    };
  }, [data, error, isLoadingMore, hasNextPage, size, setSize, total]);
}
