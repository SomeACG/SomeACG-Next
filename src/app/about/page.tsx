'use client';

import Card from '@/components/ui/card';
import Lottie from '@lottielab/lottie-player/react';

export default function About() {
  return (
    <Card className="p-20 text-xl">
      <h2 className="text-2xl font-bold">About</h2>
      <p className="text-sm">Cosine 🎨 Gallery 是一个精选的 ACG 图片列表，旨在为用户提供高质量的图片资源。</p>
      <p className="text-sm">此处我必须要晒出我精心设计的 Logo 喵</p>
      <div className="relative max-h-[29rem] overflow-hidden">
        <Lottie src="https://cdn.lottielab.com/l/APXV8RHbvRVEoH.json" className="-mt-12 max-h-[37.5rem]" />
      </div>
    </Card>
  );
}
