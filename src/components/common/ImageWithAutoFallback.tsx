'use client';
import type { ImageProps } from 'next/image';
import Image from 'next/image';
import type React from 'react';
import { useEffect, useState } from 'react';

interface ImageWithAutoFallback extends Omit<ImageProps, 'src'> {
  primarySrc: string;
  fallbackSrc: string;
  onImgFallback?: (fallbackSrc: string) => void;
  onCurrentSrcChange?: (currentSrc: string) => void;
}

const ImageWithAutoFallback: React.FC<ImageWithAutoFallback> = ({
  primarySrc,
  fallbackSrc,
  alt,
  onImgFallback,
  onCurrentSrcChange,
  ...rest
}) => {
  const [imgSrc, setImgSrc] = useState(primarySrc);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    setImgSrc(primarySrc);
    setHasFailed(false);
    onCurrentSrcChange?.(primarySrc);
  }, [primarySrc, fallbackSrc, onCurrentSrcChange]);

  const handleError = () => {
    if (!hasFailed && fallbackSrc && fallbackSrc !== imgSrc) {
      setImgSrc(fallbackSrc);
      setHasFailed(true);
      onImgFallback?.(fallbackSrc);
      onCurrentSrcChange?.(fallbackSrc);
    }
  };

  const handleLoad = (result: React.SyntheticEvent<HTMLImageElement>) => {
    if (!result.currentTarget.naturalWidth && !hasFailed && fallbackSrc && fallbackSrc !== imgSrc) {
      setImgSrc(fallbackSrc);
      setHasFailed(true);
      onImgFallback?.(fallbackSrc);
      onCurrentSrcChange?.(fallbackSrc);
    }
  };

  return <Image src={imgSrc} onLoad={handleLoad} onError={handleError} loading="lazy" alt={alt} {...rest} />;
};

export default ImageWithAutoFallback;
