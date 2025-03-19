import { DarkThemeIcon } from '@/components/ui/icons/DarkThemeIcon';
import { GithubIcon } from '@/components/ui/icons/GithubIcon';
import { RssIcon } from '@/components/ui/icons/RssIcon';
import { routers } from '@/constants/router';
import { viewModeAtom } from '@/store/app';
import { useAtom } from 'jotai';
import { ColumnsIcon, ViewIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useToggleTheme } from './useToggleTheme';

export const useNavItems = () => {
  const [viewMode, setViewMode] = useAtom(viewModeAtom);

  const toggleTheme = useToggleTheme();
  const buttons = useMemo(
    () => [
      {
        key: 'ToggleViewMode',
        icon:
          viewMode === 'pagination' ? (
            <div className="flex items-center gap-1 md:flex-col">
              <ViewIcon className="size-5" />
              <span className="text-sm">当前为分页模式</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 md:flex-col">
              <ColumnsIcon className="size-5" />
              <span className="text-sm">当前为无限模式</span>
            </div>
          ),
        onClick: () => setViewMode(viewMode === 'pagination' ? 'infinite' : 'pagination'),
      },
      {
        key: 'RSS',
        icon: <RssIcon className="size-6 cursor-pointer" />,
        onClick: () => window?.open('/rss.xml', '_blank'),
      },
      {
        key: 'Github',
        icon: <GithubIcon className="size-8 cursor-pointer" />,
        onClick: () => window?.open('https://github.com/SomeACG/SomeACG-Next', '_blank'),
      },
      {
        key: 'CgDarkMode',
        icon: <DarkThemeIcon className="size-8 cursor-pointer" />,
        onClick: toggleTheme,
      },
    ],
    [setViewMode, toggleTheme, viewMode],
  );
  return { routers, buttons };
};
