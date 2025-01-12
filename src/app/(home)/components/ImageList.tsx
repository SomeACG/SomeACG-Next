'use client';
import { ClientOnly } from '@/components/common/ClientOnly';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loading/Loader';
import { microReboundPreset } from '@/constants/anim/spring';
import { Platform } from '@/lib/type';
import { genArtistUrl, genArtworkUrl, transformPixivUrl } from '@/lib/utils';
import { pageAtom, totalPageAtom } from '@/store/app';
import { images } from '@prisma/client';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtomValue, useSetAtom } from 'jotai';
import { Masonry } from 'masonic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { FaArrowRotateRight, FaCircleMinus, FaCirclePlus, FaSquareXTwitter } from 'react-icons/fa6';
import { SiPixiv } from 'react-icons/si';
import { PhotoProvider, PhotoView } from 'react-photo-view';

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) => (typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str));

const ImageItem = ({ data }: { data: images }) => {
  const { id, title, author, thumburl, rawurl, platform, authorid, pid, width, height } = data ?? {};
  const [isHover, setIsHover] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  // 计算容器高度
  const paddingBottom = useMemo(() => {
    if (width && height && width > 0 && height > 0) {
      const ratio = width / height;
      return `${(1 / ratio) * 100}%`;
    }
    return '75%'; // 默认 4:3 比例
  }, [width, height]);

  return (
    <ClientOnly>
      <motion.div
        key={id}
        layout
        onHoverStart={() => setIsHover(true)}
        onHoverEnd={() => setIsHover(false)}
        className="group relative overflow-hidden rounded-lg hover:z-10"
      >
        <PhotoView src={originShowUrl}>
          <div className="relative bg-primary/20" style={{ width: '100%', paddingBottom }}>
            {isLoading && <Loader className="absolute inset-0" />}
            <div className="absolute inset-0">
              <Image
                src={thumbShowUrl}
                alt={title ?? ''}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={`cursor-pointer rounded-lg object-cover shadow-md transition-opacity duration-300 ${
                  isLoading ? 'opacity-0' : 'opacity-100'
                }`}
                placeholder="blur"
                blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                onLoad={() => setIsLoading(false)}
                priority={false}
                quality={75}
              />
            </div>
          </div>
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
    </ClientOnly>
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
  const [isLoading, setIsLoading] = useState(false);
  const setTotalPage = useSetAtom(totalPageAtom);

  // 使用 useCallback 缓存 render 函数
  const renderItem = useCallback((props: { data: images; index: number }) => {
    return <ImageItem data={props.data} />;
  }, []);

  useEffect(() => {
    setTotalPage(Math.round(initialData.total / pageSize));
  }, [initialData.total, setTotalPage]);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    const fetchImages = async () => {
      try {
        const response = await fetch(`/api/list?page=${page}&pageSize=${pageSize}`);
        const serializedData = await response.json();

        if (mounted) {
          // 直接设置新数据，不再使用 setTimeout
          setImages(serializedData.images || []);
        }
      } catch (error) {
        console.error('获取图片失败:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchImages();

    return () => {
      mounted = false;
    };
  }, [page, pageSize]);

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
            {isLoading ? (
              <div className="flex-center min-h-[200px]">
                <div className="text-lg">加载中...</div>
              </div>
            ) : images.length > 0 ? (
              <Masonry items={images} columnGutter={26} columnWidth={250} render={renderItem} key={`masonry-${page}`} />
            ) : (
              <div className="flex-center min-h-[200px]">
                <div className="text-lg">暂无数据</div>
              </div>
            )}
          </ClientOnly>
        </PhotoProvider>
      </AnimatePresence>
    </div>
  );
};

export default ImageList;
