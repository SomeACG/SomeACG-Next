'use client';

import { useIsMounted } from '@/hooks/useIsMounted';
import { useScrollHide } from '@/hooks/useScrollHide';
import { cn } from '@/lib/utils';

export function Footer() {
  const isMounted = useIsMounted();
  const isVisible = useScrollHide();

  if (!isMounted) return null;

  return (
    <footer
      className={cn(
        'bg-background/80 backdrop-blur-sm transition-transform duration-300',
        isVisible ? 'translate-y-0' : 'translate-y-full',
      )}
    >
      <div className="@container flex items-center justify-center px-2 py-3">
        <div className="text-muted-foreground hidden items-center justify-center gap-1 text-xs @lg:flex">
          关注
          <a className="text-blue-400 hover:underline" href="https://t.me/CosineGallery">
            Cosine 🎨 Gallery
          </a>
          每天看甜妹！
        </div>
      </div>
    </footer>
  );
}
