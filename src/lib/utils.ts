import { PIXIV_PROXY_URL } from "@/constants";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const transformPixivUrl = (url: string) => {
  const isPixiv = /i\.pximg\.net/.test(url);
  if (isPixiv && PIXIV_PROXY_URL) return url.replace('i.pximg.net', PIXIV_PROXY_URL);
  return url;
};