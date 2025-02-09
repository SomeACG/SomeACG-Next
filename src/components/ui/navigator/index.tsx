'use client';

import { MD_SCREEN_QUERY } from '@/constants';
import { useNavItems } from '@/hooks/router';
import { useIsMounted } from '@/hooks/useIsMounted';
import { childDelayOpenAnimVariants } from '@/lib/anim';
import { cn } from '@/lib/utils';
import { oneLevelMenuExpandAtom, oneLevelTabSelectIdxAtom } from '@/store/app';
import { FloatingPortal } from '@floating-ui/react';
import { ClassValue } from 'clsx';
import { useAtom } from 'jotai';
import { motion } from 'motion/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useMediaQuery } from 'react-responsive';
import Sider from '../../layout/sider';
import MenuIcon from '../MenuIcon';
import NavItem from './NavItem';

type NavigatorProps = {
  className?: ClassValue;
};

export const Navigator = ({ className }: NavigatorProps) => {
  const router = useRouter();
  const [selectIdx, setSelectIdx] = useAtom(oneLevelTabSelectIdxAtom);
  const [mobileExpand, setMobileExpand] = useAtom(oneLevelMenuExpandAtom);
  const isMdScreen = useMediaQuery({ query: MD_SCREEN_QUERY });
  const isMounted = useIsMounted();
  const { routers, buttons } = useNavItems();
  const path = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  /** Set SelectIdx When Change Route */
  useEffect(() => {
    for (let i = 0; i < routers.length; i++) {
      if (routers[i].path === path) {
        setSelectIdx(i);
        break;
      }
    }
  }, [path, routers, setSelectIdx]);

  if (!isMounted) return null;
  return isMdScreen ? (
    <FloatingPortal>
      <MenuIcon
        className="fixed top-5 left-4 z-21 hidden md:block"
        ref={menuRef}
        isOpen={mobileExpand}
        onToggle={setMobileExpand}
      />
      <Sider bottomItems={buttons} menuTriggerRef={menuRef} />
    </FloatingPortal>
  ) : (
    <div className={cn('flex items-center', className)}>
      <motion.div
        initial="closed"
        animate="open"
        variants={childDelayOpenAnimVariants}
        className="ml-4 flex h-full w-full grow gap-4"
      >
        {routers.map(({ name, path, key }, idx) => {
          return (
            <NavItem
              selected={selectIdx === idx}
              indicatorClass="bottom-0.5"
              className="px-2"
              key={key ?? name}
              onClick={() => {
                router.push(path);
                setSelectIdx(idx);
              }}
              name={name}
            />
          );
        })}
        <div className="ml-auto flex items-center gap-1">
          {buttons.map(({ key, icon, onClick }, idx) => (
            <NavItem
              selected={selectIdx === routers.length + idx + 1}
              className="px-1 py-1"
              key={key}
              onClick={onClick}
              icon={icon}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};
