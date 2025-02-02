'use client';

import ImagePagination from '@/app/(home)/components/ImagePagination';
import { routers, Routes } from '@/constants/router';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useScrollHide } from '@/hooks/useScrollHide';
import { viewModeAtom } from '@/store/app';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useAtomValue } from 'jotai';

export function Footer() {
  const isMounted = useIsMounted();
  const pathname = usePathname();
  const isVisible = useScrollHide();
  const viewMode = useAtomValue(viewModeAtom);

  return (
    <footer
      className={cn(
        'bg-background/80 backdrop-blur-sm transition-transform duration-300',
        isVisible ? 'translate-y-0' : 'translate-y-full',
      )}
    >
      {isMounted && pathname === Routes.Home && viewMode === 'pagination' && <ImagePagination />}
    </footer>
  );
}
