import { Button } from '@/components/ui/button';
import Card3d from '@/components/ui/card3d';
import { microDampingPreset, microReboundPreset } from '@/constants/anim/spring';
import { Platform } from '@/lib/type';
import { genArtistUrl, genArtworkUrl, transformPixivUrl } from '@/lib/utils';
import { images } from '@prisma/client';
import { AnimatePresence, motion } from 'framer-motion';
import { Masonry } from 'masonic';
import { useEffect, useMemo, useState } from 'react';
import { FaArrowRotateRight, FaCircleMinus, FaCirclePlus, FaSquareXTwitter } from 'react-icons/fa6';
import { SiPixiv } from 'react-icons/si';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { FaExternalLinkAlt } from 'react-icons/fa';

const ImageItem = ({ data }: { data: images }) => {
  const { id, title, author, thumburl, rawurl, platform, authorid, pid } = data ?? {};
  const [isHover, setIsHover] = useState(false);
  const thumbShowUrl = useMemo(() => transformPixivUrl(thumburl ?? ''), [thumburl]);
  const originShowUrl = useMemo(() => transformPixivUrl(rawurl ?? ''), [rawurl]);
  const authorUrl = useMemo(
    () => genArtistUrl(platform, { uid: authorid?.toString() ?? '', username: author ?? '' }),
    [platform, authorid, author],
  );
  const artworkUrl = useMemo(
    () => genArtworkUrl({ platform: platform ?? '', pid: pid ?? '', username: author ?? '' }),
    [platform, authorid, author],
  );
  return (
    <motion.div
      key={id}
      layout
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      whileHover={{ scale: 1.1 }}
      className="group relative overflow-hidden rounded-lg hover:z-10"
    >
      <PhotoView src={originShowUrl}>
        <Card3d className="relative" scaleNum={1.05}>
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
        </motion.div>
      )}
    </motion.div>
  );
};

const ImageList = () => {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [images, setImages] = useState<images[]>([]);

  console.log({ images });

  useEffect(() => {
    const fetchImages = async () => {
      const response = await fetch(`/api/list?page=${page}&pageSize=${pageSize}`);
      const data = await response.json();
      setImages(data);
    };

    fetchImages();
  }, [page]);

  return (
    <div className="flex flex-col gap-4 px-3">
      <div className="flex items-center justify-between">
        <Button className="px-4 py-2" onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
          上一页
        </Button>
        <span className="text-lg">第 {page} 页</span>
        <Button className="px-4 py-2" onClick={() => setPage((prev) => prev + 1)}>
          下一页
        </Button>
      </div>
      <AnimatePresence mode="wait">
        <PhotoProvider
          toolbarRender={({ onRotate, onScale, rotate, scale, index, images }) => {
            return (
              <>
                <FaArrowRotateRight className="mr-2 h-5 w-5 cursor-pointer" onClick={() => onRotate(rotate + 90)} />
                <FaCirclePlus className="mr-2 h-5 w-5 cursor-pointer" onClick={() => onScale(scale + 1)} />
                <FaCircleMinus className="mr-2 h-5 w-5 cursor-pointer" onClick={() => onScale(scale - 1)} />
              </>
            );
          }}
        >
          <Masonry
            items={images}
            columnGutter={26} // 列间距
            columnWidth={250} // 列宽
            render={ImageItem}
          />
        </PhotoProvider>
      </AnimatePresence>
    </div>
  );
};

export default ImageList;
