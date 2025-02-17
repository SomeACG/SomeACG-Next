import { cn } from '@/lib/utils';
import Lottie, { ILottie } from '@lottielab/lottie-player/react';
import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Navigator } from '../ui/navigator';

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
    <>
      <motion.header
        className={cn(
          'sticky top-0 z-10 flex items-center justify-between select-none md:justify-center',
          'bg-background/85 border-b border-gray-200/50 backdrop-blur-xl',
          'py-1 pr-6 pl-3 md:pr-3 md:pl-0 dark:border-gray-700/50',
          'transition-all duration-500 ease-in-out',
          'shadow-sm hover:shadow-lg',
        )}
        initial={{ y: -100, opacity: 0 }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
          opacity: { duration: 0.3 },
        }}
      >
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
          whileHover={{
            scale: 1.05,
            rotate: 2,
            transition: {
              type: 'spring',
              stiffness: 400,
              damping: 10,
            },
          }}
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
    </>
  );
}
