'use client';

import { useNavItems } from '@/hooks/router';
import { useIsMounted } from '@/hooks/useIsMounted';
import { oneLevelMenuExpandAtom, oneLevelTabSelectIdxAtom } from '@/store/app';
import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import Drawer from './drawer';
import NavItem, { NavItemProps } from './navigator/NavItem';

type SiderProps = {
  bottomItems: (NavItemProps & { key?: string })[];
  type?: 'drawer' | 'inner'; // 在抽屉 还是在文章右侧
};
const Sider = ({ bottomItems }: SiderProps) => {
  const router = useRouter();
  const isMounted = useIsMounted();
  const [selectIdx1, setSelectIdx1] = useAtom(oneLevelTabSelectIdxAtom);
  const [mobileExpand, setMobileExpand] = useAtom(oneLevelMenuExpandAtom);
  const { routers } = useNavItems();

  const renderContent = useCallback(() => {
    return (
      <div className="flex h-full max-w-xs flex-col justify-between gap-2 p-2">
        <div className="flex-center-y gap-1">
          <div className="w-full">
            {routers.map(({ name, path, key }, idx) => {
              return (
                <NavItem
                  type="sider"
                  key={key ?? name}
                  selected={selectIdx1 === idx}
                  className="w-full px-1 py-2"
                  onClick={() => {
                    router.push(path);
                    setSelectIdx1(idx);
                  }}
                  name={name}
                  indicatorClass="inset-x-4"
                />
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-2">
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
    );
  }, [bottomItems, router, routers, selectIdx1, setSelectIdx1]);
  if (!isMounted) return null;
  return <Drawer open={mobileExpand} onOpenChange={(open) => setMobileExpand(open)} render={renderContent} />;
};

export default Sider;
