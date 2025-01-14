import { images } from '@prisma/client';
import useSWRInfinite from 'swr/infinite';

interface ImagesResponse {
  images: images[];
  total: number;
}

async function fetchImages(page: number, pageSize: number): Promise<ImagesResponse> {
  console.log('fetchImages', page, pageSize);
  const response = await fetch(`/api/list?page=${page}&pageSize=${pageSize}`);
  if (!response.ok) {
    throw new Error('Failed to fetch images');
  }
  return response.json();
}

export function useInfiniteImages(pageSize: number, initialData: ImagesResponse) {
  const getKey = (pageIndex: number) => {
    return [`/api/list?page=${pageIndex + 1}&pageSize=${pageSize}`, pageIndex + 1, pageSize];
  };

  const { data, error, size, setSize, isLoading } = useSWRInfinite<ImagesResponse>(
    getKey,
    ([url, page, pageSize]) => fetchImages(page, pageSize),
    {
      //   fallbackData: [initialData],
      revalidateFirstPage: false,
    },
  );

  const allImages = data?.flatMap((page) => page.images) ?? [];
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const total = data?.[0]?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = size < totalPages;
  console.log({ allImages, size, totalPages, hasNextPage, isLoadingMore, error, data });
  return {
    data,
    allImages,
    error,
    isLoading: isLoadingMore,
    hasNextPage,
    fetchNextPage: () => setSize(size + 1),
    size,
  };
}
