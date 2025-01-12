import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Navigator } from '../ui/navigator';
import Lottie, { ILottie } from '@lottielab/lottie-player/react';
import { useRef, useEffect, Suspense } from 'react';

export function Header() {
  const router = useRouter();
  const lottieRef = useRef<ILottie>(null);

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
    <header className="flex select-none items-center justify-between gap-4 border-b border-gray-300 px-4 dark:border-gray-500">
      <motion.div
        initial={{ rotate: -180, scale: 0 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
        whileHover={{ scale: 1.1, rotate: 2 }}
        className="flex h-20 w-36 cursor-pointer items-center justify-center gap-2 whitespace-nowrap text-2xl font-bold"
        onClick={() => router.push('/')}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative h-16 overflow-hidden">
          <img className="absolute left-2.5 top-0 h-16.5" src="/img/logo.webp" alt="logo" />
          <Lottie ref={lottieRef} src="https://cdn.lottielab.com/l/APXV8RHbvRVEoH.json" className="-mt-1.5 h-21" />
        </div>
      </motion.div>
      <Navigator className="flex-grow" />
    </header>
  );
}
