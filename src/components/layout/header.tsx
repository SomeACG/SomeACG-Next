import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Navigator } from '../ui/navigator';
import Lottie, { ILottie } from '@lottielab/lottie-player/react';
import { useRef, useEffect, Suspense, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useAtom } from 'jotai';
import { viewModeAtom } from '@/store/app';
import { ViewIcon, ColumnsIcon } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const lottieRef = useRef<ILottie>(null);
  const [viewMode, setViewMode] = useAtom(viewModeAtom);

  const { scrollYProgress } = useScroll();

  const [visible, setVisible] = useState(true);

  useMotionValueEvent(scrollYProgress, 'change', (current) => {
    // Check if current is not undefined and is a number
    if (typeof current === 'number') {
      let direction = current! - scrollYProgress.getPrevious()!;

      if (scrollYProgress.get() < 0.05) {
        setVisible(true);
      } else {
        if (direction < 0) {
          // 往上滚
          setVisible(true);
        } else {
          // 往下滚
          setVisible(false);
        }
      }
    }
  });

  useEffect(() => {
    // 初始时暂停动画
    if (lottieRef.current) {
      lottieRef.current.pause();
    }
  }, []);

  const handleMouseEnter = () => {
    if (lottieRef.current) {
      lottieRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (lottieRef.current) {
      lottieRef.current.pause();
    }
  };

  return (
    <motion.header
      className={cn(
        'sticky top-0 z-10 flex items-center justify-between select-none',
        'bg-background/80 border-b border-gray-200/50 backdrop-blur-md',
        'px-6 py-1 md:pr-3 md:pl-0 dark:border-gray-700/50',
        'transition-all duration-300 ease-in-out',
        'shadow-xs hover:shadow-md',
      )}
      initial={{ y: 0 }}
      animate={{ y: visible ? 0 : -100 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.div
        initial={{ rotate: -180, scale: 0 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
        whileHover={{ scale: 1.05, rotate: 1 }}
        className="flex h-14 w-36 cursor-pointer items-center justify-center gap-2 text-2xl font-bold whitespace-nowrap"
        onClick={() => router.push('/')}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative h-full overflow-hidden">
          <Lottie ref={lottieRef} src="https://cdn.lottielab.com/l/APXV8RHbvRVEoH.json" className="-mt-1.5 h-20" />
        </div>
      </motion.div>
      <Navigator className="grow" />
    </motion.header>
  );
}
