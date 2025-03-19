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
