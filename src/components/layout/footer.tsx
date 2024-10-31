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
      <div className="flex items-center justify-center gap-1 py-2 text-sm">
        壁纸不够看？订阅
        <a className="text-blue-400" href="https://t.me/SomeACG">
          SomeACG
        </a>
        壁纸频道 每天获取高质量壁纸！
      </div>
    </footer>
  );
}
