'use client';
import { ClientOnly } from '@/components/common/ClientOnly';
import { Button } from '@/components/ui/button';
import Card3d from '@/components/ui/card3d';
import { microReboundPreset } from '@/constants/anim/spring';
import { Platform } from '@/lib/type';
import { genArtistUrl, genArtworkUrl, transformPixivUrl } from '@/lib/utils';
import { pageAtom, totalPageAtom } from '@/store/app';
import { images } from '@prisma/client';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtomValue, useSetAtom } from 'jotai';
import { Masonry } from 'masonic';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { FaArrowRotateRight, FaCircleMinus, FaCirclePlus, FaSquareXTwitter } from 'react-icons/fa6';
import { SiPixiv } from 'react-icons/si';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import superjson from 'superjson';

const ImageItem = ({ data }: { data: images }) => {
  const { id, title, author, thumburl, rawurl, platform, authorid, pid } = data ?? {};
  const [isHover, setIsHover] = useState(false);
  const router = useRouter();

  const thumbShowUrl = useMemo(() => transformPixivUrl(thumburl ?? ''), [thumburl]);
  const originShowUrl = useMemo(() => transformPixivUrl(rawurl ?? ''), [rawurl]);
  const authorUrl = useMemo(
    () => genArtistUrl(platform, { uid: authorid?.toString() ?? '', username: author ?? '' }),
    [platform, authorid, author],
  );
  const artworkUrl = useMemo(
    () => genArtworkUrl({ platform: platform ?? '', pid: pid ?? '', username: author ?? '' }),
    [platform, author, pid],
  );

  return (
    <motion.div
      key={id}
      layout
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      // whileHover={{ scale: 1.1 }}
      className="group relative overflow-hidden rounded-lg hover:z-10"
    >
      <PhotoView src={originShowUrl}>
        <Card3d className="relative" scaleNum={1.2}>
          <img src={thumbShowUrl} alt={title ?? ''} className="h-auto w-full cursor-pointer rounded-lg shadow-md" />
        </Card3d>
      </PhotoView>
      {isHover && (
        <motion.div
          key={'item-desc-' + id}
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          exit={{ y: 50 }}
          transition={{ ...microReboundPreset, duration: 0.3 }}
          className="flex-center-y absolute inset-x-0 -bottom-1 z-10 bg-black/70 bg-opacity-40 p-2 pb-3 text-white"
        >
          <motion.a
            target="_blank"
            className="absolute -bottom-10 -right-10 h-20 w-20 rounded-full bg-primary p-1 pl-4 pt-3 text-white"
            href={artworkUrl}
            whileHover={{ scale: 1.1 }}
          >
            <FaExternalLinkAlt />
          </motion.a>
          <h2 className="mt-auto line-clamp-2 text-sm/5 font-semibold">{title}</h2>
          <a target="_blank" className="flex-center w-full cursor-pointer gap-2" href={authorUrl}>
            {platform === Platform.Pixiv && (
              <SiPixiv className="cursor-pointer" href={genArtistUrl(platform, { uid: authorid?.toString() ?? '' })} />
            )}
            {platform === Platform.Twitter && (
              <FaSquareXTwitter className="cursor-pointer" href={genArtistUrl(platform, { username: author ?? '' })} />
            )}
            <span className="truncate text-xs">{author}</span>
          </a>
          <Button variant="link" onClick={() => router.push(`/artwork/${id}`)}>
            <FaExternalLinkAlt /> 详细信息
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

type ImageListProps = {
  initialData: {
    images: images[];
    total: number;
  };
};

const ImageList = ({ initialData }: ImageListProps) => {
  const page = useAtomValue(pageAtom);
  const pageSize = 20;
  const [images, setImages] = useState<images[]>(initialData.images);
  const setTotalPage = useSetAtom(totalPageAtom);

  useEffect(() => {
    setTotalPage(Math.floor(initialData.total / pageSize));
  }, [initialData.total, setTotalPage]);

  useEffect(() => {
    if (page === 1) return;

    const fetchImages = async () => {
      const response = await fetch(`/api/list?page=${page}&pageSize=${pageSize}`);
      const serializedData = await response.json();
      const data = superjson.deserialize(serializedData) as { images: images[]; total: number };
      setImages(data.images);
    };

    fetchImages();
  }, [page]);

  return (
    <div className="flex flex-col gap-4 px-3">
      <AnimatePresence mode="wait">
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
          <ClientOnly>
            <Masonry
              items={images}
              columnGutter={26} // 列间距
              columnWidth={250} // 列宽
              render={ImageItem}
            />
          </ClientOnly>
        </PhotoProvider>
      </AnimatePresence>
    </div>
  );
};

export default ImageList;
