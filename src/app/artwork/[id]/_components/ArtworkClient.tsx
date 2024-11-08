'use client';

import { Platform } from '@/lib/type';
import { ClientOnly } from '@/components/common/ClientOnly';
import PhotoViewer from '@/components/ui/PhotoViewer';
import { FaSquareXTwitter } from 'react-icons/fa6';
import { SiPixiv } from 'react-icons/si';

type ArtworkClientProps = {
  artwork: any;
  originShowUrl: string;
  authorUrl: string;
  artworkUrl: string;
};

export default function ArtworkClient({ artwork, originShowUrl, authorUrl, artworkUrl }: ArtworkClientProps) {
  return (
    <div className="container mx-auto overflow-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8 overflow-auto lg:grid-cols-2">
        <div className="relative aspect-auto">
          <ClientOnly>
            <PhotoViewer originUrl={originShowUrl} thumbUrl={originShowUrl} title={artwork?.title ?? ''} />
          </ClientOnly>
        </div>

        <div className="flex flex-col space-y-6">
          <h1 className="break-all text-3xl font-bold">{artwork.title}</h1>

          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-2">
              <span className="min-w-16 text-gray-600 dark:text-gray-400">作者：</span>
              <a href={authorUrl} target="_blank" className="flex items-center gap-2 text-primary hover:underline">
                {artwork.platform === Platform.Pixiv && <SiPixiv className="text-xl" />}
                {artwork.platform === Platform.Twitter && <FaSquareXTwitter className="text-xl" />}
                {artwork.author}
              </a>
            </div>

            <div className="flex items-center gap-2">
              <span className="min-w-16 text-gray-600 dark:text-gray-400">平台：</span>
              <span>{artwork.platform}</span>
            </div>
          </div>
          <a
            href={artworkUrl}
            target="_blank"
            className="inline-block w-fit rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary/90"
          >
            在 {artwork.platform} 上查看原图
          </a>
        </div>
      </div>
    </div>
  );
}
