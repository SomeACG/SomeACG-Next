import { PIXIV_PROXY_URL } from '@/constants';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Platform } from './type';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const transformPixivUrl = (url: string) => {
  const isPixiv = /i\.pximg\.net/.test(url);
  if (isPixiv && PIXIV_PROXY_URL) return url.replace('i.pximg.net', PIXIV_PROXY_URL);
  return url;
};

export const genArtistUrl = (platform: string | null, artist: { uid?: string; username?: string }) => {
  if (!platform) return '';
  switch (platform) {
    case Platform.Pixiv:
      return 'https://www.pixiv.net/users/' + artist.uid;
    case Platform.Twitter:
      return 'https://x.com/i/user/' + artist.uid;
  }
};

export const genArtworkUrl = (opts?: { platform: string | null; pid: string; username?: string }) => {
  const { platform, pid, username } = opts ?? {};
  if (!platform) return '';
  switch (platform) {
    case Platform.Pixiv:
      return 'https://www.pixiv.net/artworks/' + pid;
    case Platform.Twitter:
      return 'https://x.com/_/status/' + pid;
  }
};
