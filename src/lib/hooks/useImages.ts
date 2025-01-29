import useSWR from 'swr';
import { images } from '@prisma/client';
import superjson from 'superjson';
import { Platform } from '@/lib/type';

interface ImagesResponse {
  images: images[];
  total: number;
}

interface ArtworkData {
  id: number;
  title: string;
  platform: Platform;
  author: string;
  authorid: bigint | null;
  pid: string;
  rawurl: string | null;
  tags: string[];
}

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
