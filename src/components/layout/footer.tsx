'use client';

import ImagePagination from '@/app/(home)/components/ImagePagination';
import { routers, Routes } from '@/constants/router';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useScrollHide } from '@/hooks/useScrollHide';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export function Footer() {
  const isMounted = useIsMounted();
  const pathname = usePathname();
  const isVisible = useScrollHide();
  routers;
  return (
    <footer
      className={cn(
        'bg-background/80 backdrop-blur transition-transform duration-300',
        isVisible ? 'translate-y-0' : 'translate-y-full',
      )}
    >
      {isMounted && pathname === Routes.Home && <ImagePagination />}
    </footer>
  );
}
