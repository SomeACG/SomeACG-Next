import { Button } from '@/components/ui/button';
import { microDampingPreset } from '@/constants/anim/spring';
import { Platform } from '@/lib/type';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { FaLink, FaSquareXTwitter } from 'react-icons/fa6';
import { SiPixiv } from 'react-icons/si';
import { TiInfoLarge } from 'react-icons/ti';

interface ImageHoverCardProps {
  id: string | number;
  title?: string;
  author?: string;
  platform?: Platform;
  artworkUrl: string;
  authorUrl: string;
}

export function ImageHoverCard({ id, title = '', author = '', platform, artworkUrl, authorUrl }: ImageHoverCardProps) {
  const router = useRouter();

  return (
    <motion.div
      key={'item-desc-' + id}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      transition={{ ...microDampingPreset, duration: 0.2 }}
      className="absolute inset-x-0 bottom-0 z-10 flex cursor-pointer flex-col gap-2 bg-linear-to-t from-black/90 via-black/70 to-transparent p-3 pb-4 text-white backdrop-blur-xs"
      onClick={() => router.push(`/artwork/${id}`)}
    >
      <h2 className="truncate text-sm/5 font-semibold">{title}</h2>
      <div className="flex items-center justify-between gap-2">
        <a
          target="_blank"
          className="flex-center group/author cursor-pointer gap-2 rounded-full border border-primary bg-primary/50 px-3 py-1.5 hover:bg-primary/80"
          href={authorUrl}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {platform === Platform.Pixiv && <SiPixiv className="h-3.5 w-3.5 opacity-70 group-hover/author:opacity-100" />}
          {platform === Platform.Twitter && (
            <FaSquareXTwitter className="h-3.5 w-3.5 opacity-70 group-hover/author:opacity-100" />
          )}
          <span className="inline-block max-w-20 truncate text-xs text-white/90 group-hover/author:text-white">{author}</span>
        </a>
        <Button
          variant="ghost"
          size="xs"
          className="flex-center ml-auto size-6 rounded-full border border-primary bg-primary/50 p-0 px-0 text-white bg-blend-lighten hover:bg-primary/80 hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/artwork/${id}`);
          }}
        >
          <TiInfoLarge className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="xs"
          className="flex-center size-6 rounded-full border border-primary bg-primary/50 p-0 px-0 text-white hover:bg-primary/80 hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            window.open(artworkUrl, '_blank');
          }}
        >
          <FaLink className="size-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}
