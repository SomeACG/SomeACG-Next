import { Button } from '@/components/ui/button';
import Card3d from '@/components/ui/card3d';
import { SourceImage } from '@/lib/type';
import { transformPixivUrl } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Masonry } from 'masonic';
import { useEffect, useMemo, useState } from 'react';
import { FaArrowRotateRight, FaCircleMinus, FaCirclePlus } from 'react-icons/fa6';
import { PhotoProvider, PhotoView } from 'react-photo-view';

const ImageItem = ({ data }: { data: SourceImage }) => {
  const { id, title, thumburl, rawurl } = data ?? {};

  const thumbShowUrl = useMemo(() => transformPixivUrl(thumburl), [thumburl]);
  const originShowUrl = useMemo(() => transformPixivUrl(rawurl), [rawurl]);

  // console.log({ id, title, thumbShowUrl, originShowUrl, data });
  return (
    <motion.div key={id} layout whileHover={{ scale: 1.05 }} className="cursor-pointer">
      <PhotoView src={originShowUrl}>
        <Card3d scaleNum={1.05}>
          <img src={thumbShowUrl} alt={title} className="h-auto w-full rounded-lg shadow-md" />
        </Card3d>
      </PhotoView>
    </motion.div>
  );
};

const ImageList = () => {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [images, setImages] = useState<SourceImage[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      const response = await fetch(`/api/list?page=${page}&pageSize=${pageSize}`);
      const data = await response.json();
      setImages(data);
    };

    fetchImages();
  }, [page]);

  return (
    <div className="flex flex-col gap-4 px-1">
      <div className="flex items-center justify-between">
        <Button className="px-4 py-2" onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
          上一页
        </Button>
        <span className="text-lg">第 {page} 页</span>
        <Button className="px-4 py-2" onClick={() => setPage((prev) => prev + 1)}>
          下一页
        </Button>
      </div>
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
    </div>
  );
};

export default ImageList;
