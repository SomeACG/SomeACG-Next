'use client';

import { cn } from '@/lib/utils';
import type { Variants } from 'motion/react';
import { motion, useAnimation } from 'motion/react';
import { forwardRef, useEffect } from 'react';

const lineVariants: Variants = {
  closed: {
    rotate: 0,
    y: 0,
    opacity: 1,
  },
  opened: (custom: number) => ({
    rotate: custom === 1 ? 45 : custom === 3 ? -45 : 0,
    y: custom === 1 ? 6 : custom === 3 ? -6 : 0,
    opacity: custom === 2 ? 0 : 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  }),
};

interface MenuIconProps {
  className?: string;
  id?: string;
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
}

const MenuIcon = forwardRef<HTMLDivElement, MenuIconProps>(({ className, id, isOpen, onToggle }, ref) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start(isOpen ? 'opened' : 'closed');
  }, [isOpen, controls]);

  const toggle = () => {
    onToggle(!isOpen);
  };

  return (
    <div
      ref={ref}
      className={cn(
        'hover:bg-foreground/10 text-primary flex-center cursor-pointer rounded-md transition-colors duration-200 select-none dark:text-white',
        className,
      )}
      id={id}
      onClick={toggle}
      role="button"
      aria-label={isOpen ? '关闭菜单' : '打开菜单'}
      aria-expanded={isOpen}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.line x1="4" y1="6" x2="20" y2="6" variants={lineVariants} animate={controls} custom={1} />
        <motion.line x1="4" y1="12" x2="20" y2="12" variants={lineVariants} animate={controls} custom={2} />
        <motion.line x1="4" y1="18" x2="20" y2="18" variants={lineVariants} animate={controls} custom={3} />
      </svg>
    </div>
  );
});

export { MenuIcon };
