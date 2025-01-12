'use client';

import ImagePagination from '@/app/(home)/components/ImagePagination';
import { useIsMounted } from '@/hooks/useIsMounted';
import { usePathname } from 'next/navigation';

export function Footer() {
  const isMounted = useIsMounted();
  const pathname = usePathname();
  return (
    <footer className="flex-center-y items-stretch">
      {isMounted && pathname === '/' && <ImagePagination />}
      <div className="flex items-center justify-center gap-1 py-3 text-xs">
        关注余弦谢谢喵，关注
        <a className="text-blue-400" href="https://t.me/CosineGallery">
          Cosine 🎨 Gallery
        </a>
        每天看甜妹！
      </div>
    </footer>
  );
}
