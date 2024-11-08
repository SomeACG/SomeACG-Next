'use client';
import { Platform } from '@/lib/type';
import { genArtistUrl, genArtworkUrl, transformPixivUrl } from '@/lib/utils';
import { images } from '@prisma/client';
import { useEffect, useState } from 'react';
import { FaArrowRotateRight, FaCircleMinus, FaCirclePlus, FaSquareXTwitter } from 'react-icons/fa6';
import { SiPixiv } from 'react-icons/si';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import superjson from 'superjson';

export default function ArtworkPage({ params }: { params: { id: string } }) {
  const [artwork, setArtwork] = useState<images | null>(null);

  useEffect(() => {
    const fetchArtwork = async () => {
      const response = await fetch(`/api/artwork/${params.id}`);
      const serializedData = await response.json();
      const artwork = superjson.deserialize(serializedData);
      setArtwork(artwork as images);
    };

    fetchArtwork();
  }, [params.id]);

  if (!artwork) return <div className="flex-center min-h-screen">加载中...</div>;

  const originShowUrl = transformPixivUrl(artwork.rawurl ?? '');
  const authorUrl = genArtistUrl(artwork.platform, {
    uid: artwork.authorid?.toString(),
    username: artwork.author ?? '',
  });
  const artworkUrl = genArtworkUrl({
    platform: artwork.platform,
    pid: artwork.pid ?? '',
    username: artwork.author ?? '',
  });

  return (
    <div className="container mx-auto overflow-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8 overflow-auto lg:grid-cols-2">
        <div className="relative aspect-auto">
          <PhotoProvider
            toolbarRender={({ onRotate, onScale, rotate, scale }) => {
              return (
                <>
                  <FaArrowRotateRight className="mr-2 h-5 w-5 cursor-pointer" onClick={() => onRotate(rotate + 90)} />
                  <FaCirclePlus className="mr-2 h-5 w-5 cursor-pointer" onClick={() => onScale(scale + 1)} />
                  <FaCircleMinus className="mr-2 h-5 w-5 cursor-pointer" onClick={() => onScale(scale - 1)} />
                </>
              );
            }}
          >
            <PhotoView src={originShowUrl}>
              <img src={originShowUrl} alt={artwork?.title ?? ''} className="w-full rounded-lg object-contain shadow-lg" />
            </PhotoView>
          </PhotoProvider>
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
