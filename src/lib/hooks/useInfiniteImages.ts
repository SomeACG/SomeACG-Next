import { useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { ImageWithTag } from '../type';

interface ImagesResponse {
  images: ImageWithTag[];
  total: number;
}

const fetcher = async (url: string): Promise<ImagesResponse> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('获取图片失败:', error);
    throw error;
  }
};

export function useInfiniteImages(pageSize: number, initialData: ImagesResponse) {
  const getKey = (pageIndex: number) => {
    return `/api/list?page=${pageIndex + 1}&pageSize=${pageSize}`;
  };

  const { data, error, size, setSize, isLoading, isValidating } = useSWRInfinite<ImagesResponse>(getKey, fetcher, {
    fallbackData: [initialData],
    revalidateFirstPage: false,
  });

  const isLoadingMore = isLoading || isValidating || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const total = data?.[0]?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = size < totalPages;
  // console.log({ allImages, size, totalPages, hasNextPage, isLoadingMore, error, data });

  return useMemo(() => {
    return {
      data,
      allImages: data?.flatMap((page) => page.images) ?? [],
      error,
      isLoading: isLoadingMore,
      hasNextPage,
      fetchNextPage: () => setSize(size + 1),
      size,
    };
  }, [data, error, isLoadingMore, hasNextPage, size, setSize]);
}
