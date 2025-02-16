import { microReboundPreset } from '@/constants/anim/spring';
import { Variants } from 'motion/react';

export const childDelayOpenAnimVariants: Variants = {
  open: {
    clipPath: 'inset(0% 0% 0% 0% round 10px)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
      mass: 0.8,
      delayChildren: 0.1,
      staggerChildren: 0.05,
    },
  },
  closed: {
    clipPath: 'inset(10% 50% 90% 50% round 10px)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
      mass: 0.8,
    },
  },
};

export const delayOpenAnimVariants: Variants = {
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
      mass: 1,
    },
  },
  closed: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
      mass: 1,
    },
  },
};

export type AnimType = 'scale';
export const clickableProps = (type: AnimType = 'scale', props?: { scale?: number }) => {
  switch (type) {
    case 'scale':
    default: {
      const { scale } = props ?? {};
      return {
        transition: { type: 'spring', stiffness: 80 },
        whileTap: { scale: scale ?? 1.05 },
        whileHover: { scale: scale ?? 1.05 },
      };
    }
  }
};
