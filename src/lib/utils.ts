import { IMG_ORIGIN_URL, PIXIV_PROXY_URL } from '@/constants';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Platform } from './type';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getImageThumbUrl = ({
  thumbUrl,
  platform,
  filename,
}: {
  thumbUrl?: string | null;
  platform?: string | null;
  filename?: string | null;
}) => {
  const transformThumbUrl = thumbUrl ? transformPixivUrl(thumbUrl) : '';
  const s3ThumbUrl = platform && filename ? `${IMG_ORIGIN_URL}${platform}/${filename.replace(/\.(jpg|png)$/, '.webp')}` : '';
  // 当 transformThumbUrl 请求有效的时候，优先使用 transformThumbUrl ，否则如果 transformThumbUrl 请求返回的不是图片，就 fallback 到 s3ThumbUrl
  return {
    transformThumbUrl,
    s3ThumbUrl,
  };
};

export const getImageOriginUrl = ({
  rawUrl,
  platform,
  filename,
}: {
  rawUrl?: string | null;
  platform?: string | null;
  filename?: string | null;
}) => {
  const transformOriginUrl = rawUrl ? transformPixivUrl(rawUrl) : '';
  const s3OriginUrl = platform && filename ? `${IMG_ORIGIN_URL}${platform}/${filename.replace(/\.(jpg|png)$/, '.webp')}` : '';
  return {
    transformOriginUrl,
    s3OriginUrl,
  };
};

export const transformPixivUrl = (url: string) => {
  const isPixiv = /i\.pximg\.net/.test(url);
  if (isPixiv && PIXIV_PROXY_URL) return url.replace('i.pximg.net', PIXIV_PROXY_URL);
  return url;
};

export const genArtistUrl = (platform?: string | null, artist?: { uid?: string; username?: string }) => {
  if (!platform || !artist) return '';
  switch (platform) {
    case Platform.Pixiv:
      return 'https://www.pixiv.net/users/' + artist.uid;
    case Platform.Twitter:
      return 'https://x.com/i/user/' + artist.uid;
  }
};

export const genArtworkUrl = (opts?: { platform?: string | null; pid?: string; username?: string }) => {
  const { platform, pid, username } = opts ?? {};
  if (!platform) return '';
  switch (platform) {
    case Platform.Pixiv:
      return 'https://www.pixiv.net/artworks/' + pid;
    case Platform.Twitter:
      return 'https://x.com/_/status/' + pid;
  }
};
