'use client';
import { cn } from '@/lib/utils';
import type { ILottie } from '@lottielab/lottie-player/react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, Variants } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import DynamicLottie from '../ui/DynamicLottie';
import { Navigator } from '../ui/navigator';

// 定义动画常量
const HEADER_VARIANTS: Variants = {
  hide: { y: -100 },
  visible: { y: 0 },
};

const LOGO_VARIANTS: Variants = {
  hide: { rotate: -180, scale: 0 },
  visible: { rotate: 0, scale: 1 },
  hover: { scale: 1.05, rotate: 2 },
};

export function Header() {
  const router = useRouter();
  const lottieRef = useRef<ILottie>(null);

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

  const onHoverStart = useCallback(() => {
    if (lottieRef.current) {
      lottieRef.current.play();
    }
  }, []);

  const onHoverEnd = useCallback(() => {
    if (lottieRef.current) {
      lottieRef.current.pause();
    }
  }, []);

  return (
    <AnimatePresence mode="sync">
      <motion.header
        className={cn(
          'sticky top-0 z-10 flex items-center justify-between select-none md:justify-center',
          'bg-background/85 border-b border-gray-200/50 backdrop-blur-xl',
          'py-1 pr-6 pl-3 md:pr-3 md:pl-0 dark:border-gray-700/50',
          'transition-all duration-500 ease-in-out',
          'shadow-sm hover:shadow-lg',
        )}
        initial="visible"
        animate={visible ? 'visible' : 'hide'}
        variants={HEADER_VARIANTS}
      >
        <motion.div
          initial="hide"
          animate="visible"
          whileHover="hover"
          variants={LOGO_VARIANTS}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
          className="flex h-14 w-36 cursor-pointer items-center justify-center gap-2 text-2xl font-bold whitespace-nowrap"
          onClick={() => router.push('/')}
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
        >
          <div className="relative h-full overflow-hidden">
            <DynamicLottie ref={lottieRef} src="https://r2.cosine.ren/og/cos-gallery-lottie.json" className="-mt-1.5 h-20" />
          </div>
        </motion.div>
        <Navigator className="grow" />
      </motion.header>
    </AnimatePresence>
  );
}
