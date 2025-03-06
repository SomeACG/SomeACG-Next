'use client';
import type { ImageProps } from 'next/image';
import Image from 'next/image';
import type React from 'react';
import { useEffect, useState } from 'react';

interface ImageFb extends ImageProps {
  fallbackSrc?: string;
  onImgFallback?: (fallbackSrc: string) => void;
}
const ImageFb: React.FC<ImageFb> = ({ src, fallbackSrc = '', alt, onImgFallback, ...rest }) => {
  const [imgSrc, set_imgSrc] = useState(src);

  useEffect(() => {
    set_imgSrc(src);
  }, [src]);

  return (
    <Image
      src={imgSrc}
      onLoad={(result) => {
        if (!result.currentTarget.naturalWidth) {
          set_imgSrc(fallbackSrc); // Fallback image
          onImgFallback?.(fallbackSrc);
        }
      }}
      onError={() => {
        set_imgSrc(fallbackSrc);
        onImgFallback?.(fallbackSrc);
      }}
      loading="lazy"
      alt={alt}
      {...rest}
    />
  );
};

export default ImageFb;
