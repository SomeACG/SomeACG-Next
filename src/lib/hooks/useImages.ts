import useSWR from 'swr';
import { images } from '@prisma/client';

interface ImagesResponse {
  images: images[];
  total: number;
}

const fetcher = async (url: string): Promise<ImagesResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('加载失败');
  }
  return res.json();
};

export function useImages(page: number, pageSize: number, initialData?: ImagesResponse) {
  const { data, error, isLoading, mutate } = useSWR<ImagesResponse>(`/api/list?page=${page}&pageSize=${pageSize}`, fetcher, {
    fallbackData: initialData,
  });

  return {
    images: data?.images,
    total: data?.total,
    isLoading,
    isError: error,
    mutate,
  };
}
