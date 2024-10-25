import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Navigator } from '../ui/navigator';

export function Header() {
  const router = useRouter();

  return (
    <header className="flex select-none items-center justify-between gap-4 border-b border-gray-500 px-4 py-3">
      <motion.div
        initial={{ rotate: -180, scale: 0 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
        whileHover={{ scale: 1.1 }}
        className="flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap text-2xl font-bold"
        onClick={() => router.push('/')}
      >
        <img src="/img/logo.png" alt="logo" className="h-10" />
        <p className="font-averia text-4xl">
          <span className="text-[#49a1f5]">S</span>
          <span className="text-[#fec61d]">o</span>
          <span className="text-[#ec4f41]">m</span>
          <span className="text-[#61d180]">e</span>
          <span className="text-[#ec4f41]">A</span>
          <span className="text-[#fec61d]">C</span>
          <span className="text-[#49a1f5]">G</span>
        </p>
      </motion.div>
      <Navigator className="h-full flex-grow" />
    </header>
  );
}
