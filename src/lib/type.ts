import { Image, ImageTag } from '@prisma/client';

export enum Platform {
  Pixiv = 'pixiv',
  Twitter = 'twitter',
}
export type Artist = {
  id?: number;
  type: Platform;
  uid?: string;
  name: string;
  username?: string;
  create_time?: string; // TODO: resolve DateTime problem
};

export type ImageWithTag = Image & {
  tags: string[];
};

// Popular Artist types
export type PopularArtist = {
  platform: string | null;
  authorid: string | null;
  author: string | null;
  artworkCount: number;
  latestImageThumb: string | null;
  latestImageFilename: string | null;
  lastUpdateTime: Date | null;
};

export type PopularArtistsResponse = {
  artists: PopularArtist[];
  total: number;
  hasNextPage: boolean;
};
