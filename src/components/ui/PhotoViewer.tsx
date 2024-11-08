'use client';

import React from 'react';
import { FaArrowRotateRight, FaCircleMinus, FaCirclePlus } from 'react-icons/fa6';
import { PhotoProvider, PhotoView } from 'react-photo-view';

export default function PhotoViewer({ originUrl, thumbUrl, title }: { originUrl: string; thumbUrl: string; title: string }) {
  return (
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
      <PhotoView src={originUrl}>
        <img src={thumbUrl} alt={title ?? ''} className="w-full rounded-lg object-contain shadow-lg" />
      </PhotoView>
    </PhotoProvider>
  );
}
