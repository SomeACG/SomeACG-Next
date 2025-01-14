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
        'sticky top-0 z-10 flex select-none items-center justify-between gap-4 border-b border-gray-300 bg-background px-4 dark:border-gray-500',
      )}
      initial={{ y: 0 }}
      animate={{ y: visible ? 0 : -100 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ rotate: -180, scale: 0 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
        whileHover={{ scale: 1.1, rotate: 2 }}
        className="flex h-16 w-36 cursor-pointer items-center justify-center gap-2 whitespace-nowrap text-2xl font-bold"
        onClick={() => router.push('/')}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative h-full overflow-hidden">
          <img className="absolute left-2.5 top-0 h-16.5" src="/img/logo.webp" alt="logo" />
          <Lottie ref={lottieRef} src="https://cdn.lottielab.com/l/APXV8RHbvRVEoH.json" className="-mt-1.5 h-21" />
        </div>
      </motion.div>
      <Navigator className="flex-grow" />
    </motion.header>
  );
}
