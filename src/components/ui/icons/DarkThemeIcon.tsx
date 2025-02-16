'use client';

import { motion } from 'motion/react';
import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';

const DarkThemeIcon = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => {
  return (
    <motion.div
      ref={ref}
      className="hover:bg-accent flex cursor-pointer items-center justify-center rounded-md p-2 transition-colors duration-200 select-none"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        rotate: [0, 10, 0],
        transition: {
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
      {...props}
    >
      <svg className="size-full" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <defs>
          <mask id="lineMdLightDarkLoop0">
            <circle cx="7.5" cy="7.5" r="5.5" fill="#fff" />
            <circle cx="7.5" cy="7.5" r="5.5">
              <animate fill="freeze" attributeName="cx" dur="0.4s" values="7.5;11" />
              <animate fill="freeze" attributeName="r" dur="0.4s" values="5.5;6.5" />
            </circle>
          </mask>
          <mask id="lineMdLightDarkLoop1">
            <g fill="#fff">
              <circle cx="12" cy="9" r="5.5">
                <animate fill="freeze" attributeName="cy" begin="1s" dur="0.5s" values="9;15" />
              </circle>
              <g fillOpacity="0">
                <use href="#lineMdLightDarkLoop2" transform="rotate(-75 12 15)" />
                <use href="#lineMdLightDarkLoop2" transform="rotate(-25 12 15)" />
                <use href="#lineMdLightDarkLoop2" transform="rotate(25 12 15)" />
                <use href="#lineMdLightDarkLoop2" transform="rotate(75 12 15)" />
                <animate attributeName="fill-opacity" begin="1.5s" dur="0.01s" fill="freeze" to="1" />
                <animateTransform
                  attributeName="transform"
                  dur="5s"
                  repeatCount="indefinite"
                  type="rotate"
                  values="0 12 15;50 12 15"
                />
              </g>
            </g>
            <path d="M0 10h26v5h-26z" />
            <path stroke="#fff" strokeDasharray="26" strokeDashoffset="26" strokeWidth="2" d="M22 12h-22">
              <animate attributeName="d" dur="6s" repeatCount="indefinite" values="M22 12h-22;M24 12h-22;M22 12h-22" />
              <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.5s" dur="0.4s" values="26;0" />
            </path>
          </mask>
          <symbol id="lineMdLightDarkLoop2">
            <path d="M11 18h2L12 20z" opacity="0">
              <animate fill="freeze" attributeName="d" begin="1.5s" dur="0.4s" values="M11 18h2L12 20z;M10.5 21.5h3L12 24z" />
              <animate attributeName="opacity" begin="1.5s" dur="0.01s" fill="freeze" to="1" />
            </path>
          </symbol>
        </defs>
        <g fill="currentColor">
          <rect width="13" height="13" x="1" y="1" mask="url(#lineMdLightDarkLoop0)" />
          <path d="M-2 11h28v13h-28z" mask="url(#lineMdLightDarkLoop1)" transform="rotate(-45 12 12)" />
        </g>
      </svg>
    </motion.div>
  );
});

DarkThemeIcon.displayName = 'DarkThemeIcon';

export { DarkThemeIcon };
