import { Button } from '@/components/ui/button';
import { microDampingPreset } from '@/constants/anim/spring';
import { Platform } from '@/lib/type';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { FaSquareXTwitter } from 'react-icons/fa6';
import { SiPixiv } from 'react-icons/si';

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
      className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 pb-4 text-white backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="line-clamp-2 flex-1 text-sm/5 font-semibold">{title}</h2>
        <motion.a
          target="_blank"
          className="flex-center h-8 w-8 rounded-full bg-primary/90 p-2 text-white hover:bg-primary"
          href={artworkUrl}
          whileHover={{ scale: 1.1 }}
        >
          <FaExternalLinkAlt className="h-3 w-3" />
        </motion.a>
      </div>

      <div className="flex items-center justify-between gap-2">
        <a
          target="_blank"
          className="flex-center group/author flex-1 cursor-pointer gap-2 rounded-full border border-primary bg-primary/50 px-3 py-1.5 hover:bg-primary/80"
          href={authorUrl}
        >
          {platform === Platform.Pixiv && <SiPixiv className="h-3.5 w-3.5 opacity-70 group-hover/author:opacity-100" />}
          {platform === Platform.Twitter && (
            <FaSquareXTwitter className="h-3.5 w-3.5 opacity-70 group-hover/author:opacity-100" />
          )}
          <span className="truncate text-xs text-white/90 group-hover/author:text-white">{author}</span>
        </a>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 rounded-full border border-primary bg-primary/50 px-3 text-xs text-white/90 hover:bg-primary/80 hover:text-white"
          onClick={() => router.push(`/artwork/${id}`)}
        >
          <FaExternalLinkAlt className="mr-1.5 h-3 w-3" /> 详细信息
        </Button>
      </div>
    </motion.div>
  );
}
