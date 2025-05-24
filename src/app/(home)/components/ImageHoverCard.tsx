import { Button } from '@/components/ui/button';
import { microDampingPreset } from '@/constants/anim/spring';
import { Platform } from '@/lib/type';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  authorid?: string | number;
}

export function ImageHoverCard({
  id,
  title = '',
  author = '',
  platform,
  artworkUrl,
  authorUrl,
  authorid,
}: ImageHoverCardProps) {
  const router = useRouter();
  const internalArtistUrl = `/artist/${platform}/${authorid}`;

  return (
    <motion.div
      key={'item-desc-' + id}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      transition={{ ...microDampingPreset, duration: 0.2 }}
      className="absolute inset-x-0 bottom-0 z-10 flex cursor-pointer flex-col gap-1.5 bg-linear-to-t from-black/70 via-black/20 to-transparent p-2 text-white backdrop-blur-xs"
      onClick={() => router.push(`/artwork/${id}`)}
    >
      <h2 className="truncate text-sm/4 font-semibold">{title}</h2>
      <div className="flex items-center justify-between gap-1.5 overflow-hidden">
        <Link
          href={internalArtistUrl}
          className="flex-center group/author border-primary bg-primary/50 hover:bg-primary/80 cursor-pointer gap-1.5 rounded-full border px-2 py-1 opacity-90 transition duration-300 hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {platform === Platform.Pixiv && <SiPixiv className="size-3.5" />}
          {platform === Platform.Twitter && <FaSquareXTwitter className="size-3.5" />}
          <span className="inline-block max-w-20 truncate text-xs text-white">{author}</span>
        </Link>
        <Button
          variant="ghost"
          size="xs"
          className="flex-center border-primary bg-primary/50 hover:bg-primary/80 cursor-pointer gap-0.5 rounded-full border p-0 px-1.5 text-xs text-white hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            window.open(artworkUrl, '_blank');
          }}
        >
          <FaLink className="size-3.5" />
          原图
        </Button>
      </div>
    </motion.div>
  );
}
