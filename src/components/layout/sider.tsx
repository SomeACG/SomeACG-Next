'use client';

import { useIsMounted } from '@/hooks/useIsMounted';
import { oneLevelMenuExpandAtom, oneLevelTabSelectIdxAtom } from '@/store/app';
import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import Drawer from '../ui/drawer';
import NavItem, { NavItemProps } from '../ui/navigator/NavItem';
import { routers } from '@/constants/router';
import { motion } from 'motion/react';
import { SearchBox } from '../search/SearchBox';

type SiderProps = {
  bottomItems: (NavItemProps & { key?: string })[];
  menuTriggerRef?: React.RefObject<HTMLElement>;
};
const Sider = ({ bottomItems, menuTriggerRef }: SiderProps) => {
  const router = useRouter();
  const isMounted = useIsMounted();
  const [selectIdx1, setSelectIdx1] = useAtom(oneLevelTabSelectIdxAtom);
  const [mobileExpand, setMobileExpand] = useAtom(oneLevelMenuExpandAtom);

  if (!isMounted) return null;
  return (
    <Drawer
      open={mobileExpand}
      onOpenChange={(open) => setMobileExpand(open)}
      triggerRef={menuTriggerRef}
      render={() => (
        <div className="flex h-full min-w-[7rem] flex-col justify-between gap-2 p-2 pt-15">
          <div className="flex flex-col gap-1">
            {routers.map(({ name, path, key }, idx) => (
              <NavItem
                key={key ?? name}
                selected={selectIdx1 === idx}
                className="w-full px-1 py-2"
                onClick={() => {
                  router.push(path);
                  setSelectIdx1(idx);
                  // setMobileExpand(false);
                }}
                name={name}
                indicatorClass="inset-x-4"
              />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <SearchBox placeholder="搜索图片、标签、画师..." showSuggestions={true} compact={true} className="max-w-md" />
            </motion.div>
            {bottomItems.map(({ key, icon, onClick }, idx) => (
              <NavItem
                key={key}
                selected={selectIdx1 === routers.length + idx + 1}
                className="w-full px-1 py-1"
                onClick={onClick}
                icon={icon}
              />
            ))}
          </div>
        </div>
      )}
    />
  );
};

export default Sider;
