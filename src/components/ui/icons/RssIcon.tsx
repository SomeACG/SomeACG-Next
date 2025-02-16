'use client';

import type { Variants } from 'motion/react';
import { motion, useAnimation } from 'motion/react';
import type { HTMLAttributes } from 'react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

export interface RssIconHandle {
  startAnimation: (e: React.MouseEvent<HTMLDivElement>) => Promise<void>;
  stopAnimation: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const circleVariants: Variants = {
  normal: {
    r: 2,
  },
  hide: {
    r: 0,
  },
  draw: {
    r: [0, 2],
    transition: {
      duration: 0.2,
    },
  },
};

const wave1Variants: Variants = {
  normal: {
    strokeDashoffset: 0,
  },
  hide: {
    strokeDashoffset: 16,
  },
  draw: {
    strokeDashoffset: [16, 0],
    transition: {
      duration: 0.3,
      delay: 0.2,
    },
  },
};

const wave2Variants: Variants = {
  normal: {
    strokeDashoffset: 0,
  },
  hide: {
    strokeDashoffset: 28,
  },
  draw: {
    strokeDashoffset: [28, 0],
    transition: {
      duration: 0.4,
      delay: 0.6,
    },
  },
};

const RssIcon = forwardRef<RssIconHandle, HTMLAttributes<HTMLDivElement>>(({ onMouseEnter, onMouseLeave, ...props }, ref) => {
  const circleControls = useAnimation();
  const wave1Controls = useAnimation();
  const wave2Controls = useAnimation();
  const isControlledRef = useRef(false);

  const handleMouseEnter = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isControlledRef.current) {
        circleControls.start('draw');
        wave1Controls.set('hide');
        wave2Controls.set('hide');
        await wave1Controls.start('draw');
        await wave2Controls.start('draw');
      } else {
        onMouseEnter?.(e);
      }
    },
    [circleControls, wave1Controls, wave2Controls, onMouseEnter],
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isControlledRef.current) {
        circleControls.start('normal');
        wave1Controls.start('normal');
        wave2Controls.start('normal');
      } else {
        onMouseLeave?.(e);
      }
    },
    [circleControls, wave1Controls, wave2Controls, onMouseLeave],
  );

  useImperativeHandle(ref, () => {
    isControlledRef.current = true;

    return {
      startAnimation: handleMouseEnter,
      stopAnimation: handleMouseLeave,
    };
  });

  return (
    <div
      className="hover:bg-accent flex cursor-pointer items-center justify-center rounded-md p-2 transition-colors duration-200 select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <svg className="size-full" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <motion.circle
          variants={circleVariants}
          initial="normal"
          animate={circleControls}
          cx="5"
          cy="19"
          r="2"
          fill="currentColor"
        />
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
          <motion.path
            variants={wave1Variants}
            initial="normal"
            animate={wave1Controls}
            strokeDasharray="16"
            d="M4 11c2.39 0 4.68 0.95 6.36 2.64c1.69 1.68 2.64 3.97 2.64 6.36"
          />
          <motion.path
            variants={wave2Variants}
            initial="normal"
            animate={wave2Controls}
            strokeDasharray="28"
            d="M4 4c4.24 0 8.31 1.69 11.31 4.69c3 3 4.69 7.07 4.69 11.31"
          />
        </g>
      </svg>
    </div>
  );
});

RssIcon.displayName = 'RssIcon';

export { RssIcon };
